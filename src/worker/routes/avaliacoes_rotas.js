/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - ROTAS DE AVALIAÇÕES E QUESTIONÁRIOS (ASSESSMENTS)
 * ============================================================================
 * Gerencia questionários avaliativos de múltipla escolha:
 * - Listar avaliações de um módulo (/api/avaliacoes/modulo/:moduloId)
 * - Obter questionário (/api/avaliacoes/:id) - alunos não veem qual é a correta
 * - Criar avaliação com questões e alternativas (/api/avaliacoes/modulo/:moduloId)
 * - Responder avaliação com cálculo automático de nota (/api/avaliacoes/:id/responder)
 * - Excluir avaliação (/api/avaliacoes/:id)
 * ============================================================================
 */

import {
  jsonResponse,
  jsonErro,
  readJsonBody,
  queryAll,
  queryOne,
  authorizeUser,
  exigirPerfil,
} from '../helpers_utilitarios.js';

/**
 * Retorna as avaliações associadas a um módulo.
 */
export async function listarAvaliacoesDoModulo(request, env, db, moduloId) {
  await authorizeUser(request, env, db);
  const id = Number(moduloId);
  const avaliacoes = await queryAll(
    db,
    'SELECT * FROM avaliacoes WHERE modulo_id = ?',
    [id],
  );
  return jsonResponse(avaliacoes);
}

/**
 * Retorna o questionário completo.
 * Alunos recebem as alternativas sem a indicação de qual é a correta.
 */
export async function obterAvaliacao(request, env, db, avaliacaoId) {
  const { payload } = await authorizeUser(request, env, db);
  const id = Number(avaliacaoId);

  const avaliacao = await queryOne(db, 'SELECT * FROM avaliacoes WHERE id = ?', [id]);
  if (!avaliacao) {
    return jsonErro('Avaliação não encontrada.', 404);
  }

  const questoes = await queryAll(
    db,
    'SELECT id, enunciado, tipo, pontos, ordem FROM questoes WHERE avaliacao_id = ? ORDER BY ordem ASC, id ASC',
    [id],
  );

  for (const questao of questoes) {
    questao.alternativas = await queryAll(
      db,
      payload.perfil === 'aluno'
        ? 'SELECT id, texto FROM alternativas WHERE questao_id = ?'
        : 'SELECT id, texto, correta FROM alternativas WHERE questao_id = ?',
      [questao.id],
    );
  }

  avaliacao.questoes = questoes;
  return jsonResponse(avaliacao);
}

/**
 * Cria uma nova avaliação com suas questões e alternativas.
 */
export async function criarAvaliacao(request, env, db, moduloId) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador', 'instrutor']);

  const id = Number(moduloId);
  const body = await readJsonBody(request);
  const titulo = String(body.titulo || '').trim();

  if (!titulo) {
    return jsonErro('Título da avaliação é obrigatório.', 400);
  }

  const assessment = await db.prepare(`
    INSERT INTO avaliacoes (modulo_id, titulo, descricao, nota_minima, tentativas_permitidas)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    id,
    titulo,
    body.descricao || null,
    Number(body.nota_minima || 6),
    Number(body.tentativas_permitidas || 3),
  ).run();

  const avaliacaoId = assessment.meta.last_row_id;
  const questoes = Array.isArray(body.questoes) ? body.questoes : [];
  const insertsAlternativas = [];

  for (const [indice, questao] of questoes.entries()) {
    const resultadoQuestao = await db.prepare(`
      INSERT INTO questoes (avaliacao_id, enunciado, tipo, pontos, ordem)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      avaliacaoId,
      questao.enunciado,
      questao.tipo || 'multipla_escolha',
      Number(questao.pontos || 1),
      indice,
    ).run();

    const questaoId = resultadoQuestao.meta.last_row_id;
    const alternativas = Array.isArray(questao.alternativas) ? questao.alternativas : [];

    for (const alt of alternativas) {
      insertsAlternativas.push(
        db.prepare(`
          INSERT INTO alternativas (questao_id, texto, correta)
          VALUES (?, ?, ?)
        `).bind(questaoId, alt.texto, alt.correta ? 1 : 0),
      );
    }
  }

  if (insertsAlternativas.length > 0) {
    await db.batch(insertsAlternativas);
  }

  return jsonResponse({ id: avaliacaoId, titulo }, 201);
}

/**
 * Recebe as respostas enviadas pelo aluno, confere com o gabarito e calcula a nota imediatamente.
 */
export async function responderAvaliacao(request, env, db, avaliacaoId) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['aluno']);

  const id = Number(avaliacaoId);
  const body = await readJsonBody(request);

  // Localiza a avaliação e o curso correspondente
  const avaliacao = await queryOne(
    db,
    'SELECT av.*, m.curso_id FROM avaliacoes av JOIN modulos m ON m.id = av.modulo_id WHERE av.id = ?',
    [id],
  );
  if (!avaliacao) {
    return jsonErro('Avaliação não encontrada.', 404);
  }

  // Verifica a matrícula ativa do aluno
  const matricula = await queryOne(
    db,
    'SELECT id FROM matriculas WHERE usuario_id = ? AND curso_id = ? AND status != "cancelada"',
    [payload.id, avaliacao.curso_id],
  );
  if (!matricula) {
    return jsonErro('Você não está matriculado neste curso.', 403);
  }

  // Verifica limite de tentativas permitidas
  const tentativas = await queryOne(
    db,
    'SELECT COUNT(*) AS total FROM tentativas_avaliacao WHERE matricula_id = ? AND avaliacao_id = ?',
    [matricula.id, id],
  );
  if (Number(tentativas.total) >= Number(avaliacao.tentativas_permitidas)) {
    return jsonErro('Número máximo de tentativas atingido para esta avaliação.', 403);
  }

  // Busca as questões para calcular a pontuação
  const questoes = await queryAll(db, 'SELECT id, pontos FROM questoes WHERE avaliacao_id = ?', [id]);
  const respostas = Array.isArray(body.respostas) ? body.respostas : [];
  const totalPontos = questoes.reduce((soma, q) => soma + Number(q.pontos), 0) || 1;

  let pontosObtidos = 0;
  for (const resposta of respostas) {
    const questao = questoes.find((q) => q.id === Number(resposta.questaoId));
    if (!questao) continue;

    const alternativaCorreta = await queryOne(
      db,
      'SELECT id FROM alternativas WHERE questao_id = ? AND correta = 1',
      [questao.id],
    );

    if (alternativaCorreta && Number(alternativaCorreta.id) === Number(resposta.alternativaId)) {
      pontosObtidos += Number(questao.pontos);
    }
  }

  const notaCalculada = Math.round((pontosObtidos / totalPontos) * 1000) / 100;
  const aprovado = notaCalculada >= Number(avaliacao.nota_minima);

  await db.prepare(`
    INSERT INTO tentativas_avaliacao (matricula_id, avaliacao_id, nota, aprovado, respostas)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    matricula.id,
    id,
    notaCalculada,
    aprovado ? 1 : 0,
    JSON.stringify(respostas),
  ).run();

  return jsonResponse({
    nota: notaCalculada,
    aprovado,
    mensagem: aprovado ? 'Parabéns, você foi aprovado na avaliação!' : 'Você não atingiu a nota mínima. Tente novamente.',
  });
}

/**
 * Exclui uma avaliação e suas questões.
 */
export async function excluirAvaliacao(request, env, db, avaliacaoId) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador', 'instrutor']);

  const id = Number(avaliacaoId);
  await db.prepare('DELETE FROM avaliacoes WHERE id = ?').bind(id).run();
  return jsonResponse({ mensagem: 'Avaliação excluída com sucesso.' });
}

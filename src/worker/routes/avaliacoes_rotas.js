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
  ErroHttp,
  parseIdPositivo,
  recalcularConclusaoMatricula,
} from '../helpers_utilitarios.js';

const TIPOS_QUESTAO_VALIDOS = ['multipla_escolha', 'verdadeiro_falso', 'dissertativa'];

/**
 * Retorna as avaliações associadas a um módulo.
 */
export async function listarAvaliacoesDoModulo(request, env, db, moduloId) {
  await authorizeUser(request, env, db);
  const id = parseIdPositivo(moduloId, 'moduloId');
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
  const id = parseIdPositivo(avaliacaoId, 'avaliacaoId');

  const avaliacao = await queryOne(db, 'SELECT * FROM avaliacoes WHERE id = ?', [id]);
  if (!avaliacao) {
    return jsonErro('Avaliação não encontrada.', 404);
  }

  let cursoInfo = null;
  try {
    cursoInfo = await queryOne(
      db,
      'SELECT av.id, c.instrutor_id, c.status FROM avaliacoes av JOIN modulos m ON av.modulo_id = m.id JOIN cursos c ON m.curso_id = c.id WHERE av.id = ?',
      [id],
    );
  } catch {
    cursoInfo = null;
  }

  if (cursoInfo) {
    if (payload.perfil === 'aluno' && cursoInfo.status && cursoInfo.status !== 'publicado') {
      return jsonErro('Acesso negado. Este curso ainda não está publicado.', 403);
    }
    if (
      payload.perfil === 'instrutor'
      && cursoInfo.instrutor_id
      && cursoInfo.instrutor_id !== payload.id
      && cursoInfo.status === 'rascunho'
    ) {
      return jsonErro('Acesso negado a avaliação em rascunho de outro instrutor.', 403);
    }
  }

  const podeVerGabarito = payload.perfil === 'administrador'
    || (payload.perfil === 'instrutor' && (!cursoInfo || !cursoInfo.instrutor_id || cursoInfo.instrutor_id === payload.id));

  const questoes = await queryAll(
    db,
    'SELECT id, enunciado, tipo, pontos, ordem FROM questoes WHERE avaliacao_id = ? ORDER BY ordem ASC, id ASC',
    [id],
  );

  for (const questao of questoes) {
    questao.alternativas = await queryAll(
      db,
      podeVerGabarito
        ? 'SELECT id, texto, correta FROM alternativas WHERE questao_id = ?'
        : 'SELECT id, texto FROM alternativas WHERE questao_id = ?',
      [questao.id],
    );
  }

  avaliacao.questoes = questoes;
  return jsonResponse(avaliacao);
}

/**
 * Cria uma nova avaliação com suas questões e alternativas, validando propriedade do curso (IDOR).
 */
export async function criarAvaliacao(request, env, db, moduloId) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador', 'instrutor']);

  const id = parseIdPositivo(moduloId, 'moduloId');
  const modulo = await queryOne(
    db,
    'SELECT m.id, c.instrutor_id FROM modulos m JOIN cursos c ON m.curso_id = c.id WHERE m.id = ?',
    [id],
  );
  if (!modulo) {
    return jsonErro('Módulo não encontrado.', 404);
  }
  if (payload.perfil === 'instrutor' && modulo.instrutor_id !== payload.id) {
    throw new ErroHttp('Você não tem permissão para criar avaliações neste módulo.', 403);
  }

  const body = await readJsonBody(request);
  const titulo = String(body.titulo || '').trim();

  if (!titulo) {
    return jsonErro('Título da avaliação é obrigatório.', 400);
  }

  const questoes = Array.isArray(body.questoes) ? body.questoes : [];
  for (const questao of questoes) {
    const tipoQ = String(questao?.tipo || 'multipla_escolha');
    if (!TIPOS_QUESTAO_VALIDOS.includes(tipoQ)) {
      return jsonErro('Tipo de questão inválido. Use "multipla_escolha", "verdadeiro_falso" ou "dissertativa".', 400);
    }
    if (!String(questao?.enunciado || '').trim()) {
      return jsonErro('Todas as questões devem possuir enunciado.', 400);
    }
  }

  const notaMinima = Math.min(10, Math.max(0, Number.isFinite(Number(body.nota_minima)) ? Number(body.nota_minima) : 6));
  const tentativasPermitidas = Math.max(1, Number.parseInt(body.tentativas_permitidas, 10) || 3);

  const assessment = await db.prepare(`
    INSERT INTO avaliacoes (modulo_id, titulo, descricao, nota_minima, tentativas_permitidas)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    id,
    titulo,
    body.descricao || null,
    notaMinima,
    tentativasPermitidas,
  ).run();

  const avaliacaoId = assessment.meta.last_row_id;
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

  const id = parseIdPositivo(avaliacaoId, 'avaliacaoId');
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

  // Busca as questões para calcular a pontuação com deduplicação por questão (evita replay de questaoId)
  const questoes = await queryAll(db, 'SELECT id, pontos FROM questoes WHERE avaliacao_id = ?', [id]);
  const respostas = Array.isArray(body.respostas) ? body.respostas : [];
  const totalPontos = questoes.reduce((soma, q) => soma + Number(q.pontos), 0) || 1;
  const questoesProcessadas = new Set();

  let pontosObtidos = 0;
  for (const resposta of respostas) {
    const questaoIdNum = Number(resposta?.questaoId);
    if (!Number.isSafeInteger(questaoIdNum) || questoesProcessadas.has(questaoIdNum)) continue;
    const questao = questoes.find((q) => q.id === questaoIdNum);
    if (!questao) continue;
    questoesProcessadas.add(questaoIdNum);

    const alternativaCorreta = await queryOne(
      db,
      'SELECT id FROM alternativas WHERE questao_id = ? AND correta = 1',
      [questao.id],
    );

    if (alternativaCorreta && Number(alternativaCorreta.id) === Number(resposta?.alternativaId)) {
      pontosObtidos += Number(questao.pontos);
    }
  }

  const notaCalculada = Math.min(10, Math.round((pontosObtidos / totalPontos) * 1000) / 100);
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

  let statusCurso = null;
  if (aprovado) {
    const resumo = await recalcularConclusaoMatricula(db, matricula.id, avaliacao.curso_id);
    statusCurso = resumo.status;
  }

  return jsonResponse({
    nota: notaCalculada,
    aprovado,
    status_matricula: statusCurso,
    mensagem: aprovado ? 'Parabéns, você foi aprovado na avaliação!' : 'Você não atingiu a nota mínima. Tente novamente.',
  });
}

/**
 * Exclui uma avaliação e suas questões, validando propriedade do curso (IDOR).
 */
export async function excluirAvaliacao(request, env, db, avaliacaoId) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador', 'instrutor']);

  const id = parseIdPositivo(avaliacaoId, 'avaliacaoId');
  const avaliacao = await queryOne(
    db,
    'SELECT av.id, c.instrutor_id FROM avaliacoes av JOIN modulos m ON av.modulo_id = m.id JOIN cursos c ON m.curso_id = c.id WHERE av.id = ?',
    [id],
  );
  if (!avaliacao) {
    return jsonErro('Avaliação não encontrada.', 404);
  }
  if (payload.perfil === 'instrutor' && avaliacao.instrutor_id !== payload.id) {
    throw new ErroHttp('Você não tem permissão para excluir esta avaliação.', 403);
  }

  await db.prepare('DELETE FROM avaliacoes WHERE id = ?').bind(id).run();
  return jsonResponse({ mensagem: 'Avaliação excluída com sucesso.' });
}

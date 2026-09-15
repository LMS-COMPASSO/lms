/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - ROTAS DE AULAS E PROGRESSO DO ALUNO (LESSONS)
 * ============================================================================
 * Gerencia o conteúdo instrucional (aulas) e o acompanhamento pedagógico:
 * - Listar aulas de um módulo (/api/aulas/modulo/:moduloId)
 * - Obter conteúdo de uma aula específica (/api/aulas/:id)
 * - Criar nova aula (vídeo, texto, pdf ou link) (/api/aulas/modulo/:moduloId)
 * - Editar aula (/api/aulas/:id)
 * - Excluir aula (/api/aulas/:id)
 * - Registrar progresso do aluno (concluir/desmarcar aula) (/api/aulas/:id/progresso)
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
 * Retorna as aulas pertencentes a um módulo.
 */
export async function listarAulasDoModulo(request, env, db, moduloId) {
  await authorizeUser(request, env, db);
  const id = Number(moduloId);
  const aulas = await queryAll(
    db,
    'SELECT * FROM aulas WHERE modulo_id = ? ORDER BY ordem ASC, id ASC',
    [id],
  );
  return jsonResponse(aulas);
}

/**
 * Retorna os detalhes e conteúdo de uma aula individual.
 */
export async function obterAula(request, env, db, aulaId) {
  await authorizeUser(request, env, db);
  const id = Number(aulaId);
  const aula = await queryOne(db, 'SELECT * FROM aulas WHERE id = ?', [id]);
  if (!aula) {
    return jsonErro('Aula não encontrada.', 404);
  }
  return jsonResponse(aula);
}

/**
 * Cria uma nova aula dentro de um módulo.
 */
export async function criarAula(request, env, db, moduloId) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador', 'instrutor']);

  const id = Number(moduloId);
  const body = await readJsonBody(request);
  const titulo = String(body.titulo || '').trim();
  const tipo = String(body.tipo || 'texto');

  if (!titulo) {
    return jsonErro('Título da aula é obrigatório.', 400);
  }
  if (!['video', 'texto', 'pdf', 'link'].includes(tipo)) {
    return jsonErro('Tipo de aula inválido. Use "video", "texto", "pdf" ou "link".', 400);
  }

  const resultado = await db.prepare(`
    INSERT INTO aulas (modulo_id, titulo, tipo, conteudo, url_recurso, duracao_min, ordem)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    titulo,
    tipo,
    body.conteudo || null,
    body.url_recurso || null,
    Number(body.duracao_min || 0),
    Number(body.ordem || 0),
  ).run();

  return jsonResponse({
    id: resultado.meta.last_row_id,
    titulo,
  }, 201);
}

/**
 * Atualiza os dados de uma aula.
 */
export async function atualizarAula(request, env, db, aulaId) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador', 'instrutor']);

  const id = Number(aulaId);
  const body = await readJsonBody(request);
  const camposPermitidos = ['titulo', 'tipo', 'conteudo', 'url_recurso', 'duracao_min', 'ordem'];
  const campos = [];
  const params = [];

  for (const campo of camposPermitidos) {
    if (body[campo] !== undefined) {
      campos.push(`${campo} = ?`);
      params.push(campo === 'duracao_min' || campo === 'ordem' ? Number(body[campo]) : body[campo]);
    }
  }

  if (campos.length === 0) {
    return jsonErro('Nenhum campo para atualizar.', 400);
  }

  params.push(id);
  await db.prepare(`UPDATE aulas SET ${campos.join(', ')} WHERE id = ?`).bind(...params).run();
  return jsonResponse({ mensagem: 'Aula atualizada com sucesso.' });
}

/**
 * Exclui uma aula do sistema.
 */
export async function excluirAula(request, env, db, aulaId) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador', 'instrutor']);

  const id = Number(aulaId);
  await db.prepare('DELETE FROM aulas WHERE id = ?').bind(id).run();
  return jsonResponse({ mensagem: 'Aula excluída com sucesso.' });
}

/**
 * Registra a conclusão de uma aula pelo aluno e recalcula o percentual total da matrícula.
 */
export async function atualizarProgressoAula(request, env, db, aulaId) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['aluno']);

  const id = Number(aulaId);
  const body = await readJsonBody(request);

  // Localiza a aula e o curso ao qual pertence
  const aula = await queryOne(
    db,
    'SELECT a.id, m.curso_id FROM aulas a JOIN modulos m ON m.id = a.modulo_id WHERE a.id = ?',
    [id],
  );
  if (!aula) {
    return jsonErro('Aula não encontrada.', 404);
  }

  // Verifica se o aluno está matriculado no curso
  const matricula = await queryOne(
    db,
    'SELECT id FROM matriculas WHERE usuario_id = ? AND curso_id = ? AND status != "cancelada"',
    [payload.id, aula.curso_id],
  );
  if (!matricula) {
    return jsonErro('Você não está matriculado neste curso.', 403);
  }

  // Marca a aula como concluída ou pendente
  const concluida = body.concluida ? 1 : 0;
  const dataConclusao = concluida ? new Date().toISOString() : null;

  await db.prepare(`
    INSERT INTO progresso_aulas (matricula_id, aula_id, concluida, data_conclusao)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(matricula_id, aula_id) DO UPDATE SET
      concluida = excluded.concluida,
      data_conclusao = excluded.data_conclusao
  `).bind(matricula.id, id, concluida, dataConclusao).run();

  // Recalcula o percentual de conclusão geral do curso
  const totalAulasRegistro = await queryOne(
    db,
    'SELECT COUNT(*) AS total FROM aulas a JOIN modulos m ON m.id = a.modulo_id WHERE m.curso_id = ?',
    [aula.curso_id],
  );
  const concluidasRegistro = await queryOne(
    db,
    'SELECT COUNT(*) AS total FROM progresso_aulas WHERE matricula_id = ? AND concluida = 1',
    [matricula.id],
  );

  const totalAulas = Number(totalAulasRegistro.total || 0);
  const totalConcluidas = Number(concluidasRegistro.total || 0);
  const percentual = totalAulas > 0 ? Math.round((totalConcluidas / totalAulas) * 10000) / 100 : 0;
  const status = totalAulas > 0 && totalConcluidas >= totalAulas ? 'concluida' : 'ativa';

  await db.prepare(`
    UPDATE matriculas
    SET progresso_percentual = ?, status = ?, data_conclusao = ?
    WHERE id = ?
  `).bind(
    percentual,
    status,
    status === 'concluida' ? new Date().toISOString() : null,
    matricula.id,
  ).run();

  return jsonResponse({
    mensagem: 'Progresso atualizado com sucesso.',
    progresso_percentual: percentual,
    status,
  });
}

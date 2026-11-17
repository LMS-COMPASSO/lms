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
  ErroHttp,
  parseIdPositivo,
  recalcularConclusaoMatricula,
} from '../helpers_utilitarios.js';

const TIPOS_AULA_VALIDOS = ['video', 'texto', 'pdf', 'link'];

/**
 * Retorna as aulas pertencentes a um módulo.
 */
export async function listarAulasDoModulo(request, env, db, moduloId) {
  await authorizeUser(request, env, db);
  const id = parseIdPositivo(moduloId, 'moduloId');
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
  const { payload } = await authorizeUser(request, env, db);
  const id = parseIdPositivo(aulaId, 'aulaId');
  const aula = await queryOne(db, 'SELECT * FROM aulas WHERE id = ?', [id]);
  if (!aula) {
    return jsonErro('Aula não encontrada.', 404);
  }

  let cursoInfo = null;
  try {
    cursoInfo = await queryOne(
      db,
      'SELECT a.id, c.instrutor_id, c.status FROM aulas a JOIN modulos m ON a.modulo_id = m.id JOIN cursos c ON m.curso_id = c.id WHERE a.id = ?',
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
      return jsonErro('Acesso negado a aula em rascunho de outro instrutor.', 403);
    }
  }

  return jsonResponse(aula);
}

/**
 * Cria uma nova aula dentro de um módulo, validando propriedade do curso (IDOR).
 */
export async function criarAula(request, env, db, moduloId) {
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
    throw new ErroHttp('Você não tem permissão para adicionar aulas a este módulo.', 403);
  }

  const body = await readJsonBody(request);
  const titulo = String(body.titulo || '').trim();
  const tipo = String(body.tipo || 'texto');

  if (!titulo) {
    return jsonErro('Título da aula é obrigatório.', 400);
  }
  if (!TIPOS_AULA_VALIDOS.includes(tipo)) {
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
 * Atualiza os dados de uma aula, validando propriedade do curso (IDOR).
 */
export async function atualizarAula(request, env, db, aulaId) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador', 'instrutor']);

  const id = parseIdPositivo(aulaId, 'aulaId');
  const aula = await queryOne(
    db,
    'SELECT a.id, c.instrutor_id FROM aulas a JOIN modulos m ON a.modulo_id = m.id JOIN cursos c ON m.curso_id = c.id WHERE a.id = ?',
    [id],
  );
  if (!aula) {
    return jsonErro('Aula não encontrada.', 404);
  }
  if (payload.perfil === 'instrutor' && aula.instrutor_id !== payload.id) {
    throw new ErroHttp('Você não tem permissão para editar esta aula.', 403);
  }

  const body = await readJsonBody(request);
  const camposPermitidos = ['titulo', 'tipo', 'conteudo', 'url_recurso', 'duracao_min', 'ordem'];
  const campos = [];
  const params = [];

  for (const campo of camposPermitidos) {
    if (body[campo] !== undefined) {
      if (campo === 'titulo') {
        const tituloLimpo = String(body.titulo).trim();
        if (!tituloLimpo) return jsonErro('Título da aula não pode ser vazio.', 400);
        campos.push('titulo = ?');
        params.push(tituloLimpo);
        continue;
      }
      if (campo === 'tipo') {
        const tipoLimpo = String(body.tipo);
        if (!TIPOS_AULA_VALIDOS.includes(tipoLimpo)) {
          return jsonErro('Tipo de aula inválido. Use "video", "texto", "pdf" ou "link".', 400);
        }
        campos.push('tipo = ?');
        params.push(tipoLimpo);
        continue;
      }
      campos.push(`${campo} = ?`);
      params.push(campo === 'duracao_min' || campo === 'ordem' ? Number(body[campo] || 0) : body[campo]);
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
 * Exclui uma aula do sistema, validando propriedade do curso (IDOR).
 */
export async function excluirAula(request, env, db, aulaId) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador', 'instrutor']);

  const id = parseIdPositivo(aulaId, 'aulaId');
  const aula = await queryOne(
    db,
    'SELECT a.id, c.instrutor_id FROM aulas a JOIN modulos m ON a.modulo_id = m.id JOIN cursos c ON m.curso_id = c.id WHERE a.id = ?',
    [id],
  );
  if (!aula) {
    return jsonErro('Aula não encontrada.', 404);
  }
  if (payload.perfil === 'instrutor' && aula.instrutor_id !== payload.id) {
    throw new ErroHttp('Você não tem permissão para excluir esta aula.', 403);
  }

  await db.prepare('DELETE FROM aulas WHERE id = ?').bind(id).run();
  return jsonResponse({ mensagem: 'Aula excluída com sucesso.' });
}

/**
 * Registra a conclusão de uma aula pelo aluno e recalcula o percentual total da matrícula.
 */
export async function atualizarProgressoAula(request, env, db, aulaId) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['aluno']);

  const id = parseIdPositivo(aulaId, 'aulaId');
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

  const { percentual, status, avaliacoesPendentes } = await recalcularConclusaoMatricula(db, matricula.id, aula.curso_id);

  return jsonResponse({
    mensagem: 'Progresso atualizado com sucesso.',
    progresso_percentual: percentual,
    status,
    avaliacoes_pendentes: avaliacoesPendentes,
  });
}

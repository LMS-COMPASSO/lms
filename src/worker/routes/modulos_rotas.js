/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - ROTAS DE MÓDULOS DE CURSOS (MODULES)
 * ============================================================================
 * Permite organizar um curso em seções temáticas sequenciais (módulos):
 * - Listar módulos de um curso (/api/modulos/curso/:cursoId)
 * - Criar novo módulo (/api/modulos/curso/:cursoId)
 * - Atualizar título, descrição ou ordem de um módulo (/api/modulos/:id)
 * - Excluir um módulo (/api/modulos/:id)
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
} from '../helpers_utilitarios.js';

/**
 * Retorna todos os módulos pertencentes a um curso, ordenados pela ordem definida.
 */
export async function listarModulosDoCurso(request, env, db, cursoId) {
  await authorizeUser(request, env, db);
  const id = Number(cursoId);
  const modulos = await queryAll(
    db,
    'SELECT * FROM modulos WHERE curso_id = ? ORDER BY ordem ASC, id ASC',
    [id],
  );
  return jsonResponse(modulos);
}

/**
 * Cria um novo módulo associado a um curso, validando propriedade do curso (IDOR).
 */
export async function criarModulo(request, env, db, cursoId) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador', 'instrutor']);

  const id = Number(cursoId);
  const curso = await queryOne(db, 'SELECT id, instrutor_id FROM cursos WHERE id = ?', [id]);
  if (!curso) {
    return jsonErro('Curso não encontrado.', 404);
  }
  if (payload.perfil === 'instrutor' && curso.instrutor_id !== payload.id) {
    throw new ErroHttp('Você não tem permissão para adicionar módulos a este curso.', 403);
  }

  const body = await readJsonBody(request);
  const titulo = String(body.titulo || '').trim();

  if (!titulo) {
    return jsonErro('Título do módulo é obrigatório.', 400);
  }

  const resultado = await db.prepare(
    'INSERT INTO modulos (curso_id, titulo, descricao, ordem) VALUES (?, ?, ?, ?)',
  ).bind(
    id,
    titulo,
    body.descricao || null,
    Number(body.ordem || 0),
  ).run();

  return jsonResponse({
    id: resultado.meta.last_row_id,
    titulo,
  }, 201);
}

/**
 * Atualiza os campos de um módulo existente, validando propriedade do curso (IDOR).
 */
export async function atualizarModulo(request, env, db, moduloId) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador', 'instrutor']);

  const id = Number(moduloId);
  const modulo = await queryOne(
    db,
    'SELECT m.id, c.instrutor_id FROM modulos m JOIN cursos c ON m.curso_id = c.id WHERE m.id = ?',
    [id],
  );
  if (!modulo) {
    return jsonErro('Módulo não encontrado.', 404);
  }
  if (payload.perfil === 'instrutor' && modulo.instrutor_id !== payload.id) {
    throw new ErroHttp('Você não tem permissão para editar este módulo.', 403);
  }

  const body = await readJsonBody(request);
  const campos = [];
  const params = [];

  if (body.titulo !== undefined) { campos.push('titulo = ?'); params.push(String(body.titulo)); }
  if (body.descricao !== undefined) { campos.push('descricao = ?'); params.push(body.descricao); }
  if (body.ordem !== undefined) { campos.push('ordem = ?'); params.push(Number(body.ordem)); }

  if (campos.length === 0) {
    return jsonErro('Nenhum campo para atualizar.', 400);
  }

  params.push(id);
  await db.prepare(`UPDATE modulos SET ${campos.join(', ')} WHERE id = ?`).bind(...params).run();
  return jsonResponse({ mensagem: 'Módulo atualizado com sucesso.' });
}

/**
 * Remove um módulo e suas aulas associadas, validando propriedade do curso (IDOR).
 */
export async function excluirModulo(request, env, db, moduloId) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador', 'instrutor']);

  const id = Number(moduloId);
  const modulo = await queryOne(
    db,
    'SELECT m.id, c.instrutor_id FROM modulos m JOIN cursos c ON m.curso_id = c.id WHERE m.id = ?',
    [id],
  );
  if (!modulo) {
    return jsonErro('Módulo não encontrado.', 404);
  }
  if (payload.perfil === 'instrutor' && modulo.instrutor_id !== payload.id) {
    throw new ErroHttp('Você não tem permissão para excluir este módulo.', 403);
  }

  await db.prepare('DELETE FROM modulos WHERE id = ?').bind(id).run();
  return jsonResponse({ mensagem: 'Módulo excluído com sucesso.' });
}

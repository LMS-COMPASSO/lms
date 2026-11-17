/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - ROTAS DE MATRÍCULAS (ENROLLMENTS)
 * ============================================================================
 * Gerencia a inscrição dos alunos nos cursos da plataforma:
 * - Listar matrículas com filtros (/api/matriculas)
 * - Realizar nova matrícula ou reativar matrícula cancelada (/api/matriculas)
 * - Cancelar matrícula (/api/matriculas/:id/cancelar)
 * ============================================================================
 */

import {
  jsonResponse,
  jsonErro,
  readJsonBody,
  queryAll,
  queryOne,
  authorizeUser,
  parseIdPositivo,
} from '../helpers_utilitarios.js';

/**
 * Lista as matrículas registradas.
 * Alunos veem apenas suas próprias matrículas.
 * Instrutores veem alunos matriculados em seus cursos.
 * Administradores têm visão global de toda a rede de ensino.
 */
export async function listarMatriculas(request, env, db, url) {
  const { payload } = await authorizeUser(request, env, db);
  const cursoId = url.searchParams.get('curso_id');
  const status = url.searchParams.get('status');

  let sql = `
    SELECT m.id, m.status, m.progresso_percentual, m.data_matricula,
      u.id AS aluno_id, u.nome AS aluno_nome, u.email AS aluno_email,
      c.id AS curso_id, c.titulo AS curso_titulo, c.carga_horaria
    FROM matriculas m
    JOIN usuarios u ON u.id = m.usuario_id
    JOIN cursos c ON c.id = m.curso_id
    WHERE 1 = 1
  `;
  const params = [];

  if (payload.perfil === 'aluno') {
    sql += ' AND m.usuario_id = ?';
    params.push(payload.id);
  } else if (payload.perfil === 'instrutor') {
    sql += ' AND c.instrutor_id = ?';
    params.push(payload.id);
  }

  if (cursoId) {
    sql += ' AND m.curso_id = ?';
    params.push(parseIdPositivo(cursoId, 'curso_id'));
  }
  if (status) {
    sql += ' AND m.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY m.data_matricula DESC';

  const matriculas = await queryAll(db, sql, params);
  return jsonResponse(matriculas);
}

/**
 * Inscreve o aluno em um curso publicado.
 * Se já existir uma matrícula anterior com status cancelada, reativa-a com progresso zerado.
 */
export async function matricularAluno(request, env, db) {
  const { payload } = await authorizeUser(request, env, db);
  const body = await readJsonBody(request);
  if (!body.curso_id) {
    return jsonErro('curso_id é obrigatório.', 400);
  }
  const cursoId = parseIdPositivo(body.curso_id, 'curso_id');

  let alunoId = payload.id;
  if (payload.perfil !== 'aluno' && body.usuario_id !== undefined) {
    alunoId = parseIdPositivo(body.usuario_id, 'usuario_id');
  }

  const curso = await queryOne(db, 'SELECT id, status, instrutor_id FROM cursos WHERE id = ?', [cursoId]);
  if (!curso) {
    return jsonErro('Curso não encontrado.', 404);
  }

  if (payload.perfil === 'aluno' && curso.status !== 'publicado') {
    return jsonErro('Este curso ainda não está disponível para matrícula.', 403);
  }
  if (payload.perfil === 'instrutor' && curso.instrutor_id !== payload.id) {
    return jsonErro('Acesso negado. Você só pode matricular alunos em seus próprios cursos.', 403);
  }

  if (alunoId !== payload.id) {
    const alunoExiste = await queryOne(db, 'SELECT id, ativo FROM usuarios WHERE id = ?', [alunoId]);
    if (!alunoExiste) {
      return jsonErro('Usuário informado para matrícula não encontrado.', 404);
    }
    if (!alunoExiste.ativo) {
      return jsonErro('Não é possível matricular um usuário desativado.', 400);
    }
  }

  const matriculaExistente = await queryOne(
    db,
    'SELECT id, status FROM matriculas WHERE usuario_id = ? AND curso_id = ?',
    [alunoId, cursoId],
  );

  if (matriculaExistente) {
    if (matriculaExistente.status === 'cancelada') {
      await db.prepare(
        'UPDATE matriculas SET status = "ativa", progresso_percentual = 0 WHERE id = ?',
      ).bind(matriculaExistente.id).run();

      return jsonResponse({
        id: matriculaExistente.id,
        curso_id: cursoId,
        status: 'ativa',
        mensagem: 'Matrícula reativada com sucesso.',
      });
    }
    return jsonErro('Você já está matriculado neste curso.', 409);
  }

  const resultado = await db.prepare(`
    INSERT INTO matriculas (usuario_id, curso_id, status, progresso_percentual)
    VALUES (?, ?, 'ativa', 0)
  `).bind(alunoId, cursoId).run();

  return jsonResponse({
    id: resultado.meta.last_row_id,
    curso_id: cursoId,
    status: 'ativa',
    mensagem: 'Matrícula realizada com sucesso.',
  }, 201);
}

/**
 * Cancela a matrícula especificada.
 */
export async function cancelarMatricula(request, env, db, matriculaId) {
  const { payload } = await authorizeUser(request, env, db);
  const id = parseIdPositivo(matriculaId, 'matriculaId');

  const matricula = await queryOne(
    db,
    'SELECT m.id, m.usuario_id, c.instrutor_id FROM matriculas m JOIN cursos c ON c.id = m.curso_id WHERE m.id = ?',
    [id],
  );
  if (!matricula) {
    return jsonErro('Matrícula não encontrada.', 404);
  }

  if (payload.perfil === 'aluno' && matricula.usuario_id !== payload.id) {
    return jsonErro('Acesso negado. Esta matrícula não pertence a você.', 403);
  }
  if (payload.perfil === 'instrutor' && matricula.instrutor_id !== payload.id) {
    return jsonErro('Acesso negado. Você só pode cancelar matrículas de seus próprios cursos.', 403);
  }

  await db.prepare('UPDATE matriculas SET status = "cancelada" WHERE id = ?').bind(id).run();
  return jsonResponse({ mensagem: 'Matrícula cancelada com sucesso.' });
}

/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - ROTAS DE MATRÍCULAS
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
} from '../helpers.mjs';

/**
 * Lista as matrículas registradas.
 * Alunos veem apenas suas próprias matrículas.
 * Instrutores veem alunos matriculados em seus cursos.
 * Administradores têm visão global de toda a rede de ensino.
 */
export async function listarMatriculas(request, env, db, url) {
  try {
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
      params.push(Number(cursoId));
    }
    if (status) {
      sql += ' AND m.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY m.data_matricula DESC';

    const matriculas = await queryAll(db, sql, params);
    return jsonResponse(matriculas);
  } catch (error) {
    return jsonErro(error.message || 'Token inválido ou expirado.', 401);
  }
}

/**
 * Inscreve o aluno em um curso publicado.
 * Se já existir uma matrícula anterior com status cancelada, reativa-a com progresso zerado.
 */
export async function matricularAluno(request, env, db) {
  try {
    const { payload } = await authorizeUser(request, env, db);
    const body = await readJsonBody(request);
    const cursoId = Number(body.curso_id);

    if (!cursoId) {
      return jsonErro('curso_id é obrigatório.', 400);
    }

    const alunoId = payload.perfil === 'aluno'
      ? payload.id
      : (Number(body.usuario_id) || payload.id);

    const curso = await queryOne(db, 'SELECT id, status FROM cursos WHERE id = ?', [cursoId]);
    if (!curso) {
      return jsonErro('Curso não encontrado.', 404);
    }

    if (payload.perfil === 'aluno' && curso.status !== 'publicado') {
      return jsonErro('Este curso ainda não está disponível para matrícula.', 403);
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
  } catch (error) {
    return jsonErro(error.message || 'Token inválido ou expirado.', 401);
  }
}

/**
 * Cancela a matrícula especificada.
 */
export async function cancelarMatricula(request, env, db, matriculaId) {
  try {
    const { payload } = await authorizeUser(request, env, db);
    const id = Number(matriculaId);

    if (payload.perfil === 'aluno') {
      const propriaMatricula = await queryOne(
        db,
        'SELECT id FROM matriculas WHERE id = ? AND usuario_id = ?',
        [id, payload.id],
      );
      if (!propriaMatricula) {
        return jsonErro('Acesso negado. Esta matrícula não pertence a você.', 403);
      }
    }

    await db.prepare('UPDATE matriculas SET status = "cancelada" WHERE id = ?').bind(id).run();
    return jsonResponse({ mensagem: 'Matrícula cancelada com sucesso.' });
  } catch (error) {
    return jsonErro(error.message || 'Token inválido ou expirado.', 401);
  }
}

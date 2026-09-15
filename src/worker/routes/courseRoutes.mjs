/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - ROTAS DE CURSOS
 * ============================================================================
 * Gerencia o catálogo de cursos alinhados à BNCC da Computação:
 * - Listar cursos com filtros por Eixo BNCC, ano escolar, status e busca (/api/cursos)
 * - Obter detalhes completos de um curso com seus módulos e aulas (/api/cursos/:id)
 * - Criar novo curso em rascunho (/api/cursos)
 * - Editar informações do curso (/api/cursos/:id)
 * - Alterar status para publicado ou rascunho (/api/cursos/:id/status)
 * - Excluir curso e seus vínculos (/api/cursos/:id)
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
 * Lista cursos de acordo com o perfil do usuário logado.
 * Alunos só visualizam cursos publicados.
 * Instrutores veem cursos próprios e rascunhos. Administradores veem tudo.
 */
export async function listarCursos(request, env, db, url) {
  try {
    const { payload } = await authorizeUser(request, env, db);

    const busca = url.searchParams.get('busca');
    const status = url.searchParams.get('status');
    const eixo = url.searchParams.get('eixo_bncc');
    const ano = url.searchParams.get('ano_escolar');
    const instrutorId = url.searchParams.get('instrutor_id');

    let sql = `
      SELECT c.*, u.nome AS instrutor_nome,
      (SELECT COUNT(*) FROM matriculas m WHERE m.curso_id = c.id AND m.status IN ('ativa','concluida')) AS total_matriculados
      FROM cursos c
      JOIN usuarios u ON u.id = c.instrutor_id
      WHERE 1 = 1
    `;
    const params = [];

    // Alunos só têm permissão para ver cursos publicados
    if (payload.perfil === 'aluno') {
      sql += ' AND c.status = ?';
      params.push('publicado');
    } else if (status) {
      sql += ' AND c.status = ?';
      params.push(status);
    }

    // Instrutor vê prioritariamente os próprios cursos
    if (payload.perfil === 'instrutor') {
      sql += ' AND c.instrutor_id = ?';
      params.push(payload.id);
    } else if (instrutorId) {
      sql += ' AND c.instrutor_id = ?';
      params.push(Number(instrutorId));
    }

    // Filtros pedagógicos da BNCC
    if (eixo) {
      sql += ' AND c.eixo_bncc = ?';
      params.push(eixo);
    }
    if (ano) {
      sql += ' AND c.ano_escolar = ?';
      params.push(ano);
    }
    if (busca) {
      sql += ' AND c.titulo LIKE ?';
      params.push(`%${busca}%`);
    }

    sql += ' ORDER BY c.criado_em DESC';

    const cursos = await queryAll(db, sql, params);
    return jsonResponse(cursos);
  } catch (error) {
    return jsonErro(error.message || 'Token inválido ou expirado.', 401);
  }
}

/**
 * Cria um novo curso em modo "rascunho". Apenas administradores e instrutores podem criar.
 */
export async function criarCurso(request, env, db) {
  try {
    const { payload } = await authorizeUser(request, env, db);
    if (!['administrador', 'instrutor'].includes(payload.perfil)) {
      return jsonErro('Acesso negado. Apenas administradores e professores podem criar cursos.', 403);
    }

    const body = await readJsonBody(request);
    const titulo = String(body.titulo || '').trim();
    const eixo = String(body.eixo_bncc || '').trim();
    const ano = String(body.ano_escolar || '').trim();

    if (!titulo || !eixo || !ano) {
      return jsonErro('Título, eixo BNCC e ano escolar são obrigatórios.', 400);
    }

    const instrutorId = payload.perfil === 'administrador' && body.instrutor_id
      ? Number(body.instrutor_id)
      : payload.id;

    const resultado = await db.prepare(`
      INSERT INTO cursos (titulo, descricao, eixo_bncc, ano_escolar, carga_horaria, capa_url, instrutor_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'rascunho')
    `).bind(
      titulo,
      body.descricao || '',
      eixo,
      ano,
      Number(body.carga_horaria || 0),
      body.capa_url || null,
      instrutorId,
    ).run();

    return jsonResponse({
      id: resultado.meta.last_row_id,
      titulo,
      status: 'rascunho',
    }, 201);
  } catch (error) {
    return jsonErro(error.message || 'Token inválido ou expirado.', 401);
  }
}

/**
 * Retorna os detalhes de um curso com todos os seus módulos, aulas e status de conclusão do aluno.
 */
export async function obterCurso(request, env, db, cursoId) {
  try {
    const { payload } = await authorizeUser(request, env, db);
    const id = Number(cursoId);

    const curso = await queryOne(
      db,
      'SELECT c.*, u.nome AS instrutor_nome FROM cursos c JOIN usuarios u ON u.id = c.instrutor_id WHERE c.id = ?',
      [id],
    );

    if (!curso) {
      return jsonErro('Curso não encontrado.', 404);
    }

    if (payload.perfil === 'aluno' && curso.status !== 'publicado') {
      return jsonErro('Acesso negado. Este curso ainda não está publicado.', 403);
    }

    // Carrega os módulos ordenados
    const modulos = await queryAll(
      db,
      'SELECT * FROM modulos WHERE curso_id = ? ORDER BY ordem ASC, id ASC',
      [id],
    );

    // Para cada módulo, anexa suas aulas e avaliações
    for (const modulo of modulos) {
      modulo.aulas = await queryAll(
        db,
        `SELECT a.id, a.titulo, a.tipo, a.conteudo, a.url_recurso, a.duracao_min, a.ordem,
          COALESCE((
            SELECT pa.concluida FROM progresso_aulas pa
            JOIN matriculas m ON m.id = pa.matricula_id
            WHERE pa.aula_id = a.id AND m.usuario_id = ? AND m.curso_id = ?
            LIMIT 1
          ), 0) AS concluida
        FROM aulas a WHERE a.modulo_id = ? ORDER BY a.ordem ASC, a.id ASC`,
        [payload.id, id, modulo.id],
      );

      modulo.avaliacoes = await queryAll(
        db,
        'SELECT id, titulo, nota_minima, tentativas_permitidas FROM avaliacoes WHERE modulo_id = ?',
        [modulo.id],
      );
    }

    curso.modulos = modulos;
    return jsonResponse(curso);
  } catch (error) {
    return jsonErro(error.message || 'Token inválido ou expirado.', 401);
  }
}

/**
 * Atualiza os dados cadastrais de um curso.
 */
export async function atualizarCurso(request, env, db, cursoId) {
  try {
    const { payload } = await authorizeUser(request, env, db);
    if (!['administrador', 'instrutor'].includes(payload.perfil)) {
      return jsonErro('Acesso negado.', 403);
    }

    const id = Number(cursoId);
    const cursoExistente = await queryOne(db, 'SELECT id, instrutor_id FROM cursos WHERE id = ?', [id]);
    if (!cursoExistente) {
      return jsonErro('Curso não encontrado.', 404);
    }

    if (payload.perfil === 'instrutor' && cursoExistente.instrutor_id !== payload.id) {
      return jsonErro('Você não tem permissão para editar este curso.', 403);
    }

    const body = await readJsonBody(request);
    const campos = [];
    const params = [];

    if (body.titulo !== undefined) { campos.push('titulo = ?'); params.push(String(body.titulo)); }
    if (body.descricao !== undefined) { campos.push('descricao = ?'); params.push(String(body.descricao)); }
    if (body.eixo_bncc !== undefined) { campos.push('eixo_bncc = ?'); params.push(String(body.eixo_bncc)); }
    if (body.ano_escolar !== undefined) { campos.push('ano_escolar = ?'); params.push(String(body.ano_escolar)); }
    if (body.carga_horaria !== undefined) { campos.push('carga_horaria = ?'); params.push(Number(body.carga_horaria)); }
    if (body.capa_url !== undefined) { campos.push('capa_url = ?'); params.push(String(body.capa_url)); }

    if (campos.length === 0) {
      return jsonErro('Nenhum campo para atualizar.', 400);
    }

    campos.push('atualizado_em = CURRENT_TIMESTAMP');
    params.push(id);

    await db.prepare(`UPDATE cursos SET ${campos.join(', ')} WHERE id = ?`).bind(...params).run();
    return jsonResponse({ mensagem: 'Curso atualizado com sucesso.' });
  } catch (error) {
    return jsonErro(error.message || 'Token inválido ou expirado.', 401);
  }
}

/**
 * Altera o status do curso entre "rascunho" e "publicado".
 */
export async function alterarStatusCurso(request, env, db, cursoId) {
  try {
    const { payload } = await authorizeUser(request, env, db);
    if (!['administrador', 'instrutor'].includes(payload.perfil)) {
      return jsonErro('Acesso negado.', 403);
    }

    const id = Number(cursoId);
    const cursoExistente = await queryOne(db, 'SELECT id, instrutor_id FROM cursos WHERE id = ?', [id]);
    if (!cursoExistente) {
      return jsonErro('Curso não encontrado.', 404);
    }

    if (payload.perfil === 'instrutor' && cursoExistente.instrutor_id !== payload.id) {
      return jsonErro('Você não tem permissão para alterar o status deste curso.', 403);
    }

    const body = await readJsonBody(request);
    const statusValue = String(body.status || '');
    if (!['rascunho', 'publicado'].includes(statusValue)) {
      return jsonErro('Status inválido. Use "rascunho" ou "publicado".', 400);
    }

    await db.prepare('UPDATE cursos SET status = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?').bind(statusValue, id).run();
    return jsonResponse({ mensagem: `Curso marcado como "${statusValue}".` });
  } catch (error) {
    return jsonErro(error.message || 'Token inválido ou expirado.', 401);
  }
}

/**
 * Exclui um curso e todos os módulos e aulas vinculados em cascata.
 */
export async function excluirCurso(request, env, db, cursoId) {
  try {
    const { payload } = await authorizeUser(request, env, db);
    if (!['administrador', 'instrutor'].includes(payload.perfil)) {
      return jsonErro('Acesso negado.', 403);
    }

    const id = Number(cursoId);
    const cursoExistente = await queryOne(db, 'SELECT id, instrutor_id FROM cursos WHERE id = ?', [id]);
    if (!cursoExistente) {
      return jsonErro('Curso não encontrado.', 404);
    }

    if (payload.perfil === 'instrutor' && cursoExistente.instrutor_id !== payload.id) {
      return jsonErro('Você não tem permissão para excluir este curso.', 403);
    }

    await db.prepare('DELETE FROM cursos WHERE id = ?').bind(id).run();
    return jsonResponse({ mensagem: 'Curso excluído com sucesso.' });
  } catch (error) {
    return jsonErro(error.message || 'Token inválido ou expirado.', 401);
  }
}

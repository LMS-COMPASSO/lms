/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - ROTAS DE DASHBOARD E INDICADORES ESCOLARES
 * ============================================================================
 * Fornece dados consolidados para a gestão pedagógica:
 * - Indicadores gerais de engajamento escolar (/api/dashboard/indicadores)
 * - Linha do tempo de atividades recentes (/api/dashboard/linha-do-tempo)
 * ============================================================================
 */

import {
  jsonResponse,
  jsonErro,
  queryAll,
  queryOne,
  authorizeUser,
} from '../helpers.mjs';

/**
 * Retorna estatísticas gerais e indicadores para o dashboard.
 */
export async function obterIndicadores(request, env, db) {
  try {
    const { payload } = await authorizeUser(request, env, db);

    // Contagem geral de usuários (apenas administrador visualiza)
    const usuarios = await queryOne(db, `
      SELECT COUNT(*) AS total,
        SUM(CASE WHEN perfil = 'administrador' THEN 1 ELSE 0 END) AS administradores,
        SUM(CASE WHEN perfil = 'instrutor' THEN 1 ELSE 0 END) AS instrutores,
        SUM(CASE WHEN perfil = 'aluno' THEN 1 ELSE 0 END) AS alunos,
        SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) AS ativos
      FROM usuarios
    `);

    // Estatísticas de cursos
    let cursosSql = `
      SELECT SUM(CASE WHEN c.status = 'publicado' THEN 1 ELSE 0 END) AS publicados,
        SUM(CASE WHEN c.status = 'rascunho' THEN 1 ELSE 0 END) AS rascunhos,
        COUNT(*) AS total
      FROM cursos c
    `;
    const cursoParams = [];
    if (payload.perfil === 'instrutor') {
      cursosSql += ' WHERE instrutor_id = ?';
      cursoParams.push(payload.id);
    }
    const cursos = await queryOne(db, cursosSql, cursoParams);

    // Estatísticas de matrículas
    let matriculasSql = `
      SELECT SUM(CASE WHEN mt.status = 'ativa' THEN 1 ELSE 0 END) AS ativas,
        SUM(CASE WHEN mt.status = 'concluida' THEN 1 ELSE 0 END) AS concluidas,
        SUM(CASE WHEN mt.status = 'cancelada' THEN 1 ELSE 0 END) AS canceladas,
        COUNT(*) AS total,
        ROUND(AVG(mt.progresso_percentual), 2) AS progresso_medio
      FROM matriculas mt
      JOIN cursos c ON c.id = mt.curso_id
    `;
    const matriculasParams = [];
    if (payload.perfil === 'instrutor') {
      matriculasSql += ' WHERE c.instrutor_id = ?';
      matriculasParams.push(payload.id);
    }
    const matriculas = await queryOne(db, matriculasSql, matriculasParams);

    // Total de certificados emitidos
    let certificadosSql = `
      SELECT COUNT(*) AS total
      FROM certificados cert
      JOIN matriculas mt ON mt.id = cert.matricula_id
      JOIN cursos c ON c.id = mt.curso_id
    `;
    const certificadosParams = [];
    if (payload.perfil === 'instrutor') {
      certificadosSql += ' WHERE c.instrutor_id = ?';
      certificadosParams.push(payload.id);
    }
    const certificados = await queryOne(db, certificadosSql, certificadosParams);

    // Distribuição de cursos por eixo estruturante da BNCC Computação
    let eixosSql = 'SELECT eixo_bncc, COUNT(*) AS total FROM cursos';
    const eixosParams = [];
    if (payload.perfil === 'instrutor') {
      eixosSql += ' WHERE instrutor_id = ?';
      eixosParams.push(payload.id);
    }
    eixosSql += ' GROUP BY eixo_bncc';
    const cursosPorEixo = await queryAll(db, eixosSql, eixosParams);

    // Cálculo da taxa de conclusão
    const totalMatriculas = Number(matriculas.total || 0);
    const concluidasMatriculas = Number(matriculas.concluidas || 0);
    const taxaConclusao = totalMatriculas > 0
      ? Number(((concluidasMatriculas / totalMatriculas) * 100).toFixed(2))
      : 0;

    return jsonResponse({
      usuarios: payload.perfil === 'administrador' ? usuarios : undefined,
      cursos,
      matriculas,
      certificadosEmitidos: Number(certificados.total || 0),
      taxaConclusao,
      cursosPorEixoBNCC: cursosPorEixo,
    });
  } catch (error) {
    return jsonErro(error.message || 'Token inválido ou expirado.', 401);
  }
}

/**
 * Retorna a linha do tempo (timeline) cronológica das atividades recentes da plataforma.
 */
export async function obterLinhaDoTempo(request, env, db, url) {
  try {
    const { payload } = await authorizeUser(request, env, db);
    const limite = Number(url.searchParams.get('limite') || 15);

    let sql = `SELECT tipo, data, usuario_nome, curso_titulo, extra FROM (
      SELECT 'matricula' AS tipo, mt.data_matricula AS data, u.nome AS usuario_nome, c.titulo AS curso_titulo, NULL AS extra
      FROM matriculas mt JOIN usuarios u ON u.id = mt.usuario_id JOIN cursos c ON c.id = mt.curso_id`;
    const params = [];
    if (payload.perfil === 'instrutor') {
      sql += ' WHERE c.instrutor_id = ?';
      params.push(payload.id);
    }

    sql += `
      UNION ALL
      SELECT 'conclusao' AS tipo, mt.data_conclusao AS data, u.nome AS usuario_nome, c.titulo AS curso_titulo, NULL AS extra
      FROM matriculas mt JOIN usuarios u ON u.id = mt.usuario_id JOIN cursos c ON c.id = mt.curso_id
      WHERE mt.status = 'concluida' AND mt.data_conclusao IS NOT NULL`;
    if (payload.perfil === 'instrutor') {
      sql += ' AND c.instrutor_id = ?';
      params.push(payload.id);
    }

    sql += `
      UNION ALL
      SELECT 'curso_publicado' AS tipo, c.atualizado_em AS data, ui.nome AS usuario_nome, c.titulo AS curso_titulo, NULL AS extra
      FROM cursos c JOIN usuarios ui ON ui.id = c.instrutor_id WHERE c.status = 'publicado'`;
    if (payload.perfil === 'instrutor') {
      sql += ' AND c.instrutor_id = ?';
      params.push(payload.id);
    }

    sql += `
      UNION ALL
      SELECT 'certificado' AS tipo, cert.data_emissao AS data, u.nome AS usuario_nome, c.titulo AS curso_titulo, cert.codigo_validacao AS extra
      FROM certificados cert JOIN matriculas mt ON mt.id = cert.matricula_id JOIN usuarios u ON u.id = mt.usuario_id JOIN cursos c ON c.id = mt.curso_id`;
    if (payload.perfil === 'instrutor') {
      sql += ' AND c.instrutor_id = ?';
      params.push(payload.id);
    }

    sql += ') ORDER BY data DESC LIMIT ?';
    params.push(limite);

    const registros = await queryAll(db, sql, params);
    return jsonResponse(registros);
  } catch (error) {
    return jsonErro(error.message || 'Token inválido ou expirado.', 401);
  }
}

const pool = require('../config/db');

async function indicadores(req, res, next) {
  try {
    const filtroInstrutor = req.usuario.perfil === 'instrutor';
    const instrutorId = req.usuario.id;

    const [[usuariosPorPerfil]] = await pool.query(`
      SELECT
        SUM(perfil = 'administrador') AS administradores,
        SUM(perfil = 'instrutor') AS instrutores,
        SUM(perfil = 'aluno') AS alunos,
        SUM(ativo = 1) AS ativos,
        COUNT(*) AS total
      FROM usuarios
    `);

    let sqlCursos = `
      SELECT
        SUM(status = 'publicado') AS publicados,
        SUM(status = 'rascunho') AS rascunhos,
        COUNT(*) AS total
      FROM cursos WHERE 1=1
    `;
    const paramsCursos = [];
    if (filtroInstrutor) { sqlCursos += ' AND instrutor_id = ?'; paramsCursos.push(instrutorId); }
    const [[cursosResumo]] = await pool.query(sqlCursos, paramsCursos);

    let sqlMatriculas = `
      SELECT
        SUM(mt.status = 'ativa') AS ativas,
        SUM(mt.status = 'concluida') AS concluidas,
        SUM(mt.status = 'cancelada') AS canceladas,
        COUNT(*) AS total,
        ROUND(AVG(mt.progresso_percentual), 2) AS progresso_medio
      FROM matriculas mt
      JOIN cursos c ON c.id = mt.curso_id
      WHERE 1=1
    `;
    const paramsMatriculas = [];
    if (filtroInstrutor) { sqlMatriculas += ' AND c.instrutor_id = ?'; paramsMatriculas.push(instrutorId); }
    const [[matriculasResumo]] = await pool.query(sqlMatriculas, paramsMatriculas);

    let sqlCertificados = `
      SELECT COUNT(*) AS total FROM certificados cert
      JOIN matriculas mt ON mt.id = cert.matricula_id
      JOIN cursos c ON c.id = mt.curso_id
      WHERE 1=1
    `;
    const paramsCertificados = [];
    if (filtroInstrutor) { sqlCertificados += ' AND c.instrutor_id = ?'; paramsCertificados.push(instrutorId); }
    const [[certificadosResumo]] = await pool.query(sqlCertificados, paramsCertificados);

    let sqlEixos = `
      SELECT eixo_bncc, COUNT(*) AS total FROM cursos WHERE 1=1
    `;
    const paramsEixos = [];
    if (filtroInstrutor) { sqlEixos += ' AND instrutor_id = ?'; paramsEixos.push(instrutorId); }
    sqlEixos += ' GROUP BY eixo_bncc';
    const [cursosPorEixo] = await pool.query(sqlEixos, paramsEixos);

    const taxaConclusao = matriculasResumo.total > 0
      ? Math.round((matriculasResumo.concluidas / matriculasResumo.total) * 10000) / 100
      : 0;

    res.json({
      usuarios: req.usuario.perfil === 'administrador' ? usuariosPorPerfil : undefined,
      cursos: cursosResumo,
      matriculas: matriculasResumo,
      certificadosEmitidos: certificadosResumo.total,
      taxaConclusao,
      cursosPorEixoBNCC: cursosPorEixo,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Linha do tempo com as atividades mais recentes da plataforma:
 * novas matrículas, conclusões de curso, cursos publicados e certificados emitidos.
 */
async function linhaDoTempo(req, res, next) {
  try {
    const limite = parseInt(req.query.limite, 10) || 20;
    const filtroInstrutor = req.usuario.perfil === 'instrutor';
    const instrutorId = req.usuario.id;
    const filtroSql = filtroInstrutor ? 'AND c.instrutor_id = ?' : '';
    const paramsRepetidos = filtroInstrutor ? [instrutorId] : [];

    const [eventos] = await pool.query(
      `
      (
        SELECT 'matricula' AS tipo, mt.data_matricula AS data,
               u.nome AS usuario_nome, c.titulo AS curso_titulo, NULL AS extra
        FROM matriculas mt
        JOIN usuarios u ON u.id = mt.usuario_id
        JOIN cursos c ON c.id = mt.curso_id
        WHERE 1=1 ${filtroSql}
      )
      UNION ALL
      (
        SELECT 'conclusao' AS tipo, mt.data_conclusao AS data,
               u.nome AS usuario_nome, c.titulo AS curso_titulo, NULL AS extra
        FROM matriculas mt
        JOIN usuarios u ON u.id = mt.usuario_id
        JOIN cursos c ON c.id = mt.curso_id
        WHERE mt.status = 'concluida' AND mt.data_conclusao IS NOT NULL ${filtroSql}
      )
      UNION ALL
      (
        SELECT 'curso_publicado' AS tipo, c.atualizado_em AS data,
               ui.nome AS usuario_nome, c.titulo AS curso_titulo, NULL AS extra
        FROM cursos c
        JOIN usuarios ui ON ui.id = c.instrutor_id
        WHERE c.status = 'publicado' ${filtroSql}
      )
      UNION ALL
      (
        SELECT 'certificado' AS tipo, cert.data_emissao AS data,
               u.nome AS usuario_nome, c.titulo AS curso_titulo, cert.codigo_validacao AS extra
        FROM certificados cert
        JOIN matriculas mt ON mt.id = cert.matricula_id
        JOIN usuarios u ON u.id = mt.usuario_id
        JOIN cursos c ON c.id = mt.curso_id
        WHERE 1=1 ${filtroSql}
      )
      ORDER BY data DESC
      LIMIT ?
      `,
      [...paramsRepetidos, ...paramsRepetidos, ...paramsRepetidos, ...paramsRepetidos, limite]
    );

    res.json(eventos);
  } catch (err) {
    next(err);
  }
}

module.exports = { indicadores, linhaDoTempo };

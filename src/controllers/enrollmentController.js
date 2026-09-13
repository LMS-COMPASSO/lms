const pool = require('../config/db');

async function listar(req, res, next) {
  try {
    let sql = `
      SELECT mt.*, u.nome AS aluno_nome, u.email AS aluno_email,
             c.titulo AS curso_titulo, c.carga_horaria
      FROM matriculas mt
      JOIN usuarios u ON u.id = mt.usuario_id
      JOIN cursos c ON c.id = mt.curso_id
      WHERE 1=1
    `;
    const params = [];

    if (req.usuario.perfil === 'aluno') {
      sql += ' AND mt.usuario_id = ?';
      params.push(req.usuario.id);
    } else if (req.usuario.perfil === 'instrutor') {
      sql += ' AND c.instrutor_id = ?';
      params.push(req.usuario.id);
    }

    if (req.query.curso_id) { sql += ' AND mt.curso_id = ?'; params.push(req.query.curso_id); }
    if (req.query.status) { sql += ' AND mt.status = ?'; params.push(req.query.status); }

    sql += ' ORDER BY mt.data_matricula DESC';

    const [linhas] = await pool.query(sql, params);
    res.json(linhas);
  } catch (err) {
    next(err);
  }
}

async function matricular(req, res, next) {
  try {
    const { curso_id, usuario_id } = req.body;

    // Aluno matricula a si mesmo; admin/instrutor pode matricular outro aluno
    const alunoId = req.usuario.perfil === 'aluno' ? req.usuario.id : (usuario_id || req.usuario.id);

    if (!curso_id) return res.status(400).json({ erro: 'curso_id é obrigatório.' });

    const [cursos] = await pool.query('SELECT status FROM cursos WHERE id = ?', [curso_id]);
    if (cursos.length === 0) return res.status(404).json({ erro: 'Curso não encontrado.' });
    if (cursos[0].status !== 'publicado' && req.usuario.perfil === 'aluno') {
      return res.status(403).json({ erro: 'Este curso ainda não está disponível para matrícula.' });
    }

    const [existentes] = await pool.query(
      'SELECT id, status FROM matriculas WHERE usuario_id = ? AND curso_id = ?',
      [alunoId, curso_id]
    );
    if (existentes.length > 0) {
      if (existentes[0].status === 'cancelada') {
        await pool.query('UPDATE matriculas SET status = "ativa", progresso_percentual = 0 WHERE id = ?', [existentes[0].id]);
        return res.json({ mensagem: 'Matrícula reativada com sucesso.' });
      }
      return res.status(409).json({ erro: 'Usuário já matriculado neste curso.' });
    }

    const [resultado] = await pool.query(
      'INSERT INTO matriculas (usuario_id, curso_id) VALUES (?, ?)',
      [alunoId, curso_id]
    );

    res.status(201).json({ id: resultado.insertId, mensagem: 'Matrícula realizada com sucesso.' });
  } catch (err) {
    next(err);
  }
}

async function cancelar(req, res, next) {
  try {
    await pool.query('UPDATE matriculas SET status = "cancelada" WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Matrícula cancelada com sucesso.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, matricular, cancelar };

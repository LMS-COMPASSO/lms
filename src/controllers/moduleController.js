const pool = require('../config/db');

async function listarPorCurso(req, res, next) {
  try {
    const [linhas] = await pool.query(
      'SELECT * FROM modulos WHERE curso_id = ? ORDER BY ordem ASC, id ASC',
      [req.params.cursoId]
    );
    res.json(linhas);
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const { cursoId } = req.params;
    const { titulo, descricao, ordem } = req.body;

    if (!titulo) return res.status(400).json({ erro: 'Título do módulo é obrigatório.' });

    const [resultado] = await pool.query(
      'INSERT INTO modulos (curso_id, titulo, descricao, ordem) VALUES (?, ?, ?, ?)',
      [cursoId, titulo, descricao || null, ordem || 0]
    );

    res.status(201).json({ id: resultado.insertId, titulo });
  } catch (err) {
    next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const { titulo, descricao, ordem } = req.body;
    const campos = [];
    const valores = [];
    if (titulo !== undefined) { campos.push('titulo = ?'); valores.push(titulo); }
    if (descricao !== undefined) { campos.push('descricao = ?'); valores.push(descricao); }
    if (ordem !== undefined) { campos.push('ordem = ?'); valores.push(ordem); }
    if (campos.length === 0) return res.status(400).json({ erro: 'Nenhum campo para atualizar.' });

    valores.push(req.params.id);
    await pool.query(`UPDATE modulos SET ${campos.join(', ')} WHERE id = ?`, valores);
    res.json({ mensagem: 'Módulo atualizado com sucesso.' });
  } catch (err) {
    next(err);
  }
}

async function excluir(req, res, next) {
  try {
    await pool.query('DELETE FROM modulos WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Módulo excluído com sucesso.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listarPorCurso, criar, atualizar, excluir };

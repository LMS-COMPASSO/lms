const pool = require('../config/db');

async function listarPorModulo(req, res, next) {
  try {
    const [linhas] = await pool.query(
      'SELECT * FROM aulas WHERE modulo_id = ? ORDER BY ordem ASC, id ASC',
      [req.params.moduloId]
    );
    res.json(linhas);
  } catch (err) {
    next(err);
  }
}

async function obter(req, res, next) {
  try {
    const [linhas] = await pool.query('SELECT * FROM aulas WHERE id = ?', [req.params.id]);
    if (linhas.length === 0) return res.status(404).json({ erro: 'Aula não encontrada.' });
    res.json(linhas[0]);
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const { moduloId } = req.params;
    const { titulo, tipo, conteudo, url_recurso, duracao_min, ordem } = req.body;

    if (!titulo) return res.status(400).json({ erro: 'Título da aula é obrigatório.' });

    const [resultado] = await pool.query(
      `INSERT INTO aulas (modulo_id, titulo, tipo, conteudo, url_recurso, duracao_min, ordem)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [moduloId, titulo, tipo || 'texto', conteudo || null, url_recurso || null, duracao_min || 0, ordem || 0]
    );

    res.status(201).json({ id: resultado.insertId, titulo });
  } catch (err) {
    next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const { titulo, tipo, conteudo, url_recurso, duracao_min, ordem } = req.body;
    const campos = [];
    const valores = [];
    const mapa = { titulo, tipo, conteudo, url_recurso, duracao_min, ordem };
    for (const [campo, valor] of Object.entries(mapa)) {
      if (valor !== undefined) { campos.push(`${campo} = ?`); valores.push(valor); }
    }
    if (campos.length === 0) return res.status(400).json({ erro: 'Nenhum campo para atualizar.' });

    valores.push(req.params.id);
    await pool.query(`UPDATE aulas SET ${campos.join(', ')} WHERE id = ?`, valores);
    res.json({ mensagem: 'Aula atualizada com sucesso.' });
  } catch (err) {
    next(err);
  }
}

async function excluir(req, res, next) {
  try {
    await pool.query('DELETE FROM aulas WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Aula excluída com sucesso.' });
  } catch (err) {
    next(err);
  }
}

/**
 * Aluno marca uma aula como concluída/pendente e o progresso da matrícula
 * é recalculado automaticamente.
 */
async function marcarProgresso(req, res, next) {
  try {
    const { id: aulaId } = req.params;
    const { concluida } = req.body;
    const usuarioId = req.usuario.id;

    const [aulas] = await pool.query(
      `SELECT a.id, m.curso_id FROM aulas a
       JOIN modulos m ON m.id = a.modulo_id
       WHERE a.id = ?`,
      [aulaId]
    );
    if (aulas.length === 0) return res.status(404).json({ erro: 'Aula não encontrada.' });

    const cursoId = aulas[0].curso_id;

    const [matriculas] = await pool.query(
      'SELECT id FROM matriculas WHERE usuario_id = ? AND curso_id = ? AND status != "cancelada"',
      [usuarioId, cursoId]
    );
    if (matriculas.length === 0) {
      return res.status(403).json({ erro: 'Você não está matriculado neste curso.' });
    }
    const matriculaId = matriculas[0].id;

    await pool.query(
      `INSERT INTO progresso_aulas (matricula_id, aula_id, concluida, data_conclusao)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE concluida = VALUES(concluida), data_conclusao = VALUES(data_conclusao)`,
      [matriculaId, aulaId, concluida ? 1 : 0, concluida ? new Date() : null]
    );

    await recalcularProgresso(matriculaId, cursoId);

    res.json({ mensagem: 'Progresso atualizado com sucesso.' });
  } catch (err) {
    next(err);
  }
}

async function recalcularProgresso(matriculaId, cursoId) {
  const [[{ totalAulas }]] = await pool.query(
    `SELECT COUNT(*) AS totalAulas FROM aulas a JOIN modulos m ON m.id = a.modulo_id WHERE m.curso_id = ?`,
    [cursoId]
  );
  const [[{ concluidas }]] = await pool.query(
    `SELECT COUNT(*) AS concluidas FROM progresso_aulas WHERE matricula_id = ? AND concluida = 1`,
    [matriculaId]
  );

  const percentual = totalAulas > 0 ? Math.round((concluidas / totalAulas) * 10000) / 100 : 0;
  const concluido = totalAulas > 0 && concluidas >= totalAulas;

  await pool.query(
    `UPDATE matriculas SET progresso_percentual = ?, status = ?, data_conclusao = ?
     WHERE id = ?`,
    [
      percentual,
      concluido ? 'concluida' : 'ativa',
      concluido ? new Date() : null,
      matriculaId,
    ]
  );
}

module.exports = { listarPorModulo, obter, criar, atualizar, excluir, marcarProgresso, recalcularProgresso };

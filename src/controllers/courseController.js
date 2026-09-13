const pool = require('../config/db');

const EIXOS_BNCC = ['Pensamento Computacional', 'Mundo Digital', 'Cultura Digital'];

async function listar(req, res, next) {
  try {
    const { status, eixo_bncc, ano_escolar, instrutor_id, busca } = req.query;
    let sql = `
      SELECT c.*, u.nome AS instrutor_nome,
        (SELECT COUNT(*) FROM matriculas m WHERE m.curso_id = c.id AND m.status IN ('ativa','concluida')) AS total_matriculados
      FROM cursos c
      JOIN usuarios u ON u.id = c.instrutor_id
      WHERE 1=1
    `;
    const params = [];

    // Alunos só podem ver cursos publicados
    if (req.usuario.perfil === 'aluno') {
      sql += ' AND c.status = "publicado"';
    } else if (status) {
      sql += ' AND c.status = ?';
      params.push(status);
    }

    // Instrutor só vê os próprios cursos (a menos que seja admin)
    if (req.usuario.perfil === 'instrutor') {
      sql += ' AND c.instrutor_id = ?';
      params.push(req.usuario.id);
    } else if (instrutor_id) {
      sql += ' AND c.instrutor_id = ?';
      params.push(instrutor_id);
    }

    if (eixo_bncc) { sql += ' AND c.eixo_bncc = ?'; params.push(eixo_bncc); }
    if (ano_escolar) { sql += ' AND c.ano_escolar = ?'; params.push(ano_escolar); }
    if (busca) { sql += ' AND c.titulo LIKE ?'; params.push(`%${busca}%`); }

    sql += ' ORDER BY c.criado_em DESC';

    const [linhas] = await pool.query(sql, params);
    res.json(linhas);
  } catch (err) {
    next(err);
  }
}

async function obter(req, res, next) {
  try {
    const [cursos] = await pool.query(
      `SELECT c.*, u.nome AS instrutor_nome FROM cursos c
       JOIN usuarios u ON u.id = c.instrutor_id WHERE c.id = ?`,
      [req.params.id]
    );
    if (cursos.length === 0) return res.status(404).json({ erro: 'Curso não encontrado.' });

    const curso = cursos[0];

    const [modulos] = await pool.query(
      'SELECT * FROM modulos WHERE curso_id = ? ORDER BY ordem ASC, id ASC',
      [curso.id]
    );

    for (const modulo of modulos) {
      const [aulas] = await pool.query(
        'SELECT id, titulo, tipo, duracao_min, ordem FROM aulas WHERE modulo_id = ? ORDER BY ordem ASC, id ASC',
        [modulo.id]
      );
      const [avaliacoes] = await pool.query(
        'SELECT id, titulo, nota_minima, tentativas_permitidas FROM avaliacoes WHERE modulo_id = ?',
        [modulo.id]
      );
      modulo.aulas = aulas;
      modulo.avaliacoes = avaliacoes;
    }

    curso.modulos = modulos;
    res.json(curso);
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const { titulo, descricao, eixo_bncc, ano_escolar, carga_horaria, capa_url } = req.body;

    if (!titulo || !eixo_bncc || !ano_escolar) {
      return res.status(400).json({ erro: 'Título, eixo BNCC e ano escolar são obrigatórios.' });
    }
    if (!EIXOS_BNCC.includes(eixo_bncc)) {
      return res.status(400).json({ erro: `Eixo BNCC inválido. Use um de: ${EIXOS_BNCC.join(', ')}` });
    }

    // Instrutor sempre cria curso vinculado a si mesmo; admin pode especificar
    const instrutor_id = req.usuario.perfil === 'administrador' && req.body.instrutor_id
      ? req.body.instrutor_id
      : req.usuario.id;

    const [resultado] = await pool.query(
      `INSERT INTO cursos (titulo, descricao, eixo_bncc, ano_escolar, carga_horaria, capa_url, instrutor_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'rascunho')`,
      [titulo, descricao || null, eixo_bncc, ano_escolar, carga_horaria || 0, capa_url || null, instrutor_id]
    );

    res.status(201).json({ id: resultado.insertId, titulo, status: 'rascunho' });
  } catch (err) {
    next(err);
  }
}

async function verificarPropriedade(req, cursoId) {
  if (req.usuario.perfil === 'administrador') return true;
  const [linhas] = await pool.query('SELECT instrutor_id FROM cursos WHERE id = ?', [cursoId]);
  if (linhas.length === 0) return false;
  return linhas[0].instrutor_id === req.usuario.id;
}

async function atualizar(req, res, next) {
  try {
    const { id } = req.params;
    const autorizado = await verificarPropriedade(req, id);
    if (!autorizado) return res.status(403).json({ erro: 'Você não tem permissão para editar este curso.' });

    const { titulo, descricao, eixo_bncc, ano_escolar, carga_horaria, capa_url } = req.body;

    if (eixo_bncc && !EIXOS_BNCC.includes(eixo_bncc)) {
      return res.status(400).json({ erro: `Eixo BNCC inválido. Use um de: ${EIXOS_BNCC.join(', ')}` });
    }

    const campos = [];
    const valores = [];
    const mapa = { titulo, descricao, eixo_bncc, ano_escolar, carga_horaria, capa_url };
    for (const [campo, valor] of Object.entries(mapa)) {
      if (valor !== undefined) { campos.push(`${campo} = ?`); valores.push(valor); }
    }
    if (campos.length === 0) return res.status(400).json({ erro: 'Nenhum campo para atualizar.' });

    valores.push(id);
    await pool.query(`UPDATE cursos SET ${campos.join(', ')} WHERE id = ?`, valores);

    res.json({ mensagem: 'Curso atualizado com sucesso.' });
  } catch (err) {
    next(err);
  }
}

async function alterarStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['rascunho', 'publicado'].includes(status)) {
      return res.status(400).json({ erro: 'Status inválido. Use "rascunho" ou "publicado".' });
    }

    const autorizado = await verificarPropriedade(req, id);
    if (!autorizado) return res.status(403).json({ erro: 'Você não tem permissão para alterar este curso.' });

    await pool.query('UPDATE cursos SET status = ? WHERE id = ?', [status, id]);
    res.json({ mensagem: `Curso marcado como "${status}".` });
  } catch (err) {
    next(err);
  }
}

async function excluir(req, res, next) {
  try {
    const { id } = req.params;
    const autorizado = await verificarPropriedade(req, id);
    if (!autorizado) return res.status(403).json({ erro: 'Você não tem permissão para excluir este curso.' });

    await pool.query('DELETE FROM cursos WHERE id = ?', [id]);
    res.json({ mensagem: 'Curso excluído com sucesso.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obter, criar, atualizar, alterarStatus, excluir, EIXOS_BNCC };

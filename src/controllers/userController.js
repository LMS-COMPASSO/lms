const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function listar(req, res, next) {
  try {
    const { perfil, busca, ativo } = req.query;
    let sql = `SELECT id, nome, email, perfil, ativo, criado_em FROM usuarios WHERE 1=1`;
    const params = [];

    if (perfil) {
      sql += ' AND perfil = ?';
      params.push(perfil);
    }
    if (ativo !== undefined) {
      sql += ' AND ativo = ?';
      params.push(ativo === 'true' ? 1 : 0);
    }
    if (busca) {
      sql += ' AND (nome LIKE ? OR email LIKE ?)';
      params.push(`%${busca}%`, `%${busca}%`);
    }
    sql += ' ORDER BY criado_em DESC';

    const [linhas] = await pool.query(sql, params);
    res.json(linhas);
  } catch (err) {
    next(err);
  }
}

async function obter(req, res, next) {
  try {
    const [linhas] = await pool.query(
      'SELECT id, nome, email, perfil, ativo, avatar_url, criado_em FROM usuarios WHERE id = ?',
      [req.params.id]
    );
    if (linhas.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.json(linhas[0]);
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const { nome, email, senha, perfil } = req.body;

    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({ erro: 'Nome, email, senha e perfil são obrigatórios.' });
    }
    if (!['administrador', 'instrutor', 'aluno'].includes(perfil)) {
      return res.status(400).json({ erro: 'Perfil inválido.' });
    }

    const [existentes] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existentes.length > 0) {
      return res.status(409).json({ erro: 'Já existe um usuário com este email.' });
    }

    const senha_hash = await bcrypt.hash(senha, 10);
    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)',
      [nome, email, senha_hash, perfil]
    );

    res.status(201).json({ id: resultado.insertId, nome, email, perfil });
  } catch (err) {
    next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const { nome, email, perfil, ativo } = req.body;
    const { id } = req.params;

    const campos = [];
    const valores = [];

    if (nome !== undefined) { campos.push('nome = ?'); valores.push(nome); }
    if (email !== undefined) { campos.push('email = ?'); valores.push(email); }
    if (perfil !== undefined) {
      if (!['administrador', 'instrutor', 'aluno'].includes(perfil)) {
        return res.status(400).json({ erro: 'Perfil inválido.' });
      }
      campos.push('perfil = ?'); valores.push(perfil);
    }
    if (ativo !== undefined) { campos.push('ativo = ?'); valores.push(ativo ? 1 : 0); }

    if (campos.length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar.' });
    }

    valores.push(id);
    await pool.query(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`, valores);

    res.json({ mensagem: 'Usuário atualizado com sucesso.' });
  } catch (err) {
    next(err);
  }
}

async function redefinirSenha(req, res, next) {
  try {
    const { novaSenha } = req.body;
    if (!novaSenha || novaSenha.length < 6) {
      return res.status(400).json({ erro: 'A nova senha deve ter ao menos 6 caracteres.' });
    }
    const senha_hash = await bcrypt.hash(novaSenha, 10);
    await pool.query('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [senha_hash, req.params.id]);
    res.json({ mensagem: 'Senha redefinida com sucesso.' });
  } catch (err) {
    next(err);
  }
}

async function excluir(req, res, next) {
  try {
    // Exclusão lógica (soft delete) para preservar histórico de matrículas/certificados
    await pool.query('UPDATE usuarios SET ativo = 0 WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Usuário desativado com sucesso.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obter, criar, atualizar, redefinirSenha, excluir };

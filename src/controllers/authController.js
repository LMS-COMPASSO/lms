const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { gerarToken } = require('../utils/jwt');

/**
 * Registro público — sempre cria o usuário como "aluno".
 * Administradores/instrutores são criados via userController (rota protegida).
 */
async function registrar(req, res, next) {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    }
    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter ao menos 6 caracteres.' });
    }

    const [existentes] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existentes.length > 0) {
      return res.status(409).json({ erro: 'Já existe um usuário cadastrado com este email.' });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const [resultado] = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, 'aluno')`,
      [nome, email, senha_hash]
    );

    const usuario = {
      id: resultado.insertId,
      nome,
      email,
      perfil: 'aluno',
    };

    const token = gerarToken(usuario);

    res.status(201).json({ mensagem: 'Cadastro realizado com sucesso.', usuario, token });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const [linhas] = await pool.query(
      'SELECT id, nome, email, senha_hash, perfil, ativo FROM usuarios WHERE email = ?',
      [email]
    );

    if (linhas.length === 0) {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }

    const usuarioDb = linhas[0];

    if (!usuarioDb.ativo) {
      return res.status(403).json({ erro: 'Este usuário está desativado. Contate o administrador.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuarioDb.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }

    const usuario = {
      id: usuarioDb.id,
      nome: usuarioDb.nome,
      email: usuarioDb.email,
      perfil: usuarioDb.perfil,
    };

    const token = gerarToken(usuario);

    res.json({ mensagem: 'Login realizado com sucesso.', usuario, token });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const [linhas] = await pool.query(
      'SELECT id, nome, email, perfil, avatar_url, criado_em FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );
    if (linhas.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.json(linhas[0]);
  } catch (err) {
    next(err);
  }
}

async function alterarSenha(req, res, next) {
  try {
    const { senhaAtual, novaSenha } = req.body;
    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ erro: 'Informe a senha atual e a nova senha.' });
    }
    if (novaSenha.length < 6) {
      return res.status(400).json({ erro: 'A nova senha deve ter ao menos 6 caracteres.' });
    }

    const [linhas] = await pool.query('SELECT senha_hash FROM usuarios WHERE id = ?', [req.usuario.id]);
    if (linhas.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const senhaValida = await bcrypt.compare(senhaAtual, linhas[0].senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha atual incorreta.' });
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    await pool.query('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [novaSenhaHash, req.usuario.id]);

    res.json({ mensagem: 'Senha alterada com sucesso.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { registrar, login, me, alterarSenha };

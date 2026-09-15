/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - ROTAS DE AUTENTICAÇÃO E PERFIL (AUTH)
 * ============================================================================
 * Gerencia o ciclo de vida da conta do usuário:
 * - Cadastro inicial de alunos (/api/auth/registrar)
 * - Login e emissão de token JWT (/api/auth/login)
 * - Consulta de dados do usuário autenticado (/api/auth/me)
 * - Alteração de senha pelo próprio usuário (/api/auth/alterar-senha)
 * ============================================================================
 */

import { sha256Hex, signJwt } from '../crypto_seguranca.js';
import {
  jsonResponse,
  jsonErro,
  readJsonBody,
  getUserByEmail,
  getUserProfile,
  authorizeUser,
} from '../helpers_utilitarios.js';

/**
 * Cadastra um novo aluno no sistema.
 * Por padrão de segurança, novos cadastros externos sempre recebem perfil 'aluno'.
 */
export async function registrar(request, env, db) {
  const body = await readJsonBody(request);
  const nome = String(body.nome || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const senha = String(body.senha || '');

  if (!nome || !email || !senha) {
    return jsonErro('Nome, email e senha são obrigatórios.', 400);
  }
  if (senha.length < 6) {
    return jsonErro('A senha deve ter ao menos 6 caracteres.', 400);
  }

  const usuarioExistente = await getUserByEmail(db, email);
  if (usuarioExistente) {
    return jsonErro('Já existe um usuário cadastrado com este email.', 409);
  }

  const senhaHash = await sha256Hex(senha);
  const resultado = await db.prepare(
    "INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo) VALUES (?, ?, ?, 'aluno', 1)",
  ).bind(nome, email, senhaHash).run();

  const usuario = {
    id: resultado.meta.last_row_id,
    nome,
    email,
    perfil: 'aluno',
  };

  const token = await signJwt(usuario, env.JWT_SECRET || 'dev-secret-change-me');
  return jsonResponse({ mensagem: 'Cadastro realizado com sucesso.', usuario, token }, 201);
}

/**
 * Realiza o login com email e senha, conferindo o hash criptográfico.
 * Retorna um token JWT para autorizar as chamadas subsequentes.
 */
export async function login(request, env, db) {
  const body = await readJsonBody(request);
  const email = String(body.email || '').trim().toLowerCase();
  const senha = String(body.senha || '');

  if (!email || !senha) {
    return jsonErro('Email e senha são obrigatórios.', 400);
  }

  const usuario = await getUserByEmail(db, email);
  if (!usuario) {
    return jsonErro('Email ou senha inválidos.', 401);
  }

  if (!usuario.ativo) {
    return jsonErro('Este usuário está desativado. Contate a administração.', 403);
  }

  const senhaHash = await sha256Hex(senha);
  if (usuario.senha_hash !== senhaHash) {
    return jsonErro('Email ou senha inválidos.', 401);
  }

  const dadosSessao = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
  };

  const token = await signJwt(dadosSessao, env.JWT_SECRET || 'dev-secret-change-me');
  return jsonResponse({ mensagem: 'Login realizado com sucesso.', usuario: dadosSessao, token });
}

/**
 * Retorna o perfil completo do usuário atualmente conectado.
 */
export async function obterMeuPerfil(request, env, db) {
  const { user } = await authorizeUser(request, env, db);
  const perfil = await getUserProfile(db, user.id);
  return jsonResponse(perfil);
}

/**
 * Permite ao usuário alterar sua própria senha, validando a senha atual antes de salvar a nova.
 */
export async function alterarSenha(request, env, db) {
  const { user } = await authorizeUser(request, env, db);
  const body = await readJsonBody(request);
  const senhaAtual = String(body.senhaAtual || '');
  const novaSenha = String(body.novaSenha || '');

  if (!senhaAtual || !novaSenha) {
    return jsonErro('Informe a senha atual e a nova senha.', 400);
  }
  if (novaSenha.length < 6) {
    return jsonErro('A nova senha deve ter ao menos 6 caracteres.', 400);
  }

  const usuarioBanco = await db.prepare('SELECT id, senha_hash FROM usuarios WHERE id = ?').bind(user.id).first();
  if (!usuarioBanco) {
    return jsonErro('Usuário não encontrado.', 404);
  }

  const atualHash = await sha256Hex(senhaAtual);
  if (usuarioBanco.senha_hash !== atualHash) {
    return jsonErro('Senha atual incorreta.', 401);
  }

  const novaHash = await sha256Hex(novaSenha);
  await db.prepare(
    'UPDATE usuarios SET senha_hash = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?',
  ).bind(novaHash, user.id).run();

  return jsonResponse({ mensagem: 'Senha alterada com sucesso.' });
}

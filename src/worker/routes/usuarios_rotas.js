/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - ROTAS DE GESTÃO DE USUÁRIOS (USERS)
 * ============================================================================
 * Recursos administrativos para gestão de contas da rede de ensino:
 * - Listar usuários com filtros por perfil, status e busca (/api/usuarios)
 * - Consultar perfil de um usuário específico (/api/usuarios/:id)
 * - Criar novo usuário com perfil definido (/api/usuarios)
 * - Atualizar dados cadastrais (/api/usuarios/:id)
 * - Desativação lógica do usuário (/api/usuarios/:id)
 * - Redefinição de senha por administrador (/api/usuarios/:id/redefinir-senha)
 * ============================================================================
 */

import { sha256Hex } from '../crypto_seguranca.js';
import {
  jsonResponse,
  jsonErro,
  readJsonBody,
  queryAll,
  getUserByEmail,
  getUserProfile,
  authorizeUser,
  exigirPerfil,
} from '../helpers_utilitarios.js';

/**
 * Lista os usuários cadastrados na plataforma.
 * Exclusivo para administradores.
 */
export async function listarUsuarios(request, env, db, url) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador']);

  const perfil = url.searchParams.get('perfil');
  const busca = url.searchParams.get('busca');
  const ativo = url.searchParams.get('ativo');

  let sql = 'SELECT id, nome, email, perfil, ativo, criado_em FROM usuarios WHERE 1 = 1';
  const params = [];

  if (perfil) {
    sql += ' AND perfil = ?';
    params.push(perfil);
  }
  if (ativo !== null && ativo !== undefined && ativo !== '') {
    sql += ' AND ativo = ?';
    params.push(ativo === 'true' || ativo === '1' ? 1 : 0);
  }
  if (busca) {
    sql += ' AND (nome LIKE ? OR email LIKE ?)';
    params.push(`%${busca}%`, `%${busca}%`);
  }

  sql += ' ORDER BY criado_em DESC';

  const usuarios = await queryAll(db, sql, params);
  return jsonResponse(usuarios);
}

/**
 * Consulta os dados de um usuário pelo seu ID.
 * Permitido apenas ao próprio usuário ou a um administrador.
 */
export async function obterUsuarioPorId(request, env, db, targetId) {
  const { payload } = await authorizeUser(request, env, db);
  const id = Number(targetId);

  if (payload.perfil !== 'administrador' && payload.id !== id) {
    return jsonErro('Acesso negado.', 403);
  }

  const usuario = await getUserProfile(db, id);
  if (!usuario) {
    return jsonErro('Usuário não encontrado.', 404);
  }
  return jsonResponse(usuario);
}

/**
 * Cadastra um novo usuário com um perfil específico (administrador, instrutor ou aluno).
 */
export async function criarUsuario(request, env, db) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador']);

  const body = await readJsonBody(request);
  const nome = String(body.nome || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const senha = String(body.senha || '');
  const perfil = String(body.perfil || 'aluno');

  if (!nome || !email || !senha || !['administrador', 'instrutor', 'aluno'].includes(perfil)) {
    return jsonErro('Nome, email, senha e perfil válido são obrigatórios.', 400);
  }

  const usuarioExistente = await getUserByEmail(db, email);
  if (usuarioExistente) {
    return jsonErro('Já existe um usuário com este email.', 409);
  }

  const senhaHash = await sha256Hex(senha);
  const resultado = await db.prepare(
    'INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo) VALUES (?, ?, ?, ?, 1)',
  ).bind(nome, email, senhaHash, perfil).run();

  return jsonResponse({
    id: resultado.meta.last_row_id,
    nome,
    email,
    perfil,
  }, 201);
}

/**
 * Atualiza o nome, email, perfil ou status de ativação de um usuário.
 */
export async function atualizarUsuario(request, env, db, targetId) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador']);

  const id = Number(targetId);
  const body = await readJsonBody(request);
  const campos = [];
  const params = [];

  if (body.nome !== undefined) { campos.push('nome = ?'); params.push(String(body.nome)); }
  if (body.email !== undefined) { campos.push('email = ?'); params.push(String(body.email).toLowerCase()); }
  if (body.perfil !== undefined) { campos.push('perfil = ?'); params.push(String(body.perfil)); }
  if (body.ativo !== undefined) { campos.push('ativo = ?'); params.push(body.ativo ? 1 : 0); }

  if (campos.length === 0) {
    return jsonErro('Nenhum campo para atualizar.', 400);
  }

  campos.push('atualizado_em = CURRENT_TIMESTAMP');
  params.push(id);

  await db.prepare(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`).bind(...params).run();
  return jsonResponse({ mensagem: 'Usuário atualizado com sucesso.' });
}

/**
 * Desativação lógica do usuário (mantém o histórico escolar sem permitir novos logins).
 */
export async function desativarUsuario(request, env, db, targetId) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador']);

  const id = Number(targetId);
  await db.prepare('UPDATE usuarios SET ativo = 0, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?').bind(id).run();
  return jsonResponse({ mensagem: 'Usuário desativado com sucesso.' });
}

/**
 * Redefine a senha de um usuário diretamente pelo administrador da escola.
 */
export async function redefinirSenhaUsuario(request, env, db, targetId) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador']);

  const id = Number(targetId);
  const body = await readJsonBody(request);
  const novaSenha = String(body.novaSenha || '');

  if (!novaSenha || novaSenha.length < 6) {
    return jsonErro('A nova senha deve ter ao menos 6 caracteres.', 400);
  }

  const novaHash = await sha256Hex(novaSenha);
  await db.prepare(
    'UPDATE usuarios SET senha_hash = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?',
  ).bind(novaHash, id).run();

  return jsonResponse({ mensagem: 'Senha redefinida com sucesso pelo administrador.' });
}

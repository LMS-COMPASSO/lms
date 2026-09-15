/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - MÓDULO DE FUNÇÕES AUXILIARES (HELPERS)
 * ============================================================================
 * Este arquivo centraliza funções utilitárias que são reutilizadas em várias
 * rotas da aplicação, incluindo:
 * 1. Respostas HTTP padronizadas em JSON com suporte a CORS.
 * 2. Leitura segura do corpo (body) de requisições.
 * 3. Consultas simplificadas ao banco de dados Cloudflare D1.
 * 4. Autenticação e verificação de perfil do usuário (RBAC).
 * ============================================================================
 */

import { sha256Hex, verifyJwt } from './crypto.mjs';

/**
 * Cabeçalhos padrão para permitir que qualquer navegador acesse a API (CORS).
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Retorna uma resposta HTTP no formato JSON com cabeçalhos CORS inclusos.
 *
 * @param {any} dados - Objeto ou lista que será transformado em texto JSON.
 * @param {number} status - Código de status HTTP (ex: 200, 201, 400, 404). Padrão: 200.
 * @returns {Response} Objeto Response da Web API.
 */
export function jsonResponse(dados, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
    },
  });
}

/**
 * Atalho conveniente para retornar uma mensagem de erro em formato JSON.
 *
 * @param {string} mensagem - Texto explicativo do erro.
 * @param {number} status - Código de status HTTP (ex: 400, 401, 403, 404, 500). Padrão: 400.
 * @returns {Response} Objeto Response com { erro: mensagem }.
 */
export function jsonErro(mensagem, status = 400) {
  return jsonResponse({ erro: mensagem }, status);
}

/**
 * Lê o corpo (JSON) de uma requisição de forma segura.
 * Se o corpo estiver vazio ou com sintaxe inválida, retorna um objeto vazio {} sem quebrar a aplicação.
 *
 * @param {Request} request - A requisição HTTP recebida.
 * @returns {Promise<object>} O objeto JavaScript parseado a partir do JSON.
 */
export async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

/**
 * Executa uma consulta SQL no Cloudflare D1 e retorna TODOS os registros encontrados como um array.
 *
 * @param {D1Database} db - Instância do banco D1.
 * @param {string} sql - Comando SQL (use '?' para parâmetros protegidos contra SQL Injection).
 * @param {Array} params - Lista de valores para substituir os '?' na consulta.
 * @returns {Promise<Array>} Lista de registros encontrados (ou lista vazia).
 */
export async function queryAll(db, sql, params = []) {
  const statement = db.prepare(sql);
  const bound = params.length > 0 ? statement.bind(...params) : statement;
  const resultado = await bound.all();
  return resultado.results || [];
}

/**
 * Executa uma consulta SQL no Cloudflare D1 e retorna apenas o PRIMEIRO registro encontrado (ou null).
 *
 * @param {D1Database} db - Instância do banco D1.
 * @param {string} sql - Comando SQL com '?'.
 * @param {Array} params - Lista de parâmetros para a consulta.
 * @returns {Promise<object|null>} O primeiro registro encontrado ou null se não houver registros.
 */
export async function queryOne(db, sql, params = []) {
  const statement = db.prepare(sql);
  const bound = params.length > 0 ? statement.bind(...params) : statement;
  const resultado = await bound.first();
  return resultado || null;
}

/**
 * Extrai o token JWT presente no cabeçalho 'Authorization: Bearer <TOKEN>'.
 *
 * @param {Request} request - A requisição HTTP.
 * @returns {string|null} O token em formato texto ou null caso ausente.
 */
export function getAuthToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.replace('Bearer ', '').trim();
}

/**
 * Busca um usuário no banco pelo email.
 */
export async function getUserByEmail(db, email) {
  return queryOne(db, 'SELECT id, nome, email, senha_hash, perfil, ativo FROM usuarios WHERE email = ?', [email]);
}

/**
 * Busca os dados essenciais de um usuário pelo ID.
 */
export async function getUserById(db, id) {
  return queryOne(db, 'SELECT id, nome, email, perfil, avatar_url, ativo FROM usuarios WHERE id = ?', [id]);
}

/**
 * Busca o perfil completo de um usuário pelo ID (para visualização de conta).
 */
export async function getUserProfile(db, id) {
  return queryOne(db, 'SELECT id, nome, email, perfil, avatar_url, ativo, criado_em FROM usuarios WHERE id = ?', [id]);
}

/**
 * Valida o token JWT da requisição e carrega os dados do usuário autenticado no banco.
 * Lança um erro caso o token seja inválido, esteja expirado ou o usuário não exista.
 *
 * @param {Request} request - Requisição recebida.
 * @param {object} env - Variáveis de ambiente do Cloudflare Worker (onde fica JWT_SECRET).
 * @param {D1Database} db - Banco de dados D1.
 * @returns {Promise<{payload: object, user: object}>} Objeto com o payload do token e o usuário do banco.
 */
export async function authorizeUser(request, env, db) {
  const token = getAuthToken(request);
  if (!token) {
    throw new Error('Token de acesso não fornecido.');
  }

  const payload = await verifyJwt(token, env.JWT_SECRET || 'dev-secret-change-me');
  const user = await getUserById(db, payload.id);

  if (!user) {
    throw new Error('Usuário associado a este token não foi encontrado.');
  }
  if (!user.ativo) {
    throw new Error('Este usuário foi desativado pelo administrador.');
  }

  return { payload, user };
}

/**
 * Garante a existência do usuário administrador padrão do sistema ao iniciar o backend.
 * Caso o banco seja recém-criado, insere admin@lms-bncc.edu.br com senha Admin@12345.
 */
export async function ensureDefaultAdmin(db) {
  const existing = await queryOne(db, 'SELECT id FROM usuarios WHERE email = ?', ['admin@lms-bncc.edu.br']);
  if (!existing) {
    const senhaHash = await sha256Hex('Admin@12345');
    await db.prepare(
      "INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo) VALUES (?, ?, ?, 'administrador', 1)",
    ).bind('Administrador do Sistema', 'admin@lms-bncc.edu.br', senhaHash).run();
  }
}

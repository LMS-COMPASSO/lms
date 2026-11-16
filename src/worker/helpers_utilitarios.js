/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - MÓDULO DE FUNÇÕES AUXILIARES (HELPERS / UTILITÁRIOS)
 * ============================================================================
 * Este arquivo centraliza funções utilitárias que são reutilizadas em várias
 * rotas da aplicação, incluindo:
 * 1. Respostas HTTP padronizadas em JSON com suporte a CORS.
 * 2. Leitura segura do corpo (body) de requisições.
 * 3. Consultas simplificadas ao banco de dados Cloudflare D1.
 * 4. Autenticação e verificação de perfil do usuário (RBAC).
 * ============================================================================
 */

import { exigirSegredoJwt, hashSenha, verifyJwt } from './crypto_seguranca.js';

/**
 * Cabeçalhos padrão para permitir que qualquer navegador acesse a API (CORS).
 * MDN Web Security: Access-Control-Max-Age reduz requisições preflight desnecessárias.
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * Cabeçalhos de segurança recomendados pela MDN Web Security (Defense-in-Depth).
 * Protegem contra XSS, clickjacking, MIME-sniffing, vazamento de referrer e restringe APIs do navegador.
 */
export const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://cdn.jsdelivr.net https://accounts.google.com; worker-src 'self' blob:; frame-src 'self' https://accounts.google.com; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self' https:;",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
};

/**
 * Aplica os cabeçalhos de segurança recomendados pela MDN Web Security a uma resposta HTTP.
 *
 * @param {Response} response - Resposta HTTP original.
 * @returns {Response} Nova resposta com os cabeçalhos de segurança aplicados.
 */
export function aplicarCabecalhosSeguranca(response) {
  if (!response) return response;
  const status = response.status;
  // Respostas 204 No Content e 304 Not Modified não devem ter corpo
  const corpo = (status === 204 || status === 304) ? null : response.body;
  const novosHeaders = new Headers(response.headers);
  for (const [chave, valor] of Object.entries(SECURITY_HEADERS)) {
    if (!novosHeaders.has(chave)) {
      novosHeaders.set(chave, valor);
    }
  }
  return new Response(corpo, {
    status: response.status,
    statusText: response.statusText,
    headers: novosHeaders,
  });
}

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
      ...SECURITY_HEADERS,
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
 * Classe customizada para lançar erros com código de status HTTP correspondente.
 * Facilita o controle de fluxo e centraliza as respostas de erro no servidor.
 */
export class ErroHttp extends Error {
  constructor(mensagem, status = 400) {
    super(mensagem);
    this.status = status;
    this.name = 'ErroHttp';
  }
}

/**
 * Verifica se o usuário autenticado possui um dos perfis necessários para a operação.
 * Lança ErroHttp com status 403 (Acesso Proibido) caso não possua.
 *
 * @param {object} payload - Dados do usuário extraídos do token JWT.
 * @param {Array<string>} perfisPermitidos - Lista de papéis autorizados (ex: ['administrador', 'instrutor']).
 */
export function exigirPerfil(payload, perfisPermitidos = []) {
  if (!perfisPermitidos.includes(payload.perfil)) {
    throw new ErroHttp('Acesso negado. Perfil não autorizado para esta operação.', 403);
  }
}

/**
 * Valida o token JWT da requisição e carrega os dados do usuário autenticado no banco.
 * Lança ErroHttp caso o token seja inválido, esteja expirado ou o usuário não exista.
 *
 * @param {Request} request - Requisição recebida.
 * @param {object} env - Variáveis de ambiente do Cloudflare Worker (onde fica JWT_SECRET).
 * @param {D1Database} db - Banco de dados D1.
 * @returns {Promise<{payload: object, user: object}>} Objeto com o payload do token e o usuário do banco.
 */
export async function authorizeUser(request, env, db) {
  const token = getAuthToken(request);
  if (!token) {
    throw new ErroHttp('Token de acesso não fornecido.', 401);
  }

  // Fora do try/catch: segredo ausente é erro de configuração (500), não token inválido (401).
  const segredo = exigirSegredoJwt(env.JWT_SECRET);

  let payload;
  try {
    payload = await verifyJwt(token, segredo);
  } catch {
    throw new ErroHttp('Token inválido ou expirado.', 401);
  }

  const user = await getUserById(db, payload.id);
  if (!user) {
    throw new ErroHttp('Usuário associado a este token não foi encontrado.', 401);
  }
  if (!user.ativo) {
    throw new ErroHttp('Este usuário foi desativado pelo administrador.', 403);
  }

  return { payload, user };
}

/**
 * Tenta autenticar opcionalmente uma requisição sem lançar erro caso o token esteja ausente ou inválido.
 * Útil em rotas híbridas (públicas com dados extras para usuários autenticados).
 */
export async function obterPayloadOpcional(request, env, db) {
  try {
    if (!getAuthToken(request) || !env?.JWT_SECRET) {
      return null;
    }
    return await authorizeUser(request, env, db);
  } catch {
    return null;
  }
}

/**
 * Garante a existência do usuário administrador padrão do sistema ao iniciar o backend.
 * Caso o banco seja recém-criado, insere admin@lms-bncc.edu.br. A senha inicial vem do
 * Secret opcional ADMIN_INITIAL_PASSWORD; sem ele, usa Admin@12345 (apenas para demonstração,
 * deve ser alterada no primeiro acesso).
 *
 * @param {D1Database} db - Banco de dados D1.
 * @param {object} env - Variáveis de ambiente do Worker.
 */
export async function ensureDefaultAdmin(db, env = {}) {
  const existing = await queryOne(db, 'SELECT id FROM usuarios WHERE email = ?', ['admin@lms-bncc.edu.br']);
  if (!existing) {
    const senhaHash = await hashSenha(env.ADMIN_INITIAL_PASSWORD || 'Admin@12345');
    await db.prepare(
      "INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo) VALUES (?, ?, ?, 'administrador', 1)",
    ).bind('Administrador do Sistema', 'admin@lms-bncc.edu.br', senhaHash).run();
  }
}

const bancosComAdminVerificado = new WeakSet();

/**
 * Executa ensureDefaultAdmin no máximo uma vez por instância D1 neste isolate do Worker,
 * evitando consultas redundantes em todas as chamadas de API.
 */
export async function garantirAdminPadraoUmaVez(db, env = {}) {
  if (!db || bancosComAdminVerificado.has(db)) {
    return;
  }
  await ensureDefaultAdmin(db, env);
  bancosComAdminVerificado.add(db);
}

/**
 * Converte e valida um identificador numérico inteiro positivo de rota ou payload.
 */
export function parseIdPositivo(valor, nomeCampo = 'ID') {
  const texto = String(valor ?? '').trim();
  if (!/^\d+$/.test(texto)) {
    throw new ErroHttp(`${nomeCampo} inválido.`, 400);
  }
  const numero = Number(texto);
  if (!Number.isSafeInteger(numero) || numero <= 0) {
    throw new ErroHttp(`${nomeCampo} inválido.`, 400);
  }
  return numero;
}

/**
 * Escapa caracteres especiais de HTML para renderização segura em respostas SSR do Worker.
 */
export function escaparHtml(texto) {
  const mapa = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(texto ?? '').replace(/[&<>"']/g, (caractere) => mapa[caractere]);
}

/**
 * Formata uma célula CSV escapando aspas duplas e neutralizando CSV Formula Injection.
 */
export function escaparCelulaCsv(valor) {
  let texto = String(valor ?? '');
  if (/^[=+\-@\t\r]/.test(texto)) {
    texto = `'${texto}`;
  }
  return `"${texto.replaceAll('"', '""')}"`;
}

/**
 * Recalcula progresso percentual e status de conclusão da matrícula considerando
 * 100% das aulas concluídas e aprovação em todas as avaliações do curso (se houver).
 */
export async function recalcularConclusaoMatricula(db, matriculaId, cursoId) {
  const totalAulasRegistro = await queryOne(
    db,
    'SELECT COUNT(*) AS total FROM aulas a JOIN modulos m ON m.id = a.modulo_id WHERE m.curso_id = ?',
    [cursoId],
  );
  const concluidasRegistro = await queryOne(
    db,
    'SELECT COUNT(*) AS total FROM progresso_aulas WHERE matricula_id = ? AND concluida = 1',
    [matriculaId],
  );
  const totalAvaliacoesRegistro = await queryOne(
    db,
    'SELECT COUNT(*) AS total FROM avaliacoes av JOIN modulos m ON m.id = av.modulo_id WHERE m.curso_id = ?',
    [cursoId],
  );
  const avaliacoesAprovadasRegistro = await queryOne(
    db,
    'SELECT COUNT(DISTINCT avaliacao_id) AS total FROM tentativas_avaliacao WHERE matricula_id = ? AND aprovado = 1',
    [matriculaId],
  );

  const totalAulas = Number(totalAulasRegistro?.total || 0);
  const totalConcluidas = Number(concluidasRegistro?.total || 0);
  const totalAvaliacoes = Number(totalAvaliacoesRegistro?.total || 0);
  const totalAprovadas = Number(avaliacoesAprovadasRegistro?.total || 0);

  const percentual = totalAulas > 0 ? Math.round((totalConcluidas / totalAulas) * 10000) / 100 : 0;
  const aulasCompletas = totalAulas > 0 && totalConcluidas >= totalAulas;
  const avaliacoesCompletas = totalAvaliacoes === 0 || totalAprovadas >= totalAvaliacoes;
  const status = aulasCompletas && avaliacoesCompletas ? 'concluida' : 'ativa';

  await db.prepare(`
    UPDATE matriculas
    SET progresso_percentual = ?, status = ?, data_conclusao = ?
    WHERE id = ?
  `).bind(
    percentual,
    status,
    status === 'concluida' ? new Date().toISOString() : null,
    matriculaId,
  ).run();

  return { percentual, status, avaliacoesPendentes: Math.max(0, totalAvaliacoes - totalAprovadas) };
}

/**
 * Valida formato básico de endereço de email sem risco de backtracking linear.
 */
export function validarFormatoEmail(email) {
  if (typeof email !== 'string' || email.length < 3 || email.length > 254 || /\s/.test(email)) {
    return false;
  }
  const arroba = email.indexOf('@');
  if (arroba <= 0 || arroba !== email.lastIndexOf('@') || arroba === email.length - 1) {
    return false;
  }
  const dominio = email.slice(arroba + 1);
  const ponto = dominio.indexOf('.');
  return ponto > 0 && !dominio.startsWith('.') && !dominio.endsWith('.') && !dominio.includes('..');
}

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

import {
  base64UrlDecode,
  exigirSegredoJwt,
  hashSenha,
  signJwt,
  verificarSenha,
} from '../crypto_seguranca.js';
import {
  jsonResponse,
  jsonErro,
  readJsonBody,
  queryAll,
  queryOne,
  getUserByEmail,
  getUserProfile,
  authorizeUser,
  ErroHttp,
  CORS_HEADERS,
  validarFormatoEmail,
} from '../helpers_utilitarios.js';

/**
 * Hash PBKDF2 sintético utilizado para mitigar ataques de temporização (Timing Attacks / Enumeração de Usuários).
 * Mantém o tempo de processamento equivalente (~70ms) quando um usuário não existe.
 */
const DUMMY_PBKDF2_HASH = 'pbkdf2_sha256$100000$dHVtbXlzYWx0MTIzNDU2Nw$dHVtbXloYXNoMTIzNDU2Nzg5MDEyMzQ1Njc4OTA=';

/**
 * Rate limiting de tentativas de login em memória (MDN Web Security: Brute-Force & Credential Stuffing Protection).
 * Bloqueia um IP ou email após 5 tentativas incorretas consecutivas por 15 minutos.
 */
const tentativasFalhasLogin = new Map();
export const LIMITE_TENTATIVAS_FALHAS = 5;
export const JANELA_BLOQUEIO_MS = 15 * 60 * 1000; // 15 minutos
export const MAX_ENTRADAS_RATE_LIMIT = 5000;

const exportacoesLgpdPorUsuario = new Map();
export const LIMITE_EXPORTACOES_LGPD = 5;
export const JANELA_EXPORTACAO_LGPD_MS = 60 * 60 * 1000; // 1 hora

/**
 * Remove registros expirados de um Map de rate limiting e, se necessário, descarta
 * os mais antigos para impedir crescimento ilimitado de memória (memory leak / OOM em Workers).
 */
function podarMapaJanela(mapa, janelaMs, agora = Date.now()) {
  for (const [chave, reg] of mapa.entries()) {
    const bloqueioAtivo = reg.bloqueadoAte && agora < reg.bloqueadoAte;
    const inicioJanela = reg.primeiroErroEm ?? reg.inicioJanelaEm ?? 0;
    if (!bloqueioAtivo && agora - inicioJanela > janelaMs) {
      mapa.delete(chave);
    }
  }
  while (mapa.size >= MAX_ENTRADAS_RATE_LIMIT) {
    const chaveMaisAntiga = mapa.keys().next().value;
    if (chaveMaisAntiga === undefined) break;
    mapa.delete(chaveMaisAntiga);
  }
}

export function podarMapaRateLimit(agora = Date.now()) {
  podarMapaJanela(tentativasFalhasLogin, JANELA_BLOQUEIO_MS, agora);
}

export function resetarRateLimitExportacaoLgpd() {
  exportacoesLgpdPorUsuario.clear();
}

export function verificarERegistrarRateLimitExportacaoLgpd(usuarioId) {
  const agora = Date.now();
  const chave = String(usuarioId);
  if (exportacoesLgpdPorUsuario.size >= MAX_ENTRADAS_RATE_LIMIT) {
    podarMapaJanela(exportacoesLgpdPorUsuario, JANELA_EXPORTACAO_LGPD_MS, agora);
  }
  let reg = exportacoesLgpdPorUsuario.get(chave);
  if (!reg || agora - reg.inicioJanelaEm > JANELA_EXPORTACAO_LGPD_MS) {
    reg = { contagem: 0, inicioJanelaEm: agora };
  }
  if (reg.contagem >= LIMITE_EXPORTACOES_LGPD) {
    const segundosRestantes = Math.max(1, Math.ceil((reg.inicioJanelaEm + JANELA_EXPORTACAO_LGPD_MS - agora) / 1000));
    return { bloqueado: true, retryAfter: segundosRestantes };
  }
  reg.contagem += 1;
  exportacoesLgpdPorUsuario.set(chave, reg);
  return { bloqueado: false, retryAfter: 0 };
}

export function verificarRateLimitLogin(ip, email) {
  const agora = Date.now();
  for (const chave of [ip, email].filter(Boolean)) {
    const reg = tentativasFalhasLogin.get(chave);
    if (reg) {
      if (reg.bloqueadoAte && agora < reg.bloqueadoAte) {
        const segundosRestantes = Math.max(1, Math.ceil((reg.bloqueadoAte - agora) / 1000));
        return { bloqueado: true, retryAfter: segundosRestantes };
      }
      if (agora - reg.primeiroErroEm > JANELA_BLOQUEIO_MS) {
        tentativasFalhasLogin.delete(chave);
      }
    }
  }
  return { bloqueado: false, retryAfter: 0 };
}

export function registrarTentativaFalhaLogin(ip, email) {
  const agora = Date.now();
  if (tentativasFalhasLogin.size >= MAX_ENTRADAS_RATE_LIMIT) {
    podarMapaRateLimit(agora);
  }
  for (const chave of [ip, email].filter(Boolean)) {
    const reg = tentativasFalhasLogin.get(chave) || { contagem: 0, primeiroErroEm: agora, bloqueadoAte: 0 };
    if (agora - reg.primeiroErroEm > JANELA_BLOQUEIO_MS) {
      reg.contagem = 0;
      reg.primeiroErroEm = agora;
      reg.bloqueadoAte = 0;
    }
    reg.contagem += 1;
    if (reg.contagem >= LIMITE_TENTATIVAS_FALHAS) {
      reg.bloqueadoAte = agora + JANELA_BLOQUEIO_MS;
    }
    tentativasFalhasLogin.set(chave, reg);
  }
}

export function limparTentativasFalhasLogin(ip, email) {
  if (ip) tentativasFalhasLogin.delete(ip);
  if (email) tentativasFalhasLogin.delete(email);
}

export function resetarRateLimitLogin() {
  tentativasFalhasLogin.clear();
}

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
  if (!validarFormatoEmail(email)) {
    return jsonErro('Informe um endereço de email válido.', 400);
  }
  if (senha.length < 6) {
    return jsonErro('A senha deve ter ao menos 6 caracteres.', 400);
  }

  const usuarioExistente = await getUserByEmail(db, email);
  if (usuarioExistente) {
    return jsonErro('Já existe um usuário cadastrado com este email.', 409);
  }

  const segredo = exigirSegredoJwt(env.JWT_SECRET);
  const senhaHash = await hashSenha(senha);
  const resultado = await db.prepare(
    "INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo) VALUES (?, ?, ?, 'aluno', 1)",
  ).bind(nome, email, senhaHash).run();

  const usuario = {
    id: resultado.meta.last_row_id,
    nome,
    email,
    perfil: 'aluno',
  };

  const token = await signJwt(usuario, segredo);
  return jsonResponse({ mensagem: 'Cadastro realizado com sucesso.', usuario, token }, 201);
}

/**
 * Realiza o login com email e senha, conferindo o hash criptográfico.
 * Retorna um token JWT para autorizar as chamadas subsequentes.
 * Aplica proteção contra timing attacks e rate limiting de força bruta.
 */
export async function login(request, env, db) {
  const ip = request?.headers?.get?.('cf-connecting-ip')
    || request?.headers?.get?.('x-forwarded-for')?.split?.(',')?.[0]?.trim?.()
    || '127.0.0.1';

  const body = await readJsonBody(request);
  const email = String(body.email || '').trim().toLowerCase();
  const senha = String(body.senha || '');

  if (!email || !senha) {
    return jsonErro('Email e senha são obrigatórios.', 400);
  }

  // Verifica proteção contra ataques de força bruta (MDN Web Security)
  const statusRateLimit = verificarRateLimitLogin(ip, email);
  if (statusRateLimit.bloqueado) {
    return new Response(
      JSON.stringify({
        erro: 'Muitas tentativas incorretas de login. Por segurança, aguarde alguns minutos antes de tentar novamente.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Retry-After': String(statusRateLimit.retryAfter),
          ...CORS_HEADERS,
        },
      },
    );
  }

  const usuario = await getUserByEmail(db, email);
  let senhaValida = false;
  let precisaRehash = false;

  if (usuario) {
    if (!usuario.ativo) {
      registrarTentativaFalhaLogin(ip, email);
      return jsonErro('Este usuário está desativado. Contate a administração.', 403);
    }
    const conferencia = await verificarSenha(senha, usuario.senha_hash);
    senhaValida = conferencia.valido;
    precisaRehash = conferencia.precisaRehash;
  } else {
    // Mitigação de Timing Attack / Enumeração de Usuários (MDN Web Security):
    // Executa verificação PBKDF2 fictícia idêntica para manter tempo de resposta constante.
    await verificarSenha(senha, DUMMY_PBKDF2_HASH);
  }

  if (!usuario || !senhaValida) {
    registrarTentativaFalhaLogin(ip, email);
    return jsonErro('Email ou senha inválidos.', 401);
  }

  // Login bem-sucedido: limpa o contador de falhas
  limparTentativasFalhasLogin(ip, email);

  const segredo = exigirSegredoJwt(env.JWT_SECRET);

  // Migração transparente: contas com hash legado (SHA-256 sem salt) são regravadas em PBKDF2.
  if (precisaRehash) {
    await db.prepare(
      'UPDATE usuarios SET senha_hash = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?',
    ).bind(await hashSenha(senha), usuario.id).run();
  }

  const dadosSessao = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
  };

  const token = await signJwt(dadosSessao, segredo);
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

  const conferencia = await verificarSenha(senhaAtual, usuarioBanco.senha_hash);
  if (!conferencia.valido) {
    return jsonErro('Senha atual incorreta.', 401);
  }

  const novaHash = await hashSenha(novaSenha);
  await db.prepare(
    'UPDATE usuarios SET senha_hash = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?',
  ).bind(novaHash, user.id).run();

  return jsonResponse({ mensagem: 'Senha alterada com sucesso.' });
}

const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
let cacheJwksGoogle = { keys: [], expiraEm: 0 };

/**
 * Decodifica o cabeçalho ou payload Base64URL de um JWT.
 */
function decodificarSegmentoJwt(segmento) {
  if (typeof segmento !== 'string' || !segmento) return null;
  try {
    const bytes = base64UrlDecode(segmento);
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

/**
 * Decodifica o payload de um token JWT do Google (Google Identity Services).
 * Nota: não substitui a verificação criptográfica realizada por verificarTokenGoogle().
 */
export function decodificarTokenGoogle(credential) {
  if (typeof credential !== 'string') return null;
  const partes = credential.split('.');
  if (partes.length !== 3) return null;
  return decodificarSegmentoJwt(partes[1]);
}

async function obterChavesPublicasGoogle(env = {}, forcarAtualizacao = false) {
  if (env?.__GOOGLE_JWKS) {
    return Array.isArray(env.__GOOGLE_JWKS) ? env.__GOOGLE_JWKS : (env.__GOOGLE_JWKS.keys || []);
  }
  const agora = Date.now();
  if (!forcarAtualizacao && cacheJwksGoogle.keys.length > 0 && agora < cacheJwksGoogle.expiraEm) {
    return cacheJwksGoogle.keys;
  }
  const resposta = await fetch(GOOGLE_JWKS_URL);
  if (!resposta.ok) {
    throw new ErroHttp('Não foi possível consultar as chaves públicas do Google.', 503);
  }
  const cacheControl = resposta.headers.get('cache-control') || '';
  const matchMaxAge = cacheControl.match(/max-age=(\d+)/i);
  const ttlMs = matchMaxAge ? Number(matchMaxAge[1]) * 1000 : 3600 * 1000;
  const corpo = await resposta.json();
  const keys = Array.isArray(corpo?.keys) ? corpo.keys : [];
  cacheJwksGoogle = { keys, expiraEm: agora + Math.max(60_000, ttlMs) };
  return keys;
}

function validarClaimsTokenGoogle(claims, clientIdEsperado) {
  if (!['https://accounts.google.com', 'accounts.google.com'].includes(claims.iss)) {
    throw new ErroHttp('Emissor do token Google inválido.', 401);
  }
  if (claims.email_verified !== true || !claims.email) {
    throw new ErroHttp('A conta Google precisa possuir e-mail verificado.', 401);
  }
  const audValido = Array.isArray(claims.aud)
    ? claims.aud.includes(clientIdEsperado)
    : claims.aud === clientIdEsperado;
  if (!audValido) {
    throw new ErroHttp('Token do Google não autorizado para esta aplicação (Client ID incompatível).', 401);
  }
  if (typeof claims.exp !== 'number' || claims.exp * 1000 < Date.now() - 300_000) {
    throw new ErroHttp('Token do Google expirado. Faça login novamente.', 401);
  }
}

async function buscarChaveJwkGoogle(kid, env) {
  let chaves = await obterChavesPublicasGoogle(env, false);
  let jwk = chaves.find((k) => k.kid === kid);
  if (!jwk && !env?.__GOOGLE_JWKS) {
    chaves = await obterChavesPublicasGoogle(env, true);
    jwk = chaves.find((k) => k.kid === kid);
  }
  if (!jwk) {
    throw new ErroHttp('Chave pública de assinatura do Google não encontrada.', 401);
  }
  return jwk;
}

/**
 * Verifica criptograficamente um ID Token RS256 do Google Identity Services (JWKS, iss, aud, exp e email_verified).
 */
export async function verificarTokenGoogle(credential, clientIdEsperado, env = {}) {
  if (typeof credential !== 'string') {
    throw new ErroHttp('Credencial do Google inválida ou malformada.', 400);
  }
  const partes = credential.split('.');
  if (partes.length !== 3 || !partes[0] || !partes[1] || !partes[2]) {
    throw new ErroHttp('Credencial do Google inválida ou malformada.', 400);
  }

  const header = decodificarSegmentoJwt(partes[0]);
  const claims = decodificarSegmentoJwt(partes[1]);
  if (!header || !claims) {
    throw new ErroHttp('Credencial do Google inválida ou malformada.', 400);
  }
  if (header.alg !== 'RS256' || !header.kid) {
    throw new ErroHttp('Cabeçalho do token Google inválido.', 401);
  }

  validarClaimsTokenGoogle(claims, clientIdEsperado);
  const jwk = await buscarChaveJwkGoogle(header.kid, env);

  let assinaturaBytes;
  try {
    assinaturaBytes = base64UrlDecode(partes[2]);
  } catch (erroBase64) {
    console.warn('Falha ao decodificar assinatura Google Base64URL:', erroBase64?.message || erroBase64);
    throw new ErroHttp('Assinatura do token Google inválida.', 401);
  }

  const chavePublica = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const entrada = new TextEncoder().encode(`${partes[0]}.${partes[1]}`);
  const assinaturaValida = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', chavePublica, assinaturaBytes, entrada);
  if (!assinaturaValida) {
    throw new ErroHttp('Assinatura do token Google inválida.', 401);
  }

  return claims;
}

/**
 * Identifica se um domínio de email pertence a uma rede acadêmica, escolar ou institucional.
 */
export function verificarDominioAcademico(email = '', hd = '') {
  const emailLimpo = String(email || '').toLowerCase().trim();
  const hdLimpo = String(hd || '').toLowerCase().trim();
  const dominio = hdLimpo || (emailLimpo.includes('@') ? emailLimpo.split('@')[1] : '');

  if (!dominio) return false;

  const sufixosAcademicos = [
    '.edu',
    '.edu.br',
    '.gsuite.edu.br',
    '.escola.gov.br',
    '.educacao.sp.gov.br',
    '.educacao.mg.gov.br',
    '.educacao.rj.gov.br',
    '.educacao.ba.gov.br',
    '.educacao.rs.gov.br',
    '.educacao.pr.gov.br',
    '.educacao.sc.gov.br',
    '.educacao.ce.gov.br',
    '.educacao.pe.gov.br',
    '.seduc.ce.gov.br',
    '.seduc.go.gov.br',
    '.seduc.mt.gov.br',
    '.seduc.pa.gov.br',
    '.seduc.ro.gov.br',
    '.semed.',
  ];

  for (const sufixo of sufixosAcademicos) {
    if (dominio.endsWith(sufixo) || dominio.includes(sufixo)) return true;
  }

  const termosAcademicos = ['escola', 'colegio', 'faculdade', 'universidade', 'academico', 'aluno', 'prof', 'docente', 'educacao', 'ensino', 'cefet', 'ifs'];
  for (const termo of termosAcademicos) {
    if (dominio.includes(termo) || emailLimpo.split('@')[0].includes(termo)) return true;
  }

  if (hdLimpo && hdLimpo !== 'gmail.com') return true;

  return false;
}

/**
 * Deduz o perfil escolar do usuário (aluno ou professor/instrutor) apenas a partir do email verificado.
 */
export function detectarPerfilAcademico(email = '') {
  const emailLimpo = String(email || '').toLowerCase();
  const parteLocal = emailLimpo.split('@')[0] || '';

  if (
    parteLocal.startsWith('prof.') ||
    parteLocal.startsWith('prof_') ||
    parteLocal.startsWith('professor') ||
    parteLocal.includes('docente') ||
    parteLocal.includes('coordenador') ||
    parteLocal.includes('educador')
  ) {
    return 'instrutor';
  }

  return 'aluno';
}

/**
 * Retorna configurações públicas de autenticação (ex.: Client ID do Google).
 * Não expõe segredos nem dados confidenciais.
 */
export function obterConfigAuth(request, env) {
  const googleClientId = String(env?.GOOGLE_CLIENT_ID || '').trim();
  const googleSimuladoAtivo = !googleClientId && String(env?.ALLOW_UNVERIFIED_GOOGLE_DEV || '') === 'true';
  return jsonResponse({
    googleClientId,
    googleConfigurado: Boolean(googleClientId),
    googleSimuladoAtivo,
  });
}

async function trocarAuthCodeGooglePorToken(body, googleClientIdEsperado, env, request) {
  if (!body.code || !googleClientIdEsperado || !env?.GOOGLE_CLIENT_SECRET) return;
  try {
    const redirectUri = body.redirect_uri || (request?.url ? new URL(request.url).origin + '/login.html' : '');
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: body.code,
        client_id: googleClientIdEsperado,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    if (tokenRes.ok) {
      const tokenData = await tokenRes.json();
      if (tokenData.id_token) {
        body.credential = tokenData.id_token;
      }
    }
  } catch (err) {
    console.warn('Erro ao trocar authorization code com Google:', err);
  }
}

async function extrairPerfilGoogleDeCredencial(body, googleClientIdEsperado, permitirModoSimulado, env) {
  if (body.credential) {
    const claims = googleClientIdEsperado
      ? await verificarTokenGoogle(body.credential, googleClientIdEsperado, env)
      : decodificarTokenGoogle(body.credential);
    if (!claims) {
      return { erro: jsonErro('Credencial do Google inválida ou malformada.', 400) };
    }
    const emailBruto = claims.email || '';
    return {
      email: String(emailBruto).trim().toLowerCase(),
      nome: String(claims.name || claims.given_name || (emailBruto ? emailBruto.split('@')[0] : '')).trim(),
      sub: claims.sub || '',
      avatarUrl: claims.picture || null,
      hd: claims.hd || '',
    };
  }

  if (body.email) {
    if (!permitirModoSimulado) {
      return { erro: jsonErro('Credencial do Google é obrigatória em ambiente com Google Client ID configurado.', 401) };
    }
    const emailBruto = String(body.email).trim().toLowerCase();
    return {
      email: emailBruto,
      nome: String(body.nome || body.name || emailBruto.split('@')[0]).trim(),
      sub: body.sub || body.google_id || `google_${Date.now()}`,
      avatarUrl: body.avatar_url || body.picture || null,
      hd: body.hd || (emailBruto.includes('@') ? emailBruto.split('@')[1] : ''),
    };
  }

  return { email: '', nome: '', sub: '', avatarUrl: null, hd: '' };
}

async function resolverOuCadastrarUsuarioGoogle(db, { email, nome, avatarUrl }) {
  const existente = await getUserByEmail(db, email);
  if (existente) {
    if (!existente.ativo) {
      return { erro: jsonErro('Este usuário está desativado. Contate a administração.', 403) };
    }
    if (!existente.avatar_url && avatarUrl) {
      try {
        await db.prepare('UPDATE usuarios SET avatar_url = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?')
          .bind(avatarUrl, existente.id).run();
        existente.avatar_url = avatarUrl;
      } catch (erroAvatar) {
        console.warn('Falha ao atualizar avatar Google do usuário:', erroAvatar?.message || erroAvatar);
      }
    }
    return { usuario: existente };
  }

  const papel = detectarPerfilAcademico(email);
  const senhaAleatoria = await hashSenha(`google_auth_placeholder_${crypto.randomUUID()}`);
  const resultado = await db.prepare(
    'INSERT INTO usuarios (nome, email, senha_hash, perfil, avatar_url, ativo) VALUES (?, ?, ?, ?, ?, 1)',
  ).bind(nome, email, senhaAleatoria, papel, avatarUrl).run();

  return {
    usuario: {
      id: resultado.meta.last_row_id,
      nome,
      email,
      perfil: papel,
      avatar_url: avatarUrl,
      ativo: 1,
    },
  };
}

/**
 * Autentica ou cadastra automaticamente um usuário via Google (com suporte especial a contas acadêmicas e Google Workspace for Education).
 */
export async function loginComGoogle(request, env, db) {
  const body = await readJsonBody(request);
  const googleClientIdEsperado = String(env?.GOOGLE_CLIENT_ID || '').trim();
  const permitirModoSimulado = !googleClientIdEsperado && String(env?.ALLOW_UNVERIFIED_GOOGLE_DEV || '') === 'true';

  if (!googleClientIdEsperado && !permitirModoSimulado) {
    return jsonErro('Login com Google não está configurado neste ambiente. Configure GOOGLE_CLIENT_ID ou utilize email e senha.', 503);
  }

  await trocarAuthCodeGooglePorToken(body, googleClientIdEsperado, env, request);
  const perfilGoogle = await extrairPerfilGoogleDeCredencial(body, googleClientIdEsperado, permitirModoSimulado, env);
  if (perfilGoogle.erro) {
    return perfilGoogle.erro;
  }
  if (!perfilGoogle.email) {
    return jsonErro('Email institucional do Google ou credencial inválida.', 400);
  }

  const segredo = exigirSegredoJwt(env.JWT_SECRET);
  const ehAcademico = verificarDominioAcademico(perfilGoogle.email, perfilGoogle.hd);
  const dominioInstitucional = perfilGoogle.hd || (perfilGoogle.email.includes('@') ? perfilGoogle.email.split('@')[1] : '');

  const { usuario, erro } = await resolverOuCadastrarUsuarioGoogle(db, perfilGoogle);
  if (erro) {
    return erro;
  }

  const dadosSessao = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    avatar_url: usuario.avatar_url || perfilGoogle.avatarUrl,
    metodo_auth: 'google_academico',
    conta_academica: ehAcademico,
    dominio_institucional: dominioInstitucional,
    google_id: perfilGoogle.sub,
  };

  const token = await signJwt(dadosSessao, segredo);
  return jsonResponse({
    mensagem: 'Autenticação com Google Acadêmico realizada com sucesso.',
    usuario: dadosSessao,
    token,
    contaAcademica: ehAcademico,
    dominioInstitucional,
  });
}

/**
 * Exporta todos os dados pessoais e registros pedagógicos do titular autenticado
 * para atendimento direto ao Art. 18, incisos II e V, da LGPD (Acesso e Portabilidade).
 */
export async function exportarMeusDadosLgpd(request, env, db) {
  const { user } = await authorizeUser(request, env, db);
  const usuarioId = user.id;

  const statusRateLimit = verificarERegistrarRateLimitExportacaoLgpd(usuarioId);
  if (statusRateLimit.bloqueado) {
    return new Response(
      JSON.stringify({
        erro: 'Limite de exportações LGPD atingido (máximo de 5 por hora). Aguarde antes de solicitar um novo pacote.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Retry-After': String(statusRateLimit.retryAfter),
          ...CORS_HEADERS,
        },
      },
    );
  }

  const consultarSeguro = async (fn, padrao) => {
    try {
      return await fn();
    } catch {
      return padrao;
    }
  };

  const perfil = await getUserProfile(db, usuarioId);
  const preferencias = await consultarSeguro(
    () => queryOne(db, 'SELECT alto_contraste, fonte_ampliada, reduzir_movimento, tema, atualizado_em FROM preferencias_usuario WHERE usuario_id = ?', [usuarioId]),
    null,
  );
  const matriculas = await consultarSeguro(
    () => queryAll(db, 'SELECT m.id, m.curso_id, c.titulo AS curso_titulo, m.status, m.progresso_percentual, m.data_matricula, m.data_conclusao FROM matriculas m LEFT JOIN cursos c ON c.id = m.curso_id WHERE m.usuario_id = ?', [usuarioId]),
    [],
  );
  const progressoAulas = await consultarSeguro(
    () => queryAll(db, 'SELECT pa.matricula_id, pa.aula_id, pa.concluida, pa.data_conclusao FROM progresso_aulas pa JOIN matriculas m ON m.id = pa.matricula_id WHERE m.usuario_id = ?', [usuarioId]),
    [],
  );
  const tentativasAvaliacao = await consultarSeguro(
    () => queryAll(db, 'SELECT ta.matricula_id, ta.avaliacao_id, ta.nota, ta.aprovado, ta.data_tentativa FROM tentativas_avaliacao ta JOIN matriculas m ON m.id = ta.matricula_id WHERE m.usuario_id = ?', [usuarioId]),
    [],
  );
  const certificados = await consultarSeguro(
    () => queryAll(db, 'SELECT cert.codigo_validacao, cert.url_arquivo, cert.data_emissao, c.titulo AS curso_titulo FROM certificados cert JOIN matriculas m ON m.id = cert.matricula_id LEFT JOIN cursos c ON c.id = m.curso_id WHERE m.usuario_id = ?', [usuarioId]),
    [],
  );
  const medalhas = await consultarSeguro(
    () => queryAll(db, 'SELECT md.codigo, md.titulo, md.eixo_bncc, um.conquistada_em FROM usuario_medalhas um JOIN medalhas md ON md.id = um.medalha_id WHERE um.usuario_id = ?', [usuarioId]),
    [],
  );
  const desempenhoHabilidades = await consultarSeguro(
    () => queryAll(db, 'SELECT curso_id, habilidade_codigo, origem_tipo, origem_id, pontuacao, nivel_atingido, registrado_em FROM desempenho_habilidades WHERE usuario_id = ?', [usuarioId]),
    [],
  );
  const submissoesPython = await consultarSeguro(
    () => queryAll(db, 'SELECT atividade_id, codigo_python, sucesso, tentativas, estrelas, parceiro_dupla, papel_dupla, criado_em FROM submissoes_python WHERE usuario_id = ?', [usuarioId]),
    [],
  );
  const avaliacoesUsabilidadeSus = await consultarSeguro(
    () => queryAll(db, 'SELECT participante_tipo, escola_turma, sus_score, tempo_segundos, tarefas_concluidas, criado_em FROM avaliacoes_usabilidade_sus WHERE usuario_id = ?', [usuarioId]),
    [],
  );
  const workspaceItens = await consultarSeguro(
    () => queryAll(
      db,
      'SELECT id, titulo, status, eixo_bncc, habilidade_codigo, curso_id, prioridade, prazo, cover_id, icone_id, template_origem, blocos_json, ordem, criado_em, atualizado_em FROM estudante_workspace_itens WHERE usuario_id = ?',
      [usuarioId],
    ),
    [],
  );

  return jsonResponse({
    formato: 'application/json',
    fundamentoLegal: 'LGPD (Lei nº 13.709/2018) Art. 18, incisos II e V — Acesso e Portabilidade de Dados',
    exportadoEm: new Date().toISOString(),
    controlador: {
      nome: 'Startup LMS COMPASSO · Projeto de Inovação SUAP/IFMA nº 14246/2025 (IFMA Campus Grajaú)',
      encarregadoDpo: 'dpo@lms-compasso.edu.br',
      politicaPrivacidade: '/privacy',
      termosServico: '/terms',
    },
    dadosTitular: {
      perfil,
      preferencias,
      matriculas,
      progressoAulas,
      tentativasAvaliacao,
      certificados,
      medalhas,
      desempenhoHabilidades,
      submissoesPython,
      avaliacoesUsabilidadeSus,
      workspaceItens,
    },
  });
}


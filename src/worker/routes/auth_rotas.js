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
  exigirSegredoJwt,
  hashSenha,
  signJwt,
  verificarSenha,
} from '../crypto_seguranca.js';
import {
  jsonResponse,
  jsonErro,
  readJsonBody,
  getUserByEmail,
  getUserProfile,
  authorizeUser,
  CORS_HEADERS,
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

/**
 * Decodifica o payload de um token JWT do Google (Google Identity Services).
 */
export function decodificarTokenGoogle(credential) {
  if (typeof credential !== 'string') return null;
  const partes = credential.split('.');
  if (partes.length < 2) return null;
  try {
    let base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = typeof atob === 'function'
      ? decodeURIComponent(escape(atob(base64)))
      : Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonStr);
  } catch {
    try {
      if (typeof Buffer !== 'undefined') {
        return JSON.parse(Buffer.from(partes[1], 'base64').toString('utf8'));
      }
    } catch {}
    return null;
  }
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
 * Deduz o perfil escolar do usuário (aluno ou professor/instrutor) baseado no prefixo do email ou papel sugerido.
 */
export function detectarPerfilAcademico(email = '', nome = '', hd = '', papelSugerido = null) {
  if (papelSugerido && ['aluno', 'instrutor'].includes(papelSugerido)) {
    return papelSugerido;
  }
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
  return jsonResponse({
    googleClientId,
    googleConfigurado: Boolean(googleClientId),
  });
}

/**
 * Autentica ou cadastra automaticamente um usuário via Google (com suporte especial a contas acadêmicas e Google Workspace for Education).
 */
export async function loginComGoogle(request, env, db) {
  const body = await readJsonBody(request);
  let email = '';
  let nome = '';
  let sub = '';
  let avatarUrl = null;
  let hd = '';
  const papelSugerido = body.perfil || null;
  const googleClientIdEsperado = String(env?.GOOGLE_CLIENT_ID || '').trim();

  // Suporte a troca de Authorization Code OAuth2 (caso enviado pelo frontend com Google Console)
  if (body.code && googleClientIdEsperado && env?.GOOGLE_CLIENT_SECRET) {
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

  if (body.credential) {
    const claims = decodificarTokenGoogle(body.credential);
    if (!claims) {
      return jsonErro('Credencial do Google inválida ou malformada.', 400);
    }

    // Se a secret GOOGLE_CLIENT_ID estiver configurada no Cloudflare / env, valida a audiência
    if (googleClientIdEsperado) {
      const audValido = Array.isArray(claims.aud)
        ? claims.aud.includes(googleClientIdEsperado)
        : claims.aud === googleClientIdEsperado;
      if (!audValido) {
        return jsonErro('Token do Google não autorizado para esta aplicação (Client ID incompatível).', 401);
      }
    }

    // Valida expiração do token se disponível (com tolerância de 5 min para desvio de relógio)
    if (claims.exp && typeof claims.exp === 'number' && claims.exp * 1000 < Date.now() - 300000) {
      return jsonErro('Token do Google expirado. Faça login novamente.', 401);
    }

    if (claims.email) {
      email = claims.email;
      nome = claims.name || claims.given_name || email.split('@')[0];
      sub = claims.sub || '';
      avatarUrl = claims.picture || null;
      hd = claims.hd || '';
    }
  }

  if (!email && body.email) {
    if (googleClientIdEsperado) {
      return jsonErro('Credencial do Google é obrigatória em ambiente com Google Client ID configurado.', 401);
    }
    email = body.email;
    nome = body.nome || body.name || email.split('@')[0];
    sub = body.sub || body.google_id || `google_${Date.now()}`;
    avatarUrl = body.avatar_url || body.picture || null;
    hd = body.hd || (email.includes('@') ? email.split('@')[1] : '');
  }

  email = String(email || '').trim().toLowerCase();
  nome = String(nome || '').trim();

  if (!email) {
    return jsonErro('Email institucional do Google ou credencial inválida.', 400);
  }

  const segredo = exigirSegredoJwt(env.JWT_SECRET);
  const ehAcademico = verificarDominioAcademico(email, hd) || Boolean(body.academico);
  const dominioInstitucional = hd || (email.includes('@') ? email.split('@')[1] : '');

  let usuario = await getUserByEmail(db, email);

  if (usuario) {
    if (!usuario.ativo) {
      return jsonErro('Este usuário está desativado. Contate a administração.', 403);
    }
    if (!usuario.avatar_url && avatarUrl) {
      try {
        await db.prepare('UPDATE usuarios SET avatar_url = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?')
          .bind(avatarUrl, usuario.id).run();
        usuario.avatar_url = avatarUrl;
      } catch {}
    }
  } else {
    const papel = detectarPerfilAcademico(email, nome, hd, papelSugerido);
    const senhaAleatoria = await hashSenha(`google_auth_placeholder_${crypto.randomUUID()}`);

    const resultado = await db.prepare(
      "INSERT INTO usuarios (nome, email, senha_hash, perfil, avatar_url, ativo) VALUES (?, ?, ?, ?, ?, 1)",
    ).bind(nome, email, senhaAleatoria, papel, avatarUrl).run();

    usuario = {
      id: resultado.meta.last_row_id,
      nome,
      email,
      perfil: papel,
      avatar_url: avatarUrl,
      ativo: 1,
    };
  }

  const dadosSessao = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    avatar_url: usuario.avatar_url || avatarUrl,
    metodo_auth: 'google_academico',
    conta_academica: ehAcademico,
    dominio_institucional: dominioInstitucional,
    google_id: sub,
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


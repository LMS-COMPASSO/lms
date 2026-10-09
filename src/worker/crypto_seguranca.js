/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - MÓDULO DE CRIPTOGRAFIA E SEGURANÇA (CRYPTO)
 * ============================================================================
 * Este arquivo reúne as funções de segurança utilizadas na plataforma:
 * 1. Hashing de senhas com PBKDF2-SHA256 e salt aleatório por usuário (protege as
 *    senhas dos alunos no banco). Hashes legados em SHA-256 simples ainda são
 *    aceitos no login e regravados no novo formato (ver verificarSenha).
 * 2. Criação e validação de tokens de autenticação (JWT - JSON Web Token).
 *
 * Utiliza exclusivamente a "Web Crypto API" nativa, padrão moderno dos
 * navegadores e do Cloudflare Workers, sem a necessidade de bibliotecas externas.
 * ============================================================================
 */

/**
 * Converte um texto ou array de bytes para o formato Base64URL.
 * O Base64URL é uma variação segura do Base64 para ser usada em URLs e cabeçalhos HTTP.
 *
 * @param {string|Uint8Array} valor - Texto ou bytes a serem codificados.
 * @returns {string} Texto codificado em Base64URL.
 */
export function base64UrlEncode(valor) {
  const bytes = typeof valor === 'string' ? new TextEncoder().encode(valor) : valor;
  let binario = '';
  for (const byte of bytes) {
    binario += String.fromCodePoint(byte);
  }
  return btoa(binario)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

/**
 * Decodifica uma string no formato Base64URL de volta para um array de bytes (Uint8Array).
 *
 * @param {string} valor - String em Base64URL.
 * @returns {Uint8Array} Bytes decodificados.
 */
export function base64UrlDecode(valor) {
  const normalizado = valor.replaceAll('-', '+').replaceAll('_', '/');
  const preenchido = normalizado.padEnd(Math.ceil(normalizado.length / 4) * 4, '=');
  return Uint8Array.from(atob(preenchido), (char) => char.codePointAt(0));
}

/**
 * Gera um hash criptográfico SHA-256 em formato hexadecimal para um texto.
 * ATENÇÃO: não use para armazenar senhas novas (sem salt nem custo). Mantido apenas
 * para validar hashes legados já gravados no banco; use hashSenha() para novas senhas.
 *
 * @param {string} texto - O texto simples a ser transformado em hash.
 * @returns {Promise<string>} O hash SHA-256 em formato hexadecimal (64 caracteres).
 */
export async function sha256Hex(texto) {
  const bytes = new TextEncoder().encode(texto);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/** Identificador do esquema de hash de senha gravado no banco. */
export const PBKDF2_ESQUEMA = 'pbkdf2_sha256';
/**
 * Número de iterações do PBKDF2. 100.000 é o máximo aceito pelo Cloudflare Workers;
 * valores maiores fazem a Web Crypto API lançar erro no runtime.
 */
export const PBKDF2_ITERACOES = 100_000;
const PBKDF2_TAMANHO_SALT = 16;
const PBKDF2_TAMANHO_HASH = 32;

/**
 * Deriva a chave PBKDF2-SHA256 de uma senha com o salt e as iterações informados.
 */
async function derivarPbkdf2(senha, salt, iteracoes) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(senha),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iteracoes },
    material,
    PBKDF2_TAMANHO_HASH * 8,
  );
  return new Uint8Array(bits);
}

/**
 * Compara dois arrays de bytes sem interromper no primeiro byte diferente,
 * evitando vazar informação pelo tempo de resposta.
 */
function iguaisTempoConstante(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let diferenca = 0;
  for (let i = 0; i < a.length; i += 1) {
    diferenca |= a[i] ^ b[i];
  }
  return diferenca === 0;
}

/**
 * Gera o hash de armazenamento de uma senha: PBKDF2-SHA256 com salt aleatório exclusivo.
 * Formato: `pbkdf2_sha256$<iterações>$<salt base64url>$<hash base64url>`.
 *
 * @param {string} senha - Senha em texto simples.
 * @returns {Promise<string>} Hash pronto para gravar na coluna senha_hash.
 */
export async function hashSenha(senha) {
  const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_TAMANHO_SALT));
  const hash = await derivarPbkdf2(senha, salt, PBKDF2_ITERACOES);
  return `${PBKDF2_ESQUEMA}$${PBKDF2_ITERACOES}$${base64UrlEncode(salt)}$${base64UrlEncode(hash)}`;
}

/**
 * Confere uma senha contra o valor gravado no banco.
 * Aceita o formato PBKDF2 atual e o formato legado (SHA-256 hexadecimal sem salt).
 * Quando `precisaRehash` for true, o chamador deve regravar a senha com hashSenha()
 * logo após o login bem-sucedido (migração transparente de contas antigas).
 *
 * @param {string} senha - Senha em texto simples informada pelo usuário.
 * @param {string} armazenado - Valor da coluna senha_hash.
 * @returns {Promise<{valido: boolean, precisaRehash: boolean}>}
 */
export async function verificarSenha(senha, armazenado) {
  const invalido = { valido: false, precisaRehash: false };
  if (typeof armazenado !== 'string' || armazenado.length === 0) {
    return invalido;
  }

  if (armazenado.startsWith(`${PBKDF2_ESQUEMA}$`)) {
    const [, iteracoesTexto, saltTexto, hashTexto] = armazenado.split('$');
    const iteracoes = Number(iteracoesTexto);
    if (!Number.isSafeInteger(iteracoes) || iteracoes <= 0 || !saltTexto || !hashTexto) {
      return invalido;
    }
    try {
      const esperado = base64UrlDecode(hashTexto);
      const calculado = await derivarPbkdf2(senha, base64UrlDecode(saltTexto), iteracoes);
      const valido = iguaisTempoConstante(calculado, esperado);
      return { valido, precisaRehash: valido && iteracoes < PBKDF2_ITERACOES };
    } catch {
      return invalido;
    }
  }

  // Formato legado: SHA-256 hexadecimal de 64 caracteres, sem salt.
  if (/^[0-9a-f]{64}$/i.test(armazenado)) {
    const calculado = new TextEncoder().encode(await sha256Hex(senha));
    const esperado = new TextEncoder().encode(armazenado.toLowerCase());
    const valido = iguaisTempoConstante(calculado, esperado);
    return { valido, precisaRehash: valido };
  }

  return invalido;
}

const SEGREDOS_JWT_PROIBIDOS = new Set([
  'dev-secret-change-me',
  'mude-esta-chave-para-uma-aleatoria',
  'coloque-uma-chave-secreta-longa-e-aleatoria',
  'coloque-uma-chave-secreta-longa-e-aleatoria-para-testes-locais',
]);
export const JWT_SEGREDO_TAMANHO_MINIMO = 32;

/**
 * Valida o segredo de assinatura dos JWT vindo do ambiente (Cloudflare Secret).
 * Não existe valor padrão: se estiver ausente, curto demais ou for um valor de
 * exemplo conhecido, lança erro em vez de assinar tokens com uma chave previsível.
 *
 * @param {string|undefined} segredo - Valor de env.JWT_SECRET.
 * @returns {string} O segredo validado.
 */
export function exigirSegredoJwt(segredo) {
  if (typeof segredo !== 'string' || segredo.length < JWT_SEGREDO_TAMANHO_MINIMO
    || SEGREDOS_JWT_PROIBIDOS.has(segredo)) {
    throw new Error(
      `JWT_SECRET não configurado corretamente: defina um segredo aleatório de pelo menos ${JWT_SEGREDO_TAMANHO_MINIMO} caracteres (Cloudflare Secret em produção, .dev.vars no ambiente local).`,
    );
  }
  return segredo;
}

export const JWT_TTL_SECONDS = 8 * 60 * 60;

/**
 * Cria um token JWT assinado digitalmente com algoritmo HMAC SHA-256.
 * O token contém 3 partes separadas por ponto: CABEÇALHO.DADOS.ASSINATURA
 *
 * @param {object} dados - Informações do usuário a armazenar no token (payload).
 * @param {string} segredo - Chave secreta usada para assinar o token.
 * @returns {Promise<string>} O token JWT completo pronto para envio ao cliente.
 */
export async function signJwt(dados, segredo, expiresInSeconds = JWT_TTL_SECONDS) {
  if (!Number.isSafeInteger(expiresInSeconds) || expiresInSeconds <= 0) {
    throw new RangeError('A validade do token deve ser um número inteiro positivo.');
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    ...dados,
    iat: issuedAt,
    exp: issuedAt + expiresInSeconds,
  };
  const cabecalhoSegmento = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const dadosSegmento = base64UrlEncode(JSON.stringify(payload));
  const entradaAssinatura = `${cabecalhoSegmento}.${dadosSegmento}`;

  const chave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(segredo),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const assinaturaBytes = await crypto.subtle.sign('HMAC', chave, new TextEncoder().encode(entradaAssinatura));
  const assinatura = base64UrlEncode(new Uint8Array(assinaturaBytes));
  return `${entradaAssinatura}.${assinatura}`;
}

/**
 * Valida a assinatura de um token JWT e extrai os dados armazenados nele.
 * Se o token for falso, tiver sido adulterado ou a chave não bater, lança um erro.
 *
 * @param {string} token - O token JWT recebido no cabeçalho Authorization.
 * @param {string} segredo - Chave secreta usada para conferir a assinatura.
 * @returns {Promise<object>} Os dados originais do usuário (payload) decodificados.
 */
export async function verifyJwt(token, segredo) {
  const partes = token.split('.');
  if (partes.length !== 3) {
    throw new Error('Formato do token JWT inválido.');
  }

  const [cabecalhoSegmento, dadosSegmento, assinaturaSegmento] = partes;
  const entradaAssinatura = `${cabecalhoSegmento}.${dadosSegmento}`;

  const chave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(segredo),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const assinaturaBytes = base64UrlDecode(assinaturaSegmento);
  const assinaturaValida = await crypto.subtle.verify(
    'HMAC',
    chave,
    assinaturaBytes,
    new TextEncoder().encode(entradaAssinatura),
  );

  if (!assinaturaValida) {
    throw new Error('Token inválido ou expirado.');
  }

  const cabecalhoDecodificado = JSON.parse(new TextDecoder().decode(base64UrlDecode(cabecalhoSegmento)));
  const dadosDecodificados = JSON.parse(new TextDecoder().decode(base64UrlDecode(dadosSegmento)));
  const agora = Math.floor(Date.now() / 1000);

  if (cabecalhoDecodificado.alg !== 'HS256' || cabecalhoDecodificado.typ !== 'JWT') {
    throw new Error('Token inválido ou expirado.');
  }
  if (
    !Number.isSafeInteger(dadosDecodificados.iat)
    || !Number.isSafeInteger(dadosDecodificados.exp)
    || dadosDecodificados.iat > agora
    || dadosDecodificados.exp <= agora
    || dadosDecodificados.exp <= dadosDecodificados.iat
  ) {
    throw new Error('Token inválido ou expirado.');
  }

  return dadosDecodificados;
}

/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - MÓDULO DE CRIPTOGRAFIA E SEGURANÇA (CRYPTO)
 * ============================================================================
 * Este arquivo reúne as funções de segurança utilizadas na plataforma:
 * 1. Hashing de senhas com SHA-256 (protege as senhas dos alunos no banco).
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
 * Gera um hash criptográfico SHA-256 em formato hexadecimal para um texto (como uma senha).
 * O hash é uma operação unidirecional: não é possível recuperar o texto original a partir dele.
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

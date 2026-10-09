import assert from 'node:assert/strict';
import test from 'node:test';
import {
  base64UrlEncode,
  exigirSegredoJwt,
  hashSenha,
  JWT_SEGREDO_TAMANHO_MINIMO,
  JWT_TTL_SECONDS,
  sha256Hex,
  signJwt,
  verificarSenha,
  verifyJwt,
} from '../src/worker/crypto_seguranca.js';

const segredo = 'test-secret';

async function assinarPayload(payload, cabecalho = { alg: 'HS256', typ: 'JWT' }) {
  const cabecalhoSegmento = base64UrlEncode(JSON.stringify(cabecalho));
  const payloadSegmento = base64UrlEncode(JSON.stringify(payload));
  const entradaAssinatura = `${cabecalhoSegmento}.${payloadSegmento}`;
  const chave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(segredo),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const assinatura = await crypto.subtle.sign(
    'HMAC',
    chave,
    new TextEncoder().encode(entradaAssinatura),
  );

  return `${entradaAssinatura}.${base64UrlEncode(new Uint8Array(assinatura))}`;
}

test('signJwt adds issued-at and expiry claims', async () => {
  const token = await signJwt({ id: 7 }, segredo);
  const payload = await verifyJwt(token, segredo);

  assert.equal(Number.isSafeInteger(payload.iat), true);
  assert.equal(payload.exp - payload.iat, JWT_TTL_SECONDS);
  assert.equal(payload.id, 7);
});

test('signJwt rejects a non-positive or non-integer lifetime', async () => {
  await assert.rejects(signJwt({ id: 7 }, segredo, 0), RangeError);
  await assert.rejects(signJwt({ id: 7 }, segredo, 1.5), RangeError);
});

test('verifyJwt rejects expired tokens', async () => {
  const issuedAt = Math.floor(Date.now() / 1000) - 10;
  const token = await assinarPayload({ id: 7, iat: issuedAt, exp: issuedAt + 1 });

  await assert.rejects(verifyJwt(token, segredo), /inválido ou expirado/);
});

test('verifyJwt rejects tokens without expiry claims', async () => {
  const token = await assinarPayload({ id: 7 });

  await assert.rejects(verifyJwt(token, segredo), /inválido ou expirado/);
});

test('verifyJwt rejects invalid time claims and JWT headers', async (t) => {
  const now = Math.floor(Date.now() / 1000);
  const invalidTokens = [
    ['non-numeric expiry', { id: 7, iat: now, exp: 'later' }],
    ['future issued-at', { id: 7, iat: now + 60, exp: now + 120 }],
    ['expiry before issued-at', { id: 7, iat: now, exp: now }],
  ];

  for (const [name, payload] of invalidTokens) {
    await t.test(name, async () => {
      await assert.rejects(verifyJwt(await assinarPayload(payload), segredo), /inválido ou expirado/);
    });
  }

  await t.test('unsupported signing algorithm', async () => {
    const token = await assinarPayload(
      { id: 7, iat: now, exp: now + 60 },
      { alg: 'none', typ: 'JWT' },
    );

    await assert.rejects(verifyJwt(token, segredo), /inválido ou expirado/);
  });
});

test('verifyJwt rejects an invalid signature', async () => {
  const token = await signJwt({ id: 7 }, segredo);
  const tamperedToken = `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`;

  await assert.rejects(verifyJwt(tamperedToken, segredo), /inválido ou expirado/);
});

test('hashSenha gera hashes PBKDF2 diferentes (salt aleatório) para a mesma senha', async () => {
  const a = await hashSenha('Senha@123');
  const b = await hashSenha('Senha@123');

  assert.match(a, /^pbkdf2_sha256\$100000\$[\w-]+\$[\w-]+$/);
  assert.notEqual(a, b);
  assert.equal(a.includes('Senha@123'), false);
});

test('verificarSenha aceita a senha correta e rejeita a errada (PBKDF2)', async () => {
  const hash = await hashSenha('Senha@123');

  assert.deepEqual(await verificarSenha('Senha@123', hash), { valido: true, precisaRehash: false });
  assert.deepEqual(await verificarSenha('outra', hash), { valido: false, precisaRehash: false });
});

test('verificarSenha aceita hash legado SHA-256 e pede rehash', async () => {
  const legado = await sha256Hex('Admin@12345');

  assert.deepEqual(await verificarSenha('Admin@12345', legado), { valido: true, precisaRehash: true });
  assert.deepEqual(await verificarSenha('errada', legado), { valido: false, precisaRehash: false });
});

test('verificarSenha pede rehash quando o custo gravado é menor que o atual', async () => {
  const salt = new Uint8Array(16).fill(1);
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode('abc'), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 1000 }, material, 256);
  const antigo = `pbkdf2_sha256$1000$${base64UrlEncode(salt)}$${base64UrlEncode(new Uint8Array(bits))}`;

  assert.deepEqual(await verificarSenha('abc', antigo), { valido: true, precisaRehash: true });
});

test('verificarSenha rejeita valores malformados ou vazios', async () => {
  for (const armazenado of [undefined, null, '', 'texto-qualquer', 'pbkdf2_sha256$x$y$z', 'pbkdf2_sha256$100000$$']) {
    assert.deepEqual(await verificarSenha('abc', armazenado), { valido: false, precisaRehash: false });
  }
});

test('exigirSegredoJwt recusa segredo ausente, curto ou de exemplo', () => {
  for (const segredo of [undefined, '', 'curto', 'dev-secret-change-me', 'mude-esta-chave-para-uma-aleatoria', 'coloque-uma-chave-secreta-longa-e-aleatoria']) {
    assert.throws(() => exigirSegredoJwt(segredo), /JWT_SECRET/);
  }
});

test('exigirSegredoJwt devolve segredos fortes sem alterá-los', () => {
  const forte = 'x'.repeat(JWT_SEGREDO_TAMANHO_MINIMO);

  assert.equal(exigirSegredoJwt(forte), forte);
});

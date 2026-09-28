import assert from 'node:assert/strict';
import test from 'node:test';
import {
  base64UrlEncode,
  JWT_TTL_SECONDS,
  signJwt,
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
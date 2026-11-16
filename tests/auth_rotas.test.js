import assert from 'node:assert/strict';
import test from 'node:test';
import { base64UrlEncode, hashSenha, sha256Hex, signJwt } from '../src/worker/crypto_seguranca.js';
import { alterarSenha, login, loginComGoogle, obterConfigAuth, registrar, verificarDominioAcademico } from '../src/worker/routes/auth_rotas.js';

const SEGREDO = 'segredo-de-teste-com-mais-de-32-caracteres!!';
const CLIENT_ID_TESTE = '123456789-escola.apps.googleusercontent.com';

async function criarParChavesGoogleTeste() {
  const kp = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify'],
  );
  const publicJwk = await crypto.subtle.exportKey('jwk', kp.publicKey);
  publicJwk.kid = 'google-test-key-1';
  publicJwk.alg = 'RS256';
  return { privateKey: kp.privateKey, jwks: [publicJwk] };
}

async function assinarTokenGoogle(payload, privateKey, headerExtras = {}) {
  const header = { alg: 'RS256', typ: 'JWT', kid: 'google-test-key-1', ...headerExtras };
  const hB64 = base64UrlEncode(JSON.stringify(header));
  const pB64 = base64UrlEncode(JSON.stringify(payload));
  const input = `${hB64}.${pB64}`;
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(input),
  );
  return `${input}.${base64UrlEncode(new Uint8Array(sig))}`;
}

/**
 * Banco D1 falso em memória: entende apenas as consultas usadas pelas rotas de auth.
 */
function criarBanco(usuarios = []) {
  const linhas = usuarios.map((u) => ({ ativo: 1, perfil: 'aluno', avatar_url: null, ...u }));
  let proximoId = Math.max(0, ...linhas.map((u) => u.id)) + 1;

  return {
    linhas,
    prepare(sql) {
      return {
        bind(...params) {
          return {
            async first() {
              if (sql.includes('FROM usuarios WHERE email = ?')) {
                return linhas.find((u) => u.email === params[0]) || null;
              }
              if (sql.includes('FROM usuarios WHERE id = ?')) {
                return linhas.find((u) => u.id === params[0]) || null;
              }
              throw new Error(`Consulta first() não prevista: ${sql}`);
            },
            async run() {
              if (sql.startsWith('INSERT INTO usuarios')) {
                const [nome, email, senhaHash, perfil = 'aluno', avatarUrl = null] = params;
                linhas.push({ id: proximoId, nome, email, senha_hash: senhaHash, perfil, avatar_url: avatarUrl, ativo: 1 });
                proximoId += 1;
                return { meta: { last_row_id: proximoId - 1 } };
              }
              if (sql.startsWith('UPDATE usuarios SET senha_hash')) {
                const usuario = linhas.find((u) => u.id === params[1]);
                usuario.senha_hash = params[0];
                return { meta: {} };
              }
              if (sql.startsWith('UPDATE usuarios SET avatar_url')) {
                const usuario = linhas.find((u) => u.id === params[1]);
                if (usuario) usuario.avatar_url = params[0];
                return { meta: {} };
              }
              throw new Error(`Consulta run() não prevista: ${sql}`);
            },
          };
        },
      };
    },
  };
}

function requisicao(corpo, token) {
  return new Request('https://lms.test/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(corpo),
  });
}

test('registrar grava hash PBKDF2 com salt e não devolve o hash na resposta', async () => {
  const db = criarBanco();
  const resposta = await registrar(
    requisicao({ nome: 'Ana', email: 'ana@escola.gov.br', senha: 'Senha@123' }),
    { JWT_SECRET: SEGREDO },
    db,
  );
  const corpo = await resposta.json();

  assert.equal(resposta.status, 201);
  assert.equal(typeof corpo.token, 'string');
  assert.equal(JSON.stringify(corpo).includes('senha_hash'), false);
  assert.match(db.linhas[0].senha_hash, /^pbkdf2_sha256\$100000\$/);
});

test('registrar falha de forma explícita quando JWT_SECRET não está configurado', async () => {
  const db = criarBanco();

  await assert.rejects(
    registrar(requisicao({ nome: 'Ana', email: 'ana@escola.gov.br', senha: 'Senha@123' }), {}, db),
    /JWT_SECRET/,
  );
  assert.equal(db.linhas.length, 0);
});

test('login com senha correta em conta PBKDF2 não regrava o hash', async () => {
  const hash = await hashSenha('Senha@123');
  const db = criarBanco([{ id: 1, nome: 'Ana', email: 'ana@escola.gov.br', senha_hash: hash }]);
  const resposta = await login(requisicao({ email: 'ana@escola.gov.br', senha: 'Senha@123' }), { JWT_SECRET: SEGREDO }, db);

  assert.equal(resposta.status, 200);
  assert.equal(db.linhas[0].senha_hash, hash);
});

test('login com senha errada devolve 401 e preserva o hash', async () => {
  const hash = await hashSenha('Senha@123');
  const db = criarBanco([{ id: 1, nome: 'Ana', email: 'ana@escola.gov.br', senha_hash: hash }]);
  const resposta = await login(requisicao({ email: 'ana@escola.gov.br', senha: 'errada' }), { JWT_SECRET: SEGREDO }, db);

  assert.equal(resposta.status, 401);
  assert.equal(db.linhas[0].senha_hash, hash);
});

test('login em conta legada SHA-256 funciona e migra o hash para PBKDF2', async () => {
  const legado = await sha256Hex('Admin@12345');
  const db = criarBanco([{ id: 1, nome: 'Admin', email: 'admin@lms-bncc.edu.br', senha_hash: legado, perfil: 'administrador' }]);
  const env = { JWT_SECRET: SEGREDO };

  const primeiro = await login(requisicao({ email: 'admin@lms-bncc.edu.br', senha: 'Admin@12345' }), env, db);
  assert.equal(primeiro.status, 200);
  assert.match(db.linhas[0].senha_hash, /^pbkdf2_sha256\$/);
  assert.notEqual(db.linhas[0].senha_hash, legado);

  const segundo = await login(requisicao({ email: 'admin@lms-bncc.edu.br', senha: 'Admin@12345' }), env, db);
  assert.equal(segundo.status, 200);
});

test('login em conta legada com senha errada não migra o hash', async () => {
  const legado = await sha256Hex('Admin@12345');
  const db = criarBanco([{ id: 1, nome: 'Admin', email: 'admin@lms-bncc.edu.br', senha_hash: legado }]);
  const resposta = await login(requisicao({ email: 'admin@lms-bncc.edu.br', senha: 'errada' }), { JWT_SECRET: SEGREDO }, db);

  assert.equal(resposta.status, 401);
  assert.equal(db.linhas[0].senha_hash, legado);
});

test('login não emite token quando JWT_SECRET está ausente ou é o valor padrão antigo', async () => {
  const hash = await hashSenha('Senha@123');
  const db = criarBanco([{ id: 1, nome: 'Ana', email: 'ana@escola.gov.br', senha_hash: hash }]);
  const corpo = { email: 'ana@escola.gov.br', senha: 'Senha@123' };

  await assert.rejects(login(requisicao(corpo), {}, db), /JWT_SECRET/);
  await assert.rejects(login(requisicao(corpo), { JWT_SECRET: 'dev-secret-change-me' }, db), /JWT_SECRET/);
});

test('alterarSenha valida a senha atual (inclusive legada) e grava PBKDF2', async () => {
  const legado = await sha256Hex('Antiga@123');
  const db = criarBanco([{ id: 1, nome: 'Ana', email: 'ana@escola.gov.br', senha_hash: legado }]);
  const env = { JWT_SECRET: SEGREDO };
  const token = await signJwt({ id: 1, perfil: 'aluno' }, SEGREDO);

  const errada = await alterarSenha(requisicao({ senhaAtual: 'x', novaSenha: 'Nova@12345' }, token), env, db);
  assert.equal(errada.status, 401);

  const certa = await alterarSenha(requisicao({ senhaAtual: 'Antiga@123', novaSenha: 'Nova@12345' }, token), env, db);
  assert.equal(certa.status, 200);
  assert.match(db.linhas[0].senha_hash, /^pbkdf2_sha256\$/);

  const novoLogin = await login(requisicao({ email: 'ana@escola.gov.br', senha: 'Nova@12345' }), env, db);
  assert.equal(novoLogin.status, 200);
});

test('verificarDominioAcademico reconhece domínios educacionais e governamentais', () => {
  assert.equal(verificarDominioAcademico('aluno@escola.edu.br'), true);
  assert.equal(verificarDominioAcademico('prof.joao@seduc.ce.gov.br'), true);
  assert.equal(verificarDominioAcademico('lucas@colegio.gsuite.edu.br'), true);
  assert.equal(verificarDominioAcademico('usuario@empresa.com', 'escola.edu.br'), true);
  assert.equal(verificarDominioAcademico('qualquer@gmail.com', 'gmail.com'), false);
});

test('loginComGoogle falha fechado (503) quando GOOGLE_CLIENT_ID não está configurado em produção', async () => {
  const db = criarBanco();
  const res = await loginComGoogle(
    requisicao({ email: 'invasor@escola.edu.br' }),
    { JWT_SECRET: SEGREDO },
    db,
  );
  assert.equal(res.status, 503);
  assert.equal(db.linhas.length, 0);
});

test('loginComGoogle em modo dev explícito provisiona aluno sem aceitar escalonamento de perfil', async () => {
  const db = criarBanco();
  const env = { JWT_SECRET: SEGREDO, ALLOW_UNVERIFIED_GOOGLE_DEV: 'true' };

  const resposta = await loginComGoogle(
    requisicao({
      nome: 'Mariana Costa',
      email: 'mariana.costa@aluno.escola.edu.br',
      perfil: 'instrutor',
      avatar_url: 'https://lh3.googleusercontent.com/avatar-mariana',
    }),
    env,
    db,
  );
  const dados = await resposta.json();

  assert.equal(resposta.status, 200);
  assert.equal(dados.contaAcademica, true);
  assert.equal(dados.usuario.nome, 'Mariana Costa');
  assert.equal(dados.usuario.perfil, 'aluno');
  assert.equal(dados.usuario.metodo_auth, 'google_academico');
  assert.equal(typeof dados.token, 'string');
  assert.equal(db.linhas.length, 1);
  assert.equal(db.linhas[0].email, 'mariana.costa@aluno.escola.edu.br');
});

test('loginComGoogle com professor institucional verificado deduz perfil instrutor', async () => {
  const db = criarBanco();
  const { privateKey, jwks } = await criarParChavesGoogleTeste();
  const env = { JWT_SECRET: SEGREDO, GOOGLE_CLIENT_ID: CLIENT_ID_TESTE, __GOOGLE_JWKS: jwks };
  const token = await assinarTokenGoogle(
    {
      iss: 'https://accounts.google.com',
      aud: CLIENT_ID_TESTE,
      exp: Math.floor(Date.now() / 1000) + 3600,
      email_verified: true,
      email: 'prof.carlos@educacao.sp.gov.br',
      name: 'Prof. Carlos Eduardo',
      hd: 'educacao.sp.gov.br',
    },
    privateKey,
  );

  const resposta = await loginComGoogle(requisicao({ credential: token }), env, db);
  const dados = await resposta.json();

  assert.equal(resposta.status, 200);
  assert.equal(dados.contaAcademica, true);
  assert.equal(dados.usuario.perfil, 'instrutor');
  assert.equal(db.linhas[0].perfil, 'instrutor');
});

test('loginComGoogle com usuário existente preserva perfil atual (inclusive administrador)', async () => {
  const db = criarBanco([
    { id: 99, nome: 'Diretora Silvia', email: 'silvia@escola.gov.br', perfil: 'administrador' },
  ]);
  const { privateKey, jwks } = await criarParChavesGoogleTeste();
  const env = { JWT_SECRET: SEGREDO, GOOGLE_CLIENT_ID: CLIENT_ID_TESTE, __GOOGLE_JWKS: jwks };
  const token = await assinarTokenGoogle(
    {
      iss: 'https://accounts.google.com',
      aud: CLIENT_ID_TESTE,
      exp: Math.floor(Date.now() / 1000) + 3600,
      email_verified: true,
      email: 'silvia@escola.gov.br',
      name: 'Diretora Silvia',
      picture: 'https://lh3.googleusercontent.com/silvia',
    },
    privateKey,
  );

  const resposta = await loginComGoogle(requisicao({ credential: token }), env, db);
  const dados = await resposta.json();

  assert.equal(resposta.status, 200);
  assert.equal(dados.usuario.perfil, 'administrador');
  assert.equal(db.linhas[0].perfil, 'administrador');
});

test('loginComGoogle verifica assinatura RS256, email_verified, iss e aud do Google GIS', async () => {
  const db = criarBanco();
  const { privateKey, jwks } = await criarParChavesGoogleTeste();
  const env = { JWT_SECRET: SEGREDO, GOOGLE_CLIENT_ID: CLIENT_ID_TESTE, __GOOGLE_JWKS: jwks };
  const exp = Math.floor(Date.now() / 1000) + 3600;

  const tokenValido = await assinarTokenGoogle(
    {
      iss: 'https://accounts.google.com',
      aud: CLIENT_ID_TESTE,
      exp,
      email_verified: true,
      sub: 'google_sub_123456789',
      email: 'pedro.souza@colegio.edu.br',
      name: 'Pedro Souza',
      picture: 'https://lh3.googleusercontent.com/pedro',
      hd: 'colegio.edu.br',
    },
    privateKey,
  );

  const resposta = await loginComGoogle(requisicao({ credential: tokenValido }), env, db);
  const dados = await resposta.json();

  assert.equal(resposta.status, 200);
  assert.equal(dados.usuario.email, 'pedro.souza@colegio.edu.br');
  assert.equal(dados.usuario.nome, 'Pedro Souza');
  assert.equal(dados.contaAcademica, true);

  // Assinatura adulterada deve falhar (401)
  const partes = tokenValido.split('.');
  const tokenAdulterado = `${partes[0]}.${partes[1]}.assinatura_forjada`;
  await assert.rejects(
    loginComGoogle(requisicao({ credential: tokenAdulterado }), env, db),
    (err) => err.status === 401,
  );

  // E-mail não verificado deve falhar (401)
  const tokenNaoVerificado = await assinarTokenGoogle(
    {
      iss: 'https://accounts.google.com',
      aud: CLIENT_ID_TESTE,
      exp,
      email_verified: false,
      email: 'falso@colegio.edu.br',
    },
    privateKey,
  );
  await assert.rejects(
    loginComGoogle(requisicao({ credential: tokenNaoVerificado }), env, db),
    (err) => err.status === 401,
  );
});

test('loginComGoogle recusa usuário inativo', async () => {
  const db = criarBanco([
    { id: 5, nome: 'Aluno Bloqueado', email: 'bloqueado@escola.edu.br', ativo: 0 },
  ]);
  const { privateKey, jwks } = await criarParChavesGoogleTeste();
  const env = { JWT_SECRET: SEGREDO, GOOGLE_CLIENT_ID: CLIENT_ID_TESTE, __GOOGLE_JWKS: jwks };
  const token = await assinarTokenGoogle(
    {
      iss: 'https://accounts.google.com',
      aud: CLIENT_ID_TESTE,
      exp: Math.floor(Date.now() / 1000) + 3600,
      email_verified: true,
      email: 'bloqueado@escola.edu.br',
    },
    privateKey,
  );

  const resposta = await loginComGoogle(requisicao({ credential: token }), env, db);
  assert.equal(resposta.status, 403);
});

test('obterConfigAuth retorna googleClientId e status de configuração', async () => {
  const req = new Request('https://lms.test/api/auth/config', { method: 'GET' });

  const res1 = await obterConfigAuth(req, {});
  const dados1 = await res1.json();
  assert.equal(dados1.googleClientId, '');
  assert.equal(dados1.googleConfigurado, false);
  assert.equal(dados1.googleSimuladoAtivo, false);

  const res2 = await obterConfigAuth(req, { GOOGLE_CLIENT_ID: 'meu-app-123.apps.googleusercontent.com' });
  const dados2 = await res2.json();
  assert.equal(dados2.googleClientId, 'meu-app-123.apps.googleusercontent.com');
  assert.equal(dados2.googleConfigurado, true);
  assert.equal(dados2.googleSimuladoAtivo, false);
});

test('loginComGoogle valida aud quando GOOGLE_CLIENT_ID está configurado nas secrets', async () => {
  const db = criarBanco();
  const { privateKey, jwks } = await criarParChavesGoogleTeste();
  const env = { JWT_SECRET: SEGREDO, GOOGLE_CLIENT_ID: CLIENT_ID_TESTE, __GOOGLE_JWKS: jwks };
  const exp = Math.floor(Date.now() / 1000) + 3600;

  const tokenErrado = await assinarTokenGoogle(
    {
      iss: 'https://accounts.google.com',
      aud: 'outro-app-hacker.apps.googleusercontent.com',
      exp,
      email_verified: true,
      email: 'tentativa@escola.edu.br',
      name: 'Hacker',
    },
    privateKey,
  );
  await assert.rejects(
    loginComGoogle(requisicao({ credential: tokenErrado }), env, db),
    (err) => err.status === 401,
  );

  const tokenCorreto = await assinarTokenGoogle(
    {
      iss: 'https://accounts.google.com',
      aud: CLIENT_ID_TESTE,
      exp,
      email_verified: true,
      email: 'prof.ana@educacao.sp.gov.br',
      name: 'Professora Ana',
      hd: 'educacao.sp.gov.br',
    },
    privateKey,
  );

  const respostaCorreta = await loginComGoogle(requisicao({ credential: tokenCorreto }), env, db);
  assert.equal(respostaCorreta.status, 200);
  const dadosCorretos = await respostaCorreta.json();
  assert.equal(dadosCorretos.usuario.email, 'prof.ana@educacao.sp.gov.br');
  assert.equal(dadosCorretos.usuario.perfil, 'instrutor');
});

test('registrar rejeita endereços de email inválidos com status 400', async () => {
  const db = criarBanco();
  const res = await registrar(
    requisicao({ nome: 'Aluno Sem Arroba', email: 'email-invalido', senha: 'Senha@123' }),
    { JWT_SECRET: SEGREDO },
    db,
  );
  assert.equal(res.status, 400);
  assert.equal(db.linhas.length, 0);
});



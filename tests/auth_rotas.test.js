import assert from 'node:assert/strict';
import test from 'node:test';
import { hashSenha, sha256Hex, signJwt } from '../src/worker/crypto_seguranca.js';
import { alterarSenha, login, loginComGoogle, obterConfigAuth, registrar, verificarDominioAcademico } from '../src/worker/routes/auth_rotas.js';

const SEGREDO = 'segredo-de-teste-com-mais-de-32-caracteres!!';

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

test('loginComGoogle provisiona novo aluno institucional com domínio acadêmico', async () => {
  const db = criarBanco();
  const env = { JWT_SECRET: SEGREDO };

  const resposta = await loginComGoogle(
    requisicao({
      nome: 'Mariana Costa',
      email: 'mariana.costa@aluno.escola.edu.br',
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

test('loginComGoogle com professor institucional deduz perfil instrutor', async () => {
  const db = criarBanco();
  const env = { JWT_SECRET: SEGREDO };

  const resposta = await loginComGoogle(
    requisicao({
      nome: 'Prof. Carlos Eduardo',
      email: 'prof.carlos@educacao.sp.gov.br',
    }),
    env,
    db,
  );
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
  const env = { JWT_SECRET: SEGREDO };

  const resposta = await loginComGoogle(
    requisicao({
      email: 'silvia@escola.gov.br',
      avatar_url: 'https://lh3.googleusercontent.com/silvia',
    }),
    env,
    db,
  );
  const dados = await resposta.json();

  assert.equal(resposta.status, 200);
  assert.equal(dados.usuario.perfil, 'administrador');
  assert.equal(db.linhas[0].perfil, 'administrador');
});

test('loginComGoogle decodifica credencial JWT simulada do Google GIS', async () => {
  const db = criarBanco();
  const env = { JWT_SECRET: SEGREDO };

  const headerB64 = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64');
  const payloadB64 = Buffer.from(
    JSON.stringify({
      sub: 'google_sub_123456789',
      email: 'pedro.souza@colegio.edu.br',
      name: 'Pedro Souza',
      picture: 'https://lh3.googleusercontent.com/pedro',
      hd: 'colegio.edu.br',
    }),
  ).toString('base64');
  const fakeToken = `${headerB64}.${payloadB64}.fake_signature_bytes`;

  const resposta = await loginComGoogle(requisicao({ credential: fakeToken }), env, db);
  const dados = await resposta.json();

  assert.equal(resposta.status, 200);
  assert.equal(dados.usuario.email, 'pedro.souza@colegio.edu.br');
  assert.equal(dados.usuario.nome, 'Pedro Souza');
  assert.equal(dados.contaAcademica, true);
});

test('loginComGoogle recusa usuário inativo', async () => {
  const db = criarBanco([
    { id: 5, nome: 'Aluno Bloqueado', email: 'bloqueado@escola.edu.br', ativo: 0 },
  ]);
  const env = { JWT_SECRET: SEGREDO };

  const resposta = await loginComGoogle(
    requisicao({ email: 'bloqueado@escola.edu.br' }),
    env,
    db,
  );
  assert.equal(resposta.status, 403);
});

test('obterConfigAuth retorna googleClientId e status de configuração', async () => {
  const req = new Request('https://lms.test/api/auth/config', { method: 'GET' });

  // Sem secret configurada
  const res1 = await obterConfigAuth(req, {});
  const dados1 = await res1.json();
  assert.equal(dados1.googleClientId, '');
  assert.equal(dados1.googleConfigurado, false);

  // Com secret GOOGLE_CLIENT_ID configurada na Cloudflare/env
  const res2 = await obterConfigAuth(req, { GOOGLE_CLIENT_ID: 'meu-app-123.apps.googleusercontent.com' });
  const dados2 = await res2.json();
  assert.equal(dados2.googleClientId, 'meu-app-123.apps.googleusercontent.com');
  assert.equal(dados2.googleConfigurado, true);
});

test('loginComGoogle valida aud quando GOOGLE_CLIENT_ID está configurado nas secrets', async () => {
  const db = criarBanco();
  const CLIENT_ID_OFICIAL = '123456789-escola.apps.googleusercontent.com';
  const env = { JWT_SECRET: SEGREDO, GOOGLE_CLIENT_ID: CLIENT_ID_OFICIAL };

  const headerB64 = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64');

  // Token com aud divergente
  const payloadErrado = Buffer.from(
    JSON.stringify({
      aud: 'outro-app-hacker.apps.googleusercontent.com',
      email: 'tentativa@escola.edu.br',
      name: 'Hacker',
    }),
  ).toString('base64');
  const tokenErrado = `${headerB64}.${payloadErrado}.fake_signature`;

  const respostaErrada = await loginComGoogle(requisicao({ credential: tokenErrado }), env, db);
  assert.equal(respostaErrada.status, 401);

  // Token com aud correto
  const payloadCorreto = Buffer.from(
    JSON.stringify({
      aud: CLIENT_ID_OFICIAL,
      email: 'prof.ana@educacao.sp.gov.br',
      name: 'Professora Ana',
      hd: 'educacao.sp.gov.br',
    }),
  ).toString('base64');
  const tokenCorreto = `${headerB64}.${payloadCorreto}.fake_signature`;

  const respostaCorreta = await loginComGoogle(requisicao({ credential: tokenCorreto }), env, db);
  assert.equal(respostaCorreta.status, 200);
  const dadosCorretos = await respostaCorreta.json();
  assert.equal(dadosCorretos.usuario.email, 'prof.ana@educacao.sp.gov.br');
  assert.equal(dadosCorretos.usuario.perfil, 'instrutor');
});



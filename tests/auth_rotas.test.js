import assert from 'node:assert/strict';
import test from 'node:test';
import { hashSenha, sha256Hex, signJwt } from '../src/worker/crypto_seguranca.js';
import { alterarSenha, login, registrar } from '../src/worker/routes/auth_rotas.js';

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
                const [nome, email, senhaHash] = params;
                linhas.push({ id: proximoId, nome, email, senha_hash: senhaHash, perfil: 'aluno', ativo: 1 });
                proximoId += 1;
                return { meta: { last_row_id: proximoId - 1 } };
              }
              if (sql.startsWith('UPDATE usuarios SET senha_hash')) {
                const usuario = linhas.find((u) => u.id === params[1]);
                usuario.senha_hash = params[0];
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

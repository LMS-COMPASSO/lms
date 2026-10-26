import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CORS_HEADERS,
  SECURITY_HEADERS,
  aplicarCabecalhosSeguranca,
  jsonResponse,
  jsonErro,
} from '../src/worker/helpers_utilitarios.js';
import {
  login,
  loginComGoogle,
  resetarRateLimitLogin,
  LIMITE_TENTATIVAS_FALHAS,
} from '../src/worker/routes/auth_rotas.js';
import { atualizarUsuario } from '../src/worker/routes/usuarios_rotas.js';
import { criarModulo, atualizarModulo, excluirModulo } from '../src/worker/routes/modulos_rotas.js';
import { criarAula, atualizarAula, excluirAula } from '../src/worker/routes/aulas_rotas.js';
import { criarAvaliacao, excluirAvaliacao } from '../src/worker/routes/avaliacoes_rotas.js';
import { hashSenha, signJwt } from '../src/worker/crypto_seguranca.js';

const SEGREDO = 'segredo-de-teste-com-mais-de-32-caracteres!!';

function criarBancoFalso({ usuarios = [], cursos = [], modulos = [], aulas = [], avaliacoes = [] } = {}) {
  const tabelas = {
    usuarios: usuarios.map((u) => ({ ativo: 1, perfil: 'aluno', avatar_url: null, ...u })),
    cursos: cursos.map((c) => ({ status: 'publicado', ...c })),
    modulos: modulos.map((m) => ({ ...m })),
    aulas: aulas.map((a) => ({ duracao_min: 10, ...a })),
    avaliacoes: avaliacoes.map((av) => ({ ...av })),
  };

  return {
    tabelas,
    prepare(sql) {
      return {
        bind(...params) {
          return {
            async first() {
              if (sql.includes('FROM usuarios WHERE email = ?')) {
                return tabelas.usuarios.find((u) => u.email === params[0]) || null;
              }
              if (sql.includes('FROM usuarios WHERE id = ?')) {
                return tabelas.usuarios.find((u) => u.id === params[0]) || null;
              }
              if (sql.includes('FROM cursos WHERE id = ?')) {
                return tabelas.cursos.find((c) => c.id === params[0]) || null;
              }
              if (sql.includes('FROM modulos m JOIN cursos c ON m.curso_id = c.id WHERE m.id = ?')) {
                const modulo = tabelas.modulos.find((m) => m.id === params[0]);
                if (!modulo) return null;
                const curso = tabelas.cursos.find((c) => c.id === modulo.curso_id);
                return { id: modulo.id, instrutor_id: curso ? curso.instrutor_id : null };
              }
              if (sql.includes('FROM aulas a JOIN modulos m ON a.modulo_id = m.id JOIN cursos c ON m.curso_id = c.id WHERE a.id = ?')) {
                const aula = tabelas.aulas.find((a) => a.id === params[0]);
                if (!aula) return null;
                const modulo = tabelas.modulos.find((m) => m.id === aula.modulo_id);
                if (!modulo) return null;
                const curso = tabelas.cursos.find((c) => c.id === modulo.curso_id);
                return { id: aula.id, instrutor_id: curso ? curso.instrutor_id : null };
              }
              if (sql.includes('FROM avaliacoes av JOIN modulos m ON av.modulo_id = m.id JOIN cursos c ON m.curso_id = c.id WHERE av.id = ?')) {
                const av = tabelas.avaliacoes.find((a) => a.id === params[0]);
                if (!av) return null;
                const modulo = tabelas.modulos.find((m) => m.id === av.modulo_id);
                if (!modulo) return null;
                const curso = tabelas.cursos.find((c) => c.id === modulo.curso_id);
                return { id: av.id, instrutor_id: curso ? curso.instrutor_id : null };
              }
              throw new Error(`Consulta first() não prevista em teste: ${sql}`);
            },
            async all() {
              return { results: [] };
            },
            async run() {
              if (sql.startsWith('INSERT INTO modulos')) {
                const [cursoId, titulo, descricao, ordem] = params;
                const id = tabelas.modulos.length + 1;
                tabelas.modulos.push({ id, curso_id: cursoId, titulo, descricao, ordem });
                return { meta: { last_row_id: id } };
              }
              if (sql.startsWith('UPDATE modulos SET')) {
                return { meta: {} };
              }
              if (sql.startsWith('DELETE FROM modulos')) {
                return { meta: {} };
              }
              if (sql.startsWith('INSERT INTO aulas')) {
                const [moduloId, titulo, tipo, conteudo, urlRecurso, duracaoMin, ordem] = params;
                const id = tabelas.aulas.length + 1;
                tabelas.aulas.push({ id, modulo_id: moduloId, titulo, tipo, conteudo, url_recurso: urlRecurso, duracao_min: duracaoMin, ordem });
                return { meta: { last_row_id: id } };
              }
              if (sql.startsWith('UPDATE aulas SET')) {
                return { meta: {} };
              }
              if (sql.startsWith('DELETE FROM aulas')) {
                return { meta: {} };
              }
              if (sql.startsWith('INSERT INTO avaliacoes')) {
                const [moduloId, titulo, descricao, notaMinima, tentativasPermitidas] = params;
                const id = tabelas.avaliacoes.length + 1;
                tabelas.avaliacoes.push({ id, modulo_id: moduloId, titulo, descricao, nota_minima: notaMinima, tentativas_permitidas: tentativasPermitidas });
                return { meta: { last_row_id: id } };
              }
              if (sql.startsWith('DELETE FROM avaliacoes')) {
                return { meta: {} };
              }
              if (sql.startsWith('UPDATE usuarios SET')) {
                return { meta: {} };
              }
              throw new Error(`Consulta run() não prevista em teste: ${sql}`);
            },
          };
        },
      };
    },
    async batch() {
      return [];
    },
  };
}

function req(url, metodo, corpo, token, ip = '192.168.1.100') {
  const headers = {
    'Content-Type': 'application/json',
    'cf-connecting-ip': ip,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return new Request(url, {
    method: metodo,
    headers,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
}

test('MDN Web Security: cabeçalhos essenciais de segurança e pré-voo CORS configurados', () => {
  assert.ok(SECURITY_HEADERS['Content-Security-Policy'], 'CSP deve estar presente');
  assert.ok(SECURITY_HEADERS['Strict-Transport-Security'].includes('max-age=31536000'), 'HSTS deve ter max-age de 1 ano');
  assert.equal(SECURITY_HEADERS['X-Content-Type-Options'], 'nosniff', 'X-Content-Type-Options deve ser nosniff');
  assert.equal(SECURITY_HEADERS['X-Frame-Options'], 'SAMEORIGIN', 'X-Frame-Options deve ser SAMEORIGIN');
  assert.equal(SECURITY_HEADERS['Referrer-Policy'], 'strict-origin-when-cross-origin', 'Referrer-Policy deve ser strict-origin');
  assert.ok(SECURITY_HEADERS['Permissions-Policy'].includes('camera=()'), 'Permissions-Policy deve desabilitar APIs não usadas');
  assert.equal(SECURITY_HEADERS['Cross-Origin-Opener-Policy'], 'same-origin-allow-popups', 'COOP deve proteger contra cross-origin leaks');

  // CORS Preflight Caching (MDN)
  assert.equal(CORS_HEADERS['Access-Control-Max-Age'], '86400', 'Preflight deve ser cacheado por 24h');
});

test('MDN Web Security: aplicarCabecalhosSeguranca injeta cabeçalhos em respostas 200, 204 e personalizadas', () => {
  const res200 = aplicarCabecalhosSeguranca(new Response('OK', { status: 200 }));
  assert.equal(res200.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(res200.headers.get('X-Frame-Options'), 'SAMEORIGIN');
  assert.ok(res200.headers.get('Content-Security-Policy'));

  // Resposta 204 No Content não pode falhar por corpo nulo
  const res204 = aplicarCabecalhosSeguranca(new Response(null, { status: 204 }));
  assert.equal(res204.status, 204);
  assert.equal(res204.headers.get('X-Content-Type-Options'), 'nosniff');
});

test('MDN Web Security: mitigação de timing attack em login com usuário inexistente', async () => {
  resetarRateLimitLogin();
  const db = criarBancoFalso();
  const env = { JWT_SECRET: SEGREDO };

  const inicio = Date.now();
  const resposta = await login(
    req('https://lms.test/api/auth/login', 'POST', { email: 'inexistente@escola.gov.br', senha: 'SenhaIncorreta@123' }, null, '10.0.0.1'),
    env,
    db,
  );
  const duracao = Date.now() - inicio;

  assert.equal(resposta.status, 401);
  const corpo = await resposta.json();
  assert.equal(corpo.erro, 'Email ou senha inválidos.');
  // O teste deve levar tempo compatível com PBKDF2 (>15ms), não retornando instantaneamente (<2ms)
  assert.ok(duracao >= 10, `Deve calcular PBKDF2 fictício contra timing attacks (levou ${duracao}ms)`);
});

test('MDN Web Security: rate limiting bloqueia ataques de força bruta no login após limite de tentativas', async () => {
  resetarRateLimitLogin();
  const hash = await hashSenha('SenhaCerta@123');
  const db = criarBancoFalso({
    usuarios: [
      { id: 1, nome: 'Ana', email: 'aluna@escola.gov.br', senha_hash: hash },
      { id: 2, nome: 'Beto', email: 'beto@escola.gov.br', senha_hash: hash },
    ],
  });
  const env = { JWT_SECRET: SEGREDO };
  const ipAtacante = '203.0.113.42';

  // Executa LIMITE_TENTATIVAS_FALHAS tentativas incorretas
  for (let i = 0; i < LIMITE_TENTATIVAS_FALHAS; i += 1) {
    const res = await login(
      req('https://lms.test/api/auth/login', 'POST', { email: 'aluna@escola.gov.br', senha: 'errada' }, null, ipAtacante),
      env,
      db,
    );
    assert.equal(res.status, 401);
  }

  // A 6ª tentativa deve ser bloqueada com status 429 Too Many Requests
  const resBloqueada = await login(
    req('https://lms.test/api/auth/login', 'POST', { email: 'aluna@escola.gov.br', senha: 'errada' }, null, ipAtacante),
    env,
    db,
  );
  assert.equal(resBloqueada.status, 429);
  assert.ok(resBloqueada.headers.get('Retry-After'));
  const corpoBloqueado = await resBloqueada.json();
  assert.match(corpoBloqueado.erro, /Muitas tentativas/);

  // Tentativa correta sob mesmo IP enquanto bloqueado também é rejeitada com 429
  const resSenhaCertaSobBloqueio = await login(
    req('https://lms.test/api/auth/login', 'POST', { email: 'aluna@escola.gov.br', senha: 'SenhaCerta@123' }, null, ipAtacante),
    env,
    db,
  );
  assert.equal(resSenhaCertaSobBloqueio.status, 429);

  // Outra conta sob outro IP não bloqueado consegue logar com sucesso
  const resOutroUsuario = await login(
    req('https://lms.test/api/auth/login', 'POST', { email: 'beto@escola.gov.br', senha: 'SenhaCerta@123' }, null, '198.51.100.1'),
    env,
    db,
  );
  assert.equal(resOutroUsuario.status, 200);

  // Reset do rate limit libera a conta e IP
  resetarRateLimitLogin();
  const resAlunaLiberada = await login(
    req('https://lms.test/api/auth/login', 'POST', { email: 'aluna@escola.gov.br', senha: 'SenhaCerta@123' }, null, ipAtacante),
    env,
    db,
  );
  assert.equal(resAlunaLiberada.status, 200);
});

test('MDN Web Security: Google Login recusa bypass de credencial quando GOOGLE_CLIENT_ID configurado', async () => {
  const db = criarBancoFalso();
  const env = { JWT_SECRET: SEGREDO, GOOGLE_CLIENT_ID: 'google-client-id-oficial' };

  // Envio de email bruto sem token de credencial do Google
  const res = await loginComGoogle(
    req('https://lms.test/api/auth/google', 'POST', { email: 'aluno@escola.gov.br' }),
    env,
    db,
  );
  assert.equal(res.status, 401);
  const corpo = await res.json();
  assert.match(corpo.erro, /Credencial do Google é obrigatória/);
});

test('MDN Web Security: proteção contra IDOR em módulos, aulas e avaliações entre instrutores', async () => {
  const db = criarBancoFalso({
    usuarios: [
      { id: 10, nome: 'Instrutor Alice', email: 'alice@escola.gov.br', perfil: 'instrutor' },
      { id: 20, nome: 'Instrutor Bob', email: 'bob@escola.gov.br', perfil: 'instrutor' },
    ],
    cursos: [
      { id: 1, titulo: 'Curso da Alice', instrutor_id: 10 },
      { id: 2, titulo: 'Curso do Bob', instrutor_id: 20 },
    ],
    modulos: [
      { id: 101, curso_id: 1, titulo: 'Módulo de Alice' },
      { id: 201, curso_id: 2, titulo: 'Módulo de Bob' },
    ],
    aulas: [
      { id: 1001, modulo_id: 101, titulo: 'Aula de Alice' },
      { id: 2001, modulo_id: 201, titulo: 'Aula de Bob' },
    ],
    avaliacoes: [
      { id: 10001, modulo_id: 101, titulo: 'Avaliação de Alice' },
      { id: 20001, modulo_id: 201, titulo: 'Avaliação de Bob' },
    ],
  });
  const env = { JWT_SECRET: SEGREDO };

  // Token do Instrutor Bob (id: 20)
  const tokenBob = await signJwt({ id: 20, nome: 'Instrutor Bob', perfil: 'instrutor' }, SEGREDO);

  // Bob tenta criar módulo no curso de Alice (id: 1) -> deve ser recusado (403)
  await assert.rejects(
    criarModulo(req('https://lms.test/api', 'POST', { titulo: 'Módulo invasor' }, tokenBob), env, db, 1),
    /Acesso negado|Você não tem permissão/,
  );

  // Bob tenta editar módulo de Alice (id: 101) -> 403
  await assert.rejects(
    atualizarModulo(req('https://lms.test/api', 'PUT', { titulo: 'Novo título invasor' }, tokenBob), env, db, 101),
    /Você não tem permissão/,
  );

  // Bob tenta excluir aula de Alice (id: 1001) -> 403
  await assert.rejects(
    excluirAula(req('https://lms.test/api', 'DELETE', null, tokenBob), env, db, 1001),
    /Você não tem permissão/,
  );

  // Bob tenta excluir avaliação de Alice (id: 10001) -> 403
  await assert.rejects(
    excluirAvaliacao(req('https://lms.test/api', 'DELETE', null, tokenBob), env, db, 10001),
    /Você não tem permissão/,
  );
});

test('MDN Web Security: validação estrita de perfis autorizados em atualizarUsuario', async () => {
  const db = criarBancoFalso({
    usuarios: [
      { id: 1, nome: 'Admin', email: 'admin@escola.gov.br', perfil: 'administrador' },
      { id: 2, nome: 'Aluno', email: 'aluno@escola.gov.br', perfil: 'aluno' },
    ],
  });
  const env = { JWT_SECRET: SEGREDO };
  const tokenAdmin = await signJwt({ id: 1, nome: 'Admin', perfil: 'administrador' }, SEGREDO);

  // Tentar definir perfil inexistente/malicioso
  const resInvalido = await atualizarUsuario(
    req('https://lms.test/api', 'PUT', { perfil: 'super_root_invalido' }, tokenAdmin),
    env,
    db,
    2,
  );
  assert.equal(resInvalido.status, 400);
  const corpo = await resInvalido.json();
  assert.match(corpo.erro, /Perfil inválido/);
});

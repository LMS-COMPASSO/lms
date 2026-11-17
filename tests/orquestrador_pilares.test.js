import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import worker from '../src/worker/index.js';
import { signJwt } from '../src/worker/crypto_seguranca.js';
import { obterAvaliacao, responderAvaliacao } from '../src/worker/routes/avaliacoes_rotas.js';
import { obterAula } from '../src/worker/routes/aulas_rotas.js';
import { listarModulosDoCurso, atualizarModulo } from '../src/worker/routes/modulos_rotas.js';
import { criarUsuario, desativarUsuario } from '../src/worker/routes/usuarios_rotas.js';
import { listarMatriculas } from '../src/worker/routes/matriculas_rotas.js';
import {
  exportarMeusDadosLgpd,
  LIMITE_EXPORTACOES_LGPD,
  MAX_ENTRADAS_RATE_LIMIT,
  registrarTentativaFalhaLogin,
  resetarRateLimitExportacaoLgpd,
  resetarRateLimitLogin,
} from '../src/worker/routes/auth_rotas.js';

const SEGREDO = 'segredo-de-teste-orquestrador-com-mais-de-32-chars!';
const RAIZ = new URL('../', import.meta.url).pathname;

function criarReq(url, metodo = 'GET', corpo = null, token = null) {
  return new Request(url, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
}

function criarDbOrquestrador() {
  const usuarios = [
    { id: 1, nome: 'Admin Sistema', email: 'admin@escola.edu.br', perfil: 'administrador', avatar_url: null, ativo: 1, criado_em: '2026-10-01' },
    { id: 10, nome: 'Prof. Clara', email: 'clara@escola.edu.br', perfil: 'instrutor', avatar_url: null, ativo: 1, criado_em: '2026-10-01' },
    { id: 20, nome: 'Prof. Marcos', email: 'marcos@escola.edu.br', perfil: 'instrutor', avatar_url: null, ativo: 1, criado_em: '2026-10-01' },
    { id: 30, nome: 'Aluno Lucas', email: 'lucas@escola.edu.br', perfil: 'aluno', avatar_url: null, ativo: 1, criado_em: '2026-10-01' },
  ];
  const cursos = [
    { id: 1, titulo: 'Algoritmos Rascunho', status: 'rascunho', instrutor_id: 10 },
    { id: 2, titulo: 'Mundo Digital Publicado', status: 'publicado', instrutor_id: 10 },
  ];
  const modulos = [
    { id: 101, curso_id: 1, titulo: 'Módulo Rascunho', ordem: 1 },
    { id: 102, curso_id: 2, titulo: 'Módulo Publicado', ordem: 1 },
  ];
  const aulas = [
    { id: 1001, modulo_id: 101, titulo: 'Aula Secreta', tipo: 'texto', conteudo: 'Conteúdo rascunho' },
  ];
  const avaliacoes = [
    { id: 501, modulo_id: 101, titulo: 'Prova Rascunho', nota_minima: 6, tentativas_permitidas: 3 },
    { id: 502, modulo_id: 102, titulo: 'Prova Publicada', nota_minima: 6, tentativas_permitidas: 3 },
  ];
  const questoes = [
    { id: 601, avaliacao_id: 502, enunciado: 'Q1', tipo: 'multipla_escolha', pontos: 1, ordem: 1 },
    { id: 602, avaliacao_id: 502, enunciado: 'Q2', tipo: 'multipla_escolha', pontos: 1, ordem: 2 },
  ];
  const alternativas = [
    { id: 701, questao_id: 601, texto: 'Certa Q1', correta: 1 },
    { id: 702, questao_id: 601, texto: 'Errada Q1', correta: 0 },
    { id: 703, questao_id: 602, texto: 'Certa Q2', correta: 1 },
  ];
  const matriculas = [
    { id: 901, usuario_id: 30, curso_id: 2, status: 'ativa', progresso_percentual: 50, data_matricula: '2026-10-05', data_conclusao: null },
  ];
  const tentativas = [];

  return {
    tentativas,
    prepare(sql) {
      function ops(params = []) {
        return {
          async first() {
            if (sql.includes('FROM usuarios WHERE id = ?')) {
              return usuarios.find((u) => u.id === params[0]) || null;
            }
            if (sql.includes('FROM cursos WHERE id = ?')) {
              return cursos.find((c) => c.id === params[0]) || null;
            }
            if (sql.includes('SELECT * FROM avaliacoes WHERE id = ?')) {
              return avaliacoes.find((a) => a.id === params[0]) || null;
            }
            if (sql.includes('SELECT av.id, c.instrutor_id, c.status FROM avaliacoes av')) {
              const av = avaliacoes.find((a) => a.id === params[0]);
              if (!av) return null;
              const mod = modulos.find((m) => m.id === av.modulo_id);
              const crs = cursos.find((c) => c.id === mod?.curso_id);
              return { id: av.id, instrutor_id: crs?.instrutor_id, status: crs?.status };
            }
            if (sql.includes('SELECT * FROM aulas WHERE id = ?')) {
              return aulas.find((a) => a.id === params[0]) || null;
            }
            if (sql.includes('SELECT a.id, c.instrutor_id, c.status FROM aulas a')) {
              const aula = aulas.find((a) => a.id === params[0]);
              if (!aula) return null;
              const mod = modulos.find((m) => m.id === aula.modulo_id);
              const crs = cursos.find((c) => c.id === mod?.curso_id);
              return { id: aula.id, instrutor_id: crs?.instrutor_id, status: crs?.status };
            }
            if (sql.includes('FROM avaliacoes av JOIN modulos m ON m.id = av.modulo_id WHERE av.id = ?')) {
              const av = avaliacoes.find((a) => a.id === params[0]);
              if (!av) return null;
              const mod = modulos.find((m) => m.id === av.modulo_id);
              return { ...av, curso_id: mod?.curso_id };
            }
            if (sql.includes('FROM matriculas WHERE usuario_id = ? AND curso_id = ?')) {
              return matriculas.find((m) => m.usuario_id === params[0] && m.curso_id === params[1]) || null;
            }
            if (sql.includes('SELECT COUNT(*) AS total FROM tentativas_avaliacao')) {
              return { total: tentativas.filter((t) => t.matricula_id === params[0] && t.avaliacao_id === params[1]).length };
            }
            if (sql.includes('SELECT id FROM alternativas WHERE questao_id = ? AND correta = 1')) {
              return alternativas.find((a) => a.questao_id === params[0] && a.correta === 1) || null;
            }
            if (sql.includes('FROM preferencias_usuario')) {
              return { alto_contraste: 1, fonte_ampliada: 0, reduzir_movimento: 0, tema: 'escuro', atualizado_em: '2026-11-16' };
            }
            return null;
          },
          async all() {
            if (sql.includes('FROM questoes WHERE avaliacao_id = ?')) {
              return { results: questoes.filter((q) => q.avaliacao_id === params[0]) };
            }
            if (sql.includes('FROM alternativas WHERE questao_id = ?')) {
              const incluirCorreta = sql.includes('correta');
              return {
                results: alternativas
                  .filter((a) => a.questao_id === params[0])
                  .map((a) => (incluirCorreta ? a : { id: a.id, texto: a.texto })),
              };
            }
            if (sql.includes('FROM modulos WHERE curso_id = ?')) {
              return { results: modulos.filter((m) => m.curso_id === params[0]) };
            }
            if (sql.includes('FROM matriculas m LEFT JOIN cursos c')) {
              return { results: matriculas.filter((m) => m.usuario_id === params[0]).map((m) => ({ ...m, curso_titulo: 'Mundo Digital Publicado' })) };
            }
            if (sql.includes('FROM certificados cert')) {
              return { results: [] };
            }
            if (sql.includes('FROM usuario_medalhas um')) {
              return { results: [{ codigo: 'primeiro_passo', titulo: 'Primeiro Passo', eixo_bncc: 'Geral', conquistada_em: '2026-10-06' }] };
            }
            if (sql.includes('FROM desempenho_habilidades')) {
              return { results: [] };
            }
            if (sql.includes('FROM submissoes_python')) {
              return { results: [{ atividade_id: 'python3d-sequencia-labirinto', codigo_python: 'robo.avancar()', sucesso: 1, tentativas: 1, estrelas: 3, parceiro_dupla: null, papel_dupla: 'individual', criado_em: '2026-10-07' }] };
            }
            return { results: [] };
          },
          async run() {
            if (sql.includes('INSERT INTO tentativas_avaliacao')) {
              tentativas.push({
                matricula_id: params[0],
                avaliacao_id: params[1],
                nota: params[2],
                aprovado: params[3],
              });
              return { meta: { last_row_id: tentativas.length } };
            }
            return { meta: { changes: 1 } };
          },
        };
      }
      return { ...ops([]), bind: (...p) => ops(p) };
    },
  };
}

test('Pilar 1: responderAvaliacao deduplica questaoId repetido e impede fraude de nota', async () => {
  const db = criarDbOrquestrador();
  const env = { JWT_SECRET: SEGREDO };
  const tokenAluno = await signJwt({ id: 30, perfil: 'aluno' }, SEGREDO);

  // Envia a mesma questão 601 (1 ponto de 2 totais = 50% -> nota 5.0) cinco vezes para tentar fraudar nota 10.0
  const res = await responderAvaliacao(
    criarReq('https://lms.test/api/avaliacoes/502/responder', 'POST', {
      respostas: [
        { questaoId: 601, alternativaId: 701 },
        { questaoId: 601, alternativaId: 701 },
        { questaoId: 601, alternativaId: 701 },
        { questaoId: 601, alternativaId: 701 },
      ],
    }, tokenAluno),
    env,
    db,
    '502',
  );

  const dados = await res.json();
  assert.equal(res.status, 200);
  assert.equal(dados.nota, 5);
  assert.equal(dados.aprovado, false);
});

test('Pilar 1: bloqueia aluno em rascunho e oculta gabarito de outro instrutor em obterAvaliacao/obterAula/listarModulos', async () => {
  const db = criarDbOrquestrador();
  const env = { JWT_SECRET: SEGREDO };
  const tokenAluno = await signJwt({ id: 30, perfil: 'aluno' }, SEGREDO);
  const tokenClara = await signJwt({ id: 10, perfil: 'instrutor' }, SEGREDO);
  const tokenMarcos = await signJwt({ id: 20, perfil: 'instrutor' }, SEGREDO);

  // Aluno não pode acessar avaliação, aula ou módulos de curso em rascunho
  const resAvalAluno = await obterAvaliacao(criarReq('https://lms.test/api/avaliacoes/501', 'GET', null, tokenAluno), env, db, '501');
  assert.equal(resAvalAluno.status, 403);

  const resAulaAluno = await obterAula(criarReq('https://lms.test/api/aulas/1001', 'GET', null, tokenAluno), env, db, '1001');
  assert.equal(resAulaAluno.status, 403);

  const resModAluno = await listarModulosDoCurso(criarReq('https://lms.test/api/modulos/curso/1', 'GET', null, tokenAluno), env, db, '1');
  assert.equal(resModAluno.status, 403);

  // Marcos (outro instrutor) não pode ver avaliação em rascunho de Clara e não recebe gabarito em curso publicado de Clara
  const resMarcosRascunho = await obterAvaliacao(criarReq('https://lms.test/api/avaliacoes/501', 'GET', null, tokenMarcos), env, db, '501');
  assert.equal(resMarcosRascunho.status, 403);

  const resMarcosPub = await obterAvaliacao(criarReq('https://lms.test/api/avaliacoes/502', 'GET', null, tokenMarcos), env, db, '502');
  const avalMarcos = await resMarcosPub.json();
  assert.equal(resMarcosPub.status, 200);
  assert.equal('correta' in avalMarcos.questoes[0].alternativas[0], false);

  // Clara (autora do curso) recebe o gabarito completo
  const resClara = await obterAvaliacao(criarReq('https://lms.test/api/avaliacoes/502', 'GET', null, tokenClara), env, db, '502');
  const avalClara = await resClara.json();
  assert.equal(resClara.status, 200);
  assert.equal(avalClara.questoes[0].alternativas[0].correta, 1);
});

test('Pilar 1: rate limiter aplica poda limitada (anti-OOM) e inputs inválidos retornam 400', async () => {
  resetarRateLimitLogin();
  for (let i = 0; i <= MAX_ENTRADAS_RATE_LIMIT + 5; i += 1) {
    registrarTentativaFalhaLogin(`198.51.${Math.floor(i / 250)}.${i % 250}`, null);
  }
  assert.ok(MAX_ENTRADAS_RATE_LIMIT === 5000);
  resetarRateLimitLogin();

  const db = criarDbOrquestrador();
  const env = { JWT_SECRET: SEGREDO };
  const tokenAdmin = await signJwt({ id: 1, perfil: 'administrador' }, SEGREDO);

  const resSenhaCurta = await criarUsuario(
    criarReq('https://lms.test/api/usuarios', 'POST', { nome: 'Teste', email: 'novo@escola.edu.br', senha: '123', perfil: 'aluno' }, tokenAdmin),
    env,
    db,
  );
  assert.equal(resSenhaCurta.status, 400);

  await assert.rejects(
    listarMatriculas(criarReq('https://lms.test/api/matriculas?curso_id=abc', 'GET', null, tokenAdmin), env, db, new URL('https://lms.test/api/matriculas?curso_id=abc')),
    (err) => err.status === 400,
  );

  // Atualiza módulo com título vazio deve retornar 400
  const dbMod = {
    prepare(sql) {
      return {
        bind() {
          return {
            async first() {
              if (sql.includes('FROM usuarios')) return { id: 10, perfil: 'instrutor', ativo: 1 };
              return { id: 102, instrutor_id: 10 };
            },
            async run() { return { meta: { changes: 1 } }; },
          };
        },
      };
    },
  };
  const tokenClara = await signJwt({ id: 10, perfil: 'instrutor' }, SEGREDO);
  const resModVazio = await atualizarModulo(criarReq('https://lms.test/api/modulos/102', 'PUT', { titulo: '   ' }, tokenClara), env, dbMod, '102');
  assert.equal(resModVazio.status, 400);
});

test('Pilar 2: endpoint LGPD com rate limit, anonimização SUS (Art. 16, II), rotas /terms e /privacy e docs completos', async () => {
  resetarRateLimitExportacaoLgpd();
  const db = criarDbOrquestrador();
  const env = {
    JWT_SECRET: SEGREDO,
    ASSETS: {
      async fetch(req) {
        return new Response(`asset:${new URL(req.url).pathname}`, { status: 200 });
      },
    },
  };
  const tokenAluno = await signJwt({ id: 30, perfil: 'aluno' }, SEGREDO);

  // Portabilidade JSON (LGPD Art. 18)
  const resExport = await exportarMeusDadosLgpd(
    criarReq('https://lms.test/api/auth/exportar-dados', 'GET', null, tokenAluno),
    env,
    db,
  );
  assert.equal(resExport.status, 200);
  const pacote = await resExport.json();
  assert.match(pacote.fundamentoLegal, /LGPD/);
  assert.equal(pacote.controlador.encarregadoDpo, 'dpo@lms-compasso.edu.br');
  assert.equal(pacote.dadosTitular.perfil.id, 30);
  assert.equal(pacote.dadosTitular.matriculas.length, 1);
  assert.equal(pacote.dadosTitular.submissoesPython.length, 1);

  // Rate limiting de exportação LGPD (máximo LIMITE_EXPORTACOES_LGPD por hora por usuário)
  for (let i = 1; i < LIMITE_EXPORTACOES_LGPD; i += 1) {
    const resExtra = await exportarMeusDadosLgpd(
      criarReq('https://lms.test/api/auth/exportar-dados', 'GET', null, tokenAluno),
      env,
      db,
    );
    assert.equal(resExtra.status, 200);
  }
  const resBloqueada = await exportarMeusDadosLgpd(
    criarReq('https://lms.test/api/auth/exportar-dados', 'GET', null, tokenAluno),
    env,
    db,
  );
  assert.equal(resBloqueada.status, 429);
  assert.ok(resBloqueada.headers.get('Retry-After'));
  resetarRateLimitExportacaoLgpd();

  // Anonimização de registros SUS na desativação do usuário (LGPD Art. 16, II)
  const queriesExecutadas = [];
  const dbAnon = {
    prepare(sql) {
      return {
        bind(...params) {
          return {
            async first() {
              if (sql.includes('FROM usuarios WHERE id = ?')) {
                return { id: 1, perfil: 'administrador', ativo: 1 };
              }
              return null;
            },
            async run() {
              queriesExecutadas.push({ sql, params });
              return { meta: { changes: 1 } };
            },
          };
        },
      };
    },
  };
  const tokenAdmin = await signJwt({ id: 1, perfil: 'administrador' }, SEGREDO);
  const resDesativar = await desativarUsuario(
    criarReq('https://lms.test/api/usuarios/30', 'DELETE', null, tokenAdmin),
    env,
    dbAnon,
    '30',
  );
  assert.equal(resDesativar.status, 200);
  assert.ok(
    queriesExecutadas.some((q) => q.sql.includes('UPDATE avaliacoes_usabilidade_sus') && q.sql.includes('usuario_id = NULL') && q.params[0] === 30),
    'desativarUsuario deve desvincular e anonimizar registros SUS conforme LGPD Art. 16, II',
  );

  // Reescrita de rotas amigáveis /terms e /privacy com headers de segurança
  const resTerms = await worker.fetch(new Request('https://lms.test/terms'), env);
  assert.equal(await resTerms.text(), 'asset:/terms.html');
  assert.equal(resTerms.headers.get('X-Content-Type-Options'), 'nosniff');

  const resPrivacy = await worker.fetch(new Request('https://lms.test/privacy'), env);
  assert.equal(await resPrivacy.text(), 'asset:/privacy.html');
  assert.equal(resPrivacy.headers.get('X-Frame-Options'), 'SAMEORIGIN');

  // Documentos Markdown e HTML públicos servidos pelo Worker
  const privMd = fs.readFileSync(path.join(RAIZ, 'docs/politica-de-privacidade.md'), 'utf8');
  assert.ok(privMd.includes('Cloudflare, Inc.'));
  assert.ok(privMd.includes('Google LLC'));
  assert.ok(privMd.includes('jsDelivr CDN'));
  assert.ok(privMd.includes('lms_token'));
  assert.ok(privMd.includes('Art. 18'));
  assert.ok(privMd.includes('Art. 16, II'));

  const termsMd = fs.readFileSync(path.join(RAIZ, 'docs/termos-de-servico.md'), 'utf8');
  assert.ok(termsMd.includes('Licença MIT'));
  assert.ok(termsMd.includes('Grajaú'));

  const privHtml = fs.readFileSync(path.join(RAIZ, 'public/privacy.html'), 'utf8');
  assert.ok(privHtml.includes('Art. 18 da LGPD'));
  assert.ok(privHtml.includes('Art. 16, II'));

  const termsHtml = fs.readFileSync(path.join(RAIZ, 'public/terms.html'), 'utf8');
  assert.ok(termsHtml.includes('Licença MIT'));
  assert.equal(fs.existsSync(path.join(RAIZ, 'src/components/LegalPages.tsx')), false);
});

test('Pilar 3: ativos do Notion (1500x600 safe zone 900x350, ícones 280x280 stroke=2) e ilustrações CSS-var', () => {
  const covers = [
    'public/img/notion/cover-lms-compasso-1500x600.svg',
    'public/img/notion/cover-eixos-bncc-1500x600.svg',
  ];
  for (const rel of covers) {
    const svg = fs.readFileSync(path.join(RAIZ, rel), 'utf8');
    assert.ok(svg.includes('width="1500" height="600"'), `${rel} deve ter 1500x600`);
    assert.ok(svg.includes('data-safe-area="300 125 900 350"'), `${rel} deve demarcar zona segura 900x350`);
  }

  const icons = [
    'public/img/notion/icon-pensamento-computacional-280x280.svg',
    'public/img/notion/icon-mundo-digital-280x280.svg',
    'public/img/notion/icon-cultura-digital-280x280.svg',
    'public/img/notion/icon-governanca-lgpd-280x280.svg',
  ];
  for (const rel of icons) {
    const svg = fs.readFileSync(path.join(RAIZ, rel), 'utf8');
    assert.ok(svg.includes('width="280" height="280"'), `${rel} deve ter 280x280`);
    assert.ok(svg.includes('fill="none"'), `${rel} deve ter fundo transparente`);
    assert.ok(svg.includes('stroke-width="2"'), `${rel} deve usar stroke-width="2"`);
    assert.ok(svg.includes('prefers-color-scheme: dark'), `${rel} deve suportar Light/Dark mode`);
  }

  const ilustracoes = [
    'public/img/ilustracoes/empty-state-trilha.svg',
    'public/img/ilustracoes/hero-onboarding-bncc.svg',
  ];
  for (const rel of ilustracoes) {
    const svg = fs.readFileSync(path.join(RAIZ, rel), 'utf8');
    assert.ok(svg.includes('currentColor'), `${rel} deve usar currentColor`);
    assert.ok(svg.includes('var(--cor-'), `${rel} deve usar variáveis CSS do projeto`);
  }

  const arteDoc = fs.readFileSync(path.join(RAIZ, 'docs/direcao-de-arte-notion-ativos.md'), 'utf8');
  assert.ok(arteDoc.includes('oklch('));
  assert.ok(arteDoc.includes('Prompt Técnico (EN):'));
});

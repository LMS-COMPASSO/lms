import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import worker from '../src/worker/index.js';
import { signJwt } from '../src/worker/crypto_seguranca.js';
import { exportarMeusDadosLgpd, resetarRateLimitExportacaoLgpd } from '../src/worker/routes/auth_rotas.js';
import { desativarUsuario } from '../src/worker/routes/usuarios_rotas.js';
import {
  sanitizarBlocosWorkspace,
  listarWorkspaceItens,
  criarWorkspaceItem,
  obterWorkspaceItem,
  atualizarWorkspaceItem,
  atualizarStatusWorkspaceItem,
  excluirWorkspaceItem,
  apagarTodosWorkspaceItens,
} from '../src/worker/routes/workspace_rotas.js';
import {
  movimentoReduzidoAtivo,
  executarComMatchMedia,
  animarFlip,
  animarRevelacaoScroll,
  animarFeedbackGamificacao,
} from '../public/js/animacoes-gsap.js';
import {
  CAPAS_NOTION,
  ILUSTRACOES_EDUCACIONAIS,
  PADROES_GEOMETRICOS,
  ICONES_WORKSPACE,
  gerarSvgPadraoGeometrico,
  renderizarCapaHtml,
} from '../public/js/acervo-visual.js';
import {
  executarFilaOfflineSequencial,
  itemAtendeFiltroWorkspace,
} from '../public/js/workspace.js';

const RAIZ = new URL('../', import.meta.url).pathname;
const SEGREDO = 'segredo-de-teste-evolucao-notion-gsap-32-chars!';

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

function criarDbWorkspaceMock() {
  const usuarios = [
    { id: 1, nome: 'Admin', email: 'admin@escola.edu.br', perfil: 'administrador', ativo: 1, criado_em: '2026-10-01' },
    { id: 10, nome: 'Estudante Ana', email: 'ana@escola.edu.br', perfil: 'aluno', ativo: 1, criado_em: '2026-10-01' },
    { id: 20, nome: 'Estudante Bruno', email: 'bruno@escola.edu.br', perfil: 'aluno', ativo: 1, criado_em: '2026-10-01' },
  ];
  const cursos = [
    { id: 5, titulo: 'Algoritmos e Python 3D' },
  ];
  const workspaceItens = [];
  const queriesLog = [];
  let seqId = 1;

  return {
    workspaceItens,
    queriesLog,
    prepare(sql) {
      function ops(params = []) {
        return {
          async first() {
            if (sql.includes("name='estudante_workspace_itens'")) {
              return { name: 'estudante_workspace_itens' };
            }
            if (sql.includes('FROM usuarios WHERE id = ?')) {
              return usuarios.find((u) => u.id === params[0]) || null;
            }
            if (sql.includes('SELECT id, usuario_id, status, ordem FROM estudante_workspace_itens WHERE id = ?')) {
              return workspaceItens.find((w) => w.id === params[0]) || null;
            }
            if (sql.includes('SELECT id, usuario_id FROM estudante_workspace_itens WHERE id = ?')) {
              return workspaceItens.find((w) => w.id === params[0]) || null;
            }
            if (sql.includes('FROM estudante_workspace_itens w') && sql.includes('WHERE w.id = ?')) {
              const item = workspaceItens.find((w) => w.id === params[0]);
              if (!item) return null;
              const curso = cursos.find((c) => c.id === item.curso_id);
              return { ...item, curso_titulo: curso?.titulo || null };
            }
            return null;
          },
          async all() {
            if (sql.includes('FROM estudante_workspace_itens w')) {
              let lista = workspaceItens.filter((w) => w.usuario_id === params[0]);
              let idx = 1;
              if (sql.includes('AND w.status = ?')) {
                const st = params[idx++];
                lista = lista.filter((w) => w.status === st);
              }
              if (sql.includes('AND w.eixo_bncc = ?')) {
                const eixo = params[idx++];
                lista = lista.filter((w) => w.eixo_bncc === eixo);
              }
              if (sql.includes('AND w.prioridade = ?')) {
                const prio = params[idx++];
                lista = lista.filter((w) => w.prioridade === prio);
              }
              if (sql.includes('AND w.curso_id = ?')) {
                const cid = params[idx++];
                lista = lista.filter((w) => w.curso_id === cid);
              }
              if (sql.includes('AND (w.titulo LIKE ?')) {
                const termo = String(params[idx] || '').replace(/%/g, '').toLowerCase();
                lista = lista.filter((w) =>
                  w.titulo.toLowerCase().includes(termo)
                  || String(w.habilidade_codigo || '').toLowerCase().includes(termo)
                  || String(w.blocos_json || '').toLowerCase().includes(termo));
              }
              return {
                results: lista.map((w) => ({
                  ...w,
                  curso_titulo: cursos.find((c) => c.id === w.curso_id)?.titulo || null,
                })),
              };
            }
            if (sql.includes('FROM estudante_workspace_itens WHERE usuario_id = ?')) {
              return { results: workspaceItens.filter((w) => w.usuario_id === params[0]) };
            }
            return { results: [] };
          },
          async run() {
            queriesLog.push({ sql, params });
            if (sql.includes('INSERT INTO estudante_workspace_itens')) {
              const id = seqId++;
              const novo = {
                id,
                usuario_id: params[0],
                titulo: params[1],
                status: params[2],
                eixo_bncc: params[3],
                habilidade_codigo: params[4],
                curso_id: params[5],
                prioridade: params[6],
                prazo: params[7],
                cover_id: params[8],
                icone_id: params[9],
                template_origem: params[10],
                blocos_json: params[11],
                ordem: params[12],
                criado_em: '2026-11-16T12:00:00Z',
                atualizado_em: '2026-11-16T12:00:00Z',
              };
              workspaceItens.push(novo);
              return { meta: { last_row_id: id, changes: 1 } };
            }
            if (sql.startsWith('UPDATE estudante_workspace_itens SET status = ?, ordem = ?')) {
              const [status, ordem, id, uid] = params;
              const alvo = workspaceItens.find((w) => w.id === id && w.usuario_id === uid);
              if (alvo) {
                alvo.status = status;
                alvo.ordem = ordem;
              }
              return { meta: { changes: alvo ? 1 : 0 } };
            }
            if (sql.startsWith('UPDATE estudante_workspace_itens SET')) {
              const id = params[params.length - 2];
              const uid = params[params.length - 1];
              const alvo = workspaceItens.find((w) => w.id === id && w.usuario_id === uid);
              if (alvo) {
                const setPart = sql.split('SET ')[1].split(' WHERE')[0];
                const assignments = setPart.split(',').map((s) => s.trim()).filter((s) => s.endsWith('= ?'));
                assignments.forEach((a, i) => {
                  const col = a.replace(' = ?', '');
                  alvo[col] = params[i];
                });
              }
              return { meta: { changes: alvo ? 1 : 0 } };
            }
            if (sql.includes('DELETE FROM estudante_workspace_itens WHERE id = ? AND usuario_id = ?')) {
              const [id, uid] = params;
              const antes = workspaceItens.length;
              const rest = workspaceItens.filter((w) => !(w.id === id && w.usuario_id === uid));
              workspaceItens.length = 0;
              workspaceItens.push(...rest);
              return { meta: { changes: antes - workspaceItens.length } };
            }
            if (sql.includes('DELETE FROM estudante_workspace_itens WHERE usuario_id = ?')) {
              const uid = params[0];
              const antes = workspaceItens.length;
              const rest = workspaceItens.filter((w) => w.usuario_id !== uid);
              workspaceItens.length = 0;
              workspaceItens.push(...rest);
              return { meta: { changes: antes - workspaceItens.length } };
            }
            return { meta: { changes: 1 } };
          },
        };
      }
      return { ...ops([]), bind: (...p) => ops(p) };
    },
  };
}

test('Pilar 1: rotas REST do Workspace (CRUD, filtros, anti-IDOR, sanitização de blocos e LGPD Art. 18)', async () => {
  const db = criarDbWorkspaceMock();
  const env = { JWT_SECRET: SEGREDO, DB: db };
  const tokenAna = await signJwt({ id: 10, perfil: 'aluno' }, SEGREDO);
  const tokenBruno = await signJwt({ id: 20, perfil: 'aluno' }, SEGREDO);
  const tokenAdmin = await signJwt({ id: 1, perfil: 'administrador' }, SEGREDO);

  // 1. Sanitização de blocos suportados
  const sanitizado = sanitizarBlocosWorkspace([
    { id: 'b1', tipo: 'titulo', nivel: 'h3', texto: 'Seção 1' },
    { id: 'b2', tipo: 'checklist', texto: 'Validar algoritmo', concluido: true },
    { id: 'b3', tipo: 'toggle', texto: 'Resumo', detalhe: 'Conceito de laço', aberto: true },
    { id: 'b4', tipo: 'callout', tom: 'mundo', texto: 'Lembrete hardware' },
    { id: 'b5', tipo: 'codigo', linguagem: 'python', texto: 'robo.avancar()' },
    { id: 'b6', tipo: 'bncc', habilidade: 'ef69co03', detalhe: 'Python 3D' },
    { id: 'b7', tipo: 'desconhecido_xss', texto: 'Fallback seguro' },
  ]);
  assert.ok(sanitizado);
  assert.equal(sanitizado.blocos[5].habilidade, 'EF69CO03');
  assert.equal(sanitizado.blocos[6].tipo, 'paragrafo');

  // 2. Validação de entradas inválidas retorna 400
  const resInvalido = await criarWorkspaceItem(
    criarReq('https://lms.test/api/workspace', 'POST', {
      titulo: 'Projeto inválido',
      habilidade_codigo: 'INVALIDO',
    }, tokenAna),
    env,
    db,
  );
  assert.equal(resInvalido.status, 400);

  // 3. Criação via Worker fetch /api/workspace
  const resCriar = await worker.fetch(
    criarReq('https://lms.test/api/workspace', 'POST', {
      titulo: 'Protótipo Robô Reciclador',
      status: 'planejando',
      eixo_bncc: 'Pensamento Computacional',
      habilidade_codigo: 'EF69CO04',
      curso_id: 5,
      prioridade: 'alta',
      prazo: '2026-12-10',
      cover_id: 'cover-algoritmos',
      icone_id: 'icon-cube-3d',
      template_origem: 'canvas-ideia-projeto',
      blocos: [
        { tipo: 'checklist', texto: 'Passo 1', concluido: true },
        { tipo: 'checklist', texto: 'Passo 2', concluido: false },
      ],
    }, tokenAna),
    env,
  );
  assert.equal(resCriar.status, 201);
  const criado = await resCriar.json();
  assert.equal(criado.titulo, 'Protótipo Robô Reciclador');
  assert.equal(criado.checklist_total, 2);
  assert.equal(criado.checklist_concluidos, 1);

  // 4. Listagem com filtros
  const resLista = await listarWorkspaceItens(
    criarReq('https://lms.test/api/workspace?eixo_bncc=Pensamento%20Computacional&busca=Reciclador', 'GET', null, tokenAna),
    env,
    db,
    new URL('https://lms.test/api/workspace?eixo_bncc=Pensamento%20Computacional&busca=Reciclador'),
  );
  const listaDados = await resLista.json();
  assert.equal(resLista.status, 200);
  assert.equal(listaDados.itens.length, 1);
  assert.equal(listaDados.itens[0].curso_titulo, 'Algoritmos e Python 3D');

  // 5. Anti-IDOR: Bruno (usuário 20) NÃO pode ler, editar ou excluir item da Ana (usuário 10)
  const resIdorGet = await obterWorkspaceItem(
    criarReq(`https://lms.test/api/workspace/${criado.id}`, 'GET', null, tokenBruno),
    env,
    db,
    String(criado.id),
  );
  assert.equal(resIdorGet.status, 403);

  const resIdorPut = await atualizarWorkspaceItem(
    criarReq(`https://lms.test/api/workspace/${criado.id}`, 'PUT', { titulo: 'Sequestrado' }, tokenBruno),
    env,
    db,
    String(criado.id),
  );
  assert.equal(resIdorPut.status, 403);

  const resIdorDel = await excluirWorkspaceItem(
    criarReq(`https://lms.test/api/workspace/${criado.id}`, 'DELETE', null, tokenBruno),
    env,
    db,
    String(criado.id),
  );
  assert.equal(resIdorDel.status, 403);

  // 6. Atualização de status (Kanban move) pela própria titular
  const resStatus = await atualizarStatusWorkspaceItem(
    criarReq(`https://lms.test/api/workspace/${criado.id}/status`, 'PATCH', { status: 'execucao', ordem: 2 }, tokenAna),
    env,
    db,
    String(criado.id),
  );
  assert.equal(resStatus.status, 200);
  const statusJson = await resStatus.json();
  assert.equal(statusJson.status, 'execucao');

  // 7. Portabilidade LGPD (GET /api/auth/exportar-dados) inclui workspaceItens
  resetarRateLimitExportacaoLgpd();
  const resLgpd = await exportarMeusDadosLgpd(
    criarReq('https://lms.test/api/auth/exportar-dados', 'GET', null, tokenAna),
    env,
    db,
  );
  assert.equal(resLgpd.status, 200);
  const pacoteLgpd = await resLgpd.json();
  assert.ok(Array.isArray(pacoteLgpd.dadosTitular.workspaceItens));
  assert.equal(pacoteLgpd.dadosTitular.workspaceItens.length, 1);
  assert.equal(pacoteLgpd.dadosTitular.workspaceItens[0].titulo, 'Protótipo Robô Reciclador');

  // 8. Autoatendimento LGPD Art. 18, VI: apagar todos os próprios itens (DELETE /api/workspace)
  const resApagarTudo = await apagarTodosWorkspaceItens(
    criarReq('https://lms.test/api/workspace', 'DELETE', null, tokenAna),
    env,
    db,
  );
  assert.equal(resApagarTudo.status, 200);
  const jsonApagados = await resApagarTudo.json();
  assert.equal(jsonApagados.removidos, 1);
  assert.equal(db.workspaceItens.length, 0);

  // 9. Desativação administrativa remove definitivamente itens do Workspace do usuário
  await criarWorkspaceItem(
    criarReq('https://lms.test/api/workspace', 'POST', { titulo: 'Nota antes de desativar' }, tokenAna),
    env,
    db,
  );
  assert.equal(db.workspaceItens.length, 1);
  const resDesativar = await desativarUsuario(
    criarReq('https://lms.test/api/usuarios/10', 'DELETE', null, tokenAdmin),
    env,
    db,
    '10',
  );
  assert.equal(resDesativar.status, 200);
  assert.equal(db.workspaceItens.length, 0);
});

test('Pilar 2: utilitário GSAP respeita matchMedia, prefers-reduced-motion e flags lms_a11y_*', () => {
  const chamadas = [];
  const estadoOriginalWindow = global.window;
  const estadoOriginalDoc = global.document;
  const estadoOriginalStorage = global.localStorage;

  try {
    const criarMockGsap = (simularReducedMedia = false) => ({
      registerPlugin: (...p) => chamadas.push({ fn: 'registerPlugin', count: p.length }),
      set: (alvos, props) => chamadas.push({ fn: 'set', alvos, props }),
      from: (alvos, props) => chamadas.push({ fn: 'from', alvos, props }),
      fromTo: (alvos, fromProps, toProps) => chamadas.push({ fn: 'fromTo', alvos, fromProps, toProps }),
      to: (alvos, props) => chamadas.push({ fn: 'to', alvos, props }),
      matchMedia: () => ({
        add(_queries, cb) {
          cb({ conditions: { reduzido: simularReducedMedia, normal: !simularReducedMedia } });
        },
        revert() {
          chamadas.push({ fn: 'revert' });
        },
      }),
    });

    const mockFlip = {
      getState: () => ({ mockState: true }),
      from: (_st, opts) => chamadas.push({ fn: 'Flip.from', opts }),
    };

    const mockScrollTrigger = { name: 'ScrollTrigger' };

    const storage = {};
    global.localStorage = {
      getItem: (k) => storage[k] || null,
      setItem: (k, v) => { storage[k] = String(v); },
      removeItem: (k) => { delete storage[k]; },
    };

    const fakeEl = { style: {}, parentElement: { id: 'pai' } };
    global.document = {
      documentElement: { classList: { contains: () => false } },
      querySelectorAll: () => [fakeEl],
    };

    // Caso A: LMS flag lms_a11y_reduzir-movimento = '1' -> deve acionar gsap.set e NÃO animar Flip/from
    storage['lms_a11y_reduzir-movimento'] = '1';
    global.window = {
      matchMedia: () => ({ matches: false }),
      addEventListener: () => {},
    };
    assert.equal(movimentoReduzidoAtivo(), true);

    chamadas.length = 0;
    const gsapRed = criarMockGsap(false);
    let domExecutado = false;
    const usouFlip = animarFlip('.ws-card', () => { domExecutado = true; }, { gsap: gsapRed, Flip: mockFlip });
    assert.equal(domExecutado, true);
    assert.equal(usouFlip, false);
    assert.ok(chamadas.some((c) => c.fn === 'set'), 'Em movimento reduzido deve aplicar estado final via gsap.set');
    assert.equal(chamadas.some((c) => c.fn === 'Flip.from'), false, 'Em movimento reduzido não deve rodar Flip.from');

    chamadas.length = 0;
    animarRevelacaoScroll('.sp-perfil-card', { gsap: gsapRed, ScrollTrigger: mockScrollTrigger });
    assert.ok(chamadas.some((c) => c.fn === 'set'), 'ScrollTrigger reduzido deve aplicar estado final imediato');
    assert.equal(chamadas.some((c) => c.fn === 'from'), false);

    // Caso B: Sem redução de movimento -> deve encapsular em gsap.matchMedia() e executar Flip/ScrollTrigger
    delete storage['lms_a11y_reduzir-movimento'];
    assert.equal(movimentoReduzidoAtivo(), false);

    chamadas.length = 0;
    const gsapNorm = criarMockGsap(false);
    const usouFlipNormal = animarFlip('.ws-card', () => {}, { gsap: gsapNorm, Flip: mockFlip });
    assert.equal(usouFlipNormal, true);
    assert.ok(chamadas.some((c) => c.fn === 'Flip.from'), 'Deve animar transição de layout com GSAP Flip');

    chamadas.length = 0;
    animarRevelacaoScroll('.sp-perfil-card', { gsap: gsapNorm, ScrollTrigger: mockScrollTrigger });
    assert.ok(chamadas.some((c) => c.fn === 'from' && c.props.scrollTrigger), 'Deve configurar ScrollTrigger no matchMedia');

    chamadas.length = 0;
    animarFeedbackGamificacao(fakeEl, 'medalha', { gsap: gsapNorm });
    assert.ok(chamadas.some((c) => c.fn === 'fromTo'));

    // Caso C: Sistema operacional com prefers-reduced-motion: reduce
    global.window.matchMedia = () => ({ matches: true });
    assert.equal(movimentoReduzidoAtivo(), true);
    let callbackReduzidoChamado = false;
    executarComMatchMedia(
      () => assert.fail('Não deve chamar animação quando prefers-reduced-motion está ativo'),
      () => { callbackReduzidoChamado = true; },
      { gsap: gsapNorm },
    );
    assert.equal(callbackReduzidoChamado, true);
  } finally {
    global.window = estadoOriginalWindow;
    global.document = estadoOriginalDoc;
    global.localStorage = estadoOriginalStorage;
  }
});

test('Pilar 3 & 4: integridade das novas capas Notion (1500x600), ilustrações CSS-var, padrões SVG, sprite, schema e LGPD docs', () => {
  // 1. Todas as 6 capas Notion 1500x600 com safe zone 900x350
  assert.equal(CAPAS_NOTION.length, 6);
  for (const capa of CAPAS_NOTION) {
    const caminho = path.join(RAIZ, 'public', capa.url);
    assert.ok(fs.existsSync(caminho), `Capa Notion ausente: ${capa.url}`);
    const svg = fs.readFileSync(caminho, 'utf8');
    assert.ok(svg.includes('width="1500" height="600"'), `${capa.url} deve ter 1500x600`);
    assert.ok(svg.includes('data-safe-area="300 125 900 350"'), `${capa.url} deve ter zona segura 900x350`);
  }

  // 2. Todas as 6 ilustrações modulares usando currentColor + variáveis CSS
  assert.equal(ILUSTRACOES_EDUCACIONAIS.length, 6);
  for (const ilus of ILUSTRACOES_EDUCACIONAIS) {
    const caminho = path.join(RAIZ, 'public', ilus.url);
    assert.ok(fs.existsSync(caminho), `Ilustração ausente: ${ilus.url}`);
    const svg = fs.readFileSync(caminho, 'utf8');
    assert.ok(svg.includes('currentColor'), `${ilus.url} deve usar currentColor`);
    assert.ok(svg.includes('var(--cor-'), `${ilus.url} deve usar tokens CSS var(--cor-*)`);
    const htmlImg = renderizarCapaHtml(ilus.id);
    assert.ok(htmlImg.includes('loading="lazy"') && htmlImg.includes('decoding="async"'));
  }

  // 3. Todos os 7 padrões geométricos e gradientes tokenizados
  assert.equal(PADROES_GEOMETRICOS.length, 7);
  for (const padrao of PADROES_GEOMETRICOS) {
    const svg = gerarSvgPadraoGeometrico(padrao.id);
    assert.ok(svg.includes('<svg') && svg.includes('var(--cor-'), `Padrão ${padrao.id} deve usar variáveis CSS`);
  }

  // 4. Símbolos expandidos no sprite SVG e registro de ícones
  const spriteSvg = fs.readFileSync(path.join(RAIZ, 'public/img/icons-sprite.svg'), 'utf8');
  const iconRegistry = JSON.parse(fs.readFileSync(path.join(RAIZ, 'public/data/icon-registry.json'), 'utf8'));
  assert.ok(iconRegistry.workspaceEBloqueio, 'icon-registry.json deve conter seção workspaceEBloqueio');
  for (const ic of ICONES_WORKSPACE) {
    assert.ok(spriteSvg.includes(`id="${ic.id}"`), `Sprite SVG deve conter ${ic.id}`);
  }

  // 5. GSAP local vendor bundle presente (sem CDN externo de terceiros para GSAP)
  for (const lib of ['gsap.min.js', 'ScrollTrigger.min.js', 'Flip.min.js']) {
    assert.ok(fs.existsSync(path.join(RAIZ, 'public/js/vendor', lib)), `Bundle local ausente: ${lib}`);
  }

  // 6. Schema SQL, migração e documentação LGPD sincronizados
  const schemaSql = fs.readFileSync(path.join(RAIZ, 'd1/schema.sql'), 'utf8');
  assert.ok(schemaSql.includes('CREATE TABLE IF NOT EXISTS estudante_workspace_itens'));
  assert.ok(schemaSql.includes('idx_workspace_usuario'));
  assert.ok(schemaSql.includes('idx_workspace_status'));
  assert.ok(schemaSql.includes('idx_workspace_eixo'));

  const migrationSql = fs.readFileSync(path.join(RAIZ, 'd1/migrations/001_estudante_workspace_itens.sql'), 'utf8');
  assert.ok(migrationSql.includes('CREATE TABLE IF NOT EXISTS estudante_workspace_itens'));

  const privMd = fs.readFileSync(path.join(RAIZ, 'docs/politica-de-privacidade.md'), 'utf8');
  const privHtml = fs.readFileSync(path.join(RAIZ, 'public/privacy.html'), 'utf8');
  assert.ok(privMd.includes('estudante_workspace_itens') && privMd.includes('DELETE /api/workspace'));
  assert.ok(privHtml.includes('estudante_workspace_itens') && privHtml.includes('DELETE /api/workspace'));
});

test('Confiabilidade: fila offline do Workspace preserva mutações de ID negativo quando criação falha e remapeia IDs em sucesso', async () => {
  const chamadas = [];

  // Caso 1: criar falha por erro de rede -> editar/status subsequente em ID negativo (-101) NÃO pode ser descartado
  const falhaCriar = await executarFilaOfflineSequencial({
    fila: [
      { tipo: 'criar', id: -101, payload: { titulo: 'Ideia Offline' } },
      { tipo: 'atualizar', id: -101, payload: { titulo: 'Ideia Editada Offline' } },
      { tipo: 'status', id: -101, payload: { status: 'execucao' } },
    ],
    itens: [{ id: -101, titulo: 'Ideia Editada Offline', status: 'execucao' }],
    executarApi: async () => {
      throw new Error('Rede indisponível');
    },
  });
  assert.equal(falhaCriar.restante.length, 3, 'Todas as 3 operações pendentes devem permanecer na fila quando criar falha');

  // Caso 2: reconexão com sucesso -> -101 é criado como ID 42 e as mutações usam PUT/PATCH no ID 42
  const sucessoSync = await executarFilaOfflineSequencial({
    fila: falhaCriar.restante,
    itens: falhaCriar.itens,
    executarApi: async (endpoint, opts) => {
      chamadas.push({ endpoint, method: opts.method, body: opts.body });
      if (endpoint === '/workspace' && opts.method === 'POST') {
        return { id: 42, titulo: 'Ideia Offline', status: 'ideia' };
      }
      return { sucesso: true };
    },
  });
  assert.equal(sucessoSync.restante.length, 0);
  assert.equal(sucessoSync.itens[0].id, 42);
  assert.deepEqual(
    chamadas.map((c) => `${c.method} ${c.endpoint}`),
    ['POST /workspace', 'PUT /workspace/42', 'PATCH /workspace/42/status'],
  );

  // Caso 3: exclusão de item criado apenas offline cancela fila local sem disparar DELETE com ID negativo
  const chamadasDeleteLocal = [];
  const cancelamentoLocal = await executarFilaOfflineSequencial({
    fila: [
      { tipo: 'criar', id: -202, payload: { titulo: 'Temporário' } },
      { tipo: 'atualizar', id: -202, payload: { titulo: 'Rascunho' } },
      { tipo: 'excluir', id: -202, payload: null },
    ],
    itens: [],
    executarApi: async (endpoint, opts) => {
      chamadasDeleteLocal.push({ endpoint, method: opts.method });
      throw new Error('Rede offline');
    },
  });
  assert.equal(cancelamentoLocal.restante.length, 0);
  assert.equal(chamadasDeleteLocal.length, 0, 'Item criado e excluído antes de sincronizar não deve gerar POST/PUT/DELETE');

  // Filtro puro de itens do Workspace
  const itemA = {
    id: 10,
    titulo: 'Simulador de Latência',
    eixo_bncc: 'Mundo Digital',
    habilidade_codigo: 'EF04CO03',
    prioridade: 'alta',
    curso_id: 5,
    status: 'planejando',
    prazo: '2026-11-20',
    blocos: [{ tipo: 'paragrafo', texto: 'Pacotes TCP/IP' }],
  };
  assert.equal(
    itemAtendeFiltroWorkspace(itemA, { busca: 'tcp/ip', eixo: 'Mundo Digital', prioridade: 'alta', cursoId: '5', prazo: 'com-prazo' }, {
      hoje: '2026-11-17',
      limite7Dias: '2026-11-24',
    }),
    true,
  );
  assert.equal(
    itemAtendeFiltroWorkspace({ ...itemA, prazo: '2026-11-10' }, { busca: '', eixo: '', prioridade: '', cursoId: '', prazo: 'atrasados' }, {
      hoje: '2026-11-17',
      limite7Dias: '2026-11-24',
    }),
    true,
  );
});

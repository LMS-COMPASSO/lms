/**
 * ============================================================================
 * LMS COMPASSO — WORKSPACE ESTILO NOTION & HUB DE IDEIAS (/workspace.html)
 * ============================================================================
 * - Multi-visão (Kanban ↔ Galeria ↔ Tabela Estruturada) com GSAP Flip
 * - Editor de blocos modular + Slash Commands (/)
 * - 3 Templates pedagógicos 1-Click alinhados à BNCC Computação
 * - Seletor visual de capas e ícones (Notion, Padrões SVG, Ilustrações)
 * - Persistência híbrida: Cloudflare D1 + sincronização otimista offline
 * ============================================================================
 */

import { t, formatarData, formatarNumero, traduzirDocumento } from './i18n.js';
import {
  obterCatalogoCapas,
  ICONES_WORKSPACE,
  gerarSvgPadraoGeometrico,
  obterCapaPorId,
  obterTituloAcervo,
  obterAltAcervo,
  obterRotuloIconeWorkspace,
} from './acervo-visual.js';
import {
  animarFlip,
  animarFeedbackGamificacao,
  animarRevelacaoScroll,
} from './animacoes-gsap.js';
import { gerarSvgIconeHtml } from './icones-universais.js';

export function obterStatusColunas() {
  return [
    { id: 'ideia', rotulo: t('ws.status.ideia', {}, 'Ideia / Backlog'), icone: 'lightbulb' },
    { id: 'planejando', rotulo: t('ws.status.planejando', {}, 'Planejando'), icone: 'edit_note' },
    { id: 'execucao', rotulo: t('ws.status.execucao', {}, 'Em Execução'), icone: 'rocket_launch' },
    { id: 'concluido', rotulo: t('ws.status.concluido', {}, 'Concluído / Publicado'), icone: 'check_circle' },
  ];
}

export function obterPrioridades() {
  return {
    alta: { rotulo: t('ws.prio.alta', {}, 'Alta'), classe: 'ws-tag-prioridade-alta' },
    media: { rotulo: t('ws.prio.media', {}, 'Média'), classe: 'ws-tag-prioridade-media' },
    baixa: { rotulo: t('ws.prio.baixa', {}, 'Baixa'), classe: 'ws-tag-prioridade-baixa' },
  };
}

export function obterTiposBloco() {
  return [
    { tipo: 'paragrafo', comando: '/texto', titulo: t('ws.bloco.paragrafo.titulo', {}, 'Parágrafo'), descricao: t('ws.bloco.paragrafo.desc', {}, 'Texto corrido para anotações livres'), icone: 'text-paragraph' },
    { tipo: 'titulo', comando: '/titulo', titulo: t('ws.bloco.titulo.titulo', {}, 'Título (H2/H3)'), descricao: t('ws.bloco.titulo.desc', {}, 'Cabeçalho para organizar seções'), icone: 'text-heading' },
    { tipo: 'checklist', comando: '/checklist', titulo: t('ws.bloco.checklist.titulo', {}, 'Checklist To-do'), descricao: t('ws.bloco.checklist.desc', {}, 'Tarefa marcável com barra de progresso'), icone: 'checklist' },
    { tipo: 'toggle', comando: '/toggle', titulo: t('ws.bloco.toggle.titulo', {}, 'Bloco Toggle (Sanfona)'), descricao: t('ws.bloco.toggle.desc', {}, 'Resumo dobrável para revisões'), icone: 'toggle-accordion' },
    { tipo: 'callout', comando: '/callout', titulo: t('ws.bloco.callout.titulo', {}, 'Callout Pedagógico'), descricao: t('ws.bloco.callout.desc', {}, 'Destaque com ícone e contexto BNCC'), icone: 'callout' },
    { tipo: 'codigo', comando: '/codigo', titulo: t('ws.bloco.codigo.titulo', {}, 'Bloco de Código'), descricao: t('ws.bloco.codigo.desc', {}, 'Trecho em Python ou pseudocódigo'), icone: 'code-snippet' },
    { tipo: 'bncc', comando: '/bncc', titulo: t('ws.bloco.bncc.titulo', {}, 'Vínculo BNCC'), descricao: t('ws.bloco.bncc.desc', {}, 'Conecta uma habilidade oficial EFxxCOxx'), icone: 'bncc-tag' },
  ];
}

export function obterTemplatesPedagogicos() {
  return [
    {
      id: 'canvas-ideia-projeto',
      titulo: t('ws.tpl.canvas.titulo', {}, 'Canvas de Ideia de Projeto'),
      descricao: t('ws.tpl.canvas.desc', {}, 'Problema → Algoritmo → Impacto Social'),
      icone: 'lightbulb',
      eixo_bncc: 'Pensamento Computacional',
      habilidade_codigo: 'EF69CO04',
      cover_id: 'cover-algoritmos',
      icone_id: 'icon-lightbulb',
      status: 'ideia',
      prioridade: 'alta',
      blocos: [
        { id: 'tpl-1', tipo: 'callout', tom: 'pensamento', icone: 'icon-lightbulb', texto: t('ws.tpl.canvas.b1', {}, 'Descreva qual problema real da escola ou comunidade você quer resolver com tecnologia.') },
        { id: 'tpl-2', tipo: 'titulo', nivel: 'h2', texto: t('ws.tpl.canvas.b2', {}, '1. Problema & Público-Alvo') },
        { id: 'tpl-3', tipo: 'paragrafo', texto: t('ws.tpl.canvas.b3', {}, 'Quem enfrenta esse problema hoje e como podemos observar padrões no cotidiano?') },
        { id: 'tpl-4', tipo: 'titulo', nivel: 'h2', texto: t('ws.tpl.canvas.b4', {}, '2. Decomposição & Algoritmo Proposto') },
        { id: 'tpl-5', tipo: 'checklist', texto: t('ws.tpl.canvas.b5', {}, 'Levantar requisitos mínimos com os colegas'), concluido: true },
        { id: 'tpl-6', tipo: 'checklist', texto: t('ws.tpl.canvas.b6', {}, 'Modelar o fluxo passo a passo (entrada → processamento → saída)'), concluido: false },
        { id: 'tpl-7', tipo: 'checklist', texto: t('ws.tpl.canvas.b7', {}, 'Testar protótipo e validar acessibilidade'), concluido: false },
        { id: 'tpl-8', tipo: 'codigo', linguagem: 'pseudocodigo', texto: t('ws.tpl.canvas.b8', {}, 'SE necessidade_identificada ENTAO\n  decompor_em_etapas()\n  executar_teste_piloto()\nFIM') },
        { id: 'tpl-9', tipo: 'titulo', nivel: 'h2', texto: t('ws.tpl.canvas.b9', {}, '3. Impacto Social & Ética Digital') },
        { id: 'tpl-10', tipo: 'bncc', habilidade: 'EF69CO04', detalhe: t('ws.tpl.canvas.b10', {}, 'Decomposição e automação aplicada ao projeto.') },
      ],
    },
    {
      id: 'diario-laboratorio-python',
      titulo: t('ws.tpl.python.titulo', {}, 'Diário de Bordo Python 3D'),
      descricao: t('ws.tpl.python.desc', {}, 'Hipótese, depuração e código testado'),
      icone: 'flask-lab',
      eixo_bncc: 'Pensamento Computacional',
      habilidade_codigo: 'EF69CO03',
      cover_id: 'padrao-circuito-logico',
      icone_id: 'icon-cube-3d',
      status: 'planejando',
      prioridade: 'media',
      blocos: [
        { id: 'tpl-p1', tipo: 'callout', tom: 'info', icone: 'icon-flask-lab', texto: t('ws.tpl.python.b1', {}, 'Registre aqui seus testes no Laboratório 3D Python e o papel desempenhado na dupla (Piloto ou Navegador).') },
        { id: 'tpl-p2', tipo: 'titulo', nivel: 'h2', texto: t('ws.tpl.python.b2', {}, 'Objetivo da Missão 3D') },
        { id: 'tpl-p3', tipo: 'paragrafo', texto: t('ws.tpl.python.b3', {}, 'Descreva o percurso do robô e quantos laços de repetição pretende utilizar.') },
        { id: 'tpl-p4', tipo: 'codigo', linguagem: 'python', texto: 'for passo in range(4):\n    robo.avancar()\n    if robo.frente_bloqueada():\n        robo.girar_direita()' },
        { id: 'tpl-p5', tipo: 'toggle', aberto: true, texto: t('ws.tpl.python.b5', {}, 'Registro de Depuração (O que falhou e como corrigi)'), detalhe: t('ws.tpl.python.b5Detalhe', {}, 'Anote erros de indentação, giros invertidos ou condições de parada.') },
        { id: 'tpl-p6', tipo: 'checklist', texto: t('ws.tpl.python.b6', {}, 'Validar sem colidir em obstáculos'), concluido: false },
        { id: 'tpl-p7', tipo: 'checklist', texto: t('ws.tpl.python.b7', {}, 'Compartilhar aprendizagem com o colega da dupla'), concluido: false },
        { id: 'tpl-p8', tipo: 'bncc', habilidade: 'EF69CO03', detalhe: t('ws.tpl.python.b8', {}, 'Sequenciação, seleção e repetição em Python.') },
      ],
    },
    {
      id: 'planejador-semanal-trilhas',
      titulo: t('ws.tpl.planner.titulo', {}, 'Planejador Semanal de Trilhas'),
      descricao: t('ws.tpl.planner.desc', {}, 'Metas nos 3 eixos e equilíbrio de tela'),
      icone: 'notebook',
      eixo_bncc: 'Cultura Digital',
      habilidade_codigo: 'EF01CO05',
      cover_id: 'cover-eixos-bncc',
      icone_id: 'icon-notebook',
      status: 'execucao',
      prioridade: 'media',
      blocos: [
        { id: 'tpl-s1', tipo: 'callout', tom: 'cultura', icone: 'icon-shield-check', texto: t('ws.tpl.planner.b1', {}, 'Lembrete CNE nº 2/2025: alterne atividades em tela com pausas ativas e dinâmicas desplugadas em papel.') },
        { id: 'tpl-s2', tipo: 'titulo', nivel: 'h2', texto: t('ws.tpl.planner.b2', {}, 'Metas da Semana por Eixo BNCC') },
        { id: 'tpl-s3', tipo: 'checklist', texto: t('ws.tpl.planner.b3', {}, 'Pensamento Computacional: concluir 1 atividade de blocos ou Python 3D'), concluido: true },
        { id: 'tpl-s4', tipo: 'checklist', texto: t('ws.tpl.planner.b4', {}, 'Mundo Digital: simular ciclo da CPU e fluxo de pacotes'), concluido: false },
        { id: 'tpl-s5', tipo: 'checklist', texto: t('ws.tpl.planner.b5', {}, 'Cultura Digital: revisar cenários do ZapCompasso e Cofre de Senhas'), concluido: false },
        { id: 'tpl-s6', tipo: 'toggle', aberto: false, texto: t('ws.tpl.planner.b6', {}, 'Resumo para revisão antes da avaliação do módulo'), detalhe: t('ws.tpl.planner.b6Detalhe', {}, 'Liste aqui os principais conceitos aprendidos para consultar rapidamente.') },
        { id: 'tpl-s7', tipo: 'bncc', habilidade: 'EF01CO05', detalhe: t('ws.tpl.planner.b7', {}, 'Uso ético, seguro e equilibrado das tecnologias.') },
      ],
    },
  ];
}

function traduzirEixoWs(nomeEixo) {
  const mapa = {
    'Pensamento Computacional': 'eixo.pensamento-computacional',
    'Mundo Digital': 'eixo.mundo-digital',
    'Cultura Digital': 'eixo.cultura-digital',
  };
  return mapa[nomeEixo] ? t(mapa[nomeEixo], {}, nomeEixo) : nomeEixo;
}

function traduzirHabilidadeWs(hab) {
  if (!hab) return { codigo: '', anos: '', eixo: '', texto: '' };
  return {
    codigo: hab.codigo,
    anos: t(`hab.${hab.codigo}.anos`, {}, hab.anos),
    eixo: traduzirEixoWs(hab.eixo),
    texto: t(`hab.${hab.codigo}.texto`, {}, hab.texto),
  };
}

function criarEstadoInicialDemo() {
  const templates = obterTemplatesPedagogicos();
  return [
    {
      id: -101,
      demoKey: 'demo1',
      titulo: t('ws.demo1.titulo', {}, 'Robô Coletor de Resíduos Recicláveis na Escola'),
      status: 'execucao',
      eixo_bncc: 'Pensamento Computacional',
      habilidade_codigo: 'EF69CO04',
      curso_id: null,
      curso_titulo: null,
      prioridade: 'alta',
      prazo: '2026-11-30',
      cover_id: 'cover-algoritmos',
      icone_id: 'icon-cube-3d',
      template_origem: 'canvas-ideia-projeto',
      blocos: templates[0].blocos.map((b) => ({ ...b })),
      ordem: 0,
      atualizado_em: new Date().toISOString(),
    },
    {
      id: -102,
      demoKey: 'demo2',
      titulo: t('ws.demo2.titulo', {}, 'Mapa da Rede Escolar e Diagnóstico de Latência'),
      status: 'planejando',
      eixo_bncc: 'Mundo Digital',
      habilidade_codigo: 'EF04CO03',
      curso_id: null,
      curso_titulo: null,
      prioridade: 'media',
      prazo: '2026-12-05',
      cover_id: 'cover-redes-hardware',
      icone_id: 'icon-network',
      template_origem: null,
      blocos: [
        { id: 'd-1', tipo: 'callout', tom: 'mundo', icone: 'icon-cpu', texto: t('ws.demo2.b1', {}, 'Explorar como os pacotes TCP/IP saem do laboratório até o roteador central.') },
        { id: 'd-2', tipo: 'checklist', texto: t('ws.demo2.b2', {}, 'Inspecionar componentes da placa-mãe no simulador 3D'), concluido: true },
        { id: 'd-3', tipo: 'checklist', texto: t('ws.demo2.b3', {}, 'Registrar tempo de retransmissão no simulador de pacotes'), concluido: false },
        { id: 'd-4', tipo: 'bncc', habilidade: 'EF04CO03', detalhe: t('ws.demo2.b4', {}, 'Representação binária e tráfego em redes.') },
      ],
      ordem: 1,
      atualizado_em: new Date().toISOString(),
    },
    {
      id: -103,
      demoKey: 'demo3',
      titulo: t('ws.demo3.titulo', {}, 'Cartilha da Turma: Privacidade e Senhas Fortes (LGPD)'),
      status: 'ideia',
      eixo_bncc: 'Cultura Digital',
      habilidade_codigo: 'EF02CO04',
      curso_id: null,
      curso_titulo: null,
      prioridade: 'baixa',
      prazo: null,
      cover_id: 'cover-etica-ciberseguranca',
      icone_id: 'icon-shield-check',
      template_origem: null,
      blocos: [
        { id: 'c-1', tipo: 'paragrafo', texto: t('ws.demo3.b1', {}, 'Criar guia ilustrado para explicar aos colegas por que não compartilhar senhas nem dados pessoais em jogos.') },
        { id: 'c-2', tipo: 'toggle', aberto: false, texto: t('ws.demo3.b2', {}, 'Regras de ouro testadas no Cofre Digital'), detalhe: t('ws.demo3.b2Detalhe', {}, 'Mínimo 12 caracteres, letras maiúsculas/minúsculas, números e símbolos.') },
      ],
      ordem: 2,
      atualizado_em: new Date().toISOString(),
    },
  ];
}

function escaparTexto(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function gerarIdLocal() {
  return -Math.floor(Date.now() + Math.random() * 1000);
}

function contarChecklist(blocos = []) {
  const checks = (Array.isArray(blocos) ? blocos : []).filter((b) => b && b.tipo === 'checklist');
  const concluidos = checks.filter((b) => Boolean(b.concluido)).length;
  const percentual = checks.length > 0 ? Math.round((concluidos / checks.length) * 100) : 0;
  return { total: checks.length, concluidos, percentual };
}

function anunciar(msg) {
  const el = document.getElementById('ws-anuncio');
  if (!el) return;
  el.textContent = '';
  setTimeout(() => { el.textContent = msg; }, 40);
}

function formatarPrazoWs(iso) {
  if (!iso) return '—';
  return formatarData(`${iso}T12:00:00`, { dateStyle: 'short' });
}

function normalizarIdAttrWs(id) {
  const num = Number(id);
  return Number.isFinite(num) ? String(num) : escaparTexto(id);
}

function correspondePrazoWorkspace(item, filtroPrazo, hoje, limite7Dias) {
  if (!filtroPrazo) return true;
  if (filtroPrazo === 'com-prazo') return Boolean(item.prazo);
  if (filtroPrazo === '7-dias') return Boolean(item.prazo && item.prazo >= hoje && item.prazo <= limite7Dias);
  if (filtroPrazo === 'atrasados') return Boolean(item.prazo && item.prazo < hoje && item.status !== 'concluido');
  return true;
}

function correspondeTermoBuscaWorkspace(item, termo, traduzirEixo) {
  if (!termo) return true;
  const textoBlocos = (item.blocos || [])
    .map((b) => `${b.texto || ''} ${b.detalhe || ''} ${b.habilidade || ''}`)
    .join(' ')
    .toLowerCase();
  const textosDiretos = [
    item.titulo,
    item.habilidade_codigo,
    item.eixo_bncc,
    traduzirEixo(item.eixo_bncc || ''),
    textoBlocos,
  ];
  return textosDiretos.some((campo) => String(campo || '').toLowerCase().includes(termo));
}

/**
 * Avalia se um item do Workspace atende aos critérios ativos de filtro e busca.
 */
export function itemAtendeFiltroWorkspace(item, filtro, { hoje, limite7Dias, traduzirEixo = (v) => v } = {}) {
  if (filtro.eixo && item.eixo_bncc !== filtro.eixo) return false;
  if (filtro.prioridade && item.prioridade !== filtro.prioridade) return false;
  if (filtro.cursoId && String(item.curso_id || '') !== filtro.cursoId) return false;
  if (!correspondePrazoWorkspace(item, filtro.prazo, hoje, limite7Dias)) return false;

  const termo = String(filtro.busca || '').trim().toLowerCase();
  return correspondeTermoBuscaWorkspace(item, termo, traduzirEixo);
}

async function processarOperacaoFilaIndividual(op, { itens, mapaIdsTrocados, executarApi }) {
  const idReal = mapaIdsTrocados.get(op.id) ?? op.id;

  if (op.tipo === 'criar') {
    const criado = await executarApi('/workspace', { method: 'POST', body: JSON.stringify(op.payload) });
    if (criado?.id) {
      mapaIdsTrocados.set(op.id, criado.id);
      return itens.map((it) => (it.id === op.id ? criado : it));
    }
    return itens;
  }

  if (op.tipo === 'apagar_todos') {
    await executarApi('/workspace', { method: 'DELETE' });
    return itens;
  }

  if (idReal <= 0) {
    // Mantém mutações pendentes de itens ainda não criados no servidor
    throw new Error('ID_LOCAL_PENDENTE');
  }

  if (op.tipo === 'atualizar') {
    await executarApi(`/workspace/${idReal}`, { method: 'PUT', body: JSON.stringify(op.payload) });
  } else if (op.tipo === 'status') {
    await executarApi(`/workspace/${idReal}/status`, { method: 'PATCH', body: JSON.stringify(op.payload) });
  } else if (op.tipo === 'excluir') {
    await executarApi(`/workspace/${idReal}`, { method: 'DELETE' });
  }
  return itens;
}

/**
 * Executa sequencialmente a fila offline preservando operações vinculadas a IDs locais negativos.
 */
export async function executarFilaOfflineSequencial({ fila, itens, mapaIdsTrocados = new Map(), executarApi }) {
  const restante = [];
  let itensAtualizados = Array.isArray(itens) ? [...itens] : [];
  const idsCanceladosLocalmente = new Set();

  for (const op of fila) {
    if (op.tipo === 'excluir' && (mapaIdsTrocados.get(op.id) ?? op.id) <= 0) {
      idsCanceladosLocalmente.add(op.id);
    }
  }

  for (const op of fila) {
    if (idsCanceladosLocalmente.has(op.id)) {
      continue;
    }
    try {
      itensAtualizados = await processarOperacaoFilaIndividual(op, {
        itens: itensAtualizados,
        mapaIdsTrocados,
        executarApi,
      });
    } catch (erroOp) {
      if (erroOp?.message !== 'ID_LOCAL_PENDENTE') {
        console.warn('Operação do Workspace mantida na fila offline:', erroOp?.message || erroOp);
      }
      restante.push(op);
    }
  }

  return { restante, itens: itensAtualizados, mapaIdsTrocados };
}

if (typeof document !== 'undefined' && document.getElementById('workspace-raiz')) {
  void iniciarWorkspace().catch((erroInit) => {
    console.warn('Erro ao inicializar Workspace:', erroInit?.message || erroInit);
  });
}

async function iniciarWorkspace() {
  const raiz = document.getElementById('workspace-raiz');
  const token = typeof obterToken === 'function' ? obterToken() : null;
  const usuario = token && typeof obterUsuario === 'function' ? obterUsuario() : null;
  const sufixoStorage = usuario ? String(usuario.id) : 'visitante';
  const CHAVE_ITENS = `lms_workspace_itens_v1:${sufixoStorage}`;
  const CHAVE_ITENS_GLOBAL = 'lms_workspace_itens_v1';
  const CHAVE_FILA = `lms_workspace_fila_v1:${sufixoStorage}`;

  document.body.classList.toggle('modo-app', Boolean(usuario));
  document.body.classList.toggle('modo-publico', !usuario);
  if (usuario && typeof montarLayout === 'function') {
    montarLayout('workspace');
    const tituloTopbar = document.getElementById('titulo-pagina');
    if (tituloTopbar) tituloTopbar.textContent = t('layout.menu.workspace', {}, 'Meu Workspace');
  } else {
    document.body.setAttribute('data-secao', 'aluno');
  }

  let habilidadesCatalogo = [];
  let cursosDisponiveis = [];
  let visaoAtual = 'kanban';
  let filtro = { busca: '', eixo: '', prioridade: '', cursoId: '', prazo: '' };
  let estadoSync = usuario ? 'sincronizando' : 'visitante';
  let itemEmEdicaoId = null;
  let abaCoverAtiva = 'notion';
  let pickerAberto = null;
  let slashMenuEstado = null;
  let ultimoElementoFocado = null;

  const mapaIdsTrocados = new Map();
  let promessaSyncAtiva = Promise.resolve();

  function executarComTravaSync(tarefaFn) {
    const execucao = promessaSyncAtiva.then(tarefaFn, tarefaFn);
    promessaSyncAtiva = execucao.catch((erroTrava) => {
      console.warn('Sincronização do Workspace recuperada após falha:', erroTrava?.message || erroTrava);
    });
    return execucao;
  }

  function lerCacheLocal() {
    try {
      const raw = localStorage.getItem(CHAVE_ITENS) || localStorage.getItem(CHAVE_ITENS_GLOBAL);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (erroCache) {
      console.warn('Cache local do Workspace indisponível:', erroCache?.message || erroCache);
    }
    return null;
  }

  function salvarCacheLocal(lista) {
    try {
      const json = JSON.stringify(lista);
      localStorage.setItem(CHAVE_ITENS, json);
      localStorage.setItem(CHAVE_ITENS_GLOBAL, json);
    } catch (erroCache) {
      console.warn('Não foi possível gravar cache local do Workspace:', erroCache?.message || erroCache);
    }
  }

  function lerFila() {
    try {
      const raw = localStorage.getItem(CHAVE_FILA);
      return raw ? JSON.parse(raw) : [];
    } catch (erroFila) {
      console.warn('Fila offline do Workspace ilegível:', erroFila?.message || erroFila);
      return [];
    }
  }

  function salvarFila(fila) {
    try {
      localStorage.setItem(CHAVE_FILA, JSON.stringify(fila));
    } catch (erroFila) {
      console.warn('Não foi possível salvar fila offline do Workspace:', erroFila?.message || erroFila);
    }
  }

  function relocalizarDemosNaoEditados() {
    const demos = criarEstadoInicialDemo();
    const mapaDemos = new Map(demos.map((d) => [d.id, d]));
    itens = itens.map((it) => {
      if (it && !it._editadoManual && mapaDemos.has(it.id)) {
        const fresco = mapaDemos.get(it.id);
        return {
          ...it,
          titulo: fresco.titulo,
          blocos: fresco.blocos.map((b, idx) => ({
            ...b,
            concluido: it.blocos?.[idx]?.concluido !== undefined ? it.blocos[idx].concluido : b.concluido,
            aberto: it.blocos?.[idx]?.aberto !== undefined ? it.blocos[idx].aberto : b.aberto,
          })),
        };
      }
      return it;
    });
  }

  let itens = lerCacheLocal();
  if (!itens) {
    itens = usuario ? [] : criarEstadoInicialDemo();
    salvarCacheLocal(itens);
  } else if (!usuario) {
    relocalizarDemosNaoEditados();
  }

  async function carregarCatalogosAuxiliares() {
    try {
      const resp = await fetch('/data/bncc-habilidades.json');
      if (resp.ok) {
        const json = await resp.json();
        habilidadesCatalogo = Array.isArray(json.habilidades) ? json.habilidades : [];
      }
    } catch (erroBncc) {
      console.warn('Catálogo BNCC auxiliar indisponível offline:', erroBncc?.message || erroBncc);
    }

    if (usuario && typeof api === 'function') {
      try {
        const lista = await api('/cursos');
        if (Array.isArray(lista)) cursosDisponiveis = lista;
      } catch (erroCursos) {
        console.warn('Lista de cursos indisponível para vínculo do Workspace:', erroCursos?.message || erroCursos);
      }
    }
  }

  async function sincronizarFilaComD1() {
    if (!usuario || typeof api !== 'function') return;
    return executarComTravaSync(async () => {
      const filaInicial = lerFila();
      if (!Array.isArray(filaInicial) || filaInicial.length === 0) return;

      const resultado = await executarFilaOfflineSequencial({
        fila: filaInicial,
        itens,
        mapaIdsTrocados,
        executarApi: api,
      });
      itens = resultado.itens;
      if (itemEmEdicaoId !== null && mapaIdsTrocados.has(itemEmEdicaoId)) {
        itemEmEdicaoId = mapaIdsTrocados.get(itemEmEdicaoId);
      }
      const novasDuranteSync = lerFila().slice(filaInicial.length);
      salvarFila([...resultado.restante, ...novasDuranteSync]);
      salvarCacheLocal(itens);
    });
  }

  async function carregarDoServidor() {
    if (!usuario || typeof api !== 'function') {
      estadoSync = 'visitante';
      atualizarBadgeSync();
      return;
    }
    try {
      await sincronizarFilaComD1();
      const resp = await api('/workspace');
      if (Array.isArray(resp?.itens)) {
        const filaRestante = lerFila();
        if (filaRestante.length === 0) {
          itens = resp.itens.length === 0 && itens.length === 0 ? [] : resp.itens;
          salvarCacheLocal(itens);
          estadoSync = 'online';
        } else {
          estadoSync = 'pendente';
        }
      }
    } catch (erroSync) {
      console.warn('Workspace operando com cache local offline:', erroSync?.message || erroSync);
      estadoSync = 'pendente';
    }
    atualizarBadgeSync();
    renderizarVisaoAtiva(false);
  }

  function atualizarBadgeSync() {
    const pill = document.getElementById('ws-sync-pill');
    if (!pill) return;
    if (estadoSync === 'online') {
      pill.className = 'ws-sync-pill online';
      pill.innerHTML = `${gerarSvgIconeHtml('check-circle', { tamanho: 16 })} <span>${escaparTexto(t('ws.sync.online', {}, 'Sincronizado no D1'))}</span>`;
    } else if (estadoSync === 'pendente') {
      pill.className = 'ws-sync-pill pendente';
      pill.innerHTML = `${gerarSvgIconeHtml('clock', { tamanho: 16 })} <span>${escaparTexto(t('ws.sync.pendente', {}, 'Salvo offline · Aguardando rede'))}</span>`;
    } else {
      pill.className = 'ws-sync-pill';
      pill.innerHTML = `${gerarSvgIconeHtml('notebook', { tamanho: 16 })} <span>${escaparTexto(t('ws.sync.visitante', {}, 'Modo visitante local'))}</span>`;
    }
  }

  async function criarOuPromoverItemNoD1(id, corpo) {
    const criado = await api('/workspace', { method: 'POST', body: JSON.stringify(corpo) });
    if (!criado?.id) return;
    mapaIdsTrocados.set(id, criado.id);
    itens = itens.map((it) => (it.id === id ? criado : it));
    if (itemEmEdicaoId === id) itemEmEdicaoId = criado.id;
    salvarCacheLocal(itens);
  }

  async function executarChamadaPersistente(tipo, id, payload) {
    const idResolvido = mapaIdsTrocados.get(id) ?? id;
    if (tipo === 'criar' || (tipo === 'atualizar' && idResolvido < 0)) {
      const corpo = tipo === 'criar' ? payload : (itens.find((it) => it.id === id) || payload);
      await criarOuPromoverItemNoD1(id, corpo);
      return;
    }

    const endpoints = {
      atualizar: { path: `/workspace/${idResolvido}`, method: 'PUT', body: JSON.stringify(payload) },
      status: { path: `/workspace/${idResolvido}/status`, method: 'PATCH', body: JSON.stringify(payload) },
      excluir: { path: `/workspace/${idResolvido}`, method: 'DELETE' },
      apagar_todos: { path: '/workspace', method: 'DELETE' },
    };
    const spec = endpoints[tipo];
    if (!spec) return;
    if (tipo !== 'apagar_todos' && idResolvido <= 0) return;

    const opcoesReq = spec.body ? { method: spec.method, body: spec.body } : { method: spec.method };
    await api(spec.path, opcoesReq);
  }

  async function persistirOperacao(tipo, id, payload = null) {
    salvarCacheLocal(itens);
    if (!usuario || typeof api !== 'function') {
      estadoSync = 'visitante';
      atualizarBadgeSync();
      return;
    }

    await executarComTravaSync(async () => {
      try {
        await executarChamadaPersistente(tipo, id, payload);
        estadoSync = lerFila().length > 0 ? 'pendente' : 'online';
      } catch (erroPersist) {
        console.warn('Persistência do Workspace adiada para fila offline:', erroPersist?.message || erroPersist);
        const fila = lerFila();
        fila.push({ tipo, id, payload, ts: Date.now() });
        salvarFila(fila);
        estadoSync = 'pendente';
      }
      atualizarBadgeSync();
    });
  }

  function filtrarItens() {
    const hoje = new Date().toISOString().slice(0, 10);
    const limite7Dias = new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10);
    return itens.filter((item) => itemAtendeFiltroWorkspace(item, filtro, {
      hoje,
      limite7Dias,
      traduzirEixo: traduzirEixoWs,
    }));
  }

  function renderizarCardItem(item, compacto = false) {
    const statusColunas = obterStatusColunas();
    const prioridades = obterPrioridades();
    const statusInfo = statusColunas.find((s) => s.id === item.status) || statusColunas[0];
    const prioInfo = prioridades[item.prioridade] || prioridades.media;
    const stats = contarChecklist(item.blocos);
    const capaObj = obterCapaPorId(item.cover_id);
    const capaHtml = capaObj.categoria === 'padroes'
      ? gerarSvgPadraoGeometrico(capaObj.id, { decorativo: true })
      : `<img class="ws-capa-midia" src="${escaparTexto(capaObj.url)}" alt="" width="${capaObj.width}" height="${capaObj.height}" loading="lazy" decoding="async">`;

    const iconeNome = String(item.icone_id || 'icon-lightbulb').replace(/^icon-/, '');
    const indiceColuna = statusColunas.findIndex((s) => s.id === item.status);
    const colAnterior = indiceColuna > 0 ? statusColunas[indiceColuna - 1] : null;
    const colProxima = indiceColuna < statusColunas.length - 1 ? statusColunas[indiceColuna + 1] : null;

    const cursoLabel = item.curso_titulo
      || cursosDisponiveis.find((c) => Number(c.id) === Number(item.curso_id))?.titulo
      || '';

    const txtPrio = t('ws.card.prioridadeTag', { rotulo: prioInfo.rotulo }, `Prioridade: ${prioInfo.rotulo}`);
    const txtPrazo = item.prazo ? t('ws.card.prazoTag', { data: formatarPrazoWs(item.prazo) }, `Prazo: ${formatarPrazoWs(item.prazo)}`) : '';
    const ariaCheck = t(
      'ws.card.progressoAria',
      { concluidos: stats.concluidos, total: stats.total },
      `Progresso do checklist: ${stats.concluidos} de ${stats.total} concluídos`,
    );

    const idAttr = normalizarIdAttrWs(item.id);
    return `
      <article class="ws-card" data-flip-id="ws-item-${idAttr}" data-item-id="${idAttr}" draggable="${visaoAtual === 'kanban' ? 'true' : 'false'}">
        <div class="ws-card-capa ${compacto ? 'ws-card-capa-mini' : ''}" aria-hidden="true">
          ${capaHtml}
        </div>
        <div class="ws-card-corpo">
          <div class="ws-card-cabeca">
            <div class="ws-card-icone-titulo">
              <span class="ws-pagina-icone-badge" aria-hidden="true">
                ${gerarSvgIconeHtml(iconeNome, { tamanho: 18 })}
              </span>
              <button type="button" class="ws-card-titulo-btn" data-acao="abrir" data-id="${idAttr}">
                ${escaparTexto(item.titulo)}
              </button>
            </div>
          </div>

          <div class="ws-tags-linha">
            <span class="ws-tag" data-eixo="${escaparTexto(item.eixo_bncc)}">${escaparTexto(traduzirEixoWs(item.eixo_bncc))}</span>
            ${item.habilidade_codigo ? `<span class="ws-tag">${escaparTexto(item.habilidade_codigo)}</span>` : ''}
            <span class="ws-tag ${prioInfo.classe}">${escaparTexto(txtPrio)}</span>
            ${visaoAtual === 'galeria' ? `<span class="ws-tag">${escaparTexto(statusInfo.rotulo)}</span>` : ''}
          </div>

          ${cursoLabel || item.prazo ? `
            <div class="ws-tags-linha">
              ${cursoLabel ? `<span class="ws-tag">${escaparTexto(cursoLabel)}</span>` : ''}
              ${item.prazo ? `<span class="ws-tag">${escaparTexto(txtPrazo)}</span>` : ''}
            </div>
          ` : ''}

          ${stats.total > 0 ? `
            <div class="ws-progresso-mini" aria-label="${escaparTexto(ariaCheck)}">
              <div class="ws-progresso-trilha"><div class="ws-progresso-fill" style="width:${stats.percentual}%"></div></div>
              <span>${stats.concluidos}/${stats.total}</span>
            </div>
          ` : ''}

          <div class="ws-card-rodape">
            <div class="ws-card-acoes-compactas">
              ${visaoAtual === 'kanban' && colAnterior ? `
                <button type="button" class="ws-btn-icone" data-acao="mover-status" data-id="${idAttr}" data-status="${colAnterior.id}" title="${escaparTexto(t('ws.card.moverPara', { coluna: colAnterior.rotulo }, `Mover para ${colAnterior.rotulo}`))}" aria-label="${escaparTexto(t('ws.card.moverItemPara', { titulo: item.titulo, coluna: colAnterior.rotulo }, `Mover ${item.titulo} para ${colAnterior.rotulo}`))}">
                  ←
                </button>
              ` : ''}
              ${visaoAtual === 'kanban' && colProxima ? `
                <button type="button" class="ws-btn-icone" data-acao="mover-status" data-id="${idAttr}" data-status="${colProxima.id}" title="${escaparTexto(t('ws.card.moverPara', { coluna: colProxima.rotulo }, `Mover para ${colProxima.rotulo}`))}" aria-label="${escaparTexto(t('ws.card.moverItemPara', { titulo: item.titulo, coluna: colProxima.rotulo }, `Mover ${item.titulo} para ${colProxima.rotulo}`))}">
                  →
                </button>
              ` : ''}
            </div>
            <div class="ws-card-acoes-compactas">
              <button type="button" class="ws-btn-icone" data-acao="abrir" data-id="${idAttr}" aria-label="${escaparTexto(t('ws.card.abrirPaginaAria', { titulo: item.titulo }, `Abrir página ${item.titulo}`))}">
                ${gerarSvgIconeHtml('edit', { tamanho: 16 })}
                <span>${escaparTexto(t('cursosPage.abrir', {}, 'Abrir'))}</span>
              </button>
              <button type="button" class="ws-btn-icone" data-acao="excluir" data-id="${idAttr}" title="${escaparTexto(t('ws.card.excluirTitle', {}, 'Excluir item'))}" aria-label="${escaparTexto(t('ws.card.excluirAria', { titulo: item.titulo }, `Excluir ${item.titulo}`))}">
                ${gerarSvgIconeHtml('trash', { tamanho: 16 })}
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderizarVazioHtml() {
    return `
      <div class="ws-vazio">
        <img src="/img/ilustracoes/brainstorming-grupo.svg" alt="${escaparTexto(t('ws.vazio.imgAlt', {}, 'Ilustração de quadro colaborativo de ideias'))}" width="480" height="320" loading="lazy" decoding="async">
        <h3>${escaparTexto(t('ws.vazio.titulo', {}, 'Nenhum item encontrado neste recorte'))}</h3>
        <p class="texto-suave">${escaparTexto(t('ws.vazio.desc', {}, 'Comece uma página em branco, escolha um template pedagógico acima ou limpe os filtros atuais.'))}</p>
        <div class="flex-linha justify-center flex-wrap gap-8 mt-12">
          <button type="button" class="btn btn-primario flex-inline-icon" data-acao="novo-item">
            ${gerarSvgIconeHtml('plus', { tamanho: 16 })}
            <span>${escaparTexto(t('ws.vazio.novaIdeia', {}, 'Nova Ideia / Página'))}</span>
          </button>
          <button type="button" class="btn btn-neutro" data-acao="limpar-filtros">${escaparTexto(t('toolbar.limparFiltros', {}, 'Limpar Filtros'))}</button>
        </div>
      </div>
    `;
  }

  function construirHtmlVisao(visiveis) {
    if (visiveis.length === 0) {
      return renderizarVazioHtml();
    }

    const statusColunas = obterStatusColunas();
    const prioridades = obterPrioridades();

    if (visaoAtual === 'kanban') {
      return `
        <div class="ws-kanban-board" role="region" aria-label="${escaparTexto(t('ws.kanbanAria', {}, 'Quadro Kanban de ideias e estudos'))}">
          ${statusColunas.map((col) => {
            const itensCol = visiveis.filter((it) => it.status === col.id);
            return `
              <section class="ws-kanban-coluna" data-coluna-status="${col.id}" aria-labelledby="ws-col-${col.id}">
                <div class="ws-kanban-col-header">
                  <h3 class="ws-kanban-col-titulo" id="ws-col-${col.id}">
                    <span class="material-symbols-outlined icon-xs" aria-hidden="true">${col.icone}</span>
                    <span>${escaparTexto(col.rotulo)}</span>
                  </h3>
                  <span class="ws-kanban-contador">${formatarNumero(itensCol.length)}</span>
                </div>
                <div class="ws-kanban-lista" data-drop-status="${col.id}">
                  ${itensCol.map((it) => renderizarCardItem(it, true)).join('')}
                </div>
              </section>
            `;
          }).join('')}
        </div>
      `;
    }

    if (visaoAtual === 'galeria') {
      return `
        <section class="ws-galeria-grade" aria-label="${escaparTexto(t('ws.galeriaAria', {}, 'Galeria visual de ideias e projetos'))}">
          ${visiveis.map((it) => renderizarCardItem(it, false)).join('')}
        </section>
      `;
    }

    return `
      <section class="tabela-scroll" aria-label="${escaparTexto(t('ws.tabelaAria', {}, 'Tabela estruturada do Workspace'))}">
        <table>
          <thead>
            <tr>
              <th scope="col">${escaparTexto(t('ws.tab.pagina', {}, 'Página'))}</th>
              <th scope="col">${escaparTexto(t('ws.tab.status', {}, 'Status'))}</th>
              <th scope="col">${escaparTexto(t('ws.tab.eixo', {}, 'Eixo BNCC'))}</th>
              <th scope="col">${escaparTexto(t('ws.tab.habilidade', {}, 'Habilidade'))}</th>
              <th scope="col">${escaparTexto(t('ws.tab.prioridade', {}, 'Prioridade'))}</th>
              <th scope="col">${escaparTexto(t('ws.tab.prazo', {}, 'Prazo'))}</th>
              <th scope="col">${escaparTexto(t('ws.tab.checklist', {}, 'Checklist'))}</th>
              <th scope="col" class="texto-direita">${escaparTexto(t('ws.tab.acoes', {}, 'Ações'))}</th>
            </tr>
          </thead>
          <tbody>
            ${visiveis.map((it) => {
              const prio = prioridades[it.prioridade] || prioridades.media;
              const stats = contarChecklist(it.blocos);
              const iconeNome = String(it.icone_id || 'icon-lightbulb').replace(/^icon-/, '');
              const idAttr = normalizarIdAttrWs(it.id);
              return `
                <tr data-flip-id="ws-item-${idAttr}" data-item-id="${idAttr}">
                  <td>
                    <button type="button" class="ws-card-titulo-btn flex-inline-icon" data-acao="abrir" data-id="${idAttr}">
                      ${gerarSvgIconeHtml(iconeNome, { tamanho: 18 })}
                      <span>${escaparTexto(it.titulo)}</span>
                    </button>
                  </td>
                  <td>
                    <select class="ws-tabela-select" data-acao="alterar-status-tabela" data-id="${idAttr}" aria-label="${escaparTexto(t('ws.tab.statusItemAria', { titulo: it.titulo }, `Status de ${it.titulo}`))}">
                      ${statusColunas.map((col) => `<option value="${col.id}" ${it.status === col.id ? 'selected' : ''}>${escaparTexto(col.rotulo)}</option>`).join('')}
                    </select>
                  </td>
                  <td><span class="ws-tag" data-eixo="${escaparTexto(it.eixo_bncc)}">${escaparTexto(traduzirEixoWs(it.eixo_bncc))}</span></td>
                  <td><code>${escaparTexto(it.habilidade_codigo || '—')}</code></td>
                  <td><span class="ws-tag ${prio.classe}">${escaparTexto(prio.rotulo)}</span></td>
                  <td>${escaparTexto(formatarPrazoWs(it.prazo))}</td>
                  <td>${stats.total > 0 ? `${stats.concluidos}/${stats.total} (${stats.percentual}%)` : '—'}</td>
                  <td class="texto-direita">
                    <div class="ws-card-acoes-compactas">
                      <button type="button" class="btn btn-xs btn-neutro" data-acao="abrir" data-id="${idAttr}">${escaparTexto(t('comum.editar', {}, 'Editar'))}</button>
                      <button type="button" class="btn btn-xs btn-perigo" data-acao="excluir" data-id="${idAttr}" aria-label="${escaparTexto(t('ws.card.excluirAria', { titulo: it.titulo }, `Excluir ${it.titulo}`))}">${escaparTexto(t('comum.excluir', {}, 'Excluir'))}</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </section>
    `;
  }

  function renderizarVisaoAtiva(usarFlip = true) {
    const palco = document.getElementById('ws-visao-palco');
    if (!palco) return;
    const visiveis = filtrarItens();
    const html = construirHtmlVisao(visiveis);

    if (usarFlip) {
      animarFlip(
        () => palco.querySelectorAll('[data-flip-id]'),
        () => {
          palco.innerHTML = html;
        },
        { duration: 0.34, stagger: 0.015 },
      );
    } else {
      palco.innerHTML = html;
    }

    vincularDragDropKanban();
    const atualizarScrollTabela = () => {
      const regTabela = palco.querySelector('.tabela-scroll');
      if (!regTabela) return;
      if (regTabela.scrollWidth > regTabela.clientWidth + 2) {
        regTabela.setAttribute('tabindex', '0');
      } else {
        regTabela.removeAttribute('tabindex');
      }
    };
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(atualizarScrollTabela);
    } else {
      atualizarScrollTabela();
    }
    const msgAnuncio = visiveis.length === 1
      ? t('ws.anuncioUmItem', {}, '1 item exibido no Workspace.')
      : t('ws.anuncioVariosItens', { n: visiveis.length }, `${visiveis.length} itens exibidos no Workspace.`);
    anunciar(msgAnuncio);
  }

  function vincularDragDropKanban() {
    if (visaoAtual !== 'kanban') return;
    const palco = document.getElementById('ws-visao-palco');
    if (!palco) return;
    let idArrastado = null;

    palco.querySelectorAll('.ws-card[draggable="true"]').forEach((card) => {
      card.addEventListener('dragstart', () => {
        idArrastado = Number(card.dataset.itemId);
      });
    });

    palco.querySelectorAll('.ws-kanban-lista[data-drop-status]').forEach((zona) => {
      zona.addEventListener('dragover', (e) => {
        e.preventDefault();
        zona.classList.add('ws-drop-ativo');
      });
      zona.addEventListener('dragleave', () => {
        zona.classList.remove('ws-drop-ativo');
      });
      zona.addEventListener('drop', (e) => {
        e.preventDefault();
        zona.classList.remove('ws-drop-ativo');
        const novoStatus = zona.dataset.dropStatus;
        if (idArrastado && novoStatus) {
          moverItemStatus(idArrastado, novoStatus);
          idArrastado = null;
        }
      });
    });
  }

  function moverItemStatus(id, novoStatus) {
    const alvo = itens.find((it) => it.id === id);
    if (!alvo || alvo.status === novoStatus) return;
    alvo.status = novoStatus;
    alvo.atualizado_em = new Date().toISOString();
    renderizarVisaoAtiva(true);
    persistirOperacao('status', id, { status: novoStatus, ordem: alvo.ordem || 0 });
  }

  function renderizarEstruturaBase() {
    const TagTituloPrincipal = usuario ? 'h2' : 'h1';
    const templates = obterTemplatesPedagogicos();
    const prioridades = obterPrioridades();
    const cursoOpcoes = cursosDisponiveis
      .map((c) => `<option value="${Number(c.id)}" ${filtro.cursoId === String(c.id) ? 'selected' : ''}>${escaparTexto(c.titulo)}</option>`)
      .join('');

    raiz.innerHTML = `
      <header class="ws-cabecalho">
        <div class="ws-cabecalho-titulo-wrap">
          <${TagTituloPrincipal} class="ws-titulo" id="titulo-workspace">${escaparTexto(t('nav.workspaceIdeias', {}, 'Workspace & Hub de Ideias'))}</${TagTituloPrincipal}>
          <p class="ws-subtitulo">
            ${escaparTexto(t('ws.subtitulo', {}, 'Organize suas trilhas da BNCC, checklists de revisão, diários de laboratório Python 3D e ideias de projetos em Kanban, Galeria ou Tabela.'))}
          </p>
        </div>
        <div class="ws-cabecalho-acoes">
          <span id="ws-sync-pill" class="ws-sync-pill"></span>
          <button type="button" class="btn btn-primario flex-inline-icon" data-acao="novo-item">
            ${gerarSvgIconeHtml('plus', { tamanho: 16 })}
            <span>${escaparTexto(t('ws.novaPaginaIdeia', {}, 'Nova Página / Ideia'))}</span>
          </button>
          <button type="button" class="btn btn-neutro btn-sm flex-inline-icon" id="btn-ws-apagar-tudo" data-acao="apagar-todos-lgpd" title="${escaparTexto(t('ws.apagarTudoTitle', {}, 'Excluir todos os itens do Workspace (LGPD Art. 18, VI)'))}">
            ${gerarSvgIconeHtml('trash', { tamanho: 16 })}
            <span>${escaparTexto(t('ws.apagarTudo', {}, 'Apagar todos os meus itens'))}</span>
          </button>
        </div>
      </header>

      <section class="ws-templates-secao" aria-labelledby="titulo-templates-ws">
        <h3 class="ws-secao-titulo-menor" id="titulo-templates-ws">
          ${gerarSvgIconeHtml('template', { tamanho: 18 })}
          <span>${escaparTexto(t('ws.templatesTitulo', {}, 'Templates Pedagógicos 1-Click'))}</span>
        </h3>
        <div class="ws-templates-grade">
          ${templates.map((tpl) => `
            <button type="button" class="ws-template-btn" data-acao="criar-template" data-template-id="${tpl.id}">
              <span class="ws-template-icone" aria-hidden="true">${gerarSvgIconeHtml(tpl.icone, { tamanho: 20 })}</span>
              <span>
                <strong>${escaparTexto(tpl.titulo)}</strong>
                <span>${escaparTexto(tpl.descricao)}</span>
              </span>
            </button>
          `).join('')}
        </div>
      </section>

      <section class="ws-barra-controle" aria-label="${escaparTexto(t('ws.controleAria', {}, 'Alternar visão e filtrar itens do Workspace'))}">
        <div class="ws-visoes-grupo" role="group" aria-label="${escaparTexto(t('ws.visaoGrupoAria', {}, 'Modo de visualização'))}">
          <button type="button" class="ws-btn-visao" data-acao="trocar-visao" data-visao="kanban" aria-pressed="${visaoAtual === 'kanban'}">
            ${gerarSvgIconeHtml('kanban', { tamanho: 18 })}
            <span>${escaparTexto(t('ws.visao.kanban', {}, 'Quadro Kanban'))}</span>
          </button>
          <button type="button" class="ws-btn-visao" data-acao="trocar-visao" data-visao="galeria" aria-pressed="${visaoAtual === 'galeria'}">
            ${gerarSvgIconeHtml('gallery', { tamanho: 18 })}
            <span>${escaparTexto(t('ws.visao.galeria', {}, 'Galeria de Ideias'))}</span>
          </button>
          <button type="button" class="ws-btn-visao" data-acao="trocar-visao" data-visao="tabela" aria-pressed="${visaoAtual === 'tabela'}">
            ${gerarSvgIconeHtml('table', { tamanho: 18 })}
            <span>${escaparTexto(t('ws.visao.tabela', {}, 'Tabela Estruturada'))}</span>
          </button>
        </div>

        <div class="ws-filtros-grupo">
          <input type="search" id="ws-filtro-busca" value="${escaparTexto(filtro.busca)}" placeholder="${escaparTexto(t('ws.filtro.buscaPlaceholder', {}, 'Buscar título, EF05CO01 ou bloco...'))}" aria-label="${escaparTexto(t('ws.filtro.buscaAria', {}, 'Buscar no Workspace'))}">
          <select id="ws-filtro-eixo" aria-label="${escaparTexto(t('cursosPage.filtrarEixoAria', {}, 'Filtrar por eixo BNCC'))}">
            <option value="">${escaparTexto(t('cursosPage.todosEixos', {}, 'Todos os eixos BNCC'))}</option>
            <option value="Pensamento Computacional" ${filtro.eixo === 'Pensamento Computacional' ? 'selected' : ''}>${escaparTexto(t('eixo.pensamento-computacional', {}, 'Pensamento Computacional'))}</option>
            <option value="Mundo Digital" ${filtro.eixo === 'Mundo Digital' ? 'selected' : ''}>${escaparTexto(t('eixo.mundo-digital', {}, 'Mundo Digital'))}</option>
            <option value="Cultura Digital" ${filtro.eixo === 'Cultura Digital' ? 'selected' : ''}>${escaparTexto(t('eixo.cultura-digital', {}, 'Cultura Digital'))}</option>
          </select>
          <select id="ws-filtro-prioridade" aria-label="${escaparTexto(t('ws.filtro.prioAria', {}, 'Filtrar por prioridade'))}">
            <option value="">${escaparTexto(t('ws.filtro.todasPrioridades', {}, 'Todas prioridades'))}</option>
            <option value="alta" ${filtro.prioridade === 'alta' ? 'selected' : ''}>${escaparTexto(prioridades.alta.rotulo)}</option>
            <option value="media" ${filtro.prioridade === 'media' ? 'selected' : ''}>${escaparTexto(prioridades.media.rotulo)}</option>
            <option value="baixa" ${filtro.prioridade === 'baixa' ? 'selected' : ''}>${escaparTexto(prioridades.baixa.rotulo)}</option>
          </select>
          <select id="ws-filtro-prazo" aria-label="${escaparTexto(t('ws.filtro.prazoAria', {}, 'Filtrar por prazo'))}">
            <option value="">${escaparTexto(t('ws.filtro.todosPrazos', {}, 'Todos os prazos'))}</option>
            <option value="com-prazo" ${filtro.prazo === 'com-prazo' ? 'selected' : ''}>${escaparTexto(t('ws.filtro.comPrazo', {}, 'Com prazo definido'))}</option>
            <option value="7-dias" ${filtro.prazo === '7-dias' ? 'selected' : ''}>${escaparTexto(t('ws.filtro.seteDias', {}, 'Próximos 7 dias'))}</option>
            <option value="atrasados" ${filtro.prazo === 'atrasados' ? 'selected' : ''}>${escaparTexto(t('ws.filtro.atrasados', {}, 'Em atraso'))}</option>
          </select>
          ${cursoOpcoes ? `
            <select id="ws-filtro-curso" aria-label="${escaparTexto(t('ws.filtro.cursoAria', {}, 'Filtrar por curso vinculado'))}">
              <option value="">${escaparTexto(t('ws.filtro.todosCursos', {}, 'Todos os cursos'))}</option>
              ${cursoOpcoes}
            </select>
          ` : ''}
        </div>
      </section>

      <div id="ws-visao-palco"></div>

      <!-- Modal Editor de Blocos Estilo Notion -->
      <div id="ws-editor-backdrop" class="ws-editor-backdrop" role="dialog" aria-modal="true" aria-labelledby="ws-editor-titulo-dialog" hidden>
        <div class="ws-editor-painel" id="ws-editor-painel"></div>
      </div>
    `;

    atualizarBadgeSync();
    renderizarVisaoAtiva(false);

    animarRevelacaoScroll('.ws-template-btn', { stagger: 0.04, y: 12 });
  }

  function abrirEditorItem(id, triggerEl = null) {
    ultimoElementoFocado = triggerEl || document.activeElement;
    itemEmEdicaoId = id;
    pickerAberto = null;
    slashMenuEstado = null;
    const backdrop = document.getElementById('ws-editor-backdrop');
    if (!backdrop) return;
    backdrop.hidden = false;
    renderizarEditorConteudo();

    const painel = document.getElementById('ws-editor-painel');
    animarFeedbackGamificacao(painel, 'modal');
    document.getElementById('ws-editor-titulo-input')?.focus();
  }

  function fecharEditorItem() {
    const backdrop = document.getElementById('ws-editor-backdrop');
    if (backdrop) backdrop.hidden = true;
    itemEmEdicaoId = null;
    pickerAberto = null;
    slashMenuEstado = null;
    if (ultimoElementoFocado && typeof ultimoElementoFocado.focus === 'function') {
      ultimoElementoFocado.focus();
    }
  }

  function renderizarPickerVisualHtml(item) {
    if (!pickerAberto) return '';

    if (pickerAberto === 'icone') {
      return `
        <section class="ws-picker-painel" aria-label="${escaparTexto(t('ws.picker.iconeAria', {}, 'Seletor de ícone da página'))}">
          <div class="flex-entre mb-10">
            <strong>${escaparTexto(t('ws.picker.iconeTitulo', {}, 'Escolha o ícone da página'))}</strong>
            <button type="button" class="btn btn-xs btn-neutro" data-editor-acao="fechar-picker">${escaparTexto(t('layout.fechar', {}, 'Fechar'))}</button>
          </div>
          <div class="ws-icones-grade">
            ${ICONES_WORKSPACE.map((ic) => {
              const ativo = item.icone_id === ic.id;
              const nome = ic.id.replace(/^icon-/, '');
              return `
                <button type="button" class="ws-icone-opcao" data-editor-acao="selecionar-icone" data-icone-id="${ic.id}" aria-pressed="${ativo}">
                  ${gerarSvgIconeHtml(nome, { tamanho: 18 })}
                  <span>${escaparTexto(obterRotuloIconeWorkspace(ic))}</span>
                </button>
              `;
            }).join('')}
          </div>
        </section>
      `;
    }

    const cat = obterCatalogoCapas();
    const listaAtual = cat[abaCoverAtiva] || cat.notion;
    return `
      <section class="ws-picker-painel" aria-label="${escaparTexto(t('ws.picker.capaAria', {}, 'Seletor de capas e ilustrações'))}">
        <div class="flex-entre flex-wrap gap-8 mb-10">
          <strong>${escaparTexto(t('ws.picker.capaTitulo', {}, 'Seletor Visual de Capa'))}</strong>
          <button type="button" class="btn btn-xs btn-neutro" data-editor-acao="fechar-picker">${escaparTexto(t('layout.fechar', {}, 'Fechar'))}</button>
        </div>
        <div class="ws-picker-abas" role="tablist" aria-label="${escaparTexto(t('ws.picker.categoriasAria', {}, 'Categorias de capa'))}">
          <button type="button" class="btn btn-xs ${abaCoverAtiva === 'notion' ? 'btn-primario' : 'btn-neutro'}" role="tab" aria-selected="${abaCoverAtiva === 'notion'}" data-editor-acao="aba-capa" data-categoria="notion">${escaparTexto(t('ws.picker.abaNotion', {}, 'Capas BNCC & Notion (1500x600)'))}</button>
          <button type="button" class="btn btn-xs ${abaCoverAtiva === 'padroes' ? 'btn-primario' : 'btn-neutro'}" role="tab" aria-selected="${abaCoverAtiva === 'padroes'}" data-editor-acao="aba-capa" data-categoria="padroes">${escaparTexto(t('ws.picker.abaPadroes', {}, 'Padrões & Gradientes'))}</button>
          <button type="button" class="btn btn-xs ${abaCoverAtiva === 'ilustracoes' ? 'btn-primario' : 'btn-neutro'}" role="tab" aria-selected="${abaCoverAtiva === 'ilustracoes'}" data-editor-acao="aba-capa" data-categoria="ilustracoes">${escaparTexto(t('ws.picker.abaIlustracoes', {}, 'Ilustrações Educacionais'))}</button>
        </div>
        <div class="ws-picker-grade">
          ${listaAtual.map((op) => {
            const ativo = item.cover_id === op.id;
            const tituloCapa = obterTituloAcervo(op);
            const preview = op.categoria === 'padroes'
              ? gerarSvgPadraoGeometrico(op.id, { decorativo: true, titulo: tituloCapa })
              : `<img class="ws-capa-midia" src="${escaparTexto(op.url)}" alt="${escaparTexto(tituloCapa)}" width="${op.width}" height="${op.height}" loading="lazy" decoding="async">`;
            return `
              <button type="button" class="ws-picker-opcao" data-editor-acao="selecionar-capa" data-cover-id="${op.id}" aria-pressed="${ativo}">
                <div class="ws-picker-thumb" aria-hidden="true">${preview}</div>
                <span class="ws-picker-thumb-titulo">${escaparTexto(tituloCapa)}</span>
              </button>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  function renderizarBlocoHtml(bloco, indice, totalBlocos) {
    let corpoHtml = '';

    if (bloco.tipo === 'titulo') {
      const nivel = bloco.nivel === 'h3' ? 'h3' : 'h2';
      corpoHtml = `
        <div class="flex-linha gap-8">
          <button type="button" class="btn btn-xs btn-neutro" data-editor-acao="alternar-nivel-titulo" data-bloco-index="${indice}" title="${escaparTexto(t('ws.editor.alternarH2H3', {}, 'Alternar entre H2 e H3'))}">${nivel.toUpperCase()}</button>
          <input type="text" class="ws-bloco-input ws-bloco-titulo-input ${nivel}" data-bloco-campo="texto" data-bloco-index="${indice}" value="${escaparTexto(bloco.texto)}" placeholder="${escaparTexto(t('ws.editor.phTitulo', {}, 'Título da seção (digite / para comandos)...'))}">
        </div>
      `;
    } else if (bloco.tipo === 'checklist') {
      corpoHtml = `
        <div class="ws-bloco-checklist ${bloco.concluido ? 'concluido' : ''}">
          <input type="checkbox" data-bloco-campo="concluido" data-bloco-index="${indice}" ${bloco.concluido ? 'checked' : ''} aria-label="${escaparTexto(t('ws.editor.marcarTarefaAria', {}, 'Marcar tarefa como concluída'))}">
          <input type="text" class="ws-bloco-input" data-bloco-campo="texto" data-bloco-index="${indice}" value="${escaparTexto(bloco.texto)}" placeholder="${escaparTexto(t('ws.editor.phChecklist', {}, 'Tarefa a concluir (digite / para comandos)...'))}">
        </div>
      `;
    } else if (bloco.tipo === 'toggle') {
      corpoHtml = `
        <div class="ws-bloco-toggle">
          <div class="ws-bloco-toggle-cabeca">
            <button type="button" class="btn btn-xs btn-neutro" data-editor-acao="alternar-toggle" data-bloco-index="${indice}" aria-expanded="${Boolean(bloco.aberto)}">
              ${bloco.aberto ? `▾ ${escaparTexto(t('ws.editor.toggleOcultar', {}, 'Ocultar'))}` : `▸ ${escaparTexto(t('ws.editor.toggleExpandir', {}, 'Expandir'))}`}
            </button>
            <input type="text" class="ws-bloco-input" data-bloco-campo="texto" data-bloco-index="${indice}" value="${escaparTexto(bloco.texto)}" placeholder="${escaparTexto(t('ws.editor.phToggle', {}, 'Título do bloco sanfona (Toggle)...'))}">
          </div>
          ${bloco.aberto ? `
            <textarea rows="2" class="ws-bloco-textarea" data-bloco-campo="detalhe" data-bloco-index="${indice}" placeholder="${escaparTexto(t('ws.editor.phToggleDetalhe', {}, 'Anotações de revisão dentro do toggle...'))}">${escaparTexto(bloco.detalhe || '')}</textarea>
          ` : ''}
        </div>
      `;
    } else if (bloco.tipo === 'callout') {
      const tom = bloco.tom || 'info';
      const iconeNome = String(bloco.icone || 'icon-lightbulb').replace(/^icon-/, '');
      corpoHtml = `
        <div class="ws-bloco-callout" data-tom="${escaparTexto(tom)}">
          <span aria-hidden="true">${gerarSvgIconeHtml(iconeNome, { tamanho: 20 })}</span>
          <div class="flex-1">
            <div class="flex-entre mb-6 gap-8">
              <select class="ws-tabela-select" data-bloco-campo="tom" data-bloco-index="${indice}" aria-label="${escaparTexto(t('ws.editor.tomCalloutAria', {}, 'Tom semântico do callout'))}">
                <option value="info" ${tom === 'info' ? 'selected' : ''}>${escaparTexto(t('ws.editor.tomInfo', {}, 'Informativo Geral'))}</option>
                <option value="pensamento" ${tom === 'pensamento' ? 'selected' : ''}>${escaparTexto(t('eixo.pensamento-computacional', {}, 'Pensamento Computacional'))}</option>
                <option value="mundo" ${tom === 'mundo' ? 'selected' : ''}>${escaparTexto(t('eixo.mundo-digital', {}, 'Mundo Digital'))}</option>
                <option value="cultura" ${tom === 'cultura' ? 'selected' : ''}>${escaparTexto(t('eixo.cultura-digital', {}, 'Cultura Digital'))}</option>
              </select>
            </div>
            <textarea rows="2" class="ws-bloco-textarea" data-bloco-campo="texto" data-bloco-index="${indice}" placeholder="${escaparTexto(t('ws.editor.phCallout', {}, 'Destaque pedagógico ou lembrete...'))}">${escaparTexto(bloco.texto)}</textarea>
          </div>
        </div>
      `;
    } else if (bloco.tipo === 'codigo') {
      const ling = bloco.linguagem || 'python';
      corpoHtml = `
        <div class="ws-bloco-codigo">
          <div class="ws-bloco-codigo-topo">
            <select class="ws-tabela-select" data-bloco-campo="linguagem" data-bloco-index="${indice}" aria-label="${escaparTexto(t('ws.editor.langCodigoAria', {}, 'Linguagem do bloco de código'))}">
              <option value="python" ${ling === 'python' ? 'selected' : ''}>${escaparTexto(t('ws.editor.langPython', {}, 'Python (Lab 3D)'))}</option>
              <option value="pseudocodigo" ${ling === 'pseudocodigo' ? 'selected' : ''}>${escaparTexto(t('ws.editor.langPseudo', {}, 'Pseudocódigo'))}</option>
              <option value="html" ${ling === 'html' ? 'selected' : ''}>HTML / Web</option>
            </select>
            <div class="flex-linha gap-8">
              <button type="button" class="btn btn-xs btn-neutro" data-editor-acao="copiar-codigo" data-bloco-index="${indice}">${escaparTexto(t('ws.editor.copiarCodigo', {}, 'Copiar código'))}</button>
              <a href="/atividades.html?tipo=python3d" class="btn btn-xs btn-secundario">${escaparTexto(t('ws.editor.abrirLabPython', {}, 'Abrir Lab Python 3D'))}</a>
            </div>
          </div>
          <textarea rows="4" class="ws-bloco-textarea" data-bloco-campo="texto" data-bloco-index="${indice}" placeholder="${escaparTexto(t('ws.editor.phCodigo', {}, '# Escreva seu algoritmo em Python ou pseudocódigo...'))}">${escaparTexto(bloco.texto)}</textarea>
        </div>
      `;
    } else if (bloco.tipo === 'bncc') {
      const habRaw = habilidadesCatalogo.find((h) => h.codigo === bloco.habilidade);
      const habAtual = habRaw ? traduzirHabilidadeWs(habRaw) : null;
      const opcoes = habilidadesCatalogo.map((h) => {
        const ht = traduzirHabilidadeWs(h);
        return `<option value="${escaparTexto(h.codigo)}" ${bloco.habilidade === h.codigo ? 'selected' : ''}>${escaparTexto(h.codigo)} · ${escaparTexto(ht.anos)} (${escaparTexto(ht.eixo)})</option>`;
      }).join('');
      corpoHtml = `
        <div class="ws-bloco-bncc">
          <div class="flex-entre flex-wrap gap-8">
            <select class="ws-bloco-input" data-bloco-campo="habilidade" data-bloco-index="${indice}" aria-label="${escaparTexto(t('ws.editor.habSelectAria', {}, 'Selecionar habilidade BNCC Computação'))}">
              <option value="">${escaparTexto(t('ws.editor.habSelecione', {}, 'Selecione uma habilidade BNCC...'))}</option>
              ${opcoes}
            </select>
            ${bloco.habilidade ? `<a href="/atividades.html?hab=${encodeURIComponent(bloco.habilidade)}" class="btn btn-xs btn-primario">${escaparTexto(t('ws.editor.praticarHab', { codigo: bloco.habilidade }, `Praticar ${bloco.habilidade}`))}</a>` : ''}
          </div>
          ${habAtual ? `<p class="ws-bloco-bncc-texto"><strong>${escaparTexto(habAtual.codigo)}:</strong> ${escaparTexto(habAtual.texto)}</p>` : ''}
        </div>
      `;
    } else {
      corpoHtml = `
        <textarea rows="2" class="ws-bloco-textarea" data-bloco-campo="texto" data-bloco-index="${indice}" placeholder="${escaparTexto(t('ws.editor.phParagrafo', {}, 'Escreva aqui ou digite / para inserir título, checklist, toggle, callout, código ou BNCC...'))}">${escaparTexto(bloco.texto)}</textarea>
      `;
    }

    const slashMenuHtml = slashMenuEstado && slashMenuEstado.blocoIndex === indice
      ? renderizarSlashMenuHtml(slashMenuEstado.filtro)
      : '';

    const lblCima = t('ws.editor.moverCima', {}, 'Mover bloco para cima');
    const lblBaixo = t('ws.editor.moverBaixo', {}, 'Mover bloco para baixo');
    const lblRemover = t('ws.editor.removerBloco', {}, 'Remover bloco');

    return `
      <div class="ws-bloco-row" data-flip-id="ws-bloco-${escaparTexto(bloco.id)}" data-bloco-index="${indice}">
        <div class="ws-bloco-conteudo">
          ${corpoHtml}
          ${slashMenuHtml}
        </div>
        <div class="ws-bloco-controles">
          <button type="button" class="ws-btn-icone" data-editor-acao="mover-bloco" data-bloco-index="${indice}" data-dir="-1" ${indice === 0 ? 'disabled' : ''} title="${escaparTexto(lblCima)}" aria-label="${escaparTexto(lblCima)}">↑</button>
          <button type="button" class="ws-btn-icone" data-editor-acao="mover-bloco" data-bloco-index="${indice}" data-dir="1" ${indice >= totalBlocos - 1 ? 'disabled' : ''} title="${escaparTexto(lblBaixo)}" aria-label="${escaparTexto(lblBaixo)}">↓</button>
          <button type="button" class="ws-btn-icone" data-editor-acao="remover-bloco" data-bloco-index="${indice}" title="${escaparTexto(lblRemover)}" aria-label="${escaparTexto(lblRemover)}">
            ${gerarSvgIconeHtml('trash', { tamanho: 16 })}
          </button>
        </div>
      </div>
    `;
  }

  function renderizarSlashMenuHtml(termoFiltro = '') {
    const q = String(termoFiltro || '').toLowerCase();
    const tiposBloco = obterTiposBloco();
    const filtrados = tiposBloco.filter((tb) =>
      tb.comando.includes(q)
      || tb.titulo.toLowerCase().includes(q)
      || tb.descricao.toLowerCase().includes(q),
    );
    if (filtrados.length === 0) return '';

    return `
      <div class="ws-slash-menu" role="listbox" aria-label="${escaparTexto(t('ws.editor.slashAria', {}, 'Comandos rápidos de bloco'))}">
        ${filtrados.map((tb, idx) => `
          <button type="button" class="ws-slash-opcao ${idx === 0 ? 'ativo' : ''}" role="option" data-editor-acao="aplicar-slash" data-tipo-bloco="${tb.tipo}">
            <span aria-hidden="true">${gerarSvgIconeHtml(tb.icone, { tamanho: 18 })}</span>
            <span>
              <strong>${escaparTexto(tb.titulo)} <code>${escaparTexto(tb.comando)}</code></strong>
              <small>${escaparTexto(tb.descricao)}</small>
            </span>
          </button>
        `).join('')}
      </div>
    `;
  }

  function renderizarEditorConteudo() {
    const painel = document.getElementById('ws-editor-painel');
    const item = itens.find((it) => it.id === itemEmEdicaoId);
    if (!painel || !item) return;

    const statusColunas = obterStatusColunas();
    const prioridades = obterPrioridades();
    const tiposBloco = obterTiposBloco();
    const capaObj = obterCapaPorId(item.cover_id);
    const capaAlt = obterAltAcervo(capaObj) || obterTituloAcervo(capaObj);
    const capaHtml = capaObj.categoria === 'padroes'
      ? gerarSvgPadraoGeometrico(capaObj.id, { decorativo: true, titulo: obterTituloAcervo(capaObj) })
      : `<img class="ws-capa-midia" src="${escaparTexto(capaObj.url)}" alt="${escaparTexto(capaAlt)}" width="${capaObj.width}" height="${capaObj.height}" loading="lazy" decoding="async">`;
    const iconeNome = String(item.icone_id || 'icon-lightbulb').replace(/^icon-/, '');
    const stats = contarChecklist(item.blocos);
    const blocos = Array.isArray(item.blocos) ? item.blocos : [];

    const habilidadesOpcoes = habilidadesCatalogo.map((h) => {
      const ht = traduzirHabilidadeWs(h);
      return `<option value="${escaparTexto(h.codigo)}" ${item.habilidade_codigo === h.codigo ? 'selected' : ''}>${escaparTexto(h.codigo)} · ${escaparTexto(ht.anos)}</option>`;
    }).join('');

    const cursosOpcoes = cursosDisponiveis.map((c) =>
      `<option value="${Number(c.id)}" ${Number(item.curso_id) === Number(c.id) ? 'selected' : ''}>${escaparTexto(c.titulo)}</option>`,
    ).join('');

    painel.innerHTML = `
      <div class="ws-editor-capa">
        ${capaHtml}
        <div class="ws-editor-capa-acoes">
          <button type="button" class="btn btn-sm btn-branco flex-inline-icon" data-editor-acao="toggle-picker-capa">
            ${gerarSvgIconeHtml('cover-image', { tamanho: 16 })}
            <span>${escaparTexto(t('ws.editor.alterarCapa', {}, 'Alterar capa'))}</span>
          </button>
          <button type="button" class="btn btn-sm btn-branco flex-inline-icon" data-editor-acao="fechar-editor" aria-label="${escaparTexto(t('ws.editor.fecharAria', {}, 'Fechar editor'))}">
            ${gerarSvgIconeHtml('close', { tamanho: 16 })}
            <span>${escaparTexto(t('layout.fechar', {}, 'Fechar'))}</span>
          </button>
        </div>
      </div>

      <div class="ws-editor-miolo">
        <h2 id="ws-editor-titulo-dialog" class="somente-leitor">${escaparTexto(t('ws.editor.dialogTitulo', {}, 'Editor de Página do Workspace'))}</h2>

        <div class="ws-editor-cabeca-pagina">
          <button type="button" class="ws-btn-escolher-icone" data-editor-acao="toggle-picker-icone" title="${escaparTexto(t('ws.editor.escolherIconeTitle', {}, 'Escolher ícone da página'))}" aria-label="${escaparTexto(t('ws.editor.alterarIconeAria', {}, 'Alterar ícone da página'))}">
            ${gerarSvgIconeHtml(iconeNome, { tamanho: 24 })}
          </button>
          <input type="text" id="ws-editor-titulo-input" class="ws-editor-titulo-input" data-meta-campo="titulo" value="${escaparTexto(item.titulo)}" aria-label="${escaparTexto(t('ws.editor.tituloPaginaAria', {}, 'Título da página'))}" placeholder="${escaparTexto(t('ws.editor.semTitulo', {}, 'Sem título...'))}">
        </div>

        ${renderizarPickerVisualHtml(item)}

        <div class="ws-props-grade">
          <div class="ws-prop-campo">
            <label for="ws-prop-status">${escaparTexto(t('ws.tab.status', {}, 'Status'))}</label>
            <select id="ws-prop-status" data-meta-campo="status">
              ${statusColunas.map((col) => `<option value="${col.id}" ${item.status === col.id ? 'selected' : ''}>${escaparTexto(col.rotulo)}</option>`).join('')}
            </select>
          </div>
          <div class="ws-prop-campo">
            <label for="ws-prop-eixo">${escaparTexto(t('ws.tab.eixo', {}, 'Eixo BNCC'))}</label>
            <select id="ws-prop-eixo" data-meta-campo="eixo_bncc">
              <option value="Pensamento Computacional" ${item.eixo_bncc === 'Pensamento Computacional' ? 'selected' : ''}>${escaparTexto(t('eixo.pensamento-computacional', {}, 'Pensamento Computacional'))}</option>
              <option value="Mundo Digital" ${item.eixo_bncc === 'Mundo Digital' ? 'selected' : ''}>${escaparTexto(t('eixo.mundo-digital', {}, 'Mundo Digital'))}</option>
              <option value="Cultura Digital" ${item.eixo_bncc === 'Cultura Digital' ? 'selected' : ''}>${escaparTexto(t('eixo.cultura-digital', {}, 'Cultura Digital'))}</option>
            </select>
          </div>
          <div class="ws-prop-campo">
            <label for="ws-prop-hab">${escaparTexto(t('toolbar.habilidadeBncc', {}, 'Habilidade BNCC'))}</label>
            <select id="ws-prop-hab" data-meta-campo="habilidade_codigo">
              <option value="">${escaparTexto(t('ws.editor.semVinculo', {}, 'Sem vínculo direto'))}</option>
              ${habilidadesOpcoes}
            </select>
          </div>
          <div class="ws-prop-campo">
            <label for="ws-prop-prioridade">${escaparTexto(t('ws.tab.prioridade', {}, 'Prioridade'))}</label>
            <select id="ws-prop-prioridade" data-meta-campo="prioridade">
              <option value="alta" ${item.prioridade === 'alta' ? 'selected' : ''}>${escaparTexto(prioridades.alta.rotulo)}</option>
              <option value="media" ${item.prioridade === 'media' ? 'selected' : ''}>${escaparTexto(prioridades.media.rotulo)}</option>
              <option value="baixa" ${item.prioridade === 'baixa' ? 'selected' : ''}>${escaparTexto(prioridades.baixa.rotulo)}</option>
            </select>
          </div>
          <div class="ws-prop-campo">
            <label for="ws-prop-prazo">${escaparTexto(t('ws.tab.prazo', {}, 'Prazo'))}</label>
            <input type="date" id="ws-prop-prazo" data-meta-campo="prazo" value="${escaparTexto(item.prazo || '')}">
          </div>
          ${cursosOpcoes ? `
            <div class="ws-prop-campo">
              <label for="ws-prop-curso">${escaparTexto(t('ws.editor.cursoVinculado', {}, 'Curso Vinculado'))}</label>
              <select id="ws-prop-curso" data-meta-campo="curso_id">
                <option value="">${escaparTexto(t('ws.editor.nenhumCurso', {}, 'Nenhum curso específico'))}</option>
                ${cursosOpcoes}
              </select>
            </div>
          ` : ''}
        </div>

        ${stats.total > 0 ? `
          <div class="ws-progresso-mini mb-12" id="ws-editor-progresso-checklist">
            <strong>${escaparTexto(t('ws.editor.checklistContagem', { concluidos: stats.concluidos, total: stats.total }, `Checklist (${stats.concluidos}/${stats.total})`))}</strong>
            <div class="ws-progresso-trilha"><div class="ws-progresso-fill" id="ws-editor-progresso-fill" style="width:${stats.percentual}%"></div></div>
            <span>${stats.percentual}%</span>
          </div>
        ` : ''}

        <div class="ws-blocos-toolbar" role="toolbar" aria-label="${escaparTexto(t('ws.editor.toolbarAria', {}, 'Inserir blocos no editor'))}">
          <span class="texto-pequeno texto-suave flex-inline-icon">
            ${gerarSvgIconeHtml('slash-command', { tamanho: 16 })}
            <span>${escaparTexto(t('ws.editor.inserirBlocoLabel', {}, 'Inserir bloco (ou digite /):'))}</span>
          </span>
          ${tiposBloco.map((tb) => `
            <button type="button" class="btn btn-xs btn-neutro flex-inline-icon" data-editor-acao="adicionar-bloco" data-tipo-bloco="${tb.tipo}">
              ${gerarSvgIconeHtml(tb.icone, { tamanho: 16 })}
              <span>${escaparTexto(tb.titulo)}</span>
            </button>
          `).join('')}
        </div>

        <div class="ws-blocos-lista" id="ws-blocos-lista">
          ${blocos.map((bloco, i) => renderizarBlocoHtml(bloco, i, blocos.length)).join('')}
        </div>

        <div class="ws-editor-rodape">
          <button type="button" class="btn btn-perigo btn-sm flex-inline-icon" data-editor-acao="excluir-atual">
            ${gerarSvgIconeHtml('trash', { tamanho: 16 })}
            <span>${escaparTexto(t('ws.editor.excluirPagina', {}, 'Excluir esta página'))}</span>
          </button>
          <div class="flex-linha gap-8">
            <button type="button" class="btn btn-primario flex-inline-icon" data-editor-acao="salvar-e-fechar">
              ${gerarSvgIconeHtml('check-circle', { tamanho: 16 })}
              <span>${escaparTexto(t('ws.editor.salvarConcluir', {}, 'Salvar e Concluir'))}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function criarNovoBloco(tipo, texto = '') {
    const base = {
      id: `blk-${Date.now()}-${Math.floor(Math.random() * 999)}`,
      tipo,
      texto,
    };
    if (tipo === 'titulo') base.nivel = 'h2';
    if (tipo === 'checklist') base.concluido = false;
    if (tipo === 'toggle') {
      base.aberto = true;
      base.detalhe = '';
    }
    if (tipo === 'callout') {
      base.tom = 'info';
      base.icone = 'icon-lightbulb';
    }
    if (tipo === 'codigo') base.linguagem = 'python';
    if (tipo === 'bncc') {
      base.habilidade = habilidadesCatalogo[0]?.codigo || 'EF01CO02';
      base.detalhe = '';
    }
    return base;
  }

  function criarItemComTemplate(templateId = null) {
    const tpl = obterTemplatesPedagogicos().find((item) => item.id === templateId);
    const novo = {
      id: gerarIdLocal(),
      titulo: tpl ? tpl.titulo : t('ws.novaIdeiaTitulo', {}, 'Nova Ideia de Computação'),
      status: tpl ? tpl.status : 'ideia',
      eixo_bncc: tpl ? tpl.eixo_bncc : 'Pensamento Computacional',
      habilidade_codigo: tpl ? tpl.habilidade_codigo : null,
      curso_id: null,
      curso_titulo: null,
      prioridade: tpl ? tpl.prioridade : 'media',
      prazo: null,
      cover_id: tpl ? tpl.cover_id : 'cover-lms-compasso',
      icone_id: tpl ? tpl.icone_id : 'icon-lightbulb',
      template_origem: tpl ? tpl.id : null,
      blocos: tpl
        ? tpl.blocos.map((b, i) => ({ ...b, id: `blk-${Date.now()}-${i}` }))
        : [criarNovoBloco('paragrafo', '')],
      ordem: itens.length,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };
    itens.unshift(novo);
    renderizarVisaoAtiva(true);
    persistirOperacao('criar', novo.id, novo);
    abrirEditorItem(novo.id);
  }

  function salvarEdicaoItemAtual() {
    const item = itens.find((it) => it.id === itemEmEdicaoId);
    if (!item) return;
    item.atualizado_em = new Date().toISOString();
    renderizarVisaoAtiva(false);
    persistirOperacao('atualizar', item.id, {
      titulo: item.titulo,
      status: item.status,
      eixo_bncc: item.eixo_bncc,
      habilidade_codigo: item.habilidade_codigo,
      curso_id: item.curso_id,
      prioridade: item.prioridade,
      prazo: item.prazo,
      cover_id: item.cover_id,
      icone_id: item.icone_id,
      template_origem: item.template_origem,
      blocos: item.blocos,
      ordem: item.ordem,
    });
  }

  async function excluirItemPorId(id) {
    itens = itens.filter((it) => it.id !== id);
    if (itemEmEdicaoId === id) fecharEditorItem();
    renderizarVisaoAtiva(true);
    await persistirOperacao('excluir', id);
  }

  async function apagarTodosItensLgpd() {
    if (!confirm(t('ws.confirmarApagarTudo', {}, 'Deseja apagar permanentemente todos os seus itens do Workspace? Esta ação cumpre o direito de eliminação (LGPD Art. 18, VI).'))) {
      return;
    }
    itens = [];
    fecharEditorItem();
    salvarCacheLocal([]);
    renderizarVisaoAtiva(false);
    await persistirOperacao('apagar_todos', 0);
    if (typeof mostrarNotificacao === 'function') {
      mostrarNotificacao(t('ws.notifTodosApagados', {}, 'Todos os itens do Workspace foram apagados.'), 'sucesso');
    }
  }

  raiz.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'ws-editor-backdrop') {
      salvarEdicaoItemAtual();
      fecharEditorItem();
      return;
    }

    const acaoBtn = e.target.closest('[data-acao]');
    if (acaoBtn) {
      const acao = acaoBtn.dataset.acao;
      const id = Number(acaoBtn.dataset.id);

      if (acao === 'novo-item') criarItemComTemplate(null);
      else if (acao === 'criar-template') criarItemComTemplate(acaoBtn.dataset.templateId);
      else if (acao === 'abrir') abrirEditorItem(id, acaoBtn);
      else if (acao === 'excluir') excluirItemPorId(id);
      else if (acao === 'mover-status') moverItemStatus(id, acaoBtn.dataset.status);
      else if (acao === 'apagar-todos-lgpd') apagarTodosItensLgpd();
      else if (acao === 'trocar-visao') {
        visaoAtual = acaoBtn.dataset.visao || 'kanban';
        raiz.querySelectorAll('[data-acao="trocar-visao"]').forEach((b) => {
          b.setAttribute('aria-pressed', String(b === acaoBtn));
        });
        renderizarVisaoAtiva(true);
      } else if (acao === 'limpar-filtros') {
        filtro = { busca: '', eixo: '', prioridade: '', cursoId: '', prazo: '' };
        ['ws-filtro-busca', 'ws-filtro-eixo', 'ws-filtro-prioridade', 'ws-filtro-prazo', 'ws-filtro-curso'].forEach((fid) => {
          const el = document.getElementById(fid);
          if (el) el.value = '';
        });
        renderizarVisaoAtiva(true);
      }
      return;
    }

    const edBtn = e.target.closest('[data-editor-acao]');
    if (!edBtn) return;
    const item = itens.find((it) => it.id === itemEmEdicaoId);
    if (!item) return;

    const acao = edBtn.dataset.editorAcao;
    const idx = Number(edBtn.dataset.blocoIndex);

    if (acao === 'fechar-editor' || acao === 'salvar-e-fechar') {
      salvarEdicaoItemAtual();
      fecharEditorItem();
    } else if (acao === 'excluir-atual') {
      excluirItemPorId(item.id);
    } else if (acao === 'toggle-picker-capa') {
      pickerAberto = pickerAberto === 'capa' ? null : 'capa';
      renderizarEditorConteudo();
    } else if (acao === 'toggle-picker-icone') {
      pickerAberto = pickerAberto === 'icone' ? null : 'icone';
      renderizarEditorConteudo();
    } else if (acao === 'fechar-picker') {
      pickerAberto = null;
      renderizarEditorConteudo();
    } else if (acao === 'aba-capa') {
      abaCoverAtiva = edBtn.dataset.categoria || 'notion';
      renderizarEditorConteudo();
    } else if (acao === 'selecionar-capa') {
      item.cover_id = edBtn.dataset.coverId;
      pickerAberto = null;
      renderizarEditorConteudo();
      salvarEdicaoItemAtual();
    } else if (acao === 'selecionar-icone') {
      item.icone_id = edBtn.dataset.iconeId;
      pickerAberto = null;
      renderizarEditorConteudo();
      salvarEdicaoItemAtual();
    } else if (acao === 'adicionar-bloco') {
      item._editadoManual = true;
      item.blocos.push(criarNovoBloco(edBtn.dataset.tipoBloco || 'paragrafo'));
      renderizarEditorConteudo();
      salvarEdicaoItemAtual();
    } else if (acao === 'aplicar-slash' && slashMenuEstado) {
      item._editadoManual = true;
      const novoTipo = edBtn.dataset.tipoBloco || 'paragrafo';
      const antigo = item.blocos[slashMenuEstado.blocoIndex];
      const textoLimpo = String(antigo?.texto || '').replace(/\/[a-z0-9]*$/i, '').trim();
      item.blocos[slashMenuEstado.blocoIndex] = criarNovoBloco(novoTipo, textoLimpo);
      slashMenuEstado = null;
      renderizarEditorConteudo();
      salvarEdicaoItemAtual();
    } else if (acao === 'mover-bloco') {
      item._editadoManual = true;
      const dir = Number(edBtn.dataset.dir);
      const destino = idx + dir;
      if (destino >= 0 && destino < item.blocos.length) {
        animarFlip(
          () => document.querySelectorAll('#ws-blocos-lista [data-flip-id]'),
          () => {
            const temp = item.blocos[idx];
            item.blocos[idx] = item.blocos[destino];
            item.blocos[destino] = temp;
            renderizarEditorConteudo();
          },
          { duration: 0.25 },
        );
        salvarEdicaoItemAtual();
      }
    } else if (acao === 'remover-bloco') {
      item._editadoManual = true;
      item.blocos.splice(idx, 1);
      if (item.blocos.length === 0) item.blocos.push(criarNovoBloco('paragrafo', ''));
      renderizarEditorConteudo();
      salvarEdicaoItemAtual();
    } else if (acao === 'alternar-nivel-titulo') {
      item.blocos[idx].nivel = item.blocos[idx].nivel === 'h3' ? 'h2' : 'h3';
      renderizarEditorConteudo();
      salvarEdicaoItemAtual();
    } else if (acao === 'alternar-toggle') {
      item.blocos[idx].aberto = !item.blocos[idx].aberto;
      renderizarEditorConteudo();
      salvarEdicaoItemAtual();
    } else if (acao === 'copiar-codigo') {
      const codigo = item.blocos[idx]?.texto || '';
      navigator.clipboard?.writeText(codigo).catch((erroClip) => {
        console.warn('Cópia para área de transferência bloqueada:', erroClip?.message || erroClip);
      });
      if (typeof mostrarNotificacao === 'function') {
        mostrarNotificacao(t('ws.editor.notifCodigoCopiado', {}, 'Código copiado para a área de transferência.'), 'sucesso');
      }
    }
  });

  raiz.addEventListener('input', (e) => {
    const alvo = e.target;
    if (alvo.id === 'ws-filtro-busca') {
      filtro.busca = alvo.value;
      renderizarVisaoAtiva(true);
      return;
    }

    const item = itens.find((it) => it.id === itemEmEdicaoId);
    if (!item) return;

    if (alvo.dataset.metaCampo === 'titulo') {
      item._editadoManual = true;
      item.titulo = alvo.value;
      return;
    }

    if (alvo.dataset.blocoCampo && alvo.dataset.blocoIndex !== undefined) {
      item._editadoManual = true;
      const idx = Number(alvo.dataset.blocoIndex);
      const campo = alvo.dataset.blocoCampo;
      if (!item.blocos[idx]) return;
      if (campo === 'concluido') return;
      item.blocos[idx][campo] = alvo.value;

      if (campo === 'texto') {
        const matchSlash = String(alvo.value).match(/(?:^|\s)(\/[a-z0-9]*)$/i);
        if (matchSlash) {
          slashMenuEstado = { blocoIndex: idx, filtro: matchSlash[1].toLowerCase() };
          const row = alvo.closest('.ws-bloco-conteudo');
          if (row) {
            const antigoMenu = row.querySelector('.ws-slash-menu');
            if (antigoMenu) antigoMenu.remove();
            const menuHtml = renderizarSlashMenuHtml(slashMenuEstado.filtro);
            if (menuHtml) row.insertAdjacentHTML('beforeend', menuHtml);
          }
        } else if (slashMenuEstado) {
          slashMenuEstado = null;
          document.querySelectorAll('.ws-slash-menu').forEach((m) => m.remove());
        }
      }
    }
  });

  raiz.addEventListener('change', (e) => {
    const alvo = e.target;
    if (alvo.id === 'ws-filtro-eixo') {
      filtro.eixo = alvo.value;
      renderizarVisaoAtiva(true);
      return;
    }
    if (alvo.id === 'ws-filtro-prioridade') {
      filtro.prioridade = alvo.value;
      renderizarVisaoAtiva(true);
      return;
    }
    if (alvo.id === 'ws-filtro-prazo') {
      filtro.prazo = alvo.value;
      renderizarVisaoAtiva(true);
      return;
    }
    if (alvo.id === 'ws-filtro-curso') {
      filtro.cursoId = alvo.value;
      renderizarVisaoAtiva(true);
      return;
    }
    if (alvo.dataset.acao === 'alterar-status-tabela') {
      moverItemStatus(Number(alvo.dataset.id), alvo.value);
      return;
    }

    const item = itens.find((it) => it.id === itemEmEdicaoId);
    if (!item) return;

    if (alvo.dataset.metaCampo) {
      const campo = alvo.dataset.metaCampo;
      if (campo === 'titulo') item._editadoManual = true;
      item[campo] = campo === 'curso_id' ? (alvo.value ? Number(alvo.value) : null) : (alvo.value || null);
      if (campo === 'titulo' && !item.titulo) item.titulo = t('ws.editor.semTituloPadrao', {}, 'Sem título');
      salvarEdicaoItemAtual();
      return;
    }

    if (alvo.dataset.blocoCampo && alvo.dataset.blocoIndex !== undefined) {
      const idx = Number(alvo.dataset.blocoIndex);
      const campo = alvo.dataset.blocoCampo;
      if (!item.blocos[idx]) return;

      if (campo === 'concluido') {
        item.blocos[idx].concluido = Boolean(alvo.checked);
        renderizarEditorConteudo();
        const stats = contarChecklist(item.blocos);
        const boxProg = document.getElementById('ws-editor-progresso-checklist');
        if (boxProg) {
          animarFeedbackGamificacao(boxProg, 'checklist');
        }
        const fill = document.getElementById('ws-editor-progresso-fill');
        if (fill) {
          animarFeedbackGamificacao(fill, 'progresso', { largura: `${stats.percentual}%` });
        }
        salvarEdicaoItemAtual();
      } else {
        item._editadoManual = true;
        item.blocos[idx][campo] = alvo.value;
        if (campo === 'habilidade' || campo === 'tom') {
          renderizarEditorConteudo();
        }
        salvarEdicaoItemAtual();
      }
    }
  });

  raiz.addEventListener('keydown', (e) => {
    if (!slashMenuEstado) return;
    const opcoes = Array.from(raiz.querySelectorAll('.ws-slash-opcao'));
    if (opcoes.length === 0) return;

    const ativoIdx = opcoes.findIndex((o) => o.classList.contains('ativo'));
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const prox = (ativoIdx + 1) % opcoes.length;
      opcoes.forEach((o, i) => o.classList.toggle('ativo', i === prox));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const ant = (ativoIdx - 1 + opcoes.length) % opcoes.length;
      opcoes.forEach((o, i) => o.classList.toggle('ativo', i === ant));
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const escolhido = opcoes[ativoIdx >= 0 ? ativoIdx : 0];
      if (escolhido) escolhido.click();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (slashMenuEstado) {
        slashMenuEstado = null;
        document.querySelectorAll('.ws-slash-menu').forEach((m) => m.remove());
        return;
      }
      if (itemEmEdicaoId !== null) {
        salvarEdicaoItemAtual();
        fecharEditorItem();
      }
    }
  });

  window.addEventListener('online', () => {
    void carregarDoServidor().catch((erroOnline) => {
      console.warn('Falha ao reconectar Workspace ao D1:', erroOnline?.message || erroOnline);
    });
  });

  function atualizarWorkspaceNoIdioma() {
    if (usuario) {
      const tituloTopbar = document.getElementById('titulo-pagina');
      if (tituloTopbar) tituloTopbar.textContent = t('layout.menu.workspace', {}, 'Meu Workspace');
    } else {
      relocalizarDemosNaoEditados();
    }
    const edicaoAberta = itemEmEdicaoId !== null;
    renderizarEstruturaBase();
    if (edicaoAberta) {
      const backdrop = document.getElementById('ws-editor-backdrop');
      if (backdrop) backdrop.hidden = false;
      renderizarEditorConteudo();
    }
  }

  window.addEventListener('lms:idioma-alterado', atualizarWorkspaceNoIdioma);
  window.addEventListener('lms:layout-atualizado', () => {
    if (usuario) {
      const tituloTopbar = document.getElementById('titulo-pagina');
      if (tituloTopbar) tituloTopbar.textContent = t('layout.menu.workspace', {}, 'Meu Workspace');
    }
  });

  await carregarCatalogosAuxiliares();
  if (!usuario) relocalizarDemosNaoEditados();
  traduzirDocumento();
  renderizarEstruturaBase();
  void carregarDoServidor().catch((erroCarga) => {
    console.warn('Falha ao carregar itens remotos do Workspace:', erroCarga?.message || erroCarga);
  });
}

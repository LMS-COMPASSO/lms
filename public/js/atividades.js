/**
 * ============================================================================
 * LMS COMPASSO - ATIVIDADES DINÂMICAS E LABORATÓRIO 3D PYTHON (/atividades.html)
 * ============================================================================
 * - Sem parâmetros: mostra o catálogo com busca, filtros por Eixo BNCC, Ano,
 *   Tipo e Código de Habilidade (ex.: EF69CO03), barra de progresso e card
 *   "Retomar de onde parou".
 * - Com ?id=<atividade>: abre a atividade com breadcrumbs, mapa de habilidades
 *   BNCC trabalhadas, navegação Anterior/Próxima e jogador interativo (incluindo
 *   o Laboratório 3D Python com Pyodide Web Worker + Three.js + GSAP).
 * ============================================================================
 */

import {
  ATIVIDADES,
  CONCEITOS,
  EIXOS_BNCC,
  FAIXAS,
  HABILIDADES,
  NIVEIS,
  TIPOS,
  buscarAtividade,
} from './atividades/catalogo.js';
import { contarConcluidas, registrarConclusao } from './atividades/logica.js';
import { anunciar, h } from './atividades/dom.js';
import { criarJogador } from './atividades/jogadores.js';
import { imprimirFichas } from './atividades/impressao.js';
import { renderizarIcone } from './atividades/icones.js';
import { t } from '/js/i18n.js';

const raiz = document.getElementById('atividades-raiz');
const parametros = new URLSearchParams(window.location.search);
const usuario = obterToken() ? obterUsuario() : null;
const aulaId = Number(parametros.get('aula')) || null;
const cursoId = Number(parametros.get('curso')) || null;
const chaveProgresso = `lms_atividades_progresso:${usuario ? usuario.id : 'visitante'}`;
const chaveUltimaAtividade = `lms_ultima_atividade:${usuario ? usuario.id : 'visitante'}`;
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const TituloPagina = usuario ? 'h2' : 'h1';
const TituloCartao = usuario ? 'h3' : 'h2';

function lerProgresso() {
  try {
    return JSON.parse(localStorage.getItem(chaveProgresso)) || {};
  } catch {
    return {};
  }
}

function salvarProgresso(progresso) {
  try {
    localStorage.setItem(chaveProgresso, JSON.stringify(progresso));
  } catch {
    // Continua funcionando mesmo se o navegador bloquear o armazenamento local.
  }
}

function lerUltimaVisitada() {
  try {
    return localStorage.getItem(chaveUltimaAtividade) || null;
  } catch {
    return null;
  }
}

function salvarUltimaVisitada(id) {
  try {
    localStorage.setItem(chaveUltimaAtividade, id);
  } catch {
    // Ignora caso bloqueado.
  }
}

let progresso = lerProgresso();

const ATIVIDADES_PYTHON_3D = ATIVIDADES.filter((a) => a.tipo === 'python3d');
const CHAVE_SUBMISSOES_PYTHON_LOCAL = 'lms_submissoes_python_local';

function contarPython3dConcluidas() {
  return ATIVIDADES_PYTHON_3D.filter((a) => progresso[a.id]?.concluida).length;
}

function salvarSubmissaoPythonLocal(atividade, dados = {}) {
  if (!dados.codigoPython) return;
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE_SUBMISSOES_PYTHON_LOCAL) || '[]');
    const nova = {
      id: Date.now(),
      usuario_id: usuario?.id || 0,
      aluno_nome: usuario?.nome || 'Estudante Visitante',
      aluno_email: usuario?.email || 'visitante@escola.edu.br',
      atividade_id: atividade.id,
      atividade_titulo: atividade.titulo,
      codigo_python: dados.codigoPython,
      sucesso: 1,
      tentativas: dados.tentativas || 1,
      estrelas: dados.estrelas || 3,
      parceiro_dupla: dados.parceiroDupla || null,
      papel_dupla: dados.papelDupla || null,
      criado_em: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    const filtrada = lista.filter((item) => !(item.atividade_id === nova.atividade_id && item.aluno_nome === nova.aluno_nome));
    filtrada.unshift(nova);
    localStorage.setItem(CHAVE_SUBMISSOES_PYTHON_LOCAL, JSON.stringify(filtrada.slice(0, 50)));
  } catch {
    // Ignora erro de localStorage
  }
}

function obterUrlCertificadoPython3d(parceiroDupla = null) {
  const params = new URLSearchParams();
  if (usuario?.nome) params.set('aluno', usuario.nome);
  if (parceiroDupla) params.set('dupla', parceiroDupla);
  const query = params.toString();
  return `/api/certificados/python3d${query ? `?${query}` : ''}`;
}

function bannerExploradorPython3d() {
  const concluidas3d = contarPython3dConcluidas();
  const total3d = ATIVIDADES_PYTHON_3D.length;
  const conquistado = concluidas3d >= total3d && total3d > 0;

  return h(
    'section',
    {
      class: `atv-explorador-banner ${conquistado ? 'conquistado' : ''}`,
      'aria-label': 'Progresso da Insígnia e Certificado Explorador Python 3D',
    },
    h(
      'div',
      { class: 'atv-explorador-esquerda' },
      h(
        'div',
        { class: 'atv-explorador-icone', 'aria-hidden': 'true' },
        h('span', { class: 'material-symbols-outlined icon-lg' }, conquistado ? 'workspace_premium' : 'deployed_code'),
      ),
      h(
        'div',
        { class: 'atv-explorador-info' },
        h(
          'h3',
          {},
          conquistado
            ? 'Insígnia Conquistada: Explorador Python 3D! (+150 XP)'
            : `Trilha Explorador Python 3D (${concluidas3d} de ${total3d} missões concluídas)`,
        ),
        h(
          'p',
          {},
          conquistado
            ? 'Parabéns! Você dominou todas as 6 missões tridimensionais de algoritmos em Python. Seu certificado oficial já está liberado.'
            : 'Complete os 6 desafios do Laboratório 3D Python (individualmente ou em modo Dupla) para conquistar a medalha e o Certificado Explorador Python 3D.',
        ),
        h(
          'div',
          { class: 'atv-explorador-chips' },
          ATIVIDADES_PYTHON_3D.map((atv) => {
            const ok = Boolean(progresso[atv.id]?.concluida);
            return h(
              'span',
              { class: `atv-chip-py3d ${ok ? 'ok' : ''}` },
              `${ok ? '✓ ' : ''}${atv.titulo.replace('Python 3D: ', '')}`,
            );
          }),
        ),
      ),
    ),
    h(
      'div',
      { class: 'atv-explorador-acoes' },
      h(
        'a',
        {
          class: `btn ${conquistado ? 'btn-primario' : 'btn-neutro'} btn-sm flex-inline-icon`,
          href: obterUrlCertificadoPython3d(),
          target: '_blank',
          rel: 'noopener',
        },
        h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'workspace_premium'),
        conquistado ? 'Emitir Certificado Python 3D' : 'Visualizar Certificado Python 3D',
      ),
    ),
  );
}

/**
 * Calcula o nível de domínio de uma habilidade BNCC com base nas atividades concluídas.
 */
function nivelDominioHabilidade(codigo) {
  const relacionadas = ATIVIDADES.filter((a) => a.habilidades.includes(codigo));
  if (relacionadas.length === 0) return { rotulo: 'Disponível', classe: 'dominio-disponivel', percentual: 0 };
  const concluidas = relacionadas.filter((a) => progresso[a.id]?.concluida).length;
  const percentual = Math.round((concluidas / relacionadas.length) * 100);
  if (percentual === 100) return { rotulo: 'Consolidada', classe: 'dominio-consolidada', percentual };
  if (percentual > 0) return { rotulo: 'Em progresso', classe: 'dominio-progresso', percentual };
  return { rotulo: 'Não iniciada', classe: 'dominio-disponivel', percentual: 0 };
}

/* ---------------------------------------------------------------------------
 * Catálogo com Busca, Filtros BNCC e Retomar de Onde Parou
 * ------------------------------------------------------------------------ */

function obterSecaoPorEixo(eixo) {
  if (eixo === 'mundo-digital') return 'mundo';
  if (eixo === 'cultura-digital') return 'cultura';
  return 'pensamento';
}

function cartaoDaAtividade(atividade) {
  const concluida = Boolean(progresso[atividade.id]?.concluida);
  const emAndamento = !concluida && lerUltimaVisitada() === atividade.id;
  const eixoInfo = EIXOS_BNCC[atividade.eixo] || EIXOS_BNCC['pensamento-computacional'];
  const secaoEixo = obterSecaoPorEixo(atividade.eixo);

  let estadoBadge;
  if (concluida) {
    estadoBadge = h(
      'span',
      { class: 'estado-progresso-pill estado-concluido' },
      h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'check_circle'),
      t('card.concluido'),
    );
  } else if (emAndamento) {
    estadoBadge = h(
      'span',
      { class: 'estado-progresso-pill estado-em-andamento' },
      h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'schedule'),
      t('card.emAndamento'),
    );
  } else {
    estadoBadge = h(
      'span',
      { class: 'estado-progresso-pill estado-nao-iniciado' },
      h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'circle-dashed'),
      t('card.naoIniciado'),
    );
  }

  return h(
    'li',
    {},
    h(
      'article',
      { class: 'atv-card', 'data-secao': secaoEixo },
      h(
        'div',
        { class: 'atv-card-topo' },
        h('div', { class: 'pub-icone', 'aria-hidden': 'true' }, renderizarIcone(atividade.id)),
        h(
          'div',
          { class: 'flex-linha flex-wrap gap-8' },
          h('span', { class: 'secao-pista-badge', 'data-secao': secaoEixo }, t(`eixo.${atividade.eixo}`, {}, eixoInfo.rotulo)),
          estadoBadge,
        ),
      ),
      h(TituloCartao, {}, t(`atv.${atividade.id}.titulo`, {}, atividade.titulo)),
      h('p', {}, t(`atv.${atividade.id}.resumo`, {}, atividade.resumo)),
      h(
        'ul',
        { class: 'atv-meta', 'aria-label': 'Metadados e habilidades BNCC' },
        [
          t(`tipo.${atividade.tipo}`, {}, TIPOS[atividade.tipo].rotulo),
          t(`faixa.${atividade.faixa}`, {}, atividade.anos),
          t(`nivel.${atividade.nivel}`, {}, NIVEIS[atividade.nivel]),
          `${atividade.duracaoMin} ${t('card.min')}`,
          ...atividade.habilidades,
        ].map((rotulo) => h('li', { class: HABILIDADES[rotulo] ? 'atv-meta-bncc' : '' }, rotulo)),
      ),
      h(
        'div',
        { class: 'atv-card-acao' },
        h(
          'a',
          { class: `btn ${concluida ? 'btn-neutro' : 'btn-primario'} seta-proximo`, href: `/atividades.html?id=${encodeURIComponent(atividade.id)}` },
          concluida ? t('card.jogarDeNovo') : t('card.comecar'),
          h('span', { class: 'somente-leitor' }, `: ${t(`atv.${atividade.id}.titulo`, {}, atividade.titulo)}`),
          h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'arrow_forward'),
        ),
      ),
    ),
  );
}

function bannerSpotlight(destaqueObj, concluidas, total) {
  const { atividade, tipoDestaque } = destaqueObj;
  const concluida = Boolean(progresso[atividade.id]?.concluida);
  const emAndamento = !concluida && lerUltimaVisitada() === atividade.id;
  const secaoEixo = obterSecaoPorEixo(atividade.eixo);
  const eixoInfo = EIXOS_BNCC[atividade.eixo] || EIXOS_BNCC['pensamento-computacional'];
  const percentualTotal = Math.round((concluidas / total) * 100);
  const concluidas3d = contarPython3dConcluidas();
  const total3d = ATIVIDADES_PYTHON_3D.length;

  let kickerTexto = t('spotlight.kickerRecomendada');
  let ctaTexto = t('spotlight.comecarDesafio');
  let iconeKicker = 'rocket_launch';

  if (tipoDestaque === 'retomar') {
    kickerTexto = t('spotlight.kickerRetomar');
    ctaTexto = t('spotlight.retomarAtividade');
    iconeKicker = 'play_circle';
  } else if (tipoDestaque === 'concluida') {
    kickerTexto = t('spotlight.kickerConcluida');
    ctaTexto = t('spotlight.jogarNovamente');
    iconeKicker = 'workspace_premium';
  }

  let estadoBadge;
  if (concluida) {
    estadoBadge = h(
      'span',
      { class: 'estado-progresso-pill estado-concluido' },
      h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'check_circle'),
      t('card.concluido'),
    );
  } else if (emAndamento) {
    estadoBadge = h(
      'span',
      { class: 'estado-progresso-pill estado-em-andamento' },
      h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'schedule'),
      t('card.emAndamento'),
    );
  } else {
    estadoBadge = h(
      'span',
      { class: 'estado-progresso-pill estado-nao-iniciado' },
      h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'circle-dashed'),
      t('card.naoIniciado'),
    );
  }

  const xpAcumulados = concluidas * 25 + concluidas3d * 25;

  return h(
    'section',
    { class: 'atv-spotlight', 'aria-label': t('spotlight.destaqueAriaLabel') },
    h('div', { class: 'atv-spotlight-backdrop', 'aria-hidden': 'true' }),
    h(
      'div',
      { class: 'atv-spotlight-grid' },
      h(
        'div',
        { class: 'atv-spotlight-conteudo' },
        h(
          'div',
          { class: 'atv-spotlight-kicker-row' },
          h(
            'span',
            { class: 'atv-spotlight-kicker' },
            h('span', { class: 'atv-spotlight-pulse', 'aria-hidden': 'true' }),
            h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, iconeKicker),
            kickerTexto,
          ),
          h('span', { class: 'secao-pista-badge', 'data-secao': secaoEixo }, t(`eixo.${atividade.eixo}`, {}, eixoInfo.rotulo)),
          estadoBadge,
        ),
        h(TituloPagina, { class: 'atv-spotlight-titulo' }, t(`atv.${atividade.id}.titulo`, {}, atividade.titulo)),
        h('p', { class: 'atv-spotlight-resumo' }, t(`atv.${atividade.id}.resumo`, {}, atividade.resumo)),
        h(
          'ul',
          { class: 'atv-spotlight-meta', 'aria-label': 'Metadados da atividade em destaque' },
          [
            t(`tipo.${atividade.tipo}`, {}, TIPOS[atividade.tipo].rotulo),
            t(`faixa.${atividade.faixa}`, {}, atividade.anos),
            t(`nivel.${atividade.nivel}`, {}, NIVEIS[atividade.nivel]),
            `${atividade.duracaoMin} ${t('card.min')}`,
            ...atividade.habilidades,
          ].map((rotulo) => h('li', { class: HABILIDADES[rotulo] ? 'atv-meta-bncc' : '' }, rotulo)),
        ),
        h(
          'div',
          { class: 'atv-spotlight-acoes' },
          h(
            'a',
            {
              class: 'btn-spotlight-play seta-proximo',
              href: `/atividades.html?id=${encodeURIComponent(atividade.id)}`,
              id: 'btn-spotlight-play',
            },
            h('span', { class: 'material-symbols-outlined icon-sm', 'aria-hidden': 'true' }, 'play_arrow'),
            h('span', {}, ctaTexto),
          ),
          h(
            'a',
            {
              class: 'btn-spotlight-ghost',
              href: '#catalogo-atividades',
              id: 'btn-spotlight-explorar',
              onclick: (e) => {
                e.preventDefault();
                const elem = document.getElementById('catalogo-atividades');
                if (elem) elem.scrollIntoView({ behavior: 'smooth' });
              },
            },
            h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'grid_view'),
            t('spotlight.explorarGrade', { total }),
          ),
          h(
            'a',
            {
              class: 'btn-spotlight-ghost btn-spotlight-cert',
              href: obterUrlCertificadoPython3d(),
              target: '_blank',
              rel: 'noopener',
              title: t('spotlight.certificado3dTitulo'),
            },
            h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'workspace_premium'),
            t('spotlight.certificado3d', { concluidas: concluidas3d, total: total3d }),
          ),
        ),
        h(
          'div',
          { class: 'atv-spotlight-progresso-card', role: 'region', 'aria-label': 'Progresso na trilha' },
          h(
            'div',
            { class: 'atv-spotlight-progresso-rotulos' },
            h('span', {}, t('spotlight.trilhaProgresso', { concluidas, total, percentual: percentualTotal })),
            h('span', { class: 'atv-xp-badge' }, t('spotlight.xpConquistados', { xp: xpAcumulados })),
          ),
          h(
            'div',
            {
              class: 'progress-bar',
              role: 'progressbar',
              'aria-valuenow': String(percentualTotal),
              'aria-valuemin': '0',
              'aria-valuemax': '100',
              'aria-label': `Progresso da trilha: ${percentualTotal}%`,
            },
            h('div', { class: 'progress-bar-fill', style: `width: ${percentualTotal}%` }),
          ),
        ),
      ),
      h(
        'div',
        { class: 'atv-spotlight-preview', 'aria-hidden': 'true' },
        h(
          'a',
          {
            class: 'atv-preview-card',
            href: `/atividades.html?id=${encodeURIComponent(atividade.id)}`,
            tabindex: '-1',
          },
          h(
            'div',
            { class: 'atv-preview-orb', 'data-secao': secaoEixo },
            renderizarIcone(atividade.id),
          ),
          h(
            'div',
            { class: 'atv-preview-legenda' },
            h('span', { class: 'atv-preview-badge' }, t(`tipo.${atividade.tipo}`, {}, TIPOS[atividade.tipo].rotulo)),
            h('strong', {}, t(`atv.${atividade.id}.titulo`, {}, atividade.titulo)),
            h(
              'span',
              { class: 'atv-preview-cta' },
              h('span', { class: 'material-symbols-outlined icon-xs' }, 'play_circle'),
              t('spotlight.cliqueParaJogar'),
            ),
          ),
        ),
      ),
    ),
  );
}

function renderCatalogo() {
  document.title = 'Atividades dinâmicas e Laboratório 3D Python — LMS COMPASSO';
  document.body.setAttribute('data-secao', 'pensamento');

  const filtro = {
    busca: (parametros.get('busca') || '').trim().toLowerCase(),
    tipo: parametros.get('tipo') || 'todos',
    conceito: 'todos',
    faixa: parametros.get('faixa') || 'todas',
    habilidade: parametros.get('hab') || 'todas',
  };

  const concluidasTotal = contarConcluidas(progresso, ATIVIDADES);
  const totalGeral = ATIVIDADES.length;

  // Atividade Destaque para o Hero CinemaOS
  const ultimaId = lerUltimaVisitada();
  let atividadeDestaque = null;
  let tipoDestaque = 'recomendada';

  if (ultimaId) {
    const atv = buscarAtividade(ultimaId);
    if (atv && !progresso[atv.id]?.concluida) {
      atividadeDestaque = atv;
      tipoDestaque = 'retomar';
    }
  }

  if (!atividadeDestaque) {
    atividadeDestaque = ATIVIDADES.find((a) => !progresso[a.id]?.concluida);
  }

  if (!atividadeDestaque) {
    atividadeDestaque = ATIVIDADES.find((a) => a.id === 'py3d-labirinto-1') || ATIVIDADES[0];
    tipoDestaque = 'concluida';
  }

  // Lista de atividades
  const lista = h('ul', { class: 'atv-grade', id: 'lista-atividades' });

  // Input de busca com ícone e botão limpar
  const inputBusca = h('input', {
    type: 'search',
    class: 'atv-input-busca',
    value: filtro.busca,
    placeholder: t('toolbar.buscaPlaceholder'),
    'aria-label': t('toolbar.buscaAriaLabel'),
    oninput: (e) => {
      filtro.busca = e.target.value.trim().toLowerCase();
      btnLimparBusca.style.display = filtro.busca ? 'inline-flex' : 'none';
      atualizar();
    },
  });

  const btnLimparBusca = h(
    'button',
    {
      type: 'button',
      class: 'atv-busca-limpar',
      'aria-label': t('toolbar.limparBusca'),
      style: filtro.busca ? 'display: inline-flex;' : 'display: none;',
      onclick: () => {
        filtro.busca = '';
        inputBusca.value = '';
        btnLimparBusca.style.display = 'none';
        atualizar();
        inputBusca.focus();
      },
    },
    h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'close'),
  );

  // Categorias para a barra de pílulas segmentadas (CinemaOS Category bar)
  const categorias = [
    { tipo: 'todos', rotulo: t('toolbar.todas'), icone: 'apps' },
    { tipo: 'python3d', rotulo: t('toolbar.python3d'), icone: 'deployed_code' },
    { tipo: 'ordenar', rotulo: t('toolbar.algoritmos'), icone: 'format_list_numbered' },
    { tipo: 'decompor', rotulo: t('toolbar.decomposicao'), icone: 'extension' },
    { tipo: 'robo', rotulo: t('toolbar.robo'), icone: 'smart_toy' },
    { tipo: 'blocos', rotulo: t('toolbar.blocos'), icone: 'widgets' },
  ].filter((cat) => cat.tipo === 'todos' || ATIVIDADES.some((a) => a.tipo === cat.tipo));

  const pillButtons = [];
  const pillTrack = h(
    'div',
    { class: 'atv-pills-modalidades', role: 'tablist', 'aria-label': 'Filtrar por modalidade de atividade' },
    ...categorias.map((cat) => {
      const count = cat.tipo === 'todos'
        ? ATIVIDADES.length
        : ATIVIDADES.filter((a) => a.tipo === cat.tipo).length;
      const ehAtivo = filtro.tipo === cat.tipo;

      const btn = h(
        'button',
        {
          type: 'button',
          role: 'tab',
          class: `atv-pill-tab ${ehAtivo ? 'ativo' : ''}`,
          'aria-selected': String(ehAtivo),
          onclick: () => {
            filtro.tipo = cat.tipo;
            pillButtons.forEach((b, idx) => {
              const ativo = categorias[idx].tipo === cat.tipo;
              b.classList.toggle('ativo', ativo);
              b.setAttribute('aria-selected', String(ativo));
            });
            atualizar();
          },
        },
        h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, cat.icone),
        h('span', { class: 'atv-pill-label' }, cat.rotulo),
        h('span', { class: 'atv-pill-count' }, String(count)),
      );
      pillButtons.push(btn);
      return btn;
    }),
  );

  // Dropdown de Habilidades BNCC (dentro da gaveta de filtros avançados)
  const selectHabilidade = h(
    'select',
    {
      id: 'select-hab-bncc',
      class: 'atv-select-habilidade',
      'aria-label': 'Filtrar por código de habilidade da BNCC Computação',
      onchange: (e) => {
        filtro.habilidade = e.target.value;
        atualizarBadgeFiltros();
        atualizar();
      },
    },
    h('option', { value: 'todas' }, t('toolbar.todasHabilidades')),
    ...Object.entries(HABILIDADES).map(([codigo, info]) => h(
      'option',
      { value: codigo, selected: filtro.habilidade === codigo ? 'selected' : null },
      `${codigo} (${info.anos}) — ${info.texto.slice(0, 56)}...`,
    )),
  );

  // Botões de Faixa de Ano (dentro da gaveta)
  const botoesFaixa = [];
  const faixaOpcoes = [['todas', t('toolbar.todosAnos')], ...Object.entries(FAIXAS)];
  const trackFaixa = h(
    'div',
    { class: 'atv-chips-faixa', role: 'group', 'aria-label': 'Ano escolar' },
    ...faixaOpcoes.map(([valor, texto]) => {
      const ehAtivo = filtro.faixa === valor;
      const b = h(
        'button',
        {
          type: 'button',
          class: `atv-chip-filtro ${ehAtivo ? 'ativo' : ''}`,
          'aria-pressed': String(ehAtivo),
          onclick: () => {
            filtro.faixa = valor;
            botoesFaixa.forEach((btn, i) => {
              const ativo = faixaOpcoes[i][0] === valor;
              btn.classList.toggle('ativo', ativo);
              btn.setAttribute('aria-pressed', String(ativo));
            });
            atualizarBadgeFiltros();
            atualizar();
          },
        },
        texto,
      );
      botoesFaixa.push(b);
      return b;
    }),
  );

  // Indicador de filtros ativos
  const badgeFiltros = h('span', { class: 'atv-filtros-badge', style: 'display:none;' }, '0');

  function contarFiltrosAvancados() {
    let c = 0;
    if (filtro.faixa !== 'todas') c += 1;
    if (filtro.habilidade !== 'todas') c += 1;
    return c;
  }

  function atualizarBadgeFiltros() {
    const qtd = contarFiltrosAvancados();
    if (qtd > 0) {
      badgeFiltros.textContent = String(qtd);
      badgeFiltros.style.display = 'inline-flex';
      btnToggleGaveta.classList.add('com-filtros');
    } else {
      badgeFiltros.style.display = 'none';
      btnToggleGaveta.classList.remove('com-filtros');
    }
  }

  // Gaveta expansível de filtros
  const gavetaFiltros = h(
    'div',
    { class: 'atv-gaveta-filtros', id: 'gaveta-filtros-avancados', hidden: 'hidden' },
    h(
      'div',
      { class: 'atv-gaveta-grid' },
      h(
        'div',
        { class: 'atv-gaveta-col' },
        h('span', { class: 'atv-gaveta-label' }, t('toolbar.anoEscolar')),
        trackFaixa,
      ),
      h(
        'div',
        { class: 'atv-gaveta-col' },
        h('label', { class: 'atv-gaveta-label', for: 'select-hab-bncc' }, t('toolbar.habilidadeBncc')),
        selectHabilidade,
      ),
      h(
        'div',
        { class: 'atv-gaveta-acoes' },
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-sm btn-neutro flex-inline-icon',
            onclick: () => {
              filtro.faixa = 'todas';
              filtro.habilidade = 'todas';
              selectHabilidade.value = 'todas';
              botoesFaixa.forEach((b, i) => {
                const ativo = faixaOpcoes[i][0] === 'todas';
                b.classList.toggle('ativo', ativo);
                b.setAttribute('aria-pressed', String(ativo));
              });
              atualizarBadgeFiltros();
              atualizar();
            },
          },
          h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'refresh'),
          t('toolbar.limparFiltros'),
        ),
      ),
    ),
  );

  const btnToggleGaveta = h(
    'button',
    {
      type: 'button',
      class: 'atv-btn-filtros-gaveta',
      'aria-expanded': 'false',
      'aria-controls': 'gaveta-filtros-avancados',
      onclick: () => {
        const estaAberto = !gavetaFiltros.hidden;
        gavetaFiltros.hidden = estaAberto;
        btnToggleGaveta.setAttribute('aria-expanded', String(!estaAberto));
        btnToggleGaveta.classList.toggle('aberto', !estaAberto);
        if (!estaAberto && !reduzirMovimento && typeof gsap !== 'undefined') {
          gsap.fromTo(gavetaFiltros, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' });
        }
      },
    },
    h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'tune'),
    h('span', {}, t('toolbar.filtros')),
    badgeFiltros,
  );

  atualizarBadgeFiltros();

  function atualizar(avisar = true) {
    const termo = filtro.busca;
    const visiveis = ATIVIDADES.filter((atividade) => {
      const bateTipo = filtro.tipo === 'todos' || atividade.tipo === filtro.tipo;
      const bateConceito = filtro.conceito === 'todos' || atividade.conceito === filtro.conceito;
      const bateFaixa = filtro.faixa === 'todas' || atividade.faixa === filtro.faixa;
      const bateHab = filtro.habilidade === 'todas' || atividade.habilidades.includes(filtro.habilidade);
      const bateBusca = !termo
        || atividade.titulo.toLowerCase().includes(termo)
        || atividade.resumo.toLowerCase().includes(termo)
        || atividade.habilidades.some((cod) => cod.toLowerCase().includes(termo));
      return bateTipo && bateConceito && bateFaixa && bateHab && bateBusca;
    });

    if (visiveis.length > 0) {
      lista.replaceChildren(...visiveis.map(cartaoDaAtividade));
    } else {
      lista.replaceChildren(
        h(
          'li',
          { class: 'atv-vazio-lista' },
          h(
            'div',
            { class: 'estado-saida-404' },
            h(
              'div',
              { class: 'estado-saida-icone', 'aria-hidden': 'true' },
              h('span', { class: 'material-symbols-outlined icon-lg' }, 'search'),
            ),
            h('h3', {}, t('vazio.titulo')),
            h('p', {}, t('vazio.descricao')),
            h(
              'div',
              { class: 'estado-saida-acoes' },
              h(
                'button',
                {
                  type: 'button',
                  class: 'btn btn-primario',
                  onclick: () => {
                    filtro.busca = '';
                    filtro.tipo = 'todos';
                    filtro.conceito = 'todos';
                    filtro.faixa = 'todas';
                    filtro.habilidade = 'todas';
                    inputBusca.value = '';
                    btnLimparBusca.style.display = 'none';
                    selectHabilidade.value = 'todas';
                    pillButtons.forEach((b, i) => {
                      const ativo = categorias[i].tipo === 'todos';
                      b.classList.toggle('ativo', ativo);
                      b.setAttribute('aria-selected', String(ativo));
                    });
                    botoesFaixa.forEach((b, i) => {
                      const ativo = faixaOpcoes[i][0] === 'todas';
                      b.classList.toggle('ativo', ativo);
                      b.setAttribute('aria-pressed', String(ativo));
                    });
                    atualizarBadgeFiltros();
                    atualizar();
                  },
                },
                t('vazio.mostrarTodas'),
              ),
              h('a', { class: 'btn btn-neutro seta-voltar', href: '/' }, h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'home'), t('vazio.irInicio')),
            ),
          ),
        ),
      );
    }

    if (avisar) {
      anunciar(`${visiveis.length} ${visiveis.length === 1 ? 'atividade encontrada' : 'atividades encontradas'}.`);
      if (!reduzirMovimento && typeof gsap !== 'undefined') {
        gsap.fromTo(
          '.atv-card',
          { opacity: 0, y: 12, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.02, duration: 0.28, ease: 'power2.out' },
        );
      }
    }
  }

  // Montagem na raiz com padrão semântico (evita duplicação com a barra superior de wayfinding)
  const elementosRaiz = [];
  const temWayfindingSuperior = Boolean(document.getElementById('barra-wayfinding-universal') || document.body.classList.contains('modo-app'));
  if (!temWayfindingSuperior) {
    elementosRaiz.push(
      h(
        'nav',
        { class: 'atv-breadcrumbs', 'aria-label': t('wf.voceEstaAqui') },
        h(
          'a',
          { class: 'wf-breadcrumb-mobile-voltar seta-voltar', href: '/cursos.html' },
          h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'arrow_back'),
          t('wf.voltarTrilhas'),
        ),
        h(
          'ol',
          {},
          h('li', {}, h('a', { href: '/' }, t('wf.inicio'))),
          h('li', {}, h('a', { href: '/cursos.html' }, t('wf.pensamentoComputacional'))),
          h('li', { 'aria-current': 'page' }, t('wf.atividadesLab3d')),
        ),
      ),
    );
  }

  elementosRaiz.push(
    // Spotlight Hero CinemaOS
    bannerSpotlight(
      { atividade: atividadeDestaque, tipoDestaque },
      concluidasTotal,
      totalGeral,
    ),
  );

  raiz.replaceChildren(
    ...elementosRaiz,
    // Seção de Descoberta com Barra de Ferramentas CinemaOS
    h(
      'section',
      { class: 'atv-descoberta', id: 'catalogo-atividades', 'aria-label': t('toolbar.secaoAriaLabel') },
      h(
        'div',
        { class: 'atv-toolbar' },
        h(
          'div',
          { class: 'atv-toolbar-busca' },
          h('span', { class: 'material-symbols-outlined atv-busca-icone', 'aria-hidden': 'true' }, 'search'),
          inputBusca,
          btnLimparBusca,
        ),
        pillTrack,
        btnToggleGaveta,
      ),
      gavetaFiltros,
      lista,
    ),
  );

  atualizar(false);

  // Orquestração de entrada fluida com GSAP
  if (!reduzirMovimento && typeof gsap !== 'undefined') {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.from('.atv-spotlight-conteudo > *', {
      opacity: 0,
      y: 16,
      stagger: 0.06,
      duration: 0.45,
    });
    tl.from('.atv-spotlight-preview', {
      opacity: 0,
      scale: 0.94,
      duration: 0.5,
      ease: 'back.out(1.4)',
    }, '-=0.25');
    gsap.to('.atv-preview-card', {
      y: -6,
      duration: 2.6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    tl.from('.atv-toolbar', {
      opacity: 0,
      y: 12,
      duration: 0.35,
    }, '-=0.2');
    tl.from('.atv-card', {
      opacity: 0,
      y: 18,
      stagger: 0.025,
      duration: 0.35,
    }, '-=0.2');
  }
}

/* ---------------------------------------------------------------------------
 * Mapa de Orientação da Trilha (Etapa X de Y + Estados + "Você está aqui")
 * ------------------------------------------------------------------------ */

function mapaOrientacaoDaTrilha(atividadeAtual) {
  const indiceAtual = ATIVIDADES.findIndex((item) => item.id === atividadeAtual.id);
  const etapaNumero = indiceAtual + 1;
  const totalEtapas = ATIVIDADES.length;
  const percentual = Math.round((etapaNumero / totalEtapas) * 100);
  const proxima = indiceAtual < totalEtapas - 1 ? ATIVIDADES[indiceAtual + 1] : null;

  const marcos = ATIVIDADES.map((item, idx) => {
    const concluida = Boolean(progresso[item.id]?.concluida);
    const ehAtual = item.id === atividadeAtual.id;
    let classeEstado = 'estado-nao-iniciado';
    let iconeEstado = 'circle-dashed';
    let rotuloEstado = 'Não iniciado';

    if (concluida) {
      classeEstado = 'estado-concluido';
      iconeEstado = 'check_circle';
      rotuloEstado = 'Concluído';
    } else if (ehAtual) {
      classeEstado = 'estado-em-andamento';
      iconeEstado = 'schedule';
      rotuloEstado = 'Em andamento (Você está aqui)';
    }

    return h(
      'li',
      { class: `trilha-marco-item ${classeEstado}`, 'aria-current': ehAtual ? 'step' : null },
      h(
        'a',
        {
          href: `/atividades.html?id=${encodeURIComponent(item.id)}`,
          title: `Etapa ${idx + 1}: ${item.titulo} (${rotuloEstado})`,
          style: 'text-decoration:none; color:inherit; display:inline-flex; align-items:center; gap:6px;',
        },
        h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, iconeEstado),
        h('span', {}, `${idx + 1}. ${item.titulo.replace('Python 3D: ', '')}`),
      ),
    );
  });

  return h(
    'section',
    { class: 'progresso-etapas-box', 'aria-label': 'Mapa do curso e progresso na trilha de atividades' },
    h(
      'div',
      { class: 'progresso-etapas-topo' },
      h(
        'span',
        { class: 'progresso-etapas-contador' },
        h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'map'),
        `Mapa da Trilha: Etapa ${etapaNumero} de ${totalEtapas}`,
      ),
      proxima
        ? h('span', { class: 'mapa-tag-proximo' }, `O que vem a seguir: ${proxima.titulo}`)
        : h('span', { class: 'mapa-tag-aqui' }, 'Última etapa da trilha!'),
    ),
    h(
      'div',
      {
        class: 'progresso-etapas-barra',
        role: 'progressbar',
        'aria-label': `Etapa ${etapaNumero} de ${totalEtapas}`,
        'aria-valuenow': String(etapaNumero),
        'aria-valuemin': '1',
        'aria-valuemax': String(totalEtapas),
      },
      h('div', { class: 'progresso-etapas-preenchimento', style: `width: ${percentual}%` }),
    ),
    h('ol', { class: 'trilha-marcos', 'aria-label': 'Marcos da trilha de atividades' }, marcos),
  );
}

/* ---------------------------------------------------------------------------
 * Mapa de Habilidades da Atividade e Painel do Professor
 * ------------------------------------------------------------------------ */

function mapaHabilidadesDaAtividade(atividade) {
  return h(
    'section',
    { class: 'atv-mapa-hab-box', 'aria-label': 'Habilidades da BNCC trabalhadas nesta atividade' },
    h('h3', { class: 'atv-mapa-hab-titulo' }, 'Habilidades BNCC Trabalhadas'),
    h(
      'div',
      { class: 'atv-mapa-hab-grid' },
      atividade.habilidades.map((codigo) => {
        const info = HABILIDADES[codigo];
        const dominio = nivelDominioHabilidade(codigo);
        return h(
          'div',
          { class: 'atv-hab-card' },
          h(
            'div',
            { class: 'atv-hab-topo' },
            h('span', { class: 'badge-bncc-codigo' }, codigo),
            h('span', { class: 'atv-hab-anos' }, info.anos),
            h('span', { class: `atv-hab-dominio ${dominio.classe}` }, `${dominio.rotulo} (${dominio.percentual}%)`),
          ),
          h('p', { class: 'atv-hab-texto' }, info.texto),
        );
      }),
    ),
  );
}

function painelDoProfessor(atividade) {
  const { professor } = atividade;
  return h(
    'details',
    { class: 'atv-professor' },
    h('summary', {}, 'Orientações para o professor e versão desplugada'),
    h(
      'div',
      { class: 'atv-professor-corpo' },
      h('h3', {}, 'Objetivo Pedagógico'),
      h('p', {}, professor.objetivo),
      h('h3', {}, 'Habilidades da BNCC Computação'),
      h('dl', {}, atividade.habilidades.flatMap((codigo) => [
        h('dt', {}, `${codigo} · ${HABILIDADES[codigo].anos}`),
        h('dd', {}, HABILIDADES[codigo].texto),
      ])),
      h('p', { class: 'atv-aviso' }, 'Alinhamento pedagógico fundamentado no Complemento à BNCC Computação.'),
      professor.observacao ? h('p', { class: 'atv-aviso' }, professor.observacao) : null,
      h('h3', {}, 'Versão desplugada (sem tela)'),
      h('p', {}, professor.desplugada),
      h('p', { class: 'mt-10' }, h('button', { type: 'button', class: 'btn btn-neutro btn-sm flex-inline-icon', onclick: () => imprimirFichas(atividade) }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'print'), ' Imprimir fichas (A4)')),
      h('h3', {}, 'Para conversar em sala'),
      h('ul', {}, professor.conversa.map((pergunta) => h('li', {}, pergunta))),
    ),
  );
}

function renderAtividade(atividade) {
  const tituloAtividade = t(`atv.${atividade.id}.titulo`, {}, atividade.titulo);
  const instrucaoAtividade = t(`atv.${atividade.id}.instrucao`, {}, atividade.instrucao);
  document.title = `${tituloAtividade} — LMS COMPASSO`;
  const secaoEixo = obterSecaoPorEixo(atividade.eixo);
  const eixoInfo = EIXOS_BNCC[atividade.eixo] || EIXOS_BNCC['pensamento-computacional'];
  const rotuloEixo = t(`eixo.${atividade.eixo}`, {}, eixoInfo.rotulo);
  const rotuloTipo = t(`tipo.${atividade.tipo}`, {}, TIPOS[atividade.tipo].rotulo);
  const rotuloNivel = t(`nivel.${atividade.nivel}`, {}, NIVEIS[atividade.nivel]);
  const rotuloConceito = t(`conceito.${atividade.conceito}`, {}, CONCEITOS[atividade.conceito]?.rotulo || atividade.conceito);
  const rotuloFaixa = t(`faixa.${atividade.faixa}`, {}, atividade.anos);
  document.body.setAttribute('data-secao', secaoEixo);
  salvarUltimaVisitada(atividade.id);

  const indiceAtual = ATIVIDADES.findIndex((item) => item.id === atividade.id);
  const anterior = indiceAtual > 0 ? ATIVIDADES[indiceAtual - 1] : null;
  const proxima = indiceAtual < ATIVIDADES.length - 1 ? ATIVIDADES[indiceAtual + 1] : null;
  const codigoHabPrincipal = atividade.habilidades[0] || 'BNCC';

  const areaConclusao = h('div', { class: 'atv-conclusao' });
  let aulaSincronizada = false;

  async function aoConcluir(dados) {
    progresso = registrarConclusao(progresso, atividade.id, dados);
    salvarProgresso(progresso);
    salvarSubmissaoPythonLocal(atividade, dados);

    const concluidas3d = contarPython3dConcluidas();
    const concluiuTodasPython3d = concluidas3d >= ATIVIDADES_PYTHON_3D.length && ATIVIDADES_PYTHON_3D.length > 0;

    const acoes = [
      proxima
        ? h('a', { class: 'btn btn-primario seta-proximo', href: `/atividades.html?id=${encodeURIComponent(proxima.id)}` }, t('spotlight.proximaAtividade', {}, 'Próxima atividade'), h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_forward'))
        : null,
      atividade.tipo === 'python3d'
        ? h(
            'a',
            {
              class: `btn ${concluiuTodasPython3d ? 'btn-primario' : 'btn-secundario'} flex-inline-icon`,
              href: obterUrlCertificadoPython3d(dados?.parceiroDupla),
              target: '_blank',
              rel: 'noopener',
            },
            h('span', { class: 'material-symbols-outlined icon-xs' }, 'workspace_premium'),
            concluiuTodasPython3d ? t('spotlight.certificado3dEmitir', {}, 'Emitir Certificado Explorador Python 3D') : t('spotlight.certificado3dVisualizar', {}, 'Visualizar Certificado Python 3D'),
          )
        : null,
      h('a', { class: 'btn btn-neutro seta-voltar', href: '/atividades.html' }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_back'), t('spotlight.verTodas', {}, 'Ver todas as atividades')),
    ];

    const avisos = [];
    if (atividade.tipo === 'python3d' && dados?.codigoPython) {
      avisos.push(
        h(
          'p',
          { class: 'atv-feedback sucesso flex-inline-icon' },
          h('span', { class: 'material-symbols-outlined icon-xs' }, 'cloud_done'),
          dados?.parceiroDupla
            ? ` Solução Python em Dupla (com ${dados.parceiroDupla}) salva no portfólio da turma para avaliação docente!`
            : ' Sua solução em código Python foi salva no portfólio da turma para visualização do professor!',
        ),
      );
    }

    if (concluiuTodasPython3d && atividade.tipo === 'python3d') {
      avisos.push(
        h(
          'p',
          { class: 'atv-feedback sucesso flex-inline-icon' },
          h('span', { class: 'material-symbols-outlined icon-xs' }, 'military_tech'),
          ' Insígnia Desbloqueada: Explorador Python 3D (6/6 missões tridimensionais concluídas)!',
        ),
      );
    }

    if (usuario) {
      try {
        await api('/gamificacao/concluir-atividade', {
          method: 'POST',
          body: JSON.stringify({
            atividadeId: atividade.id,
            titulo: atividade.titulo,
            xp: atividade.tipo === 'python3d' ? 35 : 25,
            codigoPython: dados?.codigoPython || '',
            tentativas: dados?.tentativas || 1,
            estrelas: dados?.estrelas || 3,
            parceiroDupla: dados?.parceiroDupla || null,
            papelDupla: dados?.papelDupla || null,
            concluiuTodasPython3d,
          }),
        });
      } catch {
        // Fallback silencioso se o backend estiver offline
      }
    }

    if (usuario?.perfil === 'aluno' && aulaId && !aulaSincronizada) {
      aulaSincronizada = true;
      try {
        await api(`/aulas/${aulaId}/progresso`, { method: 'POST', body: JSON.stringify({ concluida: true }) });
        avisos.push(h('p', { class: 'atv-feedback sucesso flex-inline-icon' }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'check_circle'), ' A aula foi marcada como concluída no seu curso.'));
      } catch (erro) {
        avisos.push(h('p', { class: 'atv-feedback erro' }, `Não foi possível marcar a aula como concluída no curso: ${erro.message}`));
      }
    }
    if (usuario && cursoId) {
      acoes.unshift(h('a', { class: 'btn btn-secundario seta-voltar', href: `/curso-detalhe.html?id=${cursoId}` }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_back'), 'Voltar ao curso'));
    }

    areaConclusao.replaceChildren(...avisos, h('div', { class: 'atv-acoes' }, acoes));
  }

  const jogador = criarJogador(atividade, { aoConcluir, reduzirMovimento });

  raiz.replaceChildren(
    h(
      'div',
      { class: 'atv-topo-navegacao' },
      h(
        'nav',
        { class: 'atv-breadcrumbs', 'aria-label': t('wf.voceEstaAqui', {}, 'Você está aqui') /* 'aria-label': 'Você está aqui' */ },
        h(
          'a',
          { class: 'wf-breadcrumb-mobile-voltar seta-voltar', href: '/atividades.html' },
          h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'arrow_back'),
          t('wf.voltarTrilhas', {}, 'Voltar para Trilhas'),
        ),
        h(
          'ol',
          {},
          h('li', {}, h('a', { href: '/' }, t('wf.inicio', {}, 'Início'))),
          h('li', {}, h('a', { href: '/atividades.html' }, rotuloEixo)),
          h('li', {}, h('a', { href: `/atividades.html?hab=${encodeURIComponent(codigoHabPrincipal)}` }, codigoHabPrincipal)),
          h('li', { 'aria-current': 'page' }, tituloAtividade),
        ),
      ),
      h(
        'div',
        { class: 'atv-nav-sequencial' },
        anterior
          ? h('a', { class: 'btn btn-neutro btn-sm seta-voltar', href: `/atividades.html?id=${encodeURIComponent(anterior.id)}`, title: `${t('nav.voltar', {}, 'Voltar')}: ${t(`atv.${anterior.id}.titulo`, {}, anterior.titulo)}` }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_back'), t('nav.voltar', {}, 'Voltar'))
          : null,
        proxima
          ? h('a', { class: 'btn btn-neutro btn-sm seta-proximo', href: `/atividades.html?id=${encodeURIComponent(proxima.id)}`, title: `${t('nav.proximo', {}, 'Próximo')}: ${t(`atv.${proxima.id}.titulo`, {}, proxima.titulo)}` }, t('nav.proximo', {}, 'Próximo'), h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_forward'))
          : null,
      ),
    ),
    mapaOrientacaoDaTrilha(atividade),
    h(
      'ul',
      { class: 'atv-chips' },
      h(
        'li',
        { class: 'atv-chip atv-chip-eixo', title: `Eixo Estruturante BNCC: ${rotuloEixo}` },
        h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, eixoInfo.icone || 'psychology'),
        rotuloEixo,
      ),
      h('li', { class: 'atv-chip' }, rotuloConceito),
      h('li', { class: 'atv-chip' }, rotuloTipo),
      h('li', { class: 'atv-chip' }, rotuloFaixa),
      h('li', { class: 'atv-chip' }, rotuloNivel),
      h('li', { class: 'atv-chip' }, `${atividade.duracaoMin} ${t('card.min', {}, 'min')}`),
      ...atividade.habilidades.map((hab) => h('li', { class: 'atv-chip' }, hab)),
    ),
    h(TituloPagina, { class: 'atv-titulo-pagina' }, tituloAtividade),
    h('p', { class: 'atv-instrucao' }, instrucaoAtividade),
    jogador,
    areaConclusao,
    mapaHabilidadesDaAtividade(atividade),
    painelDoProfessor(atividade),
  );
}

function renderNaoEncontrada() {
  document.title = `${t('erro404.titulo', {}, 'Atividade não encontrada (404)')} — LMS COMPASSO`;
  document.body.setAttribute('data-secao', 'pensamento');

  const inputBusca404 = h('input', {
    type: 'search',
    name: 'q',
    placeholder: t('toolbar.buscaPlaceholder'),
    'aria-label': t('toolbar.buscaAriaLabel'),
  });

  raiz.replaceChildren(
    h(
      'nav',
      { class: 'atv-breadcrumbs', 'aria-label': t('wf.voceEstaAqui') },
      h(
        'a',
        { class: 'wf-breadcrumb-mobile-voltar seta-voltar', href: '/atividades.html' },
        h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'arrow_back'),
        t('wf.voltarTrilhas'),
      ),
      h(
        'ol',
        {},
        h('li', {}, h('a', { href: '/' }, t('wf.inicio'))),
        h('li', {}, h('a', { href: '/atividades.html' }, t('nav.atividades'))),
        h('li', { 'aria-current': 'page' }, t('erro404.subtitulo', {}, 'Página não encontrada (404)')),
      ),
    ),
    h(
      'section',
      { class: 'estado-saida-404', 'aria-labelledby': 'titulo-erro-404' },
      h(
        'div',
        { class: 'estado-saida-icone', 'aria-hidden': 'true' },
        h('span', { class: 'material-symbols-outlined icon-lg' }, 'explore'),
      ),
      h(TituloPagina, { id: 'titulo-erro-404' }, t('erro404.titulo', {}, 'Atividade não encontrada (Erro 404)')),
      h('p', {}, t('erro404.descricao', {}, 'Não encontramos a atividade solicitada. Ela pode ter mudado de endereço ou o código informado não existe. Use a busca abaixo ou volte para o início.')),
      h(
        'form',
        {
          class: 'estado-saida-busca',
          onsubmit: (e) => {
            e.preventDefault();
            const q = inputBusca404.value.trim();
            window.location.href = q ? `/atividades.html?busca=${encodeURIComponent(q)}` : '/atividades.html';
          },
        },
        inputBusca404,
        h('button', { type: 'submit', class: 'btn btn-primario flex-inline-icon' }, h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'search'), t('nav.buscar', {}, 'Buscar')),
      ),
      h(
        'div',
        { class: 'estado-saida-acoes' },
        h('a', { class: 'btn btn-primario flex-inline-icon', href: '/' }, h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'home'), t('vazio.irInicio', {}, 'Ir para o início')),
        h('a', { class: 'btn btn-neutro seta-voltar', href: '/atividades.html' }, h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'arrow_back'), t('wf.voltarTrilhas', {}, 'Voltar para Trilhas de Atividades')),
      ),
    ),
  );
}

/* ---------------------------------------------------------------------------
 * Início
 * ------------------------------------------------------------------------ */

document.body.classList.add(usuario ? 'modo-app' : 'modo-publico');
if (usuario) {
  montarLayout('atividades');
  document.getElementById('titulo-pagina').textContent = 'Atividades & Laboratório 3D';
}

const idPedido = parametros.get('id');
const atividadePedida = idPedido ? buscarAtividade(idPedido) : null;

if (idPedido && !atividadePedida) renderNaoEncontrada();
else if (atividadePedida) renderAtividade(atividadePedida);
else renderCatalogo();

// Reatividade ao trocar de idioma no menu universal (WCAG 3.1.2)
window.addEventListener('idiomaAlterado', () => {
  const currentParams = new URLSearchParams(window.location.search);
  const currentId = currentParams.get('id');
  if (currentId) {
    const atv = buscarAtividade(currentId);
    if (atv) renderAtividade(atv);
  } else {
    renderCatalogo();
  }
});

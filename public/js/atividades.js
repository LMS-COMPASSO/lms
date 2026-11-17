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
import {
  t,
  pluralT,
  habTexto,
  habAnos,
  atvTitulo,
  atvResumo,
  atvInstrucao,
  atvProfessor,
  tituloCurtoPy3d,
} from './atividades/traducao.js';
import {
  movimentoReduzidoAtivo,
  animarFlip,
  animarRevelacaoScroll,
  executarComMatchMedia,
} from '/js/animacoes-gsap.js';

const raiz = document.getElementById('atividades-raiz');
const parametros = new URLSearchParams(window.location.search);
const usuario = obterToken() ? obterUsuario() : null;
const aulaId = Number(parametros.get('aula')) || null;
const cursoId = Number(parametros.get('curso')) || null;
const chaveProgresso = `lms_atividades_progresso:${usuario ? usuario.id : 'visitante'}`;
const chaveUltimaAtividade = `lms_ultima_atividade:${usuario ? usuario.id : 'visitante'}`;
const reduzirMovimento = movimentoReduzidoAtivo();

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
      aluno_nome: usuario?.nome || t('atvPage.visitante', {}, 'Estudante Visitante'),
      aluno_email: usuario?.email || 'visitante@escola.edu.br',
      atividade_id: atividade.id,
      atividade_titulo: atvTitulo(atividade),
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

async function abrirCertificadoPython3d(evento, parceiroDupla = null) {
  const token = typeof obterToken === 'function' ? obterToken() : null;
  if (!token) return;
  evento.preventDefault();
  const url = obterUrlCertificadoPython3d(parceiroDupla);
  try {
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!resp.ok) throw new Error(t('atvPage.erroCertificado'));
    const html = await resp.text();
    const blobUrl = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    window.open(blobUrl, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  } catch {
    window.open(url, '_blank', 'noopener');
  }
}

/**
 * Calcula o nível de domínio de uma habilidade BNCC com base nas atividades concluídas.
 */
function nivelDominioHabilidade(codigo) {
  const relacionadas = ATIVIDADES.filter((a) => a.habilidades.includes(codigo));
  if (relacionadas.length === 0) return { rotulo: t('hab.dominio.disponivel'), classe: 'dominio-disponivel', percentual: 0 };
  const concluidas = relacionadas.filter((a) => progresso[a.id]?.concluida).length;
  const percentual = Math.round((concluidas / relacionadas.length) * 100);
  if (percentual === 100) return { rotulo: t('hab.dominio.consolidada'), classe: 'dominio-consolidada', percentual };
  if (percentual > 0) return { rotulo: t('hab.dominio.progresso'), classe: 'dominio-progresso', percentual };
  return { rotulo: t('hab.dominio.naoIniciada'), classe: 'dominio-disponivel', percentual: 0 };
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
      h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'radio_button_unchecked'),
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
      h(TituloCartao, {}, atvTitulo(atividade)),
      h('p', {}, atvResumo(atividade)),
      h(
        'ul',
        { class: 'atv-meta', 'aria-label': t('atvPage.metaCardsAria') },
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
          h('span', { class: 'somente-leitor' }, `: ${atvTitulo(atividade)}`),
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
      h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'radio_button_unchecked'),
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
        h(TituloPagina, { class: 'atv-spotlight-titulo' }, atvTitulo(atividade)),
        h('p', { class: 'atv-spotlight-resumo' }, atvResumo(atividade)),
        h(
          'ul',
          { class: 'atv-spotlight-meta', 'aria-label': t('spotlight.metaAriaLabel') },
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
              onclick: (e) => abrirCertificadoPython3d(e),
            },
            h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'workspace_premium'),
            t('spotlight.certificado3d', { concluidas: concluidas3d, total: total3d }),
          ),
          h(
            'a',
            {
              class: 'btn-spotlight-ghost',
              href: '/workspace.html',
              title: t('spotlight.workspaceTitle'),
            },
            h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'lightbulb'),
            t('spotlight.meuWorkspace'),
          ),
        ),
        h(
          'div',
          { class: 'atv-spotlight-progresso-card', role: 'region', 'aria-label': t('spotlight.progressoAriaLabel') },
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
              'aria-label': t('spotlight.progressoValorAria', { percentual: percentualTotal }),
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
            h('strong', {}, atvTitulo(atividade)),
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

function escolherAtividadeDestaqueCatalogo(ultimaId) {
  if (ultimaId) {
    const retomada = buscarAtividade(ultimaId);
    if (retomada && !progresso[retomada.id]?.concluida) {
      return { atividade: retomada, tipo: 'retomar' };
    }
  }
  const pendente = ATIVIDADES.find((a) => !progresso[a.id]?.concluida);
  if (pendente) {
    return { atividade: pendente, tipo: 'recomendada' };
  }
  const primeira3d = ATIVIDADES.find((a) => a.id === 'python3d-sequencia-labirinto') || ATIVIDADES[0];
  return { atividade: primeira3d, tipo: 'concluida' };
}

function atividadeCorrespondeFiltro(atividade, filtro) {
  if (filtro.tipo !== 'todos' && atividade.tipo !== filtro.tipo) return false;
  if (filtro.conceito !== 'todos' && atividade.conceito !== filtro.conceito) return false;
  if (filtro.faixa !== 'todas' && atividade.faixa !== filtro.faixa) return false;
  if (filtro.habilidade !== 'todas' && !atividade.habilidades.includes(filtro.habilidade)) return false;

  const termo = filtro.busca;
  if (!termo) return true;
  const campos = [
    atvTitulo(atividade),
    atvResumo(atividade),
    atividade.titulo,
    atividade.resumo,
    ...(atividade.habilidades || []),
  ];
  return campos.some((c) => String(c || '').toLowerCase().includes(termo));
}

function construirBreadcrumbsCatalogo() {
  return h(
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
  );
}

function animarEntradaCatalogo() {
  executarComMatchMedia(
    ({ gsap }) => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.from('.atv-spotlight-conteudo > *', {
        opacity: 0,
        y: 12,
        stagger: 0.02,
        duration: 0.2,
        clearProps: 'transform,opacity',
      }, 0);
      tl.from('.atv-spotlight-preview', {
        opacity: 0,
        scale: 0.96,
        duration: 0.22,
        ease: 'back.out(1.3)',
        clearProps: 'transform,opacity',
      }, 0);
      gsap.to('.atv-preview-card', {
        y: -6,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      tl.from('.atv-toolbar', {
        opacity: 0,
        y: 10,
        duration: 0.2,
        clearProps: 'transform,opacity',
      }, 0);
    },
    ({ gsap }) => {
      gsap.set('.atv-spotlight-conteudo > *, .atv-spotlight-preview, .atv-toolbar', {
        opacity: 1,
        y: 0,
        scale: 1,
        clearProps: 'transform,opacity',
      });
    },
  );
  animarRevelacaoScroll('.atv-card', { grupoPorPai: true, stagger: 0.03, y: 12 });
}

function criarGrupoPillsModalidades(categorias, filtro, atualizar) {
  const pillButtons = [];
  const pillTrack = h(
    'div',
    { class: 'atv-pills-modalidades', role: 'tablist', 'aria-label': t('toolbar.modalidadesAria') },
    ...categorias.map((cat) => {
      const count = cat.tipo === 'todos' ? ATIVIDADES.length : ATIVIDADES.filter((a) => a.tipo === cat.tipo).length;
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
  return { pillButtons, pillTrack };
}

function criarGrupoFaixaAno(filtro, aoAlterarFiltro) {
  const botoesFaixa = [];
  const faixaOpcoes = [
    ['todas', t('toolbar.todosAnos')],
    ...Object.entries(FAIXAS).map(([valor, rotulo]) => [valor, t(`faixa.${valor}`, {}, rotulo)]),
  ];
  const trackFaixa = h(
    'div',
    { class: 'atv-chips-faixa', role: 'group', 'aria-label': t('toolbar.anoAria') },
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
            aoAlterarFiltro();
          },
        },
        texto,
      );
      botoesFaixa.push(b);
      return b;
    }),
  );
  return { botoesFaixa, faixaOpcoes, trackFaixa };
}

function criarInputBuscaCatalogo(filtro, aoAtualizarBusca) {
  const inputBusca = h('input', {
    type: 'search',
    class: 'atv-input-busca',
    value: filtro.busca,
    placeholder: t('toolbar.buscaPlaceholder'),
    'aria-label': t('toolbar.buscaAriaLabel'),
    oninput: (e) => {
      filtro.busca = e.target.value.trim().toLowerCase();
      btnLimparBusca.style.display = filtro.busca ? 'inline-flex' : 'none';
      aoAtualizarBusca();
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
        aoAtualizarBusca();
        inputBusca.focus();
      },
    },
    h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'close'),
  );
  return { inputBusca, btnLimparBusca };
}

function renderCatalogo() {
  document.title = t('atvPage.catalogoMetaTitulo');
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
  const { atividade: atividadeDestaque, tipo: tipoDestaque } = escolherAtividadeDestaqueCatalogo(lerUltimaVisitada());
  const lista = h('ul', { class: 'atv-grade', id: 'lista-atividades' });

  const { inputBusca, btnLimparBusca } = criarInputBuscaCatalogo(filtro, () => atualizar());

  const categorias = [
    { tipo: 'todos', rotulo: t('toolbar.todas'), icone: 'apps' },
    { tipo: 'python3d', rotulo: t('toolbar.python3d'), icone: 'deployed_code' },
    { tipo: 'ordenar', rotulo: t('toolbar.algoritmos'), icone: 'format_list_numbered' },
    { tipo: 'decompor', rotulo: t('toolbar.decomposicao'), icone: 'extension' },
    { tipo: 'robo', rotulo: t('toolbar.robo'), icone: 'smart_toy' },
    { tipo: 'blocos', rotulo: t('toolbar.blocos'), icone: 'widgets' },
  ].filter((cat) => cat.tipo === 'todos' || ATIVIDADES.some((a) => a.tipo === cat.tipo));

  const { pillButtons, pillTrack } = criarGrupoPillsModalidades(categorias, filtro, () => atualizar());

  const selectHabilidade = h(
    'select',
    {
      id: 'select-hab-bncc',
      class: 'atv-select-habilidade',
      'aria-label': t('toolbar.habSelectAria'),
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
      `${codigo} (${habAnos(codigo, info.anos)}) — ${habTexto(codigo, info.texto).slice(0, 56)}...`,
    )),
  );

  const { botoesFaixa, faixaOpcoes, trackFaixa } = criarGrupoFaixaAno(filtro, () => {
    atualizarBadgeFiltros();
    atualizar();
  });

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

  function resetarFiltrosCatalogo() {
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
  }

  function atualizar(avisar = true) {
    const visiveis = ATIVIDADES.filter((atividade) => atividadeCorrespondeFiltro(atividade, filtro));

    if (visiveis.length > 0) {
      const preencher = () => lista.replaceChildren(...visiveis.map(cartaoDaAtividade));
      if (avisar) {
        animarFlip(() => lista.querySelectorAll('.atv-card'), preencher, { duration: 0.28, stagger: 0.015 });
      } else {
        preencher();
      }
    } else {
      lista.replaceChildren(
        h(
          'li',
          { class: 'atv-vazio-lista' },
          h(
            'div',
            { class: 'estado-saida-404' },
            h('div', { class: 'estado-saida-icone', 'aria-hidden': 'true' }, h('span', { class: 'material-symbols-outlined icon-lg' }, 'search')),
            h('h3', {}, t('vazio.titulo')),
            h('p', {}, t('vazio.descricao')),
            h(
              'div',
              { class: 'estado-saida-acoes' },
              h('button', { type: 'button', class: 'btn btn-primario', onclick: resetarFiltrosCatalogo }, t('vazio.mostrarTodas')),
              h('a', { class: 'btn btn-neutro seta-voltar', href: '/' }, h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'home'), t('vazio.irInicio')),
            ),
          ),
        ),
      );
    }

    if (avisar) {
      anunciar(pluralT(visiveis.length, 'atvPage.encontradaSing', 'atvPage.encontradaPlur'));
    }
  }

  const elementosRaiz = [];
  const temWayfindingSuperior = Boolean(document.getElementById('barra-wayfinding-universal') || document.body.classList.contains('modo-app'));
  if (!temWayfindingSuperior) {
    elementosRaiz.push(construirBreadcrumbsCatalogo());
  }

  elementosRaiz.push(bannerSpotlight({ atividade: atividadeDestaque, tipoDestaque }, concluidasTotal, totalGeral));

  raiz.replaceChildren(
    ...elementosRaiz,
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
  animarEntradaCatalogo();
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
    let iconeEstado = 'radio_button_unchecked';
    let rotuloEstado = t('card.naoIniciado');

    if (concluida) {
      classeEstado = 'estado-concluido';
      iconeEstado = 'check_circle';
      rotuloEstado = t('card.concluido');
    } else if (ehAtual) {
      classeEstado = 'estado-em-andamento';
      iconeEstado = 'schedule';
      rotuloEstado = t('trilha.estadoAqui');
    }

    return h(
      'li',
      { class: `trilha-marco-item ${classeEstado}`, 'aria-current': ehAtual ? 'step' : null },
      h(
        'a',
        {
          href: `/atividades.html?id=${encodeURIComponent(item.id)}`,
          title: t('trilha.marcoTitle', { etapa: idx + 1, titulo: atvTitulo(item), estado: rotuloEstado }),
          style: 'text-decoration:none; color:inherit; display:inline-flex; align-items:center; gap:6px;',
        },
        h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, iconeEstado),
        h('span', {}, `${idx + 1}. ${tituloCurtoPy3d(item)}`),
      ),
    );
  });

  return h(
    'section',
    { class: 'progresso-etapas-box', 'aria-label': t('trilha.secaoAria') },
    h(
      'div',
      { class: 'progresso-etapas-topo' },
      h(
        'span',
        { class: 'progresso-etapas-contador' },
        h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'map'),
        t('trilha.contador', { etapa: etapaNumero, total: totalEtapas }),
      ),
      proxima
        ? h('span', { class: 'mapa-tag-proximo' }, t('trilha.proximo', { titulo: atvTitulo(proxima) }))
        : h('span', { class: 'mapa-tag-aqui' }, t('trilha.ultima')),
    ),
    h(
      'div',
      {
        class: 'progresso-etapas-barra',
        role: 'progressbar',
        'aria-label': t('trilha.etapaBarraAria', { etapa: etapaNumero, total: totalEtapas }),
        'aria-valuenow': String(etapaNumero),
        'aria-valuemin': '1',
        'aria-valuemax': String(totalEtapas),
      },
      h('div', { class: 'progresso-etapas-preenchimento', style: `width: ${percentual}%` }),
    ),
    h('ol', { class: 'trilha-marcos', 'aria-label': t('trilha.marcosAria') }, marcos),
  );
}

/* ---------------------------------------------------------------------------
 * Mapa de Habilidades da Atividade e Painel do Professor
 * ------------------------------------------------------------------------ */

function mapaHabilidadesDaAtividade(atividade) {
  return h(
    'section',
    { class: 'atv-mapa-hab-box', 'aria-label': t('hab.secaoAria') },
    h('h3', { class: 'atv-mapa-hab-titulo' }, t('hab.secaoTitulo')),
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
            h('span', { class: 'atv-hab-anos' }, habAnos(codigo, info.anos)),
            h('span', { class: `atv-hab-dominio ${dominio.classe}` }, `${dominio.rotulo} (${dominio.percentual}%)`),
          ),
          h('p', { class: 'atv-hab-texto' }, habTexto(codigo, info.texto)),
        );
      }),
    ),
  );
}

function painelDoProfessor(atividade) {
  const prof = atvProfessor(atividade);
  return h(
    'details',
    { class: 'atv-professor' },
    h('summary', {}, t('prof.summary')),
    h(
      'div',
      { class: 'atv-professor-corpo' },
      h('h3', {}, t('prof.objetivoTitulo')),
      h('p', {}, prof.objetivo),
      h('h3', {}, t('prof.habilidadesTitulo')),
      h('dl', {}, atividade.habilidades.flatMap((codigo) => [
        h('dt', {}, `${codigo} · ${habAnos(codigo, HABILIDADES[codigo].anos)}`),
        h('dd', {}, habTexto(codigo, HABILIDADES[codigo].texto)),
      ])),
      h('p', { class: 'atv-aviso' }, t('prof.alinhamento')),
      prof.observacao ? h('p', { class: 'atv-aviso' }, prof.observacao) : null,
      h('h3', {}, t('prof.desplugadaTitulo')),
      h('p', {}, prof.desplugada),
      h('p', { class: 'mt-10' }, h('button', { type: 'button', class: 'btn btn-neutro btn-sm flex-inline-icon', onclick: () => imprimirFichas(atividade) }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'print'), ` ${t('prof.imprimirFichas')}`)),
      h('h3', {}, t('prof.conversaTitulo')),
      h('ul', {}, prof.conversa.map((pergunta) => h('li', {}, pergunta))),
    ),
  );
}

function criarBotaoCertificado3dConclusao(concluiuTodas, parceiroDupla) {
  const classeCert = concluiuTodas ? 'btn-primario' : 'btn-secundario';
  const labelCert = concluiuTodas
    ? t('spotlight.certificado3dEmitir', {}, 'Emitir Certificado Explorador Python 3D')
    : t('spotlight.certificado3dVisualizar', {}, 'Visualizar Certificado Python 3D');
  return h(
    'a',
    {
      class: `btn ${classeCert} flex-inline-icon`,
      href: obterUrlCertificadoPython3d(parceiroDupla),
      target: '_blank',
      rel: 'noopener',
      onclick: (e) => abrirCertificadoPython3d(e, parceiroDupla),
    },
    h('span', { class: 'material-symbols-outlined icon-xs' }, 'workspace_premium'),
    labelCert,
  );
}

function montarAvisosConclusao(atividade, dados, concluiuTodasPython3d) {
  const avisos = [];
  if (atividade.tipo === 'python3d' && dados?.codigoPython) {
    avisos.push(
      h(
        'p',
        { class: 'atv-feedback sucesso flex-inline-icon' },
        h('span', { class: 'material-symbols-outlined icon-xs' }, 'cloud_done'),
        dados?.parceiroDupla
          ? ` ${t('atvPage.pythonDuplaSalva', { parceiro: dados.parceiroDupla })}`
          : ` ${t('atvPage.pythonSoloSalva')}`,
      ),
    );
  }
  if (concluiuTodasPython3d && atividade.tipo === 'python3d') {
    avisos.push(
      h(
        'p',
        { class: 'atv-feedback sucesso flex-inline-icon' },
        h('span', { class: 'material-symbols-outlined icon-xs' }, 'military_tech'),
        ` ${t('atvPage.insigniaPy3d', { total: ATIVIDADES_PYTHON_3D.length })}`,
      ),
    );
  }
  return avisos;
}

async function sincronizarGamificacaoConclusaoRemota(atividade, dados) {
  if (!usuario) return;
  try {
    const pontuacaoEstrelas = dados?.estrelas ? Math.min(10, 4 + Number(dados.estrelas) * 2) : 10.0;
    await api('/gamificacao/concluir-atividade', {
      method: 'POST',
      body: JSON.stringify({
        atividadeId: atividade.id,
        habilidades: Array.isArray(atividade.habilidades) ? atividade.habilidades : [],
        pontuacao: pontuacaoEstrelas,
        cursoId: cursoId || undefined,
        titulo: atividade.titulo,
        xp: atividade.tipo === 'python3d' ? 35 : 25,
        codigoPython: dados?.codigoPython || '',
        tentativas: dados?.tentativas || 1,
        estrelas: dados?.estrelas || 3,
        parceiroDupla: dados?.parceiroDupla || null,
        papelDupla: dados?.papelDupla || null,
      }),
    });
  } catch (erroGamificacao) {
    console.warn('Gamificação mantida em armazenamento local:', erroGamificacao?.message || erroGamificacao);
  }
}

async function sincronizarConclusaoAulaVinculada(avisos) {
  try {
    await api(`/aulas/${aulaId}/progresso`, { method: 'POST', body: JSON.stringify({ concluida: true }) });
    avisos.push(h('p', { class: 'atv-feedback sucesso flex-inline-icon' }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'check_circle'), ` ${t('atvPage.aulaConcluida')}`));
  } catch (erro) {
    avisos.push(h('p', { class: 'atv-feedback erro' }, t('atvPage.aulaConcluidaErro', { msg: erro.message })));
  }
}

function construirNavegacaoAtividade(atividade, anterior, proxima, rotuloEixo, codigoHabPrincipal, tituloAtividade) {
  return h(
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
  );
}

function renderAtividade(atividade) {
  const tituloAtividade = atvTitulo(atividade);
  const instrucaoAtividade = atvInstrucao(atividade);
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
    const btnCertificado3d = atividade.tipo === 'python3d'
      ? criarBotaoCertificado3dConclusao(concluiuTodasPython3d, dados?.parceiroDupla)
      : null;

    const acoes = [
      proxima
        ? h('a', { class: 'btn btn-primario seta-proximo', href: `/atividades.html?id=${encodeURIComponent(proxima.id)}` }, t('spotlight.proximaAtividade', {}, 'Próxima atividade'), h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_forward'))
        : null,
      btnCertificado3d,
      h('a', { class: 'btn btn-neutro seta-voltar', href: '/atividades.html' }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_back'), t('spotlight.verTodas', {}, 'Ver todas as atividades')),
    ];

    const avisos = montarAvisosConclusao(atividade, dados, concluiuTodasPython3d);
    await sincronizarGamificacaoConclusaoRemota(atividade, dados);

    if (usuario?.perfil === 'aluno' && aulaId && !aulaSincronizada) {
      aulaSincronizada = true;
      await sincronizarConclusaoAulaVinculada(avisos);
    }
    if (usuario && cursoId) {
      acoes.unshift(h('a', { class: 'btn btn-secundario seta-voltar', href: `/curso-detalhe.html?id=${cursoId}` }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_back'), t('atvPage.voltarCurso')));
    }

    areaConclusao.replaceChildren(...avisos, h('div', { class: 'atv-acoes' }, acoes));
  }

  const jogador = criarJogador(atividade, { aoConcluir, reduzirMovimento, TituloPainel: usuario ? 'h4' : 'h3' });

  raiz.replaceChildren(
    construirNavegacaoAtividade(atividade, anterior, proxima, rotuloEixo, codigoHabPrincipal, tituloAtividade),
    mapaOrientacaoDaTrilha(atividade),
    h(
      'ul',
      { class: 'atv-chips' },
      h(
        'li',
        { class: 'atv-chip atv-chip-eixo', title: `${t('eixoBnccLabel', {}, 'Eixo Estruturante BNCC')}: ${rotuloEixo}` },
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

function atualizarTituloTopbar() {
  const el = document.getElementById('titulo-pagina');
  if (el) el.textContent = t('atvPage.topbarTitulo', {}, 'Atividades & Laboratório 3D');
}

function renderizarPorRota() {
  const currentParams = new URLSearchParams(window.location.search);
  const idPedido = currentParams.get('id');
  const atividadePedida = idPedido ? buscarAtividade(idPedido) : null;

  if (idPedido && !atividadePedida) renderNaoEncontrada();
  else if (atividadePedida) renderAtividade(atividadePedida);
  else renderCatalogo();
}

document.body.classList.add(usuario ? 'modo-app' : 'modo-publico');
if (usuario) {
  montarLayout('atividades');
  atualizarTituloTopbar();
}

renderizarPorRota();

// Reatividade ao trocar de idioma no seletor global (WCAG 3.1.2)
window.addEventListener('lms:idioma-alterado', () => {
  atualizarTituloTopbar();
  renderizarPorRota();
});
window.addEventListener('lms:layout-atualizado', atualizarTituloTopbar);

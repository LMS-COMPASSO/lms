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
      'Concluído',
    );
  } else if (emAndamento) {
    estadoBadge = h(
      'span',
      { class: 'estado-progresso-pill estado-em-andamento' },
      h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'schedule'),
      'Em andamento',
    );
  } else {
    estadoBadge = h(
      'span',
      { class: 'estado-progresso-pill estado-nao-iniciado' },
      h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'circle-dashed'),
      'Não iniciado',
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
          h('span', { class: 'secao-pista-badge', 'data-secao': secaoEixo }, eixoInfo.rotulo),
          estadoBadge,
        ),
      ),
      h(TituloCartao, {}, atividade.titulo),
      h('p', {}, atividade.resumo),
      h(
        'ul',
        { class: 'atv-meta', 'aria-label': 'Metadados e habilidades BNCC' },
        [
          TIPOS[atividade.tipo].rotulo,
          atividade.anos,
          NIVEIS[atividade.nivel],
          `${atividade.duracaoMin} min`,
          ...atividade.habilidades,
        ].map((rotulo) => h('li', { class: HABILIDADES[rotulo] ? 'atv-meta-bncc' : '' }, rotulo)),
      ),
      h(
        'div',
        { class: 'atv-card-acao' },
        h(
          'a',
          { class: `btn ${concluida ? 'btn-neutro' : 'btn-primario'} seta-proximo`, href: `/atividades.html?id=${encodeURIComponent(atividade.id)}` },
          concluida ? 'Jogar de novo' : 'Começar',
          h('span', { class: 'somente-leitor' }, `: ${atividade.titulo}`),
          h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'arrow_forward'),
        ),
      ),
    ),
  );
}

function grupoDeFiltro(rotulo, opcoes, valorAtual, aoEscolher) {
  const botoes = opcoes.map(([valor, texto]) => h(
    'button',
    {
      type: 'button',
      class: 'atv-filtro',
      'aria-pressed': String(valor === valorAtual),
      onclick: () => {
        aoEscolher(valor);
        botoes.forEach((botao, indice) => botao.setAttribute('aria-pressed', String(opcoes[indice][0] === valor)));
      },
    },
    texto,
  ));
  return h('div', { class: 'atv-filtro-grupo', role: 'group', 'aria-label': rotulo }, h('span', { class: 'atv-filtro-rotulo' }, `${rotulo}:`), botoes);
}

function bannerRetomar() {
  const ultimaId = lerUltimaVisitada();
  const atv = ultimaId ? buscarAtividade(ultimaId) : null;
  if (!atv) return null;
  return h(
    'div',
    { class: 'atv-retomar-card', role: 'region', 'aria-label': 'Retomar atividade recente' },
    h(
      'div',
      { class: 'atv-retomar-info' },
      h('span', { class: 'atv-retomar-kicker' }, 'Continuar de onde parou'),
      h('strong', {}, atv.titulo),
      h('span', { class: 'atv-retomar-meta' }, `${TIPOS[atv.tipo].rotulo} · ${atv.anos} · Habilidades: ${atv.habilidades.join(', ')}`),
    ),
    h(
      'a',
      { class: 'btn btn-primario seta-proximo', href: `/atividades.html?id=${encodeURIComponent(atv.id)}` },
      h('span', { class: 'material-symbols-outlined icon-sm', 'aria-hidden': 'true' }, 'play_circle'),
      'Retomar atividade',
      h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'arrow_forward'),
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

  const lista = h('ul', { class: 'atv-grade' });
  const barra = h('div', { class: 'progress-bar' }, h('div', { class: 'progress-bar-fill' }));
  const textoProgresso = h('strong');

  const inputBusca = h('input', {
    type: 'search',
    class: 'atv-input-busca',
    value: filtro.busca,
    placeholder: 'Buscar por título, tema ou código BNCC (ex.: EF69CO03, Python, Hanói)...',
    'aria-label': 'Buscar atividades por nome ou código de habilidade BNCC',
    oninput: (e) => {
      filtro.busca = e.target.value.trim().toLowerCase();
      atualizar();
    },
  });

  const selectHabilidade = h(
    'select',
    {
      class: 'atv-select-habilidade',
      'aria-label': 'Filtrar por código de habilidade da BNCC Computação',
      onchange: (e) => {
        filtro.habilidade = e.target.value;
        atualizar();
      },
    },
    h('option', { value: 'todas' }, 'Todas as habilidades BNCC'),
    ...Object.entries(HABILIDADES).map(([codigo, info]) => h(
      'option',
      { value: codigo, selected: filtro.habilidade === codigo ? 'selected' : null },
      `${codigo} (${info.anos}) — ${info.texto.slice(0, 58)}...`,
    )),
  );

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
            h('h3', {}, 'Nenhuma atividade encontrada para esse filtro'),
            h('p', {}, 'Tente limpar os filtros ativos ou voltar para a página inicial da plataforma.'),
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
                    selectHabilidade.value = 'todas';
                    atualizar();
                  },
                },
                'Mostrar todas as atividades',
              ),
              h('a', { class: 'btn btn-neutro seta-voltar', href: '/' }, h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'home'), 'Ir para o início'),
            ),
          ),
        ),
      );
    }

    if (avisar) anunciar(`${visiveis.length} ${visiveis.length === 1 ? 'atividade encontrada' : 'atividades encontradas'}.`);

    const concluidas = contarConcluidas(progresso, ATIVIDADES);
    textoProgresso.textContent = `Etapa ${concluidas} de ${ATIVIDADES.length} atividades concluídas (${Math.round((concluidas / ATIVIDADES.length) * 100)}%).`;
    barra.firstChild.style.width = `${Math.round((concluidas / ATIVIDADES.length) * 100)}%`;
  }

  raiz.replaceChildren(
    h(
      'nav',
      { class: 'atv-breadcrumbs', 'aria-label': 'Você está aqui' },
      h(
        'a',
        { class: 'wf-breadcrumb-mobile-voltar seta-voltar', href: '/cursos.html' },
        h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'arrow_back'),
        'Voltar para Trilhas',
      ),
      h(
        'ol',
        {},
        h('li', {}, h('a', { href: '/' }, 'Início')),
        h('li', {}, h('a', { href: '/cursos.html' }, 'Pensamento Computacional')),
        h('li', { 'aria-current': 'page' }, 'Atividades & Laboratório 3D BNCC'),
      ),
    ),
    h(TituloPagina, { class: 'atv-titulo-pagina' }, 'Atividades Dinâmicas e Laboratório 3D Python'),
    h(
      'p',
      { class: 'atv-intro' },
      'Explore desafios de Pensamento Computacional: algoritmos do cotidiano, decomposição lógica, blocos visuais e o Laboratório 3D animado com código Python no navegador.',
    ),
    bannerRetomar() || '',
    bannerExploradorPython3d() || '',
    h('div', { class: 'atv-resumo-progresso' }, textoProgresso, barra),
    h(
      'div',
      { class: 'atv-barra-busca-hab' },
      inputBusca,
      selectHabilidade,
    ),
    h(
      'div',
      { class: 'atv-filtros' },
      grupoDeFiltro(
        'Modalidade',
        [['todos', 'Todas'], ...Object.entries(TIPOS).map(([valor, t]) => [valor, t.rotulo])],
        filtro.tipo,
        (valor) => { filtro.tipo = valor; atualizar(); },
      ),
      grupoDeFiltro(
        'Conceito',
        [['todos', 'Todos'], ...Object.entries(CONCEITOS).map(([valor, conceito]) => [valor, conceito.rotulo])],
        filtro.conceito,
        (valor) => { filtro.conceito = valor; atualizar(); },
      ),
      grupoDeFiltro(
        'Ano escolar',
        [['todas', 'Todos'], ...Object.entries(FAIXAS)],
        filtro.faixa,
        (valor) => { filtro.faixa = valor; atualizar(); },
      ),
    ),
    lista,
  );
  atualizar(false);
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
  document.title = `${atividade.titulo} — LMS COMPASSO`;
  const secaoEixo = obterSecaoPorEixo(atividade.eixo);
  const eixoInfo = EIXOS_BNCC[atividade.eixo] || EIXOS_BNCC['pensamento-computacional'];
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
        ? h('a', { class: 'btn btn-primario seta-proximo', href: `/atividades.html?id=${encodeURIComponent(proxima.id)}` }, 'Próxima atividade', h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_forward'))
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
            concluiuTodasPython3d ? 'Emitir Certificado Explorador Python 3D' : 'Visualizar Certificado Python 3D',
          )
        : null,
      h('a', { class: 'btn btn-neutro seta-voltar', href: '/atividades.html' }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_back'), 'Ver todas as atividades'),
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
        { class: 'atv-breadcrumbs', 'aria-label': 'Você está aqui' },
        h(
          'a',
          { class: 'wf-breadcrumb-mobile-voltar seta-voltar', href: '/atividades.html' },
          h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'arrow_back'),
          'Voltar para Trilhas',
        ),
        h(
          'ol',
          {},
          h('li', {}, h('a', { href: '/' }, 'Início')),
          h('li', {}, h('a', { href: '/atividades.html' }, eixoInfo.rotulo)),
          h('li', {}, h('a', { href: `/atividades.html?hab=${encodeURIComponent(codigoHabPrincipal)}` }, codigoHabPrincipal)),
          h('li', { 'aria-current': 'page' }, atividade.titulo),
        ),
      ),
      h(
        'div',
        { class: 'atv-nav-sequencial' },
        anterior
          ? h('a', { class: 'btn btn-neutro btn-sm seta-voltar', href: `/atividades.html?id=${encodeURIComponent(anterior.id)}`, title: `Voltar para: ${anterior.titulo}` }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_back'), 'Voltar')
          : null,
        proxima
          ? h('a', { class: 'btn btn-neutro btn-sm seta-proximo', href: `/atividades.html?id=${encodeURIComponent(proxima.id)}`, title: `Próximo: ${proxima.titulo}` }, 'Próximo', h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_forward'))
          : null,
      ),
    ),
    mapaOrientacaoDaTrilha(atividade),
    h(
      'ul',
      { class: 'atv-chips' },
      h(
        'li',
        { class: 'atv-chip atv-chip-eixo', title: `Eixo Estruturante BNCC: ${eixoInfo.rotulo}` },
        h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, eixoInfo.icone || 'psychology'),
        eixoInfo.rotulo,
      ),
      h('li', { class: 'atv-chip' }, CONCEITOS[atividade.conceito].rotulo),
      h('li', { class: 'atv-chip' }, TIPOS[atividade.tipo].rotulo),
      h('li', { class: 'atv-chip' }, atividade.anos),
      h('li', { class: 'atv-chip' }, NIVEIS[atividade.nivel]),
      h('li', { class: 'atv-chip' }, `${atividade.duracaoMin} min`),
      ...atividade.habilidades.map((hab) => h('li', { class: 'atv-chip' }, hab)),
    ),
    h(TituloPagina, { class: 'atv-titulo-pagina' }, atividade.titulo),
    h('p', { class: 'atv-instrucao' }, atividade.instrucao),
    jogador,
    areaConclusao,
    mapaHabilidadesDaAtividade(atividade),
    painelDoProfessor(atividade),
  );
}

function renderNaoEncontrada() {
  document.title = 'Atividade não encontrada (404) — LMS COMPASSO';
  document.body.setAttribute('data-secao', 'pensamento');

  const inputBusca404 = h('input', {
    type: 'search',
    name: 'q',
    placeholder: 'Buscar por código BNCC (ex.: EF05CO01) ou tema (ex.: Robô, Python)...',
    'aria-label': 'Buscar atividade ou habilidade BNCC',
  });

  raiz.replaceChildren(
    h(
      'nav',
      { class: 'atv-breadcrumbs', 'aria-label': 'Você está aqui' },
      h(
        'a',
        { class: 'wf-breadcrumb-mobile-voltar seta-voltar', href: '/atividades.html' },
        h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'arrow_back'),
        'Voltar para Trilhas',
      ),
      h(
        'ol',
        {},
        h('li', {}, h('a', { href: '/' }, 'Início')),
        h('li', {}, h('a', { href: '/atividades.html' }, 'Atividades')),
        h('li', { 'aria-current': 'page' }, 'Página não encontrada (404)'),
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
      h(TituloPagina, { id: 'titulo-erro-404' }, 'Atividade não encontrada (Erro 404)'),
      h('p', {}, 'Não encontramos a atividade solicitada. Ela pode ter mudado de endereço ou o código informado não existe. Use a busca abaixo ou volte para o início.'),
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
        h('button', { type: 'submit', class: 'btn btn-primario flex-inline-icon' }, h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'search'), 'Buscar'),
      ),
      h(
        'div',
        { class: 'estado-saida-acoes' },
        h('a', { class: 'btn btn-primario flex-inline-icon', href: '/' }, h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'home'), 'Ir para o início'),
        h('a', { class: 'btn btn-neutro seta-voltar', href: '/atividades.html' }, h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'arrow_back'), 'Voltar para Trilhas de Atividades'),
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

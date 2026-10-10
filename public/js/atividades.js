/**
 * ============================================================================
 * LMS COMPASSO - ATIVIDADES DINÂMICAS (PÁGINA /atividades.html)
 * ============================================================================
 * - Sem parâmetros: mostra o catálogo com filtros e o progresso do estudante.
 * - Com ?id=<atividade>: abre a atividade. Se vier de uma aula do curso, os parâmetros
 *   ?aula=<id>&curso=<id> permitem marcar a aula como concluída ao final.
 * Funciona sem login; o progresso fica guardado neste navegador (separado por usuário).
 * ============================================================================
 */

import {
  ATIVIDADES,
  CONCEITOS,
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

const raiz = document.getElementById('atividades-raiz');
const parametros = new URLSearchParams(window.location.search);
const usuario = obterToken() ? obterUsuario() : null;
const aulaId = Number(parametros.get('aula')) || null;
const cursoId = Number(parametros.get('curso')) || null;
const chaveProgresso = `lms_atividades_progresso:${usuario ? usuario.id : 'visitante'}`;
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Dentro da plataforma o título fica na barra superior; fora dela, a página tem o seu próprio cabeçalho.
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
    // Armazenamento bloqueado pelo navegador: a atividade continua funcionando, só não guarda o progresso.
  }
}

let progresso = lerProgresso();

/* ---------------------------------------------------------------------------
 * Catálogo
 * ------------------------------------------------------------------------ */

function cartaoDaAtividade(atividade) {
  const concluida = Boolean(progresso[atividade.id]?.concluida);
  return h(
    'li',
    {},
    h(
      'article',
      { class: 'atv-card' },
      h(
        'div',
        { class: 'atv-card-topo' },
        h('span', { class: 'pub-icone', 'aria-hidden': 'true' }, atividade.emoji),
        concluida ? h('span', { class: 'atv-concluida flex-inline-icon' }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'check_circle'), ' Concluída') : null,
      ),
      h(TituloCartao, {}, atividade.titulo),
      h('p', {}, atividade.resumo),
      h(
        'ul',
        { class: 'atv-meta' },
        [CONCEITOS[atividade.conceito].rotulo, TIPOS[atividade.tipo].rotulo, atividade.anos, NIVEIS[atividade.nivel], `${atividade.duracaoMin} min`]
          .map((rotulo) => h('li', {}, rotulo)),
      ),
      h(
        'div',
        { class: 'atv-card-acao' },
        h(
          'a',
          { class: `btn ${concluida ? 'btn-neutro' : 'btn-primario'}`, href: `/atividades.html?id=${encodeURIComponent(atividade.id)}` },
          concluida ? 'Jogar de novo' : 'Começar',
          h('span', { class: 'somente-leitor' }, `: ${atividade.titulo}`),
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

function renderCatalogo() {
  document.title = 'Atividades dinâmicas — LMS COMPASSO';
  const filtro = { conceito: 'todos', faixa: 'todas' };
  const lista = h('ul', { class: 'atv-grade' });
  const barra = h('div', { class: 'progress-bar' }, h('div', { class: 'progress-bar-fill' }));
  const textoProgresso = h('strong');

  function atualizar(avisar = true) {
    const visiveis = ATIVIDADES.filter((atividade) => (
      (filtro.conceito === 'todos' || atividade.conceito === filtro.conceito)
      && (filtro.faixa === 'todas' || atividade.faixa === filtro.faixa)
    ));
    lista.replaceChildren(...(visiveis.length
      ? visiveis.map(cartaoDaAtividade)
      : [h('li', { class: 'atv-vazio-lista' }, 'Nenhuma atividade para esse filtro.')]));
    if (avisar) anunciar(`${visiveis.length} ${visiveis.length === 1 ? 'atividade encontrada' : 'atividades encontradas'}.`);

    const concluidas = contarConcluidas(progresso, ATIVIDADES);
    textoProgresso.textContent = `Você concluiu ${concluidas} de ${ATIVIDADES.length} atividades.`;
    barra.firstChild.style.width = `${Math.round((concluidas / ATIVIDADES.length) * 100)}%`;
  }

  raiz.replaceChildren(
    h(TituloPagina, { class: 'atv-titulo-pagina' }, 'Atividades dinâmicas de Pensamento Computacional'),
    h(
      'p',
      { class: 'atv-intro' },
      'Algoritmos do cotidiano e decomposição lógica em atividades interativas. Funcionam no computador, no tablet e no celular, e cada uma tem orientações para o professor e uma versão desplugada para imprimir.',
    ),
    h('div', { class: 'atv-resumo-progresso' }, textoProgresso, barra),
    h(
      'div',
      { class: 'atv-filtros' },
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
 * Atividade
 * ------------------------------------------------------------------------ */

function painelDoProfessor(atividade) {
  const { professor } = atividade;
  return h(
    'details',
    { class: 'atv-professor' },
    h('summary', {}, 'Orientações para o professor'),
    h(
      'div',
      { class: 'atv-professor-corpo' },
      h('h3', {}, 'Objetivo'),
      h('p', {}, professor.objetivo),
      h('h3', {}, 'Habilidades da BNCC Computação'),
      h('dl', {}, atividade.habilidades.flatMap((codigo) => [
        h('dt', {}, `${codigo} · ${HABILIDADES[codigo].anos}`),
        h('dd', {}, HABILIDADES[codigo].texto),
      ])),
      h('p', { class: 'atv-aviso' }, 'Alinhamento sugerido, sujeito à validação da equipe pedagógica.'),
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
  const areaConclusao = h('div', { class: 'atv-conclusao' });
  let aulaSincronizada = false;

  async function aoConcluir(dados) {
    progresso = registrarConclusao(progresso, atividade.id, dados);
    salvarProgresso(progresso);

    const proxima = ATIVIDADES[ATIVIDADES.findIndex((item) => item.id === atividade.id) + 1];
    const acoes = [
      proxima
        ? h('a', { class: 'btn btn-primario flex-inline-icon', href: `/atividades.html?id=${encodeURIComponent(proxima.id)}` }, 'Próxima atividade', h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_forward'))
        : null,
      h('a', { class: 'btn btn-neutro', href: '/atividades.html' }, 'Ver todas as atividades'),
    ];

    // Estudante logado, vindo de uma aula do curso: a aula é marcada como concluída (uma única vez por visita).
    const avisos = [];
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
      acoes.unshift(h('a', { class: 'btn btn-secundario', href: `/curso-detalhe.html?id=${cursoId}` }, 'Voltar ao curso'));
    }

    areaConclusao.replaceChildren(...avisos, h('div', { class: 'atv-acoes' }, acoes));
  }

  const jogador = criarJogador(atividade, { aoConcluir, reduzirMovimento });

  raiz.replaceChildren(
    usuario && cursoId
      ? h('a', { class: 'atv-voltar flex-inline-icon', href: `/curso-detalhe.html?id=${cursoId}` }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_back'), ' Voltar ao curso')
      : h('a', { class: 'atv-voltar flex-inline-icon', href: '/atividades.html' }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_back'), ' Todas as atividades'),
    h(
      'ul',
      { class: 'atv-chips' },
      [CONCEITOS[atividade.conceito].rotulo, TIPOS[atividade.tipo].rotulo, atividade.anos, NIVEIS[atividade.nivel], `${atividade.duracaoMin} min`]
        .map((rotulo) => h('li', { class: 'atv-chip' }, rotulo)),
    ),
    h(TituloPagina, { class: 'atv-titulo-pagina' }, atividade.titulo),
    h('p', { class: 'atv-instrucao' }, atividade.instrucao),
    jogador,
    areaConclusao,
    painelDoProfessor(atividade),
  );
}

function renderNaoEncontrada() {
  document.title = 'Atividade não encontrada — LMS COMPASSO';
  raiz.replaceChildren(
    h(TituloPagina, { class: 'atv-titulo-pagina' }, 'Atividade não encontrada'),
    h('p', { class: 'atv-intro' }, 'Não encontramos a atividade pedida. Ela pode ter mudado de endereço.'),
    h('a', { class: 'btn btn-primario', href: '/atividades.html' }, 'Ver todas as atividades'),
  );
}

/* ---------------------------------------------------------------------------
 * Início
 * ------------------------------------------------------------------------ */

document.body.classList.add(usuario ? 'modo-app' : 'modo-publico');
if (usuario) {
  montarLayout('atividades');
  document.getElementById('titulo-pagina').textContent = 'Atividades dinâmicas';
}

const idPedido = parametros.get('id');
const atividadePedida = idPedido ? buscarAtividade(idPedido) : null;

if (idPedido && !atividadePedida) renderNaoEncontrada();
else if (atividadePedida) renderAtividade(atividadePedida);
else renderCatalogo();

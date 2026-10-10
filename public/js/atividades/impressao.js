/**
 * Folha desplugada: monta uma página A4 (cartões para recortar + gabarito do professor)
 * e abre a impressão do navegador. Assim a mesma atividade pode ser feita com papel, sem tela.
 */

import { h } from './dom.js';
import { DIRECOES, embaralharDiferente, lerMapa, menorPrograma } from './logica.js';

function cabecalho(atividade, orientacao) {
  return [
    h('h1', {}, `${atividade.emoji} ${atividade.titulo}`),
    h('p', {}, `Atividade desplugada · ${atividade.anos} · Pensamento Computacional`),
    h('p', {}, orientacao),
  ];
}

function rodape(atividade) {
  return h('p', {}, `LMS COMPASSO · BNCC Computação · Habilidades sugeridas: ${atividade.habilidades.join(', ')}`);
}

function guiaDoProfessor(atividade, ...extras) {
  const { professor } = atividade;
  return h(
    'div',
    { class: 'folha-gabarito' },
    h('h2', {}, 'Para o professor'),
    ...extras,
    h('p', {}, h('strong', {}, 'Objetivo: '), professor.objetivo),
    h('p', {}, h('strong', {}, 'Como conduzir: '), professor.desplugada),
    h('p', {}, h('strong', {}, 'Para conversar em sala:')),
    h('ul', {}, professor.conversa.map((pergunta) => h('li', {}, pergunta))),
    professor.observacao ? h('p', {}, professor.observacao) : null,
  );
}

function folhaOrdenar(atividade) {
  const intrusos = atividade.intrusos || [];
  const cartoes = embaralharDiferente([...atividade.passos, ...intrusos]);
  const etapas = [...new Set(atividade.passos.map((passo) => passo.etapa))].sort((a, b) => a - b);

  return h(
    'div',
    { class: 'folha' },
    ...cabecalho(
      atividade,
      `Recorte as fichas, embaralhe e monte o algoritmo na ordem certa.${intrusos.length ? ' Atenção: pode haver fichas que não fazem parte do algoritmo.' : ''}`,
    ),
    h(
      'div',
      { class: 'folha-cartoes' },
      cartoes.map((passo) => h('div', { class: 'folha-cartao' }, h('span', { class: 'folha-emoji' }, passo.emoji), passo.texto)),
    ),
    rodape(atividade),
    guiaDoProfessor(
      atividade,
      h('p', {}, h('strong', {}, 'Ordem correta:')),
      h(
        'ol',
        {},
        etapas.map((etapa) => {
          const grupo = atividade.passos.filter((passo) => passo.etapa === etapa);
          return h('li', {}, grupo.length > 1 ? `Em qualquer ordem: ${grupo.map((passo) => passo.texto).join(' / ')}` : grupo[0].texto);
        }),
      ),
      intrusos.length ? h('p', {}, h('strong', {}, 'Não fazem parte: '), intrusos.map((passo) => passo.texto).join('; ')) : null,
    ),
  );
}

function folhaDecompor(atividade) {
  const descarte = atividade.tarefas.filter((tarefa) => tarefa.parte === 'fora');
  const cartoes = embaralharDiferente(atividade.tarefas);

  return h(
    'div',
    { class: 'folha' },
    ...cabecalho(atividade, 'Recorte as fichas e cole cada uma na parte do problema a que ela pertence.'),
    h('h2', {}, `Problema: ${atividade.problema}`),
    h(
      'div',
      { class: 'folha-partes' },
      atividade.partes.map((parte) => h('div', { class: 'folha-parte' }, `${parte.emoji} ${parte.titulo}`)),
      descarte.length ? h('div', { class: 'folha-parte' }, `🗑️ ${atividade.descarteTitulo}`) : null,
    ),
    h('div', { class: 'folha-cartoes' }, cartoes.map((tarefa) => h('div', { class: 'folha-cartao' }, tarefa.texto))),
    rodape(atividade),
    guiaDoProfessor(
      atividade,
      h('p', {}, h('strong', {}, 'Respostas:')),
      h(
        'ul',
        {},
        atividade.partes.map((parte) => h(
          'li',
          {},
          h('strong', {}, `${parte.titulo}: `),
          atividade.tarefas.filter((tarefa) => tarefa.parte === parte.id).map((tarefa) => tarefa.texto).join('; '),
        )),
        descarte.length ? h('li', {}, h('strong', {}, `${atividade.descarteTitulo}: `), descarte.map((tarefa) => tarefa.texto).join('; ')) : null,
      ),
    ),
  );
}

function folhaRobo(atividade) {
  const mapa = lerMapa(atividade.grade);
  const { tema } = atividade;
  const solucao = menorPrograma(mapa).map((comando) => DIRECOES[comando].simbolo).join(' ');

  const celulas = atividade.grade.flatMap((linha) => [...linha].map((simbolo) => {
    const emoji = { R: tema.robo, M: tema.meta, '#': tema.obstaculo, I: tema.item }[simbolo] || '';
    return h('div', { class: 'folha-celula' }, emoji);
  }));

  const comandos = Object.values(DIRECOES).flatMap((direcao) => Array.from({ length: 6 }, () => h('div', { class: 'folha-cartao' }, direcao.simbolo)));

  return h(
    'div',
    { class: 'folha' },
    ...cabecalho(
      atividade,
      'Use uma ficha pequena como robô. Monte o programa com as fichas de comando, na ordem certa, e confira movendo o robô no mapa, um quadrado por comando.',
    ),
    h('div', { class: 'folha-mapa', style: `--colunas:${mapa.largura}` }, celulas),
    h('p', {}, `${tema.robo} robô · ${tema.meta} destino${tema.item ? ` · ${tema.item} lugar para passar` : ''} · ${tema.obstaculo} obstáculo`),
    h('div', { class: 'folha-cartoes compactos' }, comandos),
    rodape(atividade),
    guiaDoProfessor(
      atividade,
      h('p', {}, h('strong', {}, `Programa mais curto (${mapa.itens.length ? 'passando por todos os lugares, ' : ''}${solucao.split(' ').length} comandos): `), solucao),
    ),
  );
}

function construirFolha(atividade) {
  if (atividade.tipo === 'ordenar') return folhaOrdenar(atividade);
  if (atividade.tipo === 'decompor') return folhaDecompor(atividade);
  return folhaRobo(atividade);
}

/**
 * Monta a folha da atividade e abre a janela de impressão do navegador.
 */
export function imprimirFichas(atividade) {
  const folha = document.getElementById('folha-impressao');
  folha.replaceChildren(construirFolha(atividade));
  document.body.classList.add('imprimindo');

  const limpar = () => {
    document.body.classList.remove('imprimindo');
    window.removeEventListener('afterprint', limpar);
  };
  window.addEventListener('afterprint', limpar);
  window.print();
}

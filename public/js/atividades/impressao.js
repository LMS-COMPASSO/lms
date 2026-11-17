/**
 * Folha desplugada: monta uma página A4 (cartões para recortar + gabarito do professor)
 * e abre a impressão do navegador. Assim a mesma atividade pode ser feita com papel, sem tela.
 */

import { h } from './dom.js';
import { DIRECOES, embaralharDiferente, lerMapa, menorPrograma } from './logica.js';
import { renderizarIcone, renderizarIconeCelula } from './icones.js';
import {
  t,
  atvDescarte,
  atvParte,
  atvPasso,
  atvProblema,
  atvProfessor,
  atvTarefa,
  atvTema,
  atvTitulo,
  atvBlocoRotulo,
} from './traducao.js';

function cabecalho(atividade, orientacao) {
  const anosTexto = t(`faixa.${atividade.faixa}`, {}, atividade.anos);
  const eixoTexto = t(`eixo.${atividade.eixo || 'pensamento-computacional'}`, {}, 'Pensamento Computacional');
  return [
    h('h1', { class: 'folha-titulo' }, renderizarIcone(atividade.id, { classe: 'folha-icone' }), ` ${atvTitulo(atividade)}`),
    h('p', {}, t('imp.subtitulo', { anos: anosTexto, eixo: eixoTexto })),
    h('p', {}, orientacao),
  ];
}

function rodape(atividade) {
  return h('p', {}, t('imp.rodape', { habilidades: atividade.habilidades.join(', ') }));
}

function guiaDoProfessor(atividade, ...extras) {
  const prof = atvProfessor(atividade);
  return h(
    'div',
    { class: 'folha-gabarito' },
    h('h2', {}, t('imp.paraProfessor')),
    ...extras,
    h('p', {}, h('strong', {}, `${t('imp.objetivo')}: `), prof.objetivo),
    h('p', {}, h('strong', {}, `${t('imp.comoConduzir')}: `), prof.desplugada),
    h('p', {}, h('strong', {}, `${t('imp.paraConversar')}:`)),
    h('ul', {}, prof.conversa.map((pergunta) => h('li', {}, pergunta))),
    prof.observacao ? h('p', {}, prof.observacao) : null,
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
      `${t('imp.ordenar.instrucao')}${intrusos.length ? ` ${t('imp.ordenar.avisoIntrusos')}` : ''}`,
    ),
    h(
      'div',
      { class: 'folha-cartoes' },
      cartoes.map((passo) => h('div', { class: 'folha-cartao' }, renderizarIcone(passo.id || passo.emoji, { classe: 'folha-icone' }), ` ${atvPasso(atividade.id, passo)}`)),
    ),
    rodape(atividade),
    guiaDoProfessor(
      atividade,
      h('p', {}, h('strong', {}, `${t('imp.ordenar.ordemCorreta')}:`)),
      h(
        'ol',
        {},
        etapas.map((etapa) => {
          const grupo = atividade.passos.filter((passo) => passo.etapa === etapa);
          return h('li', {}, grupo.length > 1
            ? t('imp.ordenar.qualquerOrdem', { lista: grupo.map((passo) => atvPasso(atividade.id, passo)).join(' / ') })
            : atvPasso(atividade.id, grupo[0]));
        }),
      ),
      intrusos.length
        ? h('p', {}, h('strong', {}, `${t('imp.ordenar.naoFazemParte')}: `), intrusos.map((passo) => atvPasso(atividade.id, passo)).join('; '))
        : null,
    ),
  );
}

function folhaDecompor(atividade) {
  const descarte = atividade.tarefas.filter((tarefa) => tarefa.parte === 'fora');
  const cartoes = embaralharDiferente(atividade.tarefas);
  const rotuloDescarte = atvDescarte(atividade);

  return h(
    'div',
    { class: 'folha' },
    ...cabecalho(atividade, t('imp.decompor.instrucao')),
    h('h2', {}, `${t('imp.decompor.problema')}: ${atvProblema(atividade)}`),
    h(
      'div',
      { class: 'folha-partes' },
      atividade.partes.map((parte) => h('div', { class: 'folha-parte' }, renderizarIcone(parte.id || parte.emoji, { classe: 'folha-icone' }), ` ${atvParte(atividade.id, parte)}`)),
      descarte.length ? h('div', { class: 'folha-parte' }, renderizarIcone('fora', { classe: 'folha-icone' }), ` ${rotuloDescarte}`) : null,
    ),
    h('div', { class: 'folha-cartoes' }, cartoes.map((tarefa) => h('div', { class: 'folha-cartao' }, atvTarefa(atividade.id, tarefa)))),
    rodape(atividade),
    guiaDoProfessor(
      atividade,
      h('p', {}, h('strong', {}, `${t('imp.decompor.respostas')}:`)),
      h(
        'ul',
        {},
        atividade.partes.map((parte) => h(
          'li',
          {},
          h('strong', {}, `${atvParte(atividade.id, parte)}: `),
          atividade.tarefas.filter((tarefa) => tarefa.parte === parte.id).map((tarefa) => atvTarefa(atividade.id, tarefa)).join('; '),
        )),
        descarte.length ? h('li', {}, h('strong', {}, `${rotuloDescarte}: `), descarte.map((tarefa) => atvTarefa(atividade.id, tarefa)).join('; ')) : null,
      ),
    ),
  );
}

function folhaRobo(atividade) {
  const mapa = lerMapa(atividade.grade);
  const tema = atvTema(atividade.id, atividade.tema);
  const solucao = menorPrograma(mapa).map((comando) => DIRECOES[comando].simbolo).join(' ');

  const celulas = atividade.grade.flatMap((linha) => [...linha].map((simbolo) => {
    return h('div', { class: 'folha-celula' }, renderizarIconeCelula(simbolo, tema));
  }));

  const comandos = Object.values(DIRECOES).flatMap((direcao) => Array.from({ length: 6 }, () => h('div', { class: 'folha-cartao' }, direcao.simbolo)));

  return h(
    'div',
    { class: 'folha' },
    ...cabecalho(
      atividade,
      t('imp.robo.instrucao'),
    ),
    h('div', { class: 'folha-mapa', style: `--colunas:${mapa.largura}` }, celulas),
    h(
      'p',
      { class: 'folha-legenda' },
      renderizarIcone('smart_toy', { classe: 'folha-icone' }),
      ` ${t('imp.robo.legendaRobo')} · `,
      renderizarIconeCelula('M', tema),
      ` ${tema.nomeMeta || t('imp.robo.destinoPadrao')}`,
      tema.item ? [' · ', renderizarIconeCelula('I', tema), ` ${tema.nomeItem || t('imp.robo.itemPadrao')}`] : '',
      ' · ',
      renderizarIconeCelula('#', tema),
      ` ${tema.nomeObstaculo || t('imp.robo.obstaculoPadrao')}`,
    ),
    h('div', { class: 'folha-cartoes compactos' }, comandos),
    rodape(atividade),
    guiaDoProfessor(
      atividade,
      h('p', {}, h('strong', {}, `${t(mapa.itens.length ? 'imp.robo.solucaoComItens' : 'imp.robo.solucaoSimples', { comandos: solucao.split(' ').length })}: `), solucao),
    ),
  );
}

function folhaBlocos(atividade) {
  const blocosCartoes = (atividade.blocosDisponiveis || []).map((b) => {
    const catRotulo = t(`blocos.cat.${b.categoria}`, {}, b.categoria);
    return h(
      'div',
      { class: 'folha-cartao' },
      renderizarIcone('extension', { classe: 'folha-icone' }),
      ` ${atvBlocoRotulo(atividade.id, b)} (${catRotulo})`,
    );
  });

  return h(
    'div',
    { class: 'folha' },
    ...cabecalho(
      atividade,
      t('imp.blocos.instrucao'),
    ),
    h('div', { class: 'folha-cartoes' }, blocosCartoes),
    rodape(atividade),
    guiaDoProfessor(
      atividade,
      h('p', {}, h('strong', {}, `${t('imp.blocos.conceitoTitulo')}: `), t('imp.blocos.conceitoDesc')),
      h('p', {}, h('strong', {}, `${t('imp.blocos.desafioTitulo')}: `), t('imp.blocos.desafioDesc')),
    ),
  );
}

function construirFolha(atividade) {
  if (atividade.tipo === 'ordenar') return folhaOrdenar(atividade);
  if (atividade.tipo === 'decompor') return folhaDecompor(atividade);
  if (atividade.tipo === 'blocos') return folhaBlocos(atividade);
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

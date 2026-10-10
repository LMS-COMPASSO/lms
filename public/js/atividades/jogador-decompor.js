/**
 * Jogador de atividades "Dividir o problema": o estudante escolhe uma tarefa e a coloca na parte
 * do problema a que ela pertence. Funciona com toque, mouse e teclado (tudo são botões).
 */

import { h, anunciar, criarFeedback, renderizarComFoco } from './dom.js';
import { avaliarClassificacao, embaralharDiferente, plural } from './logica.js';

export function jogadorDecompor(atividade, ctx) {
  const tarefas = new Map(atividade.tarefas.map((tarefa) => [tarefa.id, tarefa]));
  const temDescarte = atividade.tarefas.some((tarefa) => tarefa.parte === 'fora');
  const colunas = [
    ...atividade.partes,
    ...(temDescarte ? [{ id: 'fora', emoji: '🗑️', titulo: atividade.descarteTitulo, descarte: true }] : []),
  ];
  const feedback = criarFeedback();
  const area = h('div');
  let estado;

  const texto = (id) => tarefas.get(id).texto;
  const nomeColuna = (id) => colunas.find((coluna) => coluna.id === id).titulo;
  const naLista = () => estado.ordem.filter((id) => !estado.alocacao[id]);

  function novoEstado() {
    return {
      ordem: embaralharDiferente(atividade.tarefas.map((tarefa) => tarefa.id)),
      alocacao: {},
      selecionada: null,
      tentativas: 0,
      resultado: null,
      concluida: false,
    };
  }

  function selecionar(id) {
    estado.selecionada = estado.selecionada === id ? null : id;
    anunciar(estado.selecionada
      ? `Tarefa “${texto(id)}” selecionada. Escolha a parte do problema.`
      : 'Seleção removida.');
    renderizar(`lista-${id}`);
  }

  function colocar(idColuna) {
    const id = estado.selecionada;
    if (!id) return;
    const lista = naLista();
    const posicao = lista.indexOf(id);
    const vizinho = lista[posicao + 1] ?? lista[posicao - 1];

    estado.alocacao[id] = idColuna;
    estado.selecionada = null;
    estado.resultado = null;
    anunciar(`Tarefa “${texto(id)}” colocada em ${nomeColuna(idColuna)}.`);
    renderizar(vizinho ? `lista-${vizinho}` : 'verificar');
  }

  function devolver(id) {
    delete estado.alocacao[id];
    estado.resultado = null;
    anunciar(`Tarefa “${texto(id)}” devolvida à lista.`);
    renderizar(`lista-${id}`);
  }

  function verificar() {
    const resposta = avaliarClassificacao(atividade, estado.alocacao);

    if (resposta.naoClassificadas.length) {
      feedback.info('Ainda faltam tarefas', `Organize mais ${plural(resposta.naoClassificadas.length, 'tarefa', 'tarefas')} antes de verificar.`);
      renderizar('verificar');
      return;
    }

    estado.tentativas += 1;
    estado.resultado = resposta;

    if (resposta.ok) {
      estado.concluida = true;
      feedback.sucesso('Problema dividido! 🎉', atividade.conclusao);
      renderizar('recomecar');
      ctx.aoConcluir({ tentativas: estado.tentativas });
      return;
    }

    feedback.erro(
      'Quase lá!',
      `${resposta.corretas.length} de ${resposta.total} tarefas estão no lugar certo. Revise as marcadas com ⚠: toque nelas para devolvê-las à lista e tente de novo.`,
      estado.tentativas >= 2 ? ` Dica: ${atividade.dica}` : '',
    );
    renderizar('verificar');
  }

  function recomecar() {
    estado = novoEstado();
    feedback.limpar();
    anunciar('Atividade reiniciada.');
    renderizar(`lista-${naLista()[0]}`);
  }

  function cartaoDaLista(id) {
    const selecionada = estado.selecionada === id;
    return h(
      'button',
      { type: 'button', class: 'atv-passo', 'data-foco': `lista-${id}`, 'aria-pressed': String(selecionada), onclick: () => selecionar(id) },
      texto(id),
    );
  }

  function cartaoNaColuna(id) {
    const resultado = estado.resultado;
    let classe = 'atv-passo';
    let marca = null;
    if (resultado) {
      if (resultado.erradas.includes(id)) {
        classe += ' atv-fora';
        marca = '⚠ Revise';
      } else {
        classe += ' atv-certo';
        marca = '✔ Certo';
      }
    }
    return h(
      'button',
      {
        type: 'button',
        class: classe,
        'data-foco': `lista-${id}`,
        title: 'Toque para devolver à lista',
        'aria-label': `${texto(id)}${marca ? `. ${marca}` : ''}. Toque para devolver à lista.`,
        disabled: estado.concluida,
        onclick: () => devolver(id),
      },
      texto(id),
      marca ? h('span', { class: 'atv-marca' }, marca) : null,
    );
  }

  function coluna(parte) {
    const ids = estado.ordem.filter((id) => estado.alocacao[id] === parte.id);
    return h(
      'section',
      { class: `atv-parte${parte.descarte ? ' descarte' : ''}`, 'aria-label': parte.titulo },
      h('h4', {}, h('span', { 'aria-hidden': 'true' }, parte.emoji), ` ${parte.titulo}`),
      h(
        'button',
        {
          type: 'button',
          class: 'btn btn-neutro btn-sm',
          'data-foco': `parte-${parte.id}`,
          'aria-label': `Colocar aqui em ${parte.titulo}`,
          disabled: !estado.selecionada || estado.concluida,
          onclick: () => colocar(parte.id),
        },
        'Colocar aqui',
      ),
      ids.length
        ? h('ul', {}, ids.map((id) => h('li', {}, cartaoNaColuna(id))))
        : h('p', { class: 'atv-parte-vazia' }, 'Nenhuma tarefa ainda.'),
    );
  }

  function arvoreDaDecomposicao() {
    return h(
      'div',
      { class: 'atv-painel' },
      h(ctx.TituloPainel, {}, 'Mapa da decomposição'),
      h(
        'ul',
        { class: 'atv-arvore' },
        h(
          'li',
          {},
          h('strong', {}, atividade.problema),
          h(
            'ul',
            {},
            atividade.partes.map((parte) => h(
              'li',
              {},
              `${parte.emoji} ${parte.titulo}`,
              h('ul', {}, atividade.tarefas.filter((tarefa) => tarefa.parte === parte.id).map((tarefa) => h('li', {}, tarefa.texto))),
            )),
          ),
        ),
        temDescarte
          ? h('li', {}, `🗑️ ${atividade.descarteTitulo}: ${atividade.tarefas.filter((tarefa) => tarefa.parte === 'fora').map((tarefa) => tarefa.texto).join('; ')}`)
          : null,
      ),
    );
  }

  function renderizar(foco = null) {
    const lista = naLista();
    renderizarComFoco(
      area,
      () => [
        h(
          'div',
          { class: 'atv-problema' },
          h('span', { class: 'atv-emoji', 'aria-hidden': 'true' }, '🎯'),
          h('span', {}, 'Problema: ', h('strong', {}, atividade.problema)),
        ),
        h(
          'div',
          { class: 'atv-painel' },
          h(ctx.TituloPainel, {}, 'Tarefas para organizar'),
          h('p', { class: 'atv-contagem' }, estado.selecionada
            ? `Selecionada: “${texto(estado.selecionada)}”. Agora escolha a parte do problema.`
            : 'Toque em uma tarefa para selecioná-la.'),
          lista.length
            ? h('ul', { class: 'atv-banco' }, lista.map((id) => h('li', {}, cartaoDaLista(id))))
            : h('p', { class: 'atv-vazio' }, 'Todas as tarefas foram colocadas. Confira e toque em Verificar.'),
        ),
        h('div', { class: 'atv-painel' }, h(ctx.TituloPainel, {}, 'Partes do problema'), h('div', { class: 'atv-partes' }, colunas.map(coluna))),
        estado.concluida ? arvoreDaDecomposicao() : null,
        h(
          'div',
          { class: 'atv-acoes' },
          h('button', { type: 'button', class: 'btn btn-primario', 'data-foco': 'verificar', disabled: estado.concluida, onclick: verificar }, 'Verificar'),
          h('button', { type: 'button', class: 'btn btn-neutro', 'data-foco': 'dica', disabled: estado.concluida, onclick: () => feedback.info('Dica', atividade.dica) }, 'Quero uma dica'),
          h('button', { type: 'button', class: 'btn btn-neutro', 'data-foco': 'recomecar', onclick: recomecar }, 'Recomeçar'),
        ),
      ],
      foco,
    );
  }

  estado = novoEstado();
  renderizar();
  return h('div', {}, area, feedback.elemento);
}

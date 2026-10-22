/**
 * Jogador de atividades "Dividir o problema": o estudante escolhe uma tarefa e a coloca na parte
 * do problema a que ela pertence. Funciona com toque, mouse e teclado (tudo são botões).
 * Aprimorado com telemetria visual, GSAP e motor de áudio Web Audio API.
 */

import { h, anunciar, criarFeedback, renderizarComFoco } from './dom.js';
import { avaliarClassificacao, embaralharDiferente, plural } from './logica.js';
import { tocarSom, criarBotaoSom } from './som.js';
import { renderizarIcone } from './icones.js';

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
    tocarSom('click');
    estado.selecionada = estado.selecionada === id ? null : id;
    anunciar(estado.selecionada
      ? `Tarefa “${texto(id)}” selecionada. Escolha a parte do problema.`
      : 'Seleção removida.');
    renderizar(`lista-${id}`);
  }

  function colocar(idColuna) {
    const id = estado.selecionada;
    if (!id) return;
    tocarSom('encaixe');
    const lista = naLista();
    const posicao = lista.indexOf(id);
    const vizinho = lista[posicao + 1] ?? lista[posicao - 1];

    estado.alocacao[id] = idColuna;
    estado.selecionada = null;
    estado.resultado = null;
    anunciar(`Tarefa “${texto(id)}” colocada em ${nomeColuna(idColuna)}.`);
    renderizar(vizinho ? `lista-${vizinho}` : 'verificar');

    if (typeof window !== 'undefined' && window.gsap) {
      const parteEl = area.querySelector(`.atv-parte[aria-label*="${nomeColuna(idColuna)}"]`);
      if (parteEl) {
        window.gsap.fromTo(parteEl, { scale: 0.98 }, { scale: 1, duration: 0.25 });
      }
    }
  }

  function devolver(id) {
    tocarSom('mover');
    delete estado.alocacao[id];
    estado.resultado = null;
    anunciar(`Tarefa “${texto(id)}” devolvida à lista.`);
    renderizar(`lista-${id}`);
  }

  function verificar() {
    const resposta = avaliarClassificacao(atividade, estado.alocacao);

    if (resposta.naoClassificadas.length) {
      tocarSom('click');
      feedback.info('Ainda faltam tarefas', `Organize mais ${plural(resposta.naoClassificadas.length, 'tarefa', 'tarefas')} antes de verificar.`);
      renderizar('verificar');
      return;
    }

    estado.tentativas += 1;
    estado.resultado = resposta;

    if (resposta.ok) {
      estado.concluida = true;
      tocarSom('vitoria');
      feedback.sucesso('Problema dividido com sucesso! 🎉', atividade.conclusao);
      renderizar('recomecar');

      if (typeof window !== 'undefined' && window.gsap) {
        const arvoreEl = area.querySelector('.atv-arvore');
        if (arvoreEl) {
          window.gsap.fromTo(arvoreEl, { scale: 0.95 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
        }
      }

      ctx.aoConcluir({ tentativas: estado.tentativas });
      return;
    }

    tocarSom('erro');
    if (typeof window !== 'undefined' && window.gsap) {
      window.gsap.to(area, { x: -6, repeat: 4, yoyo: true, duration: 0.05, clearProps: 'x' });
    }

    feedback.erro(
      'Quase lá!',
      `${resposta.corretas.length} de ${resposta.total} tarefas estão no lugar certo. Revise as marcadas com ⚠: toque nelas para devolvê-las à lista e tente de novo.`,
      estado.tentativas >= 2 ? ` Dica: ${atividade.dica}` : '',
    );
    renderizar('verificar');
  }

  function recomecar() {
    tocarSom('click');
    estado = novoEstado();
    feedback.limpar();
    anunciar('Atividade reiniciada.');
    renderizar(`lista-${naLista()[0]}`);
  }

  function cartaoDaLista(id) {
    const selecionada = estado.selecionada === id;
    return h(
      'button',
      {
        type: 'button',
        class: `atv-passo ${selecionada ? 'atv-selecionada' : ''}`,
        'data-foco': `lista-${id}`,
        'aria-pressed': String(selecionada),
        onclick: () => selecionar(id),
      },
      texto(id),
    );
  }

  function cartaoNaColuna(id) {
    const resultado = estado.resultado;
    let classe = 'atv-passo atv-alocado';
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
      h(
        'div',
        { class: 'atv-parte-cabecalho' },
        h('h4', { class: 'atv-parte-titulo-flex' }, renderizarIcone(parte.id || parte.emoji, { classe: 'atv-parte-icone' }), h('span', {}, parte.titulo)),
        h('span', { class: 'atv-parte-count' }, plural(ids.length, 'item', 'itens')),
      ),
      h(
        'button',
        {
          type: 'button',
          class: `btn btn-sm ${estado.selecionada ? 'btn-primario' : 'btn-neutro'}`,
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
              renderizarIcone(parte.id || parte.emoji, { classe: 'icon-xs', fallback: 'folder' }),
              ` ${parte.titulo}`,
              h('ul', {}, atividade.tarefas.filter((tarefa) => tarefa.parte === parte.id).map((tarefa) => h('li', {}, tarefa.texto))),
            )),
          ),
        ),
        temDescarte
          ? h('li', {}, renderizarIcone('fora', { classe: 'icon-xs' }), ` ${atividade.descarteTitulo}: ${atividade.tarefas.filter((tarefa) => tarefa.parte === 'fora').map((tarefa) => tarefa.texto).join('; ')}`)
          : null,
      ),
    );
  }

  function barraTelemetria() {
    const totalTarefas = atividade.tarefas.length;
    const alocadas = Object.keys(estado.alocacao).length;
    return h(
      'div',
      { class: 'atv-telemetria-bar' },
      h(
        'div',
        { class: 'atv-telemetria-col' },
        h('span', { class: 'atv-telemetria-rotulo' }, 'Divisão do Problema'),
        h(
          'div',
          { class: 'atv-telemetria-gauge' },
          h('progress', { class: 'atv-telemetria-progress', value: String(alocadas), max: String(totalTarefas), 'aria-label': 'Tarefas alocadas' }),
          h('span', { class: 'atv-telemetria-valor' }, `${alocadas}/${totalTarefas} organizadas`),
        ),
      ),
      h(
        'div',
        { class: 'atv-telemetria-acoes' },
        estado.tentativas > 0
          ? h('span', { class: 'atv-badge-tentativas' }, plural(estado.tentativas, 'tentativa', 'tentativas'))
          : null,
        criarBotaoSom(() => renderizar()),
      ),
    );
  }

  function renderizar(foco = null) {
    const lista = naLista();
    renderizarComFoco(
      area,
      () => [
        barraTelemetria(),
        h(
          'div',
          { class: 'atv-problema' },
          renderizarIcone('problema', { classe: 'atv-problema-icone' }),
          h('span', {}, 'Problema: ', h('strong', {}, atividade.problema)),
        ),
        h(
          'div',
          { class: 'atv-painel' },
          h(ctx.TituloPainel, {}, 'Tarefas para organizar'),
          h('p', { class: 'atv-contagem' }, estado.selecionada
            ? `Selecionada: “${texto(estado.selecionada)}”. Agora escolha a parte do problema abaixo.`
            : 'Toque em uma tarefa para selecioná-la e depois toque em "Colocar aqui" na parte correspondente.'),
          lista.length
            ? h('ul', { class: 'atv-banco' }, lista.map((id) => h('li', {}, cartaoDaLista(id))))
            : h('p', { class: 'atv-vazio' }, 'Todas as tarefas foram colocadas. Confira e toque em Verificar.'),
        ),
        h('div', { class: 'atv-painel' }, h(ctx.TituloPainel, {}, 'Partes do problema'), h('div', { class: 'atv-partes' }, colunas.map(coluna))),
        estado.concluida ? arvoreDaDecomposicao() : null,
        h(
          'div',
          { class: 'atv-acoes' },
          h('button', { type: 'button', class: 'btn btn-primario flex-inline-icon', 'data-foco': 'verificar', disabled: estado.concluida, onclick: verificar }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'check'), ' Verificar'),
          h('button', { type: 'button', class: 'btn btn-neutro flex-inline-icon', 'data-foco': 'dica', disabled: estado.concluida, onclick: () => { tocarSom('click'); feedback.info('Dica', atividade.dica); } }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'lightbulb'), ' Quero uma dica'),
          h('button', { type: 'button', class: 'btn btn-neutro flex-inline-icon', 'data-foco': 'recomecar', onclick: recomecar }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'refresh'), ' Recomeçar'),
        ),
      ],
      foco,
    );
  }

  estado = novoEstado();
  renderizar();
  return h('div', {}, area, feedback.elemento);
}

/**
 * Jogador de atividades "Dividir o problema": o estudante escolhe uma tarefa e a coloca na parte
 * do problema a que ela pertence. Funciona com toque, mouse e teclado (tudo são botões).
 * Aprimorado com telemetria visual, GSAP e motor de áudio Web Audio API.
 */

import { h, anunciar, criarFeedback, renderizarComFoco } from './dom.js';
import { avaliarClassificacao, embaralharDiferente } from './logica.js';
import { tocarSom, criarBotaoSom } from './som.js';
import { renderizarIcone } from './icones.js';
import {
  t,
  pluralT,
  atvConclusao,
  atvDescarte,
  atvDica,
  atvParte,
  atvProblema,
  atvTarefa,
} from './traducao.js';

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

  const texto = (id) => atvTarefa(atividade.id, tarefas.get(id));
  const nomeColuna = (id) => {
    const col = colunas.find((coluna) => coluna.id === id);
    return col?.descarte ? atvDescarte(atividade) : atvParte(atividade.id, col);
  };
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
      ? t('decompor.anuncioSelecionada', { texto: texto(id) })
      : t('decompor.anuncioDeselecionada'));
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
    anunciar(t('decompor.anuncioColocada', { texto: texto(id), parte: nomeColuna(idColuna) }));
    renderizar(vizinho ? `lista-${vizinho}` : 'verificar');

    if (typeof window !== 'undefined' && window.gsap) {
      const parteEl = area.querySelector(`.atv-parte[data-parte-id="${idColuna}"]`);
      if (parteEl) {
        window.gsap.fromTo(parteEl, { scale: 0.98 }, { scale: 1, duration: 0.25 });
      }
    }
  }

  function devolver(id) {
    tocarSom('mover');
    delete estado.alocacao[id];
    estado.resultado = null;
    anunciar(t('decompor.anuncioDevolvida', { texto: texto(id) }));
    renderizar(`lista-${id}`);
  }

  function verificar() {
    const resposta = avaliarClassificacao(atividade, estado.alocacao);

    if (resposta.naoClassificadas.length) {
      tocarSom('click');
      feedback.info(
        t('decompor.faltamTitulo'),
        pluralT(resposta.naoClassificadas.length, 'decompor.faltamDescSing', 'decompor.faltamDescPlur'),
      );
      renderizar('verificar');
      return;
    }

    estado.tentativas += 1;
    estado.resultado = resposta;

    if (resposta.ok) {
      estado.concluida = true;
      tocarSom('vitoria');
      feedback.sucesso(t('decompor.sucessoTitulo'), atvConclusao(atividade));
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
      t('ordenar.quaseLa'),
      t('decompor.erroResumo', { corretas: resposta.corretas.length, total: resposta.total }),
      estado.tentativas >= 2 ? ` ${t('jog.dicaPrefixo', { dica: atvDica(atividade) })}` : '',
    );
    renderizar('verificar');
  }

  function recomecar() {
    tocarSom('click');
    estado = novoEstado();
    feedback.limpar();
    anunciar(t('jog.anuncioReiniciada'));
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
        marca = t('decompor.marcaRevise');
      } else {
        classe += ' atv-certo';
        marca = t('decompor.marcaCerto');
      }
    }
    return h(
      'button',
      {
        type: 'button',
        class: classe,
        'data-foco': `lista-${id}`,
        title: t('decompor.devolverTitle'),
        'aria-label': t('decompor.devolverAria', { texto: texto(id), marca: marca ? `. ${marca}` : '' }),
        disabled: estado.concluida,
        onclick: () => devolver(id),
      },
      texto(id),
      marca ? h('span', { class: 'atv-marca' }, marca) : null,
    );
  }

  function coluna(parte) {
    const ids = estado.ordem.filter((id) => estado.alocacao[id] === parte.id);
    const tituloParte = nomeColuna(parte.id);
    return h(
      'section',
      { class: `atv-parte${parte.descarte ? ' descarte' : ''}`, 'data-parte-id': parte.id, 'aria-label': tituloParte },
      h(
        'div',
        { class: 'atv-parte-cabecalho' },
        h('h4', { class: 'atv-parte-titulo-flex' }, renderizarIcone(parte.id || parte.emoji, { classe: 'atv-parte-icone' }), h('span', {}, tituloParte)),
        h('span', { class: 'atv-parte-count' }, pluralT(ids.length, 'decompor.itemSing', 'decompor.itemPlur')),
      ),
      h(
        'button',
        {
          type: 'button',
          class: `btn btn-sm ${estado.selecionada ? 'btn-primario' : 'btn-neutro'}`,
          'data-foco': `parte-${parte.id}`,
          'aria-label': t('decompor.colocarAria', { parte: tituloParte }),
          disabled: !estado.selecionada || estado.concluida,
          onclick: () => colocar(parte.id),
        },
        t('decompor.colocarAqui'),
      ),
      ids.length
        ? h('ul', {}, ids.map((id) => h('li', {}, cartaoNaColuna(id))))
        : h('p', { class: 'atv-parte-vazia' }, t('decompor.nenhumaTarefa')),
    );
  }

  function arvoreDaDecomposicao() {
    return h(
      'div',
      { class: 'atv-painel' },
      h(ctx.TituloPainel, {}, t('decompor.mapaTitulo')),
      h(
        'ul',
        { class: 'atv-arvore' },
        h(
          'li',
          {},
          h('strong', {}, atvProblema(atividade)),
          h(
            'ul',
            {},
            atividade.partes.map((parte) => h(
              'li',
              {},
              renderizarIcone(parte.id || parte.emoji, { classe: 'icon-xs', fallback: 'folder' }),
              ` ${atvParte(atividade.id, parte)}`,
              h('ul', {}, atividade.tarefas.filter((tarefa) => tarefa.parte === parte.id).map((tarefa) => h('li', {}, atvTarefa(atividade.id, tarefa)))),
            )),
          ),
        ),
        temDescarte
          ? h('li', {}, renderizarIcone('fora', { classe: 'icon-xs' }), ` ${atvDescarte(atividade)}: ${atividade.tarefas.filter((tarefa) => tarefa.parte === 'fora').map((tarefa) => atvTarefa(atividade.id, tarefa)).join('; ')}`)
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
        h('span', { class: 'atv-telemetria-rotulo' }, t('decompor.telemetriaRotulo')),
        h(
          'div',
          { class: 'atv-telemetria-gauge' },
          h('progress', { class: 'atv-telemetria-progress', value: String(alocadas), max: String(totalTarefas), 'aria-label': t('decompor.progressoAria') }),
          h('span', { class: 'atv-telemetria-valor' }, t('decompor.telemetriaOrganizadas', { atual: alocadas, total: totalTarefas })),
        ),
      ),
      h(
        'div',
        { class: 'atv-telemetria-acoes' },
        estado.tentativas > 0
          ? h('span', { class: 'atv-badge-tentativas' }, pluralT(estado.tentativas, 'jog.tentativaSing', 'jog.tentativaPlur'))
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
          h('span', {}, `${t('decompor.problemaPrefixo')} `, h('strong', {}, atvProblema(atividade))),
        ),
        h(
          'div',
          { class: 'atv-painel' },
          h(ctx.TituloPainel, {}, t('decompor.tarefasTitulo')),
          h('p', { class: 'atv-contagem' }, estado.selecionada
            ? t('decompor.selecionadaInstrucao', { texto: texto(estado.selecionada) })
            : t('decompor.instrucaoPadrao')),
          lista.length
            ? h('ul', { class: 'atv-banco' }, lista.map((id) => h('li', {}, cartaoDaLista(id))))
            : h('p', { class: 'atv-vazio' }, t('decompor.todasColocadas')),
        ),
        h('div', { class: 'atv-painel' }, h(ctx.TituloPainel, {}, t('decompor.partesTitulo')), h('div', { class: 'atv-partes' }, colunas.map(coluna))),
        estado.concluida ? arvoreDaDecomposicao() : null,
        h(
          'div',
          { class: 'atv-acoes' },
          h('button', { type: 'button', class: 'btn btn-primario flex-inline-icon', 'data-foco': 'verificar', disabled: estado.concluida, onclick: verificar }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'check'), ` ${t('jog.verificar')}`),
          h('button', { type: 'button', class: 'btn btn-neutro flex-inline-icon', 'data-foco': 'dica', disabled: estado.concluida, onclick: () => { tocarSom('click'); feedback.info(t('jog.dicaTitulo'), atvDica(atividade)); } }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'lightbulb'), ` ${t('jog.queroDica')}`),
          h('button', { type: 'button', class: 'btn btn-neutro flex-inline-icon', 'data-foco': 'recomecar', onclick: recomecar }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'refresh'), ` ${t('jog.recomecar')}`),
        ),
      ],
      foco,
    );
  }

  estado = novoEstado();
  renderizar();
  return h('div', {}, area, feedback.elemento);
}

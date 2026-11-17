/**
 * Jogador de atividades "Montar a sequência": o estudante toca nos passos para colocá-los em ordem.
 * Funciona com toque, mouse e teclado (cada passo é um botão).
 * Aprimorado com telemetria visual, GSAP e sintetizador de som nativo Web Audio API.
 */

import { h, anunciar, criarFeedback, renderizarComFoco } from './dom.js';
import { avaliarOrdem, embaralharDiferente } from './logica.js';
import { tocarSom, criarBotaoSom } from './som.js';
import { renderizarIcone } from './icones.js';
import { t, pluralT, atvConclusao, atvDica, atvPasso } from './traducao.js';

export function jogadorOrdenar(atividade, ctx) {
  const todos = [...atividade.passos, ...(atividade.intrusos || [])];
  const porId = new Map(todos.map((passo) => [passo.id, passo]));
  const idsIntrusos = new Set((atividade.intrusos || []).map((intruso) => intruso.id));
  const feedback = criarFeedback();
  const area = h('div');
  let estado;

  const texto = (id) => atvPasso(atividade.id, porId.get(id));

  function novoEstado() {
    return {
      banco: embaralharDiferente(todos.map((passo) => passo.id)),
      sequencia: [],
      tentativas: 0,
      resultado: null,
      concluida: false,
    };
  }

  function adicionar(id) {
    tocarSom('click');
    const posicao = estado.banco.indexOf(id);
    estado.banco.splice(posicao, 1);
    estado.sequencia.push(id);
    estado.resultado = null;
    const vizinho = estado.banco[posicao] ?? estado.banco[posicao - 1];
    anunciar(t('ordenar.anuncioAdicionado', { texto: texto(id), pos: estado.sequencia.length }));
    renderizar(vizinho ? `banco-${vizinho}` : 'verificar');

    if (typeof window !== 'undefined' && window.gsap) {
      const items = area.querySelectorAll('.atv-item');
      if (items.length) {
        window.gsap.from(items[items.length - 1], { scale: 0.92, opacity: 0.7, duration: 0.2 });
      }
    }
  }

  function remover(id) {
    tocarSom('click');
    estado.sequencia.splice(estado.sequencia.indexOf(id), 1);
    estado.banco.push(id);
    estado.resultado = null;
    anunciar(t('ordenar.anuncioRemovido', { texto: texto(id) }));
    renderizar(`banco-${id}`);
  }

  function mover(id, deslocamento) {
    const de = estado.sequencia.indexOf(id);
    const para = de + deslocamento;
    if (para < 0 || para >= estado.sequencia.length) return;
    tocarSom('mover');
    [estado.sequencia[de], estado.sequencia[para]] = [estado.sequencia[para], estado.sequencia[de]];
    estado.resultado = null;
    anunciar(t('ordenar.anuncioMovido', { texto: texto(id), pos: para + 1 }));
    renderizar([`${deslocamento < 0 ? 'sobe' : 'desce'}-${id}`, `${deslocamento < 0 ? 'desce' : 'sobe'}-${id}`, `remover-${id}`]);
  }

  function verificar() {
    const resposta = avaliarOrdem(atividade, estado.sequencia);
    estado.tentativas += 1;
    estado.resultado = resposta;

    if (resposta.ok) {
      estado.concluida = true;
      tocarSom('vitoria');
      feedback.sucesso(t('ordenar.sucessoTitulo'), atvConclusao(atividade));
      renderizar('recomecar');

      if (typeof window !== 'undefined' && window.gsap) {
        const seqEl = area.querySelector('.atv-sequencia');
        if (seqEl) {
          window.gsap.fromTo(seqEl, { scale: 0.96 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' });
        }
      }

      ctx.aoConcluir({ tentativas: estado.tentativas });
      return;
    }

    tocarSom('erro');
    if (typeof window !== 'undefined' && window.gsap) {
      window.gsap.to(area, { x: -6, repeat: 4, yoyo: true, duration: 0.05, clearProps: 'x' });
    }

    const mensagens = [];
    if (resposta.intrusos.length === 1) {
      mensagens.push(t('ordenar.erroIntrusoSing', { passo: texto(resposta.intrusos[0]) }));
    } else if (resposta.intrusos.length > 1) {
      const nomes = resposta.intrusos.map((id) => `“${texto(id)}”`).join(', ');
      mensagens.push(t('ordenar.erroIntrusoPlur', { passos: nomes }));
    }
    if (resposta.faltando.length) {
      mensagens.push(pluralT(resposta.faltando.length, 'ordenar.erroFaltandoSing', 'ordenar.erroFaltandoPlur'));
    }
    if (resposta.foraDoLugar.length) {
      mensagens.push(pluralT(resposta.foraDoLugar.length, 'ordenar.erroForaSing', 'ordenar.erroForaPlur'));
    }

    const quaseLa = resposta.foraDoLugar.length > 0 && !resposta.intrusos.length && !resposta.faltando.length;
    feedback.erro(
      quaseLa ? t('ordenar.quaseLa') : t('ordenar.aindaNao'),
      mensagens.join(' '),
      estado.tentativas >= 2 ? ` ${t('jog.dicaPrefixo', { dica: atvDica(atividade) })}` : '',
    );
    renderizar('verificar');
  }

  function recomecar() {
    tocarSom('click');
    estado = novoEstado();
    feedback.limpar();
    anunciar(t('jog.anuncioReiniciada'));
    renderizar(`banco-${estado.banco[0]}`);
  }

  function botaoPasso(id) {
    const passo = porId.get(id);
    return h(
      'button',
      { type: 'button', class: 'atv-passo', 'data-foco': `banco-${id}`, disabled: estado.concluida, onclick: () => adicionar(id) },
      renderizarIcone(passo.id || passo.emoji, { classe: 'atv-passo-icone' }),
      texto(id),
    );
  }

  function itemSequencia(id, indice) {
    const passo = porId.get(id);
    const passoTexto = texto(id);
    const resultado = estado.resultado;
    let classe = 'atv-item';
    let marca = null;

    if (resultado) {
      if (idsIntrusos.has(id)) {
        classe += ' atv-intruso';
        marca = h('span', { class: 'atv-marca flex-inline-icon' }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'close'), ` ${t('ordenar.marcaIntruso')}`);
      } else if (resultado.foraDoLugar.includes(id)) {
        classe += ' atv-fora';
        marca = h('span', { class: 'atv-marca flex-inline-icon' }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'warning'), ` ${t('ordenar.marcaFora')}`);
      } else {
        classe += ' atv-certo';
        marca = h('span', { class: 'atv-marca flex-inline-icon' }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'check_circle'), ` ${t('ordenar.marcaCerto')}`);
      }
    }

    const controles = estado.concluida ? null : h(
      'span',
      { class: 'atv-item-controles' },
      h('button', { type: 'button', class: 'atv-controle', 'data-foco': `sobe-${id}`, 'aria-label': t('ordenar.moverCimaAria', { texto: passoTexto }), disabled: indice === 0, onclick: () => mover(id, -1) }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_upward')),
      h('button', { type: 'button', class: 'atv-controle', 'data-foco': `desce-${id}`, 'aria-label': t('ordenar.moverBaixoAria', { texto: passoTexto }), disabled: indice === estado.sequencia.length - 1, onclick: () => mover(id, 1) }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_downward')),
      h('button', { type: 'button', class: 'atv-controle', 'data-foco': `remover-${id}`, 'aria-label': t('ordenar.removerAria', { texto: passoTexto }), onclick: () => remover(id) }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'close')),
    );

    return h(
      'li',
      { class: classe },
      h(
        'span',
        { class: 'atv-item-texto' },
        renderizarIcone(passo.id || passo.emoji, { classe: 'atv-item-icone' }),
        h('strong', { class: 'atv-item-pos' }, `${indice + 1}. `),
        passoTexto,
        marca,
      ),
      controles,
    );
  }

  function barraTelemetria() {
    const totalEsperado = atividade.passos.length;
    const atual = estado.sequencia.length;
    return h(
      'div',
      { class: 'atv-telemetria-bar' },
      h(
        'div',
        { class: 'atv-telemetria-col' },
        h('span', { class: 'atv-telemetria-rotulo' }, t('ordenar.telemetriaRotulo')),
        h(
          'div',
          { class: 'atv-telemetria-gauge' },
          h('progress', { class: 'atv-telemetria-progress', value: String(atual), max: String(totalEsperado), 'aria-label': t('ordenar.progressoAria') }),
          h('span', { class: 'atv-telemetria-valor' }, t('ordenar.telemetriaPassos', { atual, total: totalEsperado })),
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
    const conteudoBanco = estado.banco.length
      ? h('ul', { class: 'atv-banco' }, estado.banco.map((id) => h('li', {}, botaoPasso(id))))
      : h('p', { class: 'atv-vazio' }, t('ordenar.todosUsados'));
    const tituloPainelBanco = estado.concluida ? t('ordenar.ficaramFora') : t('ordenar.passosDisponiveis');
    let painelBanco = null;
    if (!estado.concluida || estado.banco.length) {
      painelBanco = h(
        'div',
        { class: 'atv-painel' },
        h(ctx.TituloPainel, {}, tituloPainelBanco),
        conteudoBanco,
      );
    }

    renderizarComFoco(
      area,
      () => [
        barraTelemetria(),
        painelBanco,
        h(
          'div',
          { class: 'atv-painel' },
          h(ctx.TituloPainel, {}, t('ordenar.meuAlgoritmo')),
          estado.sequencia.length
            ? h('ol', { class: 'atv-sequencia' }, estado.sequencia.map(itemSequencia))
            : h('p', { class: 'atv-vazio' }, t('ordenar.vazioInstrucao')),
        ),
        h(
          'div',
          { class: 'atv-acoes' },
          h('button', { type: 'button', class: 'btn btn-primario flex-inline-icon', 'data-foco': 'verificar', disabled: estado.concluida || !estado.sequencia.length, onclick: verificar }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'check'), ` ${t('jog.verificar')}`),
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

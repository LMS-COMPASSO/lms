/**
 * Jogador de atividades "Montar a sequência": o estudante toca nos passos para colocá-los em ordem.
 * Funciona com toque, mouse e teclado (cada passo é um botão).
 */

import { h, anunciar, criarFeedback, renderizarComFoco } from './dom.js';
import { avaliarOrdem, embaralharDiferente, plural } from './logica.js';

export function jogadorOrdenar(atividade, ctx) {
  const todos = [...atividade.passos, ...(atividade.intrusos || [])];
  const porId = new Map(todos.map((passo) => [passo.id, passo]));
  const idsIntrusos = new Set((atividade.intrusos || []).map((intruso) => intruso.id));
  const feedback = criarFeedback();
  const area = h('div');
  let estado;

  const texto = (id) => porId.get(id).texto;

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
    const posicao = estado.banco.indexOf(id);
    estado.banco.splice(posicao, 1);
    estado.sequencia.push(id);
    estado.resultado = null;
    const vizinho = estado.banco[posicao] ?? estado.banco[posicao - 1];
    anunciar(`Passo “${texto(id)}” colocado na posição ${estado.sequencia.length}.`);
    renderizar(vizinho ? `banco-${vizinho}` : 'verificar');
  }

  function remover(id) {
    estado.sequencia.splice(estado.sequencia.indexOf(id), 1);
    estado.banco.push(id);
    estado.resultado = null;
    anunciar(`Passo “${texto(id)}” devolvido aos passos disponíveis.`);
    renderizar(`banco-${id}`);
  }

  function mover(id, deslocamento) {
    const de = estado.sequencia.indexOf(id);
    const para = de + deslocamento;
    if (para < 0 || para >= estado.sequencia.length) return;
    [estado.sequencia[de], estado.sequencia[para]] = [estado.sequencia[para], estado.sequencia[de]];
    estado.resultado = null;
    anunciar(`Passo “${texto(id)}” agora está na posição ${para + 1}.`);
    renderizar([`${deslocamento < 0 ? 'sobe' : 'desce'}-${id}`, `${deslocamento < 0 ? 'desce' : 'sobe'}-${id}`, `remover-${id}`]);
  }

  function verificar() {
    const resposta = avaliarOrdem(atividade, estado.sequencia);
    estado.tentativas += 1;
    estado.resultado = resposta;

    if (resposta.ok) {
      estado.concluida = true;
      feedback.sucesso('Algoritmo correto! 🎉', atividade.conclusao);
      renderizar('recomecar');
      ctx.aoConcluir({ tentativas: estado.tentativas });
      return;
    }

    const mensagens = [];
    if (resposta.intrusos.length === 1) {
      mensagens.push(`O passo “${texto(resposta.intrusos[0])}” não faz parte deste algoritmo. Devolva-o aos passos disponíveis.`);
    } else if (resposta.intrusos.length > 1) {
      const nomes = resposta.intrusos.map((id) => `“${texto(id)}”`).join(', ');
      mensagens.push(`Os passos ${nomes} não fazem parte deste algoritmo. Devolva-os aos passos disponíveis.`);
    }
    if (resposta.faltando.length) {
      mensagens.push(`Faltam ${plural(resposta.faltando.length, 'passo', 'passos')} no seu algoritmo.`);
    }
    if (resposta.foraDoLugar.length) {
      const marcados = resposta.foraDoLugar.length === 1 ? 'marcado' : 'marcados';
      mensagens.push(`${plural(resposta.foraDoLugar.length, 'passo está', 'passos estão')} fora do lugar (${marcados} com ⚠). Troque a ordem e verifique de novo.`);
    }

    const quaseLa = resposta.foraDoLugar.length > 0 && !resposta.intrusos.length && !resposta.faltando.length;
    feedback.erro(
      quaseLa ? 'Quase lá!' : 'Ainda não é o algoritmo certo',
      mensagens.join(' '),
      estado.tentativas >= 2 ? ` Dica: ${atividade.dica}` : '',
    );
    renderizar('verificar');
  }

  function recomecar() {
    estado = novoEstado();
    feedback.limpar();
    anunciar('Atividade reiniciada.');
    renderizar(`banco-${estado.banco[0]}`);
  }

  function botaoPasso(id) {
    const passo = porId.get(id);
    return h(
      'button',
      { type: 'button', class: 'atv-passo', 'data-foco': `banco-${id}`, disabled: estado.concluida, onclick: () => adicionar(id) },
      h('span', { class: 'atv-emoji', 'aria-hidden': 'true' }, passo.emoji),
      passo.texto,
    );
  }

  function itemSequencia(id, indice) {
    const passo = porId.get(id);
    const resultado = estado.resultado;
    let classe = 'atv-item';
    let marca = null;

    // As marcas usam texto e símbolo, não apenas cor.
    if (resultado) {
      if (idsIntrusos.has(id)) {
        classe += ' atv-intruso';
        marca = h('span', { class: 'atv-marca flex-inline-icon' }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'close'), ' Não faz parte');
      } else if (resultado.foraDoLugar.includes(id)) {
        classe += ' atv-fora';
        marca = h('span', { class: 'atv-marca flex-inline-icon' }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'warning'), ' Fora do lugar');
      } else {
        classe += ' atv-certo';
        marca = h('span', { class: 'atv-marca flex-inline-icon' }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'check_circle'), ' No lugar');
      }
    }

    const controles = estado.concluida ? null : h(
      'span',
      { class: 'atv-item-controles' },
      h('button', { type: 'button', class: 'atv-controle', 'data-foco': `sobe-${id}`, 'aria-label': `Mover para cima: ${passo.texto}`, disabled: indice === 0, onclick: () => mover(id, -1) }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_upward')),
      h('button', { type: 'button', class: 'atv-controle', 'data-foco': `desce-${id}`, 'aria-label': `Mover para baixo: ${passo.texto}`, disabled: indice === estado.sequencia.length - 1, onclick: () => mover(id, 1) }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'arrow_downward')),
      h('button', { type: 'button', class: 'atv-controle', 'data-foco': `remover-${id}`, 'aria-label': `Remover: ${passo.texto}`, onclick: () => remover(id) }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'close')),
    );

    return h(
      'li',
      { class: classe },
      h(
        'span',
        { class: 'atv-item-texto' },
        h('span', { class: 'atv-emoji', 'aria-hidden': 'true' }, passo.emoji),
        passo.texto,
        marca,
      ),
      controles,
    );
  }

  function renderizar(foco = null) {
    renderizarComFoco(
      area,
      () => [
        estado.concluida && !estado.banco.length ? null : h(
          'div',
          { class: 'atv-painel' },
          h(ctx.TituloPainel, {}, estado.concluida ? 'Ficaram de fora (e estava certo!)' : 'Passos disponíveis'),
          estado.banco.length
            ? h('ul', { class: 'atv-banco' }, estado.banco.map((id) => h('li', {}, botaoPasso(id))))
            : h('p', { class: 'atv-vazio' }, 'Você já usou todos os passos. Confira o seu algoritmo e toque em Verificar.'),
        ),
        h(
          'div',
          { class: 'atv-painel' },
          h(ctx.TituloPainel, {}, 'Meu algoritmo'),
          estado.sequencia.length
            ? h('ol', { class: 'atv-sequencia' }, estado.sequencia.map(itemSequencia))
            : h('p', { class: 'atv-vazio' }, 'Toque em um passo para começar a montar o algoritmo.'),
        ),
        h(
          'div',
          { class: 'atv-acoes' },
          h('button', { type: 'button', class: 'btn btn-primario flex-inline-icon', 'data-foco': 'verificar', disabled: estado.concluida || !estado.sequencia.length, onclick: verificar }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'check'), ' Verificar'),
          h('button', { type: 'button', class: 'btn btn-neutro flex-inline-icon', 'data-foco': 'dica', disabled: estado.concluida, onclick: () => feedback.info('Dica', atividade.dica) }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'lightbulb'), ' Quero uma dica'),
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

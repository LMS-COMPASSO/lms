/**
 * Jogador de atividades "Programar o robô": o estudante monta uma lista de comandos e executa o programa.
 * O robô anda um quadrado por comando; erros mostram qual comando causou o problema (depuração).
 */

import { h, anunciar, criarFeedback, renderizarComFoco } from './dom.js';
import {
  DIRECOES,
  calcularEstrelas,
  executarPrograma,
  lerMapa,
  menorPrograma,
  plural,
} from './logica.js';

const INTERVALO_ANIMACAO_MS = 450;

export function jogadorRobo(atividade, ctx) {
  const mapa = lerMapa(atividade.grade);
  const minimo = menorPrograma(mapa).length;
  const tema = atividade.tema;
  const feedback = criarFeedback();
  const area = h('div');
  let estado;
  let temporizador = null;

  function novoEstado() {
    return { programa: [], execucao: null, passo: 0, animando: false, tentativas: 0, concluida: false };
  }

  function parar() {
    if (temporizador) {
      clearInterval(temporizador);
      temporizador = null;
    }
    estado.animando = false;
  }

  // Qualquer mudança no programa invalida a execução anterior.
  function editar(acao) {
    parar();
    estado.execucao = null;
    estado.passo = 0;
    feedback.limpar();
    acao();
  }

  function adicionar(direcao) {
    if (estado.programa.length >= atividade.limite) return;
    editar(() => estado.programa.push(direcao));
    anunciar(`Comando ${estado.programa.length}: ${DIRECOES[direcao].nome}.`);
    renderizar(`dir-${direcao}`);
  }

  function removerComando(indice) {
    editar(() => estado.programa.splice(indice, 1));
    anunciar(`Comando ${indice + 1} removido.`);
    renderizar([`cmd-${Math.min(indice, estado.programa.length - 1)}`, 'dir-cima']);
  }

  function desfazer() {
    editar(() => estado.programa.pop());
    anunciar('Último comando removido.');
    renderizar(['desfazer', 'dir-cima']);
  }

  function limpar() {
    editar(() => { estado.programa = []; });
    anunciar('Programa apagado.');
    renderizar('dir-cima');
  }

  function recomecar() {
    parar();
    estado = novoEstado();
    feedback.limpar();
    anunciar('Atividade reiniciada.');
    renderizar('dir-cima');
  }

  function finalizar() {
    const execucao = estado.execucao;
    const total = estado.programa.length;
    const dica = estado.tentativas >= 2 ? ` Dica: ${atividade.dica}` : '';

    if (execucao.resultado === 'sucesso') {
      const estrelas = calcularEstrelas(total, minimo);
      estado.concluida = true;
      feedback.sucesso(
        'Missão cumprida! 🎉',
        h('span', { class: 'atv-estrelas', role: 'img', 'aria-label': `${estrelas} de 3 estrelas` }, '⭐'.repeat(estrelas) + '☆'.repeat(3 - estrelas)),
        ` Seu programa tem ${plural(total, 'comando', 'comandos')}; o menor possível tem ${minimo}. ${atividade.conclusao}`,
      );
      ctx.aoConcluir({ tentativas: estado.tentativas, estrelas });
    } else if (execucao.resultado === 'faltou-item') {
      feedback.erro('Quase lá!', `${tema.faltouItem} Altere o programa para passar por todos os lugares antes do destino.${dica}`);
    } else if (execucao.resultado === 'bateu-obstaculo') {
      feedback.erro('O robô bateu!', `No comando ${execucao.passoComErro + 1}, o robô esbarrou em ${tema.nomeObstaculo}. Procure o comando com erro, corrija e execute de novo.${dica}`);
    } else if (execucao.resultado === 'bateu-borda') {
      feedback.erro('O robô tentou sair do mapa!', `No comando ${execucao.passoComErro + 1}, o robô chegou à borda do mapa. Corrija esse comando e execute de novo.${dica}`);
    } else {
      feedback.erro('O robô ainda não chegou', `O programa terminou antes de o robô chegar a ${tema.nomeMeta}. Que comandos estão faltando?${dica}`);
    }
  }

  function executar() {
    if (estado.animando) {
      parar();
      renderizar('executar');
      return;
    }
    if (!estado.programa.length) {
      feedback.info('O programa está vazio', 'Toque nos botões de direção para adicionar comandos antes de executar.');
      return;
    }

    feedback.limpar();
    estado.execucao = executarPrograma(mapa, estado.programa);
    estado.passo = 0;
    estado.tentativas += 1;
    const ultimo = estado.execucao.trilha.length - 1;

    if (ctx.reduzirMovimento) {
      estado.passo = ultimo;
      finalizar();
      renderizar('executar');
      return;
    }

    estado.animando = true;
    anunciar('Executando o programa.');
    renderizar('executar');
    temporizador = setInterval(() => {
      estado.passo += 1;
      if (estado.passo >= ultimo) {
        estado.passo = ultimo;
        parar();
        finalizar();
      }
      renderizar('executar');
    }, INTERVALO_ANIMACAO_MS);
  }

  function passoAPasso() {
    if (estado.animando) return;
    if (!estado.programa.length) {
      feedback.info('O programa está vazio', 'Toque nos botões de direção para adicionar comandos antes de executar.');
      return;
    }
    if (!estado.execucao) {
      estado.execucao = executarPrograma(mapa, estado.programa);
      estado.passo = 0;
      feedback.limpar();
    }

    const ultimo = estado.execucao.trilha.length - 1;
    if (estado.passo >= ultimo) {
      estado.passo = 0;
      feedback.limpar();
    }
    estado.passo += 1;

    const ponto = estado.execucao.trilha[estado.passo];
    anunciar(`Comando ${estado.passo}: ${DIRECOES[estado.programa[estado.passo - 1]].nome}. Robô na coluna ${ponto.x + 1}, linha ${ponto.y + 1}.`);
    if (estado.passo === ultimo) {
      estado.tentativas += 1;
      finalizar();
    }
    renderizar('passo');
  }

  function posicaoAtual() {
    return estado.execucao ? estado.execucao.trilha[estado.passo] : { ...mapa.inicio, evento: 'inicio' };
  }

  function descricaoDoMapa(posicao) {
    const obstaculos = [...mapa.obstaculos].map((chave) => {
      const [x, y] = chave.split(',').map(Number);
      return `coluna ${x + 1}, linha ${y + 1}`;
    });
    const partes = [
      `Mapa com ${plural(mapa.largura, 'coluna', 'colunas')} e ${plural(mapa.altura, 'linha', 'linhas')}.`,
      `Robô na coluna ${posicao.x + 1}, linha ${posicao.y + 1}.`,
      `Destino (${tema.nomeMeta}) na coluna ${mapa.meta.x + 1}, linha ${mapa.meta.y + 1}.`,
    ];
    if (mapa.itens.length) {
      partes.push(`Lugares para passar (${tema.nomeItem}): ${mapa.itens.map((item) => `coluna ${item.x + 1}, linha ${item.y + 1}`).join('; ')}.`);
    }
    if (obstaculos.length) partes.push(`Obstáculos: ${obstaculos.join('; ')}.`);
    return partes.join(' ');
  }

  function renderMapa() {
    const posicao = posicaoAtual();
    const trilha = estado.execucao ? estado.execucao.trilha.slice(0, estado.passo + 1) : [];
    const visitadas = new Set(trilha.map((ponto) => `${ponto.x},${ponto.y}`));
    const coletados = new Set(trilha.filter((ponto) => ponto.evento === 'coletar').map((ponto) => `${ponto.x},${ponto.y}`));

    // Célula atingida na batida: a vizinha da posição atual, na direção do comando que falhou.
    let celulaBatida = null;
    if (posicao.evento === 'obstaculo') {
      const direcao = DIRECOES[estado.programa[posicao.indice]];
      celulaBatida = `${posicao.x + direcao.dx},${posicao.y + direcao.dy}`;
    }

    const celulas = [];
    for (let y = 0; y < mapa.altura; y += 1) {
      for (let x = 0; x < mapa.largura; x += 1) {
        const chave = `${x},${y}`;
        const classes = ['atv-celula'];
        let conteudo = '';

        if (x === posicao.x && y === posicao.y) conteudo = tema.robo;
        else if (mapa.obstaculos.has(chave)) conteudo = tema.obstaculo;
        else if (x === mapa.meta.x && y === mapa.meta.y) conteudo = tema.meta;
        else if (mapa.itens.some((item) => item.x === x && item.y === y) && !coletados.has(chave)) conteudo = tema.item;

        if (mapa.obstaculos.has(chave)) classes.push('obstaculo');
        if (x === mapa.meta.x && y === mapa.meta.y) classes.push('meta');
        if (x === mapa.inicio.x && y === mapa.inicio.y) classes.push('inicio');
        if (visitadas.has(chave) && !(x === posicao.x && y === posicao.y)) classes.push('visitada');
        if (chave === celulaBatida || (posicao.evento === 'borda' && x === posicao.x && y === posicao.y)) classes.push('batida');

        celulas.push(h('div', { class: classes.join(' '), 'aria-hidden': 'true' }, conteudo));
      }
    }

    return h(
      'div',
      {},
      h('div', { class: 'atv-mapa', style: `--colunas:${mapa.largura}`, role: 'img', 'aria-label': descricaoDoMapa(posicao) }, celulas),
      h(
        'p',
        { class: 'atv-legenda' },
        `${tema.robo} robô · ${tema.meta} ${tema.nomeMeta.replace(/^(a|o) /, '')}`,
        tema.item ? ` · ${tema.item} ${tema.nomeItem.replace(/^(a|o|as|os) /, '')}` : '',
        ` · ${tema.obstaculo} ${tema.nomeObstaculo.replace(/^(uma?) /, '')}`,
      ),
    );
  }

  function renderPrograma() {
    const execucao = estado.execucao;
    const atual = execucao ? estado.passo - 1 : -1;
    const noLimite = estado.programa.length >= atividade.limite;
    const bloqueado = estado.animando || estado.concluida;

    return h(
      'div',
      {},
      h(ctx.TituloPainel, {}, 'Meu programa'),
      h('p', { class: 'atv-contagem' }, `${estado.programa.length} de ${atividade.limite} comandos. Toque em um comando para removê-lo.`),
      estado.programa.length
        ? h(
          'ol',
          { class: 'atv-programa' },
          estado.programa.map((direcao, indice) => {
            let classe = 'atv-comando';
            if (indice === atual && estado.animando) classe += ' atual';
            if (execucao && execucao.passoComErro === indice && estado.passo >= indice + 1) classe += ' erro';
            return h(
              'li',
              {},
              h(
                'button',
                {
                  type: 'button',
                  class: classe,
                  'data-foco': `cmd-${indice}`,
                  'aria-label': `Comando ${indice + 1}: ${DIRECOES[direcao].nome}. Toque para remover.`,
                  disabled: bloqueado,
                  onclick: () => removerComando(indice),
                },
                h('small', { 'aria-hidden': 'true' }, indice + 1),
                DIRECOES[direcao].simbolo,
              ),
            );
          }),
        )
        : h('p', { class: 'atv-vazio' }, 'Nenhum comando ainda. Use os botões abaixo.'),
      h(
        'div',
        { class: 'atv-paleta', role: 'group', 'aria-label': 'Comandos de direção' },
        Object.entries(DIRECOES).map(([nome, direcao]) => h(
          'button',
          { type: 'button', class: 'atv-direcao', 'data-foco': `dir-${nome}`, disabled: bloqueado || noLimite, onclick: () => adicionar(nome) },
          h('span', { 'aria-hidden': 'true' }, direcao.simbolo),
          h('span', {}, direcao.nome),
        )),
      ),
      h(
        'div',
        { class: 'atv-acoes' },
        h(
          'button',
          { type: 'button', class: 'btn btn-primario flex-inline-icon', 'data-foco': 'executar', onclick: executar },
          h('span', { class: 'material-symbols-outlined icon-xs' }, estado.animando ? 'stop' : 'play_arrow'),
          estado.animando ? ' Parar' : ' Executar',
        ),
        h(
          'button',
          { type: 'button', class: 'btn btn-neutro flex-inline-icon', 'data-foco': 'passo', disabled: estado.animando, onclick: passoAPasso },
          h('span', { class: 'material-symbols-outlined icon-xs' }, 'skip_next'),
          ' Passo a passo',
        ),
        h(
          'button',
          { type: 'button', class: 'btn btn-neutro flex-inline-icon', 'data-foco': 'desfazer', disabled: bloqueado || !estado.programa.length, onclick: desfazer },
          h('span', { class: 'material-symbols-outlined icon-xs' }, 'undo'),
          ' Desfazer',
        ),
        h(
          'button',
          { type: 'button', class: 'btn btn-neutro flex-inline-icon', 'data-foco': 'limpar', disabled: bloqueado || !estado.programa.length, onclick: limpar },
          h('span', { class: 'material-symbols-outlined icon-xs' }, 'delete'),
          ' Limpar',
        ),
        h(
          'button',
          { type: 'button', class: 'btn btn-neutro flex-inline-icon', 'data-foco': 'recomecar', onclick: recomecar },
          h('span', { class: 'material-symbols-outlined icon-xs' }, 'refresh'),
          ' Recomeçar',
        ),
      ),
    );
  }

  function renderizar(foco = null) {
    renderizarComFoco(
      area,
      () => [
        h('div', { class: 'atv-painel' }, h('div', { class: 'atv-robo' }, renderMapa(), renderPrograma())),
        h('div', { class: 'atv-acoes' }, h('button', { type: 'button', class: 'btn btn-neutro', 'data-foco': 'dica', onclick: () => feedback.info('Dica', atividade.dica) }, 'Quero uma dica')),
      ],
      foco,
    );
  }

  estado = novoEstado();
  renderizar();
  return h('div', {}, area, feedback.elemento);
}

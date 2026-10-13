/**
 * ============================================================================
 * LMS COMPASSO - JOGADOR DINÂMICO DE ATIVIDADES DE ROBÓTICA E ALGORITMOS
 * ============================================================================
 * Inspirado nos conceitos visuais e de design interativo do Wishlabs e animações
 * com GSAP (GreenSock). Incorpora mecânicas e conceitos de programação de jogos:
 * - Sistema de Missões e Fases Progressivas (Fase 1, Fase 2, Fase 3)
 * - HUD de Telemetria em Tempo Real (Coordenadas, Bússola/Orientação, Bateria)
 * - Efeitos Sonoros Sintetizados Nativos via Web Audio API (zero dependências)
 * - Animação Fluida de Translação, Giro e Easing com GSAP
 * - Rastro de Luz Neon (Breadcrumbs) e Efeitos de Impacto (Screen Shake & Glitch)
 * - Console de Telemetria / Terminal de Depuração ao Vivo
 * - Controles Táteis Arcade (Gamepad D-Pad e Atalhos de Teclado WASD / Setas)
 * ============================================================================
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

// Mapeamento de ângulos de rotação em graus por direção
const ANGULOS_DIRECAO = {
  cima: 0,
  direita: 90,
  baixo: 180,
  esquerda: 270,
};

// Símbolos de bússola para a telemetria do HUD
const BUSSOLA_SIMBOLOS = {
  cima: '▲ NORTE',
  direita: '► LESTE',
  baixo: '▼ SUL',
  esquerda: '◄ OESTE',
};

// Sistema de Áudio Sintetizado Nativo (Web Audio API)
let audioCtx = null;
let somHabilitado = true;

function tocarSom(tipo) {
  if (!somHabilitado || typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const agora = audioCtx.currentTime;

    if (tipo === 'passo') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, agora);
      osc.frequency.exponentialRampToValueAtTime(160, agora + 0.08);
      gain.gain.setValueAtTime(0.08, agora);
      gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(agora);
      osc.stop(agora + 0.08);
    } else if (tipo === 'giro') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, agora);
      osc.frequency.exponentialRampToValueAtTime(660, agora + 0.07);
      gain.gain.setValueAtTime(0.06, agora);
      gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.07);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(agora);
      osc.stop(agora + 0.07);
    } else if (tipo === 'item') {
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, agora + idx * 0.07);
        gain.gain.setValueAtTime(0.12, agora + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, agora + idx * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(agora + idx * 0.07);
        osc.stop(agora + idx * 0.07 + 0.25);
      });
    } else if (tipo === 'erro') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, agora);
      osc.frequency.linearRampToValueAtTime(60, agora + 0.25);
      gain.gain.setValueAtTime(0.18, agora);
      gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(agora);
      osc.stop(agora + 0.25);
    } else if (tipo === 'vitoria') {
      [261.63, 329.63, 392.00, 523.25, 659.25].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, agora + idx * 0.09);
        gain.gain.setValueAtTime(0.14, agora + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, agora + idx * 0.09 + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(agora + idx * 0.09);
        osc.stop(agora + idx * 0.09 + 0.3);
      });
    } else if (tipo === 'click') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, agora);
      gain.gain.setValueAtTime(0.04, agora);
      gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(agora);
      osc.stop(agora + 0.04);
    }
  } catch {}
}

export function jogadorRobo(atividade, ctx) {
  // Lista de fases da atividade (suporta tanto atividades multi-missão quanto canônicas)
  const listaFases = atividade.fases && atividade.fases.length
    ? atividade.fases
    : [
      {
        id: 1,
        nome: atividade.titulo,
        tag: 'Canônica',
        descricao: atividade.resumo,
        grade: atividade.grade,
        limite: atividade.limite,
        bateriaMax: atividade.limite,
        tema: atividade.tema,
      },
    ];

  let faseIndex = 0;
  let faseAtual = listaFases[faseIndex];
  let mapa = lerMapa(faseAtual.grade);
  let minimo = menorPrograma(mapa).length;
  let tema = faseAtual.tema || atividade.tema;
  const feedback = criarFeedback();
  const area = h('div');
  const fasesCompletas = new Set();

  let estado;
  let temporizador = null;
  let velocidade = 1; // 1 = 400ms, 2 = 220ms, 4 = 110ms
  let logsTerminal = [];

  function adicionarLog(texto) {
    const hora = new Date().toTimeString().split(' ')[0];
    logsTerminal.unshift(`[${hora}] ${texto}`);
    if (logsTerminal.length > 20) logsTerminal.pop();
  }

  function carregarFase(indice) {
    parar();
    faseIndex = indice;
    faseAtual = listaFases[faseIndex];
    mapa = lerMapa(faseAtual.grade);
    minimo = menorPrograma(mapa).length;
    tema = faseAtual.tema || atividade.tema;
    estado = novoEstado();
    feedback.limpar();
    adicionarLog(`Missão iniciada: ${faseAtual.nome} (Grade ${mapa.largura}x${mapa.altura})`);
    anunciar(`Carregada ${faseAtual.nome}`);
    renderizar();
  }

  function novoEstado() {
    return {
      programa: [],
      execucao: null,
      passo: 0,
      animando: false,
      tentativas: 0,
      concluida: false,
      direcaoRobo: 'direita',
      anguloRobo: 90,
      bateria: faseAtual.bateriaMax || faseAtual.limite,
    };
  }

  function parar() {
    if (temporizador) {
      clearInterval(temporizador);
      temporizador = null;
    }
    estado.animando = false;
  }

  function editar(acao) {
    parar();
    estado.execucao = null;
    estado.passo = 0;
    estado.direcaoRobo = 'direita';
    estado.anguloRobo = 90;
    estado.bateria = faseAtual.bateriaMax || faseAtual.limite;
    feedback.limpar();
    acao();
  }

  function adicionar(direcao) {
    if (estado.programa.length >= faseAtual.limite) {
      anunciar('Limite de comandos atingido para esta missão.');
      tocarSom('erro');
      return;
    }
    tocarSom('click');
    editar(() => estado.programa.push(direcao));
    adicionarLog(`Comando adicionado: ${DIRECOES[direcao].nome.toUpperCase()}`);
    anunciar(`Comando ${estado.programa.length}: ${DIRECOES[direcao].nome}.`);
    renderizar(`dir-${direcao}`);
  }

  function removerComando(indice) {
    tocarSom('click');
    const cmdRemovido = estado.programa[indice];
    editar(() => estado.programa.splice(indice, 1));
    adicionarLog(`Comando ${indice + 1} (${DIRECOES[cmdRemovido]?.nome}) removido.`);
    anunciar(`Comando ${indice + 1} removido.`);
    renderizar([`cmd-${Math.min(indice, estado.programa.length - 1)}`, 'dir-cima']);
  }

  function desfazer() {
    if (!estado.programa.length) return;
    tocarSom('click');
    editar(() => estado.programa.pop());
    adicionarLog('Último comando desfeito.');
    anunciar('Último comando removido.');
    renderizar(['desfazer', 'dir-cima']);
  }

  function limpar() {
    if (!estado.programa.length) return;
    tocarSom('click');
    editar(() => { estado.programa = []; });
    adicionarLog('Programa resetado.');
    anunciar('Programa apagado.');
    renderizar('dir-cima');
  }

  function recomecar() {
    tocarSom('click');
    parar();
    estado = novoEstado();
    feedback.limpar();
    adicionarLog('Simulação reiniciada na posição de origem.');
    anunciar('Atividade reiniciada.');
    renderizar('dir-cima');
  }

  function alternarSom() {
    somHabilitado = !somHabilitado;
    if (somHabilitado) tocarSom('click');
    renderizar();
  }

  function alternarVelocidade() {
    if (velocidade === 1) velocidade = 2;
    else if (velocidade === 2) velocidade = 4;
    else velocidade = 1;
    tocarSom('click');
    adicionarLog(`Velocidade ajustada para ${velocidade}x.`);
    renderizar();
  }

  function animarPassoGSAP(ponto, passoIndex, passoTotal) {
    if (typeof window === 'undefined') return;

    // Atualiza direção do robô com base na diferença de posição
    if (passoIndex > 0 && estado.execucao) {
      const pontoAnterior = estado.execucao.trilha[passoIndex - 1];
      let dir = estado.direcaoRobo;
      if (ponto.x > pontoAnterior.x) dir = 'direita';
      else if (ponto.x < pontoAnterior.x) dir = 'esquerda';
      else if (ponto.y > pontoAnterior.y) dir = 'baixo';
      else if (ponto.y < pontoAnterior.y) dir = 'cima';

      estado.direcaoRobo = dir;
      estado.anguloRobo = ANGULOS_DIRECAO[dir] ?? 90;
    }

    // Consome 1 unidade de bateria a cada movimento
    if (passoIndex > 0) {
      estado.bateria = Math.max(0, (faseAtual.bateriaMax || faseAtual.limite) - passoIndex);
    }

    if (ponto.evento === 'coletar') {
      tocarSom('item');
      adicionarLog(`★ Item coletado em [${ponto.x + 1}, ${ponto.y + 1}]!`);
    } else if (ponto.evento === 'obstaculo' || ponto.evento === 'borda') {
      tocarSom('erro');
      adicionarLog(`✖ Falha: Robô colidiu no passo ${passoIndex}!`);
    } else {
      tocarSom('passo');
    }

    // Integração com GreenSock (GSAP)
    if (typeof window.gsap !== 'undefined' && !ctx.reduzirMovimento) {
      const duracaoPasso = Math.max(0.08, 0.35 / velocidade);
      const roboEl = document.getElementById('atv-robo-sprite');
      const arenaEl = document.getElementById('atv-game-arena');

      if (roboEl) {
        window.gsap.to(roboEl, {
          left: `${(ponto.x / mapa.largura) * 100}%`,
          top: `${(ponto.y / mapa.altura) * 100}%`,
          rotation: estado.anguloRobo,
          duration: duracaoPasso,
          ease: 'power2.out',
        });
      }

      // Efeito de impacto no obstáculo ou borda
      if ((ponto.evento === 'obstaculo' || ponto.evento === 'borda') && arenaEl) {
        window.gsap.fromTo(arenaEl, { x: -7 }, { x: 7, duration: 0.05, repeat: 5, yoyo: true, ease: 'rough' });
      }
    }
  }

  function finalizar() {
    const execucao = estado.execucao;
    const total = estado.programa.length;
    const dica = estado.tentativas >= 2 ? ` Dica: ${atividade.dica}` : '';

    if (execucao.resultado === 'sucesso') {
      const estrelas = calcularEstrelas(total, minimo);
      estado.concluida = true;
      fasesCompletas.add(faseAtual.id);
      tocarSom('vitoria');
      adicionarLog(`VITÓRIA! ${faseAtual.nome} concluída em ${total} passos com ${estrelas} estrelas.`);

      // Animação de comemoração com GSAP
      if (typeof window.gsap !== 'undefined' && !ctx.reduzirMovimento) {
        window.gsap.fromTo(
          '.atv-game-hud',
          { borderColor: '#10b981', boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)' },
          { borderColor: 'rgba(255, 255, 255, 0.1)', boxShadow: 'none', duration: 1.2 },
        );
      }

      const temProxima = faseIndex < listaFases.length - 1;
      feedback.sucesso(
        'Missão cumprida com maestria! 🎉',
        h(
          'div',
          { class: 'atv-vitoria-box' },
          h('span', { class: 'atv-estrelas', role: 'img', 'aria-label': `${estrelas} de 3 estrelas` }, '⭐'.repeat(estrelas) + '☆'.repeat(3 - estrelas)),
          h('p', {}, `Seu programa utilizou ${plural(total, 'comando', 'comandos')}; a rota ideal tem ${minimo}. Bateria restante: ${estado.bateria} unidades.`),
          temProxima
            ? h(
              'button',
              {
                type: 'button',
                class: 'btn btn-primario flex-inline-icon',
                style: 'margin-top: 10px;',
                onclick: () => carregarFase(faseIndex + 1),
              },
              h('span', { class: 'material-symbols-outlined icon-xs' }, 'fast_forward'),
              ` Avançar para ${listaFases[faseIndex + 1].nome}`,
            )
            : h('p', { class: 'texto-suave' }, 'Você dominou todas as fases desta trilha de algoritmos! Parabéns!'),
        ),
      );
      ctx.aoConcluir({ tentativas: estado.tentativas, estrelas });
    } else if (execucao.resultado === 'faltou-item') {
      tocarSom('erro');
      adicionarLog(`Aviso: ${tema.faltouItem || 'Faltou recolher os itens antes do portão!'}`);
      feedback.erro('Quase lá!', `${tema.faltouItem || 'O robô chegou à escola, mas esqueceu de recolher os itens!'} Planeje a rota passando pelo item antes do portão.${dica}`);
    } else if (execucao.resultado === 'bateu-obstaculo') {
      tocarSom('erro');
      adicionarLog(`Colisão: Obstáculo atingido no comando ${execucao.passoComErro + 1}.`);
      feedback.erro('O robô bateu!', `No comando ${execucao.passoComErro + 1}, o robô esbarrou em ${tema.nomeObstaculo}. Procure o comando com erro, corrija e execute de novo.${dica}`);
    } else if (execucao.resultado === 'bateu-borda') {
      tocarSom('erro');
      adicionarLog(`Borda atingida no comando ${execucao.passoComErro + 1}.`);
      feedback.erro('O robô tentou sair do mapa!', `No comando ${execucao.passoComErro + 1}, o robô atingiu o limite da cidade. Ajuste a rota.${dica}`);
    } else {
      tocarSom('erro');
      adicionarLog('Programa incompleto: o robô parou antes da meta.');
      feedback.erro('O robô ainda não chegou', `O programa terminou antes de o robô chegar a ${tema.nomeMeta}. Faltam comandos para completar a rota.${dica}`);
    }
  }

  function executar() {
    if (estado.animando) {
      parar();
      tocarSom('click');
      adicionarLog('Execução pausada pelo usuário.');
      renderizar('executar');
      return;
    }
    if (!estado.programa.length) {
      tocarSom('erro');
      feedback.info('O programa está vazio', 'Selecione botões de direção no painel ou utilize as setas do teclado para montar a rota.');
      return;
    }

    feedback.limpar();
    estado.execucao = executarPrograma(mapa, estado.programa);
    estado.passo = 0;
    estado.tentativas += 1;
    const ultimo = estado.execucao.trilha.length - 1;

    adicionarLog(`Iniciando simulação: ${estado.programa.length} instruções.`);

    if (ctx.reduzirMovimento) {
      estado.passo = ultimo;
      const pontoFinal = estado.execucao.trilha[ultimo];
      animarPassoGSAP(pontoFinal, ultimo, ultimo);
      finalizar();
      renderizar('executar');
      return;
    }

    estado.animando = true;
    anunciar('Executando o programa na arena.');
    renderizar('executar');

    const intervaloMs = Math.round(400 / velocidade);

    temporizador = setInterval(() => {
      estado.passo += 1;
      const ponto = estado.execucao.trilha[estado.passo];
      if (ponto) animarPassoGSAP(ponto, estado.passo, ultimo);

      if (estado.passo >= ultimo) {
        estado.passo = ultimo;
        parar();
        finalizar();
      }
      renderizar('executar');
    }, intervaloMs);
  }

  function passoAPasso() {
    if (estado.animando) return;
    if (!estado.programa.length) {
      feedback.info('O programa está vazio', 'Monte uma sequência de comandos antes de depurar passo a passo.');
      return;
    }
    if (!estado.execucao) {
      estado.execucao = executarPrograma(mapa, estado.programa);
      estado.passo = 0;
      feedback.limpar();
      adicionarLog('Modo depurador ativo: executando instrução por instrução.');
    }

    const ultimo = estado.execucao.trilha.length - 1;
    if (estado.passo >= ultimo) {
      estado.passo = 0;
      feedback.limpar();
    }
    estado.passo += 1;

    const ponto = estado.execucao.trilha[estado.passo];
    if (ponto) animarPassoGSAP(ponto, estado.passo, ultimo);

    const dirNome = DIRECOES[estado.programa[estado.passo - 1]]?.nome || '';
    adicionarLog(`[DEBUG] Passo ${estado.passo}/${ultimo}: ${dirNome.toUpperCase()} -> [${ponto.x + 1}, ${ponto.y + 1}]`);
    anunciar(`Passo ${estado.passo}: ${dirNome}. Posição: coluna ${ponto.x + 1}, linha ${ponto.y + 1}.`);

    if (estado.passo === ultimo) {
      estado.tentativas += 1;
      finalizar();
    }
    renderizar('passo');
  }

  function posicaoAtual() {
    return estado.execucao ? estado.execucao.trilha[estado.passo] : { ...mapa.inicio, evento: 'inicio' };
  }

  // Atalhos de Teclado no estilo Gamepad
  function onKeydown(e) {
    if (['ArrowUp', 'KeyW'].includes(e.code)) {
      e.preventDefault();
      adicionar('cima');
    } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
      e.preventDefault();
      adicionar('direita');
    } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
      e.preventDefault();
      adicionar('baixo');
    } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
      e.preventDefault();
      adicionar('esquerda');
    } else if (e.code === 'Space') {
      e.preventDefault();
      executar();
    } else if (e.code === 'Backspace' || e.code === 'KeyZ') {
      desfazer();
    } else if (e.code === 'KeyR') {
      recomecar();
    }
  }

  // Registra teclado quando montado na página
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', onKeydown);
    window.addEventListener('keydown', onKeydown);
  }

  function renderizarHUD() {
    const posicao = posicaoAtual();
    const bateriaMax = faseAtual.bateriaMax || faseAtual.limite;
    const bateriaAtual = estado.bateria;
    const bateriaPct = Math.round((bateriaAtual / bateriaMax) * 100);
    const busolaTexto = BUSSOLA_SIMBOLOS[estado.direcaoRobo] || '► LESTE';

    return h(
      'div',
      { class: 'atv-game-hud' },
      // Barra de Missões / Níveis
      h(
        'div',
        { class: 'atv-hud-linha-top' },
        h(
          'div',
          { class: 'atv-fases-tabs', role: 'tablist', 'aria-label': 'Missões disponíveis' },
          listaFases.map((f, idx) => {
            const ativa = idx === faseIndex;
            const concluida = fasesCompletas.has(f.id);
            return h(
              'button',
              {
                type: 'button',
                role: 'tab',
                class: `atv-fase-tab ${ativa ? 'ativo' : ''} ${concluida ? 'concluida' : ''}`,
                'aria-selected': ativa ? 'true' : 'false',
                onclick: () => carregarFase(idx),
              },
              concluida ? '✔ ' : '',
              f.nome,
              h('small', {}, f.tag || `Fase ${idx + 1}`),
            );
          }),
        ),
        h(
          'div',
          { class: 'atv-hud-acoes-quick' },
          h(
            'button',
            {
              type: 'button',
              class: 'btn-hud-tool',
              title: somHabilitado ? 'Desativar áudio' : 'Ativar áudio',
              onclick: alternarSom,
            },
            h('span', { class: 'material-symbols-outlined icon-xs' }, somHabilitado ? 'volume_up' : 'volume_off'),
            somHabilitado ? ' Som' : ' Mudo',
          ),
          h(
            'button',
            {
              type: 'button',
              class: 'btn-hud-tool',
              title: 'Alternar velocidade da simulação',
              onclick: alternarVelocidade,
            },
            h('span', { class: 'material-symbols-outlined icon-xs' }, 'speed'),
            ` ${velocidade}x`,
          ),
        ),
      ),

      // Telemetria Técnica: Posição, Bússola e Bateria
      h(
        'div',
        { class: 'atv-telemetria-grid' },
        h(
          'div',
          { class: 'atv-telemetria-card' },
          h('span', { class: 'telemetria-label' }, 'POSIÇÃO X,Y'),
          h('strong', { class: 'telemetria-valor' }, `[ ${posicao.x + 1}, ${posicao.y + 1} ]`),
        ),
        h(
          'div',
          { class: 'atv-telemetria-card' },
          h('span', { class: 'telemetria-label' }, 'ORIENTAÇÃO'),
          h('strong', { class: 'telemetria-valor' }, busolaTexto),
        ),
        h(
          'div',
          { class: 'atv-telemetria-card atv-telemetria-bateria' },
          h('div', { class: 'flex-espacado' }, h('span', { class: 'telemetria-label' }, 'ENERGIA (BATERIA)'), h('span', { class: 'telemetria-pct' }, `${bateriaAtual}/${bateriaMax}`)),
          h(
            'div',
            { class: 'atv-bateria-trilho' },
            h('div', {
              class: `atv-bateria-preenchimento ${bateriaPct < 30 ? 'critico' : (bateriaPct < 60 ? 'alerta' : '')}`,
              style: `width: ${bateriaPct}%`,
            }),
          ),
        ),
      ),
    );
  }

  function renderMapa() {
    const posicao = posicaoAtual();
    const trilha = estado.execucao ? estado.execucao.trilha.slice(0, estado.passo + 1) : [];
    const visitadas = new Set(trilha.map((p) => `${p.x},${p.y}`));
    const coletados = new Set(trilha.filter((p) => p.evento === 'coletar').map((p) => `${p.x},${p.y}`));

    let celulaBatida = null;
    if (posicao.evento === 'obstaculo') {
      const direcao = DIRECOES[estado.programa[posicao.indice]];
      if (direcao) celulaBatida = `${posicao.x + direcao.dx},${posicao.y + direcao.dy}`;
    }

    const celulas = [];
    for (let y = 0; y < mapa.altura; y += 1) {
      for (let x = 0; x < mapa.largura; x += 1) {
        const chave = `${x},${y}`;
        const isRoboAqui = x === posicao.x && y === posicao.y;
        const classes = ['atv-celula-game'];
        let conteudo = '';

        if (mapa.obstaculos.has(chave)) {
          classes.push('obstaculo');
          conteudo = tema.obstaculo;
        } else if (x === mapa.meta.x && y === mapa.meta.y) {
          classes.push('meta');
          conteudo = tema.meta;
        } else if (mapa.itens.some((item) => item.x === x && item.y === y) && !coletados.has(chave)) {
          classes.push('item-coletavel');
          conteudo = tema.item;
        }

        if (x === mapa.inicio.x && y === mapa.inicio.y) classes.push('inicio');
        if (visitadas.has(chave) && !isRoboAqui) classes.push('visitada-neon');
        if (chave === celulaBatida || (posicao.evento === 'borda' && isRoboAqui)) classes.push('batida');

        celulas.push(
          h(
            'div',
            {
              class: classes.join(' '),
              'data-coord': `${x},${y}`,
              'aria-hidden': 'true',
            },
            h('span', { class: 'atv-celula-coord' }, `${x},${y}`),
            h('span', { class: 'atv-celula-icone' }, conteudo),
          ),
        );
      }
    }

    // Posição percentual do Robô Sprite na arena
    const leftPct = (posicao.x / mapa.largura) * 100;
    const topPct = (posicao.y / mapa.altura) * 100;
    const widthPct = (1 / mapa.largura) * 100;
    const heightPct = (1 / mapa.altura) * 100;

    return h(
      'div',
      { class: 'atv-arena-wrapper' },
      h(
        'div',
        {
          id: 'atv-game-arena',
          class: 'atv-mapa-game',
          style: `--colunas: ${mapa.largura}; --linhas: ${mapa.altura};`,
          role: 'img',
          'aria-label': `Arena de simulação com ${mapa.largura} colunas e ${mapa.altura} linhas. Robô na coluna ${posicao.x + 1}, linha ${posicao.y + 1}.`,
        },
        celulas,
        // Robô Sprite dinâmico animado via GSAP
        h(
          'div',
          {
            id: 'atv-robo-sprite',
            class: 'atv-robo-avatar',
            style: `left: ${leftPct}%; top: ${topPct}%; width: ${widthPct}%; height: ${heightPct}%; transform: rotate(${estado.anguloRobo}deg);`,
          },
          h('div', { class: 'atv-robo-farol' }),
          h('div', { class: 'atv-robo-corpo' }, tema.robo),
          h('div', { class: 'atv-robo-aura' }),
        ),
      ),
      h(
        'div',
        { class: 'atv-legenda-game' },
        h('span', { class: 'badge-legenda' }, `${tema.robo} Robô`),
        h('span', { class: 'badge-legenda' }, `${tema.meta} ${tema.nomeMeta || 'Destino'}`),
        tema.item ? h('span', { class: 'badge-legenda' }, `${tema.item} ${tema.nomeItem || 'Coletável'}`) : null,
        h('span', { class: 'badge-legenda' }, `${tema.obstaculo} ${tema.nomeObstaculo || 'Obstáculo'}`),
      ),
    );
  }

  function renderPrograma() {
    const execucao = estado.execucao;
    const atual = execucao ? estado.passo - 1 : -1;
    const noLimite = estado.programa.length >= faseAtual.limite;
    const bloqueado = estado.animando || estado.concluida;

    return h(
      'div',
      { class: 'atv-deck-comandos' },
      h(
        'div',
        { class: 'flex-espacado' },
        h(ctx.TituloPainel, {}, 'Pipeline de Algoritmo'),
        h('span', { class: 'atv-badge-limite' }, `${estado.programa.length}/${faseAtual.limite} Comandos`),
      ),
      h('p', { class: 'atv-contagem-suave' }, 'Adicione instruções de movimento. Toque em qualquer comando na fita para removê-lo.'),

      // Fita de Instruções (Pipeline)
      h(
        'div',
        { class: 'atv-fita-wrapper' },
        estado.programa.length
          ? h(
            'ol',
            { class: 'atv-fita-pipeline' },
            estado.programa.map((direcao, indice) => {
              let classe = 'atv-fita-comando';
              if (indice === atual && estado.animando) classe += ' ativo-executando';
              if (execucao && execucao.passoComErro === indice && estado.passo >= indice + 1) classe += ' erro-colisao';
              return h(
                'li',
                {},
                h(
                  'button',
                  {
                    type: 'button',
                    class: classe,
                    'data-foco': `cmd-${indice}`,
                    'aria-label': `Passo ${indice + 1}: ${DIRECOES[direcao].nome}. Toque para remover.`,
                    disabled: bloqueado,
                    onclick: () => removerComando(indice),
                  },
                  h('span', { class: 'cmd-num' }, indice + 1),
                  h('span', { class: 'cmd-icone' }, DIRECOES[direcao].simbolo),
                  h('span', { class: 'cmd-nome' }, DIRECOES[direcao].nome),
                ),
              );
            }),
          )
          : h(
            'div',
            { class: 'atv-fita-vazia' },
            h('span', { class: 'material-symbols-outlined icon-md' }, 'terminal'),
            h('span', {}, 'Nenhum comando montado. Utilize o gamepad abaixo ou as setas do teclado.'),
          ),
      ),

      // Arcade Gamepad D-Pad
      h(
        'div',
        { class: 'atv-gamepad-deck' },
        h('span', { class: 'gamepad-label' }, 'PAINEL DE DIREÇÃO (GAMEPAD / TECLADO)'),
        h(
          'div',
          { class: 'atv-gamepad-grid', role: 'group', 'aria-label': 'Comandos direcionais' },
          Object.entries(DIRECOES).map(([nome, direcao]) => h(
            'button',
            {
              type: 'button',
              class: `atv-btn-direcao atv-dir-${nome}`,
              'data-foco': `dir-${nome}`,
              disabled: bloqueado || noLimite,
              onclick: () => adicionar(nome),
            },
            h('span', { class: 'simbolo-seta' }, direcao.simbolo),
            h('span', { class: 'nome-direcao' }, direcao.nome),
          )),
        ),
      ),

      // Barra de Ações Principais
      h(
        'div',
        { class: 'atv-acoes-game' },
        h(
          'button',
          {
            type: 'button',
            class: `btn ${estado.animando ? 'btn-perigo' : 'btn-primario'} flex-inline-icon btn-executar-glow`,
            'data-foco': 'executar',
            onclick: executar,
          },
          h('span', { class: 'material-symbols-outlined icon-xs' }, estado.animando ? 'pause' : 'play_arrow'),
          estado.animando ? ' Pausar' : ' Executar Programa',
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-neutro flex-inline-icon',
            'data-foco': 'passo',
            disabled: estado.animando,
            onclick: passoAPasso,
          },
          h('span', { class: 'material-symbols-outlined icon-xs' }, 'skip_next'),
          ' Passo a passo (Debug)',
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-neutro flex-inline-icon',
            'data-foco': 'desfazer',
            disabled: bloqueado || !estado.programa.length,
            onclick: desfazer,
          },
          h('span', { class: 'material-symbols-outlined icon-xs' }, 'undo'),
          ' Desfazer',
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-neutro flex-inline-icon',
            'data-foco': 'limpar',
            disabled: bloqueado || !estado.programa.length,
            onclick: limpar,
          },
          h('span', { class: 'material-symbols-outlined icon-xs' }, 'delete'),
          ' Limpar',
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-neutro flex-inline-icon',
            'data-foco': 'recomecar',
            onclick: recomecar,
          },
          h('span', { class: 'material-symbols-outlined icon-xs' }, 'refresh'),
          ' Reiniciar',
        ),
      ),

      // Terminal Console ao Vivo (Wishlabs Telemetry Log)
      h(
        'details',
        { class: 'atv-terminal-detalhes', open: true },
        h('summary', { class: 'terminal-cabecalho' }, h('span', { class: 'flex-inline-icon' }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'terminal'), ' Terminal de Telemetria & Logs')),
        h(
          'div',
          { class: 'atv-terminal-body' },
          logsTerminal.length
            ? logsTerminal.map((log) => h('div', { class: 'terminal-linha' }, log))
            : h('div', { class: 'terminal-linha texto-suave' }, '> Aguardando comandos do operador...'),
        ),
      ),
    );
  }

  function renderizar(foco = null) {
    renderizarComFoco(
      area,
      () => [
        h(
          'div',
          { class: 'atv-game-shell' },
          renderizarHUD(),
          h('div', { class: 'atv-game-stage' }, renderMapa(), renderPrograma()),
          h(
            'div',
            { class: 'atv-dica-footer' },
            h(
              'button',
              {
                type: 'button',
                class: 'btn btn-sm btn-neutro flex-inline-icon',
                'data-foco': 'dica',
                onclick: () => {
                  tocarSom('click');
                  feedback.info('Dica Pedagógica', faseAtual.descricao || atividade.dica);
                },
              },
              h('span', { class: 'material-symbols-outlined icon-xs' }, 'lightbulb'),
              ' Consultar Dica da Missão',
            ),
          ),
        ),
      ],
      foco,
    );
  }

  // Inicialização
  adicionarLog(`Sistema iniciado: ${atividade.titulo}.`);
  estado = novoEstado();
  renderizar();
  return h('div', {}, area, feedback.elemento);
}

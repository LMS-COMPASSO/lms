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
} from './logica.js';
import { tocarSom, alternarSom as alternarSomModulo, somAtivo } from './som.js';
import { renderizarIcone, renderizarIconeCelula } from './icones.js';
import {
  t,
  atvDica,
  atvFaseDesc,
  atvFaseNome,
  atvFaseTag,
  atvResumo,
  atvTema,
  atvTitulo,
  dirNome,
} from './traducao.js';

// Mapeamento de ângulos de rotação em graus por direção
const ANGULOS_DIRECAO = {
  cima: 0,
  direita: 90,
  baixo: 180,
  esquerda: 270,
};

export function jogadorRobo(atividade, ctx) {
  const temFasesMulti = Boolean(atividade.fases && atividade.fases.length);
  const listaFases = temFasesMulti
    ? atividade.fases
    : [
      {
        id: 1,
        nome: atvTitulo(atividade),
        tag: '',
        descricao: atvResumo(atividade),
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
  let tema = atvTema(atividade.id, faseAtual.tema || atividade.tema, temFasesMulti ? faseAtual.id : null);
  const feedback = criarFeedback();
  const area = h('div');
  const fasesCompletas = new Set();

  let estado;
  let temporizador = null;
  let velocidade = 1; // 1 = 400ms, 2 = 220ms, 4 = 110ms
  let logsTerminal = [];

  const obterNomeFase = (f, idx) => (temFasesMulti ? atvFaseNome(atividade.id, f, idx) : atvTitulo(atividade));
  const obterTagFase = (f, idx) => (temFasesMulti ? atvFaseTag(atividade.id, f, idx) : t('robo.tagCanonica'));
  const obterDescFase = (f, idx) => (temFasesMulti ? atvFaseDesc(atividade.id, f, idx) : atvResumo(atividade));

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
    const solucao = menorPrograma(mapa);
    minimo = solucao ? solucao.length : (faseAtual.limite || 10);
    tema = atvTema(atividade.id, faseAtual.tema || atividade.tema, temFasesMulti ? faseAtual.id : null);
    estado = novoEstado();
    feedback.limpar();
    const nomeF = obterNomeFase(faseAtual, faseIndex);
    adicionarLog(t('robo.logMissaoIniciada', { nome: nomeF, cols: mapa.largura, rows: mapa.altura }));
    anunciar(t('robo.anuncioMissaoCarregada', { nome: nomeF }));
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
      anunciar(t('robo.anuncioLimite'));
      tocarSom('erro');
      return;
    }
    tocarSom('click');
    editar(() => estado.programa.push(direcao));
    const nomeD = dirNome(direcao, DIRECOES[direcao].nome);
    adicionarLog(t('robo.logComandoAdicionado', { dir: nomeD.toUpperCase() }));
    anunciar(t('robo.anuncioComando', { num: estado.programa.length, dir: nomeD }));
    renderizar(`dir-${direcao}`);
  }

  function removerComando(indice) {
    tocarSom('click');
    const cmdRemovido = estado.programa[indice];
    editar(() => estado.programa.splice(indice, 1));
    const nomeD = dirNome(cmdRemovido, DIRECOES[cmdRemovido]?.nome || '');
    adicionarLog(t('robo.logComandoRemovido', { num: indice + 1, dir: nomeD }));
    anunciar(t('robo.anuncioComandoRemovido', { num: indice + 1 }));
    renderizar([`cmd-${Math.min(indice, estado.programa.length - 1)}`, 'dir-cima']);
  }

  function desfazer() {
    if (!estado.programa.length) return;
    tocarSom('click');
    editar(() => estado.programa.pop());
    adicionarLog(t('robo.logDesfeito'));
    anunciar(t('robo.anuncioDesfeito'));
    renderizar(['desfazer', 'dir-cima']);
  }

  function limpar() {
    if (!estado.programa.length) return;
    tocarSom('click');
    editar(() => { estado.programa = []; });
    adicionarLog(t('robo.logLimpo'));
    anunciar(t('robo.anuncioLimpo'));
    renderizar('dir-cima');
  }

  function recomecar() {
    tocarSom('click');
    parar();
    estado = novoEstado();
    feedback.limpar();
    adicionarLog(t('robo.logReiniciado'));
    anunciar(t('jog.anuncioReiniciada'));
    renderizar('dir-cima');
  }

  function alternarSom() {
    alternarSomModulo();
    renderizar();
  }

  function alternarVelocidade() {
    if (velocidade === 1) velocidade = 2;
    else if (velocidade === 2) velocidade = 4;
    else velocidade = 1;
    tocarSom('click');
    adicionarLog(t('robo.logVelocidade', { velocidade }));
    renderizar();
  }

  function animarPassoGSAP(ponto, passoIndex) {
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
      adicionarLog(t('robo.logColetou', { x: ponto.x + 1, y: ponto.y + 1 }));
    } else if (ponto.evento === 'obstaculo' || ponto.evento === 'borda') {
      tocarSom('erro');
      adicionarLog(t('robo.logColisao', { passo: passoIndex }));
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
    const dica = estado.tentativas >= 2 ? ` ${t('jog.dicaPrefixo', { dica: atvDica(atividade) })}` : '';

    if (execucao.resultado === 'sucesso') {
      const estrelas = calcularEstrelas(total, minimo);
      estado.concluida = true;
      fasesCompletas.add(faseAtual.id);
      tocarSom('vitoria');
      adicionarLog(t('robo.logVitoria', { nome: obterNomeFase(faseAtual, faseIndex), total, estrelas }));

      if (typeof window.gsap !== 'undefined' && !ctx.reduzirMovimento) {
        window.gsap.fromTo(
          '.atv-game-hud',
          { borderColor: '#10b981', boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)' },
          { borderColor: 'rgba(255, 255, 255, 0.1)', boxShadow: 'none', duration: 1.2 },
        );
      }

      const temProxima = faseIndex < listaFases.length - 1;
      feedback.sucesso(
        t('robo.vitoriaTitulo'),
        h(
          'div',
          { class: 'atv-vitoria-box' },
          h('span', { class: 'atv-estrelas', role: 'img', 'aria-label': t('robo.estrelasAria', { estrelas }) }, '⭐'.repeat(estrelas) + '☆'.repeat(3 - estrelas)),
          h('p', {}, t(total === 1 ? 'robo.vitoriaStatsSing' : 'robo.vitoriaStatsPlur', { n: total, minimo, bateria: estado.bateria })),
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
              ` ${t('robo.avancarFase', { nome: obterNomeFase(listaFases[faseIndex + 1], faseIndex + 1) })}`,
            )
            : h('p', { class: 'texto-suave' }, t('robo.trilhaCompleta')),
        ),
      );
      ctx.aoConcluir({ tentativas: estado.tentativas, estrelas });
    } else if (execucao.resultado === 'faltou-item') {
      tocarSom('erro');
      const motivoFaltou = tema.faltouItem || t('robo.faltouItemPadrao');
      adicionarLog(t('robo.logAvisoFaltou', { msg: motivoFaltou }));
      feedback.erro(t('ordenar.quaseLa'), `${motivoFaltou} ${t('robo.faltouItemInstrucao')}${dica}`);
    } else if (execucao.resultado === 'bateu-obstaculo') {
      tocarSom('erro');
      adicionarLog(t('robo.logBateuObstaculo', { passo: execucao.passoComErro + 1 }));
      feedback.erro(t('robo.bateuTitulo'), `${t('robo.bateuDesc', { passo: execucao.passoComErro + 1, obstaculo: tema.nomeObstaculo })}${dica}`);
    } else if (execucao.resultado === 'bateu-borda') {
      tocarSom('erro');
      adicionarLog(t('robo.logBorda', { passo: execucao.passoComErro + 1 }));
      feedback.erro(t('robo.bordaTitulo'), `${t('robo.bordaDesc', { passo: execucao.passoComErro + 1 })}${dica}`);
    } else {
      tocarSom('erro');
      adicionarLog(t('robo.logIncompleto'));
      feedback.erro(t('robo.incompletoTitulo'), `${t('robo.incompletoDesc', { meta: tema.nomeMeta })}${dica}`);
    }
  }

  function executar() {
    if (estado.animando) {
      parar();
      tocarSom('click');
      adicionarLog(t('robo.logPausado'));
      renderizar('executar');
      return;
    }
    if (!estado.programa.length) {
      tocarSom('erro');
      feedback.info(t('robo.vazioTitulo'), t('robo.vazioDesc'));
      return;
    }

    feedback.limpar();
    estado.execucao = executarPrograma(mapa, estado.programa);
    estado.passo = 0;
    estado.tentativas += 1;
    const ultimo = estado.execucao.trilha.length - 1;

    adicionarLog(t('robo.logIniciando', { total: estado.programa.length }));

    if (ctx.reduzirMovimento) {
      estado.passo = ultimo;
      const pontoFinal = estado.execucao.trilha[ultimo];
      animarPassoGSAP(pontoFinal, ultimo);
      finalizar();
      renderizar('executar');
      return;
    }

    estado.animando = true;
    anunciar(t('robo.anuncioExecutando'));
    renderizar('executar');

    const intervaloMs = Math.round(400 / velocidade);

    temporizador = setInterval(() => {
      estado.passo += 1;
      const ponto = estado.execucao.trilha[estado.passo];
      if (ponto) animarPassoGSAP(ponto, estado.passo);

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
      feedback.info(t('robo.vazioTitulo'), t('robo.vazioDebugDesc'));
      return;
    }
    if (!estado.execucao) {
      estado.execucao = executarPrograma(mapa, estado.programa);
      estado.passo = 0;
      feedback.limpar();
      adicionarLog(t('robo.logDebugAtivo'));
    }

    const ultimo = estado.execucao.trilha.length - 1;
    if (estado.passo >= ultimo) {
      estado.passo = 0;
      feedback.limpar();
    }
    estado.passo += 1;

    const ponto = estado.execucao.trilha[estado.passo];
    if (ponto) animarPassoGSAP(ponto, estado.passo);

    const dirId = estado.programa[estado.passo - 1];
    const dirTraduzida = dirNome(dirId, DIRECOES[dirId]?.nome || '');
    adicionarLog(t('robo.logDebugPasso', { passo: estado.passo, ultimo, dir: dirTraduzida.toUpperCase(), x: ponto.x + 1, y: ponto.y + 1 }));
    anunciar(t('robo.anuncioDebugPasso', { passo: estado.passo, dir: dirTraduzida, x: ponto.x + 1, y: ponto.y + 1 }));

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
    if (!document.body.contains(area)) return;
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return;

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

  // Registra teclado garantindo apenas um listener ativo mesmo após re-renderizações de idioma
  if (typeof window !== 'undefined') {
    if (window.__lmsRoboKeydown) {
      window.removeEventListener('keydown', window.__lmsRoboKeydown);
    }
    window.__lmsRoboKeydown = onKeydown;
    window.addEventListener('keydown', onKeydown);
  }

  function renderizarHUD() {
    const posicao = posicaoAtual();
    const bateriaMax = faseAtual.bateriaMax || faseAtual.limite;
    const bateriaAtual = estado.bateria;
    const bateriaPct = Math.round((bateriaAtual / bateriaMax) * 100);
    const busolaTexto = t(`robo.bussola.${estado.direcaoRobo || 'direita'}`);
    let classeBateria = '';
    if (bateriaPct < 30) classeBateria = 'critico';
    else if (bateriaPct < 60) classeBateria = 'alerta';

    return h(
      'div',
      { class: 'atv-game-hud' },
      // Barra de Missões / Níveis
      h(
        'div',
        { class: 'atv-hud-linha-top' },
        h(
          'div',
          { class: 'atv-fases-tabs', role: 'tablist', 'aria-label': t('robo.missoesAria') },
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
              obterNomeFase(f, idx),
              h('small', {}, obterTagFase(f, idx) || t('robo.faseNum', { num: idx + 1 })),
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
              title: somAtivo() ? t('robo.audioDesativarTitle') : t('robo.audioAtivarTitle'),
              onclick: alternarSom,
            },
            h('span', { class: 'material-symbols-outlined icon-xs' }, somAtivo() ? 'volume_up' : 'volume_off'),
            ` ${somAtivo() ? t('robo.audioSom') : t('robo.audioMudo')}`,
          ),
          h(
            'button',
            {
              type: 'button',
              class: 'btn-hud-tool',
              title: t('robo.velocidadeTitle'),
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
          h('span', { class: 'telemetria-label' }, t('robo.hudPosicao')),
          h('strong', { class: 'telemetria-valor' }, `[ ${posicao.x + 1}, ${posicao.y + 1} ]`),
        ),
        h(
          'div',
          { class: 'atv-telemetria-card' },
          h('span', { class: 'telemetria-label' }, t('robo.hudOrientacao')),
          h('strong', { class: 'telemetria-valor' }, busolaTexto),
        ),
        h(
          'div',
          { class: 'atv-telemetria-card atv-telemetria-bateria' },
          h('div', { class: 'flex-espacado' }, h('span', { class: 'telemetria-label' }, t('robo.hudBateria')), h('span', { class: 'telemetria-pct' }, `${bateriaAtual}/${bateriaMax}`)),
          h(
            'div',
            { class: 'atv-bateria-trilho' },
            h('div', {
              class: `atv-bateria-preenchimento ${classeBateria}`,
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
        let iconeElemento = null;

        if (mapa.obstaculos.has(chave)) {
          classes.push('obstaculo');
          iconeElemento = renderizarIconeCelula('#', tema);
        } else if (x === mapa.meta.x && y === mapa.meta.y) {
          classes.push('meta');
          iconeElemento = renderizarIconeCelula('M', tema);
        } else if (mapa.itens.some((item) => item.x === x && item.y === y) && !coletados.has(chave)) {
          classes.push('item-coletavel');
          iconeElemento = renderizarIconeCelula('I', tema);
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
            iconeElemento ? h('span', { class: 'atv-celula-icone' }, iconeElemento) : null,
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
          'aria-label': t('robo.arenaAria', { cols: mapa.largura, rows: mapa.altura, x: posicao.x + 1, y: posicao.y + 1 }),
        },
        celulas,
        h(
          'div',
          {
            id: 'atv-robo-sprite',
            class: 'atv-robo-avatar',
            style: `left: ${leftPct}%; top: ${topPct}%; width: ${widthPct}%; height: ${heightPct}%; transform: rotate(${estado.anguloRobo}deg);`,
          },
          h('div', { class: 'atv-robo-farol' }),
          h('div', { class: 'atv-robo-corpo' }, renderizarIcone('smart_toy', { classe: 'cor-robo' })),
          h('div', { class: 'atv-robo-aura' }),
        ),
      ),
      h(
        'div',
        { class: 'atv-legenda-game' },
        h('span', { class: 'badge-legenda' }, renderizarIcone('smart_toy', { classe: 'cor-robo icon-sm' }), ` ${t('robo.legendaRobo')}`),
        h('span', { class: 'badge-legenda' }, renderizarIconeCelula('M', tema), ` ${tema.nomeMeta || t('robo.legendaDestino')}`),
        tema.item ? h('span', { class: 'badge-legenda' }, renderizarIconeCelula('I', tema), ` ${tema.nomeItem || t('robo.legendaColetavel')}`) : null,
        h('span', { class: 'badge-legenda' }, renderizarIconeCelula('#', tema), ` ${tema.nomeObstaculo || t('robo.legendaObstaculo')}`),
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
        h(ctx.TituloPainel || 'h3', {}, t('robo.pipelineTitulo')),
        h('span', { class: 'atv-badge-limite' }, t('robo.pipelineLimite', { atual: estado.programa.length, limite: faseAtual.limite })),
      ),
      h('p', { class: 'atv-contagem-suave' }, t('robo.pipelineInstrucao')),

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
              const nomeD = dirNome(direcao, DIRECOES[direcao].nome);
              return h(
                'li',
                {},
                h(
                  'button',
                  {
                    type: 'button',
                    class: classe,
                    'data-foco': `cmd-${indice}`,
                    'aria-label': t('robo.comandoRemoverAria', { num: indice + 1, dir: nomeD }),
                    disabled: bloqueado,
                    onclick: () => removerComando(indice),
                  },
                  h('span', { class: 'cmd-num' }, indice + 1),
                  h('span', { class: 'cmd-icone' }, DIRECOES[direcao].simbolo),
                  h('span', { class: 'cmd-nome' }, nomeD),
                ),
              );
            }),
          )
          : h(
            'div',
            { class: 'atv-fita-vazia' },
            h('span', { class: 'material-symbols-outlined icon-md' }, 'terminal'),
            h('span', {}, t('robo.fitaVazia')),
          ),
      ),

      // Arcade Gamepad D-Pad
      h(
        'div',
        { class: 'atv-gamepad-deck' },
        h('span', { class: 'gamepad-label' }, t('robo.gamepadLabel')),
        h(
          'div',
          { class: 'atv-gamepad-grid', role: 'group', 'aria-label': t('robo.gamepadAria') },
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
            h('span', { class: 'nome-direcao' }, dirNome(nome, direcao.nome)),
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
          ` ${estado.animando ? t('robo.btnPausar') : t('robo.btnExecutar')}`,
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
          ` ${t('robo.btnDebug')}`,
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
          ` ${t('robo.btnDesfazer')}`,
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
          ` ${t('robo.btnLimpar')}`,
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
          ` ${t('robo.btnReiniciar')}`,
        ),
      ),

      // Terminal Console ao Vivo
      h(
        'details',
        { class: 'atv-terminal-detalhes', open: true },
        h('summary', { class: 'terminal-cabecalho' }, h('span', { class: 'flex-inline-icon' }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'terminal'), ` ${t('robo.terminalTitulo')}`)),
        h(
          'div',
          { class: 'atv-terminal-body' },
          logsTerminal.length
            ? logsTerminal.map((log) => h('div', { class: 'terminal-linha' }, log))
            : h('div', { class: 'terminal-linha texto-suave' }, t('robo.terminalAguardando')),
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
                  feedback.info(t('robo.dicaPedagogicaTitulo'), obterDescFase(faseAtual, faseIndex) || atvDica(atividade));
                },
              },
              h('span', { class: 'material-symbols-outlined icon-xs' }, 'lightbulb'),
              ` ${t('robo.consultarDica')}`,
            ),
          ),
        ),
      ],
      foco,
    );
  }

  // Inicialização
  adicionarLog(t('robo.logSistemaIniciado', { titulo: atvTitulo(atividade) }));
  estado = novoEstado();
  renderizar();
  return h('div', {}, area, feedback.elemento);
}

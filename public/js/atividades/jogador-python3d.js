/**
 * ============================================================================
 * LMS COMPASSO — JOGADOR DE ATIVIDADES 3D PYTHON (PYODIDE + THREE.JS + GSAP)
 * ============================================================================
 * Interface interativa com:
 *  - Palco 3D (Three.js + GSAP) e alternância para modo 2D leve.
 *  - Modo Desafio Colaborativo (Pair Programming Escolar: Piloto + Navegador)
 *    com sincronização em tempo real via BroadcastChannel / localStorage.
 *  - Editor de código Python com numeração e destaque da linha em execução.
 *  - Execução em Web Worker (Pyodide) com fallback local offline.
 *  - Controles pedagógicos: Executar, Pausar, Passo a Passo, Reiniciar,
 *    seletor de velocidade e log textual acessível para leitores de tela.
 * ============================================================================
 */

import { anunciar, h } from './dom.js';
import { criarControladorCena3D } from './cena3d.js';
import { executarPythonPedagogicoFallback } from './pyodide-worker.js';
import {
  t,
  atvConclusao,
  atvDica,
  atvTitulo,
  traduzirErroWorkerPython,
  traduzirEventoPython,
  traduzirResumoPython,
} from './traducao.js';

let workerGlobal = null;
let contadorRequisicao = 0;
const rascunhosCodigo = new Map();

function executarNoWorkerOuFallback(codigoPython, cena3d) {
  return new Promise((resolve) => {
    if (typeof Worker !== 'undefined') {
      try {
        if (!workerGlobal) {
          workerGlobal = new Worker('/js/atividades/pyodide-worker.js', { type: 'module' });
        }
        contadorRequisicao += 1;
        const idReq = contadorRequisicao;

        const timer = setTimeout(() => {
          workerGlobal.terminate();
          workerGlobal = null;
          resolve(executarPythonPedagogicoFallback(codigoPython, cena3d));
        }, 3500);

        const aoMensagem = (e) => {
          if (e.data?.idRequisicao !== idReq) return;
          clearTimeout(timer);
          workerGlobal.removeEventListener('message', aoMensagem);
          resolve(e.data);
        };

        workerGlobal.addEventListener('message', aoMensagem);
        workerGlobal.postMessage({ idRequisicao: idReq, codigoPython, cena3d });
        return;
      } catch {
        // Fallback imediato caso o Worker não possa ser instanciado
      }
    }
    resolve(executarPythonPedagogicoFallback(codigoPython, cena3d));
  });
}

export function jogadorPython3d(atividade, { aoConcluir, reduzirMovimento = false } = {}) {
  let tentativas = 0;
  let velocidade = 1;
  let indicePassoManual = -1;
  let cacheUltimaExecucao = null;
  let timelineAtiva = null;

  // Estado do Modo Desafio Colaborativo (Pair Programming Escolar)
  let modoDuplaAtivo = false;
  let papelDupla = 'individual'; // 'individual' | 'piloto' | 'navegador'
  let parceiroDupla = '';
  let codigoSalaDupla = `SALA-${atividade.id.slice(-6).toUpperCase()}`;
  let linhaMarcadaNavegador = null;
  let canalColaborativo = null;

  // 1. Palco 3D / 2D
  const containerPalco = h('div', {
    class: 'py3d-palco-container',
    role: 'region',
    'aria-label': t('py3d.cenaAria', { titulo: atvTitulo(atividade) }),
  });

  const controladorCena = criarControladorCena3D(containerPalco, atividade.cena3d, { reduzirMovimento });

  // 2. Editor de código com números de linha e destaque sincronizado
  const colunaLinhas = h('ol', { class: 'py3d-editor-linhas', 'aria-hidden': 'true' });
  const codigoBase = rascunhosCodigo.has(atividade.id)
    ? rascunhosCodigo.get(atividade.id)
    : (atividade.codigoInicial || '');
  const textareaCodigo = h('textarea', {
    class: 'py3d-editor-textarea',
    spellcheck: 'false',
    autocapitalize: 'off',
    autocomplete: 'off',
    'aria-label': t('py3d.editorAria'),
    rows: 12,
  }, codigoBase);

  const caixaFeedback = h('div', { class: 'atv-feedback', role: 'status', 'aria-live': 'polite' });

  function emitirSincronizacaoDupla(tipoEvento, payload = {}) {
    if (!modoDuplaAtivo || !canalColaborativo) return;
    try {
      canalColaborativo.postMessage({
        sala: codigoSalaDupla,
        atividadeId: atividade.id,
        tipoEvento,
        ...payload,
      });
    } catch {
      // Ignora se o canal estiver fechado
    }
  }

  function atualizarNumeracaoLinhas(linhaDestacada = null) {
    const total = (textareaCodigo.value.split('\n').length) || 1;
    const itens = [];
    for (let i = 1; i <= total; i += 1) {
      const classes = [];
      if (i === linhaDestacada) classes.push('linha-ativa');
      if (i === linhaMarcadaNavegador) classes.push('linha-revisao-navegador');
      itens.push(
        h(
          'li',
          {
            class: classes.join(' '),
            title: modoDuplaAtivo
              ? t('py3d.linhaDuplaTitle', { linha: i })
              : t('py3d.linhaTitle', { linha: i }),
            onclick: () => {
              if (!modoDuplaAtivo) return;
              linhaMarcadaNavegador = linhaMarcadaNavegador === i ? null : i;
              atualizarNumeracaoLinhas(linhaDestacada);
              emitirSincronizacaoDupla('marcar-linha', { linha: linhaMarcadaNavegador });
              if (linhaMarcadaNavegador) {
                const msg = t('py3d.navMarcouLinha', { linha: i });
                caixaFeedback.className = 'atv-feedback info';
                caixaFeedback.textContent = msg;
                anunciar(msg);
              }
            },
          },
          String(i),
        ),
      );
    }
    colunaLinhas.replaceChildren(...itens);
  }

  textareaCodigo.addEventListener('input', () => {
    rascunhosCodigo.set(atividade.id, textareaCodigo.value);
    cacheUltimaExecucao = null;
    indicePassoManual = -1;
    atualizarNumeracaoLinhas();
    emitirSincronizacaoDupla('codigo-atualizado', { codigo: textareaCodigo.value });
  });
  atualizarNumeracaoLinhas();

  // 3. Barra do Modo Desafio Colaborativo (Pair Programming Escolar: Piloto + Navegador)
  const badgePapelDupla = h('span', { class: 'py3d-dupla-badge' }, t('py3d.duplaIndividual'));
  const inputParceiro = h('input', {
    type: 'text',
    class: 'py3d-dupla-input',
    placeholder: t('py3d.duplaColegaPlaceholder'),
    'aria-label': t('py3d.duplaColegaAria'),
    oninput: (e) => {
      parceiroDupla = e.target.value.trim();
      emitirSincronizacaoDupla('parceiro-atualizado', { parceiro: parceiroDupla });
    },
  });
  const inputSala = h('input', {
    type: 'text',
    class: 'py3d-dupla-input py3d-dupla-sala',
    value: codigoSalaDupla,
    'aria-label': t('py3d.duplaSalaAria'),
    onchange: (e) => {
      codigoSalaDupla = e.target.value.trim().toUpperCase() || codigoSalaDupla;
    },
  });

  const dicaPapelDupla = h(
    'p',
    { class: 'py3d-dupla-orientacao' },
    t('py3d.duplaOrientacaoPadrao'),
  );

  function aplicarEstadoPapelDupla() {
    if (!modoDuplaAtivo) {
      papelDupla = 'individual';
      badgePapelDupla.textContent = t('py3d.duplaIndividual');
      badgePapelDupla.className = 'py3d-dupla-badge';
      textareaCodigo.removeAttribute('readonly');
      return;
    }
    if (papelDupla === 'piloto') {
      badgePapelDupla.textContent = t('py3d.duplaBadgePiloto');
      badgePapelDupla.className = 'py3d-dupla-badge piloto';
      textareaCodigo.removeAttribute('readonly');
      dicaPapelDupla.textContent = t('py3d.duplaOrientacaoPiloto');
    } else {
      badgePapelDupla.textContent = t('py3d.duplaBadgeNavegador');
      badgePapelDupla.className = 'py3d-dupla-badge navegador';
      dicaPapelDupla.textContent = t('py3d.duplaOrientacaoNavegador');
    }
  }

  function conectarCanalDupla() {
    if (typeof BroadcastChannel === 'undefined' || canalColaborativo) return;
    try {
      canalColaborativo = new BroadcastChannel('lms_compasso_pair_programming');
      canalColaborativo.addEventListener('message', (e) => {
        const msg = e.data || {};
        if (!modoDuplaAtivo || msg.sala !== codigoSalaDupla || msg.atividadeId !== atividade.id) return;
        if (msg.tipoEvento === 'codigo-atualizado' && typeof msg.codigo === 'string') {
          textareaCodigo.value = msg.codigo;
          rascunhosCodigo.set(atividade.id, msg.codigo);
          atualizarNumeracaoLinhas();
        } else if (msg.tipoEvento === 'marcar-linha') {
          linhaMarcadaNavegador = msg.linha;
          atualizarNumeracaoLinhas();
        } else if (msg.tipoEvento === 'trocar-papel') {
          papelDupla = msg.novoPapelRemoto;
          aplicarEstadoPapelDupla();
        } else if (msg.tipoEvento === 'executar-remoto') {
          void executarCodigoCompleto(true);
        }
      });
    } catch {
      canalColaborativo = null;
    }
  }

  const btnTrocarPapel = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-neutro btn-sm flex-inline-icon',
      onclick: () => {
        const proximoPapel = papelDupla === 'piloto' ? 'navegador' : 'piloto';
        papelDupla = proximoPapel;
        aplicarEstadoPapelDupla();
        emitirSincronizacaoDupla('trocar-papel', {
          novoPapelRemoto: proximoPapel === 'piloto' ? 'navegador' : 'piloto',
        });
        const papelRotulo = t(proximoPapel === 'piloto' ? 'py3d.papelPilotoNome' : 'py3d.papelNavegadorNome');
        anunciar(t('py3d.anuncioPapelAlterado', { papel: papelRotulo }));
      },
    },
    h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'swap_horiz'),
    t('py3d.btnTrocarPapeis'),
  );

  const painelConfigDupla = h(
    'div',
    { class: 'py3d-dupla-painel oculto' },
    h(
      'div',
      { class: 'py3d-dupla-controles' },
      badgePapelDupla,
      inputParceiro,
      inputSala,
      btnTrocarPapel,
    ),
    dicaPapelDupla,
  );

  const btnAtivarDupla = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-neutro btn-sm flex-inline-icon',
      'aria-pressed': 'false',
      onclick: () => {
        modoDuplaAtivo = !modoDuplaAtivo;
        btnAtivarDupla.setAttribute('aria-pressed', String(modoDuplaAtivo));
        if (modoDuplaAtivo) {
          papelDupla = 'piloto';
          painelConfigDupla.classList.remove('oculto');
          conectarCanalDupla();
        } else {
          papelDupla = 'individual';
          linhaMarcadaNavegador = null;
          painelConfigDupla.classList.add('oculto');
          atualizarNumeracaoLinhas();
        }
        aplicarEstadoPapelDupla();
      },
    },
    h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'group'),
    t('py3d.btnModoDupla'),
  );

  // 4. Log textual acessível de passos (alternativa textual da animação 3D)
  const listaLogPassos = h('ol', {
    class: 'py3d-log-lista',
    'aria-live': 'polite',
    'aria-label': t('py3d.logAria'),
  }, h('li', { class: 'py3d-log-vazio' }, t('py3d.logVazio')));

  function adicionarItemLog(evento, limparAntes = false) {
    if (limparAntes) listaLogPassos.replaceChildren();
    const item = h('li', { class: 'py3d-log-item' }, traduzirEventoPython(evento));
    listaLogPassos.appendChild(item);
    listaLogPassos.scrollTop = listaLogPassos.scrollHeight;
  }

  function validarCriteriosExtras(codigo, resumo) {
    const crit = atividade.criteriosVerificacao || {};
    if (crit.exigirCondicional && !/\bif\b/.test(codigo)) {
      return { ok: false, msg: t('py3d.crit.condicional') };
    }
    if (crit.exigirLaco && !/\b(for|while)\b/.test(codigo)) {
      return { ok: false, msg: t('py3d.crit.laco') };
    }
    if (crit.exigirFuncao && !/\bdef\b/.test(codigo)) {
      return { ok: false, msg: t('py3d.crit.funcao') };
    }
    return { ok: resumo.sucesso, msg: traduzirResumoPython(resumo) };
  }

  // 5. Ações dos botões de controle pedagógico
  async function executarCodigoCompleto(remoto = false) {
    tentativas += 1;
    indicePassoManual = -1;
    if (!remoto) emitirSincronizacaoDupla('executar-remoto');

    caixaFeedback.className = 'atv-feedback info';
    caixaFeedback.textContent = t('py3d.interpretando');

    const codigo = textareaCodigo.value;
    const resposta = await executarNoWorkerOuFallback(codigo, atividade.cena3d);
    cacheUltimaExecucao = resposta;

    if (!resposta.ok) {
      const msgErro = traduzirErroWorkerPython(resposta);
      caixaFeedback.className = 'atv-feedback erro';
      caixaFeedback.textContent = msgErro;
      anunciar(msgErro);
      return;
    }

    listaLogPassos.replaceChildren();
    if (resposta.eventos.length === 0) {
      caixaFeedback.className = 'atv-feedback erro';
      caixaFeedback.textContent = t('py3d.nenhumaAcao');
      return;
    }

    timelineAtiva = controladorCena.reproduzirEventos(resposta.eventos, {
      velocidade,
      aoPasso: (ev) => {
        atualizarNumeracaoLinhas(ev.linha);
        adicionarItemLog(ev, false);
      },
      aoFinalizar: () => {
        atualizarNumeracaoLinhas(null);
        const validacao = validarCriteriosExtras(codigo, resposta.resumo);
        if (validacao.ok) {
          const estrelas = tentativas === 1 ? 3 : 2;
          const papelRotulo = t(papelDupla === 'piloto' ? 'py3d.papelPilotoNome' : 'py3d.papelNavegadorNome');
          const sufixoDupla = modoDuplaAtivo && parceiroDupla
            ? ` ${t('py3d.sufixoDupla', { papel: papelRotulo.toUpperCase(), parceiro: parceiroDupla })}`
            : '';
          const conclusaoTexto = atvConclusao(atividade);
          caixaFeedback.className = 'atv-feedback sucesso';
          caixaFeedback.replaceChildren(
            h('strong', {}, `${conclusaoTexto}${sufixoDupla}`),
            ' ',
            validacao.msg,
          );
          anunciar(conclusaoTexto);
          if (aoConcluir) {
            aoConcluir({
              tentativas,
              estrelas,
              codigoPython: codigo,
              parceiroDupla: modoDuplaAtivo ? parceiroDupla : null,
              papelDupla: modoDuplaAtivo ? papelDupla : 'individual',
            });
          }
        } else {
          caixaFeedback.className = 'atv-feedback erro';
          caixaFeedback.textContent = validacao.msg;
          anunciar(validacao.msg);
        }
      },
    });
  }

  function pausarExecucao() {
    if (timelineAtiva && typeof timelineAtiva.pause === 'function') {
      timelineAtiva.pause();
      caixaFeedback.className = 'atv-feedback info';
      caixaFeedback.textContent = t('py3d.animacaoPausada');
    }
  }

  async function executarPassoAPasso() {
    if (!cacheUltimaExecucao || !cacheUltimaExecucao.ok) {
      const resposta = await executarNoWorkerOuFallback(textareaCodigo.value, atividade.cena3d);
      cacheUltimaExecucao = resposta;
      indicePassoManual = -1;
      listaLogPassos.replaceChildren();
      if (!resposta.ok) {
        const msgErro = traduzirErroWorkerPython(resposta);
        caixaFeedback.className = 'atv-feedback erro';
        caixaFeedback.textContent = msgErro;
        anunciar(msgErro);
        return;
      }
    }

    pausarExecucao();
    const eventos = cacheUltimaExecucao.eventos || [];
    if (eventos.length === 0) return;

    indicePassoManual += 1;
    if (indicePassoManual >= eventos.length) {
      indicePassoManual = 0;
      listaLogPassos.replaceChildren();
    }

    const fatia = eventos.slice(0, indicePassoManual + 1);
    const eventoAtual = eventos[indicePassoManual];
    const descAtual = traduzirEventoPython(eventoAtual);
    atualizarNumeracaoLinhas(eventoAtual.linha);
    adicionarItemLog(eventoAtual, false);
    anunciar(descAtual);

    controladorCena.reproduzirEventos(fatia, {
      velocidade: 4,
      aoFinalizar: () => {
        caixaFeedback.className = 'atv-feedback info';
        caixaFeedback.textContent = t('py3d.passoDeStatus', { atual: indicePassoManual + 1, total: eventos.length, desc: descAtual });
      },
    });
  }

  function reiniciarTudo() {
    indicePassoManual = -1;
    cacheUltimaExecucao = null;
    controladorCena.reiniciarCena();
    atualizarNumeracaoLinhas(null);
    listaLogPassos.replaceChildren(
      h('li', { class: 'py3d-log-vazio' }, t('py3d.cenaReiniciadaLog')),
    );
    caixaFeedback.className = 'atv-feedback';
    caixaFeedback.textContent = '';
    anunciar(t('py3d.cenaReiniciadaAria'));
  }

  const btnExecutar = h(
    'button',
    { type: 'button', class: 'btn btn-primario flex-inline-icon', onclick: () => executarCodigoCompleto(false) },
    h('span', { class: 'material-symbols-outlined icon-sm', 'aria-hidden': 'true' }, 'play_arrow'),
    t('py3d.btnExecutar'),
  );

  const btnPausar = h(
    'button',
    { type: 'button', class: 'btn btn-neutro flex-inline-icon', onclick: pausarExecucao },
    h('span', { class: 'material-symbols-outlined icon-sm', 'aria-hidden': 'true' }, 'pause'),
    t('py3d.btnPausar'),
  );

  const btnPasso = h(
    'button',
    { type: 'button', class: 'btn btn-neutro flex-inline-icon', onclick: executarPassoAPasso },
    h('span', { class: 'material-symbols-outlined icon-sm', 'aria-hidden': 'true' }, 'step_over'),
    t('py3d.btnPasso'),
  );

  const btnReiniciar = h(
    'button',
    { type: 'button', class: 'btn btn-neutro flex-inline-icon', onclick: reiniciarTudo },
    h('span', { class: 'material-symbols-outlined icon-sm', 'aria-hidden': 'true' }, 'restart_alt'),
    t('robo.btnReiniciar'),
  );

  const selectVelocidade = h(
    'select',
    {
      class: 'py3d-select-velocidade',
      'aria-label': t('py3d.velAria'),
      onchange: (e) => { velocidade = Number(e.target.value) || 1; },
    },
    h('option', { value: '0.5' }, t('py3d.velLento')),
    h('option', { value: '1', selected: 'selected' }, t('py3d.velNormal')),
    h('option', { value: '2' }, t('py3d.velRapido')),
  );

  const btnAlternar2D = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-neutro btn-sm flex-inline-icon',
      onclick: () => {
        const novoModo = !controladorCena.estaEmModo2D();
        controladorCena.alternarModo2D(novoModo);
        btnAlternar2D.textContent = novoModo ? t('py3d.btnVisao3D') : t('py3d.btnModo2D');
      },
    },
    t('py3d.btnModo2D'),
  );

  const btnDica = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-neutro btn-sm flex-inline-icon',
      onclick: () => {
        const dicaTxt = atvDica(atividade);
        caixaFeedback.className = 'atv-feedback info';
        caixaFeedback.replaceChildren(h('strong', {}, `${t('py3d.dicaPrefixo')} `), dicaTxt);
        anunciar(t('jog.dicaPrefixo', { dica: dicaTxt }));
      },
    },
    h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'lightbulb'),
    t('py3d.btnVerDica'),
  );

  const btnRestaurarModelo = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-neutro btn-sm flex-inline-icon',
      onclick: () => {
        textareaCodigo.value = atividade.solucaoReferencia;
        rascunhosCodigo.set(atividade.id, textareaCodigo.value);
        atualizarNumeracaoLinhas();
        emitirSincronizacaoDupla('codigo-atualizado', { codigo: textareaCodigo.value });
        caixaFeedback.className = 'atv-feedback info';
        caixaFeedback.textContent = t('py3d.solucaoCarregada');
      },
    },
    h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'code'),
    t('py3d.btnVerSolucao'),
  );

  return h(
    'section',
    { class: 'py3d-shell', 'aria-label': t('py3d.shellAria') },
    h(
      'div',
      { class: 'py3d-barra-controles' },
      h('div', { class: 'py3d-grupo-botoes' }, btnExecutar, btnPasso, btnPausar, btnReiniciar),
      h('div', { class: 'py3d-grupo-opcoes' }, btnAtivarDupla, selectVelocidade, btnAlternar2D, btnDica, btnRestaurarModelo),
    ),
    painelConfigDupla,
    h(
      'div',
      { class: 'py3d-grid-principal' },
      h(
        'div',
        { class: 'py3d-coluna-palco' },
        containerPalco,
        h(
          'div',
          { class: 'py3d-log-painel' },
          h('h3', { class: 'py3d-subtitulo' }, t('py3d.logSubtitulo')),
          listaLogPassos,
        ),
      ),
      h(
        'div',
        { class: 'py3d-coluna-editor' },
        h(
          'div',
          { class: 'py3d-editor-topo' },
          h('span', { class: 'py3d-editor-arquivo' }, 'algoritmo_aluno.py · Python 3 (Pyodide Web Worker)'),
          h('span', { class: 'py3d-editor-atalho' }, 'API: robo.mover() | girar_direita() | coletar()'),
        ),
        h('div', { class: 'py3d-editor-corpo' }, colunaLinhas, textareaCodigo),
        caixaFeedback,
      ),
    ),
  );
}

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

let workerGlobal = null;
let contadorRequisicao = 0;

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
    'aria-label': `Cena 3D da atividade: ${atividade.titulo}`,
  });

  const controladorCena = criarControladorCena3D(containerPalco, atividade.cena3d, { reduzirMovimento });

  // 2. Editor de código com números de linha e destaque sincronizado
  const colunaLinhas = h('ol', { class: 'py3d-editor-linhas', 'aria-hidden': 'true' });
  const textareaCodigo = h('textarea', {
    class: 'py3d-editor-textarea',
    spellcheck: 'false',
    autocapitalize: 'off',
    autocomplete: 'off',
    'aria-label': 'Editor de código Python',
    rows: 12,
  }, atividade.codigoInicial || '');

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
            title: modoDuplaAtivo ? `Clique para marcar a linha ${i} para revisão da dupla` : `Linha ${i}`,
            onclick: () => {
              if (!modoDuplaAtivo) return;
              linhaMarcadaNavegador = linhaMarcadaNavegador === i ? null : i;
              atualizarNumeracaoLinhas(linhaDestacada);
              emitirSincronizacaoDupla('marcar-linha', { linha: linhaMarcadaNavegador });
              if (linhaMarcadaNavegador) {
                const msg = `Navegador destacou a linha ${i} para revisão conjunta com o Piloto.`;
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
    cacheUltimaExecucao = null;
    indicePassoManual = -1;
    atualizarNumeracaoLinhas();
    emitirSincronizacaoDupla('codigo-atualizado', { codigo: textareaCodigo.value });
  });
  atualizarNumeracaoLinhas();

  // 3. Barra do Modo Desafio Colaborativo (Pair Programming Escolar: Piloto + Navegador)
  const badgePapelDupla = h('span', { class: 'py3d-dupla-badge' }, 'Modo Individual');
  const inputParceiro = h('input', {
    type: 'text',
    class: 'py3d-dupla-input',
    placeholder: 'Nome do colega da dupla (ex.: Sofia Oliveira)',
    'aria-label': 'Nome do colega da dupla de Pair Programming',
    oninput: (e) => {
      parceiroDupla = e.target.value.trim();
      emitirSincronizacaoDupla('parceiro-atualizado', { parceiro: parceiroDupla });
    },
  });
  const inputSala = h('input', {
    type: 'text',
    class: 'py3d-dupla-input py3d-dupla-sala',
    value: codigoSalaDupla,
    'aria-label': 'Código da sala colaborativa',
    onchange: (e) => {
      codigoSalaDupla = e.target.value.trim().toUpperCase() || codigoSalaDupla;
    },
  });

  const dicaPapelDupla = h(
    'p',
    { class: 'py3d-dupla-orientacao' },
    'No Pair Programming escolar, o Piloto digita o código Python enquanto o Navegador inspeciona a cena 3D, clica nos números de linha para apontar ajustes e sugere a estratégia.',
  );

  function aplicarEstadoPapelDupla() {
    if (!modoDuplaAtivo) {
      papelDupla = 'individual';
      badgePapelDupla.textContent = 'Modo Individual';
      badgePapelDupla.className = 'py3d-dupla-badge';
      textareaCodigo.removeAttribute('readonly');
      return;
    }
    if (papelDupla === 'piloto') {
      badgePapelDupla.textContent = 'Papel: PILOTO (Codificação Python)';
      badgePapelDupla.className = 'py3d-dupla-badge piloto';
      textareaCodigo.removeAttribute('readonly');
      dicaPapelDupla.textContent = 'Você está como PILOTO: escreva o código Python no editor em diálogo com o Navegador da sua dupla.';
    } else {
      badgePapelDupla.textContent = 'Papel: NAVEGADOR (Inspeção 3D & Revisão)';
      badgePapelDupla.className = 'py3d-dupla-badge navegador';
      dicaPapelDupla.textContent = 'Você está como NAVEGADOR: gire a cena 3D, clique no número de uma linha do código para destacá-la ao Piloto e valide a lógica antes de executar!';
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
          atualizarNumeracaoLinhas();
        } else if (msg.tipoEvento === 'marcar-linha') {
          linhaMarcadaNavegador = msg.linha;
          atualizarNumeracaoLinhas();
        } else if (msg.tipoEvento === 'trocar-papel') {
          papelDupla = msg.novoPapelRemoto;
          aplicarEstadoPapelDupla();
        } else if (msg.tipoEvento === 'executar-remoto') {
          executarCodigoCompleto(true);
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
        anunciar(`Papel alterado para ${proximoPapel}.`);
      },
    },
    h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'swap_horiz'),
    'Trocar Papéis (Piloto ↔ Navegador)',
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
    'Modo Dupla (Pair Programming)',
  );

  // 4. Log textual acessível de passos (alternativa textual da animação 3D)
  const listaLogPassos = h('ol', {
    class: 'py3d-log-lista',
    'aria-live': 'polite',
    'aria-label': 'Registro textual passo a passo da animação 3D',
  }, h('li', { class: 'py3d-log-vazio' }, 'Clique em "Executar Python" ou "Passo a Passo" para ver o registro de ações do robô.'));

  function adicionarItemLog(evento, limparAntes = false) {
    if (limparAntes) listaLogPassos.replaceChildren();
    const item = h('li', { class: 'py3d-log-item' }, evento.descricao || `Linha ${evento.linha}: ${evento.tipo}`);
    listaLogPassos.appendChild(item);
    listaLogPassos.scrollTop = listaLogPassos.scrollHeight;
  }

  function validarCriteriosExtras(codigo, resumo) {
    const crit = atividade.criteriosVerificacao || {};
    if (crit.exigirCondicional && !/\bif\b/.test(codigo)) {
      return { ok: false, msg: 'Quase lá! Para concluir este desafio, utilize uma estrutura condicional "if" no seu código Python.' };
    }
    if (crit.exigirLaco && !/\b(for|while)\b/.test(codigo)) {
      return { ok: false, msg: 'Use um laço de repetição ("for" ou "while") para automatizar o percurso sem repetir linhas!' };
    }
    if (crit.exigirFuncao && !/\bdef\b/.test(codigo)) {
      return { ok: false, msg: 'Mantenha a definição de função com "def" para decompor o problema!' };
    }
    return { ok: resumo.sucesso, msg: resumo.motivo };
  }

  // 5. Ações dos botões de controle pedagógico
  async function executarCodigoCompleto(remoto = false) {
    tentativas += 1;
    indicePassoManual = -1;
    if (!remoto) emitirSincronizacaoDupla('executar-remoto');

    caixaFeedback.className = 'atv-feedback info';
    caixaFeedback.textContent = 'Interpretando código Python e preparando simulação 3D...';

    const codigo = textareaCodigo.value;
    const resposta = await executarNoWorkerOuFallback(codigo, atividade.cena3d);
    cacheUltimaExecucao = resposta;

    if (!resposta.ok) {
      caixaFeedback.className = 'atv-feedback erro';
      caixaFeedback.textContent = resposta.erro;
      anunciar(resposta.erro);
      return;
    }

    listaLogPassos.replaceChildren();
    if (resposta.eventos.length === 0) {
      caixaFeedback.className = 'atv-feedback erro';
      caixaFeedback.textContent = 'Seu código executou sem erros, mas nenhuma ação 3D foi chamada. Use os comandos da API!';
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
          const sufixoDupla = modoDuplaAtivo && parceiroDupla
            ? ` (Dupla colaborativa: ${papelDupla.toUpperCase()} com ${parceiroDupla})`
            : '';
          caixaFeedback.className = 'atv-feedback sucesso';
          caixaFeedback.innerHTML = `<strong>${atividade.conclusao}${sufixoDupla}</strong> ${validacao.msg}`;
          anunciar(atividade.conclusao);
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
      caixaFeedback.textContent = 'Animação pausada. Clique em "Passo a Passo" ou "Executar Python" para continuar.';
    }
  }

  async function executarPassoAPasso() {
    if (!cacheUltimaExecucao || !cacheUltimaExecucao.ok) {
      const resposta = await executarNoWorkerOuFallback(textareaCodigo.value, atividade.cena3d);
      cacheUltimaExecucao = resposta;
      indicePassoManual = -1;
      listaLogPassos.replaceChildren();
      if (!resposta.ok) {
        caixaFeedback.className = 'atv-feedback erro';
        caixaFeedback.textContent = resposta.erro;
        anunciar(resposta.erro);
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
    atualizarNumeracaoLinhas(eventoAtual.linha);
    adicionarItemLog(eventoAtual, false);
    anunciar(eventoAtual.descricao);

    controladorCena.reproduzirEventos(fatia, {
      velocidade: 4,
      aoFinalizar: () => {
        caixaFeedback.className = 'atv-feedback info';
        caixaFeedback.textContent = `Passo ${indicePassoManual + 1} de ${eventos.length} — ${eventoAtual.descricao}`;
      },
    });
  }

  function reiniciarTudo() {
    indicePassoManual = -1;
    cacheUltimaExecucao = null;
    controladorCena.reiniciarCena();
    atualizarNumeracaoLinhas(null);
    listaLogPassos.replaceChildren(
      h('li', { class: 'py3d-log-vazio' }, 'Cena reiniciada. Pronto para nova execução.'),
    );
    caixaFeedback.className = 'atv-feedback';
    caixaFeedback.textContent = '';
    anunciar('Cena 3D reiniciada.');
  }

  const btnExecutar = h(
    'button',
    { type: 'button', class: 'btn btn-primario flex-inline-icon', onclick: () => executarCodigoCompleto(false) },
    h('span', { class: 'material-symbols-outlined icon-sm', 'aria-hidden': 'true' }, 'play_arrow'),
    'Executar Python',
  );

  const btnPausar = h(
    'button',
    { type: 'button', class: 'btn btn-neutro flex-inline-icon', onclick: pausarExecucao },
    h('span', { class: 'material-symbols-outlined icon-sm', 'aria-hidden': 'true' }, 'pause'),
    'Pausar',
  );

  const btnPasso = h(
    'button',
    { type: 'button', class: 'btn btn-neutro flex-inline-icon', onclick: executarPassoAPasso },
    h('span', { class: 'material-symbols-outlined icon-sm', 'aria-hidden': 'true' }, 'step_over'),
    'Passo a Passo',
  );

  const btnReiniciar = h(
    'button',
    { type: 'button', class: 'btn btn-neutro flex-inline-icon', onclick: reiniciarTudo },
    h('span', { class: 'material-symbols-outlined icon-sm', 'aria-hidden': 'true' }, 'restart_alt'),
    'Reiniciar',
  );

  const selectVelocidade = h(
    'select',
    {
      class: 'py3d-select-velocidade',
      'aria-label': 'Velocidade da animação 3D',
      onchange: (e) => { velocidade = Number(e.target.value) || 1; },
    },
    h('option', { value: '0.5' }, 'Velocidade: 0.5x (Lento)'),
    h('option', { value: '1', selected: 'selected' }, 'Velocidade: 1x (Normal)'),
    h('option', { value: '2' }, 'Velocidade: 2x (Rápido)'),
  );

  const btnAlternar2D = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-neutro btn-sm flex-inline-icon',
      onclick: () => {
        const novoModo = !controladorCena.estaEmModo2D();
        controladorCena.alternarModo2D(novoModo);
        btnAlternar2D.textContent = novoModo ? 'Ativar Visão 3D (WebGL)' : 'Modo 2D Leve';
      },
    },
    'Modo 2D Leve',
  );

  const btnDica = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-neutro btn-sm flex-inline-icon',
      onclick: () => {
        caixaFeedback.className = 'atv-feedback info';
        caixaFeedback.innerHTML = `<strong>Dica pedagógica:</strong> ${atividade.dica}`;
        anunciar(`Dica: ${atividade.dica}`);
      },
    },
    h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'lightbulb'),
    'Ver Dica',
  );

  const btnRestaurarModelo = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-neutro btn-sm flex-inline-icon',
      onclick: () => {
        textareaCodigo.value = atividade.solucaoReferencia;
        atualizarNumeracaoLinhas();
        emitirSincronizacaoDupla('codigo-atualizado', { codigo: textareaCodigo.value });
        caixaFeedback.className = 'atv-feedback info';
        caixaFeedback.textContent = 'Exemplo de solução carregado no editor. Analise cada linha e clique em Executar Python!';
      },
    },
    h('span', { class: 'material-symbols-outlined icon-xs', 'aria-hidden': 'true' }, 'code'),
    'Ver Solução Exemplo',
  );

  return h(
    'section',
    { class: 'py3d-shell', 'aria-label': 'Laboratório 3D de Lógica de Programação em Python' },
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
          h('h3', { class: 'py3d-subtitulo' }, 'Log de Execução (Alternativa Textual Acessível)'),
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

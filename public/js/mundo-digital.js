/**
 * ============================================================================
 * LMS COMPASSO — EIXO MUNDO DIGITAL (SIMULAÇÕES INTERATIVAS 3D & HARDWARE)
 * ============================================================================
 * Gerencia a inspeção de componentes da placa-mãe, montagem interativa (PC Builder),
 * ciclo da CPU (Busca-Decodifica-Executa) e envio de pacotes de rede TCP/IP.
 * Suporta internacionalização (i18n) em tempo real via i18n.js.
 * ============================================================================
 */
import { t } from '/js/i18n.js';

// Informações Didáticas e BNCC dos Componentes de Hardware
function obterDadosHardware() {
  return {
    cpu: {
      nome: t('md.cpu.nome'),
      categoria: t('md.cpu.categoria'),
      icone: 'memory',
      cor: '#38bdf8',
      descricao: t('md.cpu.desc'),
      analogia: t('md.cpu.analogia'),
      specs: {
        [t('md.spec.velTipica')]: t('md.cpu.spec1'),
        [t('md.spec.unidInternas')]: t('md.cpu.spec2'),
        [t('md.spec.bncc')]: t('md.cpu.spec3'),
      },
    },
    ram: {
      nome: t('md.ram.nome'),
      categoria: t('md.ram.categoria'),
      icone: 'storage',
      cor: '#38bdf8',
      descricao: t('md.ram.desc'),
      analogia: t('md.ram.analogia'),
      specs: {
        [t('md.spec.tecAtual')]: t('md.ram.spec1'),
        [t('md.spec.volatilidade')]: t('md.ram.spec2'),
        [t('md.spec.bncc')]: t('md.ram.spec3'),
      },
    },
    ssd: {
      nome: t('md.ssd.nome'),
      categoria: t('md.ssd.categoria'),
      icone: 'save',
      cor: '#a855f7',
      descricao: t('md.ssd.desc'),
      analogia: t('md.ssd.analogia'),
      specs: {
        [t('md.spec.interface')]: t('md.ssd.spec1'),
        [t('md.spec.volatilidade')]: t('md.ssd.spec2'),
        [t('md.spec.bncc')]: t('md.ssd.spec3'),
      },
    },
    gpu: {
      nome: t('md.gpu.nome'),
      categoria: t('md.gpu.categoria'),
      icone: 'videogame_asset',
      cor: '#f59e0b',
      descricao: t('md.gpu.desc'),
      analogia: t('md.gpu.analogia'),
      specs: {
        [t('md.spec.memoria')]: t('md.gpu.spec1'),
        [t('md.spec.saidasVideo')]: t('md.gpu.spec2'),
        [t('md.spec.bncc')]: t('md.gpu.spec3'),
      },
    },
    io: {
      nome: t('md.io.nome'),
      categoria: t('md.io.categoria'),
      icone: 'usb',
      cor: '#10b981',
      descricao: t('md.io.desc'),
      analogia: t('md.io.analogia'),
      specs: {
        [t('md.spec.entradas')]: t('md.io.spec1'),
        [t('md.spec.saidas')]: t('md.io.spec2'),
        [t('md.spec.bncc')]: t('md.io.spec3'),
      },
    },
  };
}

// Som suave sintetizado via Web Audio API (sem dependência de arquivos externos)
function emitirBeep(frequencia = 520, duracao = 0.12, tipo = 'sine') {
  try {
    const AudioContexto = window.AudioContext || window.webkitAudioContext;
    if (!AudioContexto) return;
    const ctx = new AudioContexto();
    const oscilador = ctx.createOscillator();
    const ganho = ctx.createGain();
    oscilador.type = tipo;
    oscilador.frequency.setValueAtTime(frequencia, ctx.currentTime);
    ganho.gain.setValueAtTime(0.08, ctx.currentTime);
    ganho.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracao);
    oscilador.connect(ganho);
    ganho.connect(ctx.destination);
    oscilador.start();
    oscilador.stop(ctx.currentTime + duracao);
  } catch {
    // Modo silencioso se o navegador bloquear autoplay
  }
}

// Estado compartilhado para reatividade de i18n
let componenteAtivo = 'cpu';
let atualizarPainelHardware = null;
let atualizarPCBuilder = null;
let atualizarCicloCPU = null;
let atualizarRede = null;

document.addEventListener('DOMContentLoaded', () => {
  inicializarInspecaoHardware();
  inicializarControles3D();
  inicializarPCBuilder();
  inicializarCicloCPU();
  inicializarSimuladorRede();
});

// Reatividade ao trocar de idioma no menu universal
window.addEventListener('idiomaAlterado', () => {
  if (atualizarPainelHardware) atualizarPainelHardware();
  if (atualizarPCBuilder) atualizarPCBuilder();
  if (atualizarCicloCPU) atualizarCicloCPU();
  if (atualizarRede) atualizarRede();
});

/* ---------------------------------------------------------------------------
 * 1. Inspeção de Componentes da Placa-Mãe (Modo Raio-X)
 * ------------------------------------------------------------------------ */
function inicializarInspecaoHardware() {
  const slots = document.querySelectorAll('.md-slot-componente');
  const tituloEl = document.getElementById('painel-titulo-comp');
  const catEl = document.getElementById('painel-cat-comp');
  const descEl = document.getElementById('painel-desc-comp');
  const analogiaEl = document.getElementById('painel-analogia-comp');
  const specsGrid = document.getElementById('painel-specs-grid');
  const iconeWrap = document.getElementById('painel-icone-wrap');

  function exibirComponente(chave, tocarSom = true) {
    componenteAtivo = chave;
    const dadosHardware = obterDadosHardware();
    const dados = dadosHardware[chave];
    if (!dados) return;

    slots.forEach((s) => s.classList.remove('selecionado'));
    const slotAtivo = document.querySelector(`.md-slot-componente[data-componente="${chave}"]`);
    if (slotAtivo) slotAtivo.classList.add('selecionado');

    if (tituloEl) tituloEl.textContent = dados.nome;
    if (catEl) catEl.textContent = dados.categoria;
    if (descEl) descEl.textContent = dados.descricao;
    if (analogiaEl) analogiaEl.textContent = dados.analogia;
    if (iconeWrap) {
      iconeWrap.innerHTML = `<span class="material-symbols-outlined">${dados.icone}</span>`;
      iconeWrap.style.color = dados.cor;
    }

    if (specsGrid) {
      specsGrid.innerHTML = '';
      Object.entries(dados.specs).forEach(([chaveSpec, valorSpec]) => {
        const item = document.createElement('div');
        item.className = 'md-spec-item';
        item.innerHTML = `
          <span class="md-spec-rotulo">${chaveSpec}</span>
          <span class="md-spec-valor">${valorSpec}</span>
        `;
        specsGrid.appendChild(item);
      });
    }

    if (tocarSom) emitirBeep(440, 0.08);
  }

  atualizarPainelHardware = () => exibirComponente(componenteAtivo, false);

  slots.forEach((slot) => {
    slot.addEventListener('click', () => {
      exibirComponente(slot.dataset.componente);
    });

    slot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        exibirComponente(slot.dataset.componente);
      }
    });
  });

  // Exibe CPU por padrão
  exibirComponente('cpu', false);
}

/* ---------------------------------------------------------------------------
 * 2. Controles de Rotação 3D da Placa-Mãe
 * ------------------------------------------------------------------------ */
function inicializarControles3D() {
  const placa = document.getElementById('placa-mae-3d');
  const botoesVista = document.querySelectorAll('.btn-vista');

  botoesVista.forEach((btn) => {
    btn.addEventListener('click', () => {
      botoesVista.forEach((b) => b.classList.remove('ativo'));
      btn.classList.add('ativo');

      const vista = btn.dataset.vista;
      if (placa) {
        placa.classList.remove('vista-isometrica', 'vista-topo', 'vista-lateral');
        placa.classList.add(`vista-${vista}`);
        emitirBeep(580, 0.06);
      }
    });
  });
}

/* ---------------------------------------------------------------------------
 * 3. Desafio Interativo "Monte o Computador" (PC Builder)
 * ------------------------------------------------------------------------ */
function inicializarPCBuilder() {
  function obterEtapas() {
    return [
      { id: 'cpu', nome: t('md.pcEtapa1'), seletor: '.md-slot-cpu' },
      { id: 'ram', nome: t('md.pcEtapa2'), seletor: '.md-slot-ram' },
      { id: 'ssd', nome: t('md.pcEtapa3'), seletor: '.md-slot-ssd' },
      { id: 'gpu', nome: t('md.pcEtapa4'), seletor: '.md-slot-gpu' },
      { id: 'ligar', nome: t('md.pcEtapa5'), seletor: '#status-post-badge' },
    ];
  }

  let indiceEtapaAtual = 0;
  const btnInstalar = document.getElementById('btn-instalar-etapa');
  const btnResetar = document.getElementById('btn-reset-montagem');
  const progressoTexto = document.getElementById('texto-progresso-montagem');
  const listaEtapasEl = document.getElementById('lista-etapas-montagem');
  const placa = document.getElementById('placa-mae-3d');
  const statusPost = document.getElementById('status-post-badge');

  function renderizarListaEtapas() {
    const etapas = obterEtapas();
    if (!listaEtapasEl) return;
    listaEtapasEl.innerHTML = '';

    etapas.forEach((etapa, idx) => {
      const li = document.createElement('li');
      li.className = `md-etapa-item ${idx < indiceEtapaAtual ? 'concluida' : ''}`;
      li.innerHTML = `
        <span class="material-symbols-outlined md-etapa-icone">
          ${idx < indiceEtapaAtual ? 'check_circle' : 'radio_button_unchecked'}
        </span>
        <span>${etapa.nome}</span>
      `;
      listaEtapasEl.appendChild(li);
    });

    if (progressoTexto) {
      progressoTexto.textContent = t('md.pcBuilderProgresso', {
        instalados: indiceEtapaAtual,
        total: etapas.length,
      });
    }

    if (btnInstalar) {
      if (indiceEtapaAtual < etapas.length - 1) {
        btnInstalar.innerHTML = `<span class="material-symbols-outlined">add_circle</span> ${t('md.btnEncaixar')}`;
        btnInstalar.disabled = false;
      } else if (indiceEtapaAtual === etapas.length - 1) {
        btnInstalar.innerHTML = `<span class="material-symbols-outlined">power_settings_new</span> ${t('md.btnLigar')}`;
        btnInstalar.disabled = false;
      } else {
        btnInstalar.innerHTML = `<span class="material-symbols-outlined">done_all</span> ${t('md.btnMontado')}`;
        btnInstalar.disabled = true;
      }
    }

    if (statusPost) {
      const textoPost = statusPost.classList.contains('ligado')
        ? t('md.statusPostAtivo')
        : t('md.statusPostEspera');
      statusPost.innerHTML = `<span class="md-led-status"></span> <span id="texto-status-post">${textoPost}</span>`;
    }
  }

  atualizarPCBuilder = renderizarListaEtapas;

  if (btnInstalar) {
    btnInstalar.addEventListener('click', () => {
      const etapas = obterEtapas();
      if (indiceEtapaAtual >= etapas.length) return;

      const etapaAtual = etapas[indiceEtapaAtual];
      if (etapaAtual.id === 'ligar') {
        if (placa) placa.classList.add('ligada');
        if (statusPost) statusPost.classList.add('ligado');
        emitirBeep(880, 0.25);
        setTimeout(() => emitirBeep(1320, 0.3), 150);
      } else {
        const elementoAlvo = document.querySelector(etapaAtual.seletor);
        if (elementoAlvo) elementoAlvo.classList.add('instalado');
        emitirBeep(660, 0.1);
      }

      indiceEtapaAtual++;
      renderizarListaEtapas();
    });
  }

  if (btnResetar) {
    btnResetar.addEventListener('click', () => {
      indiceEtapaAtual = 0;
      document.querySelectorAll('.md-slot-componente').forEach((slot) => {
        slot.classList.remove('instalado');
      });
      if (placa) placa.classList.remove('ligada');
      if (statusPost) statusPost.classList.remove('ligado');
      renderizarListaEtapas();
      emitirBeep(330, 0.1);
    });
  }

  renderizarListaEtapas();
}

/* ---------------------------------------------------------------------------
 * 4. Simulador do Ciclo da CPU (Busca - Decodificação - Execução)
 * ------------------------------------------------------------------------ */
function inicializarCicloCPU() {
  function obterPassos() {
    return [
      {
        id: 'busca',
        fase: `${t('md.cpuFase1')} ${t('md.cpuBuscaTitulo')}`,
        titulo: t('md.cpuBuscaTitulo'),
        descricao: t('md.cpuBuscaDesc'),
        blocoAtivo: 'cpu-bloco-ir',
        pulso: true,
        valorIR: 'OP_SOMAR [0x01]',
        valorULA: t('md.cpuAguardandoOperandos'),
      },
      {
        id: 'decodifica',
        fase: `${t('md.cpuFase2')} ${t('md.cpuDecodificaTitulo')}`,
        titulo: t('md.cpuDecodificaTitulo'),
        descricao: t('md.cpuDecodificaDesc'),
        blocoAtivo: 'cpu-bloco-uc',
        pulso: false,
        valorIR: 'OP_SOMAR (R1, R2)',
        valorULA: t('md.cpuCarregadoValores'),
      },
      {
        id: 'executa',
        fase: `${t('md.cpuFase3')} ${t('md.cpuExecutaTitulo')}`,
        titulo: t('md.cpuExecutaTitulo'),
        descricao: t('md.cpuExecutaDesc'),
        blocoAtivo: 'cpu-bloco-ula',
        pulso: true,
        valorIR: t('md.cpuInstrucaoConcluida'),
        valorULA: t('md.cpuResultado'),
      },
    ];
  }

  let passoAtual = 0;
  let timerCiclo = null;

  const btnPasso = document.getElementById('btn-cpu-passo');
  const btnAuto = document.getElementById('btn-cpu-auto');
  const irEl = document.getElementById('cpu-valor-ir');
  const ulaEl = document.getElementById('cpu-valor-ula');
  const pulsoEl = document.getElementById('pulso-barramento-cpu');
  const passosEl = document.querySelectorAll('.md-passo-ciclo');
  const blocosEl = document.querySelectorAll('.md-cpu-bloco');

  function renderizarPasso(indice, tocarSom = true) {
    const passos = obterPassos();
    const dadosPasso = passos[indice];
    if (!dadosPasso) return;

    passosEl.forEach((p, idx) => {
      p.classList.toggle('ativo', idx === indice);
    });

    blocosEl.forEach((b) => b.classList.remove('ativo'));
    const bloco = document.getElementById(dadosPasso.blocoAtivo);
    if (bloco) bloco.classList.add('ativo');

    if (irEl) irEl.textContent = dadosPasso.valorIR;
    if (ulaEl) ulaEl.textContent = dadosPasso.valorULA;

    if (pulsoEl) {
      pulsoEl.classList.remove('animando');
      if (dadosPasso.pulso) {
        void pulsoEl.offsetWidth; // Força repaint
        pulsoEl.classList.add('animando');
      }
    }

    if (tocarSom) emitirBeep(520 + indice * 120, 0.1);
  }

  atualizarCicloCPU = () => {
    renderizarPasso(passoAtual, false);
    if (btnAuto) {
      if (timerCiclo) {
        btnAuto.innerHTML = `<span class="material-symbols-outlined">pause</span> ${t('md.btnCpuPausar')}`;
      } else {
        btnAuto.innerHTML = `<span class="material-symbols-outlined">play_arrow</span> ${t('md.btnCpuAuto')}`;
      }
    }
  };

  if (btnPasso) {
    btnPasso.addEventListener('click', () => {
      if (timerCiclo) {
        clearInterval(timerCiclo);
        timerCiclo = null;
        if (btnAuto) btnAuto.innerHTML = `<span class="material-symbols-outlined">play_arrow</span> ${t('md.btnCpuAuto')}`;
      }
      const passos = obterPassos();
      passoAtual = (passoAtual + 1) % passos.length;
      renderizarPasso(passoAtual);
    });
  }

  if (btnAuto) {
    btnAuto.addEventListener('click', () => {
      if (timerCiclo) {
        clearInterval(timerCiclo);
        timerCiclo = null;
        btnAuto.innerHTML = `<span class="material-symbols-outlined">play_arrow</span> ${t('md.btnCpuAuto')}`;
      } else {
        btnAuto.innerHTML = `<span class="material-symbols-outlined">pause</span> ${t('md.btnCpuPausar')}`;
        timerCiclo = setInterval(() => {
          const passos = obterPassos();
          passoAtual = (passoAtual + 1) % passos.length;
          renderizarPasso(passoAtual);
        }, 1800);
      }
    });
  }

  renderizarPasso(0, false);
}

/* ---------------------------------------------------------------------------
 * 5. Simulador de Redes e Pacotes TCP/IP
 * ------------------------------------------------------------------------ */
function inicializarSimuladorRede() {
  const btnEnviar = document.getElementById('btn-enviar-pacote');
  const btnPerda = document.getElementById('btn-simular-perda');
  const pacoteAnim = document.getElementById('pacote-animado-rede');
  const nós = document.querySelectorAll('.md-no-rede');
  const seqEl = document.getElementById('pacote-seq-num');
  const statusEl = document.getElementById('pacote-status-txt');

  let simularPerdaAtiva = false;
  let emEnvio = false;

  atualizarRede = () => {
    if (btnPerda) {
      btnPerda.textContent = simularPerdaAtiva ? t('md.btnPerdaAtivada') : t('md.btnSimularPerda');
    }
    if (!emEnvio && statusEl) {
      statusEl.textContent = t('md.redeStatusPronto');
    }
  };

  if (btnPerda) {
    btnPerda.addEventListener('click', () => {
      simularPerdaAtiva = !simularPerdaAtiva;
      btnPerda.classList.toggle('ativo', simularPerdaAtiva);
      btnPerda.textContent = simularPerdaAtiva ? t('md.btnPerdaAtivada') : t('md.btnSimularPerda');
      emitirBeep(simularPerdaAtiva ? 300 : 600, 0.1);
    });
  }

  if (btnEnviar) {
    btnEnviar.addEventListener('click', () => {
      emEnvio = true;
      btnEnviar.disabled = true;
      if (pacoteAnim) pacoteAnim.classList.add('viajando');
      if (statusEl) statusEl.textContent = t('md.redeStatusEnviando');

      // Animar nós sequencialmente
      nós.forEach((no, idx) => {
        setTimeout(() => {
          nós.forEach((n) => n.classList.remove('ativo'));
          no.classList.add('ativo');
          emitirBeep(480 + idx * 80, 0.08);
        }, idx * 600);
      });

      setTimeout(() => {
        if (pacoteAnim) pacoteAnim.classList.remove('viajando');
        btnEnviar.disabled = false;
        emEnvio = false;

        if (simularPerdaAtiva) {
          if (statusEl) statusEl.textContent = t('md.redeStatusPerda');
          emitirBeep(280, 0.2);
          setTimeout(() => emitirBeep(700, 0.15), 300);
        } else {
          if (statusEl) statusEl.textContent = t('md.redeStatusSucesso');
          emitirBeep(880, 0.2);
        }

        if (seqEl) {
          seqEl.textContent = Math.floor(Math.random() * 90000 + 10000);
        }
      }, 2500);
    });
  }
}

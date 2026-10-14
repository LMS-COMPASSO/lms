/**
 * ============================================================================
 * LMS COMPASSO — EIXO MUNDO DIGITAL (SIMULAÇÕES INTERATIVAS 3D & HARDWARE)
 * ============================================================================
 * Gerencia a inspeção de componentes da placa-mãe, montagem interativa (PC Builder),
 * ciclo da CPU (Busca-Decodifica-Executa) e envio de pacotes de rede TCP/IP.
 * ============================================================================
 */

// Informações Didáticas e BNCC dos Componentes de Hardware
const DADOS_HARDWARE = {
  cpu: {
    nome: "Processador Central (CPU)",
    categoria: "Unidade de Processamento (Cérebro do Computador)",
    icone: "memory",
    cor: "#38bdf8",
    descricao: "A CPU (Central Processing Unit) executa as instruções de todos os programas. Ela interpreta cálculos matemáticos e lógicos através de bilhões de ciclos elétricos por segundo.",
    analogia: "É como o Chef de Cozinha de um restaurante: recebe os pedidos (instruções), prepara as receitas e comanda a equipe.",
    specs: {
      "Velocidade Típica": "3.2 a 5.0 GHz (Bilhões de ciclos/s)",
      "Unidades Internas": "ULA (Cálculos), UC (Controle), Registradores",
      "BNCC Computação": "EF05CO03 (Arquitetura e Ciclo de Execução)"
    }
  },
  ram: {
    nome: "Memória Principal (RAM DDR5)",
    categoria: "Armazenamento Primário Volátil de Alta Velocidade",
    icone: "storage",
    cor: "#38bdf8",
    descricao: "A RAM (Random Access Memory) armazena os dados que a CPU precisa ler imediatamente. É ultrarrápida, porém volátil: ao desligar o computador, tudo que está nela se apaga.",
    analogia: "É a mesa de estudos do aluno: enquanto você estuda, seus cadernos ficam abertos nela. Quando a aula acaba, a mesa é limpa.",
    specs: {
      "Tecnologia Atual": "DDR5 a 5600 MT/s",
      "Volatilidade": "Sim (Apaga sem energia elétrica)",
      "BNCC Computação": "EF02CO03 (Diferença entre RAM e Armazenamento)"
    }
  },
  ssd: {
    nome: "Armazenamento Secundário (SSD NVMe M.2)",
    categoria: "Armazenamento Permanente Não-Volátil",
    icone: "save",
    cor: "#a855f7",
    descricao: "O SSD (Solid State Drive) armazena permanentemente o sistema operacional, fotos, jogos e documentos em chips de memória flash que não dependem de energia para reter informações.",
    analogia: "É a mochila escolar ou a estante de livros: mesmo depois que você vai dormir, seus livros continuam guardados com segurança.",
    specs: {
      "Interface": "PCIe 4.0 NVMe (Até 7.000 MB/s)",
      "Volatilidade": "Não-volátil (Permanente)",
      "BNCC Computação": "EF02CO03 (Armazenamento de Dados)"
    }
  },
  gpu: {
    nome: "Placa de Vídeo Dedicada (GPU)",
    categoria: "Processamento Gráfico e Paralelo",
    icone: "videogame_asset",
    cor: "#f59e0b",
    descricao: "A GPU possui milhares de pequenos núcleos projetados para calcular simultaneamente milhões de polígonos, texturas e efeitos de iluminação em tempo real para o monitor.",
    analogia: "Se a CPU é um único cientista genial, a GPU é um batalhão de 5.000 desenhistas desenhando cada detalhe do jogo ao mesmo tempo.",
    specs: {
      "Memória": "VRAM GDDR6 Dedicada",
      "Saídas de Vídeo": "HDMI 2.1 e DisplayPort 1.4",
      "BNCC Computação": "EF01CO04 (Periféricos e Saída Visual)"
    }
  },
  io: {
    nome: "Painel Traseiro de Conexões (Portas I/O)",
    categoria: "Interface de Entrada e Saída (Input / Output)",
    icone: "usb",
    cor: "#10b981",
    descricao: "Central de conexões físicas que conecta o computador ao mundo: portas USB para periféricos de entrada (teclado/mouse), HDMI para saída visual e conector RJ-45 para cabos de rede.",
    analogia: "São as portas e janelas de uma casa: por onde as cartas entram (dados) e por onde os moradores conversam com o exterior.",
    specs: {
      "Entradas": "USB (Teclado, Mouse, Microfone)",
      "Saídas": "HDMI (Tela/Monitor), Áudio (Caixas de som)",
      "BNCC Computação": "EF01CO04 / EF02CO03 (Classificação I/O)"
    }
  }
};

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

document.addEventListener('DOMContentLoaded', () => {
  inicializarInspecaoHardware();
  inicializarControles3D();
  inicializarPCBuilder();
  inicializarCicloCPU();
  inicializarSimuladorRede();
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

  function exibirComponente(chave) {
    const dados = DADOS_HARDWARE[chave];
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

    emitirBeep(440, 0.08);
  }

  slots.forEach((slot) => {
    slot.addEventListener('click', () => {
      const comp = slot.dataset.componente;
      exibirComponente(comp);
    });

    slot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        exibirComponente(slot.dataset.componente);
      }
    });
  });

  // Exibe CPU por padrão
  exibirComponente('cpu');
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
  const etapas = [
    { id: 'cpu', nome: '1. Encaixar o Processador no Socket', seletor: '.md-slot-cpu' },
    { id: 'ram', nome: '2. Inserir o Pente de Memória RAM', seletor: '.md-slot-ram' },
    { id: 'ssd', nome: '3. Conectar a Unidade SSD M.2', seletor: '.md-slot-ssd' },
    { id: 'gpu', nome: '4. Instalar a Placa de Vídeo no Slot PCIe', seletor: '.md-slot-gpu' },
    { id: 'ligar', nome: '5. Ligar e Executar o POST de Inicialização', seletor: '#status-post-badge' },
  ];

  let indiceEtapaAtual = 0;
  const btnInstalar = document.getElementById('btn-instalar-etapa');
  const btnResetar = document.getElementById('btn-reset-montagem');
  const progressoTexto = document.getElementById('texto-progresso-montagem');
  const listaEtapasEl = document.getElementById('lista-etapas-montagem');
  const placa = document.getElementById('placa-mae-3d');
  const statusPost = document.getElementById('status-post-badge');

  function renderizarListaEtapas() {
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
      progressoTexto.textContent = `${indiceEtapaAtual} / ${etapas.length} Instalados`;
    }

    if (btnInstalar) {
      if (indiceEtapaAtual < etapas.length - 1) {
        btnInstalar.innerHTML = `<span class="material-symbols-outlined">add_circle</span> Encaixar Próximo Componente`;
        btnInstalar.disabled = false;
      } else if (indiceEtapaAtual === etapas.length - 1) {
        btnInstalar.innerHTML = `<span class="material-symbols-outlined">power_settings_new</span> Ligar Computador (POST)`;
        btnInstalar.disabled = false;
      } else {
        btnInstalar.innerHTML = `<span class="material-symbols-outlined">done_all</span> Computador Montado &amp; Ativo!`;
        btnInstalar.disabled = true;
      }
    }
  }

  if (btnInstalar) {
    btnInstalar.addEventListener('click', () => {
      if (indiceEtapaAtual >= etapas.length) return;

      const etapaAtual = etapas[indiceEtapaAtual];
      if (etapaAtual.id === 'ligar') {
        // Ligar placa e executar POST
        if (placa) placa.classList.add('ligada');
        if (statusPost) {
          statusPost.classList.add('ligado');
          statusPost.innerHTML = `<span class="md-led-status"></span> POST Concluído (Sistema Operacional Ativo)`;
        }
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
      if (statusPost) {
        statusPost.classList.remove('ligado');
        statusPost.innerHTML = `<span class="md-led-status"></span> Em Espera (Desligado)`;
      }
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
  const passos = [
    {
      id: 'busca',
      fase: '1. Busca (Fetch)',
      titulo: 'Leitura da Memória RAM',
      descricao: 'O Registrador de Endereço busca a instrução na memória RAM através do barramento de dados e a traz para dentro do Registrador de Instrução (IR) da CPU.',
      blocoAtivo: 'cpu-bloco-ir',
      pulso: true,
      valorIR: 'OP_SOMAR [0x01]',
      valorULA: 'Aguardando Operandos...'
    },
    {
      id: 'decodifica',
      fase: '2. Decodificação (Decode)',
      titulo: 'Interpretação pela Unidade de Controle (UC)',
      descricao: 'A Unidade de Controle decodifica o código binário da instrução, identifica a operação matemática (SOMA) e prepara os operandos dos registradores R1 (5) e R2 (3).',
      blocoAtivo: 'cpu-bloco-uc',
      pulso: false,
      valorIR: 'OP_SOMAR (R1, R2)',
      valorULA: 'Carregado: 5 e 3'
    },
    {
      id: 'executa',
      fase: '3. Execução (Execute)',
      titulo: 'Cálculo na Unidade Lógica e Aritmética (ULA)',
      descricao: 'A ULA executa o cálculo aritmético: 5 + 3 = 8. O resultado final é imediatamente gravado no Registrador Acumulador, pronto para o próximo ciclo!',
      blocoAtivo: 'cpu-bloco-ula',
      pulso: true,
      valorIR: 'Instrução Concluída',
      valorULA: 'Resultado: 8 (00001000₂)'
    }
  ];

  let passoAtual = 0;
  let timerCiclo = null;

  const btnPasso = document.getElementById('btn-cpu-passo');
  const btnAuto = document.getElementById('btn-cpu-auto');
  const irEl = document.getElementById('cpu-valor-ir');
  const ulaEl = document.getElementById('cpu-valor-ula');
  const pulsoEl = document.getElementById('pulso-barramento-cpu');
  const passosEl = document.querySelectorAll('.md-passo-ciclo');
  const blocosEl = document.querySelectorAll('.md-cpu-bloco');

  function renderizarPasso(indice) {
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

    emitirBeep(520 + indice * 120, 0.1);
  }

  if (btnPasso) {
    btnPasso.addEventListener('click', () => {
      if (timerCiclo) {
        clearInterval(timerCiclo);
        timerCiclo = null;
        if (btnAuto) btnAuto.innerHTML = `<span class="material-symbols-outlined">play_arrow</span> Ciclo Automático`;
      }
      passoAtual = (passoAtual + 1) % passos.length;
      renderizarPasso(passoAtual);
    });
  }

  if (btnAuto) {
    btnAuto.addEventListener('click', () => {
      if (timerCiclo) {
        clearInterval(timerCiclo);
        timerCiclo = null;
        btnAuto.innerHTML = `<span class="material-symbols-outlined">play_arrow</span> Ciclo Automático`;
      } else {
        btnAuto.innerHTML = `<span class="material-symbols-outlined">pause</span> Pausar Ciclo`;
        timerCiclo = setInterval(() => {
          passoAtual = (passoAtual + 1) % passos.length;
          renderizarPasso(passoAtual);
        }, 1800);
      }
    });
  }

  renderizarPasso(0);
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

  if (btnPerda) {
    btnPerda.addEventListener('click', () => {
      simularPerdaAtiva = !simularPerdaAtiva;
      btnPerda.classList.toggle('ativo', simularPerdaAtiva);
      btnPerda.textContent = simularPerdaAtiva ? '⚠️ Perda de Pacote: Ativada' : 'Simular Perda de Pacote';
      emitirBeep(simularPerdaAtiva ? 300 : 600, 0.1);
    });
  }

  if (btnEnviar) {
    btnEnviar.addEventListener('click', () => {
      btnEnviar.disabled = true;
      if (pacoteAnim) pacoteAnim.classList.add('viajando');
      if (statusEl) statusEl.textContent = 'Enviando pacotes TCP via roteadores...';

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

        if (simularPerdaAtiva) {
          if (statusEl) statusEl.textContent = '❌ Pacote 2 perdido no caminho! Protocolo TCP retransmitiu com sucesso (ACK 3).';
          emitirBeep(280, 0.2);
          setTimeout(() => emitirBeep(700, 0.15), 300);
        } else {
          if (statusEl) statusEl.textContent = '✅ Pacotes entregues e remontados no Servidor LMS COMPASSO!';
          emitirBeep(880, 0.2);
        }

        if (seqEl) {
          seqEl.textContent = Math.floor(Math.random() * 90000 + 10000);
        }
      }, 2500);
    });
  }
}

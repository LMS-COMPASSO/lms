/**
 * ============================================================================
 * LMS COMPASSO — EIXO CULTURA DIGITAL (CHAT INTERATIVO & CIDADANIA)
 * ============================================================================
 * Gerencia os cenários de chat ramificado (Phishing, Fake News, Cyberbullying, Privacidade),
 * o testador de força de senha ("Cofre Digital") e o medidor de pegada digital com suporte
 * a múltiplos idiomas e atualização reativa em tempo real.
 * ============================================================================
 */

import { t } from '/js/i18n.js';

// Retorna cenários pedagógicos alinhados à BNCC com traduções dinâmicas
function obterCenariosChat() {
  return {
    phishing: {
      id: "phishing",
      nome: t('cd.chat.phishing.nome'),
      avatar: "smart_toy",
      badge: t('cd.chat.phishing.badge'),
      previa: t('cd.chat.phishing.previa'),
      hora: "14:32",
      mensagemInicial: t('cd.chat.phishing.msg'),
      opcoes: [
        {
          texto: t('cd.chat.phishing.opc1.texto'),
          tipo: "erro",
          respostaContato: t('cd.chat.phishing.opc1.resposta'),
          feedback: t('cd.chat.phishing.opc1.feedback'),
          pontos: 0
        },
        {
          texto: t('cd.chat.phishing.opc2.texto'),
          tipo: "erro",
          respostaContato: t('cd.chat.phishing.opc2.resposta'),
          feedback: t('cd.chat.phishing.opc2.feedback'),
          pontos: 10
        },
        {
          texto: t('cd.chat.phishing.opc3.texto'),
          tipo: "sucesso",
          respostaContato: t('cd.chat.phishing.opc3.resposta'),
          feedback: t('cd.chat.phishing.opc3.feedback'),
          pontos: 50
        }
      ]
    },
    cyberbullying: {
      id: "cyberbullying",
      nome: t('cd.chat.cyberbullying.nome'),
      avatar: "groups",
      badge: t('cd.chat.cyberbullying.badge'),
      previa: t('cd.chat.cyberbullying.previa'),
      hora: "15:10",
      mensagemInicial: t('cd.chat.cyberbullying.msg'),
      opcoes: [
        {
          texto: t('cd.chat.cyberbullying.opc1.texto'),
          tipo: "erro",
          respostaContato: t('cd.chat.cyberbullying.opc1.resposta'),
          feedback: t('cd.chat.cyberbullying.opc1.feedback'),
          pontos: 0
        },
        {
          texto: t('cd.chat.cyberbullying.opc2.texto'),
          tipo: "alerta",
          respostaContato: t('cd.chat.cyberbullying.opc2.resposta'),
          feedback: t('cd.chat.cyberbullying.opc2.feedback'),
          pontos: 15
        },
        {
          texto: t('cd.chat.cyberbullying.opc3.texto'),
          tipo: "sucesso",
          respostaContato: t('cd.chat.cyberbullying.opc3.resposta'),
          feedback: t('cd.chat.cyberbullying.opc3.feedback'),
          pontos: 50
        }
      ]
    },
    privacidade: {
      id: "privacidade",
      nome: t('cd.chat.privacidade.nome'),
      avatar: "person",
      badge: t('cd.chat.privacidade.badge'),
      previa: t('cd.chat.privacidade.previa'),
      hora: "16:45",
      mensagemInicial: t('cd.chat.privacidade.msg'),
      opcoes: [
        {
          texto: t('cd.chat.privacidade.opc1.texto'),
          tipo: "erro",
          respostaContato: t('cd.chat.privacidade.opc1.resposta'),
          feedback: t('cd.chat.privacidade.opc1.feedback'),
          pontos: 0
        },
        {
          texto: t('cd.chat.privacidade.opc2.texto'),
          tipo: "erro",
          respostaContato: t('cd.chat.privacidade.opc2.resposta'),
          feedback: t('cd.chat.privacidade.opc2.feedback'),
          pontos: 10
        },
        {
          texto: t('cd.chat.privacidade.opc3.texto'),
          tipo: "sucesso",
          respostaContato: t('cd.chat.privacidade.opc3.resposta'),
          feedback: t('cd.chat.privacidade.opc3.feedback'),
          pontos: 50
        }
      ]
    },
    fakenews: {
      id: "fakenews",
      nome: t('cd.chat.fakenews.nome'),
      avatar: "family_restroom",
      badge: t('cd.chat.fakenews.badge'),
      previa: t('cd.chat.fakenews.previa'),
      hora: "17:20",
      mensagemInicial: t('cd.chat.fakenews.msg'),
      opcoes: [
        {
          texto: t('cd.chat.fakenews.opc1.texto'),
          tipo: "erro",
          respostaContato: t('cd.chat.fakenews.opc1.resposta'),
          feedback: t('cd.chat.fakenews.opc1.feedback'),
          pontos: 0
        },
        {
          texto: t('cd.chat.fakenews.opc2.texto'),
          tipo: "alerta",
          respostaContato: t('cd.chat.fakenews.opc2.resposta'),
          feedback: t('cd.chat.fakenews.opc2.feedback'),
          pontos: 20
        },
        {
          texto: t('cd.chat.fakenews.opc3.texto'),
          tipo: "sucesso",
          respostaContato: t('cd.chat.fakenews.opc3.resposta'),
          feedback: t('cd.chat.fakenews.opc3.feedback'),
          pontos: 50
        }
      ]
    }
  };
}

let cenarioAtualId = "phishing";
let pontosCidadaniaTotal = 0;
const cenariosConcluidos = new Set();

let atualizarCenarioFn = null;
let atualizarSenhaFn = null;
let recalcularPegadaFn = null;

document.addEventListener("DOMContentLoaded", () => {
  inicializarChatInterativo();
  inicializarTestadorSenha();
  inicializarPegadaDigital();

  // Escuta trocas de idioma em tempo real via menu universal
  window.addEventListener('idiomaAlterado', () => {
    const pontosBadge = document.getElementById("pontos-cidadania-badge");
    if (pontosBadge) {
      pontosBadge.textContent = t('cd.pontosCidadania', { pontos: pontosCidadaniaTotal });
    }
    if (typeof atualizarCenarioFn === 'function') {
      atualizarCenarioFn(cenarioAtualId);
    }
    if (typeof atualizarSenhaFn === 'function') {
      atualizarSenhaFn();
    }
    if (typeof recalcularPegadaFn === 'function') {
      recalcularPegadaFn();
    }
  });
});

/* ---------------------------------------------------------------------------
 * 1. Simulador de Chat Interativo ("ZapCompasso")
 * ------------------------------------------------------------------------ */
function inicializarChatInterativo() {
  const listaBotoes = document.querySelectorAll(".cd-item-conversa");
  const mensagensContainer = document.getElementById("chat-mensagens-container");
  const opcoesContainer = document.getElementById("chat-opcoes-container");
  const contatoNomeEl = document.getElementById("chat-contato-nome");
  const contatoStatusEl = document.getElementById("chat-contato-status");
  const badgeTemaEl = document.getElementById("chat-badge-tema");
  const pontosBadge = document.getElementById("pontos-cidadania-badge");

  if (pontosBadge) {
    pontosBadge.textContent = t('cd.pontosCidadania', { pontos: pontosCidadaniaTotal });
  }

  function carregarCenario(cenarioId) {
    const cenarios = obterCenariosChat();
    const cenario = cenarios[cenarioId];
    if (!cenario) return;

    cenarioAtualId = cenarioId;

    listaBotoes.forEach((btn) => {
      btn.classList.toggle("ativo", btn.dataset.cenario === cenarioId);
    });

    if (contatoNomeEl) contatoNomeEl.textContent = cenario.nome;
    if (contatoStatusEl) contatoStatusEl.textContent = t('cd.onlineAgora');
    if (badgeTemaEl) badgeTemaEl.textContent = cenario.badge;

    if (!mensagensContainer) return;
    mensagensContainer.innerHTML = "";

    // Mensagem Inicial do Contato
    const balaoInicial = document.createElement("div");
    balaoInicial.className = "cd-balao cd-balao-recebido";
    balaoInicial.innerHTML = `
      ${cenario.mensagemInicial}
      <span class="cd-balao-hora">${cenario.hora}</span>
    `;
    mensagensContainer.appendChild(balaoInicial);

    // Renderizar Opções de Resposta
    if (!opcoesContainer) return;
    opcoesContainer.innerHTML = "";

    cenario.opcoes.forEach((opcao) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-opcao-decisao";
      btn.innerHTML = `
        <span>${opcao.texto}</span>
        <span class="material-symbols-outlined icon-xs" aria-hidden="true">arrow_forward</span>
      `;

      btn.addEventListener("click", () => {
        responderOpcao(cenario, opcao);
      });

      opcoesContainer.appendChild(btn);
    });

    mensagensContainer.scrollTop = mensagensContainer.scrollHeight;
  }

  atualizarCenarioFn = carregarCenario;

  function responderOpcao(cenario, opcao) {
    if (!mensagensContainer || !opcoesContainer) return;

    opcoesContainer.innerHTML = "";

    // Adiciona resposta do aluno
    const balaoEnviado = document.createElement("div");
    balaoEnviado.className = "cd-balao cd-balao-enviado";
    balaoEnviado.innerHTML = `
      ${opcao.texto}
      <span class="cd-balao-hora">${t('cd.horaAgora')}</span>
    `;
    mensagensContainer.appendChild(balaoEnviado);

    // Simula resposta do contato após 600ms
    setTimeout(() => {
      const balaoResposta = document.createElement("div");
      balaoResposta.className = "cd-balao cd-balao-recebido";
      balaoResposta.innerHTML = `
        ${opcao.respostaContato}
        <span class="cd-balao-hora">${t('cd.horaAgora')}</span>
      `;
      mensagensContainer.appendChild(balaoResposta);

      // Balão de Feedback Pedagógico BNCC
      setTimeout(() => {
        const balaoFeedback = document.createElement("div");
        balaoFeedback.className = "cd-balao cd-balao-alerta";
        balaoFeedback.innerHTML = `<strong>${t('cd.analisePedagogica')}</strong><br>${opcao.feedback}`;
        mensagensContainer.appendChild(balaoFeedback);

        if (!cenariosConcluidos.has(cenario.id)) {
          cenariosConcluidos.add(cenario.id);
          pontosCidadaniaTotal += opcao.pontos;
          if (pontosBadge) {
            pontosBadge.textContent = t('cd.pontosCidadania', { pontos: pontosCidadaniaTotal });
          }
        }

        // Opção de Tentar Novamente
        const btnRepetir = document.createElement("button");
        btnRepetir.type = "button";
        btnRepetir.className = "btn-opcao-decisao";
        btnRepetir.innerHTML = `
          <span>${t('cd.refazerCenario')}</span>
          <span class="material-symbols-outlined icon-xs" aria-hidden="true">refresh</span>
        `;
        btnRepetir.addEventListener("click", () => carregarCenario(cenario.id));
        opcoesContainer.appendChild(btnRepetir);

        mensagensContainer.scrollTop = mensagensContainer.scrollHeight;
      }, 500);
    }, 600);
  }

  listaBotoes.forEach((btn) => {
    btn.addEventListener("click", () => {
      carregarCenario(btn.dataset.cenario);
    });
  });

  carregarCenario("phishing");
}

/* ---------------------------------------------------------------------------
 * 2. Laboratório de Senhas Seguras ("Cofre Digital")
 * ------------------------------------------------------------------------ */
function inicializarTestadorSenha() {
  const inputSenha = document.getElementById("input-teste-senha");
  const barraForca = document.getElementById("barra-forca-senha");
  const statusTxt = document.getElementById("status-senha-txt");
  const tempoQuebra = document.getElementById("tempo-quebra-txt");

  const reqTam = document.getElementById("req-tamanho");
  const reqMaiusc = document.getElementById("req-maiuscula");
  const reqNum = document.getElementById("req-numero");
  const reqSimbolo = document.getElementById("req-simbolo");

  if (!inputSenha) return;

  function atualizarForcaSenha() {
    const senha = inputSenha.value;

    const tem8Char = senha.length >= 8;
    const temMaiusc = /[A-Z]/.test(senha);
    const temNum = /[0-9]/.test(senha);
    const temSimb = /[^A-Za-z0-9]/.test(senha);

    if (reqTam) reqTam.classList.toggle("atendido", tem8Char);
    if (reqMaiusc) reqMaiusc.classList.toggle("atendido", temMaiusc);
    if (reqNum) reqNum.classList.toggle("atendido", temNum);
    if (reqSimbolo) reqSimbolo.classList.toggle("atendido", temSimb);

    let pontuacao = 0;
    if (tem8Char) pontuacao++;
    if (temMaiusc) pontuacao++;
    if (temNum) pontuacao++;
    if (temSimb) pontuacao++;
    if (senha.length >= 12) pontuacao++;

    if (!barraForca || !statusTxt || !tempoQuebra) return;

    if (senha.length === 0) {
      barraForca.style.width = "0%";
      barraForca.style.background = "#ef4444";
      statusTxt.textContent = t('cd.senhaStatusPadrao');
      statusTxt.style.color = "#94a3b8";
      tempoQuebra.textContent = t('cd.tempoQuebraPadrao');
    } else if (pontuacao <= 1) {
      barraForca.style.width = "20%";
      barraForca.style.background = "#ef4444";
      statusTxt.textContent = t('cd.senhaMuitoFraca');
      statusTxt.style.color = "#ef4444";
      tempoQuebra.textContent = t('cd.quebrada0001');
    } else if (pontuacao === 2) {
      barraForca.style.width = "40%";
      barraForca.style.background = "#f97316";
      statusTxt.textContent = t('cd.senhaFraca');
      statusTxt.style.color = "#f97316";
      tempoQuebra.textContent = t('cd.quebradaMinutos');
    } else if (pontuacao === 3) {
      barraForca.style.width = "70%";
      barraForca.style.background = "#eab308";
      statusTxt.textContent = t('cd.senhaMedia');
      statusTxt.style.color = "#eab308";
      tempoQuebra.textContent = t('cd.quebradaAnos');
    } else {
      barraForca.style.width = "100%";
      barraForca.style.background = "#22c55e";
      statusTxt.textContent = t('cd.senhaExcelente');
      statusTxt.style.color = "#4ade80";
      tempoQuebra.textContent = t('cd.quebrada500Anos');
    }
  }

  atualizarSenhaFn = atualizarForcaSenha;
  inputSenha.addEventListener("input", atualizarForcaSenha);
}

/* ---------------------------------------------------------------------------
 * 3. Medidor de Pegada Digital (Digital Footprint)
 * ------------------------------------------------------------------------ */
function inicializarPegadaDigital() {
  const checkboxes = document.querySelectorAll(".cd-chk-pegada");
  const iconeWrap = document.getElementById("pegada-icone-wrap");
  const tituloEl = document.getElementById("pegada-titulo-status");
  const descEl = document.getElementById("pegada-desc-status");

  function recalcularPegada() {
    let riscoCount = 0;
    checkboxes.forEach((chk) => {
      if (chk.checked) riscoCount++;
    });

    if (!iconeWrap || !tituloEl || !descEl) return;

    if (riscoCount === 0) {
      iconeWrap.style.background = "rgba(34, 197, 94, 0.15)";
      iconeWrap.style.color = "#4ade80";
      tituloEl.innerHTML = t('cd.pegadaLimpaTitulo');
      descEl.textContent = t('cd.pegadaLimpaDesc');
    } else if (riscoCount <= 2) {
      iconeWrap.style.background = "rgba(251, 191, 36, 0.15)";
      iconeWrap.style.color = "#fbbf24";
      tituloEl.textContent = t('cd.pegadaAtencaoTitulo');
      descEl.textContent = t('cd.pegadaAtencaoDesc');
    } else {
      iconeWrap.style.background = "rgba(239, 68, 68, 0.15)";
      iconeWrap.style.color = "#ef4444";
      tituloEl.textContent = t('cd.pegadaAlertaTitulo');
      descEl.textContent = t('cd.pegadaAlertaDesc');
    }
  }

  recalcularPegadaFn = recalcularPegada;

  checkboxes.forEach((chk) => {
    chk.addEventListener("change", recalcularPegada);
  });

  recalcularPegada();
}

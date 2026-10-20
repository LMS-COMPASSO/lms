/**
 * ============================================================================
 * LMS COMPASSO — EIXO CULTURA DIGITAL (CHAT INTERATIVO & CIDADANIA)
 * ============================================================================
 * Gerencia os cenários de chat ramificado (Phishing, Fake News, Cyberbullying, Privacidade),
 * o testador de força de senha ("Cofre Digital") e o medidor de pegada digital.
 * ============================================================================
 */

// Cenários Pedagógicos Alinhados à BNCC Computação
const CENARIOS_CHAT = {
  phishing: {
    id: "phishing",
    nome: "Leo (Colega de Jogo)",
    avatar: "smart_toy",
    badge: "Phishing & Engenharia Social (EF04CO04)",
    previa: "Mano, achei um site que dá moedas grátis!",
    hora: "14:32",
    mensagemInicial: "Mano, olha esse site que tá dando 10.000 moedas e itens grátis no jogo hoje! Clica rápido e coloca seu login e senha antes que saia do ar: http://robl0x-free-coins.xyz/login",
    opcoes: [
      {
        texto: "Valeu Leo! Vou clicar agora e colocar minha senha pra pegar as moedas.",
        tipo: "erro",
        respostaContato: "Eita... Você caiu no golpe! Minha conta foi invadida e o hacker mandou esse link pra você!",
        feedback: "⚠️ CUIDADO: Isso é um ataque de Phishing! O link tem um endereço falso (.xyz). Nenhum jogo oficial pede sua senha em sites externos. Seus dados seriam roubados.",
        pontos: 0
      },
      {
        texto: "Não vou entrar agora, mas vou repassar o link pro grupo da sala.",
        tipo: "erro",
        respostaContato: "Não faça isso! O link é perigoso!",
        feedback: "⚠️ ATENÇÃO: Repassar links suspeitos coloca seus amigos e familiares em perigo. Na dúvida, nunca propague correntes.",
        pontos: 10
      },
      {
        texto: "Leo, isso é golpe de Phishing! Olha esse link falso (.xyz). Ninguém dá moedas em troca de senha. Troque sua senha agora se tiver entrado lá!",
        tipo: "sucesso",
        respostaContato: "Caramba, você me salvou! Vou trocar minha senha correndo antes que roubem minha conta!",
        feedback: "🌟 EXCELENTE: Você identificou a URL falsa, protegeu sua conta e ainda orientou o amigo a mudar a senha comprometida. Habilidade EF04CO04 dominada!",
        pontos: 50
      }
    ]
  },
  cyberbullying: {
    id: "cyberbullying",
    nome: "Grupo da Turma 5º B",
    avatar: "groups",
    badge: "Convivência Ética & Respeito (EF04CO04 / EF01CO05)",
    previa: "Olha a foto do Pedro no recreio kkk",
    hora: "15:10",
    mensagemInicial: "[Foto compartilhada do Pedro caindo na poça de água] 'Kkkk olha que mico do Pedro no recreio hoje! Vamos criar uma figurinha e espalhar em todas as redes!'",
    opcoes: [
      {
        texto: "Kkkkk vou fazer a figurinha agora e postar no TikTok!",
        tipo: "erro",
        respostaContato: "[O Pedro saiu do grupo magoado]",
        feedback: "⚠️ GRAVE: Isso é Cyberbullying. Compartilhar imagens constrangedoras sem consentimento causa sofrimento real e fere as regras de convivência escolar e digital.",
        pontos: 0
      },
      {
        texto: "Vou só silenciar o grupo e fingir que não vi nada.",
        tipo: "alerta",
        respostaContato: "[A zombaria continua sem ninguém intervir]",
        feedback: "⚠️ REFLEXÃO: A omissão permite que a agressão continue. Ser um cidadão digital consciente exige apoiar quem está sendo atacado.",
        pontos: 15
      },
      {
        texto: "Gente, parem com isso. Imagina se fosse com vocês? Apaguem essa foto, não criem figurinhas e respeitem o Pedro.",
        tipo: "sucesso",
        respostaContato: "É verdade pessoal, fomos longe demais. Já apaguei a foto. Desculpa, Pedro!",
        feedback: "🌟 EXEMPLAR: Você agiu como um 'Upstander' (defensor ativo), usando sua voz digital para frear o desrespeito e acolher o colega. Habilidade EF01CO05 e EF04CO04!",
        pontos: 50
      }
    ]
  },
  privacidade: {
    id: "privacidade",
    nome: "ShadowGamer_99",
    avatar: "person",
    badge: "Proteção de Dados & Privacidade (EF02CO04)",
    previa: "Onde você mora? Passa seu Whats!",
    hora: "16:45",
    mensagemInicial: "Jogou muito hoje na partida! Me passa seu nome completo, idade e o nome da sua escola pra gente marcar de jogar pessoalmente amanhã!",
    opcoes: [
      {
        texto: "Meu nome é Lucas Silva, tenho 10 anos e estudo na Escola Municipal das 13h às 17h.",
        tipo: "erro",
        respostaContato: "Beleza, já sei onde te encontrar amanhã...",
        feedback: "⚠️ PERIGO GRAVE: Nunca informe nome completo, idade, escola ou rotina para pessoas desconhecidas em jogos online. Seus dados pessoais devem ser protegidos!",
        pontos: 0
      },
      {
        texto: "Não quero passar a escola, mas meu telefone é (99) 99999-9999.",
        tipo: "erro",
        respostaContato: "Anotado! Vou te ligar agora.",
        feedback: "⚠️ RISCO: Seu número de telefone também é um dado pessoal sensível. Estranhos podem usá-lo para golpes ou mensagens indevidas.",
        pontos: 10
      },
      {
        texto: "Não compartilho informações pessoais nem rotina escolar na internet. Vamos nos comunicar apenas pelo chat do próprio jogo.",
        tipo: "sucesso",
        respostaContato: "Tranquilo, você está certo em ter cuidado. Vamos focar na partida!",
        feedback: "🌟 PERFEITO: Você estabeleceu limites claros de privacidade e compreendeu que dados pessoais não devem circular abertamente. Habilidade EF02CO04!",
        pontos: 50
      }
    ]
  },
  fakenews: {
    id: "fakenews",
    nome: "Tia Cláudia (Família)",
    avatar: "family_restroom",
    badge: "Detetive de Fake News (EF03CO04)",
    previa: "URGENTE! Repassem para todos!",
    hora: "17:20",
    mensagemInicial: "URGENTE!!! Repassem para todos: cientistas avisam que amanhã a internet vai cair no mundo inteiro por 1 mês! Não bebam água da torneira! Compartilhem para salvar vidas!!",
    opcoes: [
      {
        texto: "Meu Deus tia! Vou mandar em todos os grupos agora mesmo!",
        tipo: "erro",
        respostaContato: "[O boato se espalhou e gerou pânico entre vizinhos]",
        feedback: "⚠️ ATENÇÃO: Mensagens alarmistas, cheias de exclamações e sem fonte confiável são a receita clássica das Fake News. Compartilhar sem checar espalha desinformação.",
        pontos: 0
      },
      {
        texto: "Vou estocar água em casa por garantia, mas não repasso.",
        tipo: "alerta",
        respostaContato: "Melhor prevenir, né?",
        feedback: "⚠️ DICA: Antes de acreditar ou se preocupar, faça uma busca rápida em sites confiáveis de notícias ou órgãos oficiais.",
        pontos: 20
      },
      {
        texto: "Tia, pesquisei no site oficial do governo e em jornais sérios: isso é notícia falsa (boato)! Por favor não repasse, pra não causar pânico nas pessoas.",
        tipo: "sucesso",
        respostaContato: "Nossa meu bem, ainda bem que você me avisou! Já vou avisar que me enganei e apagar.",
        feedback: "🌟 BRILHANTE: Você usou o pensamento crítico, checou os fatos em fontes confiáveis e interrompeu a cadeia de desinformação. Habilidade EF03CO04!",
        pontos: 50
      }
    ]
  }
};

let cenarioAtualId = "phishing";
let pontosCidadaniaTotal = 0;
const cenariosConcluidos = new Set();

document.addEventListener("DOMContentLoaded", () => {
  inicializarChatInterativo();
  inicializarTestadorSenha();
  inicializarPegadaDigital();
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

  function carregarCenario(cenarioId) {
    const cenario = CENARIOS_CHAT[cenarioId];
    if (!cenario) return;

    cenarioAtualId = cenarioId;

    listaBotoes.forEach((btn) => {
      btn.classList.toggle("ativo", btn.dataset.cenario === cenarioId);
    });

    if (contatoNomeEl) contatoNomeEl.textContent = cenario.nome;
    if (contatoStatusEl) contatoStatusEl.textContent = "Online agora";
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

    cenario.opcoes.forEach((opcao, idx) => {
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

  function responderOpcao(cenario, opcao) {
    if (!mensagensContainer || !opcoesContainer) return;

    opcoesContainer.innerHTML = "";

    // Adiciona resposta do aluno
    const balaoEnviado = document.createElement("div");
    balaoEnviado.className = "cd-balao cd-balao-enviado";
    balaoEnviado.innerHTML = `
      ${opcao.texto}
      <span class="cd-balao-hora">Agora</span>
    `;
    mensagensContainer.appendChild(balaoEnviado);

    // Simula resposta do contato após 600ms
    setTimeout(() => {
      const balaoResposta = document.createElement("div");
      balaoResposta.className = "cd-balao cd-balao-recebido";
      balaoResposta.innerHTML = `
        ${opcao.respostaContato}
        <span class="cd-balao-hora">Agora</span>
      `;
      mensagensContainer.appendChild(balaoResposta);

      // Balão de Feedback Pedagógico BNCC
      setTimeout(() => {
        const balaoFeedback = document.createElement("div");
        balaoFeedback.className = "cd-balao cd-balao-alerta";
        balaoFeedback.innerHTML = `<strong>Análise Pedagógica:</strong><br>${opcao.feedback}`;
        mensagensContainer.appendChild(balaoFeedback);

        if (!cenariosConcluidos.has(cenario.id)) {
          cenariosConcluidos.add(cenario.id);
          pontosCidadaniaTotal += opcao.pontos;
          if (pontosBadge) {
            pontosBadge.textContent = `${pontosCidadaniaTotal} Pontos de Cidadania`;
          }
        }

        // Opção de Tentar Novamente
        const btnRepetir = document.createElement("button");
        btnRepetir.type = "button";
        btnRepetir.className = "btn-opcao-decisao";
        btnRepetir.innerHTML = `
          <span>Refazer este cenário</span>
          <span class="material-symbols-outlined icon-xs">refresh</span>
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

  inputSenha.addEventListener("input", () => {
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
      statusTxt.textContent = "Digite uma senha para testar";
      statusTxt.style.color = "#94a3b8";
      tempoQuebra.textContent = "Tempo para quebrar: —";
    } else if (pontuacao <= 1) {
      barraForca.style.width = "20%";
      barraForca.style.background = "#ef4444";
      statusTxt.textContent = "Muito Fraca";
      statusTxt.style.color = "#ef4444";
      tempoQuebra.textContent = "Quebrada em: 0.001 segundos";
    } else if (pontuacao === 2) {
      barraForca.style.width = "40%";
      barraForca.style.background = "#f97316";
      statusTxt.textContent = "Fraca";
      statusTxt.style.color = "#f97316";
      tempoQuebra.textContent = "Quebrada em: alguns minutos";
    } else if (pontuacao === 3) {
      barraForca.style.width = "70%";
      barraForca.style.background = "#eab308";
      statusTxt.textContent = "Média / Boa";
      statusTxt.style.color = "#eab308";
      tempoQuebra.textContent = "Quebrada em: 2 a 3 anos";
    } else {
      barraForca.style.width = "100%";
      barraForca.style.background = "#22c55e";
      statusTxt.textContent = "Excelente & Segura!";
      statusTxt.style.color = "#4ade80";
      tempoQuebra.textContent = "Quebrada em: Mais de 500 anos!";
    }
  });
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
      tituloEl.textContent = "Pegada Digital Limpa & Protegida";
      descEl.textContent = "Você cuida com atenção da sua privacidade, não compartilha dados sensíveis e mantém sua identidade resguardada.";
    } else if (riscoCount <= 2) {
      iconeWrap.style.background = "rgba(251, 191, 36, 0.15)";
      iconeWrap.style.color = "#fbbf24";
      tituloEl.textContent = "Atenção: Pegada Digital Visível";
      descEl.textContent = "Algumas informações da sua rotina estão públicas. Desative localizações e revise quem pode ver suas postagens.";
    } else {
      iconeWrap.style.background = "rgba(239, 68, 68, 0.15)";
      iconeWrap.style.color = "#ef4444";
      tituloEl.textContent = "Alerta: Pegada Digital Vulnerável!";
      descEl.textContent = "Muitos dados pessoais e de rotina estão expostos. Qualquer estranho pode rastrear seus passos online.";
    }
  }

  checkboxes.forEach((chk) => {
    chk.addEventListener("change", recalcularPegada);
  });

  recalcularPegada();
}

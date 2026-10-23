/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - GERENCIADOR DE LAYOUT, WAYFINDING E ÍCONES UNIVERSAIS
 * ============================================================================
 * Monta dinamicamente:
 * 1. Barra Lateral (Sidebar) com ícones SVG universais + rótulos visíveis sempre;
 * 2. Barra Superior (Topbar) com Busca Rápida (lupa), Notificações (sino),
 *    Configurações de Acessibilidade (engrenagem), Ajuda (interrogação em círculo)
 *    e Perfil (silhueta de usuário);
 * 3. Barra de Wayfinding de 3 Segundos ("Onde estou?", "Para onde posso ir?",
 *    "Como volto ou avanço?") em todas as páginas da plataforma.
 * ============================================================================
 */

// Importa assincronamente o motor de hidratação SVG e Web Component <lms-icon>
if (typeof window !== 'undefined') {
  import('/js/icones-universais.js').catch(() => {});
}

const MAPA_WAYFINDING_PAGINAS = {
  dashboard: {
    titulo: 'Painel Geral',
    eixo: 'Gestão & Monitoramento BNCC',
    secao: 'professor',
    rotuloSecao: 'Professor & Gestão',
    icone: 'dashboard',
    etapaAtual: 1,
    totalEtapas: 6,
    voltar: { href: '/', rotulo: 'Página Inicial' },
    avancar: { href: '/cursos.html', rotulo: 'Explorar Cursos' },
    ajuda: 'Você está no Painel Geral. Aqui você visualiza indicadores da turma, consolidação de habilidades BNCC e submissões de código Python 3D.',
  },
  cursos: {
    titulo: 'Cursos',
    eixo: 'Trilhas Curriculares BNCC',
    secao: 'aluno',
    rotuloSecao: 'Área do Aluno',
    icone: 'menu_book',
    etapaAtual: 1,
    totalEtapas: 6,
    voltar: { href: '/dashboard.html', rotulo: 'Painel Geral' },
    avancar: { href: '/atividades.html', rotulo: 'Ir para Atividades' },
    ajuda: 'Você está em Cursos. Filtre por Eixo da BNCC Computação (Pensamento Computacional, Mundo Digital ou Cultura Digital) e clique em Abrir.',
  },
  'curso-detalhe': {
    titulo: 'Detalhe do Curso',
    eixo: 'Módulos & Aulas',
    secao: 'pensamento',
    rotuloSecao: 'Trilha do Curso',
    icone: 'menu_book',
    etapaAtual: 2,
    totalEtapas: 6,
    voltar: { href: '/cursos.html', rotulo: 'Trilhas' },
    avancar: { href: '/atividades.html', rotulo: 'Praticar Atividades' },
    ajuda: 'Você está dentro de um Curso. Avance pelas aulas dos módulos, acompanhe o Mapa do Curso e marque cada etapa como Concluída.',
  },
  atividades: {
    titulo: 'Atividades & Laboratório 3D',
    eixo: 'Eixo 1: Pensamento Computacional',
    secao: 'pensamento',
    rotuloSecao: 'Pensamento Computacional',
    icone: 'format_list_numbered',
    etapaAtual: 2,
    totalEtapas: 6,
    voltar: { href: '/cursos.html', rotulo: 'Trilhas' },
    avancar: { href: '/mundo-digital.html', rotulo: 'Avançar: Mundo Digital' },
    ajuda: 'Você está no Catálogo de Atividades e Laboratório 3D Python. Escolha um desafio por ano escolar ou código BNCC para praticar algoritmos.',
  },
  'mundo-digital': {
    titulo: 'Mundo Digital',
    eixo: 'Eixo 2: Hardware & Redes',
    secao: 'mundo',
    rotuloSecao: 'Mundo Digital',
    icone: 'memory',
    etapaAtual: 3,
    totalEtapas: 6,
    voltar: { href: '/atividades.html', rotulo: 'Atividades' },
    avancar: { href: '/cultura-digital.html', rotulo: 'Avançar: Cultura Digital' },
    ajuda: 'Você está no laboratório do Eixo Mundo Digital. Inspecione a placa-mãe em 3D, simule o ciclo da CPU e acompanhe pacotes na rede.',
  },
  'cultura-digital': {
    titulo: 'Cultura Digital',
    eixo: 'Eixo 3: Cidadania & Segurança',
    secao: 'cultura',
    rotuloSecao: 'Cultura Digital',
    icone: 'verified_user',
    etapaAtual: 4,
    totalEtapas: 6,
    voltar: { href: '/mundo-digital.html', rotulo: 'Mundo Digital' },
    avancar: { href: '/certificados.html', rotulo: 'Avançar: Certificados' },
    ajuda: 'Você está no laboratório do Eixo Cultura Digital. Pratique decisões seguras no simulador de chat, cofre de senhas e pegada digital.',
  },
  matriculas: {
    titulo: 'Matrículas',
    eixo: 'Acompanhamento de Progresso',
    secao: 'aluno',
    rotuloSecao: 'Área do Aluno',
    icone: 'how_to_reg',
    etapaAtual: 5,
    totalEtapas: 6,
    voltar: { href: '/cursos.html', rotulo: 'Trilhas' },
    avancar: { href: '/certificados.html', rotulo: 'Ir para Certificados' },
    ajuda: 'Você está em Matrículas. Acompanhe o percentual de progresso em cada curso e emita o certificado ao atingir 100%.',
  },
  certificados: {
    titulo: 'Certificados',
    eixo: 'Conquistas & Validação',
    secao: 'aluno',
    rotuloSecao: 'Área do Aluno',
    icone: 'workspace_premium',
    etapaAtual: 6,
    totalEtapas: 6,
    voltar: { href: '/matriculas.html', rotulo: 'Matrículas' },
    avancar: { href: '/perfil.html', rotulo: 'Ver Minhas Medalhas' },
    ajuda: 'Você está em Certificados. Baixe seus certificados em PDF/A4 ou valide o código de autenticidade.',
  },
  usuarios: {
    titulo: 'Usuários',
    eixo: 'Administração Escolar',
    secao: 'professor',
    rotuloSecao: 'Professor & Gestão',
    icone: 'group',
    etapaAtual: 1,
    totalEtapas: 6,
    voltar: { href: '/dashboard.html', rotulo: 'Painel' },
    avancar: { href: '/perfil.html', rotulo: 'Ir para Meu Perfil' },
    ajuda: 'Você está na gestão de Usuários. Cadastre ou edite contas de estudantes, professores e administradores.',
  },
  perfil: {
    titulo: 'Meu Perfil',
    eixo: 'Conta & Insígnias BNCC',
    secao: 'config',
    rotuloSecao: 'Configurações & Perfil',
    icone: 'account_circle',
    etapaAtual: 6,
    totalEtapas: 6,
    voltar: { href: '/certificados.html', rotulo: 'Certificados' },
    avancar: { href: '/atividades.html', rotulo: 'Praticar Atividades' },
    ajuda: 'Você está em Meu Perfil. Consulte seus dados, altere sua senha e acompanhe suas medalhas conquistadas nos 3 eixos da BNCC.',
  },
};

const TRILHA_ORIENTACAO_CURSO = [
  {
    etapa: 1,
    chave: 'cursos',
    titulo: '1. Explorar Trilhas & Cursos',
    eixo: 'Área do Aluno · Início da Jornada',
    secao: 'aluno',
    icone: 'menu_book',
    href: '/cursos.html',
  },
  {
    etapa: 2,
    chave: 'atividades',
    titulo: '2. Eixo 1: Pensamento Computacional',
    eixo: 'Algoritmos, Decomposição & Python 3D',
    secao: 'pensamento',
    icone: 'format_list_numbered',
    href: '/atividades.html',
  },
  {
    etapa: 3,
    chave: 'mundo-digital',
    titulo: '3. Eixo 2: Mundo Digital',
    eixo: 'Hardware 3D, Ciclo da CPU & Redes',
    secao: 'mundo',
    icone: 'memory',
    href: '/mundo-digital.html',
  },
  {
    etapa: 4,
    chave: 'cultura-digital',
    titulo: '4. Eixo 3: Cultura Digital',
    eixo: 'Ética, Segurança & Pegada Digital',
    secao: 'cultura',
    icone: 'verified_user',
    href: '/cultura-digital.html',
  },
  {
    etapa: 5,
    chave: 'matriculas',
    titulo: '5. Acompanhamento & Matrículas',
    eixo: 'Progresso nos Módulos e Aulas',
    secao: 'aluno',
    icone: 'how_to_reg',
    href: '/matriculas.html',
  },
  {
    etapa: 6,
    chave: 'certificados',
    titulo: '6. Certificados & Insígnias BNCC',
    eixo: 'Emissão Oficial & Portfólio',
    secao: 'config',
    icone: 'workspace_premium',
    href: '/certificados.html',
  },
];

function alternarSidebar() {
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('sidebar-backdrop');
  if (!sb) return;

  const isMobile = window.innerWidth <= 1024;
  if (isMobile) {
    const abrindo = !sb.classList.contains('aberta');
    sb.classList.toggle('aberta', abrindo);
    if (bd) bd.classList.toggle('ativa', abrindo);
    document.body.classList.toggle('menu-aberto', abrindo);
  } else {
    const recolhendo = !sb.classList.contains('recolhida');
    sb.classList.toggle('recolhida', recolhendo);
    document.body.classList.toggle('sidebar-recolhida', recolhendo);
    try {
      localStorage.setItem('lms_sidebar_recolhida', recolhendo ? '1' : '0');
    } catch {}
  }
}

function fecharSidebar() {
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('sidebar-backdrop');
  if (sb) sb.classList.remove('aberta');
  if (bd) bd.classList.remove('ativa');
  document.body.classList.remove('menu-aberto');
}

function alternarPainelWayfinding(idPainel) {
  const paineis = ['painel-wf-busca', 'painel-wf-mapa', 'painel-wf-notificacoes', 'painel-wf-config', 'painel-wf-ajuda'];
  paineis.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === idPainel) {
      el.hidden = !el.hidden;
      if (!el.hidden && id === 'painel-wf-busca') {
        const input = el.querySelector('input');
        if (input) input.focus();
      }
    } else {
      el.hidden = true;
    }
  });
}

function aplicarPreferenciaAcessibilidade(chave, ativo) {
  try {
    localStorage.setItem(`lms_a11y_${chave}`, ativo ? '1' : '0');
  } catch {}
  document.documentElement.classList.toggle(`a11y-${chave}`, Boolean(ativo));

  // Sincroniza com Cloudflare D1 se o usuário estiver autenticado
  if (typeof api === 'function' && typeof obterToken === 'function' && obterToken()) {
    api('/preferencias', {
      method: 'PUT',
      body: JSON.stringify({
        alto_contraste: document.documentElement.classList.contains('a11y-alto-contraste') ? 1 : 0,
        fonte_ampliada: document.documentElement.classList.contains('a11y-fonte-ampliada') ? 1 : 0,
        reduzir_movimento: document.documentElement.classList.contains('a11y-reduzir-movimento') ? 1 : 0,
      }),
    }).catch(() => {});
  }
}

function restaurarPreferenciasAcessibilidade() {
  ['alto-contraste', 'fonte-ampliada', 'reduzir-movimento'].forEach((chave) => {
    try {
      if (localStorage.getItem(`lms_a11y_${chave}`) === '1') {
        document.documentElement.classList.add(`a11y-${chave}`);
      }
    } catch {}
  });

  // Carrega preferências salvas no Cloudflare D1 caso existam
  if (typeof api === 'function' && typeof obterToken === 'function' && obterToken()) {
    api('/preferencias')
      .then((prefs) => {
        if (!prefs) return;
        if (prefs.alto_contraste) aplicarPreferenciaAcessibilidade('alto-contraste', true);
        if (prefs.fonte_ampliada) aplicarPreferenciaAcessibilidade('fonte-ampliada', true);
        if (prefs.reduzir_movimento) aplicarPreferenciaAcessibilidade('reduzir-movimento', true);
      })
      .catch(() => {});
  }
}

function executarBuscaGlobalWayfinding(termo) {
  const q = String(termo || '').trim();
  if (!q) return;
  window.location.href = `/atividades.html?busca=${encodeURIComponent(q)}`;
}

window.alternarSidebar = alternarSidebar;
window.fecharSidebar = fecharSidebar;
window.alternarPainelWayfinding = alternarPainelWayfinding;
window.aplicarPreferenciaAcessibilidade = aplicarPreferenciaAcessibilidade;
window.executarBuscaGlobalWayfinding = executarBuscaGlobalWayfinding;

restaurarPreferenciasAcessibilidade();

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    fecharSidebar();
    alternarPainelWayfinding(null);
  }
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 1024) fecharSidebar();
});

function montarLayout(paginaAtiva) {
  const usuario = obterUsuario();
  if (!usuario) return;

  const pathname = window.location.pathname || '';
  const chaveContexto = pathname.includes('curso-detalhe') ? 'curso-detalhe' : (paginaAtiva || 'dashboard');
  const infoWf = MAPA_WAYFINDING_PAGINAS[chaveContexto] || MAPA_WAYFINDING_PAGINAS.dashboard;

  // Define o código de cor por seção no body (Pilar 2: --cor-secao-*)
  document.body.setAttribute('data-secao', infoWf.secao || 'pensamento');

  // Ajuste de rota "Voltar" quando perfil é aluno (aluno não acessa /dashboard.html)
  const linkVoltar = (usuario.perfil === 'aluno' && infoWf.voltar.href === '/dashboard.html')
    ? { href: '/', rotulo: 'Início' }
    : infoWf.voltar;

  // Itens de navegação principal SEMPRE com ícone universal desambiguado + rótulo visível + código de seção
  const itensMenu = [
    {
      href: '/dashboard.html',
      icone: 'dashboard',
      label: 'Dashboard',
      chave: 'dashboard',
      secao: 'professor',
      perfis: ['administrador', 'instrutor'],
    },
    {
      href: '/cursos.html',
      icone: 'menu_book',
      label: 'Cursos',
      chave: 'cursos',
      secao: 'aluno',
      perfis: ['administrador', 'instrutor', 'aluno'],
    },
    {
      href: '/atividades.html',
      icone: 'format_list_numbered',
      label: 'Atividades',
      chave: 'atividades',
      secao: 'pensamento',
      perfis: ['administrador', 'instrutor', 'aluno'],
    },
    {
      href: '/mundo-digital.html',
      icone: 'memory',
      label: 'Mundo Digital',
      chave: 'mundo-digital',
      secao: 'mundo',
      perfis: ['administrador', 'instrutor', 'aluno'],
    },
    {
      href: '/cultura-digital.html',
      icone: 'verified_user',
      label: 'Cultura Digital',
      chave: 'cultura-digital',
      secao: 'cultura',
      perfis: ['administrador', 'instrutor', 'aluno'],
    },
    {
      href: '/matriculas.html',
      icone: 'how_to_reg',
      label: 'Matrículas',
      chave: 'matriculas',
      secao: 'aluno',
      perfis: ['administrador', 'instrutor', 'aluno'],
    },
    {
      href: '/certificados.html',
      icone: 'workspace_premium',
      label: 'Certificados',
      chave: 'certificados',
      secao: 'aluno',
      perfis: ['administrador', 'instrutor', 'aluno'],
    },
    {
      href: '/usuarios.html',
      icone: 'group',
      label: 'Usuários',
      chave: 'usuarios',
      secao: 'professor',
      perfis: ['administrador'],
    },
    {
      href: '/perfil.html',
      icone: 'account_circle',
      label: 'Meu Perfil',
      chave: 'perfil',
      secao: 'config',
      perfis: ['administrador', 'instrutor', 'aluno'],
    },
  ];

  const itensVisiveis = itensMenu.filter((item) => item.perfis.includes(usuario.perfil));

  let recolhidaInicial = false;
  try {
    recolhidaInicial = window.innerWidth > 1024 && localStorage.getItem('lms_sidebar_recolhida') === '1';
    if (recolhidaInicial) document.body.classList.add('sidebar-recolhida');
  } catch {}

  const inicialNome = (usuario.nome || 'U').charAt(0).toUpperCase();
  const rotaInicio = usuario.perfil === 'aluno' ? '/cursos.html' : '/dashboard.html';

  const sidebarHtml = `
    <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="fecharSidebar()" aria-hidden="true"></div>
    <aside class="sidebar ${recolhidaInicial ? 'recolhida' : ''}" id="sidebar" aria-label="Navegação Principal">
      <div class="sidebar-header">
        <a href="${rotaInicio}" class="logo" title="LMS COMPASSO — Início da Plataforma">
          <div class="logo-icone-wrapper">
            <img src="/img/logo-icone-branco.svg" alt="Logo LMS COMPASSO" width="32" height="32">
          </div>
          <div class="logo-texto">
            <span class="logo-titulo">LMS COMPASSO</span>
            <span class="logo-subtitulo">BNCC Computação</span>
          </div>
        </a>
        <button class="btn-fechar-sidebar" type="button" aria-label="Fechar menu lateral" title="Fechar menu lateral" onclick="fecharSidebar()">
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </div>

      <nav class="sidebar-nav" aria-label="Menu principal com rótulos">
        <div class="nav-secao-rotulo">Onde posso ir</div>
        <a href="/" class="nav-item" title="Página Inicial Pública">
          <div class="nav-item-icone">
            <span class="material-symbols-outlined" aria-hidden="true">home</span>
          </div>
          <span class="nav-item-texto">Início</span>
        </a>
        ${itensVisiveis.map((item) => {
          const isAtivo = item.chave === paginaAtiva || (chaveContexto === 'curso-detalhe' && item.chave === 'cursos');
          return `
            <a href="${item.href}" class="nav-item ${isAtivo ? 'ativo' : ''}" data-secao-item="${item.secao}" ${isAtivo ? 'aria-current="page"' : ''} title="${item.label}" onclick="if (window.innerWidth <= 1024) fecharSidebar()">
              <div class="nav-item-icone">
                <span class="material-symbols-outlined" aria-hidden="true">${item.icone}</span>
              </div>
              <span class="nav-item-texto">${item.label}</span>
              ${isAtivo ? '<span class="nav-item-indicador" aria-hidden="true"></span>' : ''}
            </a>
          `;
        }).join('')}
      </nav>

      <div class="sidebar-footer">
        <a href="/perfil.html" class="sidebar-usuario-card" title="Acessar Meu Perfil (${usuario.nome})">
          <div class="usuario-avatar-mini" aria-hidden="true">${inicialNome}</div>
          <div class="usuario-info-mini">
            <span class="usuario-nome-mini">${usuario.nome}</span>
            <span class="badge badge-${usuario.perfil} badge-micro">${usuario.perfil}</span>
          </div>
        </a>
        <button type="button" class="nav-item-sair" onclick="encerrarSessao()" aria-label="Sair da plataforma" title="Encerrar Sessão (Sair)">
          <span class="material-symbols-outlined" aria-hidden="true">logout</span>
          <span class="nav-item-texto">Sair</span>
        </button>
      </div>
    </aside>
  `;

  const altoContrasteAtivo = document.documentElement.classList.contains('a11y-alto-contraste');
  const fonteAmpliadaAtiva = document.documentElement.classList.contains('a11y-fonte-ampliada');
  const reduzirMovAtivo = document.documentElement.classList.contains('a11y-reduzir-movimento');

  const percentualTrilha = Math.round((infoWf.etapaAtual / infoWf.totalEtapas) * 100);

  // Construção do Mapa de Orientação ("Mapa do Curso") com estados padronizados (WCAG 1.4.1)
  const mapaOrientacaoHtml = TRILHA_ORIENTACAO_CURSO.map((passo) => {
    const ehAqui = passo.etapa === infoWf.etapaAtual;
    const ehConcluido = passo.etapa < infoWf.etapaAtual;
    const ehProximo = passo.etapa === infoWf.etapaAtual + 1;

    let estadoClasse = 'estado-nao-iniciado';
    let estadoIcone = 'circle-dashed';
    let estadoRotulo = 'Não iniciado';

    if (ehConcluido) {
      estadoClasse = 'estado-concluido';
      estadoIcone = 'check_circle';
      estadoRotulo = 'Concluído';
    } else if (ehAqui) {
      estadoClasse = 'estado-em-andamento';
      estadoIcone = 'schedule';
      estadoRotulo = 'Em andamento';
    }

    return `
      <a href="${passo.href}" class="mapa-orientacao-card ${ehAqui ? 'voce-esta-aqui' : ''} ${ehProximo ? 'proximo-passo' : ''}" data-secao="${passo.secao}" ${ehAqui ? 'aria-current="step"' : ''}>
        <div class="flex-entre flex-wrap gap-8">
          <span class="secao-pista-badge" data-secao="${passo.secao}">
            <span class="material-symbols-outlined icon-xs" aria-hidden="true">${passo.icone}</span>
            <span>Etapa ${passo.etapa} de ${infoWf.totalEtapas}</span>
          </span>
          ${ehAqui ? '<span class="mapa-tag-aqui"><span class="material-symbols-outlined icon-xs" aria-hidden="true">explore</span> Você está aqui</span>' : ''}
          ${ehProximo ? '<span class="mapa-tag-proximo">O que vem a seguir →</span>' : ''}
        </div>
        <h4>${passo.titulo}</h4>
        <p>${passo.eixo}</p>
        <div class="mt-4">
          <span class="estado-progresso-pill ${estadoClasse}">
            <span class="material-symbols-outlined icon-xs" aria-hidden="true">${estadoIcone}</span>
            <span>${estadoRotulo}</span>
          </span>
        </div>
      </a>
    `;
  }).join('');

  // Topbar + Barra Universal de Wayfinding de 3 Segundos + Pistas Visuais (Pilar 2)
  const topbarHtml = `
    <header class="topbar" role="banner">
      <div class="flex-linha">
        <button class="menu-toggle" type="button" aria-label="Alternar menu de navegação" title="Alternar menu de navegação" onclick="alternarSidebar()">
          <span class="material-symbols-outlined" aria-hidden="true">menu</span>
        </button>
        <div>
          <div class="flex-linha gap-8">
            <span class="secao-pista-badge" data-secao="${infoWf.secao}" title="Seção atual: ${infoWf.rotuloSecao} (Cor + Ícone + Padrão de Borda)">
              <span class="material-symbols-outlined icon-xs" aria-hidden="true">${infoWf.icone}</span>
              <span>${infoWf.rotuloSecao}</span>
            </span>
          </div>
          <h1 id="titulo-pagina">${infoWf.titulo}</h1>
        </div>
      </div>

      <!-- Ferramentas Universais do Pilar 1 & 2: Mapa do Curso, Buscar (lupa), Notificações (sino), Configurações (engrenagem), Ajuda (?), Perfil -->
      <div class="topbar-ferramentas" role="toolbar" aria-label="Ferramentas rápidas de mapa do curso, busca, notificações, configurações e ajuda">
        <button type="button" class="wf-tool-btn" aria-label="Abrir Mapa do Curso: onde você está e o que vem a seguir" title="Mapa do Curso (Etapa ${infoWf.etapaAtual} de ${infoWf.totalEtapas})" onclick="alternarPainelWayfinding('painel-wf-mapa')">
          <span class="material-symbols-outlined icon-sm" aria-hidden="true">map</span>
          <span class="wf-tool-label">Mapa do Curso</span>
        </button>

        <button type="button" class="wf-tool-btn" aria-label="Buscar atividades, cursos ou habilidades BNCC" title="Buscar (Lupa)" onclick="alternarPainelWayfinding('painel-wf-busca')">
          <span class="material-symbols-outlined icon-sm" aria-hidden="true">search</span>
          <span class="wf-tool-label">Buscar</span>
        </button>

        <button type="button" class="wf-tool-btn" aria-label="Notificações e avisos pedagógicos" title="Notificações (Sino)" onclick="alternarPainelWayfinding('painel-wf-notificacoes')">
          <span class="material-symbols-outlined icon-sm" aria-hidden="true">notifications</span>
          <span class="wf-tool-label">Avisos</span>
          <span class="wf-badge-ponto" aria-hidden="true"></span>
        </button>

        <button type="button" class="wf-tool-btn" aria-label="Configurações de acessibilidade e exibição" title="Configurações (Engrenagem)" onclick="alternarPainelWayfinding('painel-wf-config')">
          <span class="material-symbols-outlined icon-sm" aria-hidden="true">settings</span>
          <span class="wf-tool-label">Ajustes</span>
        </button>

        <button type="button" class="wf-tool-btn" aria-label="Ajuda rápida sobre esta tela" title="Ajuda (Como usar esta página)" onclick="alternarPainelWayfinding('painel-wf-ajuda')">
          <span class="material-symbols-outlined icon-sm" aria-hidden="true">help</span>
          <span class="wf-tool-label">Ajuda</span>
        </button>

        <a href="/perfil.html" class="topbar-usuario-link" title="Meu Perfil: ${usuario.nome} (${usuario.perfil})" aria-label="Meu Perfil: ${usuario.nome}">
          <span class="material-symbols-outlined icon-sm" aria-hidden="true">account_circle</span>
          <div class="texto-direita topbar-usuario">
            <strong>${usuario.nome}</strong>
            <div><span class="badge badge-${usuario.perfil}">${usuario.perfil}</span></div>
          </div>
        </a>
      </div>
    </header>

    <!-- Painéis Expansíveis das Ferramentas Universais -->
    <div id="painel-wf-mapa" class="wf-painel-flutuante" role="region" aria-label="Mapa do curso: trilha completa, onde você está e o que vem a seguir" hidden>
      <div class="wf-painel-topo">
        <strong><span class="material-symbols-outlined icon-xs" aria-hidden="true">map</span> Mapa do Curso — Trilha Completa BNCC Computação</strong>
        <button type="button" class="btn btn-xs btn-neutro" onclick="alternarPainelWayfinding(null)">Fechar</button>
      </div>
      <div class="progresso-etapas-box mb-10">
        <div class="progresso-etapas-topo">
          <span class="progresso-etapas-contador">
            <span class="material-symbols-outlined icon-xs" aria-hidden="true">explore</span>
            <span>Etapa ${infoWf.etapaAtual} de ${infoWf.totalEtapas}: ${infoWf.titulo}</span>
          </span>
          <div class="flex-linha flex-wrap gap-8">
            <span class="estado-progresso-pill estado-concluido"><span class="material-symbols-outlined icon-xs" aria-hidden="true">check_circle</span> Concluído</span>
            <span class="estado-progresso-pill estado-em-andamento"><span class="material-symbols-outlined icon-xs" aria-hidden="true">schedule</span> Em andamento</span>
            <span class="estado-progresso-pill estado-nao-iniciado"><span class="material-symbols-outlined icon-xs" aria-hidden="true">circle-dashed</span> Não iniciado</span>
            <span class="estado-progresso-pill estado-bloqueado"><span class="material-symbols-outlined icon-xs" aria-hidden="true">lock</span> Bloqueado</span>
          </div>
        </div>
        <div class="progresso-etapas-barra" role="progressbar" aria-label="Progresso na trilha completa do curso" aria-valuenow="${infoWf.etapaAtual}" aria-valuemin="1" aria-valuemax="${infoWf.totalEtapas}">
          <div class="progresso-etapas-preenchimento" style="width: ${percentualTrilha}%"></div>
        </div>
      </div>
      <div class="mapa-orientacao-grid">
        ${mapaOrientacaoHtml}
      </div>
    </div>

    <div id="painel-wf-busca" class="wf-painel-flutuante" role="region" aria-label="Busca rápida na plataforma" hidden>
      <form class="wf-busca-form" onsubmit="event.preventDefault(); executarBuscaGlobalWayfinding(this.q.value);">
        <span class="material-symbols-outlined icon-sm" aria-hidden="true">search</span>
        <input type="search" name="q" placeholder="Buscar atividade, curso ou código BNCC (ex.: EF69CO03, Python, Robô)..." aria-label="Digite o que deseja buscar">
        <button type="submit" class="btn btn-primario btn-sm">Buscar</button>
        <button type="button" class="btn btn-neutro btn-sm" onclick="alternarPainelWayfinding(null)" aria-label="Fechar busca">Fechar</button>
      </form>
    </div>

    <div id="painel-wf-notificacoes" class="wf-painel-flutuante" role="region" aria-label="Notificações recentes" hidden>
      <div class="wf-painel-topo">
        <strong><span class="material-symbols-outlined icon-xs" aria-hidden="true">notifications</span> Notificações e Próximos Passos</strong>
        <button type="button" class="btn btn-xs btn-neutro" onclick="alternarPainelWayfinding(null)">Fechar</button>
      </div>
      <ul class="wf-lista-notificacoes">
        <li>
          <span class="material-symbols-outlined icon-xs cor-robo" aria-hidden="true">deployed_code</span>
          <div><strong>Laboratório 3D Python disponível:</strong> Complete os 6 desafios 3D para liberar o certificado <em>Explorador Python 3D</em>. <a href="/atividades.html?tipo=python3d">Abrir Laboratório Python 3D →</a></div>
        </li>
        <li>
          <span class="material-symbols-outlined icon-xs cor-meta" aria-hidden="true">check_circle</span>
          <div><strong>Trilhas BNCC Computação:</strong> Progresso sincronizado com os 3 eixos estruturantes. <a href="/perfil.html">Consultar Medalhas no Perfil →</a></div>
        </li>
      </ul>
    </div>

    <div id="painel-wf-config" class="wf-painel-flutuante" role="region" aria-label="Configurações de acessibilidade e leitura" hidden>
      <div class="wf-painel-topo">
        <strong><span class="material-symbols-outlined icon-xs" aria-hidden="true">settings</span> Configurações de Acessibilidade (WCAG 2.2 AA)</strong>
        <button type="button" class="btn btn-xs btn-neutro" onclick="alternarPainelWayfinding(null)">Fechar</button>
      </div>
      <div class="wf-opcoes-a11y">
        <label class="wf-check-label">
          <input type="checkbox" ${altoContrasteAtivo ? 'checked' : ''} onchange="aplicarPreferenciaAcessibilidade('alto-contraste', this.checked)">
          <span>Alto Contraste &amp; Daltonismo Seguro (reforço de bordas solida/dupla/tracejada e ícones >= 3:1)</span>
        </label>
        <label class="wf-check-label">
          <input type="checkbox" ${fonteAmpliadaAtiva ? 'checked' : ''} onchange="aplicarPreferenciaAcessibilidade('fonte-ampliada', this.checked)">
          <span>Texto Ampliado (+15% para leitura confortável)</span>
        </label>
        <label class="wf-check-label">
          <input type="checkbox" ${reduzirMovAtivo ? 'checked' : ''} onchange="aplicarPreferenciaAcessibilidade('reduzir-movimento', this.checked)">
          <span>Reduzir Animações e Transições</span>
        </label>
      </div>
    </div>

    <div id="painel-wf-ajuda" class="wf-painel-flutuante" role="region" aria-label="Guia rápido de localização e ajuda" hidden>
      <div class="wf-painel-topo">
        <strong><span class="material-symbols-outlined icon-xs" aria-hidden="true">help</span> Guia Rápido de Wayfinding (3 Segundos)</strong>
        <button type="button" class="btn btn-xs btn-neutro" onclick="alternarPainelWayfinding(null)">Fechar</button>
      </div>
      <p class="m-0 texto-pequeno">${infoWf.ajuda}</p>
      <div class="wf-ajuda-atalhos mt-8">
        <span><strong>Onde estou:</strong> ${infoWf.eixo} → ${infoWf.titulo} (Etapa ${infoWf.etapaAtual} de ${infoWf.totalEtapas})</span>
        <span><strong>Como voltar:</strong> Botão <em>${linkVoltar.rotulo}</em> à direita</span>
      </div>
    </div>

    <!-- Barra Contextual de Wayfinding Digital (Pilar 2: nav aria-label="Você está aqui", lista ordenada, versão compacta mobile e último item sem link) -->
    <nav class="wayfinding-bar" id="barra-wayfinding-universal" aria-label="Você está aqui">
      <div class="wf-onde-estou">
        <a href="${linkVoltar.href}" class="wf-breadcrumb-mobile-voltar seta-voltar" title="Voltar para ${linkVoltar.rotulo}">
          <span class="material-symbols-outlined icon-xs" aria-hidden="true">arrow_back</span>
          <span>Voltar para ${linkVoltar.rotulo}</span>
        </a>
        <span class="wf-pergunta-tag">Onde estou:</span>
        <ol class="wf-breadcrumb-lista">
          <li>
            <a href="${rotaInicio}" class="wf-breadcrumb-link">
              <span class="material-symbols-outlined icon-xs" aria-hidden="true">home</span>
              <span>Início</span>
            </a>
          </li>
          <li class="wf-breadcrumb-eixo">${infoWf.eixo}</li>
          <li aria-current="page" class="wf-breadcrumb-atual">
            <span class="material-symbols-outlined icon-xs" aria-hidden="true">${infoWf.icone}</span>
            <strong>${infoWf.titulo}</strong>
          </li>
        </ol>
      </div>

      <div class="wf-como-volto-avanco" role="group" aria-label="Voltar ou avançar no fluxo">
        <button type="button" class="btn btn-neutro btn-sm wf-nav-btn" onclick="alternarPainelWayfinding('painel-wf-mapa')" title="Ver Mapa do Curso (Etapa ${infoWf.etapaAtual} de ${infoWf.totalEtapas})">
          <span class="material-symbols-outlined icon-xs" aria-hidden="true">map</span>
          <span>Etapa ${infoWf.etapaAtual} de ${infoWf.totalEtapas}</span>
        </button>
        <a href="${linkVoltar.href}" class="btn btn-neutro btn-sm wf-nav-btn seta-voltar" title="Voltar para ${linkVoltar.rotulo}">
          <span class="material-symbols-outlined icon-xs" aria-hidden="true">arrow_back</span>
          <span>Voltar: ${linkVoltar.rotulo}</span>
        </a>
        <a href="${infoWf.avancar.href}" class="btn btn-primario btn-sm wf-nav-btn seta-proximo" title="Avançar para ${infoWf.avancar.rotulo}">
          <span>${infoWf.avancar.rotulo}</span>
          <span class="material-symbols-outlined icon-xs" aria-hidden="true">arrow_forward</span>
        </a>
      </div>
    </nav>
  `;

  const sidebarContainer = document.getElementById('sidebar-container');
  const topbarContainer = document.getElementById('topbar-container');

  if (sidebarContainer) sidebarContainer.innerHTML = sidebarHtml;
  if (topbarContainer) topbarContainer.innerHTML = topbarHtml;
}

/**
 * Exibe notificação acessível (Toast/Banner) com role="alert" e aria-live="polite".
 * Substitui chamadas síncronas a alert() de forma não-bloqueante e estilizada.
 * @param {string} mensagem Texto da notificação
 * @param {'info'|'sucesso'|'erro'|'alerta'} [tipo='info'] Tipo visual e semântico
 * @param {number} [duracao=4000] Duração em ms
 */
function mostrarNotificacao(mensagem, tipo = 'info', duracao = 4000) {
  let container = document.getElementById('lms-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'lms-toast-container';
    container.className = 'toast-container-global';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${tipo}`;
  toast.setAttribute('role', tipo === 'erro' ? 'alert' : 'status');

  const icones = {
    sucesso: 'check_circle',
    erro: 'error',
    alerta: 'warning',
    info: 'info',
  };
  const iconeNome = icones[tipo] || 'info';

  const textoSeguro = String(mensagem || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  toast.innerHTML = `
    <span class="material-symbols-outlined icon-xs toast-icone" aria-hidden="true">${iconeNome}</span>
    <span class="toast-mensagem">${textoSeguro}</span>
    <button type="button" class="toast-fechar" aria-label="Fechar aviso">
      <span class="material-symbols-outlined icon-xs" aria-hidden="true">close</span>
    </button>
  `;

  const fecharBtn = toast.querySelector('.toast-fechar');
  const fechar = () => {
    toast.classList.add('toast-saindo');
    setTimeout(() => toast.remove(), 250);
  };
  fecharBtn.addEventListener('click', fechar);

  container.appendChild(toast);
  if (duracao > 0) {
    setTimeout(fechar, duracao);
  }
}

if (typeof window !== 'undefined') {
  window.mostrarNotificacao = mostrarNotificacao;
}


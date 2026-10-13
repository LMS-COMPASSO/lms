/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - GERENCIADOR DE LAYOUT E NAVEGAÇÃO
 * ============================================================================
 * Este script monta dinamicamente a barra lateral (Sidebar) e a barra superior
 * (Topbar) nas páginas internas do sistema, adaptando os links de menu de acordo
 * com o perfil do usuário logado (Aluno, Instrutor/Professor ou Administrador).
 * ============================================================================
 */

/**
 * Constrói e injeta a navegação da aplicação nos contêineres HTML da página.
 * Suporta alternância responsiva: drawer deslizante em telas menores (<= 1024px)
 * e modo compacto/recolhível com preservação no desktop (> 1024px).
 */
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

window.alternarSidebar = alternarSidebar;
window.fecharSidebar = fecharSidebar;

// Listener para fechar menu móvel com a tecla ESC ou redimensionamento
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') fecharSidebar();
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 1024) fecharSidebar();
});

function montarLayout(paginaAtiva) {
  const usuario = obterUsuario();
  if (!usuario) return;

  // Definição de todos os itens do menu de navegação com ícones Material Symbols
  const itensMenu = [
    {
      href: '/dashboard.html',
      icone: 'dashboard',
      label: 'Dashboard',
      chave: 'dashboard',
      perfis: ['administrador', 'instrutor'],
    },
    {
      href: '/cursos.html',
      icone: 'school',
      label: 'Cursos',
      chave: 'cursos',
      perfis: ['administrador', 'instrutor', 'aluno'],
    },
    {
      href: '/atividades.html',
      icone: 'extension',
      label: 'Atividades',
      chave: 'atividades',
      perfis: ['administrador', 'instrutor', 'aluno'],
    },
    {
      href: '/matriculas.html',
      icone: 'how_to_reg',
      label: 'Matrículas',
      chave: 'matriculas',
      perfis: ['administrador', 'instrutor', 'aluno'],
    },
    {
      href: '/certificados.html',
      icone: 'workspace_premium',
      label: 'Certificados',
      chave: 'certificados',
      perfis: ['administrador', 'instrutor', 'aluno'],
    },
    {
      href: '/usuarios.html',
      icone: 'group',
      label: 'Usuários',
      chave: 'usuarios',
      perfis: ['administrador'],
    },
    {
      href: '/perfil.html',
      icone: 'account_circle',
      label: 'Meu Perfil',
      chave: 'perfil',
      perfis: ['administrador', 'instrutor', 'aluno'],
    },
  ];

  // Filtra os itens que o perfil atual tem permissão para visualizar
  const itensVisiveis = itensMenu.filter((item) => item.perfis.includes(usuario.perfil));

  // Verifica preferência salva de sidebar recolhida no desktop
  let recolhidaInicial = false;
  try {
    recolhidaInicial = window.innerWidth > 1024 && localStorage.getItem('lms_sidebar_recolhida') === '1';
    if (recolhidaInicial) document.body.classList.add('sidebar-recolhida');
  } catch {}

  const inicialNome = (usuario.nome || 'U').charAt(0).toUpperCase();

  // Monta a estrutura HTML da barra lateral (Sidebar) e seu backdrop mobile
  const sidebarHtml = `
    <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="fecharSidebar()" aria-hidden="true"></div>
    <aside class="sidebar ${recolhidaInicial ? 'recolhida' : ''}" id="sidebar" aria-label="Navegação Principal">
      <div class="sidebar-header">
        <a href="/dashboard.html" class="logo" title="LMS COMPASSO - BNCC Computação">
          <div class="logo-icone-wrapper">
            <img src="/img/logo-icone-branco.svg" alt="Logo LMS COMPASSO">
          </div>
          <div class="logo-texto">
            <span class="logo-titulo">LMS COMPASSO</span>
            <span class="logo-subtitulo">BNCC Computação</span>
          </div>
        </a>
        <button class="btn-fechar-sidebar" type="button" aria-label="Fechar menu lateral" onclick="fecharSidebar()">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-secao-rotulo">Navegação</div>
        ${itensVisiveis.map((item) => `
          <a href="${item.href}" class="nav-item ${item.chave === paginaAtiva ? 'ativo' : ''}" title="${item.label}" onclick="if (window.innerWidth <= 1024) fecharSidebar()">
            <div class="nav-item-icone">
              <span class="material-symbols-outlined">${item.icone}</span>
            </div>
            <span class="nav-item-texto">${item.label}</span>
            ${item.chave === paginaAtiva ? '<span class="nav-item-indicador" aria-hidden="true"></span>' : ''}
          </a>
        `).join('')}
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-usuario-card" title="${usuario.nome} (${usuario.perfil})">
          <div class="usuario-avatar-mini">${inicialNome}</div>
          <div class="usuario-info-mini">
            <span class="usuario-nome-mini">${usuario.nome}</span>
            <span class="badge badge-${usuario.perfil} badge-micro">${usuario.perfil}</span>
          </div>
        </div>
        <button type="button" class="nav-item-sair" onclick="encerrarSessao()" title="Encerrar Sessão">
          <span class="material-symbols-outlined">logout</span>
          <span class="nav-item-texto">Sair</span>
        </button>
      </div>
    </aside>
  `;

  // Monta a estrutura HTML da barra superior (Topbar)
  const topbarHtml = `
    <div class="topbar">
      <div class="flex-linha">
        <button class="menu-toggle" type="button" aria-label="Alternar menu lateral" onclick="alternarSidebar()">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <h1 id="titulo-pagina"></h1>
      </div>
      <div class="texto-direita topbar-usuario">
        <strong>${usuario.nome}</strong>
        <div><span class="badge badge-${usuario.perfil}">${usuario.perfil}</span></div>
      </div>
    </div>
  `;

  // Injeta nos elementos da página se existirem no DOM
  const sidebarContainer = document.getElementById('sidebar-container');
  const topbarContainer = document.getElementById('topbar-container');

  if (sidebarContainer) sidebarContainer.innerHTML = sidebarHtml;
  if (topbarContainer) topbarContainer.innerHTML = topbarHtml;
}

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
 *
 * @param {string} paginaAtiva - Identificador da página atual (ex: 'cursos', 'dashboard').
 */
function alternarSidebar() {
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('sidebar-backdrop');
  if (sb) sb.classList.toggle('aberta');
  if (bd) bd.classList.toggle('ativa');
}

function fecharSidebar() {
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('sidebar-backdrop');
  if (sb) sb.classList.remove('aberta');
  if (bd) bd.classList.remove('ativa');
}

window.alternarSidebar = alternarSidebar;
window.fecharSidebar = fecharSidebar;

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

  // Monta a estrutura HTML da barra lateral (Sidebar) e seu backdrop mobile
  const sidebarHtml = `
    <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="fecharSidebar()"></div>
    <aside class="sidebar" id="sidebar">
      <div class="logo">
        <img src="/img/logo-icone-branco.svg" alt="LMS COMPASSO">
        <span>
          LMS COMPASSO
          <small>BNCC Computação</small>
        </span>
      </div>
      <nav>
        ${itensVisiveis.map((item) => `
          <a href="${item.href}" class="${item.chave === paginaAtiva ? 'ativo' : ''}">
            <span class="material-symbols-outlined">${item.icone}</span>
            <span>${item.label}</span>
          </a>
        `).join('')}
        <a onclick="encerrarSessao()" class="cursor-pointer">
          <span class="material-symbols-outlined">logout</span>
          <span>Sair</span>
        </a>
      </nav>
    </aside>
  `;

  // Monta a estrutura HTML da barra superior (Topbar)
  const topbarHtml = `
    <div class="topbar">
      <div class="flex-linha">
        <button class="menu-toggle" type="button" aria-label="Abrir menu" onclick="alternarSidebar()">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <h1 id="titulo-pagina"></h1>
      </div>
      <div class="texto-direita">
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

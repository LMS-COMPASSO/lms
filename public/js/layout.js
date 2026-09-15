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
function montarLayout(paginaAtiva) {
  const usuario = obterUsuario();
  if (!usuario) return;

  // Definição de todos os itens do menu de navegação e quais perfis têm acesso a cada um
  const itensMenu = [
    {
      href: '/dashboard.html',
      icone: '📊',
      label: 'Dashboard',
      chave: 'dashboard',
      perfis: ['administrador', 'instrutor'],
    },
    {
      href: '/cursos.html',
      icone: '📚',
      label: 'Cursos',
      chave: 'cursos',
      perfis: ['administrador', 'instrutor', 'aluno'],
    },
    {
      href: '/matriculas.html',
      icone: '🎓',
      label: 'Matrículas',
      chave: 'matriculas',
      perfis: ['administrador', 'instrutor', 'aluno'],
    },
    {
      href: '/certificados.html',
      icone: '📜',
      label: 'Certificados',
      chave: 'certificados',
      perfis: ['administrador', 'instrutor', 'aluno'],
    },
    {
      href: '/usuarios.html',
      icone: '👥',
      label: 'Usuários',
      chave: 'usuarios',
      perfis: ['administrador'],
    },
    {
      href: '/perfil.html',
      icone: '⚙️',
      label: 'Meu Perfil',
      chave: 'perfil',
      perfis: ['administrador', 'instrutor', 'aluno'],
    },
  ];

  // Filtra os itens que o perfil atual tem permissão para visualizar
  const itensVisiveis = itensMenu.filter((item) => item.perfis.includes(usuario.perfil));

  // Monta a estrutura HTML da barra lateral (Sidebar)
  const sidebarHtml = `
    <aside class="sidebar" id="sidebar">
      <div class="logo">
        LMS BNCC Computação
        <small>Ensino de Computação • BNCC</small>
      </div>
      <nav>
        ${itensVisiveis.map((item) => `
          <a href="${item.href}" class="${item.chave === paginaAtiva ? 'ativo' : ''}">
            <span>${item.icone}</span> ${item.label}
          </a>
        `).join('')}
        <a onclick="encerrarSessao()" style="cursor: pointer;">
          <span>🚪</span> Sair
        </a>
      </nav>
    </aside>
  `;

  // Monta a estrutura HTML da barra superior (Topbar)
  const topbarHtml = `
    <div class="topbar">
      <div style="display:flex; align-items:center; gap:12px;">
        <button class="menu-toggle" onclick="document.getElementById('sidebar').classList.toggle('aberta')">☰</button>
        <h1 id="titulo-pagina"></h1>
      </div>
      <div style="text-align:right;">
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

// Monta a sidebar e a topbar em páginas internas, de acordo com o perfil do usuário logado.
function montarLayout(paginaAtiva) {
  const usuario = obterUsuario();
  if (!usuario) return;

  const itensMenu = [
    { href: '/dashboard.html', icone: '📊', label: 'Dashboard', chave: 'dashboard', perfis: ['administrador', 'instrutor'] },
    { href: '/cursos.html', icone: '📚', label: 'Cursos', chave: 'cursos', perfis: ['administrador', 'instrutor', 'aluno'] },
    { href: '/matriculas.html', icone: '🎓', label: 'Matrículas', chave: 'matriculas', perfis: ['administrador', 'instrutor', 'aluno'] },
    { href: '/certificados.html', icone: '📜', label: 'Certificados', chave: 'certificados', perfis: ['administrador', 'instrutor', 'aluno'] },
    { href: '/usuarios.html', icone: '👥', label: 'Usuários', chave: 'usuarios', perfis: ['administrador'] },
    { href: '/perfil.html', icone: '⚙️', label: 'Meu Perfil', chave: 'perfil', perfis: ['administrador', 'instrutor', 'aluno'] },
  ];

  const itensVisiveis = itensMenu.filter((item) => item.perfis.includes(usuario.perfil));

  const sidebarHtml = `
    <aside class="sidebar" id="sidebar">
      <div class="logo">LMS BNCC Computação
        <small>Ensino de Computação • BNCC</small>
      </div>
      <nav>
        ${itensVisiveis.map((item) => `
          <a href="${item.href}" class="${item.chave === paginaAtiva ? 'ativo' : ''}">
            <span>${item.icone}</span> ${item.label}
          </a>
        `).join('')}
        <a onclick="encerrarSessao()">🚪 Sair</a>
      </nav>
    </aside>
  `;

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

  document.getElementById('sidebar-container').innerHTML = sidebarHtml;
  document.getElementById('topbar-container').innerHTML = topbarHtml;
}

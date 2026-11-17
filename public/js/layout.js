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

/**
 * Auxiliar interno de tradução com fallback seguro em português enquanto o módulo i18n carrega.
 */
function trLayout(chave, params = {}, padrao = null) {
  if (typeof window !== 'undefined' && typeof window.t === 'function') {
    return window.t(chave, params, padrao ?? chave);
  }
  let texto = padrao ?? chave;
  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([k, v]) => {
      texto = String(texto).replaceAll(`{${k}}`, String(v));
    });
  }
  return texto;
}

// Importa assincronamente i18n, motor de hidratação SVG e rolagem horizontal universal
if (typeof window !== 'undefined') {
  import('/js/i18n.js').catch((err) => console.warn('Módulo i18n não carregado neste contexto:', err?.message || err));
  import('/js/icones-universais.js').catch((err) => console.warn('Módulo de ícones não carregado neste contexto:', err?.message || err));
  import('/js/menu-universal.js').then((m) => {
    if (typeof m.habilitarRolagemHorizontalMenus === 'function') {
      m.habilitarRolagemHorizontalMenus();
    }
  }).catch((err) => console.warn('Módulo menu-universal indisponível:', err?.message || err));
}

function obterMapaWayfindingPaginas() {
  return {
    dashboard: {
      titulo: trLayout('layout.wf.dashboard.titulo', {}, 'Painel Geral'),
      eixo: trLayout('layout.wf.dashboard.eixo', {}, 'Gestão & Monitoramento BNCC'),
      secao: 'professor',
      rotuloSecao: trLayout('layout.sec.professor', {}, 'Professor & Gestão'),
      icone: 'dashboard',
      etapaAtual: 1,
      totalEtapas: 6,
      voltar: { href: '/', rotulo: trLayout('layout.wf.dashboard.voltar', {}, 'Página Inicial') },
      avancar: { href: '/cursos.html', rotulo: trLayout('layout.wf.dashboard.avancar', {}, 'Explorar Cursos') },
      ajuda: trLayout('layout.wf.dashboard.ajuda', {}, 'Você está no Painel Geral. Aqui você visualiza indicadores da turma, consolidação de habilidades BNCC e submissões de código Python 3D.'),
    },
    cursos: {
      titulo: trLayout('layout.wf.cursos.titulo', {}, 'Cursos'),
      eixo: trLayout('layout.wf.cursos.eixo', {}, 'Trilhas Curriculares BNCC'),
      secao: 'aluno',
      rotuloSecao: trLayout('layout.sec.aluno', {}, 'Área do Aluno'),
      icone: 'menu_book',
      etapaAtual: 1,
      totalEtapas: 6,
      voltar: { href: '/dashboard.html', rotulo: trLayout('layout.wf.cursos.voltar', {}, 'Painel Geral') },
      avancar: { href: '/atividades.html', rotulo: trLayout('layout.wf.cursos.avancar', {}, 'Ir para Atividades') },
      ajuda: trLayout('layout.wf.cursos.ajuda', {}, 'Você está em Cursos. Filtre por Eixo da BNCC Computação (Pensamento Computacional, Mundo Digital ou Cultura Digital) e clique em Abrir.'),
    },
    'curso-detalhe': {
      titulo: trLayout('layout.wf.cursoDetalhe.titulo', {}, 'Detalhe do Curso'),
      eixo: trLayout('layout.wf.cursoDetalhe.eixo', {}, 'Módulos & Aulas'),
      secao: 'pensamento',
      rotuloSecao: trLayout('layout.sec.trilhaCurso', {}, 'Trilha do Curso'),
      icone: 'menu_book',
      etapaAtual: 2,
      totalEtapas: 6,
      voltar: { href: '/cursos.html', rotulo: trLayout('layout.wf.cursoDetalhe.voltar', {}, 'Trilhas') },
      avancar: { href: '/atividades.html', rotulo: trLayout('layout.wf.cursoDetalhe.avancar', {}, 'Praticar Atividades') },
      ajuda: trLayout('layout.wf.cursoDetalhe.ajuda', {}, 'Você está dentro de um Curso. Avance pelas aulas dos módulos, acompanhe o Mapa do Curso e marque cada etapa como Concluída.'),
    },
    atividades: {
      titulo: trLayout('layout.wf.atividades.titulo', {}, 'Atividades & Laboratório 3D'),
      eixo: trLayout('layout.wf.atividades.eixo', {}, 'Eixo 1: Pensamento Computacional'),
      secao: 'pensamento',
      rotuloSecao: trLayout('eixo.pensamento-computacional', {}, 'Pensamento Computacional'),
      icone: 'format_list_numbered',
      etapaAtual: 2,
      totalEtapas: 6,
      voltar: { href: '/cursos.html', rotulo: trLayout('layout.wf.atividades.voltar', {}, 'Trilhas') },
      avancar: { href: '/mundo-digital.html', rotulo: trLayout('layout.wf.atividades.avancar', {}, 'Avançar: Mundo Digital') },
      ajuda: trLayout('layout.wf.atividades.ajuda', {}, 'Você está no Catálogo de Atividades e Laboratório 3D Python. Escolha um desafio por ano escolar ou código BNCC para praticar algoritmos.'),
    },
    'mundo-digital': {
      titulo: trLayout('layout.wf.mundoDigital.titulo', {}, 'Mundo Digital'),
      eixo: trLayout('layout.wf.mundoDigital.eixo', {}, 'Eixo 2: Hardware & Redes'),
      secao: 'mundo',
      rotuloSecao: trLayout('eixo.mundo-digital', {}, 'Mundo Digital'),
      icone: 'memory',
      etapaAtual: 3,
      totalEtapas: 6,
      voltar: { href: '/atividades.html', rotulo: trLayout('layout.wf.mundoDigital.voltar', {}, 'Atividades') },
      avancar: { href: '/cultura-digital.html', rotulo: trLayout('layout.wf.mundoDigital.avancar', {}, 'Avançar: Cultura Digital') },
      ajuda: trLayout('layout.wf.mundoDigital.ajuda', {}, 'Você está no laboratório do Eixo Mundo Digital. Inspecione a placa-mãe em 3D, simule o ciclo da CPU e acompanhe pacotes na rede.'),
    },
    'cultura-digital': {
      titulo: trLayout('layout.wf.culturaDigital.titulo', {}, 'Cultura Digital'),
      eixo: trLayout('layout.wf.culturaDigital.eixo', {}, 'Eixo 3: Cidadania & Segurança'),
      secao: 'cultura',
      rotuloSecao: trLayout('eixo.cultura-digital', {}, 'Cultura Digital'),
      icone: 'verified_user',
      etapaAtual: 4,
      totalEtapas: 6,
      voltar: { href: '/mundo-digital.html', rotulo: trLayout('layout.wf.culturaDigital.voltar', {}, 'Mundo Digital') },
      avancar: { href: '/certificados.html', rotulo: trLayout('layout.wf.culturaDigital.avancar', {}, 'Avançar: Certificados') },
      ajuda: trLayout('layout.wf.culturaDigital.ajuda', {}, 'Você está no laboratório do Eixo Cultura Digital. Pratique decisões seguras no simulador de chat, cofre de senhas e pegada digital.'),
    },
    matriculas: {
      titulo: trLayout('layout.wf.matriculas.titulo', {}, 'Matrículas'),
      eixo: trLayout('layout.wf.matriculas.eixo', {}, 'Acompanhamento de Progresso'),
      secao: 'aluno',
      rotuloSecao: trLayout('layout.sec.aluno', {}, 'Área do Aluno'),
      icone: 'how_to_reg',
      etapaAtual: 5,
      totalEtapas: 6,
      voltar: { href: '/cursos.html', rotulo: trLayout('layout.wf.matriculas.voltar', {}, 'Trilhas') },
      avancar: { href: '/certificados.html', rotulo: trLayout('layout.wf.matriculas.avancar', {}, 'Ir para Certificados') },
      ajuda: trLayout('layout.wf.matriculas.ajuda', {}, 'Você está em Matrículas. Acompanhe o percentual de progresso em cada curso e emita o certificado ao atingir 100%.'),
    },
    certificados: {
      titulo: trLayout('layout.wf.certificados.titulo', {}, 'Certificados'),
      eixo: trLayout('layout.wf.certificados.eixo', {}, 'Conquistas & Validação'),
      secao: 'aluno',
      rotuloSecao: trLayout('layout.sec.aluno', {}, 'Área do Aluno'),
      icone: 'workspace_premium',
      etapaAtual: 6,
      totalEtapas: 6,
      voltar: { href: '/matriculas.html', rotulo: trLayout('layout.wf.certificados.voltar', {}, 'Matrículas') },
      avancar: { href: '/perfil.html', rotulo: trLayout('layout.wf.certificados.avancar', {}, 'Ver Minhas Medalhas') },
      ajuda: trLayout('layout.wf.certificados.ajuda', {}, 'Você está em Certificados. Baixe seus certificados em PDF/A4 ou valide o código de autenticidade.'),
    },
    usuarios: {
      titulo: trLayout('layout.wf.usuarios.titulo', {}, 'Usuários'),
      eixo: trLayout('layout.wf.usuarios.eixo', {}, 'Administração Escolar'),
      secao: 'professor',
      rotuloSecao: trLayout('layout.sec.professor', {}, 'Professor & Gestão'),
      icone: 'group',
      etapaAtual: 1,
      totalEtapas: 6,
      voltar: { href: '/dashboard.html', rotulo: trLayout('layout.wf.usuarios.voltar', {}, 'Painel') },
      avancar: { href: '/perfil.html', rotulo: trLayout('layout.wf.usuarios.avancar', {}, 'Ir para Meu Perfil') },
      ajuda: trLayout('layout.wf.usuarios.ajuda', {}, 'Você está na gestão de Usuários. Cadastre ou edite contas de estudantes, professores e administradores.'),
    },
    perfil: {
      titulo: trLayout('layout.wf.perfil.titulo', {}, 'Meu Perfil'),
      eixo: trLayout('layout.wf.perfil.eixo', {}, 'Conta & Insígnias BNCC'),
      secao: 'config',
      rotuloSecao: trLayout('layout.sec.config', {}, 'Configurações & Perfil'),
      icone: 'account_circle',
      etapaAtual: 6,
      totalEtapas: 6,
      voltar: { href: '/certificados.html', rotulo: trLayout('layout.wf.perfil.voltar', {}, 'Certificados') },
      avancar: { href: '/atividades.html', rotulo: trLayout('layout.wf.perfil.avancar', {}, 'Praticar Atividades') },
      ajuda: trLayout('layout.wf.perfil.ajuda', {}, 'Você está em Meu Perfil. Consulte seus dados, altere sua senha e acompanhe suas medalhas conquistadas nos 3 eixos da BNCC.'),
    },
    planos: {
      titulo: trLayout('layout.wf.planos.titulo', {}, 'Planos & Assinaturas'),
      eixo: trLayout('layout.wf.planos.eixo', {}, 'Modelos BMC & Contratação Institucional'),
      secao: 'config',
      rotuloSecao: trLayout('layout.sec.gestaoEscolar', {}, 'Gestão Escolar'),
      icone: 'credit_card',
      etapaAtual: 6,
      totalEtapas: 6,
      voltar: { href: '/dashboard.html', rotulo: trLayout('layout.wf.planos.voltar', {}, 'Painel Geral') },
      avancar: { href: '/atividades.html', rotulo: trLayout('layout.wf.planos.avancar', {}, 'Atividades') },
      ajuda: trLayout('layout.wf.planos.ajuda', {}, 'Você está em Planos e Assinaturas. Simule valores por quantidade de alunos, contratações públicas e adesão institucional.'),
    },
    workspace: {
      titulo: trLayout('layout.wf.workspace.titulo', {}, 'Workspace & Hub de Ideias'),
      eixo: trLayout('layout.wf.workspace.eixo', {}, 'Organização de Estudos & Projetos BNCC'),
      secao: 'aluno',
      rotuloSecao: trLayout('layout.sec.caderno', {}, 'Caderno do Estudante'),
      icone: 'lightbulb',
      etapaAtual: 2,
      totalEtapas: 6,
      voltar: { href: '/atividades.html', rotulo: trLayout('layout.wf.workspace.voltar', {}, 'Atividades') },
      avancar: { href: '/cursos.html', rotulo: trLayout('layout.wf.workspace.avancar', {}, 'Explorar Cursos') },
      ajuda: trLayout('layout.wf.workspace.ajuda', {}, 'Você está no Workspace estilo Notion. Alterne entre Kanban, Galeria e Tabela, use comandos "/" para criar blocos e personalize capas e ícones.'),
    },
  };
}

function obterTrilhaOrientacaoCurso() {
  return [
    {
      etapa: 1,
      chave: 'cursos',
      titulo: trLayout('layout.trilha.1.titulo', {}, '1. Explorar Trilhas & Cursos'),
      eixo: trLayout('layout.trilha.1.eixo', {}, 'Área do Aluno · Início da Jornada'),
      secao: 'aluno',
      icone: 'menu_book',
      href: '/cursos.html',
    },
    {
      etapa: 2,
      chave: 'atividades',
      titulo: trLayout('layout.trilha.2.titulo', {}, '2. Eixo 1: Pensamento Computacional'),
      eixo: trLayout('layout.trilha.2.eixo', {}, 'Algoritmos, Decomposição & Python 3D'),
      secao: 'pensamento',
      icone: 'format_list_numbered',
      href: '/atividades.html',
    },
    {
      etapa: 3,
      chave: 'mundo-digital',
      titulo: trLayout('layout.trilha.3.titulo', {}, '3. Eixo 2: Mundo Digital'),
      eixo: trLayout('layout.trilha.3.eixo', {}, 'Hardware 3D, Ciclo da CPU & Redes'),
      secao: 'mundo',
      icone: 'memory',
      href: '/mundo-digital.html',
    },
    {
      etapa: 4,
      chave: 'cultura-digital',
      titulo: trLayout('layout.trilha.4.titulo', {}, '4. Eixo 3: Cultura Digital'),
      eixo: trLayout('layout.trilha.4.eixo', {}, 'Ética, Segurança & Pegada Digital'),
      secao: 'cultura',
      icone: 'verified_user',
      href: '/cultura-digital.html',
    },
    {
      etapa: 5,
      chave: 'matriculas',
      titulo: trLayout('layout.trilha.5.titulo', {}, '5. Acompanhamento & Matrículas'),
      eixo: trLayout('layout.trilha.5.eixo', {}, 'Progresso nos Módulos e Aulas'),
      secao: 'aluno',
      icone: 'how_to_reg',
      href: '/matriculas.html',
    },
    {
      etapa: 6,
      chave: 'certificados',
      titulo: trLayout('layout.trilha.6.titulo', {}, '6. Certificados & Insígnias BNCC'),
      eixo: trLayout('layout.trilha.6.eixo', {}, 'Emissão Oficial & Portfólio'),
      secao: 'config',
      icone: 'workspace_premium',
      href: '/certificados.html',
    },
  ];
}

const TRILHA_ORIENTACAO_CURSO = obterTrilhaOrientacaoCurso();

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
    } catch (erroStorage) {
      console.warn('Falha ao salvar estado da sidebar:', erroStorage?.message || erroStorage);
    }
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

function aplicarClassePreferenciaAcessibilidade(chave, ativo) {
  try {
    localStorage.setItem(`lms_a11y_${chave}`, ativo ? '1' : '0');
  } catch (erroStorage) {
    console.warn('Falha ao salvar preferência A11y:', erroStorage?.message || erroStorage);
  }
  document.documentElement.classList.toggle(`a11y-${chave}`, Boolean(ativo));
}

function aplicarPreferenciaAcessibilidade(chave, ativo) {
  aplicarClassePreferenciaAcessibilidade(chave, ativo);
  window.dispatchEvent(new CustomEvent('preferenciasA11yAtualizadas'));

  // Sincroniza com Cloudflare D1 se o usuário estiver autenticado
  if (typeof api === 'function' && typeof obterToken === 'function' && obterToken()) {
    api('/preferencias', {
      method: 'PUT',
      body: JSON.stringify({
        alto_contraste: document.documentElement.classList.contains('a11y-alto-contraste') ? 1 : 0,
        fonte_ampliada: document.documentElement.classList.contains('a11y-fonte-ampliada') ? 1 : 0,
        reduzir_movimento: document.documentElement.classList.contains('a11y-reduzir-movimento') ? 1 : 0,
      }),
    }).catch((erroSync) => console.warn('Preferências mantidas apenas localmente:', erroSync?.message || erroSync));
  }
}

function aplicarPreferenciasRemotas(prefs) {
  if (!prefs) return;
  const campos = [
    ['alto_contraste', 'alto-contraste'],
    ['fonte_ampliada', 'fonte-ampliada'],
    ['reduzir_movimento', 'reduzir-movimento'],
  ];
  campos.forEach(([campoApi, chaveCss]) => {
    if (prefs[campoApi] !== undefined) {
      aplicarClassePreferenciaAcessibilidade(chaveCss, Boolean(prefs[campoApi]));
    }
  });
  window.dispatchEvent(new CustomEvent('preferenciasA11yAtualizadas'));
}

function restaurarPreferenciasAcessibilidade() {
  ['alto-contraste', 'fonte-ampliada', 'reduzir-movimento'].forEach((chave) => {
    try {
      if (localStorage.getItem(`lms_a11y_${chave}`) === '1') {
        document.documentElement.classList.add(`a11y-${chave}`);
      }
    } catch (erroStorage) {
      console.warn('Preferências A11y locais indisponíveis:', erroStorage?.message || erroStorage);
    }
  });

  if (typeof api !== 'function' || typeof obterToken !== 'function' || !obterToken()) return;
  api('/preferencias')
    .then(aplicarPreferenciasRemotas)
    .catch((erroPrefs) => console.warn('Falha ao restaurar preferências remotas:', erroPrefs?.message || erroPrefs));
}

function lerTemaSalvoSeguro() {
  try {
    return localStorage.getItem('lms_tema') || '';
  } catch (erroTema) {
    console.warn('Tema local indisponível:', erroTema?.message || erroTema);
    return '';
  }
}

function executarBuscaGlobalWayfinding(termo) {
  const q = String(termo || '').trim();
  if (!q) return;
  window.location.href = `/atividades.html?busca=${encodeURIComponent(q)}`;
}

function atualizarBotoesTema() {
  try {
    const modoSalvo = localStorage.getItem('lms_tema');
    const btnAuto = document.getElementById('btn-tema-auto');
    const btnClaro = document.getElementById('btn-tema-claro');
    const btnEscuro = document.getElementById('btn-tema-escuro');

    if (btnAuto) btnAuto.classList.toggle('ativo', !modoSalvo);
    if (btnClaro) btnClaro.classList.toggle('ativo', modoSalvo === 'claro');
    if (btnEscuro) btnEscuro.classList.toggle('ativo', modoSalvo === 'escuro');
  } catch (erroBotoes) {
    console.warn('Erro ao atualizar botões de tema:', erroBotoes?.message || erroBotoes);
  }
}

window.alternarSidebar = alternarSidebar;
window.fecharSidebar = fecharSidebar;
window.alternarPainelWayfinding = alternarPainelWayfinding;
window.aplicarPreferenciaAcessibilidade = aplicarPreferenciaAcessibilidade;
window.executarBuscaGlobalWayfinding = executarBuscaGlobalWayfinding;
window.atualizarBotoesTema = atualizarBotoesTema;
window.addEventListener('temaAlterado', () => atualizarBotoesTema());

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

let _paginaAtivaLayout = null;
let _listenersIdiomaLayoutRegistrados = false;

function garantirListenersIdiomaLayout() {
  if (_listenersIdiomaLayoutRegistrados || typeof window === 'undefined') return;
  _listenersIdiomaLayoutRegistrados = true;
  const reRender = () => {
    if (!_paginaAtivaLayout) return;
    montarLayout(_paginaAtivaLayout);
    window.dispatchEvent(new CustomEvent('lms:layout-atualizado', { detail: { pagina: _paginaAtivaLayout } }));
  };
  window.addEventListener('lms:i18n-pronto', reRender);
  window.addEventListener('lms:idioma-alterado', reRender);
}

function sincronizarTemaEBodyLayout(secao) {
  document.body.setAttribute('data-secao', secao || 'pensamento');
  const prefereEscuro = Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const temaAtual = document.documentElement.getAttribute('data-tema') || (prefereEscuro ? 'escuro' : 'claro');
  document.documentElement.setAttribute('data-tema', temaAtual);
  document.body.setAttribute('data-tema', temaAtual);
  document.body.classList.add('suporta-tema-sistema');
}

function detectarEstadoSidebarInicial() {
  try {
    const recolhida = window.innerWidth > 1024 && localStorage.getItem('lms_sidebar_recolhida') === '1';
    if (recolhida) document.body.classList.add('sidebar-recolhida');
    return recolhida;
  } catch (erroSidebar) {
    console.warn('Preferência inicial da sidebar indisponível:', erroSidebar?.message || erroSidebar);
    return false;
  }
}

function ehUsuarioGoogleLayout(usuario) {
  if (!usuario) return false;
  const email = String(usuario.email || '');
  const dominioEdu = email.endsWith('.edu.br') || email.endsWith('.gov.br') || email.includes('escola') || email.includes('educacao');
  return Boolean(
    usuario.metodo_auth === 'google_academico'
    || usuario.conta_academica
    || usuario.google
    || usuario.google_academic
    || usuario.google_id
    || dominioEdu,
  );
}

function obterItensNavegacaoVisiveis(perfil) {
  const itensMenu = [
    { href: '/dashboard.html', icone: 'dashboard', label: trLayout('layout.menu.dashboard', {}, 'Dashboard'), chave: 'dashboard', secao: 'professor', perfis: ['administrador', 'instrutor'] },
    { href: '/cursos.html', icone: 'menu_book', label: trLayout('nav.cursos', {}, 'Cursos'), chave: 'cursos', secao: 'aluno', perfis: ['administrador', 'instrutor', 'aluno'] },
    { href: '/atividades.html', icone: 'format_list_numbered', label: trLayout('nav.atividades', {}, 'Atividades'), chave: 'atividades', secao: 'pensamento', perfis: ['administrador', 'instrutor', 'aluno'] },
    { href: '/workspace.html', icone: 'lightbulb', label: trLayout('layout.menu.workspace', {}, 'Meu Workspace'), chave: 'workspace', secao: 'aluno', perfis: ['administrador', 'instrutor', 'aluno'] },
    { href: '/mundo-digital.html', icone: 'memory', label: trLayout('nav.mundoDigital', {}, 'Mundo Digital'), chave: 'mundo-digital', secao: 'mundo', perfis: ['administrador', 'instrutor', 'aluno'] },
    { href: '/cultura-digital.html', icone: 'verified_user', label: trLayout('nav.culturaDigital', {}, 'Cultura Digital'), chave: 'cultura-digital', secao: 'cultura', perfis: ['administrador', 'instrutor', 'aluno'] },
    { href: '/matriculas.html', icone: 'how_to_reg', label: trLayout('layout.menu.matriculas', {}, 'Matrículas'), chave: 'matriculas', secao: 'aluno', perfis: ['administrador', 'instrutor', 'aluno'] },
    { href: '/certificados.html', icone: 'workspace_premium', label: trLayout('layout.menu.certificados', {}, 'Certificados'), chave: 'certificados', secao: 'aluno', perfis: ['administrador', 'instrutor', 'aluno'] },
    { href: '/usuarios.html', icone: 'group', label: trLayout('layout.menu.usuarios', {}, 'Usuários'), chave: 'usuarios', secao: 'professor', perfis: ['administrador'] },
    { href: '/perfil.html', icone: 'account_circle', label: trLayout('layout.menu.perfil', {}, 'Meu Perfil'), chave: 'perfil', secao: 'config', perfis: ['administrador', 'instrutor', 'aluno'] },
    { href: '/planos.html', icone: 'credit_card', label: trLayout('layout.menu.planos', {}, 'Planos & Assinaturas'), chave: 'planos', secao: 'config', perfis: ['administrador', 'instrutor'] },
  ];
  return itensMenu.filter((item) => item.perfis.includes(perfil));
}

function construirCardMapaOrientacaoHtml(passo, infoWf, rotulos) {
  const ehAqui = passo.etapa === infoWf.etapaAtual;
  const ehConcluido = passo.etapa < infoWf.etapaAtual;
  const ehProximo = passo.etapa === infoWf.etapaAtual + 1;

  let estadoClasse = 'estado-nao-iniciado';
  let estadoIcone = 'circle-dashed';
  let estadoRotulo = rotulos.naoIniciado;
  if (ehConcluido) {
    estadoClasse = 'estado-concluido';
    estadoIcone = 'check_circle';
    estadoRotulo = rotulos.concluido;
  } else if (ehAqui) {
    estadoClasse = 'estado-em-andamento';
    estadoIcone = 'schedule';
    estadoRotulo = rotulos.andamento;
  }

  const etapaTexto = trLayout('layout.etapaDe', { atual: passo.etapa, total: infoWf.totalEtapas }, `Etapa ${passo.etapa} de ${infoWf.totalEtapas}`);
  return `
    <a href="${passo.href}" class="mapa-orientacao-card ${ehAqui ? 'voce-esta-aqui' : ''} ${ehProximo ? 'proximo-passo' : ''}" data-secao="${passo.secao}" ${ehAqui ? 'aria-current="step"' : ''}>
      <div class="flex-entre flex-wrap gap-8">
        <span class="secao-pista-badge" data-secao="${passo.secao}">
          <span class="material-symbols-outlined icon-xs" aria-hidden="true">${passo.icone}</span>
          <span>${escaparHtml(etapaTexto)}</span>
        </span>
        ${ehAqui ? `<span class="mapa-tag-aqui"><span class="material-symbols-outlined icon-xs" aria-hidden="true">explore</span> ${escaparHtml(rotulos.voceAqui)}</span>` : ''}
        ${ehProximo ? `<span class="mapa-tag-proximo">${escaparHtml(rotulos.proximo)}</span>` : ''}
      </div>
      <h4>${escaparHtml(passo.titulo)}</h4>
      <p>${escaparHtml(passo.eixo)}</p>
      <div class="mt-4">
        <span class="estado-progresso-pill ${estadoClasse}">
          <span class="material-symbols-outlined icon-xs" aria-hidden="true">${estadoIcone}</span>
          <span>${escaparHtml(estadoRotulo)}</span>
        </span>
      </div>
    </a>
  `;
}

function integrarModulosPosLayout(ferramentasEl) {
  const perfilLinkEl = ferramentasEl?.querySelector('.topbar-usuario-link');
  const montarSeletorNaTopbar = (fn) => {
    if (!ferramentasEl || typeof fn !== 'function') return;
    fn(ferramentasEl, { claro: true });
    const wrapperSel = ferramentasEl.querySelector('.seletor-idioma-wrapper');
    if (wrapperSel && perfilLinkEl && wrapperSel.nextElementSibling !== perfilLinkEl) {
      ferramentasEl.insertBefore(wrapperSel, perfilLinkEl);
    }
  };

  if (typeof window === 'undefined') return;

  if (window.LMS_I18N?.montarSeletorIdioma) {
    montarSeletorNaTopbar(window.LMS_I18N.montarSeletorIdioma);
    window.LMS_I18N.traduzirDocumento?.();
  } else {
    import('/js/i18n.js').then((i18nMod) => {
      montarSeletorNaTopbar(i18nMod.montarSeletorIdioma);
      i18nMod.traduzirDocumento?.();
    }).catch((err) => console.warn('Falha ao carregar seletor i18n na topbar:', err?.message || err));
  }

  import('/js/menu-universal.js').then((m) => {
    if (typeof m.habilitarRolagemHorizontalMenus === 'function') {
      m.habilitarRolagemHorizontalMenus();
    }
  }).catch((err) => console.warn('Falha ao habilitar rolagem horizontal na topbar:', err?.message || err));
}

function montarLayout(paginaAtiva) {
  const usuario = obterUsuario();
  if (!usuario) return;

  _paginaAtivaLayout = paginaAtiva;
  garantirListenersIdiomaLayout();

  const pathname = window.location.pathname || '';
  const chaveContexto = pathname.includes('curso-detalhe') ? 'curso-detalhe' : (paginaAtiva || 'dashboard');
  const idiomaAtivo = typeof window.LMS_I18N?.obterIdiomaAtual === 'function'
    ? window.LMS_I18N.obterIdiomaAtual()
    : 'pt';
  const i18nPronto = typeof window.t === 'function' ? '1' : '0';
  const layoutKey = `${paginaAtiva}:${chaveContexto}:${idiomaAtivo}:${usuario.perfil}:${i18nPronto}`;
  const sidebarExistente = document.getElementById('sidebar-container');
  const topbarExistente = document.getElementById('topbar-container');
  if (
    sidebarExistente?.dataset?.layoutKey === layoutKey
    && topbarExistente?.dataset?.layoutKey === layoutKey
  ) {
    return;
  }

  const mapaWayfinding = obterMapaWayfindingPaginas();
  const trilhaOrientacao = obterTrilhaOrientacaoCurso();
  const infoWf = mapaWayfinding[chaveContexto] || mapaWayfinding.dashboard;

  sincronizarTemaEBodyLayout(infoWf.secao);

  const linkVoltar = (usuario.perfil === 'aluno' && infoWf.voltar.href === '/dashboard.html')
    ? { href: '/', rotulo: trLayout('wf.inicio', {}, 'Início') }
    : infoWf.voltar;

  const itensVisiveis = obterItensNavegacaoVisiveis(usuario.perfil);
  const recolhidaInicial = detectarEstadoSidebarInicial();
  const inicialNome = (usuario.nome || 'U').charAt(0).toUpperCase();
  const rotaInicio = usuario.perfil === 'aluno' ? '/cursos.html' : '/dashboard.html';
  const perfilRotulo = trLayout(`perfilRole.${usuario.perfil}`, {}, usuario.perfil);
  const nomeSeguro = escaparHtml(usuario.nome);
  const perfilSeguro = escaparHtml(usuario.perfil);
  const perfilRotuloSeguro = escaparHtml(perfilRotulo);
  const ehGoogleAcademico = ehUsuarioGoogleLayout(usuario);

  const lblAcessarPerfil = trLayout('layout.acessarMeuPerfil', { nome: usuario.nome }, `Acessar Meu Perfil (${usuario.nome})`);
  const lblFecharMenu = trLayout('layout.fecharMenuLateral', {}, 'Fechar menu lateral');
  const lblInicioPublico = trLayout('layout.paginaInicialPublica', {}, 'Página Inicial Pública');
  const lblSairPlataforma = trLayout('layout.sairPlataforma', {}, 'Sair da plataforma');
  const lblEncerrarSessao = trLayout('layout.encerrarSessaoTitle', {}, 'Encerrar Sessão (Sair)');

  const sidebarHtml = `
    <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="fecharSidebar()" aria-hidden="true"></div>
    <aside class="sidebar ${recolhidaInicial ? 'recolhida' : ''}" id="sidebar" aria-label="${escaparHtml(trLayout('layout.navegacaoPrincipal', {}, 'Navegação Principal'))}">
      <div class="sidebar-header">
        <a href="${rotaInicio}" class="logo" title="${escaparHtml(trLayout('layout.logoTitle', {}, 'LMS COMPASSO — Início da Plataforma'))}">
          <div class="logo-icone-wrapper">
            <img src="/img/logo-icone-branco.svg" alt="${escaparHtml(trLayout('layout.logoAlt', {}, 'Logo LMS COMPASSO'))}" width="32" height="32">
          </div>
          <div class="logo-texto">
            <span class="logo-titulo">LMS COMPASSO</span>
            <span class="logo-subtitulo">${escaparHtml(trLayout('layout.subtituloMarca', {}, 'BNCC Computação'))}</span>
          </div>
        </a>
        <button class="btn-fechar-sidebar" type="button" aria-label="${escaparHtml(lblFecharMenu)}" title="${escaparHtml(lblFecharMenu)}" onclick="fecharSidebar()">
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </div>

      <nav class="sidebar-nav" aria-label="${escaparHtml(trLayout('layout.menuComRotulos', {}, 'Menu principal com rótulos'))}">
        <div class="nav-secao-rotulo">${escaparHtml(trLayout('layout.ondePossoIr', {}, 'Onde posso ir'))}</div>
        <a href="/" class="nav-item" title="${escaparHtml(lblInicioPublico)}">
          <div class="nav-item-icone">
            <span class="material-symbols-outlined" aria-hidden="true">home</span>
          </div>
          <span class="nav-item-texto">${escaparHtml(trLayout('wf.inicio', {}, 'Início'))}</span>
        </a>
        ${itensVisiveis.map((item) => {
    const isAtivo = item.chave === paginaAtiva || (chaveContexto === 'curso-detalhe' && item.chave === 'cursos');
    return `
            <a href="${item.href}" class="nav-item ${isAtivo ? 'ativo' : ''}" data-secao-item="${item.secao}" ${isAtivo ? 'aria-current="page"' : ''} title="${escaparHtml(item.label)}" onclick="if (window.innerWidth <= 1024) fecharSidebar()">
              <div class="nav-item-icone">
                <span class="material-symbols-outlined" aria-hidden="true">${item.icone}</span>
              </div>
              <span class="nav-item-texto">${escaparHtml(item.label)}</span>
              ${isAtivo ? '<span class="nav-item-indicador" aria-hidden="true"></span>' : ''}
            </a>
          `;
  }).join('')}
      </nav>

      <div class="sidebar-footer">
        <a href="/perfil.html" class="sidebar-usuario-card" title="${escaparHtml(lblAcessarPerfil)}">
          <div class="usuario-avatar-mini" aria-hidden="true">${escaparHtml(inicialNome)}</div>
          <div class="usuario-info-mini">
            <span class="usuario-nome-mini">${nomeSeguro}</span>
            <div class="flex-linha gap-4 flex-wrap">
              <span class="badge badge-${perfilSeguro} badge-micro">${perfilRotuloSeguro}</span>
              ${ehGoogleAcademico ? `<span class="badge-google-sidebar" title="${escaparHtml(trLayout('layout.contaGoogleAcademica', {}, 'Conta Google Acadêmica'))}"><svg width="10" height="10" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg> Google</span>` : ''}
            </div>
          </div>
        </a>
        <button type="button" class="nav-item-sair" onclick="encerrarSessao()" aria-label="${escaparHtml(lblSairPlataforma)}" title="${escaparHtml(lblEncerrarSessao)}">
          <span class="material-symbols-outlined" aria-hidden="true">logout</span>
          <span class="nav-item-texto">${escaparHtml(trLayout('layout.sair', {}, 'Sair'))}</span>
        </button>
      </div>
    </aside>
  `;

  const altoContrasteAtivo = document.documentElement.classList.contains('a11y-alto-contraste');
  const fonteAmpliadaAtiva = document.documentElement.classList.contains('a11y-fonte-ampliada');
  const reduzirMovAtivo = document.documentElement.classList.contains('a11y-reduzir-movimento');

  const percentualTrilha = Math.round((infoWf.etapaAtual / infoWf.totalEtapas) * 100);
  const rotuloConcluido = trLayout('layout.estadoConcluido', {}, 'Concluído');
  const rotuloAndamento = trLayout('layout.estadoEmAndamento', {}, 'Em andamento');
  const rotuloNaoIniciado = trLayout('layout.estadoNaoIniciado', {}, 'Não iniciado');
  const rotuloBloqueado = trLayout('layout.estadoBloqueado', {}, 'Bloqueado');
  const rotuloVoceAqui = trLayout('wf.voceEstaAqui', {}, 'Você está aqui');
  const rotuloProximo = trLayout('layout.proximoPasso', {}, 'O que vem a seguir →');
  const lblFechar = trLayout('layout.fechar', {}, 'Fechar');

  const rotulosMapa = {
    concluido: rotuloConcluido,
    andamento: rotuloAndamento,
    naoIniciado: rotuloNaoIniciado,
    voceAqui: rotuloVoceAqui,
    proximo: rotuloProximo,
  };
  const mapaOrientacaoHtml = trilhaOrientacao
    .map((passo) => construirCardMapaOrientacaoHtml(passo, infoWf, rotulosMapa))
    .join('');

  const etapaAtualTexto = trLayout('layout.etapaDe', { atual: infoWf.etapaAtual, total: infoWf.totalEtapas }, `Etapa ${infoWf.etapaAtual} de ${infoWf.totalEtapas}`);
  const titleAlternarMenu = trLayout('layout.alternarMenuTitle', {}, 'Alternar menu de navegação');
  const titleSecaoAtual = trLayout('layout.secaoAtualTitle', { secao: infoWf.rotuloSecao }, `Seção atual: ${infoWf.rotuloSecao} (Cor + Ícone + Padrão de Borda)`);
  const titleMapaTool = trLayout('layout.mapaCursoToolTitle', { atual: infoWf.etapaAtual, total: infoWf.totalEtapas }, `Mapa do Curso (${etapaAtualTexto})`);
  const titlePerfilTopbar = trLayout(
    'layout.meuPerfilTopbarTitle',
    { nome: usuario.nome, perfil: perfilRotulo, extra: ehGoogleAcademico ? ` · ${trLayout('nav.googleAcademico', {}, 'Google Acadêmico')}` : '' },
    `Meu Perfil: ${usuario.nome} (${perfilRotulo}${ehGoogleAcademico ? ' · Google Acadêmico' : ''})`,
  );
  const titleVoltar = trLayout('comp.voltarPara', { rotulo: linkVoltar.rotulo }, `Voltar para ${linkVoltar.rotulo}`);
  const labelVoltarBtn = trLayout('layout.voltarPrefixo', { rotulo: linkVoltar.rotulo }, `Voltar: ${linkVoltar.rotulo}`);
  const titleAvancarBtn = trLayout('layout.avancarPara', { rotulo: infoWf.avancar.rotulo }, `Avançar para ${infoWf.avancar.rotulo}`);
  const lblMapaCursoBtn = trLayout('layout.mapaCursoBtn', {}, 'Mapa do Curso');

  // Topbar + Barra Universal de Wayfinding de 3 Segundos + Pistas Visuais (Pilar 2)
  const topbarHtml = `
    <header class="topbar" role="banner">
      <div class="flex-linha">
        <button class="menu-toggle" type="button" aria-label="${escaparHtml(titleAlternarMenu)}" title="${escaparHtml(titleAlternarMenu)}" onclick="alternarSidebar()">
          <span class="material-symbols-outlined" aria-hidden="true">menu</span>
        </button>
        <div>
          <div class="flex-linha gap-8">
            <span class="secao-pista-badge" data-secao="${infoWf.secao}" title="${escaparHtml(titleSecaoAtual)}">
              <span class="material-symbols-outlined icon-xs" aria-hidden="true">${infoWf.icone}</span>
              <span>${escaparHtml(infoWf.rotuloSecao)}</span>
            </span>
          </div>
          <h1 id="titulo-pagina">${escaparHtml(infoWf.titulo)}</h1>
        </div>
      </div>

      <!-- Ferramentas Universais do Pilar 1 & 2: Mapa do Curso, Buscar (lupa), Notificações (sino), Configurações (engrenagem), Ajuda (?), Idioma, Perfil -->
      <div class="topbar-ferramentas" role="toolbar" aria-label="${escaparHtml(trLayout('layout.ferramentasToolbarAria', {}, 'Ferramentas rápidas de mapa do curso, busca, notificações, configurações e ajuda'))}">
        <button type="button" class="wf-tool-btn" aria-label="${escaparHtml(trLayout('layout.mapaCursoAria', {}, 'Abrir Mapa do Curso: onde você está e o que vem a seguir'))}" title="${escaparHtml(titleMapaTool)}" onclick="alternarPainelWayfinding('painel-wf-mapa')">
          <span class="material-symbols-outlined icon-sm" aria-hidden="true">map</span>
          <span class="wf-tool-label">${escaparHtml(lblMapaCursoBtn)}</span>
        </button>

        <button type="button" class="wf-tool-btn" aria-label="${escaparHtml(trLayout('layout.buscarAria', {}, 'Buscar atividades, cursos ou habilidades BNCC'))}" title="${escaparHtml(trLayout('layout.buscarTitle', {}, 'Buscar (Lupa)'))}" onclick="alternarPainelWayfinding('painel-wf-busca')">
          <span class="material-symbols-outlined icon-sm" aria-hidden="true">search</span>
          <span class="wf-tool-label">${escaparHtml(trLayout('nav.buscar', {}, 'Buscar'))}</span>
        </button>

        <button type="button" class="wf-tool-btn" aria-label="${escaparHtml(trLayout('layout.avisosAria', {}, 'Notificações e avisos pedagógicos'))}" title="${escaparHtml(trLayout('layout.avisosTitle', {}, 'Notificações (Sino)'))}" onclick="alternarPainelWayfinding('painel-wf-notificacoes')">
          <span class="material-symbols-outlined icon-sm" aria-hidden="true">notifications</span>
          <span class="wf-tool-label">${escaparHtml(trLayout('layout.avisosBtn', {}, 'Avisos'))}</span>
          <span class="wf-badge-ponto" aria-hidden="true"></span>
        </button>

        <button type="button" class="wf-tool-btn" aria-label="${escaparHtml(trLayout('layout.ajustesAria', {}, 'Ajustes: configurações de acessibilidade e exibição'))}" title="${escaparHtml(trLayout('layout.ajustesTitle', {}, 'Ajustes e configurações de acessibilidade'))}" onclick="alternarPainelWayfinding('painel-wf-config')">
          <span class="material-symbols-outlined icon-sm" aria-hidden="true">settings</span>
          <span class="wf-tool-label">${escaparHtml(trLayout('layout.ajustesBtn', {}, 'Ajustes'))}</span>
        </button>

        <button type="button" class="wf-tool-btn" aria-label="${escaparHtml(trLayout('layout.ajudaAria', {}, 'Ajuda rápida sobre esta tela'))}" title="${escaparHtml(trLayout('layout.ajudaTitle', {}, 'Ajuda (Como usar esta página)'))}" onclick="alternarPainelWayfinding('painel-wf-ajuda')">
          <span class="material-symbols-outlined icon-sm" aria-hidden="true">help</span>
          <span class="wf-tool-label">${escaparHtml(trLayout('layout.ajudaBtn', {}, 'Ajuda'))}</span>
        </button>

        <a href="/perfil.html" class="topbar-usuario-link" title="${escaparHtml(titlePerfilTopbar)}">
          <span class="material-symbols-outlined icon-sm" aria-hidden="true">account_circle</span>
          <div class="texto-direita topbar-usuario">
            <span class="somente-leitor">${escaparHtml(trLayout('layout.meuPerfilPrefixo', {}, 'Meu perfil: '))}</span><strong>${nomeSeguro}</strong>
            <div class="flex-linha gap-4 justify-end">
              <span class="badge badge-${perfilSeguro}">${perfilRotuloSeguro}</span>
              ${ehGoogleAcademico ? `
                <span class="badge badge-google-topbar" title="${escaparHtml(trLayout('layout.authGoogleTitle', { dominio: usuario.dominio_institucional || trLayout('layout.contaInstitucional', {}, 'Conta Institucional') }, `Autenticado via Google Workspace for Education (${usuario.dominio_institucional || 'Conta Institucional'})`))}">
                  <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                  Google
                </span>
              ` : ''}
            </div>
          </div>
        </a>
      </div>
    </header>

    <!-- Painéis Expansíveis das Ferramentas Universais -->
    <div id="painel-wf-mapa" class="wf-painel-flutuante" role="region" aria-label="${escaparHtml(trLayout('layout.mapaCursoRegiaoAria', {}, 'Mapa do curso: trilha completa, onde você está e o que vem a seguir'))}" hidden>
      <div class="wf-painel-topo">
        <strong><span class="material-symbols-outlined icon-xs" aria-hidden="true">map</span> ${escaparHtml(trLayout('layout.mapaCursoTitulo', {}, 'Mapa do Curso — Trilha Completa BNCC Computação'))}</strong>
        <button type="button" class="btn btn-xs btn-neutro" onclick="alternarPainelWayfinding(null)">${escaparHtml(lblFechar)}</button>
      </div>
      <div class="progresso-etapas-box mb-10">
        <div class="progresso-etapas-topo">
          <span class="progresso-etapas-contador">
            <span class="material-symbols-outlined icon-xs" aria-hidden="true">explore</span>
            <span>${escaparHtml(etapaAtualTexto)}: ${escaparHtml(infoWf.titulo)}</span>
          </span>
          <div class="flex-linha flex-wrap gap-8">
            <span class="estado-progresso-pill estado-concluido"><span class="material-symbols-outlined icon-xs" aria-hidden="true">check_circle</span> ${escaparHtml(rotuloConcluido)}</span>
            <span class="estado-progresso-pill estado-em-andamento"><span class="material-symbols-outlined icon-xs" aria-hidden="true">schedule</span> ${escaparHtml(rotuloAndamento)}</span>
            <span class="estado-progresso-pill estado-nao-iniciado"><span class="material-symbols-outlined icon-xs" aria-hidden="true">circle-dashed</span> ${escaparHtml(rotuloNaoIniciado)}</span>
            <span class="estado-progresso-pill estado-bloqueado"><span class="material-symbols-outlined icon-xs" aria-hidden="true">lock</span> ${escaparHtml(rotuloBloqueado)}</span>
          </div>
        </div>
        <div class="progresso-etapas-barra" role="progressbar" aria-label="${escaparHtml(trLayout('layout.progressoTrilhaAria', {}, 'Progresso na trilha completa do curso'))}" aria-valuenow="${infoWf.etapaAtual}" aria-valuemin="1" aria-valuemax="${infoWf.totalEtapas}">
          <div class="progresso-etapas-preenchimento" style="width: ${percentualTrilha}%"></div>
        </div>
      </div>
      <div class="mapa-orientacao-grid">
        ${mapaOrientacaoHtml}
      </div>
    </div>

    <div id="painel-wf-busca" class="wf-painel-flutuante" role="region" aria-label="${escaparHtml(trLayout('layout.buscaRapidaAria', {}, 'Busca rápida na plataforma'))}" hidden>
      <form class="wf-busca-form" onsubmit="event.preventDefault(); executarBuscaGlobalWayfinding(this.q.value);">
        <span class="material-symbols-outlined icon-sm" aria-hidden="true">search</span>
        <input type="search" name="q" placeholder="${escaparHtml(trLayout('layout.buscaPlaceholder', {}, 'Buscar atividade, curso ou código BNCC (ex.: EF69CO03, Python, Robô)...'))}" aria-label="${escaparHtml(trLayout('layout.buscaInputAria', {}, 'Digite o que deseja buscar'))}">
        <button type="submit" class="btn btn-primario btn-sm">${escaparHtml(trLayout('nav.buscar', {}, 'Buscar'))}</button>
        <button type="button" class="btn btn-neutro btn-sm" onclick="alternarPainelWayfinding(null)" aria-label="${escaparHtml(trLayout('layout.fecharBuscaAria', {}, 'Fechar busca'))}">${escaparHtml(lblFechar)}</button>
      </form>
    </div>

    <div id="painel-wf-notificacoes" class="wf-painel-flutuante" role="region" aria-label="${escaparHtml(trLayout('layout.notificacoesRegiaoAria', {}, 'Notificações recentes'))}" hidden>
      <div class="wf-painel-topo">
        <strong><span class="material-symbols-outlined icon-xs" aria-hidden="true">notifications</span> ${escaparHtml(trLayout('layout.notificacoesTitulo', {}, 'Notificações e Próximos Passos'))}</strong>
        <button type="button" class="btn btn-xs btn-neutro" onclick="alternarPainelWayfinding(null)">${escaparHtml(lblFechar)}</button>
      </div>
      <ul class="wf-lista-notificacoes">
        <li>
          <span class="material-symbols-outlined icon-xs cor-robo" aria-hidden="true">deployed_code</span>
          <div><strong>${escaparHtml(trLayout('layout.notif1Titulo', {}, 'Laboratório 3D Python disponível:'))}</strong> ${escaparHtml(trLayout('layout.notif1Desc', {}, 'Complete os 6 desafios 3D para liberar o certificado'))} <em>${escaparHtml(trLayout('spotlight.certificado3d', {}, 'Explorador Python 3D'))}</em>. <a href="/atividades.html?tipo=python3d">${escaparHtml(trLayout('layout.notif1Link', {}, 'Abrir Laboratório Python 3D →'))}</a></div>
        </li>
        <li>
          <span class="material-symbols-outlined icon-xs cor-meta" aria-hidden="true">check_circle</span>
          <div><strong>${escaparHtml(trLayout('layout.notif2Titulo', {}, 'Trilhas BNCC Computação:'))}</strong> ${escaparHtml(trLayout('layout.notif2Desc', {}, 'Progresso sincronizado com os 3 eixos estruturantes.'))} <a href="/perfil.html">${escaparHtml(trLayout('layout.notif2Link', {}, 'Consultar Medalhas no Perfil →'))}</a></div>
        </li>
      </ul>
    </div>

    <div id="painel-wf-config" class="wf-painel-flutuante" role="region" aria-label="${escaparHtml(trLayout('layout.a11yRegiaoAria', {}, 'Configurações de acessibilidade e leitura'))}" hidden>
      <div class="wf-painel-topo">
        <strong><span class="material-symbols-outlined icon-xs" aria-hidden="true">settings</span> ${escaparHtml(trLayout('layout.a11yTitulo', {}, 'Configurações de Acessibilidade (WCAG 2.2 AA)'))}</strong>
        <button type="button" class="btn btn-xs btn-neutro" onclick="alternarPainelWayfinding(null)">${escaparHtml(lblFechar)}</button>
      </div>
      <div class="wf-opcoes-a11y">
        <label class="wf-check-label">
          <input type="checkbox" ${altoContrasteAtivo ? 'checked' : ''} onchange="aplicarPreferenciaAcessibilidade('alto-contraste', this.checked)">
          <span>${escaparHtml(trLayout('layout.a11yAltoContraste', {}, 'Alto Contraste & Daltonismo Seguro (reforço de bordas solida/dupla/tracejada e ícones >= 3:1)'))}</span>
        </label>
        <label class="wf-check-label">
          <input type="checkbox" ${fonteAmpliadaAtiva ? 'checked' : ''} onchange="aplicarPreferenciaAcessibilidade('fonte-ampliada', this.checked)">
          <span>${escaparHtml(trLayout('layout.a11yFonteAmpliada', {}, 'Texto Ampliado (+15% para leitura confortável)'))}</span>
        </label>
        <label class="wf-check-label">
          <input type="checkbox" ${reduzirMovAtivo ? 'checked' : ''} onchange="aplicarPreferenciaAcessibilidade('reduzir-movimento', this.checked)">
          <span>${escaparHtml(trLayout('layout.a11yReduzirMov', {}, 'Reduzir Animações e Transições'))}</span>
        </label>
      </div>
      <div class="wf-tema-seletor mt-12 pt-12">
        <label class="wf-tema-rotulo">${escaparHtml(trLayout('layout.temaTitulo', {}, 'Tema de Exibição'))}</label>
        <div class="flex-linha gap-8 flex-wrap">
          <button type="button" class="btn btn-xs btn-neutro wf-btn-tema ${!lerTemaSalvoSeguro() ? 'ativo' : ''}" id="btn-tema-auto" onclick="definirTemaLMS('auto'); atualizarBotoesTema();" title="${escaparHtml(trLayout('layout.temaAutoTitle', {}, 'Seguir preferência do sistema operacional'))}">
            <span class="material-symbols-outlined icon-xs">devices</span> ${escaparHtml(trLayout('layout.temaAuto', {}, 'Automático'))}
          </button>
          <button type="button" class="btn btn-xs btn-neutro wf-btn-tema ${lerTemaSalvoSeguro() === 'claro' ? 'ativo' : ''}" id="btn-tema-claro" onclick="definirTemaLMS('claro'); atualizarBotoesTema();" title="${escaparHtml(trLayout('layout.temaClaroTitle', {}, 'Ativar tema claro'))}">
            <span class="material-symbols-outlined icon-xs">light_mode</span> ${escaparHtml(trLayout('layout.temaClaro', {}, 'Claro'))}
          </button>
          <button type="button" class="btn btn-xs btn-neutro wf-btn-tema ${lerTemaSalvoSeguro() === 'escuro' ? 'ativo' : ''}" id="btn-tema-escuro" onclick="definirTemaLMS('escuro'); atualizarBotoesTema();" title="${escaparHtml(trLayout('layout.temaEscuroTitle', {}, 'Ativar tema escuro'))}">
            <span class="material-symbols-outlined icon-xs">dark_mode</span> ${escaparHtml(trLayout('layout.temaEscuro', {}, 'Escuro'))}
          </button>
        </div>
      </div>
    </div>

    <div id="painel-wf-ajuda" class="wf-painel-flutuante" role="region" aria-label="${escaparHtml(trLayout('layout.ajudaRegiaoAria', {}, 'Guia rápido de localização e ajuda'))}" hidden>
      <div class="wf-painel-topo">
        <strong><span class="material-symbols-outlined icon-xs" aria-hidden="true">help</span> ${escaparHtml(trLayout('layout.ajudaGuiaTitulo', {}, 'Guia Rápido de Wayfinding (3 Segundos)'))}</strong>
        <button type="button" class="btn btn-xs btn-neutro" onclick="alternarPainelWayfinding(null)">${escaparHtml(lblFechar)}</button>
      </div>
      <p class="m-0 texto-pequeno">${escaparHtml(infoWf.ajuda)}</p>
      <div class="wf-ajuda-atalhos mt-8">
        <span><strong>${escaparHtml(trLayout('layout.ondeEstouLabel', {}, 'Onde estou:'))}</strong> ${escaparHtml(infoWf.eixo)} → ${escaparHtml(infoWf.titulo)} (${escaparHtml(etapaAtualTexto)})</span>
        <span><strong>${escaparHtml(trLayout('layout.comoVoltarLabel', {}, 'Como voltar:'))}</strong> ${escaparHtml(trLayout('layout.comoVoltarBotao', {}, 'Botão'))} <em>${escaparHtml(linkVoltar.rotulo)}</em> ${escaparHtml(trLayout('layout.aDireita', {}, 'à direita'))}</span>
      </div>
    </div>

    <!-- Barra Contextual de Wayfinding Digital (Pilar 2: nav aria-label="Você está aqui", lista ordenada, versão compacta mobile e último item sem link) -->
    <nav class="wayfinding-bar" id="barra-wayfinding-universal" aria-label="${escaparHtml(rotuloVoceAqui)}">
      <div class="wf-onde-estou">
        <a href="${linkVoltar.href}" class="wf-breadcrumb-mobile-voltar seta-voltar" title="${escaparHtml(titleVoltar)}">
          <span class="material-symbols-outlined icon-xs" aria-hidden="true">arrow_back</span>
          <span>${escaparHtml(titleVoltar)}</span>
        </a>
        <span class="wf-pergunta-tag">${escaparHtml(trLayout('layout.ondeEstouLabel', {}, 'Onde estou:'))}</span>
        <ol class="wf-breadcrumb-lista">
          <li>
            <a href="${rotaInicio}" class="wf-breadcrumb-link">
              <span class="material-symbols-outlined icon-xs" aria-hidden="true">home</span>
              <span>${escaparHtml(trLayout('wf.inicio', {}, 'Início'))}</span>
            </a>
          </li>
          <li class="wf-breadcrumb-eixo">${escaparHtml(infoWf.eixo)}</li>
          <li aria-current="page" class="wf-breadcrumb-atual">
            <span class="material-symbols-outlined icon-xs" aria-hidden="true">${infoWf.icone}</span>
            <strong>${escaparHtml(infoWf.titulo)}</strong>
          </li>
        </ol>
      </div>

      <div class="wf-como-volto-avanco" role="group" aria-label="${escaparHtml(trLayout('layout.voltarAvancarAria', {}, 'Voltar ou avançar no fluxo'))}">
        <button type="button" class="btn btn-neutro btn-sm wf-nav-btn" onclick="alternarPainelWayfinding('painel-wf-mapa')" title="${escaparHtml(trLayout('layout.verMapaCursoTitle', { atual: infoWf.etapaAtual, total: infoWf.totalEtapas }, `Ver Mapa do Curso (${etapaAtualTexto})`))}">
          <span class="material-symbols-outlined icon-xs" aria-hidden="true">map</span>
          <span>${escaparHtml(etapaAtualTexto)}</span>
        </button>
        <a href="${linkVoltar.href}" class="btn btn-neutro btn-sm wf-nav-btn seta-voltar" title="${escaparHtml(titleVoltar)}">
          <span class="material-symbols-outlined icon-xs" aria-hidden="true">arrow_back</span>
          <span>${escaparHtml(labelVoltarBtn)}</span>
        </a>
        <a href="${infoWf.avancar.href}" class="btn btn-primario btn-sm wf-nav-btn seta-proximo" title="${escaparHtml(titleAvancarBtn)}">
          <span>${escaparHtml(infoWf.avancar.rotulo)}</span>
          <span class="material-symbols-outlined icon-xs" aria-hidden="true">arrow_forward</span>
        </a>
      </div>
    </nav>
  `;

  const sidebarContainer = document.getElementById('sidebar-container');
  const topbarContainer = document.getElementById('topbar-container');

  if (sidebarContainer) {
    sidebarContainer.innerHTML = sidebarHtml;
    sidebarContainer.dataset.layoutKey = `${paginaAtiva}:${chaveContexto}:${idiomaAtivo}:${usuario.perfil}:${i18nPronto}`;
  }
  if (topbarContainer) {
    topbarContainer.innerHTML = topbarHtml;
    topbarContainer.dataset.layoutKey = `${paginaAtiva}:${chaveContexto}:${idiomaAtivo}:${usuario.perfil}:${i18nPronto}`;
  }
  integrarModulosPosLayout(document.querySelector('.topbar-ferramentas'));
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
    <button type="button" class="toast-fechar" aria-label="${escaparHtml(trLayout('layout.fecharAviso', {}, 'Fechar aviso'))}">
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

function montarLayoutSincronoSeSessaoAtiva() {
  if (typeof document === 'undefined' || !document.getElementById('sidebar-container')) return;
  if (typeof obterUsuario !== 'function' || !obterUsuario()) return;
  if (typeof obterToken === 'function' && !obterToken()) return;
  const pathSemExt = String(window.location?.pathname || '').replace(/\.html$/i, '').replace(/\/$/, '');
  const rotasLayoutAutenticado = {
    '/dashboard': 'dashboard',
    '/cursos': 'cursos',
    '/curso-detalhe': 'cursos',
    '/matriculas': 'matriculas',
    '/certificados': 'certificados',
    '/usuarios': 'usuarios',
    '/perfil': 'perfil',
  };
  const pagina = rotasLayoutAutenticado[pathSemExt];
  if (pagina) {
    montarLayout(pagina);
  }
}

if (typeof window !== 'undefined') {
  window.mostrarNotificacao = mostrarNotificacao;
  montarLayoutSincronoSeSessaoAtiva();
}


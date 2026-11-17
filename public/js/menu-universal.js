/**
 * LMS COMPASSO — Menu Universal Unificado
 * Gerencia a navegação pública, ícones universais e sincronização de sessão em todas as telas.
 */
import '/js/icones-universais.js';
import { t, montarSeletorIdioma, traduzirDocumento } from '/js/i18n.js';

export function sincronizarPreferenciasAcessibilidadeLocal() {
  if (typeof document === 'undefined' || typeof localStorage === 'undefined') return;
  ['alto-contraste', 'fonte-ampliada', 'reduzir-movimento'].forEach((chave) => {
    try {
      const ativo = localStorage.getItem(`lms_a11y_${chave}`) === '1';
      document.documentElement.classList.toggle(`a11y-${chave}`, ativo);
    } catch (erroPrefs) {
      console.warn('Preferências locais indisponíveis:', erroPrefs?.message || erroPrefs);
    }
  });
}

sincronizarPreferenciasAcessibilidadeLocal();

function marcarNavLinksAtivos(caminhoAtual) {
  const navLinks = document.querySelectorAll('.pub-nav a');
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const ativo = (href === '/' && (caminhoAtual === '/' || caminhoAtual === '/index.html' || caminhoAtual === ''))
      || (href !== '/' && caminhoAtual.includes(href.replace('.html', '')));
    if (ativo) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function lerSessaoPublicaSegura() {
  const token = localStorage.getItem('lms_token') || localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) return { token: null, usuario: null };
  try {
    const raw = localStorage.getItem('lms_usuario') || localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || '{}';
    return { token, usuario: JSON.parse(raw) };
  } catch (erroParse) {
    console.warn('Sessão local inválida:', erroParse?.message || erroParse);
    return { token, usuario: {} };
  }
}

function ehContaGoogleAcademica(usuario) {
  if (!usuario) return false;
  const email = String(usuario.email || '');
  const ehDominioEducacional = email.endsWith('.edu.br')
    || email.endsWith('.gov.br')
    || email.includes('escola')
    || email.includes('educacao');
  return Boolean(
    usuario.metodo_auth === 'google_academico'
    || usuario.conta_academica
    || usuario.google
    || usuario.google_academic
    || usuario.google_id
    || ehDominioEducacional,
  );
}

function criarSpanIconeMaterial(nome) {
  const spanIcone = document.createElement('span');
  spanIcone.className = 'material-symbols-outlined icon-xs';
  spanIcone.setAttribute('aria-hidden', 'true');
  spanIcone.textContent = nome;
  return spanIcone;
}

function criarSpanTexto(texto, classe = '') {
  const span = document.createElement('span');
  if (classe) span.className = classe;
  span.textContent = texto;
  return span;
}

function atualizarBotoesUsuarioAutenticado(botaoEntrar, botaoCadastrar, botaoGoogle, usuario) {
  const destino = usuario?.perfil === 'aluno' ? '/cursos.html' : '/dashboard.html';
  const rotuloPainel = t('nav.painel', {}, 'Painel');
  const rotuloGoogle = t('nav.googleAcademico', {}, 'Google Acadêmico');
  const rotuloLogado = usuario?.nome || t('nav.logado', {}, 'Logado');

  if (botaoEntrar) {
    botaoEntrar.href = destino;
    const nos = [criarSpanIconeMaterial('dashboard'), document.createTextNode(' '), criarSpanTexto(rotuloPainel)];
    if (ehContaGoogleAcademica(usuario)) {
      nos.push(document.createTextNode(' '), criarSpanTexto(rotuloGoogle, 'badge badge-google-topbar badge-google-topbar-inline'));
    }
    botaoEntrar.replaceChildren(...nos);
    botaoEntrar.title = t('nav.acessarPainelTitle', { nome: rotuloLogado }, `Acessar painel (${rotuloLogado})`);
  }
  if (botaoCadastrar) botaoCadastrar.classList.add('oculto');
  if (botaoGoogle) botaoGoogle.classList.add('oculto');
}

function criarBotaoGooglePublico() {
  const btn = document.createElement('a');
  btn.id = 'acao-google-menu';
  btn.href = '/login.html?metodo=google';
  btn.className = 'btn btn-google-menu btn-sm flex-inline-icon';
  btn.innerHTML = `
    <svg class="google-g-icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
    <span></span>
  `;
  return btn;
}

function atualizarBotoesVisitante(botaoEntrar, botaoCadastrar, containerAcoes) {
  const rotuloCriar = t('nav.criarConta', {}, 'Criar conta');
  const rotuloEntrar = t('nav.entrar', {}, 'Entrar');
  const rotuloGoogle = t('nav.googleAcademico', {}, 'Google Acadêmico');
  const tituloGoogle = t('nav.entrarGoogleTitle', {}, 'Entrar com Google Acadêmico (Google Workspace for Education)');

  if (botaoCadastrar) {
    botaoCadastrar.classList.remove('oculto');
    botaoCadastrar.classList.add('flex-inline-icon');
    botaoCadastrar.replaceChildren(criarSpanIconeMaterial('person_add'), document.createTextNode(' '), criarSpanTexto(rotuloCriar));
  }
  if (botaoEntrar) {
    botaoEntrar.replaceChildren(criarSpanIconeMaterial('account_circle'), document.createTextNode(' '), criarSpanTexto(rotuloEntrar));
    botaoEntrar.title = rotuloEntrar;
  }

  let botaoGoogle = document.getElementById('acao-google-menu');
  if (!botaoGoogle && containerAcoes && botaoEntrar) {
    botaoGoogle = criarBotaoGooglePublico();
    containerAcoes.insertBefore(botaoGoogle, botaoEntrar);
  }
  if (botaoGoogle) {
    botaoGoogle.title = tituloGoogle;
    const spanGoogle = botaoGoogle.querySelector('span');
    if (spanGoogle) spanGoogle.textContent = rotuloGoogle;
  }
}

export function inicializarMenuUniversal() {
  sincronizarPreferenciasAcessibilidadeLocal();
  const caminhoAtual = window.location.pathname.replace(/\/$/, '') || '/';
  marcarNavLinksAtivos(caminhoAtual);

  const botaoCadastrar = document.getElementById('acao-cadastrar');
  const botaoEntrar = document.getElementById('acao-entrar');
  const containerAcoes = document.querySelector('.pub-acoes');

  function atualizarAcoesSessao() {
    const botaoGoogle = document.getElementById('acao-google-menu');
    try {
      const { token, usuario } = lerSessaoPublicaSegura();
      if (token) {
        atualizarBotoesUsuarioAutenticado(botaoEntrar, botaoCadastrar, botaoGoogle, usuario);
      } else {
        atualizarBotoesVisitante(botaoEntrar, botaoCadastrar, containerAcoes);
      }
    } catch (erroSessao) {
      console.warn('Falha ao atualizar ações de sessão no menu:', erroSessao?.message || erroSessao);
    }
  }

  atualizarAcoesSessao();

  if (containerAcoes) {
    montarSeletorIdioma(containerAcoes);
  }
  traduzirDocumento();

  if (!window._lmsMenuIdiomaListenerRegistrado) {
    window._lmsMenuIdiomaListenerRegistrado = true;
    window.addEventListener('lms:idioma-alterado', () => {
      atualizarAcoesSessao();
      traduzirDocumento();
    });
  }

  habilitarRolagemHorizontalMenus();
}

function aplicarTabIndexScrollBatch(regioes) {
  const medidas = regioes.map((regiao) => ({
    regiao,
    temOverflow: regiao.scrollWidth > regiao.clientWidth + 2,
  }));
  for (const { regiao, temOverflow } of medidas) {
    if (temOverflow) regiao.setAttribute('tabindex', '0');
    else regiao.removeAttribute('tabindex');
  }
}

/**
 * Torna contêineres .tabela-scroll focáveis via teclado apenas quando há overflow
 * horizontal real (WCAG 2.1.1 / scrollable-region-focusable sem tabindex estático em HTML).
 */
export function configurarRegioesScrollTabela() {
  if (typeof document === 'undefined') return;
  const regioes = Array.from(document.querySelectorAll('.tabela-scroll, .legal-tabela-wrap'));
  if (!regioes.length) return;

  const agendarLote = () => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => aplicarTabIndexScrollBatch(regioes));
    } else {
      aplicarTabIndexScrollBatch(regioes);
    }
  };
  agendarLote();

  regioes.forEach((regiao) => {
    if (regiao.dataset.scrollTabelaConfigurado === 'true') return;
    regiao.dataset.scrollTabelaConfigurado = 'true';

    const atualizarRegiaoUnica = () => {
      const temOverflow = regiao.scrollWidth > regiao.clientWidth + 2;
      if (temOverflow) regiao.setAttribute('tabindex', '0');
      else regiao.removeAttribute('tabindex');
    };
    window.addEventListener('resize', agendarLote, { passive: true });
    if (typeof ResizeObserver !== 'undefined') {
      try {
        const ro = new ResizeObserver(atualizarRegiaoUnica);
        ro.observe(regiao);
        if (regiao.firstElementChild) ro.observe(regiao.firstElementChild);
      } catch (erroRo) {
        console.warn('ResizeObserver indisponível para região de tabela:', erroRo?.message || erroRo);
      }
    }
  });
}

function atualizarMascaraRolagem(menu) {
  const maxScroll = menu.scrollWidth - menu.clientWidth;
  if (maxScroll <= 2) {
    menu.removeAttribute('data-scroll-mascara');
    menu.setAttribute('data-scroll-ativo', 'false');
    return;
  }

  menu.setAttribute('data-scroll-ativo', 'true');
  const inicio = menu.scrollLeft <= 4;
  const fim = menu.scrollLeft >= maxScroll - 4;

  if (!inicio && !fim) menu.setAttribute('data-scroll-mascara', 'ambos');
  else if (inicio) menu.setAttribute('data-scroll-mascara', 'direita');
  else if (fim) menu.setAttribute('data-scroll-mascara', 'esquerda');
}

function centralizarItemAtivoNoMenu(menu) {
  const itemAtivo = menu.querySelector('[aria-current="page"], [aria-selected="true"], .ativo, .active');
  if (!itemAtivo) return;
  const menuRect = menu.getBoundingClientRect();
  const itemRect = itemAtivo.getBoundingClientRect();
  if (itemRect.left < menuRect.left || itemRect.right > menuRect.right) {
    itemAtivo.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

function vincularEventosRolagemMenu(menu) {
  const aoAtualizar = () => atualizarMascaraRolagem(menu);
  menu._atualizarMascaraRolagem = aoAtualizar;

  menu.addEventListener('wheel', (e) => {
    if (menu.scrollWidth > menu.clientWidth && e.deltaY !== 0 && e.deltaX === 0 && !e.shiftKey) {
      e.preventDefault();
      menu.scrollLeft += e.deltaY;
      aoAtualizar();
    }
  }, { passive: false });

  menu.addEventListener('scroll', aoAtualizar, { passive: true });
  window.addEventListener('resize', aoAtualizar, { passive: true });

  if (typeof ResizeObserver !== 'undefined') {
    try {
      const ro = new ResizeObserver(aoAtualizar);
      ro.observe(menu);
    } catch (erroRoMenu) {
      console.warn('ResizeObserver indisponível para menu horizontal:', erroRoMenu?.message || erroRoMenu);
    }
  }

  requestAnimationFrame(() => {
    aoAtualizar();
    centralizarItemAtivoNoMenu(menu);
  });

  menu.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && !menu.hasAttribute('role')) {
      menu.scrollBy({ left: 80, behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft' && !menu.hasAttribute('role')) {
      menu.scrollBy({ left: -80, behavior: 'smooth' });
    }
  });
}

/**
 * Habilita rolagem suave horizontal via roda do mouse (wheel) e touch,
 * com indicadores visuais dinâmicos de fade (mask-image) e auto-centralização
 * do item ativo ao carregar ou redimensionar.
 */
export function habilitarRolagemHorizontalMenus(seletor = '.pub-nav, .dashboard-nav-tabs, .atv-pills-modalidades, .sp-abas-controle, .wf-breadcrumb-lista, .planos-periodo-pills, .menu-scroll-horizontal, [data-scroll-horizontal]') {
  if (typeof document === 'undefined') return;
  configurarRegioesScrollTabela();
  const menus = document.querySelectorAll(seletor);
  if (!menus.length) return;

  menus.forEach((menu) => {
    if (menu.dataset.rolagemHabilitada === 'true') {
      menu._atualizarMascaraRolagem?.();
      return;
    }
    menu.dataset.rolagemHabilitada = 'true';
    vincularEventosRolagemMenu(menu);
  });
}

// Inicialização automática ao carregar o DOM
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarMenuUniversal);
  } else {
    inicializarMenuUniversal();
  }
}

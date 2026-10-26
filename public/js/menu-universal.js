/**
 * LMS COMPASSO — Menu Universal Unificado
 * Gerencia a navegação pública, ícones universais e sincronização de sessão em todas as telas.
 */
import '/js/icones-universais.js';
import { montarSeletorIdioma, traduzirDocumento } from '/js/i18n.js';

export function inicializarMenuUniversal() {
  const caminhoAtual = window.location.pathname.replace(/\/$/, '') || '/';
  const navLinks = document.querySelectorAll('.pub-nav a');

  // 1. Marcação semântica da página ativa (WCAG 3.2.3 / 3.2.4)
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    let ativo = false;
    if (href === '/' && (caminhoAtual === '/' || caminhoAtual === '/index.html' || caminhoAtual === '')) {
      ativo = true;
    } else if (href !== '/' && caminhoAtual.includes(href.replace('.html', ''))) {
      ativo = true;
    }

    if (ativo) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  const botaoCadastrar = document.getElementById('acao-cadastrar');
  const botaoEntrar = document.getElementById('acao-entrar');
  const containerAcoes = document.querySelector('.pub-acoes');

  // 2. Garantir botão ou link direto para Google Acadêmico nas ações do menu
  let botaoGoogle = document.getElementById('acao-google-menu');

  // 3. Sincronização de Sessão (Login/Cadastro vs. Painel da Plataforma)
  try {
    const token = localStorage.getItem('lms_token') || localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      let usuario = null;
      try {
        usuario = JSON.parse(localStorage.getItem('lms_usuario') || localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || '{}');
      } catch {}

      const destino = usuario && usuario.perfil === 'aluno' ? '/cursos.html' : '/dashboard.html';

      if (botaoEntrar) {
        botaoEntrar.href = destino;
        const ehGoogleAcademico = Boolean(
          usuario && (
            usuario.metodo_auth === 'google_academico' ||
            usuario.conta_academica ||
            usuario.google ||
            usuario.google_academic ||
            usuario.google_id ||
            (usuario.email && (usuario.email.endsWith('.edu.br') || usuario.email.endsWith('.gov.br') || usuario.email.includes('escola') || usuario.email.includes('educacao')))
          )
        );
        if (ehGoogleAcademico) {
          botaoEntrar.innerHTML = '<span class="material-symbols-outlined icon-xs" aria-hidden="true">dashboard</span> Painel <span class="badge badge-google-topbar" style="margin-left:4px;">Google Acadêmico</span>';
        } else {
          botaoEntrar.innerHTML = '<span class="material-symbols-outlined icon-xs" aria-hidden="true">dashboard</span> Painel';
        }
        botaoEntrar.title = `Acessar painel (${usuario?.nome || 'Logado'})`;
      }

      if (botaoCadastrar) {
        botaoCadastrar.classList.add('oculto');
      }

      if (botaoGoogle) {
        botaoGoogle.classList.add('oculto');
      }
    } else {
      if (botaoCadastrar) {
        botaoCadastrar.classList.remove('oculto');
        botaoCadastrar.classList.add('flex-inline-icon');
        if (!botaoCadastrar.querySelector('.material-symbols-outlined, svg')) {
          botaoCadastrar.innerHTML = '<span class="material-symbols-outlined icon-xs" aria-hidden="true">person_add</span> Criar conta';
        }
      }

      if (botaoEntrar) {
        if (!botaoEntrar.querySelector('.material-symbols-outlined, svg')) {
          botaoEntrar.innerHTML = '<span class="material-symbols-outlined icon-xs" aria-hidden="true">account_circle</span> Entrar';
        }
      }

      // Adiciona o botão Google Acadêmico no menu caso ainda não esteja presente
      if (!botaoGoogle && containerAcoes && botaoEntrar) {
        botaoGoogle = document.createElement('a');
        botaoGoogle.id = 'acao-google-menu';
        botaoGoogle.href = '/login.html?metodo=google';
        botaoGoogle.className = 'btn btn-google-menu btn-sm flex-inline-icon';
        botaoGoogle.title = 'Entrar com Google Acadêmico (Google Workspace for Education)';
        botaoGoogle.innerHTML = `
          <svg class="google-g-icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Google Acadêmico</span>
        `;
        containerAcoes.insertBefore(botaoGoogle, botaoEntrar);
      }
    }
  } catch {}

  // 4. Montar seletor de idiomas acessível em .pub-acoes (conforme layout de referência)
  if (containerAcoes) {
    montarSeletorIdioma(containerAcoes);
  }
  traduzirDocumento();

  // 5. Habilitar rolagem suave horizontal para menus sem necessidade de redimensionamento manual
  habilitarRolagemHorizontalMenus();
}

/**
 * Habilita rolagem suave horizontal via roda do mouse (wheel) e touch,
 * com indicadores visuais dinâmicos de fade (mask-image) e auto-centralização
 * do item ativo ao carregar ou redimensionar.
 */
export function habilitarRolagemHorizontalMenus(seletor = '.pub-nav, .dashboard-nav-tabs, .atv-pills-modalidades, .sp-abas-controle, .wf-breadcrumb-lista, .planos-periodo-pills, .menu-scroll-horizontal, [data-scroll-horizontal]') {
  if (typeof document === 'undefined') return;
  const menus = document.querySelectorAll(seletor);
  if (!menus.length) return;

  menus.forEach((menu) => {
    if (menu.dataset.rolagemHabilitada === 'true') {
      if (typeof menu._atualizarMascaraRolagem === 'function') {
        menu._atualizarMascaraRolagem();
      }
      return;
    }
    menu.dataset.rolagemHabilitada = 'true';

    const atualizarMascara = () => {
      const maxScroll = menu.scrollWidth - menu.clientWidth;
      if (maxScroll <= 2) {
        menu.removeAttribute('data-scroll-mascara');
        menu.setAttribute('data-scroll-ativo', 'false');
        return;
      }

      menu.setAttribute('data-scroll-ativo', 'true');
      const inicio = menu.scrollLeft <= 4;
      const fim = menu.scrollLeft >= maxScroll - 4;

      if (!inicio && !fim) {
        menu.setAttribute('data-scroll-mascara', 'ambos');
      } else if (inicio) {
        menu.setAttribute('data-scroll-mascara', 'direita');
      } else if (fim) {
        menu.setAttribute('data-scroll-mascara', 'esquerda');
      }
    };

    menu._atualizarMascaraRolagem = atualizarMascara;

    // Rolagem horizontal com a roda vertical do mouse (desktop)
    menu.addEventListener('wheel', (e) => {
      if (menu.scrollWidth > menu.clientWidth && e.deltaY !== 0 && e.deltaX === 0 && !e.shiftKey) {
        e.preventDefault();
        menu.scrollLeft += e.deltaY;
        atualizarMascara();
      }
    }, { passive: false });

    menu.addEventListener('scroll', atualizarMascara, { passive: true });
    window.addEventListener('resize', atualizarMascara, { passive: true });

    if (typeof ResizeObserver !== 'undefined') {
      try {
        const ro = new ResizeObserver(() => atualizarMascara());
        ro.observe(menu);
      } catch {}
    }

    // Auto-centralização suave do item ativo na inicialização
    requestAnimationFrame(() => {
      atualizarMascara();
      const itemAtivo = menu.querySelector('[aria-current="page"], [aria-selected="true"], .ativo, .active');
      if (itemAtivo) {
        const menuRect = menu.getBoundingClientRect();
        const itemRect = itemAtivo.getBoundingClientRect();
        const foraDeVista = itemRect.left < menuRect.left || itemRect.right > menuRect.right;
        if (foraDeVista) {
          itemAtivo.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    });

    // Suporte a teclado (setas Direita / Esquerda se o menu tiver foco)
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' && !menu.hasAttribute('role')) {
        menu.scrollBy({ left: 80, behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft' && !menu.hasAttribute('role')) {
        menu.scrollBy({ left: -80, behavior: 'smooth' });
      }
    });
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

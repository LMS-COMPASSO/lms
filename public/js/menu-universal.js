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

  // 2. Garantir consistência dos ícones nos botões de ação do menu
  if (botaoCadastrar) {
    botaoCadastrar.classList.add('flex-inline-icon');
    if (!botaoCadastrar.querySelector('.material-symbols-outlined, svg')) {
      botaoCadastrar.innerHTML = '<span class="material-symbols-outlined icon-xs" aria-hidden="true">person_add</span> Criar conta';
    }
  }

  // 3. Sincronização de Sessão (Login/Cadastro vs. Painel da Plataforma)
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      let usuario = null;
      try {
        usuario = JSON.parse(localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || '{}');
      } catch {}

      const destino = usuario && usuario.perfil === 'aluno' ? '/cursos.html' : '/dashboard.html';

      if (botaoEntrar) {
        botaoEntrar.href = destino;
        botaoEntrar.innerHTML = '<span class="material-symbols-outlined icon-xs" aria-hidden="true">dashboard</span> Painel';
        botaoEntrar.title = `Acessar painel (${usuario?.nome || 'Logado'})`;
      }

      if (botaoCadastrar) {
        botaoCadastrar.classList.add('oculto');
      }
    } else if (botaoEntrar) {
      if (!botaoEntrar.querySelector('.material-symbols-outlined, svg')) {
        botaoEntrar.innerHTML = '<span class="material-symbols-outlined icon-xs" aria-hidden="true">account_circle</span> Entrar';
      }
    }
  } catch {}

  // 4. Montar seletor de idiomas acessível em .pub-acoes (conforme layout de referência)
  const containerAcoes = document.querySelector('.pub-acoes');
  if (containerAcoes) {
    montarSeletorIdioma(containerAcoes);
  }
  traduzirDocumento();
}

// Inicialização automática ao carregar o DOM
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarMenuUniversal);
  } else {
    inicializarMenuUniversal();
  }
}

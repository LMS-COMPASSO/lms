// ============================================================================
// CONFIGURAÇÃO DA API DO LMS BNCC COMPUTAÇÃO
// ============================================================================
//
// COMO FUNCIONA:
//   - A API usa URLs RELATIVAS (/api/...) → funciona em QUALQUER domínio
//     automaticamente, sem precisar editar este arquivo ao fazer deploy.
//
// DESENVOLVIMENTO LOCAL (wrangler dev):
//   - Acesse http://localhost:8787 → tudo funciona automaticamente.
//
// SUBSTITUIÇÃO MANUAL (somente para testes avançados):
//   - No console do navegador, digite:
//     localStorage.setItem('debug_api', 'http://localhost:8787/api')
//   - Para remover:
//     localStorage.removeItem('debug_api')
// ============================================================================

// URL relativa: a API fica no mesmo domínio que a página → sem problemas de CORS
const DEFAULT_API = '/api';

// Permite sobrescrever via localStorage para testes avançados
const overrideApi = localStorage.getItem('debug_api');

window.LMS_API_BASE = overrideApi || DEFAULT_API;

// ============================================================================
// GERENCIADOR DE TEMA ESCURO / CLARO / SISTEMA AUTOMÁTICO (WCAG 2.2 AA)
// ============================================================================
(function () {
  function aplicarTema(tema) {
    let temaFinal = tema;
    if (!temaFinal) {
      try {
        const temaSalvo = localStorage.getItem('lms_tema');
        const prefereEscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        temaFinal = temaSalvo || (prefereEscuro ? 'escuro' : 'claro');
      } catch {
        temaFinal = 'claro';
      }
    }
    document.documentElement.setAttribute('data-tema', temaFinal);
    if (document.body) {
      document.body.setAttribute('data-tema', temaFinal);
      document.body.classList.add('suporta-tema-sistema');
    }
  }

  // Executa imediatamente para evitar flash de tema incorreto (FOUC)
  aplicarTema();

  if (typeof window !== 'undefined') {
    window.obterTemaAtual = function () {
      return document.documentElement.getAttribute('data-tema') || 'claro';
    };

    window.definirTemaLMS = function (tema) {
      if (tema === 'auto') {
        try { localStorage.removeItem('lms_tema'); } catch {}
        const prefereEscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        aplicarTema(prefereEscuro ? 'escuro' : 'claro');
      } else {
        try { localStorage.setItem('lms_tema', tema); } catch {}
        aplicarTema(tema);
      }
      try {
        window.dispatchEvent(new CustomEvent('temaAlterado', { detail: { tema } }));
      } catch {}
    };

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        try {
          if (!localStorage.getItem('lms_tema')) {
            aplicarTema(e.matches ? 'escuro' : 'claro');
            window.dispatchEvent(new CustomEvent('temaAlterado', { detail: { tema: e.matches ? 'escuro' : 'claro' } }));
          }
        } catch {}
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => aplicarTema());
    }
  }
})();

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
  function lerStorageSeguro(chave, padrao = null) {
    try {
      return localStorage.getItem(chave);
    } catch (erroStorage) {
      console.warn(`Leitura localStorage indisponível (${chave}):`, erroStorage?.message || erroStorage);
      return padrao;
    }
  }

  function gravarStorageSeguro(chave, valor) {
    try {
      localStorage.setItem(chave, valor);
    } catch (erroStorage) {
      console.warn(`Gravação localStorage indisponível (${chave}):`, erroStorage?.message || erroStorage);
    }
  }

  function removerStorageSeguro(chave) {
    try {
      localStorage.removeItem(chave);
    } catch (erroStorage) {
      console.warn(`Remoção localStorage indisponível (${chave}):`, erroStorage?.message || erroStorage);
    }
  }

  function prefereTemaEscuroSistema() {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  function aplicarTema(tema) {
    let temaFinal = tema;
    if (!temaFinal) {
      const temaSalvo = lerStorageSeguro('lms_tema', null);
      temaFinal = temaSalvo || (prefereTemaEscuroSistema() ? 'escuro' : 'claro');
    }
    document.documentElement.setAttribute('data-tema', temaFinal);
    if (document.body) {
      document.body.setAttribute('data-tema', temaFinal);
      document.body.classList.add('suporta-tema-sistema');
    }
  }

  // Executa imediatamente para evitar flash de tema e acessibilidade incorretos (FOUC)
  aplicarTema();

  function aplicarPreferenciasA11yLocais() {
    if (typeof document === 'undefined') return;
    ['alto-contraste', 'fonte-ampliada', 'reduzir-movimento'].forEach(function (chave) {
      if (lerStorageSeguro('lms_a11y_' + chave) === '1') {
        document.documentElement.classList.add('a11y-' + chave);
      }
    });
  }
  aplicarPreferenciasA11yLocais();

  if (typeof window === 'undefined') return;

  window.obterTemaAtual = function () {
    return document.documentElement.getAttribute('data-tema') || 'claro';
  };

  window.definirTemaLMS = function (tema) {
    if (tema === 'auto') {
      removerStorageSeguro('lms_tema');
      aplicarTema(prefereTemaEscuroSistema() ? 'escuro' : 'claro');
    } else {
      gravarStorageSeguro('lms_tema', tema);
      aplicarTema(tema);
    }
    try {
      window.dispatchEvent(new CustomEvent('temaAlterado', { detail: { tema } }));
    } catch (erroEvento) {
      console.warn('Falha ao notificar troca de tema:', erroEvento?.message || erroEvento);
    }
  };

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (lerStorageSeguro('lms_tema')) return;
      const temaSistema = e.matches ? 'escuro' : 'claro';
      aplicarTema(temaSistema);
      window.dispatchEvent(new CustomEvent('temaAlterado', { detail: { tema: temaSistema } }));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => aplicarTema());
  }
})();

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

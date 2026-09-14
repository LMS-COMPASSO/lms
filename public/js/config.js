// ============================================================================
// CONFIGURAÇÃO DA API DO LMS BNCC COMPUTAÇÃO
// ============================================================================
// DICA PARA INICIANTES:
// - Em PRODUÇÃO (Cloudflare Workers): Use a URL do seu Worker implantado.
// - Em DESENVOLVIMENTO LOCAL: O script pode apontar para seu wrangler dev local.
// ============================================================================

const PRODUCTION_API = 'https://lms-api.thedelacosta.workers.dev/api';
const LOCAL_WORKER_API = 'http://localhost:8787/api';

// Se desejar alternar facilmente via console: localStorage.setItem('debug_api', 'http://localhost:8787/api')
const overrideApi = localStorage.getItem('debug_api');

window.LMS_API_BASE = overrideApi || PRODUCTION_API;

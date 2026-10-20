/**
 * ============================================================================
 * LMS COMPASSO — SISTEMA DE ÍCONES UNIVERSAIS (SVG) E WAYFINDING DE 3 SEGUNDOS
 * ============================================================================
 * Pilar 1: Biblioteca única de ícones vetoriais em SVG (estilo traço uniforme,
 * stroke-width="2", viewBox="0 0 24 24", grade 16/20/24/32px) sem dependência
 * de fontes externas.
 * Wayfinding Digital: Responde em até 3 segundos às 3 perguntas:
 *   1. "Onde estou?" (Breadcrumb estruturado + indicador de seção ativa)
 *   2. "Para onde posso ir?" (Busca global, Eixos BNCC, Notificações, Configurações, Ajuda)
 *   3. "Como volto ou avanço?" (Botões contextuais Voltar / Avançar com alvos >= 44x44px)
 * ============================================================================
 */

export const GRADE_TAMANHOS_ICONE = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
};

/**
 * Traços SVG vetoriais (24x24, stroke-width: 2, round cap/join)
 */
export const SVG_ICON_PATHS = {
  // Obrigatórios universais do Pilar 1
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1.02 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  'help-circle': '<circle cx="12" cy="12" r="9"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  'arrow-left': '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  'arrow-right': '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  'arrow-up': '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
  'arrow-down': '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  play: '<polygon points="6 4 20 12 6 20 6 4"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
  'step-forward': '<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  menu: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>',
  close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',

  // Navegação e Gestão Educacional
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  'graduation-cap': '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>',
  'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  compass: '<circle cx="12" cy="12" r="9"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  table: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="9" x2="9" y2="21"/>',

  // Conceitos de Computação (BNCC Computação) — Inequívocos
  algorithm: '<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
  loop: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  conditional: '<circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M6 9v6"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  function: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3"/><path d="M9 11.2h5.7"/>',
  decomposition: '<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="16" width="6" height="5" rx="1"/><rect x="9" y="16" width="6" height="5" rx="1"/><rect x="16" y="16" width="6" height="5" rx="1"/><path d="M12 7v5"/><path d="M5 16v-4h14v4"/><path d="M12 12v4"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
  network: '<circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="m10.5 7.5-4 8.5M13.5 7.5l4 8.5M8 19h8"/>',
  'shield-check': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  'cube-3d': '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  'code-blocks': '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><path d="m15 17 2 2 4-4"/>',
  robot: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 4v4"/><circle cx="12" cy="3" r="1"/><circle cx="9" cy="13" r="1.5"/><circle cx="15" cy="13" r="1.5"/><path d="M9 17h6"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  sound: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
  mute: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/>',
};

/**
 * Mapa de tradução de nomes Material Symbols / aliases legados -> ícone universal padronizado
 */
export const MAPA_ALIASES_ICONES = {
  // Navegação e Sistema
  home: 'home',
  cottage: 'home',
  dashboard: 'dashboard',
  space_dashboard: 'dashboard',
  analytics: 'trending-up',
  assessment: 'table',
  table_view: 'table',
  search: 'search',
  travel_explore: 'search',
  settings: 'settings',
  tune: 'settings',
  account_circle: 'user',
  person: 'user',
  badge: 'user-check',
  group: 'users',
  groups: 'users',
  how_to_reg: 'user-check',
  person_add: 'user-plus',
  help: 'help-circle',
  help_outline: 'help-circle',
  notifications: 'bell',
  logout: 'log-out',
  arrow_back: 'arrow-left',
  arrow_forward: 'arrow-right',
  arrow_upward: 'arrow-up',
  arrow_downward: 'arrow-down',
  menu: 'menu',
  close: 'close',
  add: 'plus',
  delete: 'trash',
  delete_outline: 'trash',
  edit: 'edit',
  edit_note: 'edit',
  lock_reset: 'settings',

  // Estados e Ações
  check_circle: 'check-circle',
  task_alt: 'check-circle',
  verified: 'check-circle',
  thumb_up: 'check-circle',
  lock: 'lock',
  block: 'lock',
  schedule: 'clock',
  timelapse: 'clock',
  history: 'clock',
  download: 'download',
  play_arrow: 'play',
  play_circle: 'play',
  pause: 'pause',
  skip_next: 'step-forward',
  restart_alt: 'rotate-ccw',
  refresh: 'rotate-ccw',
  sync: 'rotate-ccw',
  print: 'printer',
  volume_up: 'sound',
  volume_off: 'mute',
  lightbulb: 'lightbulb',
  tips_and_updates: 'lightbulb',
  error: 'alert',
  warning: 'alert',

  // Cursos, Certificados e Gamificação
  auto_stories: 'book-open',
  menu_book: 'book-open',
  book: 'book-open',
  school: 'graduation-cap',
  workspace_premium: 'award',
  military_tech: 'award',
  rocket_launch: 'compass',
  auto_awesome: 'star',
  stars: 'star',
  star: 'star',

  // Conceitos de Computação (BNCC Computação)
  format_list_numbered: 'algorithm',
  terminal: 'algorithm',
  psychology: 'algorithm',
  extension: 'code-blocks',
  code_blocks: 'code-blocks',
  code: 'algorithm',
  repeat: 'loop',
  alt_route: 'conditional',
  sensor_door: 'conditional',
  functions: 'function',
  account_tree: 'decomposition',
  category: 'decomposition',
  bar_chart: 'database',
  stacked_bar_chart: 'database',
  database: 'database',
  memory: 'cpu',
  developer_board: 'cpu',
  devices: 'cpu',
  router: 'network',
  hub: 'network',
  public: 'network',
  verified_user: 'shield-check',
  health_and_safety: 'shield-check',
  gavel: 'shield-check',
  fingerprint: 'shield-check',
  deployed_code: 'cube-3d',
  view_in_ar: 'cube-3d',
  smart_toy: 'robot',
  chat: 'chat',
};

/**
 * Resolve qualquer nome de ícone (universal ou legado) para a chave canônica.
 */
export function resolverNomeIconeUniversal(nome) {
  const chave = String(nome || '').trim().replace(/^icon-/, '');
  if (SVG_ICON_PATHS[chave]) return chave;
  if (MAPA_ALIASES_ICONES[chave]) return MAPA_ALIASES_ICONES[chave];
  return null;
}

/**
 * Gera a string HTML de um `<svg>` vetorial padronizado.
 */
export function gerarSvgIconeHtml(nome, opcoes = {}) {
  const chave = resolverNomeIconeUniversal(nome) || 'cube-3d';
  const path = SVG_ICON_PATHS[chave] || SVG_ICON_PATHS['cube-3d'];
  const tamanhoPx = GRADE_TAMANHOS_ICONE[opcoes.tamanho] || 20;
  const rotulo = opcoes.rotulo || opcoes.label || '';
  const classeExtra = opcoes.classe || '';

  const atributosA11y = rotulo
    ? `role="img" aria-label="${rotulo.replace(/"/g, '&quot;')}"`
    : 'aria-hidden="true" focusable="false"';

  return `<svg class="lms-svg-icon ${classeExtra}" width="${tamanhoPx}" height="${tamanhoPx}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${atributosA11y}>${path}</svg>`;
}

/**
 * Web Component `<lms-icon name="home" size="20" label="Início"></lms-icon>`
 */
if (typeof window !== 'undefined' && window.customElements && !window.customElements.get('lms-icon')) {
  class LmsIconElement extends HTMLElement {
    static get observedAttributes() {
      return ['name', 'size', 'label'];
    }

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback() {
      this.render();
    }

    render() {
      const name = this.getAttribute('name') || 'cube-3d';
      const size = this.getAttribute('size') || '20';
      const label = this.getAttribute('label') || '';
      this.innerHTML = gerarSvgIconeHtml(name, { tamanho: size, rotulo: label });
    }
  }
  window.customElements.define('lms-icon', LmsIconElement);
}

/**
 * Converte automaticamente `<span class="material-symbols-outlined">nome</span>`
 * para `<svg class="lms-svg-icon">` quando o ícone faz parte do catálogo universal,
 * eliminando dependência de fonte externa e garantindo traço uniforme de 2px.
 */
export function hidratarIconesUniversaisNoDom(raiz = document) {
  if (typeof document === 'undefined' || !raiz.querySelectorAll) return;
  const spans = raiz.querySelectorAll('.material-symbols-outlined:not([data-svg-hidratado])');

  spans.forEach((span) => {
    const textoOriginal = (span.getAttribute('data-icon-name') || span.textContent || '').trim();
    const chaveUniversal = resolverNomeIconeUniversal(textoOriginal);
    if (!chaveUniversal) return;

    let tamanho = 20;
    if (span.classList.contains('icon-xs')) tamanho = 16;
    else if (span.classList.contains('icon-sm')) tamanho = 20;
    else if (span.classList.contains('icon-md')) tamanho = 24;
    else if (span.classList.contains('icon-lg') || span.classList.contains('icon-xl')) tamanho = 32;

    span.setAttribute('data-icon-name', textoOriginal);
    span.setAttribute('data-svg-hidratado', chaveUniversal);
    span.setAttribute('aria-hidden', 'true');
    span.innerHTML = gerarSvgIconeHtml(chaveUniversal, { tamanho });
  });
}

// Inicializa observador automático no navegador
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const iniciarHidratacao = () => {
    hidratarIconesUniversaisNoDom(document);
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          hidratarIconesUniversaisNoDom(document);
          break;
        }
      }
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarHidratacao);
  } else {
    iniciarHidratacao();
  }
}


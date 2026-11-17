/**
 * ============================================================================
 * LMS COMPASSO — ACERVO VISUAL MODULAR (COVERS NOTION, PADRÕES & ILUSTRAÇÕES)
 * ============================================================================
 * Biblioteca local 100% privacidade-first (zero requisições a bancos externos)
 * com 3 categorias para personalização de páginas e atividades do Workspace:
 *   1. Capas Nativas BNCC & Notion (1500x600px, zona segura 900x350px)
 *   2. Padrões Geométricos & Gradientes Tokenizados (Light / Dark / Alto Contraste)
 *   3. Ilustrações Educacionais Modulares (currentColor + CSS vars do projeto)
 * ============================================================================
 */

export const CAPAS_NOTION = [
  {
    id: 'cover-lms-compasso',
    titulo: 'LMS COMPASSO Oficial',
    categoria: 'notion',
    eixo: 'Geral',
    url: '/img/notion/cover-lms-compasso-1500x600.svg',
    width: 1500,
    height: 600,
    alt: 'Capa institucional LMS COMPASSO com os três eixos da BNCC Computação',
  },
  {
    id: 'cover-eixos-bncc',
    titulo: 'Três Eixos da BNCC',
    categoria: 'notion',
    eixo: 'Geral',
    url: '/img/notion/cover-eixos-bncc-1500x600.svg',
    width: 1500,
    height: 600,
    alt: 'Capa com cartões dos três eixos da BNCC Computação',
  },
  {
    id: 'cover-algoritmos',
    titulo: 'Algoritmos & Lógica',
    categoria: 'notion',
    eixo: 'Pensamento Computacional',
    url: '/img/notion/cover-algoritmos-1500x600.svg',
    width: 1500,
    height: 600,
    alt: 'Capa temática de Algoritmos e Pensamento Computacional',
  },
  {
    id: 'cover-redes-hardware',
    titulo: 'Redes & Hardware',
    categoria: 'notion',
    eixo: 'Mundo Digital',
    url: '/img/notion/cover-redes-hardware-1500x600.svg',
    width: 1500,
    height: 600,
    alt: 'Capa temática de Hardware, CPU e Redes TCP/IP',
  },
  {
    id: 'cover-etica-ciberseguranca',
    titulo: 'Ética & Cibersegurança',
    categoria: 'notion',
    eixo: 'Cultura Digital',
    url: '/img/notion/cover-etica-ciberseguranca-1500x600.svg',
    width: 1500,
    height: 600,
    alt: 'Capa temática de Ética Digital, Privacidade e Cibersegurança',
  },
  {
    id: 'cover-ciencia-dados',
    titulo: 'Ciência de Dados & Padrões',
    categoria: 'notion',
    eixo: 'Pensamento Computacional',
    url: '/img/notion/cover-ciencia-dados-1500x600.svg',
    width: 1500,
    height: 600,
    alt: 'Capa temática de Ciência de Dados e Reconhecimento de Padrões',
  },
];

export const ILUSTRACOES_EDUCACIONAIS = [
  {
    id: 'ilus-brainstorming',
    titulo: 'Brainstorming em Grupo',
    categoria: 'ilustracoes',
    eixo: 'Geral',
    url: '/img/ilustracoes/brainstorming-grupo.svg',
    width: 480,
    height: 320,
    alt: 'Ilustração de quadro colaborativo com ideias e conexões de projeto',
  },
  {
    id: 'ilus-prototipagem',
    titulo: 'Prototipagem de Código',
    categoria: 'ilustracoes',
    eixo: 'Pensamento Computacional',
    url: '/img/ilustracoes/prototipagem-codigo.svg',
    width: 480,
    height: 320,
    alt: 'Ilustração de editor de código conectado a um protótipo de robô',
  },
  {
    id: 'ilus-seguranca',
    titulo: 'Segurança Digital',
    categoria: 'ilustracoes',
    eixo: 'Cultura Digital',
    url: '/img/ilustracoes/seguranca-digital.svg',
    width: 480,
    height: 320,
    alt: 'Ilustração de escudo protetor com cadeado verificado para cidadania digital',
  },
  {
    id: 'ilus-certificacao',
    titulo: 'Conquista de Certificação',
    categoria: 'ilustracoes',
    eixo: 'Geral',
    url: '/img/ilustracoes/conquista-certificacao.svg',
    width: 480,
    height: 320,
    alt: 'Ilustração de certificado escolar com medalha de conclusão BNCC',
  },
  {
    id: 'ilus-onboarding',
    titulo: 'Ecossistema dos 3 Eixos',
    categoria: 'ilustracoes',
    eixo: 'Geral',
    url: '/img/ilustracoes/hero-onboarding-bncc.svg',
    width: 480,
    height: 320,
    alt: 'Ilustração modular dos três eixos da BNCC conectados ao compasso',
  },
  {
    id: 'ilus-empty-trilha',
    titulo: 'Exploração de Trilhas',
    categoria: 'ilustracoes',
    eixo: 'Geral',
    url: '/img/ilustracoes/empty-state-trilha.svg',
    width: 480,
    height: 320,
    alt: 'Ilustração de lupa sobre nós de trilha de aprendizagem',
  },
];

export const PADROES_GEOMETRICOS = [
  {
    id: 'padrao-malha-isometrica',
    titulo: 'Malha Isométrica',
    categoria: 'padroes',
    variante: 'isometrica',
  },
  {
    id: 'padrao-circuito-logico',
    titulo: 'Circuito Lógico',
    categoria: 'padroes',
    variante: 'circuito',
  },
  {
    id: 'padrao-ondas-matematicas',
    titulo: 'Ondas Matemáticas',
    categoria: 'padroes',
    variante: 'ondas',
  },
  {
    id: 'padrao-matriz-binaria',
    titulo: 'Matriz de Pontos',
    categoria: 'padroes',
    variante: 'matriz',
  },
  {
    id: 'padrao-gradiente-pensamento',
    titulo: 'Gradiente Pensamento',
    categoria: 'padroes',
    variante: 'grad-pensamento',
  },
  {
    id: 'padrao-gradiente-mundo',
    titulo: 'Gradiente Mundo Digital',
    categoria: 'padroes',
    variante: 'grad-mundo',
  },
  {
    id: 'padrao-gradiente-cultura',
    titulo: 'Gradiente Cultura Digital',
    categoria: 'padroes',
    variante: 'grad-cultura',
  },
];

export const ICONES_WORKSPACE = [
  { id: 'icon-lightbulb', rotulo: 'Ideia' },
  { id: 'icon-notebook', rotulo: 'Caderno' },
  { id: 'icon-kanban', rotulo: 'Kanban' },
  { id: 'icon-algorithm', rotulo: 'Algoritmo' },
  { id: 'icon-code-blocks', rotulo: 'Blocos' },
  { id: 'icon-code-snippet', rotulo: 'Código' },
  { id: 'icon-cube-3d', rotulo: 'Robô 3D' },
  { id: 'icon-cpu', rotulo: 'Hardware' },
  { id: 'icon-network', rotulo: 'Redes' },
  { id: 'icon-database', rotulo: 'Dados' },
  { id: 'icon-shield-check', rotulo: 'Ética/LGPD' },
  { id: 'icon-flask-lab', rotulo: 'Laboratório' },
  { id: 'icon-bncc-tag', rotulo: 'BNCC' },
  { id: 'icon-checklist', rotulo: 'Checklist' },
  { id: 'icon-compass', rotulo: 'Compasso' },
  { id: 'icon-award', rotulo: 'Conquista' },
];

/**
 * Gera um SVG leve e parametrizado pelas variáveis de tema do LMS COMPASSO
 * (Tema Claro, Tema Escuro e Alto Contraste).
 */
function traduzirAcervo(chave, padrao) {
  if (typeof window !== 'undefined' && typeof window.t === 'function') {
    return window.t(chave, {}, padrao);
  }
  return padrao;
}

export function obterTituloAcervo(item) {
  if (!item) return '';
  return traduzirAcervo(`acervo.${item.id}.titulo`, item.titulo || '');
}

export function obterAltAcervo(item) {
  if (!item) return '';
  return traduzirAcervo(`acervo.${item.id}.alt`, item.alt || obterTituloAcervo(item));
}

export function obterRotuloIconeWorkspace(icone) {
  if (!icone) return '';
  return traduzirAcervo(`acervo.icone.${icone.id}`, icone.rotulo || '');
}

export function gerarSvgPadraoGeometrico(padraoId, opcoes = {}) {
  const titulo = opcoes.titulo || traduzirAcervo('acervo.padraoDecorativo', 'Padrão geométrico decorativo');
  const uid = String(padraoId || 'padrao-malha-isometrica').replace(/[^a-z0-9-]/gi, '');
  const aria = opcoes.decorativo === false
    ? `role="img" aria-label="${titulo.replace(/"/g, '&quot;')}"`
    : 'aria-hidden="true" focusable="false"';

  const paleta = {
    'padrao-malha-isometrica': {
      fundo: 'var(--cor-secao-pensamento-fundo, #eff6ff)',
      traco: 'var(--cor-secao-pensamento, #1d4ed8)',
      destaque: 'var(--cor-primaria, #2c5282)',
      padrao: `<pattern id="p-${uid}" width="48" height="28" patternUnits="userSpaceOnUse">
        <path d="M24 0 L48 14 L24 28 L0 14 Z" fill="none" stroke="var(--cor-secao-pensamento, #1d4ed8)" stroke-opacity="0.24" stroke-width="1.5"/>
      </pattern>`,
      decor: '<circle cx="490" cy="120" r="76" fill="var(--cor-primaria, #2c5282)" fill-opacity="0.09"/><circle cx="520" cy="80" r="42" stroke="var(--cor-secao-pensamento, #1d4ed8)" stroke-opacity="0.3" stroke-width="2" fill="none"/>',
    },
    'padrao-circuito-logico': {
      fundo: 'var(--cor-secao-mundo-fundo, #ecfdf5)',
      traco: 'var(--cor-secao-mundo, #047857)',
      destaque: 'var(--cor-secundaria-suave, #38a169)',
      padrao: `<pattern id="p-${uid}" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 0 30 H 22 L 30 22 H 60 M 30 0 V 22 M 30 38 V 60" fill="none" stroke="var(--cor-secao-mundo, #047857)" stroke-opacity="0.24" stroke-width="1.5"/>
        <circle cx="30" cy="30" r="3" fill="var(--cor-secao-mundo, #047857)" fill-opacity="0.35"/>
      </pattern>`,
      decor: '<rect x="440" y="64" width="112" height="112" rx="18" fill="none" stroke="var(--cor-secao-mundo, #047857)" stroke-opacity="0.28" stroke-width="2.5"/>',
    },
    'padrao-ondas-matematicas': {
      fundo: 'var(--cor-fundo-alt, #f1f5f9)',
      traco: 'var(--cor-primaria, #2c5282)',
      destaque: 'var(--cor-secao-pensamento, #1d4ed8)',
      padrao: `<pattern id="p-${uid}" width="80" height="40" patternUnits="userSpaceOnUse">
        <path d="M 0 20 Q 20 4 40 20 T 80 20" fill="none" stroke="var(--cor-primaria, #2c5282)" stroke-opacity="0.25" stroke-width="1.8"/>
      </pattern>`,
      decor: '<path d="M 30 190 Q 150 90 300 170 T 570 110" fill="none" stroke="var(--cor-primaria, #2c5282)" stroke-opacity="0.28" stroke-width="3"/>',
    },
    'padrao-matriz-binaria': {
      fundo: 'var(--cor-secao-cultura-fundo, #fffbeb)',
      traco: 'var(--cor-secao-cultura, #b45309)',
      destaque: 'var(--cor-alerta, #b7791f)',
      padrao: `<pattern id="p-${uid}" width="28" height="28" patternUnits="userSpaceOnUse">
        <circle cx="8" cy="8" r="2" fill="var(--cor-secao-cultura, #b45309)" fill-opacity="0.28"/>
        <rect x="18" y="18" width="4" height="4" rx="1" fill="var(--cor-secao-cultura, #b45309)" fill-opacity="0.22"/>
      </pattern>`,
      decor: '<polygon points="500,46 562,84 562,156 500,194 438,156 438,84" fill="none" stroke="var(--cor-secao-cultura, #b45309)" stroke-opacity="0.28" stroke-width="2.5"/>',
    },
    'padrao-gradiente-pensamento': {
      fundo: 'var(--cor-secao-pensamento-fundo, #eff6ff)',
      traco: 'var(--cor-secao-pensamento, #1d4ed8)',
      destaque: 'var(--cor-primaria, #2c5282)',
      padrao: `<linearGradient id="p-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="var(--cor-secao-pensamento, #1d4ed8)" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="var(--cor-primaria, #2c5282)" stop-opacity="0.08"/>
      </linearGradient>`,
      decor: '<circle cx="110" cy="180" r="90" fill="var(--cor-secao-pensamento, #1d4ed8)" fill-opacity="0.12"/><rect x="420" y="42" width="130" height="130" rx="20" fill="none" stroke="var(--cor-secao-pensamento, #1d4ed8)" stroke-opacity="0.28" stroke-width="2"/>',
    },
    'padrao-gradiente-mundo': {
      fundo: 'var(--cor-secao-mundo-fundo, #ecfdf5)',
      traco: 'var(--cor-secao-mundo, #047857)',
      destaque: 'var(--cor-secundaria, #276749)',
      padrao: `<linearGradient id="p-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="var(--cor-secao-mundo, #047857)" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="var(--cor-secundaria-suave, #38a169)" stop-opacity="0.08"/>
      </linearGradient>`,
      decor: '<circle cx="495" cy="120" r="82" fill="var(--cor-secao-mundo, #047857)" fill-opacity="0.12"/><path d="M 60 180 L 180 70 L 290 150" fill="none" stroke="var(--cor-secao-mundo, #047857)" stroke-opacity="0.26" stroke-width="3" stroke-linecap="round"/>',
    },
    'padrao-gradiente-cultura': {
      fundo: 'var(--cor-secao-cultura-fundo, #fffbeb)',
      traco: 'var(--cor-secao-cultura, #b45309)',
      destaque: 'var(--cor-alerta, #b7791f)',
      padrao: `<linearGradient id="p-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="var(--cor-secao-cultura, #b45309)" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="var(--cor-alerta, #b7791f)" stop-opacity="0.08"/>
      </linearGradient>`,
      decor: '<circle cx="490" cy="115" r="78" fill="var(--cor-secao-cultura, #b45309)" fill-opacity="0.12"/><circle cx="110" cy="80" r="46" stroke="var(--cor-secao-cultura, #b45309)" stroke-opacity="0.26" stroke-width="2" fill="none"/>',
    },
  };

  const cfg = paleta[padraoId] || paleta['padrao-malha-isometrica'];
  return `<svg class="ws-padrao-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240" width="600" height="240" preserveAspectRatio="xMidYMid slice" ${aria}>
    <defs>${cfg.padrao}</defs>
    <rect width="600" height="240" fill="${cfg.fundo}"/>
    <rect width="600" height="240" fill="url(#p-${uid})"/>
    ${cfg.decor}
  </svg>`;
}

export function obterCapaPorId(coverId) {
  const capaNotion = CAPAS_NOTION.find((c) => c.id === coverId);
  if (capaNotion) return capaNotion;
  const ilustracao = ILUSTRACOES_EDUCACIONAIS.find((i) => i.id === coverId);
  if (ilustracao) return ilustracao;
  const padrao = PADROES_GEOMETRICOS.find((p) => p.id === coverId);
  if (padrao) return padrao;
  return CAPAS_NOTION[0];
}

export function obterCatalogoCapas() {
  return {
    notion: CAPAS_NOTION,
    padroes: PADROES_GEOMETRICOS,
    ilustracoes: ILUSTRACOES_EDUCACIONAIS,
  };
}

/**
 * Renderiza a visualização HTML da capa selecionada com zero CLS e privacidade local.
 */
export function renderizarCapaHtml(coverId, opcoes = {}) {
  const item = obterCapaPorId(coverId);
  const classe = opcoes.classe || 'ws-capa-midia';
  const tituloTraduzido = obterTituloAcervo(item);
  if (item.categoria === 'padroes') {
    return gerarSvgPadraoGeometrico(item.id, { titulo: tituloTraduzido, decorativo: true });
  }
  const altSeguro = String(opcoes.alt || obterAltAcervo(item) || tituloTraduzido).replace(/"/g, '&quot;');
  return `<img class="${classe}" src="${item.url}" alt="${altSeguro}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async">`;
}

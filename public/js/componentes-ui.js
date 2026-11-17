/**
 * ============================================================================
 * LMS COMPASSO - COMPONENTES REUTILIZÁVEIS DE WAYFINDING E CONSISTÊNCIA VISUAL
 * ============================================================================
 * Módulo com componentes padronizados:
 * 1. Breadcrumb: Trilha semântica com lista ordenada, suporte mobile e sem link no item final;
 * 2. NavMenu: Navegação principal consistente (WCAG 3.2.3 / 3.2.4) com aria-current;
 * 3. Icon: Wrapper para Web Component <lms-icon> e sprite SVG com grade 16/20/24/32px;
 * 4. ProgressTrail: Trilha de marcos com os 4 estados padronizados e barra Etapa X de Y;
 * 5. SectionHeader: Cabeçalho unificado com código de cores por seção (BNCC/Áreas);
 * 6. BackNextBar: Barra direcional padronizada (Voltar à esquerda, Avançar à direita);
 * 7. EmptyState / ErrorState: Estados vazios e de erro com rotas de saída claras.
 * ============================================================================
 */

import { gerarSvgIconeHtml, resolverNomeIconeUniversal } from './icones-universais.js';

/**
 * Helper seguro de tradução com fallback em português para interoperabilidade Node/Browser.
 */
function tr(chave, params = {}, padrao = null) {
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

/**
 * Escapa texto HTML para evitar XSS.
 */
function escapeHtml(texto) {
  if (texto === null || texto === undefined) return '';
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Componente 1: Breadcrumb
 * @param {Object} props
 * @param {Array<{ rotulo: string, href?: string, icone?: string }>} props.itens
 * @param {{ href: string, rotulo: string }} [props.mobileVoltar]
 * @returns {string} HTML do Breadcrumb
 */
export function Breadcrumb({ itens = [], mobileVoltar = null }) {
  const itemVoltar = mobileVoltar || (itens.length > 1 ? itens[itens.length - 2] : { href: '/', rotulo: tr('wf.inicio', {}, 'Início') });
  const itensHtml = itens.map((item, index) => {
    const ehUltimo = index === itens.length - 1;
    const iconeHtml = item.icone ? `<span class="material-symbols-outlined icon-xs" aria-hidden="true">${escapeHtml(item.icone)}</span> ` : '';

    if (ehUltimo) {
      return `<li aria-current="page" class="wf-breadcrumb-atual">${iconeHtml}<strong>${escapeHtml(item.rotulo)}</strong></li>`;
    }
    return `<li><a href="${escapeHtml(item.href || '#')}" class="wf-breadcrumb-link">${iconeHtml}<span>${escapeHtml(item.rotulo)}</span></a></li>`;
  }).join('');

  const tituloVoltar = tr('comp.voltarPara', { rotulo: itemVoltar.rotulo }, `Voltar para ${itemVoltar.rotulo}`);
  return `
    <nav class="comp-breadcrumb atv-breadcrumbs" aria-label="${escapeHtml(tr('wf.voceEstaAqui', {}, 'Você está aqui'))}">
      <a href="${escapeHtml(itemVoltar.href || '/')}" class="wf-breadcrumb-mobile-voltar seta-voltar" title="${escapeHtml(tituloVoltar)}">
        <span class="material-symbols-outlined icon-xs" aria-hidden="true">arrow_back</span>
        <span>${escapeHtml(tituloVoltar)}</span>
      </a>
      <ol class="wf-breadcrumb-lista">
        ${itensHtml}
      </ol>
    </nav>
  `.trim();
}

/**
 * Componente 2: NavMenu
 * @param {Object} props
 * @param {Array<{ chave: string, href: string, label: string, icone: string, secao?: string }>} props.itens
 * @param {string} props.ativo Chave do item ativo
 * @returns {string} HTML do menu de navegação
 */
export function NavMenu({ itens = [], ativo = '' }) {
  const linksHtml = itens.map((item) => {
    const isAtivo = item.chave === ativo;
    return `
      <a href="${escapeHtml(item.href)}" class="nav-item ${isAtivo ? 'ativo' : ''}" ${item.secao ? `data-secao-item="${escapeHtml(item.secao)}"` : ''} ${isAtivo ? 'aria-current="page"' : ''} title="${escapeHtml(item.label)}">
        <div class="nav-item-icone">
          <span class="material-symbols-outlined" aria-hidden="true">${escapeHtml(item.icone)}</span>
        </div>
        <span class="nav-item-texto">${escapeHtml(item.label)}</span>
        ${isAtivo ? '<span class="nav-item-indicador" aria-hidden="true"></span>' : ''}
      </a>
    `;
  }).join('');

  return `
    <nav class="comp-nav-menu sidebar-nav" aria-label="${escapeHtml(tr('comp.menuPrincipal', {}, 'Menu principal'))}">
      <div class="nav-secao-rotulo">${escapeHtml(tr('layout.ondePossoIr', {}, 'Onde posso ir'))}</div>
      ${linksHtml}
    </nav>
  `.trim();
}

/**
 * Componente 3: Icon
 * @param {Object} props
 * @param {string} props.nome Nome universal do ícone (ex.: 'settings', 'search', 'home')
 * @param {'xs'|'sm'|'md'|'lg'|number} [props.tamanho='md'] 16, 20, 24, 32px
 * @param {string} [props.rotulo] Rótulo acessível quando funcional
 * @param {boolean} [props.decorativo=true] Se true, aria-hidden="true"
 * @param {string} [props.classeExtra='']
 * @returns {string} HTML do ícone SVG
 */
export function Icon({ nome, tamanho = 'md', rotulo = null, decorativo = true, classeExtra = '' }) {
  const nomePadrao = resolverNomeIconeUniversal(nome);
  const dimensoes = { xs: 16, sm: 20, md: 24, lg: 32 };
  const dim = typeof tamanho === 'number' ? tamanho : (dimensoes[tamanho] || 24);

  return gerarSvgIconeHtml(nomePadrao, {
    tamanho: dim,
    rotulo: decorativo ? null : rotulo,
    decorativo,
    classeExtra: `comp-icon ${classeExtra}`.trim(),
  });
}

/**
 * Componente 4: ProgressTrail
 * @param {Object} props
 * @param {number} props.etapaAtual
 * @param {number} props.totalEtapas
 * @param {string} [props.titulo='Trilha de Aprendizagem']
 * @param {Array<{ etapa: number, titulo: string, estado: 'concluido'|'em-andamento'|'nao-iniciado'|'bloqueado', href?: string }>} [props.marcos=[]]
 * @returns {string} HTML da barra e marcos de progresso
 */
export function ProgressTrail({ etapaAtual = 1, totalEtapas = 6, titulo = tr('comp.trilhaAprendizagem', {}, 'Trilha de Aprendizagem'), marcos = [] }) {
  const percentual = Math.round((Math.max(1, etapaAtual) / Math.max(1, totalEtapas)) * 100);

  const iconesEstado = {
    concluido: 'check_circle',
    'em-andamento': 'schedule',
    'nao-iniciado': 'circle-dashed',
    bloqueado: 'lock',
  };

  const rotulosEstado = {
    concluido: tr('layout.estadoConcluido', {}, 'Concluído'),
    'em-andamento': tr('layout.estadoEmAndamento', {}, 'Em andamento'),
    'nao-iniciado': tr('layout.estadoNaoIniciado', {}, 'Não iniciado'),
    bloqueado: tr('layout.estadoBloqueado', {}, 'Bloqueado'),
  };

  const marcosHtml = marcos.map((m) => {
    const estado = m.estado || 'nao-iniciado';
    const icone = iconesEstado[estado] || 'circle-dashed';
    const rotulo = rotulosEstado[estado] || rotulosEstado['nao-iniciado'];
    const ehAtual = m.etapa === etapaAtual;

    const conteudo = `
      <span class="material-symbols-outlined icon-xs" aria-hidden="true">${icone}</span>
      <span>${escapeHtml(tr('comp.etapaTitulo', { etapa: m.etapa, titulo: m.titulo }, `Etapa ${m.etapa}: ${m.titulo}`))}</span>
    `;

    if (m.href) {
      return `
        <li class="trilha-marco-item estado-${estado} ${ehAtual ? 'voce-esta-aqui' : ''}" ${ehAtual ? 'aria-current="step"' : ''} title="${escapeHtml(m.titulo)} (${escapeHtml(rotulo)})">
          <a href="${escapeHtml(m.href)}" class="trilha-marco-link">${conteudo}</a>
        </li>
      `;
    }

    return `
      <li class="trilha-marco-item estado-${estado} ${ehAtual ? 'voce-esta-aqui' : ''}" ${ehAtual ? 'aria-current="step"' : ''} title="${escapeHtml(m.titulo)} (${escapeHtml(rotulo)})">
        ${conteudo}
      </li>
    `;
  }).join('');

  const resumoProgresso = tr(
    'comp.resumoEtapa',
    { titulo, atual: etapaAtual, total: totalEtapas, percentual },
    `${titulo} — Etapa ${etapaAtual} de ${totalEtapas} (${percentual}%)`,
  );

  return `
    <section class="comp-progress-trail progresso-etapas-box" aria-label="${escapeHtml(titulo)}">
      <div class="progresso-etapas-topo">
        <span class="progresso-etapas-contador">
          <span class="material-symbols-outlined icon-xs" aria-hidden="true">explore</span>
          <span>${escapeHtml(resumoProgresso)}</span>
        </span>
        <div class="flex-linha flex-wrap gap-8">
          <span class="estado-progresso-pill estado-concluido"><span class="material-symbols-outlined icon-xs" aria-hidden="true">check_circle</span> ${escapeHtml(rotulosEstado.concluido)}</span>
          <span class="estado-progresso-pill estado-em-andamento"><span class="material-symbols-outlined icon-xs" aria-hidden="true">schedule</span> ${escapeHtml(rotulosEstado['em-andamento'])}</span>
          <span class="estado-progresso-pill estado-nao-iniciado"><span class="material-symbols-outlined icon-xs" aria-hidden="true">circle-dashed</span> ${escapeHtml(rotulosEstado['nao-iniciado'])}</span>
          <span class="estado-progresso-pill estado-bloqueado"><span class="material-symbols-outlined icon-xs" aria-hidden="true">lock</span> ${escapeHtml(rotulosEstado.bloqueado)}</span>
        </div>
      </div>
      <div class="progresso-etapas-barra" role="progressbar" aria-label="${escapeHtml(titulo)}" aria-valuenow="${etapaAtual}" aria-valuemin="1" aria-valuemax="${totalEtapas}">
        <div class="progresso-etapas-preenchimento" style="width: ${percentual}%;"></div>
      </div>
      ${marcosHtml ? `<ol class="trilha-marcos" aria-label="${escapeHtml(tr('comp.marcosTrilha', {}, 'Marcos da trilha'))}">${marcosHtml}</ol>` : ''}
    </section>
  `.trim();
}

/**
 * Componente 5: SectionHeader
 * @param {Object} props
 * @param {'pensamento'|'mundo'|'cultura'|'aluno'|'professor'|'config'} props.secao
 * @param {string} props.titulo
 * @param {string} [props.subtitulo]
 * @param {string} [props.badgeTexto]
 * @param {string} [props.badgeIcone]
 * @param {string} [props.acoesHtml]
 * @returns {string} HTML do cabeçalho de seção
 */
export function SectionHeader({ secao = 'pensamento', titulo, subtitulo = '', badgeTexto = '', badgeIcone = '', acoesHtml = '' }) {
  const iconeBadgeHtml = badgeIcone
    ? `<span class="material-symbols-outlined icon-xs" aria-hidden="true">${escapeHtml(badgeIcone)}</span>`
    : '';
  return `
    <header class="comp-section-header" data-secao="${escapeHtml(secao)}">
      <div class="flex-entre flex-wrap gap-12">
        <div>
          ${badgeTexto ? `
            <div class="mb-6">
              <span class="secao-pista-badge" data-secao="${escapeHtml(secao)}">
                ${iconeBadgeHtml}
                <span>${escapeHtml(badgeTexto)}</span>
              </span>
            </div>
          ` : ''}
          <h1 id="titulo-secao" class="m-0">${escapeHtml(titulo)}</h1>
          ${subtitulo ? `<p class="texto-suave mt-6 mb-0">${escapeHtml(subtitulo)}</p>` : ''}
        </div>
        ${acoesHtml ? `<div class="comp-section-acoes flex-linha flex-wrap gap-8">${acoesHtml}</div>` : ''}
      </div>
    </header>
  `.trim();
}

/**
 * Componente 6: BackNextBar
 * @param {Object} props
 * @param {{ href: string, rotulo: string }} props.voltar
 * @param {{ href: string, rotulo: string }} [props.avancar]
 * @param {string} [props.mapaEtapaTexto]
 * @param {string} [props.onClickMapa]
 * @returns {string} HTML da barra de direção Voltar / Próximo
 */
export function BackNextBar({ voltar, avancar = null, mapaEtapaTexto = '', onClickMapa = "alternarPainelWayfinding('painel-wf-mapa')" }) {
  const titleVoltar = tr('comp.voltarPara', { rotulo: voltar.rotulo }, `Voltar para ${voltar.rotulo}`);
  const labelVoltar = tr('layout.voltarPrefixo', { rotulo: voltar.rotulo }, `Voltar: ${voltar.rotulo}`);
  const titleAvancar = avancar ? tr('layout.avancarPara', { rotulo: avancar.rotulo }, `Avançar para ${avancar.rotulo}`) : '';
  return `
    <div class="comp-back-next-bar wf-como-volto-avanco" role="group" aria-label="${escapeHtml(tr('comp.voltarOuAvancar', {}, 'Voltar ou avançar'))}">
      ${mapaEtapaTexto ? `
        <button type="button" class="btn btn-neutro btn-sm wf-nav-btn" onclick="${escapeHtml(onClickMapa)}" title="${escapeHtml(tr('comp.verMapaCurso', {}, 'Ver Mapa do Curso'))}">
          <span class="material-symbols-outlined icon-xs" aria-hidden="true">map</span>
          <span>${escapeHtml(mapaEtapaTexto)}</span>
        </button>
      ` : ''}
      <a href="${escapeHtml(voltar.href)}" class="btn btn-neutro btn-sm wf-nav-btn seta-voltar" title="${escapeHtml(titleVoltar)}">
        <span class="material-symbols-outlined icon-xs" aria-hidden="true">arrow_back</span>
        <span>${escapeHtml(labelVoltar)}</span>
      </a>
      ${avancar ? `
        <a href="${escapeHtml(avancar.href)}" class="btn btn-primario btn-sm wf-nav-btn seta-proximo" title="${escapeHtml(titleAvancar)}">
          <span>${escapeHtml(avancar.rotulo)}</span>
          <span class="material-symbols-outlined icon-xs" aria-hidden="true">arrow_forward</span>
        </a>
      ` : ''}
    </div>
  `.trim();
}

/**
 * Componente 7: EmptyState / ErrorState
 * @param {Object} props
 * @param {string} [props.icone='explore']
 * @param {string} props.titulo
 * @param {string} props.descricao
 * @param {{ href?: string, rotulo: string, onClick?: string }} [props.acaoPrimaria]
 * @param {{ href?: string, rotulo: string, onClick?: string }} [props.acaoSecundaria]
 * @param {boolean} [props.comBusca=true]
 * @param {string} [props.placeholderBusca]
 * @returns {string} HTML do estado vazio ou erro
 */
export function EmptyState({
  icone = 'explore',
  titulo,
  descricao,
  acaoPrimaria = { href: '/', rotulo: tr('vazio.irInicio', {}, 'Ir para o início') },
  acaoSecundaria = null,
  comBusca = true,
  placeholderBusca = tr('comp.placeholderBuscaBncc', {}, 'Buscar por código BNCC (ex.: EF05CO01) ou tema...'),
}) {
  const acaoPrimariaHtml = acaoPrimaria.href
    ? `<a href="${escapeHtml(acaoPrimaria.href)}" class="btn btn-primario flex-inline-icon"><span class="material-symbols-outlined icon-xs" aria-hidden="true">home</span> ${escapeHtml(acaoPrimaria.rotulo)}</a>`
    : `<button type="button" class="btn btn-primario" onclick="${escapeHtml(acaoPrimaria.onClick || '')}">${escapeHtml(acaoPrimaria.rotulo)}</button>`;

  let acaoSecundariaHtml = '';
  if (acaoSecundaria) {
    acaoSecundariaHtml = acaoSecundaria.href
      ? `<a href="${escapeHtml(acaoSecundaria.href)}" class="btn btn-neutro seta-proximo"><span>${escapeHtml(acaoSecundaria.rotulo)}</span> <span class="material-symbols-outlined icon-xs" aria-hidden="true">arrow_forward</span></a>`
      : `<button type="button" class="btn btn-neutro" onclick="${escapeHtml(acaoSecundaria.onClick || '')}">${escapeHtml(acaoSecundaria.rotulo)}</button>`;
  }

  return `
    <section class="comp-empty-state estado-saida-404" aria-label="${escapeHtml(titulo)}">
      <div class="estado-saida-icone" aria-hidden="true">
        <span class="material-symbols-outlined icon-lg">${escapeHtml(icone)}</span>
      </div>
      <h2>${escapeHtml(titulo)}</h2>
      <p class="texto-suave">${escapeHtml(descricao)}</p>

      ${comBusca ? `
        <form class="estado-saida-busca" onsubmit="event.preventDefault(); const q = this.q.value.trim(); window.location.href = q ? '/atividades.html?busca=' + encodeURIComponent(q) : '/atividades.html';">
          <input type="search" name="q" placeholder="${escapeHtml(placeholderBusca)}" aria-label="${escapeHtml(tr('comp.buscarPlataforma', {}, 'Buscar na plataforma'))}">
          <button type="submit" class="btn btn-primario flex-inline-icon">
            <span class="material-symbols-outlined icon-xs" aria-hidden="true">search</span>
            <span>${escapeHtml(tr('nav.buscar', {}, 'Buscar'))}</span>
          </button>
        </form>
      ` : ''}

      <div class="estado-saida-acoes">
        ${acaoPrimariaHtml}
        ${acaoSecundariaHtml}
      </div>
    </section>
  `.trim();
}

export function ErrorState(props) {
  return EmptyState({
    icone: 'warning',
    titulo: props.titulo || tr('comp.erro404Titulo', {}, 'Página não encontrada (Erro 404)'),
    descricao: props.descricao || tr('comp.erro404Desc', {}, 'O recurso solicitado não existe ou mudou de endereço. Use a busca ou retorne ao início.'),
    ...props,
  });
}

// Expõe globalmente para interoperabilidade com scripts clássicos
if (typeof window !== 'undefined') {
  window.LMSComponents = {
    Breadcrumb,
    NavMenu,
    Icon,
    ProgressTrail,
    SectionHeader,
    BackNextBar,
    EmptyState,
    ErrorState,
  };
}

/**
 * ============================================================================
 * LMS COMPASSO — MOTOR DE INTERNACIONALIZAÇÃO (i18n) E ACESSIBILIDADE
 * ============================================================================
 * Suporte a 9 idiomas (Inglês, Ucraniano, Espanhol, Turco, Italiano, Alemão,
 * Francês, Russo e Português) com paridade 1:1 de dicionários.
 * - WCAG 3.1.1 (Idioma da Página): atualiza document.documentElement.lang
 * - WCAG 3.1.2 (Idioma das Partes): declara lang individual em cada opção
 * - WAI-ARIA 1.2: Padrão Listbox acessível (role="listbox", role="option")
 * - Navegação via Teclado: Setas Cima/Baixo, Home, End, Enter, Space, Escape
 * - Live Region: Anúncio sonoro via aria-live ao trocar de idioma
 * ============================================================================
 */

import pt from './i18n/pt.js';
import en from './i18n/en.js';
import es from './i18n/es.js';
import uk from './i18n/uk.js';
import fr from './i18n/fr.js';
import it from './i18n/it.js';
import tr from './i18n/tr.js';
import de from './i18n/de.js';
import ru from './i18n/ru.js';

export const CHAVE_STORAGE_IDIOMA = 'lms_idioma';

export const IDIOMAS_SUPORTADOS = [
  { codigo: 'en', nome: 'Inglês', nativo: 'English', regiao: 'US', locale: 'en-US', dir: 'ltr' },
  { codigo: 'uk', nome: 'Ucraniano', nativo: 'Українська', regiao: 'UA', locale: 'uk-UA', dir: 'ltr' },
  { codigo: 'es', nome: 'Espanhol', nativo: 'Español', regiao: 'ES', locale: 'es-ES', dir: 'ltr' },
  { codigo: 'tr', nome: 'Turco', nativo: 'Türkçe', regiao: 'TR', locale: 'tr-TR', dir: 'ltr' },
  { codigo: 'it', nome: 'Italiano', nativo: 'Italiano', regiao: 'IT', locale: 'it-IT', dir: 'ltr' },
  { codigo: 'de', nome: 'Alemão', nativo: 'Deutsch', regiao: 'DE', locale: 'de-DE', dir: 'ltr' },
  { codigo: 'fr', nome: 'Francês', nativo: 'Français', regiao: 'FR', locale: 'fr-FR', dir: 'ltr' },
  { codigo: 'ru', nome: 'Russo', nativo: 'Русский', regiao: 'RU', locale: 'ru-RU', dir: 'ltr' },
  { codigo: 'pt', nome: 'Português', nativo: 'Português (Brasil)', regiao: 'BR', locale: 'pt-BR', dir: 'ltr' },
];

export const DICIONARIO = { pt, en, es, uk, fr, it, tr, de, ru };

/**
 * Obtém o código do idioma ativo no cliente
 */
export function obterIdiomaAtual() {
  try {
    if (typeof localStorage !== 'undefined') {
      const salvo = localStorage.getItem(CHAVE_STORAGE_IDIOMA);
      if (salvo && IDIOMAS_SUPORTADOS.some((i) => i.codigo === salvo)) {
        return salvo;
      }
    }
  } catch (erroStorage) {
    console.warn('Idioma salvo indisponível no storage:', erroStorage?.message || erroStorage);
  }
  return 'pt';
}

/**
 * Retorna o objeto de metadados do idioma por código
 */
export function obterInfoIdioma(codigo) {
  return IDIOMAS_SUPORTADOS.find((i) => i.codigo === codigo) || IDIOMAS_SUPORTADOS[0];
}

/**
 * Retorna a tag BCP-47 completa usada por Intl.DateTimeFormat e Intl.NumberFormat
 */
export function obterLocaleIntl(codigo = obterIdiomaAtual()) {
  const info = IDIOMAS_SUPORTADOS.find((i) => i.codigo === codigo);
  return info?.locale || 'pt-BR';
}

/**
 * Traduz uma chave substituindo interpolações {param}
 */
export function t(chave, params = {}, padrao = null) {
  let fallback = padrao;
  let interpolacoes = params;

  // Suporta tanto t(chave, { x: 1 }, 'Padrão') quanto t(chave, 'Padrão', { x: 1 })
  if (typeof params === 'string') {
    fallback = params;
    interpolacoes = typeof padrao === 'object' && padrao !== null ? padrao : {};
  }

  const idioma = obterIdiomaAtual();
  const dictIdioma = DICIONARIO[idioma] || {};
  const dictPt = DICIONARIO.pt || {};
  const dictEn = DICIONARIO.en || {};

  let texto = dictIdioma[chave] ?? dictPt[chave] ?? dictEn[chave] ?? fallback ?? chave;

  if (interpolacoes && typeof interpolacoes === 'object') {
    Object.entries(interpolacoes).forEach(([k, v]) => {
      texto = String(texto).replaceAll(`{${k}}`, String(v));
    });
  }

  return texto;
}

const OPCOES_DATA_PADRAO = Object.freeze({ dateStyle: 'short', timeStyle: 'short' });

/**
 * Formata datas conforme o idioma ativo usando Intl.DateTimeFormat
 */
export function formatarData(valor, opcoes) {
  if (!valor) return '-';
  const data = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(data.getTime())) return String(valor);
  const opcoesResolvidas = opcoes ?? OPCOES_DATA_PADRAO;
  try {
    return new Intl.DateTimeFormat(obterLocaleIntl(), opcoesResolvidas).format(data);
  } catch (erroFmtData) {
    console.warn('Fallback de formatação de data:', erroFmtData?.message || erroFmtData);
    return data.toLocaleString(obterLocaleIntl());
  }
}

/**
 * Formata números conforme o idioma ativo usando Intl.NumberFormat
 */
export function formatarNumero(numero, opcoes) {
  const num = Number(numero);
  if (!Number.isFinite(num)) return String(numero ?? '');
  try {
    return new Intl.NumberFormat(obterLocaleIntl(), opcoes).format(num);
  } catch (erroFmtNum) {
    console.warn('Fallback de formatação numérica:', erroFmtNum?.message || erroFmtNum);
    return String(num);
  }
}

/**
 * Atualiza o idioma ativo e traduz a interface
 */
export function definirIdioma(codigo) {
  const info = IDIOMAS_SUPORTADOS.find((i) => i.codigo === codigo);
  if (!info) return;

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CHAVE_STORAGE_IDIOMA, codigo);
    }
  } catch (erroStorage) {
    console.warn('Não foi possível persistir o idioma selecionado:', erroStorage?.message || erroStorage);
  }

  const locale = obterLocaleIntl(codigo);

  // WCAG 3.1.1: Idioma oficial da página declarado na tag <html>
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = codigo === 'pt' ? 'pt-BR' : codigo;
    document.documentElement.dir = info.dir || 'ltr';

    traduzirDocumento();
    atualizarEstadoVisualSeletor(codigo);
    anunciarTrocaIdioma(info.nativo);

    // Notifica outros módulos reativos (evento oficial + alias legado)
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      const payload = { detail: { idioma: codigo, info, locale } };
      window.dispatchEvent(new CustomEvent('lms:idioma-alterado', payload));
      window.dispatchEvent(new CustomEvent('idiomaAlterado', payload));
    }
  }
}

/**
 * Anuncia a troca de idioma para leitores de tela (WCAG 4.1.3)
 */
function anunciarTrocaIdioma(nomeNativo) {
  if (typeof document === 'undefined' || !document.body) return;
  let anuncio = document.getElementById?.('a11y-anuncio-idioma');
  if (!anuncio && typeof document.createElement === 'function') {
    anuncio = document.createElement('output');
    anuncio.id = 'a11y-anuncio-idioma';
    anuncio.className = 'somente-leitor';
    anuncio.setAttribute('aria-live', 'polite');
    anuncio.setAttribute('aria-atomic', 'true');
    document.body.appendChild(anuncio);
  }
  if (anuncio) {
    anuncio.textContent = t('i18n.anuncioTroca', { nome: nomeNativo });
  }
}

/**
 * Lê JSON opcional de parâmetros de interpolação declarado em data-i18n-params
 */
function lerParamsElemento(el) {
  const raw = el?.getAttribute?.('data-i18n-params');
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Busca uma chave estritamente no dicionário para elementos com markup inline,
 * evitando ecoar atributos arbitrários do DOM ou propriedades de protótipo.
 */
function buscarTraducaoEstrita(chave, params = {}) {
  if (!chave || typeof chave !== 'string') return null;
  const idioma = obterIdiomaAtual();
  const candidatos = [DICIONARIO[idioma], DICIONARIO.pt, DICIONARIO.en];
  let bruto = null;
  for (const dict of candidatos) {
    if (dict && Object.hasOwn(dict, chave)) {
      bruto = dict[chave];
      break;
    }
  }
  if (bruto === null || bruto === undefined) return null;
  let texto = String(bruto);
  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([k, v]) => {
      texto = texto.replaceAll(`{${k}}`, String(v));
    });
  }
  return texto;
}

/**
 * Constrói nós DOM seguros recursivamente permitindo apenas tags inline sem atributos
 * (<span>, <em>, <strong>, <code>, <kbd>, <br>), sem atribuição a innerHTML.
 */
function anexarHtmlInlineSeguro(el, conteudo) {
  const padraoTag = /<(span|em|strong|code|kbd)>([\s\S]*?)<\/\1>|<br\s*\/?>/i;
  let restante = conteudo;

  while (restante.length > 0) {
    const match = padraoTag.exec(restante);
    if (!match) {
      el.appendChild(document.createTextNode(restante));
      break;
    }
    if (match.index > 0) {
      el.appendChild(document.createTextNode(restante.slice(0, match.index)));
    }
    if (match[0].toLowerCase().startsWith('<br')) {
      el.appendChild(document.createElement('br'));
    } else {
      const noTag = document.createElement(match[1].toLowerCase());
      anexarHtmlInlineSeguro(noTag, match[2]);
      el.appendChild(noTag);
    }
    restante = restante.slice(match.index + match[0].length);
  }
}

/**
 * Renderiza texto com markup inline restrito sem atribuição a innerHTML.
 */
function definirConteudoInlineSeguro(el, conteudo) {
  if (
    typeof document?.createElement !== 'function' ||
    typeof document?.createTextNode !== 'function' ||
    typeof el.appendChild !== 'function'
  ) {
    el.textContent = conteudo;
    return;
  }

  el.textContent = '';
  anexarHtmlInlineSeguro(el, conteudo);
}

function ehSpanDeRotuloPuro(no) {
  return Boolean(
    no.nodeType === 1
    && String(no.tagName || '').toUpperCase() === 'SPAN'
    && !no.classList?.contains('material-symbols-outlined')
    && !no.classList?.contains('lms-svg-icon')
    && !no.classList?.contains('somente-leitor')
    && no.getAttribute?.('aria-hidden') !== 'true'
    && !no.getAttribute?.('data-svg-hidratado')
    && !no.getAttribute?.('data-i18n')
    && !no.querySelector?.('svg, .material-symbols-outlined'),
  );
}

function atualizarRotuloDomComFilhos(el, icone, texto) {
  const nosFilhos = Array.from(el.childNodes);
  const spanRotulo = nosFilhos.find(ehSpanDeRotuloPuro);
  if (spanRotulo) {
    spanRotulo.textContent = texto;
    return;
  }

  const idxIcone = nosFilhos.indexOf(icone);
  const textoAntes = nosFilhos.slice(0, idxIcone).some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
  nosFilhos.forEach((n) => {
    if (n.nodeType === 3) el.removeChild(n);
  });
  if (!texto) return;

  if (textoAntes) {
    el.insertBefore(document.createTextNode(`${texto} `), icone);
  } else {
    el.insertBefore(document.createTextNode(` ${texto}`), icone.nextSibling || null);
  }
}

/**
 * Atualiza o rótulo de links/botões preservando qualquer ícone <svg> ou
 * .material-symbols-outlined existente sem destruir filhos SVG ou innerHTML.
 */
export function definirRotuloComIcone(el, texto) {
  if (!el) return;
  const icone = el.querySelector?.('.material-symbols-outlined, svg, [data-svg-hidratado]');
  const podeManipularDom = Boolean(icone && typeof document?.createTextNode === 'function' && typeof el.appendChild === 'function');
  if (!podeManipularDom) {
    el.textContent = texto;
    return;
  }

  if (el.childNodes && typeof el.insertBefore === 'function' && typeof el.removeChild === 'function') {
    atualizarRotuloDomComFilhos(el, icone, texto);
    return;
  }

  const iconePreservado = typeof icone.cloneNode === 'function' ? icone.cloneNode(true) : icone;
  el.textContent = '';
  el.appendChild(iconePreservado);
  if (texto) el.appendChild(document.createTextNode(` ${texto}`));
}

/**
 * Traduz atributos declarativos simples (data-i18n-placeholder, title, aria-label, aria)
 */
function traduzirAtributoDireto(seletor, nomeAttrAtivo, atributoDom) {
  const lista = document.querySelectorAll?.(seletor) || [];
  lista.forEach((el) => {
    const chave = el.getAttribute?.(nomeAttrAtivo);
    if (!chave) return;
    const traducao = t(chave, lerParamsElemento(el));
    if (traducao) el.setAttribute(atributoDom, traducao);
  });
}

function traduzirElementosTexto() {
  const elementos = document.querySelectorAll?.('[data-i18n]') || [];
  elementos.forEach((el) => {
    const chave = el.getAttribute?.('data-i18n');
    const traducao = chave ? t(chave, lerParamsElemento(el)) : '';
    if (!traducao) return;

    if (el.tagName === 'TITLE') {
      document.title = traducao;
      el.textContent = traducao;
      return;
    }
    if (el.querySelector?.('[data-i18n], [data-i18n-html]')) return;

    if (el.querySelector?.('.material-symbols-outlined, svg')) {
      definirRotuloComIcone(el, traducao);
    } else {
      el.textContent = traducao;
    }
  });
}

function traduzirElementosHtmlSeguro() {
  const elementosHtml = document.querySelectorAll?.('[data-i18n-html]') || [];
  elementosHtml.forEach((el) => {
    const chave = el.getAttribute?.('data-i18n-html');
    const traducao = chave ? buscarTraducaoEstrita(chave, lerParamsElemento(el)) : null;
    if (traducao) definirConteudoInlineSeguro(el, traducao);
  });
}

function traduzirTituloDocumento() {
  const metaTitulo = document.querySelector?.('meta[name="i18n-title"]');
  const chaveTitulo = metaTitulo?.getAttribute?.('content');
  const traducaoTitulo = chaveTitulo ? t(chaveTitulo) : '';
  if (traducaoTitulo) {
    document.title = traducaoTitulo;
    return;
  }

  if (typeof window === 'undefined' || metaTitulo || document.querySelector?.('title[data-i18n]')) return;
  const path = window.location?.pathname || '';
  if (path.includes('mundo-digital')) document.title = t('md.metaTitulo');
  else if (path.includes('cultura-digital')) document.title = t('cd.metaTitulo');
}

function traduzirAtributosCompostos() {
  const elementosAttr = document.querySelectorAll?.('[data-i18n-attr]') || [];
  elementosAttr.forEach((el) => {
    const raw = el.getAttribute?.('data-i18n-attr');
    if (!raw) return;
    const params = lerParamsElemento(el);
    raw.split(',').forEach((par) => {
      const idx = par.indexOf(':');
      if (idx === -1) return;
      const attr = par.slice(0, idx).trim();
      const chave = par.slice(idx + 1).trim();
      if (attr && chave) el.setAttribute(attr, t(chave, params));
    });
  });
}

const MAPA_ROTAS_NAV_PUBLICA = {
  '/': 'nav.inicio',
  '/index.html': 'nav.inicio',
  '/boas-vindas.html': 'nav.boasVindas',
  '/atividades.html': 'nav.atividades',
  '/mundo-digital.html': 'nav.mundoDigital',
  '/cultura-digital.html': 'nav.culturaDigital',
  '/planos.html': 'nav.planos',
  '/cursos.html': 'nav.cursos',
  '/workspace.html': 'nav.workspace',
};

function traduzirLinksNavegacaoFallback() {
  const linksNav = document.querySelectorAll?.('.pub-nav a') || [];
  linksNav.forEach((link) => {
    if (link.getAttribute?.('data-i18n') || link.querySelector?.('[data-i18n]')) return;
    const chave = MAPA_ROTAS_NAV_PUBLICA[link.getAttribute?.('href')];
    if (chave) definirRotuloComIcone(link, t(chave));
  });
}

function aplicarTextoFallbackRodape() {
  const camposRodape = [
    [document.getElementById?.('rodape-plataforma'), 'rodape.plataforma'],
    [document.getElementById?.('rodape-projeto'), 'rodape.projeto'],
    [document.querySelector?.('.pub-rodape-grade > div > p'), 'rodape.descricao'],
  ];
  camposRodape.forEach(([el, chave]) => {
    if (el && !el.getAttribute?.('data-i18n')) el.textContent = t(chave);
  });
}

function deveTraduzirBotaoEntrar(btnEntrar) {
  if (!btnEntrar) return false;
  if (btnEntrar.href?.includes?.('/dashboard.html') || btnEntrar.href?.includes?.('/cursos.html')) return false;
  return !btnEntrar.getAttribute?.('data-i18n') && !btnEntrar.querySelector?.('[data-i18n]');
}

function traduzirTopoERodapeFallback() {
  const btnBuscar = document.querySelector?.('.pub-acoes a[href="/atividades.html"]');
  if (btnBuscar) {
    if (!btnBuscar.getAttribute?.('data-i18n-aria-label') && !btnBuscar.getAttribute?.('data-i18n-aria')) {
      btnBuscar.setAttribute('aria-label', t('nav.buscarAriaLabel'));
    }
    if (!btnBuscar.getAttribute?.('data-i18n-title')) {
      btnBuscar.setAttribute('title', t('nav.buscarAriaLabel'));
    }
    if (!btnBuscar.getAttribute?.('data-i18n') && !btnBuscar.querySelector?.('[data-i18n]')) {
      definirRotuloComIcone(btnBuscar, t('nav.buscar'));
    }
  }

  const btnEntrar = document.getElementById?.('acao-entrar');
  if (deveTraduzirBotaoEntrar(btnEntrar)) definirRotuloComIcone(btnEntrar, t('nav.entrar'));

  const btnCadastrar = document.getElementById?.('acao-cadastrar');
  if (btnCadastrar && !btnCadastrar.getAttribute?.('data-i18n') && !btnCadastrar.querySelector?.('[data-i18n]')) {
    definirRotuloComIcone(btnCadastrar, t('nav.criarConta'));
  }

  aplicarTextoFallbackRodape();
}

/**
 * Varre o documento e atualiza elementos com data-i18n* e cabeçalho/rodapé público
 */
export function traduzirDocumento() {
  if (typeof document === 'undefined') return;
  traduzirElementosTexto();
  traduzirElementosHtmlSeguro();
  traduzirTituloDocumento();
  traduzirAtributoDireto('[data-i18n-aria]', 'data-i18n-aria', 'aria-label');
  traduzirAtributoDireto('[data-i18n-aria-label]', 'data-i18n-aria-label', 'aria-label');
  traduzirAtributoDireto('[data-i18n-placeholder]', 'data-i18n-placeholder', 'placeholder');
  traduzirAtributoDireto('[data-i18n-title]', 'data-i18n-title', 'title');
  traduzirAtributosCompostos();
  traduzirLinksNavegacaoFallback();
  traduzirTopoERodapeFallback();
  atualizarEstadoVisualSeletor(obterIdiomaAtual());
}

/**
 * Atualiza classes ativas e atributos de acessibilidade do seletor
 */
function atualizarEstadoVisualSeletor(codigoAtivo) {
  if (typeof document === 'undefined') return;
  const info = obterInfoIdioma(codigoAtivo);
  const tituloSeletor = t('i18n.tituloSeletor', { atual: info.nativo }, `${t('i18n.rotuloIdioma', {}, 'Idioma')}: ${info.nativo}`);

  const botoes = document.querySelectorAll?.('.btn-seletor-idioma') || [];
  const btnUnico = document.getElementById?.('btn-seletor-idioma');
  const alvos = botoes.length ? botoes : (btnUnico ? [btnUnico] : []);

  alvos.forEach((btn) => {
    btn.setAttribute('aria-label', t('i18n.rotuloSeletor', { atual: info.nativo }));
    btn.setAttribute('title', tituloSeletor);
  });

  const listas = document.querySelectorAll?.('.lista-idiomas') || [];
  listas.forEach((lista) => {
    lista.setAttribute('aria-label', t('i18n.listaAriaLabel'));
  });

  const opcoes = document.querySelectorAll?.('.opcao-idioma') || [];
  opcoes.forEach((opt) => {
    const lang = opt.getAttribute?.('data-lang');
    const ehAtivo = lang === codigoAtivo;
    opt.setAttribute('aria-selected', String(ehAtivo));
    opt.classList?.toggle?.('selecionado', ehAtivo);
  });
}

let listenerGlobalSeletorIdiomaRegistrado = false;

function garantirListenerFechamentoGlobalSeletor() {
  if (listenerGlobalSeletorIdiomaRegistrado || typeof document === 'undefined' || typeof document.addEventListener !== 'function') {
    return;
  }
  listenerGlobalSeletorIdiomaRegistrado = true;
  document.addEventListener('click', (e) => {
    const wrappers = document.querySelectorAll?.('.seletor-idioma-wrapper') || [];
    wrappers.forEach((wrapper) => {
      if (wrapper.contains?.(e.target)) return;
      const popover = wrapper.querySelector?.('.dropdown-idiomas-popover');
      const botao = wrapper.querySelector?.('.btn-seletor-idioma');
      if (popover && !popover.hidden) {
        popover.hidden = true;
        botao?.setAttribute?.('aria-expanded', 'false');
        botao?.classList?.remove?.('aberto');
      }
    });
  });
}

function criarBotaoSeletorIdioma(varianteClara, sufixo, infoAtivo) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = `btn ${varianteClara ? 'btn-secundario' : 'btn-contorno-escuro'} btn-sm btn-seletor-idioma flex-inline-icon`;
  botao.id = `btn-seletor-idioma${sufixo}`;
  botao.setAttribute('aria-haspopup', 'listbox');
  botao.setAttribute('aria-expanded', 'false');
  botao.setAttribute('aria-controls', `lista-opcoes-idioma${sufixo}`);
  botao.setAttribute('aria-label', t('i18n.rotuloSeletor', { atual: infoAtivo.nativo }));
  botao.setAttribute('title', t('i18n.tituloSeletor', { atual: infoAtivo.nativo }, `${t('i18n.rotuloIdioma', {}, 'Idioma')}: ${infoAtivo.nativo}`));
  botao.innerHTML = `
    <span class="material-symbols-outlined icon-xs" aria-hidden="true">language</span>
    <span class="material-symbols-outlined seta-idioma icon-xs" aria-hidden="true">expand_more</span>
  `;
  return botao;
}

function criarListaOpcoesIdioma(sufixo, idiomaAtivo, aoSelecionar) {
  const lista = document.createElement('ul');
  lista.className = 'lista-idiomas';
  lista.id = `lista-opcoes-idioma${sufixo}`;
  lista.setAttribute('role', 'listbox');
  lista.setAttribute('aria-label', t('i18n.listaAriaLabel'));

  IDIOMAS_SUPORTADOS.forEach((idioma) => {
    const li = document.createElement('li');
    li.className = `opcao-idioma ${idioma.codigo === idiomaAtivo ? 'selecionado' : ''}`;
    li.setAttribute('role', 'option');
    li.id = `opt-idioma-${idioma.codigo}${sufixo}`;
    li.setAttribute('data-lang', idioma.codigo);
    li.setAttribute('lang', idioma.codigo);
    li.setAttribute('aria-selected', String(idioma.codigo === idiomaAtivo));
    li.tabIndex = -1;
    li.innerHTML = `
      <span class="nome-idioma">${idioma.nativo}</span>
      <span class="material-symbols-outlined check-idioma icon-xs" aria-hidden="true">check</span>
    `;
    li.addEventListener('click', () => aoSelecionar(idioma.codigo));
    lista.appendChild(li);
  });

  return lista;
}

function tratarTeclaListaIdiomas(e, { lista, popover, botao, abrirPopover, fecharPopover }) {
  const itens = Array.from(lista.querySelectorAll('.opcao-idioma'));
  const indexFoco = itens.indexOf(document.activeElement);

  switch (e.key) {
    case 'Escape':
      fecharPopover();
      botao.focus();
      e.preventDefault();
      break;
    case 'ArrowDown':
      e.preventDefault();
      if (popover.hidden) abrirPopover();
      else itens[(indexFoco + 1) % itens.length]?.focus();
      break;
    case 'ArrowUp':
      e.preventDefault();
      if (popover.hidden) abrirPopover();
      else itens[indexFoco > 0 ? indexFoco - 1 : itens.length - 1]?.focus();
      break;
    case 'Home':
      e.preventDefault();
      if (!popover.hidden) itens[0]?.focus();
      break;
    case 'End':
      e.preventDefault();
      if (!popover.hidden) itens[itens.length - 1]?.focus();
      break;
    case 'Enter':
    case ' ':
      if (!popover.hidden && indexFoco !== -1) {
        e.preventDefault();
        itens[indexFoco].click();
      }
      break;
    default:
      break;
  }
}

/**
 * Cria e insere o componente de seletor de idiomas no container de ações
 */
export function montarSeletorIdioma(container, opcoes = {}) {
  if (!container || container.querySelector('.seletor-idioma-wrapper')) return;

  const idiomaAtivo = obterIdiomaAtual();
  const infoAtivo = obterInfoIdioma(idiomaAtivo);
  const temPrincipal = Boolean(document.getElementById?.('btn-seletor-idioma'));
  const sufixo = temPrincipal ? `-${Date.now().toString(36)}` : '';
  const varianteClara = Boolean(
    opcoes?.claro
    || container.classList?.contains?.('topbar-ferramentas')
    || container.classList?.contains?.('planos-topo-acoes')
    || container.classList?.contains?.('auth-idioma-topo'),
  );

  const wrapper = document.createElement('div');
  wrapper.className = `seletor-idioma-wrapper${varianteClara ? ' seletor-idioma-claro' : ''}`;

  const botao = criarBotaoSeletorIdioma(varianteClara, sufixo, infoAtivo);
  const popover = document.createElement('div');
  popover.className = 'dropdown-idiomas-popover';
  popover.id = `popover-idiomas${sufixo}`;
  popover.hidden = true;

  const setaNotch = document.createElement('div');
  setaNotch.className = 'dropdown-idiomas-seta';
  setaNotch.setAttribute('aria-hidden', 'true');
  popover.appendChild(setaNotch);

  const fecharPopover = () => {
    popover.hidden = true;
    botao.setAttribute('aria-expanded', 'false');
    botao.classList.remove('aberto');
  };

  const lista = criarListaOpcoesIdioma(sufixo, idiomaAtivo, (codigo) => {
    definirIdioma(codigo);
    fecharPopover();
    botao.focus();
  });

  const abrirPopover = () => {
    popover.hidden = false;
    botao.setAttribute('aria-expanded', 'true');
    botao.classList.add('aberto');
    const selecionado = lista.querySelector('.opcao-idioma.selecionado') || lista.firstElementChild;
    if (selecionado) selecionado.focus();
  };

  popover.appendChild(lista);
  wrapper.appendChild(botao);
  wrapper.appendChild(popover);

  botao.addEventListener('click', (e) => {
    e.stopPropagation();
    if (popover.hidden) abrirPopover();
    else fecharPopover();
  });
  wrapper.addEventListener('keydown', (e) => tratarTeclaListaIdiomas(e, { lista, popover, botao, abrirPopover, fecharPopover }));
  garantirListenerFechamentoGlobalSeletor();

  const btnEntrar = container.querySelector('#acao-entrar');
  if (btnEntrar) container.insertBefore(wrapper, btnEntrar);
  else container.appendChild(wrapper);
}

// Exposição global síncrona para módulos clássicos e scripts inline
if (typeof window !== 'undefined') {
  window.t = t;
  window.LMS_I18N = {
    CHAVE_STORAGE_IDIOMA,
    IDIOMAS_SUPORTADOS,
    t,
    obterIdiomaAtual,
    obterInfoIdioma,
    obterLocaleIntl,
    definirIdioma,
    traduzirDocumento,
    montarSeletorIdioma,
    formatarData,
    formatarNumero,
    definirRotuloComIcone,
  };
}

// Inicialização automática ao carregar
if (typeof document !== 'undefined') {
  const init = () => {
    const idiomaSalvo = obterIdiomaAtual();
    const info = obterInfoIdioma(idiomaSalvo);
    if (document.documentElement) {
      document.documentElement.lang = idiomaSalvo === 'pt' ? 'pt-BR' : idiomaSalvo;
      document.documentElement.dir = info.dir || 'ltr';
    }
    traduzirDocumento();

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('lms:i18n-pronto', {
        detail: { idioma: idiomaSalvo, info, locale: obterLocaleIntl(idiomaSalvo) },
      }));
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

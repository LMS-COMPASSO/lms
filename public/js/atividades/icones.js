/**
 * ============================================================================
 * LMS COMPASSO — BIBLIOTECA DE ÍCONES E ASSETS VETORIAIS (BNCC COMPUTAÇÃO)
 * ============================================================================
 * Mapeia IDs de atividades, passos, obstáculos, itens e partes para ícones do
 * Google Material Symbols Outlined e paleta de cores institucional, eliminando
 * a dependência de emojis do sistema operacional nas interfaces de atividades.
 * ============================================================================
 */

import { h } from './dom.js';

/**
 * Tabela de correspondência semântica: IDs e emojis para Material Symbols Outlined
 */
export const DICIONARIO_ICONES = {
  // Atividades & Categorias do Catálogo
  'robo-caminho-escola': { icone: 'smart_toy', cor: 'cor-robo' },
  'robo-desviando-pocas': { icone: 'water_drop', cor: 'cor-poca' },
  'robo-padaria': { icone: 'bakery_dining', cor: 'cor-padaria' },
  'robo-horta': { icone: 'potted_plant', cor: 'cor-planta' },
  'ordenar-escovar-dentes': { icone: 'dentistry', cor: 'cor-saude' },
  'ordenar-atravessar-rua': { icone: 'traffic', cor: 'cor-aviso' },
  'ordenar-sanduiche': { icone: 'lunch_dining', cor: 'cor-comida' },
  'ordenar-plantar-feijao': { icone: 'yard', cor: 'cor-natureza' },
  'ordenar-plantar-semente': { icone: 'yard', cor: 'cor-natureza' },
  'decompor-cafe-da-manha': { icone: 'coffee', cor: 'cor-cafe' },
  'decompor-festa-aniversario': { icone: 'cake', cor: 'cor-festa' },
  'decompor-horta-escola': { icone: 'eco', cor: 'cor-natureza' },
  'decompor-jogo-memoria': { icone: 'style', cor: 'cor-jogo' },
  'decompor-pesquisa-escolar': { icone: 'travel_explore', cor: 'cor-pesquisa' },
  'blocos-geometria-quadrado': { icone: 'square', cor: 'cor-geometria' },
  'blocos-labirinto-condicional': { icone: 'explore', cor: 'cor-labirinto' },
  'blocos-padrao-estrela': { icone: 'star', cor: 'cor-estrela' },
  'python3d-sequencia-labirinto': { icone: 'view_in_ar', cor: 'cor-robo' },
  'python3d-condicionais-portas': { icone: 'sensor_door', cor: 'cor-labirinto' },
  'python3d-lacos-repeticao': { icone: 'repeat', cor: 'cor-geometria' },
  'python3d-funcoes-decomposicao': { icone: 'functions', cor: 'cor-pesquisa' },
  'python3d-listas-ordenacao': { icone: 'bar_chart', cor: 'cor-estrela' },
  'python3d-recursao-hanoi': { icone: 'stacked_bar_chart', cor: 'cor-meta' },

  // Conceitos Pedagógicos e de Computação (Pilar 1 - Sem ambiguidade)
  algoritmos: { icone: 'format_list_numbered', cor: 'cor-robo' },
  algoritmo: { icone: 'format_list_numbered', cor: 'cor-robo' },
  decomposicao: { icone: 'account_tree', cor: 'cor-pesquisa' },
  laco: { icone: 'repeat', cor: 'cor-geometria' },
  condicional: { icone: 'alt_route', cor: 'cor-labirinto' },
  funcao: { icone: 'functions', cor: 'cor-pesquisa' },
  dados: { icone: 'database', cor: 'cor-estrela' },
  rede: { icone: 'hub', cor: 'cor-robo' },
  seguranca: { icone: 'verified_user', cor: 'cor-meta' },
  hardware: { icone: 'memory', cor: 'cor-robo' },

  // Funções Universais de Wayfinding e Sistema (Pilar 1)
  configuracoes: { icone: 'settings', cor: 'cor-padrao' },
  buscar: { icone: 'search', cor: 'cor-pesquisa' },
  inicio: { icone: 'home', cor: 'cor-meta' },
  perfil: { icone: 'account_circle', cor: 'cor-robo' },
  ajuda: { icone: 'help', cor: 'cor-aviso' },
  notificacoes: { icone: 'notifications', cor: 'cor-estrela' },
  sair: { icone: 'logout', cor: 'cor-erro' },
  voltar: { icone: 'arrow_back', cor: 'cor-padrao' },
  proxima_atividade: { icone: 'arrow_forward', cor: 'cor-meta' },
  concluido: { icone: 'check_circle', cor: 'cor-natureza' },
  bloqueado: { icone: 'lock', cor: 'cor-padrao' },
  em_andamento: { icone: 'schedule', cor: 'cor-aviso' },
  download: { icone: 'download', cor: 'cor-robo' },
  executar_codigo: { icone: 'play_arrow', cor: 'cor-natureza' },

  // Elementos do Tabuleiro / Arena do Robô
  R: { icone: 'smart_toy', cor: 'cor-robo' },
  M: { icone: 'school', cor: 'cor-meta' },
  'meta-escola': { icone: 'school', cor: 'cor-meta' },
  'meta-portao': { icone: 'meeting_room', cor: 'cor-meta' },
  '#': { icone: 'park', cor: 'cor-arvore' },
  'obstaculo-arvore': { icone: 'park', cor: 'cor-arvore' },
  'obstaculo-poca': { icone: 'water_drop', cor: 'cor-poca' },
  'obstaculo-obra': { icone: 'construction', cor: 'cor-obra' },
  'obstaculo-pedra': { icone: 'landscape', cor: 'cor-pedra' },
  I: { icone: 'stars', cor: 'cor-item' },
  'item-mochila': { icone: 'backpack', cor: 'cor-mochila' },
  'item-merenda': { icone: 'nutrition', cor: 'cor-fruta' },
  'item-padaria': { icone: 'bakery_dining', cor: 'cor-padaria' },
  'item-planta': { icone: 'potted_plant', cor: 'cor-planta' },
  'item-guarda-chuva': { icone: 'umbrella', cor: 'cor-poca' },
  'item-galochas': { icone: 'hiking', cor: 'cor-obra' },

  // Passos de Ordenar
  pegar: { icone: 'pan_tool_alt', cor: 'cor-saude' },
  pasta: { icone: 'sanitizer', cor: 'cor-saude' },
  escovar: { icone: 'dentistry', cor: 'cor-saude' },
  enxaguar: { icone: 'water_drop', cor: 'cor-poca' },
  guardar: { icone: 'inventory_2', cor: 'cor-pesquisa' },
  sapatos: { icone: 'roller_skating', cor: 'cor-aviso' },
  parar: { icone: 'front_hand', cor: 'cor-erro' },
  faixa: { icone: 'traffic', cor: 'cor-aviso' },
  olhar: { icone: 'visibility', cor: 'cor-pesquisa' },
  esperar: { icone: 'directions_car', cor: 'cor-aviso' },
  atravessar: { icone: 'directions_walk', cor: 'cor-meta' },
  correr: { icone: 'directions_run', cor: 'cor-erro' },
  celular: { icone: 'smartphone', cor: 'cor-erro' },
  lavar: { icone: 'soap', cor: 'cor-poca' },
  pao: { icone: 'bakery_dining', cor: 'cor-padaria' },
  manteiga: { icone: 'egg_alt', cor: 'cor-aviso' },
  queijo: { icone: 'lunch_dining', cor: 'cor-aviso' },
  fechar: { icone: 'layers', cor: 'cor-comida' },
  servir: { icone: 'restaurant', cor: 'cor-meta' },
  ventilador: { icone: 'mode_fan', cor: 'cor-erro' },
  separar: { icone: 'shopping_basket', cor: 'cor-natureza' },
  algodao: { icone: 'cloud', cor: 'cor-pesquisa' },
  molhar: { icone: 'water_drop', cor: 'cor-poca' },
  feijoes: { icone: 'grain', cor: 'cor-natureza' },
  luz: { icone: 'light_mode', cor: 'cor-aviso' },
  regar: { icone: 'shower', cor: 'cor-poca' },
  escuro: { icone: 'dark_mode', cor: 'cor-erro' },

  // Partes e Subproblemas de Decompor
  cafe: { icone: 'coffee', cor: 'cor-cafe' },
  sanduiche: { icone: 'lunch_dining', cor: 'cor-comida' },
  convidados: { icone: 'mail', cor: 'cor-festa' },
  comida: { icone: 'cake', cor: 'cor-festa' },
  decoracao: { icone: 'celebration', cor: 'cor-festa' },
  brincadeiras: { icone: 'casino', cor: 'cor-jogo' },
  preparar: { icone: 'handyman', cor: 'cor-obra' },
  plantar: { icone: 'potted_plant', cor: 'cor-natureza' },
  cuidar: { icone: 'shower', cor: 'cor-poca' },
  colher: { icone: 'shopping_basket', cor: 'cor-natureza' },
  cartas: { icone: 'style', cor: 'cor-jogo' },
  jogadas: { icone: 'touch_app', cor: 'cor-meta' },
  pontos: { icone: 'military_tech', cor: 'cor-estrela' },
  fim: { icone: 'sports_score', cor: 'cor-meta' },
  planejar: { icone: 'edit_note', cor: 'cor-pesquisa' },
  buscar: { icone: 'travel_explore', cor: 'cor-pesquisa' },
  organizar: { icone: 'folder_copy', cor: 'cor-pesquisa' },
  apresentar: { icone: 'co_present', cor: 'cor-meta' },
  fora: { icone: 'delete_outline', cor: 'cor-descarte' },
  problema: { icone: 'track_changes', cor: 'cor-meta' },

  // Mapeamento reverso para strings de emoji caso o caller passe o emoji original
  '🤖': { icone: 'smart_toy', cor: 'cor-robo' },
  '🏫': { icone: 'school', cor: 'cor-meta' },
  '🚪': { icone: 'meeting_room', cor: 'cor-meta' },
  '🌳': { icone: 'park', cor: 'cor-arvore' },
  '💧': { icone: 'water_drop', cor: 'cor-poca' },
  '🚧': { icone: 'construction', cor: 'cor-obra' },
  '🪨': { icone: 'landscape', cor: 'cor-pedra' },
  '🎒': { icone: 'backpack', cor: 'cor-mochila' },
  '🍎': { icone: 'nutrition', cor: 'cor-fruta' },
  '🥖': { icone: 'bakery_dining', cor: 'cor-padaria' },
  '🌱': { icone: 'potted_plant', cor: 'cor-planta' },
  '☂️': { icone: 'umbrella', cor: 'cor-poca' },
  '🥾': { icone: 'hiking', cor: 'cor-obra' },
  '🪥': { icone: 'dentistry', cor: 'cor-saude' },
  '🧴': { icone: 'sanitizer', cor: 'cor-saude' },
  '🦷': { icone: 'dentistry', cor: 'cor-saude' },
  '📦': { icone: 'inventory_2', cor: 'cor-pesquisa' },
  '👟': { icone: 'roller_skating', cor: 'cor-aviso' },
  '🛑': { icone: 'front_hand', cor: 'cor-erro' },
  '🚸': { icone: 'traffic', cor: 'cor-aviso' },
  '👀': { icone: 'visibility', cor: 'cor-pesquisa' },
  '🚗': { icone: 'directions_car', cor: 'cor-aviso' },
  '🚶': { icone: 'directions_walk', cor: 'cor-meta' },
  '🏃': { icone: 'directions_run', cor: 'cor-erro' },
  '📱': { icone: 'smartphone', cor: 'cor-erro' },
  '🥪': { icone: 'lunch_dining', cor: 'cor-comida' },
  '🧼': { icone: 'soap', cor: 'cor-poca' },
  '🍞': { icone: 'bakery_dining', cor: 'cor-padaria' },
  '🧈': { icone: 'egg_alt', cor: 'cor-aviso' },
  '🧀': { icone: 'lunch_dining', cor: 'cor-aviso' },
  '🍽️': { icone: 'restaurant', cor: 'cor-meta' },
  '🌀': { icone: 'mode_fan', cor: 'cor-erro' },
  '🧺': { icone: 'shopping_basket', cor: 'cor-natureza' },
  '☁️': { icone: 'cloud', cor: 'cor-pesquisa' },
  '🌰': { icone: 'grain', cor: 'cor-natureza' },
  '☀️': { icone: 'light_mode', cor: 'cor-aviso' },
  '🚿': { icone: 'shower', cor: 'cor-poca' },
  '🌑': { icone: 'dark_mode', cor: 'cor-erro' },
  '☕': { icone: 'coffee', cor: 'cor-cafe' },
  '🎂': { icone: 'cake', cor: 'cor-festa' },
  '💌': { icone: 'mail', cor: 'cor-festa' },
  '🍰': { icone: 'cake', cor: 'cor-festa' },
  '🎈': { icone: 'celebration', cor: 'cor-festa' },
  '🎲': { icone: 'casino', cor: 'cor-jogo' },
  '🥕': { icone: 'eco', cor: 'cor-natureza' },
  '⛏️': { icone: 'handyman', cor: 'cor-obra' },
  '🃏': { icone: 'style', cor: 'cor-jogo' },
  '⭐': { icone: 'star', cor: 'cor-estrela' },
  '🏁': { icone: 'sports_score', cor: 'cor-meta' },
  '🔎': { icone: 'travel_explore', cor: 'cor-pesquisa' },
  '📝': { icone: 'edit_note', cor: 'cor-pesquisa' },
  '🗂️': { icone: 'folder_copy', cor: 'cor-pesquisa' },
  '🎤': { icone: 'co_present', cor: 'cor-meta' },
  '🎯': { icone: 'track_changes', cor: 'cor-meta' },
  '🗑️': { icone: 'delete_outline', cor: 'cor-descarte' },
  '🔢': { icone: 'terminal', cor: 'cor-robo' },
  '🧩': { icone: 'extension', cor: 'cor-pesquisa' },
  '📐': { icone: 'square', cor: 'cor-geometria' },
  '🧭': { icone: 'explore', cor: 'cor-labirinto' },
};

/**
 * Resolve o nome e estilo do ícone a partir de um identificador ou emoji
 */
export function obterInfoIcone(idOuEmoji, fallback = 'category') {
  if (!idOuEmoji) return { icone: fallback, cor: 'cor-padrao' };
  const chave = String(idOuEmoji).trim();
  return DICIONARIO_ICONES[chave] || { icone: fallback, cor: 'cor-padrao' };
}

/**
 * Cria o elemento DOM renderizado com Material Symbols Outlined
 * @param {string} idOuEmoji Chave do elemento ou emoji original
 * @param {object} opcoes Opções de customização (classe, tamanho, estilo)
 */
export function renderizarIcone(idOuEmoji, opcoes = {}) {
  const { classe = '', tamanho = '', fallback = 'category' } = opcoes;
  const info = obterInfoIcone(idOuEmoji, fallback);
  const classes = [
    'material-symbols-outlined',
    'atv-icone-simbolo',
    info.cor,
    tamanho ? `icon-${tamanho}` : '',
    classe,
  ].filter(Boolean).join(' ');

  return h('span', { class: classes, 'aria-hidden': 'true' }, info.icone);
}

/**
 * Renderiza o ícone temático de uma célula da grade do robô
 */
export function renderizarIconeCelula(simbolo, tema = {}) {
  let chave = simbolo;
  if (simbolo === '#') {
    if (tema.nomeObstaculo?.includes('poça')) chave = 'obstaculo-poca';
    else if (tema.nomeObstaculo?.includes('obra')) chave = 'obstaculo-obra';
    else if (tema.nomeObstaculo?.includes('pedra')) chave = 'obstaculo-pedra';
    else chave = '#';
  } else if (simbolo === 'M') {
    if (tema.nomeMeta?.includes('portão')) chave = 'meta-portao';
    else chave = 'M';
  } else if (simbolo === 'I') {
    if (tema.nomeItem?.includes('mochila')) chave = 'item-mochila';
    else if (tema.nomeItem?.includes('merenda')) chave = 'item-merenda';
    else if (tema.nomeItem?.includes('padaria') || tema.nomeItem?.includes('pão')) chave = 'item-padaria';
    else if (tema.nomeItem?.includes('planta') || tema.nomeItem?.includes('alface')) chave = 'item-planta';
    else if (tema.nomeItem?.includes('guarda-chuva')) chave = 'item-guarda-chuva';
    else if (tema.nomeItem?.includes('galochas')) chave = 'item-galochas';
    else chave = 'I';
  }

  return renderizarIcone(chave, { classe: 'atv-celula-glyph' });
}

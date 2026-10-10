/**
 * ============================================================================
 * LMS COMPASSO - LÓGICA DAS ATIVIDADES DINÂMICAS
 * ============================================================================
 * Funções puras (sem acesso ao DOM) que verificam as respostas dos estudantes e
 * simulam o robô. Ficam separadas da interface para serem testadas com `npm test`.
 * ============================================================================
 */

/**
 * Embaralha uma lista (Fisher-Yates) sem alterar a original.
 * Aceita uma função `aleatorio` para tornar o resultado previsível nos testes.
 */
export function embaralhar(lista, aleatorio = Math.random) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function mesmaOrdem(a, b) {
  return a.length === b.length && a.every((item, indice) => item === b[indice]);
}

/**
 * Embaralha garantindo, quando possível, que a ordem final seja diferente da original,
 * para que o quebra-cabeça nunca comece resolvido.
 */
export function embaralharDiferente(lista, aleatorio = Math.random) {
  if (lista.length < 2) return [...lista];
  for (let tentativa = 0; tentativa < 20; tentativa += 1) {
    const resultado = embaralhar(lista, aleatorio);
    if (!mesmaOrdem(resultado, lista)) return resultado;
  }
  return [...lista.slice(1), lista[0]];
}

/* ---------------------------------------------------------------------------
 * Montar a sequência (algoritmos do cotidiano)
 * ------------------------------------------------------------------------ */

/**
 * Confere a sequência montada pelo estudante.
 * Passos com a mesma `etapa` podem trocar de lugar; passos de etapas diferentes não.
 *
 * @param {object} atividade - Atividade do tipo "ordenar".
 * @param {string[]} idsEscolhidos - Ids dos passos na ordem escolhida pelo estudante.
 * @returns {{ok: boolean, faltando: string[], intrusos: string[], foraDoLugar: string[]}}
 */
export function avaliarOrdem(atividade, idsEscolhidos) {
  const passos = new Map(atividade.passos.map((passo) => [passo.id, passo]));
  const idsIntrusos = new Set((atividade.intrusos || []).map((intruso) => intruso.id));

  const escolhidos = idsEscolhidos.filter((id) => passos.has(id)).map((id) => passos.get(id));
  const intrusos = idsEscolhidos.filter((id) => idsIntrusos.has(id));
  const faltando = atividade.passos.filter((passo) => !idsEscolhidos.includes(passo.id)).map((passo) => passo.id);

  // Ordem ideal: a mesma escolha, ordenada pela etapa. Onde a etapa difere, o passo está fora do lugar.
  const ideal = [...escolhidos].sort((a, b) => a.etapa - b.etapa);
  const foraDoLugar = escolhidos.filter((passo, indice) => passo.etapa !== ideal[indice].etapa).map((passo) => passo.id);

  return {
    ok: faltando.length === 0 && intrusos.length === 0 && foraDoLugar.length === 0,
    faltando,
    intrusos,
    foraDoLugar,
  };
}

/* ---------------------------------------------------------------------------
 * Dividir o problema (decomposição lógica)
 * ------------------------------------------------------------------------ */

/**
 * Confere em qual parte do problema o estudante colocou cada tarefa.
 *
 * @param {object} atividade - Atividade do tipo "decompor".
 * @param {Object<string, string>} alocacao - Mapa { idDaTarefa: idDaParte } (use 'fora' para o descarte).
 */
export function avaliarClassificacao(atividade, alocacao) {
  const corretas = [];
  const erradas = [];
  const naoClassificadas = [];

  for (const tarefa of atividade.tarefas) {
    const escolha = alocacao[tarefa.id];
    if (!escolha) naoClassificadas.push(tarefa.id);
    else if (escolha === tarefa.parte) corretas.push(tarefa.id);
    else erradas.push(tarefa.id);
  }

  return {
    ok: erradas.length === 0 && naoClassificadas.length === 0,
    corretas,
    erradas,
    naoClassificadas,
    total: atividade.tarefas.length,
  };
}

/* ---------------------------------------------------------------------------
 * Programar o robô (sequência de comandos)
 * ------------------------------------------------------------------------ */

export const DIRECOES = {
  cima: { dx: 0, dy: -1, simbolo: '↑', nome: 'Cima' },
  baixo: { dx: 0, dy: 1, simbolo: '↓', nome: 'Baixo' },
  esquerda: { dx: -1, dy: 0, simbolo: '←', nome: 'Esquerda' },
  direita: { dx: 1, dy: 0, simbolo: '→', nome: 'Direita' },
};

const chaveCelula = (x, y) => `${x},${y}`;

/**
 * Converte a `grade` (lista de textos) em um mapa com coordenadas {x, y}, onde x é a coluna e y a linha.
 */
export function lerMapa(grade) {
  const altura = grade.length;
  const largura = altura > 0 ? grade[0].length : 0;
  const mapa = { largura, altura, inicio: null, meta: null, obstaculos: new Set(), itens: [] };

  grade.forEach((linha, y) => {
    if (linha.length !== largura) {
      throw new Error(`A linha ${y + 1} do mapa tem tamanho diferente das demais.`);
    }
    [...linha].forEach((simbolo, x) => {
      if (simbolo === 'R') mapa.inicio = { x, y };
      else if (simbolo === 'M') mapa.meta = { x, y };
      else if (simbolo === '#') mapa.obstaculos.add(chaveCelula(x, y));
      else if (simbolo === 'I') mapa.itens.push({ x, y });
      else if (simbolo !== '.') throw new Error(`Símbolo desconhecido no mapa: "${simbolo}".`);
    });
  });

  if (!mapa.inicio || !mapa.meta) {
    throw new Error('O mapa precisa ter um robô (R) e um destino (M).');
  }
  return mapa;
}

/**
 * Executa o programa do estudante, comando por comando.
 *
 * @param {object} mapa - Mapa retornado por `lerMapa`.
 * @param {string[]} comandos - Lista de direções (ex.: ['direita', 'direita', 'baixo']).
 * @returns {{resultado: string, passoComErro: number|null, trilha: object[], coletados: number[]}}
 *   `resultado` é um destes: 'sucesso', 'faltou-item', 'incompleto', 'bateu-obstaculo' ou 'bateu-borda'.
 *   `trilha` guarda a posição do robô antes do primeiro comando e depois de cada comando executado.
 */
export function executarPrograma(mapa, comandos) {
  let { x, y } = mapa.inicio;
  const itemNaCelula = new Map(mapa.itens.map((item, indice) => [chaveCelula(item.x, item.y), indice]));
  const coletados = new Set();
  const trilha = [{ x, y, indice: -1, evento: 'inicio' }];

  for (let indice = 0; indice < comandos.length; indice += 1) {
    const direcao = DIRECOES[comandos[indice]];
    const novoX = x + direcao.dx;
    const novoY = y + direcao.dy;

    if (novoX < 0 || novoY < 0 || novoX >= mapa.largura || novoY >= mapa.altura) {
      trilha.push({ x, y, indice, evento: 'borda' });
      return { resultado: 'bateu-borda', passoComErro: indice, trilha, coletados: [...coletados] };
    }
    if (mapa.obstaculos.has(chaveCelula(novoX, novoY))) {
      trilha.push({ x, y, indice, evento: 'obstaculo' });
      return { resultado: 'bateu-obstaculo', passoComErro: indice, trilha, coletados: [...coletados] };
    }

    x = novoX;
    y = novoY;
    let evento = 'mover';
    if (itemNaCelula.has(chaveCelula(x, y))) {
      coletados.add(itemNaCelula.get(chaveCelula(x, y)));
      evento = 'coletar';
    }
    trilha.push({ x, y, indice, evento });
  }

  const naMeta = x === mapa.meta.x && y === mapa.meta.y;
  let resultado = 'incompleto';
  if (naMeta) resultado = coletados.size === mapa.itens.length ? 'sucesso' : 'faltou-item';

  return { resultado, passoComErro: null, trilha, coletados: [...coletados] };
}

/**
 * Descobre o menor programa que resolve o mapa (busca em largura sobre posição + itens coletados).
 * Serve para calcular as estrelas e para garantir, nos testes, que todo mapa tem solução.
 *
 * @returns {string[]|null} Lista de comandos do menor programa, ou null se o mapa não tiver solução.
 */
export function menorPrograma(mapa) {
  const indiceItem = new Map(mapa.itens.map((item, indice) => [chaveCelula(item.x, item.y), indice]));
  const todos = (1 << mapa.itens.length) - 1;
  const chaveEstado = (x, y, mascara) => `${x},${y},${mascara}`;

  const inicio = { x: mapa.inicio.x, y: mapa.inicio.y, mascara: 0, anterior: null, comando: null };
  const visitados = new Set([chaveEstado(inicio.x, inicio.y, inicio.mascara)]);
  const fila = [inicio];

  for (let cabeca = 0; cabeca < fila.length; cabeca += 1) {
    const atual = fila[cabeca];
    if (atual.x === mapa.meta.x && atual.y === mapa.meta.y && atual.mascara === todos) {
      const comandos = [];
      for (let no = atual; no.anterior; no = no.anterior) comandos.unshift(no.comando);
      return comandos;
    }

    for (const [nome, direcao] of Object.entries(DIRECOES)) {
      const x = atual.x + direcao.dx;
      const y = atual.y + direcao.dy;
      if (x < 0 || y < 0 || x >= mapa.largura || y >= mapa.altura) continue;
      if (mapa.obstaculos.has(chaveCelula(x, y))) continue;

      const mascara = indiceItem.has(chaveCelula(x, y)) ? atual.mascara | (1 << indiceItem.get(chaveCelula(x, y))) : atual.mascara;
      const chave = chaveEstado(x, y, mascara);
      if (visitados.has(chave)) continue;
      visitados.add(chave);
      fila.push({ x, y, mascara, anterior: atual, comando: nome });
    }
  }
  return null;
}

/**
 * Estrelas do robô: 3 para o programa mais curto, 2 para até 2 comandos a mais, 1 para os demais.
 */
export function calcularEstrelas(totalComandos, minimo) {
  if (totalComandos <= minimo) return 3;
  if (totalComandos <= minimo + 2) return 2;
  return 1;
}

/* ---------------------------------------------------------------------------
 * Progresso
 * ------------------------------------------------------------------------ */

/**
 * Registra a conclusão de uma atividade sem alterar o objeto original.
 * `extras` pode trazer, por exemplo, as estrelas do robô (mantém sempre a melhor marca).
 */
export function registrarConclusao(progresso, id, { tentativas = 1, estrelas = null } = {}, agora = new Date()) {
  const anterior = progresso[id] || {};
  const melhorEstrelas = Math.max(anterior.estrelas || 0, estrelas || 0) || null;
  return {
    ...progresso,
    [id]: {
      concluida: true,
      tentativas,
      estrelas: melhorEstrelas,
      atualizadoEm: agora.toISOString(),
    },
  };
}

export function contarConcluidas(progresso, atividades) {
  return atividades.filter((atividade) => progresso[atividade.id]?.concluida).length;
}

export function plural(quantidade, singular, pluralTexto) {
  return `${quantidade} ${quantidade === 1 ? singular : pluralTexto}`;
}

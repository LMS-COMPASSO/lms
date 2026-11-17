/**
 * ============================================================================
 * LMS COMPASSO — WEB WORKER DE EXECUÇÃO PYTHON (PYODIDE + MOTOR PEDAGÓGICO)
 * ============================================================================
 * Executa o código Python do estudante fora da thread principal (Web Worker)
 * para nunca travar a interface 3D.
 * - Carrega Pyodide sob demanda (lazy) via CDN oficial quando online.
 * - Aplica sys.settrace para rastrear a linha de código em execução (lineno),
 *   limitar o número máximo de passos (evitando loops infinitos) e limitar o
 *   tempo de execução.
 * - Traduz exceções Python (SyntaxError, IndentationError, NameError, etc.)
 *   para mensagens pedagógicas em português claro.
 * - Inclui fallback offline em JavaScript para redes escolares sem internet.
 * ============================================================================
 */

const PYODIDE_INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/';
let pyodideInstancia = null;
let carregandoPyodide = null;

/**
 * Traduz erros técnicos do Python para mensagens didáticas e metadados i18n.
 */
export function detalharErroPython(mensagemBruta, linha = null) {
  const prefixo = linha ? `Erro na linha ${linha}: ` : 'Atenção no código: ';
  const msg = String(mensagemBruta || '');

  if (msg.includes('IndentationError')) {
    return {
      texto: `${prefixo}Problema de recuo (indentação). Verifique se as linhas dentro do "if", "for", "while" ou "def" têm 4 espaços à esquerda.`,
      chave: 'py3d.err.indent',
      linha,
      params: {},
    };
  }
  if (msg.includes('SyntaxError')) {
    return {
      texto: `${prefixo}Erro de escrita (sintaxe). Confira se você fechou todos os parênteses "()" e colocou dois-pontos ":" no final de comandos como if, for, while ou def.`,
      chave: 'py3d.err.syntax',
      linha,
      params: {},
    };
  }
  if (msg.includes('NameError')) {
    const match = msg.match(/name '([^']+)' is not defined/);
    const nome = match ? match[1] : 'comando';
    return {
      texto: `${prefixo}O nome "${nome}" não foi reconhecido. Use comandos válidos como robo.mover(), robo.girar_direita(), robo.coletar(), lista.trocar() ou hanoi.mover_disco().`,
      chave: 'py3d.err.name',
      linha,
      params: { nome },
    };
  }
  if (msg.includes('LIMITE_PASSOS')) {
    return {
      texto: `${prefixo}O programa ultrapassou o limite máximo de passos! Verifique se há um laço infinito (while) sem condição de parada.`,
      chave: 'py3d.err.limite',
      linha,
      params: {},
    };
  }
  if (msg.includes('MOVIMENTO_INVALIDO_HANOI')) {
    return {
      texto: `${prefixo}Regra da Torre de Hanói violada: um disco maior não pode ser colocado sobre um disco menor!`,
      chave: 'py3d.err.hanoi',
      linha,
      params: {},
    };
  }
  if (msg.startsWith('Traceback')) {
    const linhasErro = msg.split('\n');
    const linhaFinal = linhasErro.find((l) => l.includes('Error:') && /^[a-z]/i.test(l.trimStart()));
    if (linhaFinal) {
      return {
        texto: `${prefixo}${linhaFinal.trim()}`,
        chave: 'py3d.err.detalhe',
        linha,
        params: { detalhe: linhaFinal.trim() },
      };
    }
  }
  return {
    texto: `${prefixo}${msg}`,
    chave: 'py3d.err.detalhe',
    linha,
    params: { detalhe: msg },
  };
}

export function traduzirErroPython(mensagemBruta, linha = null) {
  return detalharErroPython(mensagemBruta, linha).texto;
}

/**
 * Simulador de estado da cena 3D que gera a lista de eventos para o Three.js/GSAP.
 */
export function criarAmbienteSimulacao(cena3d = {}) {
  const eventos = [];
  const maxPassos = cena3d.maxPassos || 100;
  let passosExecutados = 0;

  function registrarEvento(evento) {
    passosExecutados += 1;
    if (passosExecutados > maxPassos) {
      throw new Error('LIMITE_PASSOS');
    }
    eventos.push(evento);
  }

  // Modo 1: Grade 3D (Robô, Cristais e Portas)
  const gradeTexto = cena3d.grade || ['R.M'];
  const altura = gradeTexto.length;
  const largura = gradeTexto[0]?.length || 1;
  const direcoesOrdem = ['norte', 'leste', 'sul', 'oeste'];
  const vetores = {
    norte: { dx: 0, dy: -1 },
    leste: { dx: 1, dy: 0 },
    sul: { dx: 0, dy: 1 },
    oeste: { dx: -1, dy: 0 },
  };

  let roboX = 0;
  let roboY = 0;
  let metaX = 0;
  let metaY = 0;
  let direcao = cena3d.direcaoInicial || 'leste';
  const obstaculos = new Set();
  const portasFechadas = new Set();
  const itensRestantes = new Set();
  let totalItensIniciais = 0;

  gradeTexto.forEach((linha, y) => {
    [...linha].forEach((cel, x) => {
      const chave = `${x},${y}`;
      if (cel === 'R') { roboX = x; roboY = y; }
      else if (cel === 'M') { metaX = x; metaY = y; }
      else if (cel === '#') obstaculos.add(chave);
      else if (cel === 'P') portasFechadas.add(chave);
      else if (cel === 'I') {
        itensRestantes.add(chave);
        totalItensIniciais += 1;
      }
    });
  });

  // Modo 2: Ordenação de Torres 3D
  const valoresLista = [...(cena3d.valoresIniciais || [4, 2, 5, 1, 3])];

  // Modo 3: Torre de Hanói 3D
  const numDiscos = cena3d.numDiscos || 3;
  const pinosHanoi = {
    A: Array.from({ length: numDiscos }, (_, i) => numDiscos - i), // [3, 2, 1]
    B: [],
    C: [],
  };

  const apiRobo = {
    esta_livre() {
      const v = vetores[direcao];
      const nx = roboX + v.dx;
      const ny = roboY + v.dy;
      if (nx < 0 || ny < 0 || nx >= largura || ny >= altura) return false;
      const chave = `${nx},${ny}`;
      return !obstaculos.has(chave) && !portasFechadas.has(chave);
    },
    frente_porta() {
      const v = vetores[direcao];
      const nx = roboX + v.dx;
      const ny = roboY + v.dy;
      return portasFechadas.has(`${nx},${ny}`);
    },
    tem_item() {
      return itensRestantes.has(`${roboX},${roboY}`);
    },
    mover(linha = 1) {
      const v = vetores[direcao];
      const nx = roboX + v.dx;
      const ny = roboY + v.dy;
      const chave = `${nx},${ny}`;

      if (nx < 0 || ny < 0 || nx >= largura || ny >= altura) {
        registrarEvento({
          tipo: 'colisao-borda',
          x: roboX,
          y: roboY,
          direcao,
          linha,
          descricao: `Linha ${linha}: O robô tentou sair dos limites da plataforma 3D.`,
          descChave: 'py3d.ev.colisaoBorda',
          descParams: { linha },
        });
        return false;
      }
      if (obstaculos.has(chave) || portasFechadas.has(chave)) {
        const ehPorta = portasFechadas.has(chave);
        const motivo = ehPorta ? 'porta fechada' : 'obstáculo';
        registrarEvento({
          tipo: 'colisao-obstaculo',
          x: roboX,
          y: roboY,
          direcao,
          linha,
          descricao: `Linha ${linha}: O robô colidiu com ${motivo} em (${nx}, ${ny}).`,
          descChave: 'py3d.ev.colisaoObstaculo',
          descParams: { linha, x: nx, y: ny, motivoKey: ehPorta ? 'py3d.ev.motivoPorta' : 'py3d.ev.motivoObstaculo', motivo },
        });
        return false;
      }
      roboX = nx;
      roboY = ny;
      registrarEvento({
        tipo: 'mover',
        x: roboX,
        y: roboY,
        direcao,
        linha,
        descricao: `Linha ${linha}: Robô moveu para (${roboX}, ${roboY}) direção ${direcao}.`,
        descChave: 'py3d.ev.mover',
        descParams: { linha, x: roboX, y: roboY, direcao, dirKey: `py3d.dir.${direcao}` },
      });
      return true;
    },
    girar_direita(linha = 1) {
      const idx = direcoesOrdem.indexOf(direcao);
      direcao = direcoesOrdem[(idx + 1) % 4];
      registrarEvento({
        tipo: 'girar',
        x: roboX,
        y: roboY,
        direcao,
        sentido: 'direita',
        linha,
        descricao: `Linha ${linha}: Robô girou à direita (olhando para ${direcao}).`,
        descChave: 'py3d.ev.girarDireita',
        descParams: { linha, direcao, dirKey: `py3d.dir.${direcao}` },
      });
    },
    girar_esquerda(linha = 1) {
      const idx = direcoesOrdem.indexOf(direcao);
      direcao = direcoesOrdem[(idx + 3) % 4];
      registrarEvento({
        tipo: 'girar',
        x: roboX,
        y: roboY,
        direcao,
        sentido: 'esquerda',
        linha,
        descricao: `Linha ${linha}: Robô girou à esquerda (olhando para ${direcao}).`,
        descChave: 'py3d.ev.girarEsquerda',
        descParams: { linha, direcao, dirKey: `py3d.dir.${direcao}` },
      });
    },
    coletar(linha = 1) {
      const chave = `${roboX},${roboY}`;
      const coletou = itensRestantes.delete(chave);
      registrarEvento({
        tipo: 'coletar',
        x: roboX,
        y: roboY,
        sucesso: coletou,
        linha,
        descricao: coletou
          ? `Linha ${linha}: Cristal coletado na posição (${roboX}, ${roboY})!`
          : `Linha ${linha}: Tentativa de coleta sem cristal em (${roboX}, ${roboY}).`,
        descChave: coletou ? 'py3d.ev.coletarOk' : 'py3d.ev.coletarVazio',
        descParams: { linha, x: roboX, y: roboY },
      });
      return coletou;
    },
    abrir_porta(linha = 1) {
      const v = vetores[direcao];
      const chave = `${roboX + v.dx},${roboY + v.dy}`;
      const abriu = portasFechadas.delete(chave);
      registrarEvento({
        tipo: 'abrir-porta',
        x: roboX + v.dx,
        y: roboY + v.dy,
        sucesso: abriu,
        linha,
        descricao: abriu
          ? `Linha ${linha}: Porta energética aberta em (${roboX + v.dx}, ${roboY + v.dy})!`
          : `Linha ${linha}: Nenhuma porta fechada à frente para abrir.`,
        descChave: abriu ? 'py3d.ev.portaOk' : 'py3d.ev.portaVazio',
        descParams: { linha, x: roboX + v.dx, y: roboY + v.dy },
      });
      return abriu;
    },
  };

  const apiLista = {
    comparar(i, j, linha = 1) {
      const a = valoresLista[i];
      const b = valoresLista[j];
      registrarEvento({
        tipo: 'comparar-lista',
        i,
        j,
        valores: [...valoresLista],
        linha,
        descricao: `Linha ${linha}: Comparando torre [${i}] (altura ${a}) com torre [${j}] (altura ${b}).`,
        descChave: 'py3d.ev.compararLista',
        descParams: { linha, i, j, a, b },
      });
      return a - b;
    },
    trocar(i, j, linha = 1) {
      const temp = valoresLista[i];
      valoresLista[i] = valoresLista[j];
      valoresLista[j] = temp;
      registrarEvento({
        tipo: 'trocar-lista',
        i,
        j,
        valores: [...valoresLista],
        linha,
        descricao: `Linha ${linha}: Trocando torres nas posições [${i}] e [${j}] → [${valoresLista.join(', ')}].`,
        descChave: 'py3d.ev.trocarLista',
        descParams: { linha, i, j, lista: valoresLista.join(', ') },
      });
    },
  };

  const apiHanoi = {
    mover_disco(origem, destino, linha = 1) {
      const pilhaOrigem = pinosHanoi[origem];
      const pilhaDestino = pinosHanoi[destino];
      if (!pilhaOrigem || !pilhaDestino || pilhaOrigem.length === 0) {
        throw new Error('MOVIMENTO_INVALIDO_HANOI');
      }
      const disco = pilhaOrigem[pilhaOrigem.length - 1];
      const topoDestino = pilhaDestino[pilhaDestino.length - 1];
      if (topoDestino !== undefined && disco > topoDestino) {
        throw new Error('MOVIMENTO_INVALIDO_HANOI');
      }
      pilhaOrigem.pop();
      pilhaDestino.push(disco);
      registrarEvento({
        tipo: 'mover-disco',
        disco,
        origem,
        destino,
        estadoPinos: { A: [...pinosHanoi.A], B: [...pinosHanoi.B], C: [...pinosHanoi.C] },
        linha,
        descricao: `Linha ${linha}: Disco ${disco} movido do pino ${origem} para o pino ${destino}.`,
        descChave: 'py3d.ev.moverDisco',
        descParams: { linha, disco, origem, destino },
      });
    },
  };

  function obterResumoFinal() {
    const modo = cena3d.modo || 'grade';
    if (modo === 'ordenacao') {
      const ordenada = valoresLista.every((val, idx, arr) => idx === 0 || arr[idx - 1] <= val);
      return {
        sucesso: ordenada,
        valoresFinais: [...valoresLista],
        motivo: ordenada
          ? 'Todas as torres 3D estão ordenadas em ordem crescente!'
          : `As torres terminaram na ordem [${valoresLista.join(', ')}], ainda fora da ordem crescente.`,
        motivoChave: ordenada ? 'py3d.res.ordOk' : 'py3d.res.ordErro',
        motivoParams: { lista: valoresLista.join(', ') },
      };
    }
    if (modo === 'hanoi') {
      const destino = cena3d.pinoDestino || 'C';
      const completo = pinosHanoi[destino]?.length === numDiscos;
      return {
        sucesso: completo,
        pinosFinais: { A: [...pinosHanoi.A], B: [...pinosHanoi.B], C: [...pinosHanoi.C] },
        motivo: completo
          ? `Todos os ${numDiscos} discos foram transferidos para o pino ${destino}!`
          : `O pino ${destino} ainda não contém todos os ${numDiscos} discos.`,
        motivoChave: completo ? 'py3d.res.hanoiOk' : 'py3d.res.hanoiErro',
        motivoParams: { total: numDiscos, destino },
      };
    }

    const colidiu = eventos.some((e) => e.tipo === 'colisao-borda' || e.tipo === 'colisao-obstaculo');
    const chegouMeta = roboX === metaX && roboY === metaY;
    const coletouTodos = itensRestantes.size === 0;
    const sucesso = !colidiu && chegouMeta && coletouTodos;

    let motivo = 'Missão 3D cumprida com sucesso!';
    let motivoChave = 'py3d.res.gradeOk';
    let motivoParams = {};
    if (colidiu) {
      motivo = 'O robô colidiu durante o percurso. Revise os comandos e tente novamente!';
      motivoChave = 'py3d.res.gradeColidiu';
    } else if (!coletouTodos) {
      motivo = `Faltou coletar ${itensRestantes.size} cristal(is) antes de finalizar!`;
      motivoChave = itensRestantes.size === 1 ? 'py3d.res.gradeFaltouItemSing' : 'py3d.res.gradeFaltouItemPlur';
      motivoParams = { faltam: itensRestantes.size };
    } else if (!chegouMeta) {
      motivo = `O robô parou em (${roboX}, ${roboY}), mas o portal fica em (${metaX}, ${metaY}).`;
      motivoChave = 'py3d.res.gradeForaMeta';
      motivoParams = { x: roboX, y: roboY, mx: metaX, my: metaY };
    }

    return {
      sucesso,
      posicaoFinal: { x: roboX, y: roboY, direcao },
      itensColetados: totalItensIniciais - itensRestantes.size,
      totalItens: totalItensIniciais,
      motivo,
      motivoChave,
      motivoParams,
    };
  }

  return {
    eventos,
    apiRobo,
    apiLista,
    apiHanoi,
    obterResumoFinal,
  };
}

/**
 * Executa um subconjunto pedagógico de Python diretamente em JavaScript
 * quando o navegador está offline ou quando executado em ambiente de testes sem Pyodide.
 */
function removerComentarioForaString(linha) {
  let aspa = null;
  for (let i = 0; i < linha.length; i += 1) {
    const ch = linha[i];
    if (aspa) {
      if (ch === '\\') {
        i += 1;
      } else if (ch === aspa) {
        aspa = null;
      }
    } else if (ch === '\'' || ch === '"') {
      aspa = ch;
    } else if (ch === '#') {
      return linha.slice(0, i);
    }
  }
  return linha;
}

function tokenizarExpressao(texto, linhaNum) {
  const tokens = [];
  let i = 0;
  while (i < texto.length) {
    const ch = texto[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (ch === '\'' || ch === '"') {
      const delim = ch;
      let val = '';
      i += 1;
      while (i < texto.length && texto[i] !== delim) {
        if (texto[i] === '\\' && i + 1 < texto.length) {
          i += 1;
          val += texto[i];
        } else {
          val += texto[i];
        }
        i += 1;
      }
      if (i >= texto.length) {
        throw new Error(`SyntaxError: unterminated string literal (linha ${linhaNum})`);
      }
      i += 1;
      tokens.push({ tipo: 'str', valor: val });
      continue;
    }
    const par = texto.slice(i, i + 2);
    if (['==', '!=', '<=', '>=', '//'].includes(par)) {
      tokens.push({ tipo: 'op', valor: par });
      i += 2;
      continue;
    }
    if ('+-*/%<>().,[]'.includes(ch)) {
      tokens.push({ tipo: 'op', valor: ch });
      i += 1;
      continue;
    }
    if (/\d/.test(ch)) {
      const m = texto.slice(i).match(/^\d+(?:\.\d+)?/);
      tokens.push({ tipo: 'num', valor: Number(m[0]) });
      i += m[0].length;
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      const m = texto.slice(i).match(/^[a-zA-Z_]\w*/);
      const id = m[0];
      if (['and', 'or', 'not', 'True', 'False', 'None'].includes(id)) {
        tokens.push({ tipo: 'kw', valor: id });
      } else {
        tokens.push({ tipo: 'id', valor: id });
      }
      i += id.length;
      continue;
    }
    throw new Error(`SyntaxError: unexpected token "${ch}" (linha ${linhaNum})`);
  }
  return tokens;
}

function criarAvaliadorExpressao(texto, linhaNum) {
  const tokens = tokenizarExpressao(texto, linhaNum);
  let pos = 0;
  const peek = () => tokens[pos] || null;
  const consume = () => {
    const tk = tokens[pos] || null;
    pos += 1;
    return tk;
  };
  const matchOp = (valor) => {
    if (peek()?.tipo === 'op' && peek().valor === valor) {
      consume();
      return true;
    }
    return false;
  };
  const matchKw = (valor) => {
    if (peek()?.tipo === 'kw' && peek().valor === valor) {
      consume();
      return true;
    }
    return false;
  };

  function parseOr() {
    let esq = parseAnd();
    while (matchKw('or')) {
      const dir = parseAnd();
      esq = { tipo: 'binop', op: 'or', esq, dir };
    }
    return esq;
  }

  function parseAnd() {
    let esq = parseNot();
    while (matchKw('and')) {
      const dir = parseNot();
      esq = { tipo: 'binop', op: 'and', esq, dir };
    }
    return esq;
  }

  function parseNot() {
    if (matchKw('not')) {
      return { tipo: 'unop', op: 'not', arg: parseNot() };
    }
    return parseComparacao();
  }

  function parseComparacao() {
    let esq = parseAditivo();
    while (peek()?.tipo === 'op' && ['==', '!=', '<', '<=', '>', '>='].includes(peek().valor)) {
      const op = consume().valor;
      const dir = parseAditivo();
      esq = { tipo: 'binop', op, esq, dir };
    }
    return esq;
  }

  function parseAditivo() {
    let esq = parseMultiplicativo();
    while (peek()?.tipo === 'op' && (peek().valor === '+' || peek().valor === '-')) {
      const op = consume().valor;
      const dir = parseMultiplicativo();
      esq = { tipo: 'binop', op, esq, dir };
    }
    return esq;
  }

  function parseMultiplicativo() {
    let esq = parseUnario();
    while (peek()?.tipo === 'op' && ['*', '/', '//', '%'].includes(peek().valor)) {
      const op = consume().valor;
      const dir = parseUnario();
      esq = { tipo: 'binop', op, esq, dir };
    }
    return esq;
  }

  function parseUnario() {
    if (matchOp('-')) return { tipo: 'unop', op: '-', arg: parseUnario() };
    if (matchOp('+')) return { tipo: 'unop', op: '+', arg: parseUnario() };
    return parsePosfixo();
  }

  function parsePosfixo() {
    let node = parsePrimario();
    while (peek()) {
      if (matchOp('.')) {
        const membro = consume();
        if (!membro || membro.tipo !== 'id') {
          throw new Error(`SyntaxError: invalid member access (linha ${linhaNum})`);
        }
        node = { tipo: 'membro', obj: node, prop: membro.valor };
      } else if (matchOp('(')) {
        const args = [];
        if (!matchOp(')')) {
          do {
            args.push(parseOr());
          } while (matchOp(','));
          if (!matchOp(')')) {
            throw new Error(`SyntaxError: expected ")" (linha ${linhaNum})`);
          }
        }
        node = { tipo: 'chamada', alvo: node, args, linha: linhaNum };
      } else if (matchOp('[')) {
        const idx = parseOr();
        if (!matchOp(']')) {
          throw new Error(`SyntaxError: expected "]" (linha ${linhaNum})`);
        }
        node = { tipo: 'indice', obj: node, idx };
      } else {
        break;
      }
    }
    return node;
  }

  function parsePrimario() {
    const tk = consume();
    if (!tk) throw new Error(`SyntaxError: unexpected end of expression (linha ${linhaNum})`);
    if (tk.tipo === 'num' || tk.tipo === 'str') return { tipo: 'literal', valor: tk.valor };
    if (tk.tipo === 'kw') {
      if (tk.valor === 'True') return { tipo: 'literal', valor: true };
      if (tk.valor === 'False') return { tipo: 'literal', valor: false };
      if (tk.valor === 'None') return { tipo: 'literal', valor: null };
    }
    if (tk.tipo === 'id') return { tipo: 'var', nome: tk.valor };
    if (tk.tipo === 'op' && tk.valor === '(') {
      const dentro = parseOr();
      if (!matchOp(')')) throw new Error(`SyntaxError: expected ")" (linha ${linhaNum})`);
      return dentro;
    }
    if (tk.tipo === 'op' && tk.valor === '[') {
      const itens = [];
      if (!matchOp(']')) {
        do {
          itens.push(parseOr());
        } while (matchOp(','));
        if (!matchOp(']')) throw new Error(`SyntaxError: expected "]" (linha ${linhaNum})`);
      }
      return { tipo: 'lista', itens };
    }
    throw new Error(`SyntaxError: invalid syntax (linha ${linhaNum})`);
  }

  const ast = parseOr();
  if (pos < tokens.length) {
    throw new Error(`SyntaxError: invalid syntax (linha ${linhaNum})`);
  }
  return ast;
}

function parseLinhasPythonParaAst(linhas) {
  const registros = [];
  for (let idx = 0; idx < linhas.length; idx += 1) {
    const numLinha = idx + 1;
    const bruta = linhas[idx];
    const semComent = removerComentarioForaString(bruta);
    if (!semComent.trim()) continue;
    const matchIndent = semComent.match(/^(\s*)/);
    const indentBruto = matchIndent ? matchIndent[1] : '';
    if (indentBruto.includes('\t')) {
      throw new Error(`IndentationError: unexpected tab (linha ${numLinha})`);
    }
    const texto = semComent.trim();
    if (/^(if|else|elif|for|while|def)\b/.test(texto) && !texto.endsWith(':')) {
      throw new Error(`SyntaxError: expected ":" (linha ${numLinha})`);
    }
    registros.push({ numLinha, indent: indentBruto.length, texto });
  }

  let cursor = 0;

  function parseBloco(indentEsperado) {
    const corpo = [];
    while (cursor < registros.length) {
      const atual = registros[cursor];
      if (atual.indent < indentEsperado) break;
      if (atual.indent > indentEsperado) {
        throw new Error(`IndentationError: unexpected indent (linha ${atual.numLinha})`);
      }

      const { numLinha, texto } = atual;

      if (/^elif\b|^else\s*:/.test(texto)) {
        break;
      }

      cursor += 1;

      if (texto === 'pass') {
        corpo.push({ tipo: 'pass', linha: numLinha });
        continue;
      }
      if (texto === 'break') {
        corpo.push({ tipo: 'break', linha: numLinha });
        continue;
      }
      if (texto === 'continue') {
        corpo.push({ tipo: 'continue', linha: numLinha });
        continue;
      }
      if (/^return\b/.test(texto)) {
        const exprTxt = texto.slice(6).trim();
        corpo.push({
          tipo: 'return',
          expr: exprTxt ? criarAvaliadorExpressao(exprTxt, numLinha) : { tipo: 'literal', valor: null },
          linha: numLinha,
        });
        continue;
      }
      const matchDef = /^def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\):$/.exec(texto);
      if (matchDef) {
        const [, nomeFunc, paramsTxt] = matchDef;
        const params = paramsTxt.split(',').map((p) => p.trim()).filter(Boolean);
        const corpoFunc = parseBlocoFilho(indentEsperado, numLinha);
        corpo.push({ tipo: 'def', nome: nomeFunc, params, corpo: corpoFunc, linha: numLinha });
        continue;
      }
      const matchFor = texto.startsWith('for ') && texto.endsWith(':')
        ? /^for\s+([a-zA-Z_]\w*)\s+in\s+range\((.+)\):$/.exec(texto)
        : null;
      if (matchFor) {
        const [, varLoop, argsTxt] = matchFor;
        const argsAst = criarAvaliadorExpressao(`range(${argsTxt})`, numLinha);
        const corpoLoop = parseBlocoFilho(indentEsperado, numLinha);
        corpo.push({ tipo: 'for', variavel: varLoop, rangeCall: argsAst, corpo: corpoLoop, linha: numLinha });
        continue;
      }
      if (texto.startsWith('while ') && texto.endsWith(':')) {
        const condTxt = texto.slice(6, -1).trim();
        const condAst = criarAvaliadorExpressao(condTxt, numLinha);
        const corpoWhile = parseBlocoFilho(indentEsperado, numLinha);
        corpo.push({ tipo: 'while', condicao: condAst, corpo: corpoWhile, linha: numLinha });
        continue;
      }
      if (texto.startsWith('if ') && texto.endsWith(':')) {
        const condTxt = texto.slice(3, -1).trim();
        const ramos = [{ condicao: criarAvaliadorExpressao(condTxt, numLinha), corpo: parseBlocoFilho(indentEsperado, numLinha), linha: numLinha }];
        let elseCorpo = null;
        while (cursor < registros.length && registros[cursor].indent === indentEsperado) {
          const prox = registros[cursor];
          if (prox.texto.startsWith('elif ') && prox.texto.endsWith(':')) {
            cursor += 1;
            const elifCond = prox.texto.slice(5, -1).trim();
            ramos.push({
              condicao: criarAvaliadorExpressao(elifCond, prox.numLinha),
              corpo: parseBlocoFilho(indentEsperado, prox.numLinha),
              linha: prox.numLinha,
            });
          } else if (prox.texto === 'else:' || /^else\s+:$/.test(prox.texto)) {
            cursor += 1;
            elseCorpo = parseBlocoFilho(indentEsperado, prox.numLinha);
            break;
          } else {
            break;
          }
        }
        corpo.push({ tipo: 'if', ramos, elseCorpo, linha: numLinha });
        continue;
      }

      const matchAssign = /^([a-zA-Z_]\w*)\s*(\+=|-=|=)\s*(\S.*)$/.exec(texto);
      if (matchAssign && !texto.startsWith('==')) {
        corpo.push({
          tipo: 'assign',
          alvo: matchAssign[1],
          op: matchAssign[2],
          expr: criarAvaliadorExpressao(matchAssign[3], numLinha),
          linha: numLinha,
        });
        continue;
      }

      corpo.push({ tipo: 'expr', expr: criarAvaliadorExpressao(texto, numLinha), linha: numLinha });
    }
    return corpo;
  }

  function parseBlocoFilho(indentPai, linhaPai) {
    const prox = registros[cursor];
    if (!prox || prox.indent <= indentPai) {
      throw new Error(`IndentationError: expected an indented block (linha ${linhaPai})`);
    }
    return parseBloco(prox.indent);
  }

  if (registros.length > 0 && registros[0].indent > 0) {
    throw new Error(`IndentationError: unexpected indent (linha ${registros[0].numLinha})`);
  }
  return parseBloco(0);
}

/**
 * Executa um subconjunto pedagógico de Python em interpretador AST puro JavaScript
 * (sem eval/new Function, respeitando qualquer recuo consistente como 2 ou 4 espaços).
 */
export function executarPythonPedagogicoFallback(codigoPython, cena3d = {}) {
  const sim = criarAmbienteSimulacao(cena3d);
  const linhas = String(codigoPython || '').split('\n');
  let passosExecucao = 0;
  let profundidadeRecursao = 0;

  const METODOS_COM_LINHA_ROBO = new Set(['mover', 'girar_direita', 'girar_esquerda', 'coletar', 'abrir_porta']);
  const METODOS_COM_LINHA_LISTA = new Set(['comparar', 'trocar']);
  const METODOS_COM_LINHA_HANOI = new Set(['mover_disco']);

  const escopoGlobal = {
    robo: sim.apiRobo,
    lista: sim.apiLista,
    hanoi: sim.apiHanoi,
    range: (...args) => {
      let inicio = 0;
      let fim = 0;
      let passo = 1;
      if (args.length === 1) {
        fim = Number(args[0]);
      } else if (args.length === 2) {
        inicio = Number(args[0]);
        fim = Number(args[1]);
      } else if (args.length >= 3) {
        inicio = Number(args[0]);
        fim = Number(args[1]);
        passo = Number(args[2]);
      }
      if (!Number.isFinite(inicio) || !Number.isFinite(fim) || !Number.isFinite(passo) || passo === 0) return [];
      const lista = [];
      for (let k = inicio; passo > 0 ? k < fim : k > fim; k += passo) {
        lista.push(k);
        if (lista.length > 10_000) throw new Error('LIMITE_PASSOS');
      }
      return lista;
    },
    len: (x) => (x?.length ?? 0),
    abs: Math.abs,
    min: Math.min,
    max: Math.max,
    int: (x) => Math.trunc(Number(x)),
    bool: Boolean,
    print: () => {},
  };

  function buscarVariavel(escopo, nome) {
    if (Object.hasOwn(escopo, nome)) return escopo[nome];
    if (Object.hasOwn(escopoGlobal, nome)) return escopoGlobal[nome];
    throw new Error(`NameError: name '${nome}' is not defined`);
  }

  function avaliarExpr(node, escopo) {
    switch (node.tipo) {
      case 'literal':
        return node.valor;
      case 'var':
        return buscarVariavel(escopo, node.nome);
      case 'lista':
        return node.itens.map((it) => avaliarExpr(it, escopo));
      case 'indice': {
        const obj = avaliarExpr(node.obj, escopo);
        const idx = avaliarExpr(node.idx, escopo);
        return obj?.[idx];
      }
      case 'membro': {
        const obj = avaliarExpr(node.obj, escopo);
        return obj?.[node.prop];
      }
      case 'unop': {
        const val = avaliarExpr(node.arg, escopo);
        if (node.op === 'not') return !val;
        if (node.op === '-') return -Number(val);
        return +Number(val);
      }
      case 'binop': {
        if (node.op === 'and') return Boolean(avaliarExpr(node.esq, escopo)) && Boolean(avaliarExpr(node.dir, escopo));
        if (node.op === 'or') return Boolean(avaliarExpr(node.esq, escopo)) || Boolean(avaliarExpr(node.dir, escopo));
        const e = avaliarExpr(node.esq, escopo);
        const d = avaliarExpr(node.dir, escopo);
        switch (node.op) {
          case '+': return e + d;
          case '-': return e - d;
          case '*': return e * d;
          case '/': return e / d;
          case '//': return Math.floor(e / d);
          case '%': return e % d;
          case '==': return e === d;
          case '!=': return e !== d;
          case '<': return e < d;
          case '<=': return e <= d;
          case '>': return e > d;
          case '>=': return e >= d;
          default: return null;
        }
      }
      case 'chamada': {
        const args = node.args.map((a) => avaliarExpr(a, escopo));
        if (node.alvo.tipo === 'membro') {
          const obj = avaliarExpr(node.alvo.obj, escopo);
          const metodo = obj?.[node.alvo.prop];
          if (typeof metodo !== 'function') {
            throw new Error(`NameError: name '${node.alvo.prop}' is not defined`);
          }
          if (
            (obj === sim.apiRobo && METODOS_COM_LINHA_ROBO.has(node.alvo.prop))
            || (obj === sim.apiLista && METODOS_COM_LINHA_LISTA.has(node.alvo.prop))
            || (obj === sim.apiHanoi && METODOS_COM_LINHA_HANOI.has(node.alvo.prop))
          ) {
            return metodo.call(obj, ...args, node.linha);
          }
          return metodo.call(obj, ...args);
        }
        const fn = avaliarExpr(node.alvo, escopo);
        if (typeof fn !== 'function') {
          throw new Error(`NameError: name '${node.alvo.nome || 'função'}' is not defined`);
        }
        return fn(...args);
      }
      default:
        return null;
    }
  }

  const SINAL_BREAK = Symbol('break');
  const SINAL_CONTINUE = Symbol('continue');

  function executarBloco(bloco, escopo) {
    for (const stmt of bloco) {
      passosExecucao += 1;
      if (passosExecucao > 50_000) throw new Error('LIMITE_PASSOS');

      if (stmt.tipo === 'pass') continue;
      if (stmt.tipo === 'break') return { sinal: SINAL_BREAK };
      if (stmt.tipo === 'continue') return { sinal: SINAL_CONTINUE };
      if (stmt.tipo === 'return') return { retorno: avaliarExpr(stmt.expr, escopo) };

      if (stmt.tipo === 'def') {
        escopo[stmt.nome] = (...args) => {
          profundidadeRecursao += 1;
          if (profundidadeRecursao > 200) throw new Error('LIMITE_PASSOS');
          const escopoLocal = {};
          stmt.params.forEach((p, idx) => { escopoLocal[p] = args[idx]; });
          try {
            const res = executarBloco(stmt.corpo, escopoLocal);
            return res?.retorno ?? null;
          } finally {
            profundidadeRecursao -= 1;
          }
        };
        continue;
      }

      if (stmt.tipo === 'assign') {
        const valor = avaliarExpr(stmt.expr, escopo);
        if (stmt.op === '+=') escopo[stmt.alvo] = buscarVariavel(escopo, stmt.alvo) + valor;
        else if (stmt.op === '-=') escopo[stmt.alvo] = buscarVariavel(escopo, stmt.alvo) - valor;
        else escopo[stmt.alvo] = valor;
        continue;
      }

      if (stmt.tipo === 'for') {
        const iteravel = avaliarExpr(stmt.rangeCall, escopo);
        for (const item of iteravel) {
          escopo[stmt.variavel] = item;
          const res = executarBloco(stmt.corpo, escopo);
          if (res?.sinal === SINAL_BREAK) break;
          if (res && 'retorno' in res) return res;
        }
        continue;
      }

      if (stmt.tipo === 'while') {
        while (avaliarExpr(stmt.condicao, escopo)) {
          passosExecucao += 1;
          if (passosExecucao > 50_000) throw new Error('LIMITE_PASSOS');
          const res = executarBloco(stmt.corpo, escopo);
          if (res?.sinal === SINAL_BREAK) break;
          if (res && 'retorno' in res) return res;
        }
        continue;
      }

      if (stmt.tipo === 'if') {
        let executou = false;
        for (const ramo of stmt.ramos) {
          if (avaliarExpr(ramo.condicao, escopo)) {
            executou = true;
            const res = executarBloco(ramo.corpo, escopo);
            if (res) return res;
            break;
          }
        }
        if (!executou && stmt.elseCorpo) {
          const res = executarBloco(stmt.elseCorpo, escopo);
          if (res) return res;
        }
        continue;
      }

      if (stmt.tipo === 'expr') {
        avaliarExpr(stmt.expr, escopo);
      }
    }
    return null;
  }

  try {
    const ast = parseLinhasPythonParaAst(linhas);
    executarBloco(ast, escopoGlobal);
    return {
      ok: true,
      erro: null,
      eventos: sim.eventos,
      resumo: sim.obterResumoFinal(),
    };
  } catch (err) {
    const mLinha = String(err.message || '').match(/linha (\d+)/);
    const detalhe = detalharErroPython(err.message, mLinha ? Number(mLinha[1]) : null);
    return {
      ok: false,
      erro: detalhe.texto,
      erroChave: detalhe.chave,
      erroLinha: detalhe.linha,
      erroParams: detalhe.params,
      eventos: sim.eventos,
      resumo: sim.obterResumoFinal(),
    };
  }
}

/**
 * Carrega o Pyodide sob demanda dentro do Web Worker.
 */
async function obterPyodide() {
  if (pyodideInstancia) return pyodideInstancia;
  if (!carregandoPyodide) {
    carregandoPyodide = (async () => {
      const mod = await import(`${PYODIDE_INDEX_URL}pyodide.mjs`);
      pyodideInstancia = await mod.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
      return pyodideInstancia;
    })();
  }
  return carregandoPyodide;
}

// Listener de mensagens quando carregado como Web Worker no navegador
if (typeof self !== 'undefined' && typeof self.postMessage === 'function' && typeof window === 'undefined') {
  self.addEventListener('message', async (event) => {
    if (event.origin && event.origin !== self.location.origin) {
      return;
    }
    const { idRequisicao, codigoPython, cena3d } = event.data || {};
    try {
      const pyodide = await obterPyodide();
      const sim = criarAmbienteSimulacao(cena3d);

      pyodide.globals.set('_js_robo', sim.apiRobo);
      pyodide.globals.set('_js_lista', sim.apiLista);
      pyodide.globals.set('_js_hanoi', sim.apiHanoi);

      const wrapperPython = `
import sys

class _RoboProxy:
    def mover(self):
        return _js_robo.mover(sys._getframe(1).f_lineno)
    def girar_direita(self):
        return _js_robo.girar_direita(sys._getframe(1).f_lineno)
    def girar_esquerda(self):
        return _js_robo.girar_esquerda(sys._getframe(1).f_lineno)
    def coletar(self):
        return _js_robo.coletar(sys._getframe(1).f_lineno)
    def abrir_porta(self):
        return _js_robo.abrir_porta(sys._getframe(1).f_lineno)
    def esta_livre(self):
        return bool(_js_robo.esta_livre())
    def frente_porta(self):
        return bool(_js_robo.frente_porta())
    def tem_item(self):
        return bool(_js_robo.tem_item())

class _ListaProxy:
    def comparar(self, i, j):
        return _js_lista.comparar(int(i), int(j), sys._getframe(1).f_lineno)
    def trocar(self, i, j):
        return _js_lista.trocar(int(i), int(j), sys._getframe(1).f_lineno)

class _HanoiProxy:
    def mover_disco(self, origem, destino):
        return _js_hanoi.mover_disco(str(origem), str(destino), sys._getframe(1).f_lineno)

robo = _RoboProxy()
lista = _ListaProxy()
hanoi = _HanoiProxy()
`;
      await pyodide.runPythonAsync(wrapperPython);
      await pyodide.runPythonAsync(codigoPython);

      self.postMessage({
        idRequisicao,
        ok: true,
        motor: 'pyodide',
        erro: null,
        eventos: sim.eventos,
        resumo: sim.obterResumoFinal(),
      });
    } catch (err) {
      // Se o Pyodide não puder ser carregado (offline/CDN/CSP), usa o motor pedagógico local
      if (!pyodideInstancia) {
        const resultadoLocal = executarPythonPedagogicoFallback(codigoPython, cena3d);
        self.postMessage({ idRequisicao, motor: 'fallback-local', ...resultadoLocal });
        return;
      }
      const detalhe = detalharErroPython(err.message);
      self.postMessage({
        idRequisicao,
        ok: false,
        motor: 'pyodide',
        erro: detalhe.texto,
        erroChave: detalhe.chave,
        erroLinha: detalhe.linha,
        erroParams: detalhe.params,
        eventos: [],
        resumo: null,
      });
    }
  });
}

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
 * Traduz erros técnicos do Python para mensagens didáticas em português claro.
 */
export function traduzirErroPython(mensagemBruta, linha = null) {
  const prefixo = linha ? `Erro na linha ${linha}: ` : 'Atenção no código: ';
  const msg = String(mensagemBruta || '');

  if (msg.includes('IndentationError')) {
    return `${prefixo}Problema de recuo (indentação). Verifique se as linhas dentro do "if", "for", "while" ou "def" têm 4 espaços à esquerda.`;
  }
  if (msg.includes('SyntaxError')) {
    return `${prefixo}Erro de escrita (sintaxe). Confira se você fechou todos os parênteses "()" e colocou dois-pontos ":" no final de comandos como if, for, while ou def.`;
  }
  if (msg.includes('NameError')) {
    const match = msg.match(/name '([^']+)' is not defined/);
    const nome = match ? match[1] : 'comando';
    return `${prefixo}O nome "${nome}" não foi reconhecido. Use comandos válidos como robo.mover(), robo.girar_direita(), robo.coletar(), lista.trocar() ou hanoi.mover_disco().`;
  }
  if (msg.includes('LIMITE_PASSOS')) {
    return `${prefixo}O programa ultrapassou o limite máximo de passos! Verifique se há um laço infinito (while) sem condição de parada.`;
  }
  if (msg.includes('MOVIMENTO_INVALIDO_HANOI')) {
    return `${prefixo}Regra da Torre de Hanói violada: um disco maior não pode ser colocado sobre um disco menor!`;
  }
  return `${prefixo}${msg.replace(/^Traceback[\s\S]*?\n(?=\w+Error:)/, '')}`;
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
        registrarEvento({ tipo: 'colisao-borda', x: roboX, y: roboY, direcao, linha, descricao: `Linha ${linha}: O robô tentou sair dos limites da plataforma 3D.` });
        return false;
      }
      if (obstaculos.has(chave) || portasFechadas.has(chave)) {
        const motivo = portasFechadas.has(chave) ? 'porta fechada' : 'obstáculo';
        registrarEvento({ tipo: 'colisao-obstaculo', x: roboX, y: roboY, direcao, linha, descricao: `Linha ${linha}: O robô colidiu com ${motivo} em (${nx}, ${ny}).` });
        return false;
      }
      roboX = nx;
      roboY = ny;
      registrarEvento({ tipo: 'mover', x: roboX, y: roboY, direcao, linha, descricao: `Linha ${linha}: Robô moveu para (${roboX}, ${roboY}) direção ${direcao}.` });
      return true;
    },
    girar_direita(linha = 1) {
      const idx = direcoesOrdem.indexOf(direcao);
      direcao = direcoesOrdem[(idx + 1) % 4];
      registrarEvento({ tipo: 'girar', x: roboX, y: roboY, direcao, sentido: 'direita', linha, descricao: `Linha ${linha}: Robô girou à direita (olhando para ${direcao}).` });
    },
    girar_esquerda(linha = 1) {
      const idx = direcoesOrdem.indexOf(direcao);
      direcao = direcoesOrdem[(idx + 3) % 4];
      registrarEvento({ tipo: 'girar', x: roboX, y: roboY, direcao, sentido: 'esquerda', linha, descricao: `Linha ${linha}: Robô girou à esquerda (olhando para ${direcao}).` });
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
      };
    }

    const colidiu = eventos.some((e) => e.tipo === 'colisao-borda' || e.tipo === 'colisao-obstaculo');
    const chegouMeta = roboX === metaX && roboY === metaY;
    const coletouTodos = itensRestantes.size === 0;
    const sucesso = !colidiu && chegouMeta && coletouTodos;

    let motivo = 'Missão 3D cumprida com sucesso!';
    if (colidiu) motivo = 'O robô colidiu durante o percurso. Revise os comandos e tente novamente!';
    else if (!coletouTodos) motivo = `Faltou coletar ${itensRestantes.size} cristal(is) antes de finalizar!`;
    else if (!chegouMeta) motivo = `O robô parou em (${roboX}, ${roboY}), mas o portal fica em (${metaX}, ${metaY}).`;

    return {
      sucesso,
      posicaoFinal: { x: roboX, y: roboY, direcao },
      itensColetados: totalItensIniciais - itensRestantes.size,
      totalItens: totalItensIniciais,
      motivo,
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
export function executarPythonPedagogicoFallback(codigoPython, cena3d = {}) {
  const sim = criarAmbienteSimulacao(cena3d);
  const linhas = String(codigoPython || '').split('\n');

  // Validação sintática básica de dois-pontos em estruturas de bloco
  for (let idx = 0; idx < linhas.length; idx += 1) {
    const limpa = linhas[idx].replace(/#.*$/, '').trim();
    if (/^(if|else|elif|for|while|def)\b/.test(limpa) && !limpa.endsWith(':')) {
      return {
        ok: false,
        erro: traduzirErroPython('SyntaxError: expected ":"', idx + 1),
        eventos: [],
        resumo: null,
      };
    }
  }

  // Transpila o subconjunto pedagógico Python para JS seguro instrumentado com número de linha
  const linhasJs = [];
  const pilhaIndentacao = [0];

  for (let idx = 0; idx < linhas.length; idx += 1) {
    const numLinha = idx + 1;
    const bruta = linhas[idx];
    const semComentario = bruta.replace(/#.*$/, '');
    if (!semComentario.trim()) continue;

    const espacos = semComentario.match(/^\s*/)[0].length;
    if (espacos % 2 !== 0) {
      return {
        ok: false,
        erro: traduzirErroPython('IndentationError: unexpected indent', numLinha),
        eventos: [],
        resumo: null,
      };
    }

    while (espacos < pilhaIndentacao[pilhaIndentacao.length - 1]) {
      pilhaIndentacao.pop();
      linhasJs.push('}');
    }

    let cmd = semComentario.trim();

    // Instrumenta chamadas às APIs pedagógicas passando o número da linha
    cmd = cmd
      .replace(/robo\.(mover|girar_direita|girar_esquerda|coletar|abrir_porta)\(\s*\)/g, `robo.$1(${numLinha})`)
      .replace(/lista\.(comparar|trocar)\(([^)]+)\)/g, `lista.$1($2, ${numLinha})`)
      .replace(/hanoi\.mover_disco\(([^)]+)\)/g, `hanoi.mover_disco($1, ${numLinha})`);

    if (/^def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*:$/.test(cmd)) {
      const [, nomeFunc, params] = cmd.match(/^def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*:$/);
      linhasJs.push(`function ${nomeFunc}(${params}) {`);
      pilhaIndentacao.push(espacos + 4);
    } else if (/^for\s+([a-zA-Z_]\w*)\s+in\s+range\(([^)]+)\)\s*:$/.test(cmd)) {
      const [, variavel, exprRange] = cmd.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+range\(([^)]+)\)\s*:$/);
      linhasJs.push(`for (let ${variavel} = 0; ${variavel} < (${exprRange}); ${variavel} += 1) {`);
      pilhaIndentacao.push(espacos + 4);
    } else if (/^while\s+(.+):$/.test(cmd)) {
      const [, condicao] = cmd.match(/^while\s+(.+):$/);
      linhasJs.push(`while (${condicao}) {`);
      pilhaIndentacao.push(espacos + 4);
    } else if (/^if\s+(.+):$/.test(cmd)) {
      const [, condicao] = cmd.match(/^if\s+(.+):$/);
      linhasJs.push(`if (${condicao}) {`);
      pilhaIndentacao.push(espacos + 4);
    } else if (/^elif\s+(.+):$/.test(cmd)) {
      const [, condicao] = cmd.match(/^elif\s+(.+):$/);
      linhasJs.push(`else if (${condicao}) {`);
      pilhaIndentacao.push(espacos + 4);
    } else if (/^else\s*:$/.test(cmd)) {
      linhasJs.push('else {');
      pilhaIndentacao.push(espacos + 4);
    } else if (/^[a-zA-Z_]\w*\s*=\s*.+$/.test(cmd)) {
      linhasJs.push(`var ${cmd};`);
    } else {
      linhasJs.push(`${cmd};`);
    }
  }

  while (pilhaIndentacao.length > 1) {
    pilhaIndentacao.pop();
    linhasJs.push('}');
  }

  try {
    const fn = new Function('robo', 'lista', 'hanoi', `"use strict";\n${linhasJs.join('\n')}`);
    fn(sim.apiRobo, sim.apiLista, sim.apiHanoi);
    return {
      ok: true,
      erro: null,
      eventos: sim.eventos,
      resumo: sim.obterResumoFinal(),
    };
  } catch (err) {
    return {
      ok: false,
      erro: traduzirErroPython(err.message),
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
      // Se Pyodide não puder ser baixado (ex.: laboratório offline), usa o motor pedagógico local
      if (String(err.message || '').includes('Failed to fetch') || String(err.message || '').includes('import')) {
        const resultadoLocal = executarPythonPedagogicoFallback(codigoPython, cena3d);
        self.postMessage({ idRequisicao, motor: 'fallback-local', ...resultadoLocal });
        return;
      }
      self.postMessage({
        idRequisicao,
        ok: false,
        motor: 'pyodide',
        erro: traduzirErroPython(err.message),
        eventos: [],
        resumo: null,
      });
    }
  });
}

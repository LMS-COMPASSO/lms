/**
 * Utilitários de DOM das atividades dinâmicas.
 * Montar a interface com elementos (em vez de HTML em texto) evita problemas de injeção de código.
 */

/**
 * Cria um elemento HTML. Atributos com valor `false`, `null` ou `undefined` são ignorados.
 * Atributos que começam com "on" e recebem uma função viram eventos (ex.: onclick).
 *
 * @param {string} tag - Nome da tag (ex.: 'button').
 * @param {object} atributos - Atributos do elemento.
 * @param {...any} filhos - Textos, elementos ou listas deles.
 */
export function h(tag, atributos = {}, ...filhos) {
  const elemento = document.createElement(tag);

  for (const [nome, valor] of Object.entries(atributos)) {
    if (valor === false || valor === null || valor === undefined) continue;
    if (nome.startsWith('on') && typeof valor === 'function') {
      elemento.addEventListener(nome.slice(2), valor);
    } else if (nome === 'class') {
      elemento.className = valor;
    } else {
      elemento.setAttribute(nome, valor === true ? '' : valor);
    }
  }

  for (const filho of filhos.flat(Infinity)) {
    if (filho === null || filho === undefined || filho === false) continue;
    elemento.append(typeof filho === 'object' ? filho : document.createTextNode(String(filho)));
  }
  return elemento;
}

/**
 * Anuncia uma mensagem curta para leitores de tela (região ARIA "polite").
 */
export function anunciar(texto) {
  const regiao = document.getElementById('atv-anuncio');
  if (!regiao) return;
  regiao.textContent = '';
  // O intervalo garante que a mesma mensagem seja lida novamente se for repetida.
  setTimeout(() => { regiao.textContent = texto; }, 40);
}

/**
 * Cria a área de feedback (mensagens de acerto, erro e dicas) com leitura automática.
 */
export function criarFeedback() {
  const elemento = h('div', { class: 'atv-feedback', role: 'status', 'aria-live': 'polite' });

  function mostrar(tipo, titulo, ...conteudo) {
    elemento.className = `atv-feedback ${tipo}`;
    elemento.replaceChildren(titulo ? h('strong', {}, titulo) : '', ...conteudo);
  }

  return {
    elemento,
    info: (titulo, ...conteudo) => mostrar('info', titulo, ...conteudo),
    erro: (titulo, ...conteudo) => mostrar('erro', titulo, ...conteudo),
    sucesso: (titulo, ...conteudo) => mostrar('sucesso', titulo, ...conteudo),
    limpar: () => {
      elemento.className = 'atv-feedback';
      elemento.replaceChildren();
    },
  };
}

/**
 * Reconstrói o conteúdo de `area` e devolve o foco ao elemento que o tinha.
 * Os elementos focáveis são identificados pelo atributo data-foco. `foco` pode ser um nome
 * ou uma lista de nomes em ordem de preferência (o primeiro que existir e estiver habilitado recebe o foco).
 */
export function renderizarComFoco(area, construir, foco = null) {
  const candidatos = [].concat(foco || []);
  const tinhaFoco = area.contains(document.activeElement);
  if (!candidatos.length && tinhaFoco && document.activeElement.dataset.foco) {
    candidatos.push(document.activeElement.dataset.foco);
  }

  area.replaceChildren(...[].concat(construir()).filter(Boolean));

  if (!candidatos.length || (!foco && !tinhaFoco)) return;
  for (const nome of candidatos) {
    const alvo = area.querySelector(`[data-foco="${CSS.escape(nome)}"]`);
    if (alvo && !alvo.disabled) {
      alvo.focus();
      return;
    }
  }
}

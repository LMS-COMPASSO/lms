/**
 * ============================================================================
 * LMS COMPASSO - JOGADOR DO SIMULADOR DE BLOCOS (FUNDAMENTAL II)
 * ============================================================================
 * Interface gráfica interativa de programação em blocos (tipo Scratch/Blockly).
 * Permite que estudantes montem algoritmos visuais, executem no palco Canvas com
 * animação em tempo real e visualizem a correspondência em código textual.
 * ============================================================================
 */

import { anunciar, criarFeedback, h } from './dom.js';
import { tocarSom, criarBotaoSom } from './som.js';

export function jogadorBlocos(atividade, ctx) {
  let tentativas = 0;
  let executando = false;
  let verCodigo = false;
  let velocidade = 350; // ms por passo

  // Estrutura do programa do aluno: lista de nós de comandos
  // Cada nó: { id: string, tipo: string, vezes?: number, filhos?: Array }
  let programa = [];

  const feedback = criarFeedback();

  // Elementos da interface
  const painelWorkspace = h('div', { class: 'blocos-workspace' });
  const painelCodigo = h('div', { class: 'blocos-codigo-preview oculto' });
  const canvasPalco = h('canvas', { width: 380, height: 320, class: 'blocos-canvas' });
  const balaoFala = h('div', { class: 'blocos-balao-fala oculto' });

  // Estado da simulação
  let estadoSimulacao = resetarEstadoSimulacao();

  function resetarEstadoSimulacao() {
    if (atividade.meta.tipo === 'labirinto') {
      const ini = atividade.meta.inicio;
      return {
        x: ini.x,
        y: ini.y,
        dir: ini.dir, // 'N', 'L', 'S', 'O'
        passos: [],
        bateu: false,
        sucesso: false,
        fala: '',
      };
    }

    // Modo desenho / geometria (turtle)
    return {
      x: 190,
      y: 190,
      angulo: 0, // 0 = para cima, 90 = direita, 180 = baixo, 270 = esquerda
      caminho: [{ x: 190, y: 190 }],
      cor: '#2563eb',
      canetaBaixa: true,
      ladosContados: 0,
      figuraFechada: false,
      fala: '',
    };
  }

  // Desenho inicial do palco
  desenharPalco();

  function desenharPalco(focoComandoId = null) {
    const ctxCanvas = canvasPalco.getContext('2d');
    if (!ctxCanvas) return;

    ctxCanvas.clearRect(0, 0, canvasPalco.width, canvasPalco.height);

    if (atividade.meta.tipo === 'labirinto') {
      desenharLabirinto(ctxCanvas);
    } else {
      desenharGeometria(ctxCanvas);
    }

    // Atualiza balão de fala se houver
    if (estadoSimulacao.fala) {
      balaoFala.textContent = `💬 ${estadoSimulacao.fala}`;
      balaoFala.classList.remove('oculto');
    } else {
      balaoFala.classList.add('oculto');
    }
  }

  function desenharLabirinto(ctx2d) {
    const { grade, alvo } = atividade.meta;
    const linhas = grade.length;
    const colunas = grade[0].length;
    const tam = Math.min(canvasPalco.width / colunas, canvasPalco.height / linhas);
    const offsetX = (canvasPalco.width - colunas * tam) / 2;
    const offsetY = (canvasPalco.height - linhas * tam) / 2;

    for (let r = 0; r < linhas; r++) {
      for (let c = 0; c < colunas; c++) {
        const cel = grade[r][c];
        const px = offsetX + c * tam;
        const py = offsetY + r * tam;

        ctx2d.strokeStyle = '#cbd5e1';
        ctx2d.strokeRect(px, py, tam, tam);

        if (cel === 'X') {
          ctx2d.fillStyle = '#64748b';
          ctx2d.fillRect(px + 2, py + 2, tam - 4, tam - 4);
          ctx2d.fillStyle = '#ffffff';
          ctx2d.font = '18px sans-serif';
          ctx2d.textAlign = 'center';
          ctx2d.textBaseline = 'middle';
          ctx2d.fillText('🧱', px + tam / 2, py + tam / 2);
        } else if (r === alvo.y && c === alvo.x) {
          ctx2d.fillStyle = '#fef3c7';
          ctx2d.fillRect(px + 2, py + 2, tam - 4, tam - 4);
          ctx2d.fillStyle = '#d97706';
          ctx2d.font = '22px sans-serif';
          ctx2d.textAlign = 'center';
          ctx2d.textBaseline = 'middle';
          ctx2d.fillText('🎯', px + tam / 2, py + tam / 2);
        } else {
          ctx2d.fillStyle = '#f8fafc';
          ctx2d.fillRect(px + 1, py + 1, tam - 2, tam - 2);
        }
      }
    }

    // Desenha o robô
    const robX = offsetX + estadoSimulacao.x * tam + tam / 2;
    const robY = offsetY + estadoSimulacao.y * tam + tam / 2;
    ctx2d.font = '24px sans-serif';
    ctx2d.textAlign = 'center';
    ctx2d.textBaseline = 'middle';
    ctx2d.fillText('🤖', robX, robY);
  }

  function desenharGeometria(ctx2d) {
    // Grade de fundo suave
    ctx2d.strokeStyle = '#f1f5f9';
    ctx2d.lineWidth = 1;
    for (let x = 0; x < canvasPalco.width; x += 20) {
      ctx2d.beginPath();
      ctx2d.moveTo(x, 0);
      ctx2d.lineTo(x, canvasPalco.height);
      ctx2d.stroke();
    }
    for (let y = 0; y < canvasPalco.height; y += 20) {
      ctx2d.beginPath();
      ctx2d.moveTo(0, y);
      ctx2d.lineTo(canvasPalco.width, y);
      ctx2d.stroke();
    }

    // Desenha as linhas traçadas pelo robô
    if (estadoSimulacao.caminho && estadoSimulacao.caminho.length > 1) {
      ctx2d.beginPath();
      ctx2d.strokeStyle = estadoSimulacao.cor || '#2563eb';
      ctx2d.lineWidth = 4;
      ctx2d.lineCap = 'round';
      ctx2d.lineJoin = 'round';

      ctx2d.moveTo(estadoSimulacao.caminho[0].x, estadoSimulacao.caminho[0].y);
      for (let i = 1; i < estadoSimulacao.caminho.length; i++) {
        ctx2d.lineTo(estadoSimulacao.caminho[i].x, estadoSimulacao.caminho[i].y);
      }
      ctx2d.stroke();
    }

    // Desenha o robô/tartaruga com orientação
    ctx2d.save();
    ctx2d.translate(estadoSimulacao.x, estadoSimulacao.y);
    ctx2d.rotate((estadoSimulacao.angulo * Math.PI) / 180);

    // Corpo do robô
    ctx2d.fillStyle = '#3b82f6';
    ctx2d.beginPath();
    ctx2d.arc(0, 0, 10, 0, Math.PI * 2);
    ctx2d.fill();

    // Nariz / ponteiro para indicar direção
    ctx2d.fillStyle = '#ef4444';
    ctx2d.beginPath();
    ctx2d.moveTo(0, -14);
    ctx2d.lineTo(5, -6);
    ctx2d.lineTo(-5, -6);
    ctx2d.closePath();
    ctx2d.fill();

    ctx2d.restore();
  }

  // Gera código textual em JavaScript a partir dos blocos
  function gerarCodigoTexto(comandos, nivel = 0) {
    const ident = '  '.repeat(nivel);
    let texto = '';

    for (const b of comandos) {
      if (b.tipo === 'avancar') {
        texto += `${ident}avancar(60);\n`;
      } else if (b.tipo === 'avancar_longo') {
        texto += `${ident}avancar(80);\n`;
      } else if (b.tipo === 'girar_direita') {
        texto += `${ident}girarDireita(90);\n`;
      } else if (b.tipo === 'girar_esquerda') {
        texto += `${ident}girarEsquerda(90);\n`;
      } else if (b.tipo === 'girar_estrela') {
        texto += `${ident}girarDireita(144);\n`;
      } else if (b.tipo === 'repetir') {
        const vezes = b.vezes || 4;
        texto += `${ident}for (let i = 0; i < ${vezes}; i++) {\n`;
        texto += gerarCodigoTexto(b.filhos || [], nivel + 1);
        texto += `${ident}}\n`;
      } else if (b.tipo === 'se_livre') {
        texto += `${ident}if (caminhoAFrenteLivre()) {\n`;
        texto += gerarCodigoTexto(b.filhos || [], nivel + 1);
        texto += `${ident}}\n`;
      } else if (b.tipo === 'mudar_cor') {
        texto += `${ident}mudarCorAleatoria();\n`;
      } else if (b.tipo === 'falar') {
        texto += `${ident}falar("Cheguei!");\n`;
      }
    }
    return texto;
  }

  function atualizarListaWorkspace() {
    painelWorkspace.replaceChildren();

    if (programa.length === 0) {
      painelWorkspace.appendChild(
        h('div', { class: 'blocos-vazio' },
          h('span', { class: 'material-symbols-outlined' }, 'drag_indicator'),
          h('p', {}, 'Clique nos blocos ao lado para adicionar ao seu programa.'),
        ),
      );
    } else {
      const listaEl = h('div', { class: 'blocos-lista' });
      programa.forEach((cmd, idx) => {
        listaEl.appendChild(criarElementoBloco(cmd, programa, idx));
      });
      painelWorkspace.appendChild(listaEl);
    }

    painelCodigo.textContent = `// Código JavaScript gerado pelo seu algoritmo:\n\n${gerarCodigoTexto(programa) || '// Adicione blocos para ver o código.'}`;
  }

  function criarElementoBloco(cmd, listaMae, idx) {
    const modelo = atividade.blocosDisponiveis.find((b) => b.id === cmd.tipo);
    const cor = modelo?.cor || '#3b82f6';

    const el = h('div', { class: 'bloco-item', style: `--bloco-cor: ${cor}` });

    const topo = h('div', { class: 'bloco-topo' });
    topo.appendChild(h('span', { class: 'bloco-rotulo' }, modelo?.rotulo || cmd.tipo));

    if (cmd.tipo === 'repetir') {
      const inputVezes = h('input', {
        type: 'number',
        min: '1',
        max: '12',
        value: cmd.vezes || 4,
        class: 'bloco-input-vezes',
        onchange: (e) => {
          cmd.vezes = Math.max(1, Math.min(12, Number(e.target.value) || 1));
          atualizarListaWorkspace();
        },
      });
      topo.appendChild(h('span', { class: 'bloco-vezes-wrap' }, 'repetir ', inputVezes, ' vezes:'));
    }

    const acoes = h('div', { class: 'bloco-acoes' });

    // Botão subir
    if (idx > 0) {
      acoes.appendChild(h('button', {
        class: 'btn-bloco-acao',
        title: 'Mover para cima',
        onclick: () => {
          tocarSom('mover');
          [listaMae[idx - 1], listaMae[idx]] = [listaMae[idx], listaMae[idx - 1]];
          atualizarListaWorkspace();
        },
      }, '▲'));
    }

    // Botão descer
    if (idx < listaMae.length - 1) {
      acoes.appendChild(h('button', {
        class: 'btn-bloco-acao',
        title: 'Mover para baixo',
        onclick: () => {
          tocarSom('mover');
          [listaMae[idx + 1], listaMae[idx]] = [listaMae[idx], listaMae[idx + 1]];
          atualizarListaWorkspace();
        },
      }, '▼'));
    }

    // Botão remover
    acoes.appendChild(h('button', {
      class: 'btn-bloco-remover',
      title: 'Excluir bloco',
      onclick: () => {
        tocarSom('click');
        listaMae.splice(idx, 1);
        atualizarListaWorkspace();
      },
    }, '✕'));

    topo.appendChild(acoes);
    el.appendChild(topo);

    // Se for contêiner (ex: repetir, se_livre)
    if (modelo?.comFilhos) {
      const filhosWrap = h('div', { class: 'bloco-filhos' });
      cmd.filhos = cmd.filhos || [];

      if (cmd.filhos.length === 0) {
        filhosWrap.appendChild(h('p', { class: 'bloco-filhos-vazio' }, 'Encaixe blocos aqui dentro:'));
      } else {
        cmd.filhos.forEach((filhoCmd, fIdx) => {
          filhosWrap.appendChild(criarElementoBloco(filhoCmd, cmd.filhos, fIdx));
        });
      }

      // Seletor para adicionar bloco filho diretamente
      const seletorFilho = h('div', { class: 'bloco-adicionar-filho' });
      atividade.blocosDisponiveis.filter((b) => !b.comFilhos).forEach((bDisp) => {
        seletorFilho.appendChild(h('button', {
          class: 'btn-adicionar-mini',
          style: `--btn-mini-cor: ${bDisp.cor}`,
          onclick: () => {
            cmd.filhos.push({ id: `cmd-${Date.now()}-${Math.random()}`, tipo: bDisp.id });
            atualizarListaWorkspace();
          },
        }, `+ ${bDisp.rotulo}`));
      });

      filhosWrap.appendChild(seletorFilho);
      el.appendChild(filhosWrap);
    }

    return el;
  }

  // Execução do algoritmo passo a passo
  async function executarAlgoritmo() {
    if (executando) return;
    if (programa.length === 0) {
      feedback.erro('Programa vazio', 'Adicione blocos ao seu programa antes de executar.');
      anunciar('Programa vazio. Adicione blocos para começar.');
      return;
    }

    executando = true;
    tentativas += 1;
    feedback.limpar();
    estadoSimulacao = resetarEstadoSimulacao();
    desenharPalco();

    // Achata a lista de comandos para execução respeitando loops
    const passos = achatarComandos(programa);

    let teveErro = false;
    for (const passo of passos) {
      if (!executando) break;

      executarPassoIndividual(passo);
      desenharPalco(passo.id);

      if (passo.tipo === 'avancar') tocarSom('passo');
      else if (passo.tipo && passo.tipo.startsWith('girar')) tocarSom('giro');

      if (estadoSimulacao.bateu) {
        teveErro = true;
        tocarSom('erro');
        if (typeof window !== 'undefined' && window.gsap) {
          window.gsap.to(canvasPalco, { x: -6, repeat: 4, yoyo: true, duration: 0.05, clearProps: 'x' });
        }
        feedback.erro('Colisão!', 'O robô bateu em um obstáculo. Reveja seu caminho e tente novamente.');
        break;
      }

      await new Promise((r) => setTimeout(r, velocidade));
    }

    executando = false;

    // Avaliação do objetivo
    if (!teveErro) {
      avaliarSucesso();
    }
  }

  function achatarComandos(lista) {
    const resultado = [];
    for (const c of lista) {
      if (c.tipo === 'repetir') {
        const n = c.vezes || 4;
        for (let i = 0; i < n; i++) {
          resultado.push(...achatarComandos(c.filhos || []));
        }
      } else if (c.tipo === 'se_livre') {
        // Avalia condição no labirinto
        if (caminhoLivreAFrente()) {
          resultado.push(...achatarComandos(c.filhos || []));
        }
      } else {
        resultado.push(c);
      }
    }
    return resultado;
  }

  function caminhoLivreAFrente() {
    if (atividade.meta.tipo !== 'labirinto') return true;
    const { grade } = atividade.meta;
    let nx = estadoSimulacao.x;
    let ny = estadoSimulacao.y;

    if (estadoSimulacao.dir === 'L') nx += 1;
    if (estadoSimulacao.dir === 'O') nx -= 1;
    if (estadoSimulacao.dir === 'N') ny -= 1;
    if (estadoSimulacao.dir === 'S') ny += 1;

    if (ny < 0 || ny >= grade.length || nx < 0 || nx >= grade[0].length) return false;
    return grade[ny][nx] !== 'X';
  }

  function executarPassoIndividual(passo) {
    if (atividade.meta.tipo === 'labirinto') {
      executarPassoLabirinto(passo);
    } else {
      executarPassoGeometria(passo);
    }
  }

  function executarPassoLabirinto(passo) {
    const { grade } = atividade.meta;
    if (passo.tipo === 'avancar') {
      let nx = estadoSimulacao.x;
      let ny = estadoSimulacao.y;

      if (estadoSimulacao.dir === 'L') nx += 1;
      if (estadoSimulacao.dir === 'O') nx -= 1;
      if (estadoSimulacao.dir === 'N') ny -= 1;
      if (estadoSimulacao.dir === 'S') ny += 1;

      if (ny < 0 || ny >= grade.length || nx < 0 || nx >= grade[0].length || grade[ny][nx] === 'X') {
        estadoSimulacao.bateu = true;
      } else {
        estadoSimulacao.x = nx;
        estadoSimulacao.y = ny;
      }
    } else if (passo.tipo === 'girar_direita') {
      const dirs = ['N', 'L', 'S', 'O'];
      const cur = dirs.indexOf(estadoSimulacao.dir);
      estadoSimulacao.dir = dirs[(cur + 1) % 4];
    } else if (passo.tipo === 'girar_esquerda') {
      const dirs = ['N', 'L', 'S', 'O'];
      const cur = dirs.indexOf(estadoSimulacao.dir);
      estadoSimulacao.dir = dirs[(cur + 3) % 4];
    } else if (passo.tipo === 'falar') {
      estadoSimulacao.fala = 'Cheguei ao meu destino!';
    }
  }

  function executarPassoGeometria(passo) {
    if (passo.tipo === 'avancar' || passo.tipo === 'avancar_longo') {
      const dist = passo.tipo === 'avancar_longo' ? 80 : 60;
      const rad = ((estadoSimulacao.angulo - 90) * Math.PI) / 180;
      const nx = estadoSimulacao.x + Math.cos(rad) * dist;
      const ny = estadoSimulacao.y + Math.sin(rad) * dist;

      estadoSimulacao.x = nx;
      estadoSimulacao.y = ny;
      estadoSimulacao.caminho.push({ x: nx, y: ny });
      estadoSimulacao.ladosContados += 1;
    } else if (passo.tipo === 'girar_direita') {
      estadoSimulacao.angulo = (estadoSimulacao.angulo + 90) % 360;
    } else if (passo.tipo === 'girar_esquerda') {
      estadoSimulacao.angulo = (estadoSimulacao.angulo + 270) % 360;
    } else if (passo.tipo === 'girar_estrela') {
      estadoSimulacao.angulo = (estadoSimulacao.angulo + 144) % 360;
    } else if (passo.tipo === 'mudar_cor') {
      const cores = ['#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
      estadoSimulacao.cor = cores[Math.floor(Math.random() * cores.length)];
    } else if (passo.tipo === 'falar') {
      estadoSimulacao.fala = 'Desenho finalizado!';
    }
  }

  function avaliarSucesso() {
    const meta = atividade.meta;

    if (meta.tipo === 'labirinto') {
      if (estadoSimulacao.x === meta.alvo.x && estadoSimulacao.y === meta.alvo.y) {
        finalizarComVitoria(3);
      } else {
        feedback.info('Quase lá!', 'O robô não colidiu, mas ainda não chegou ao alvo 🎯. Tente estender o programa.');
      }
      return;
    }

    if (meta.tipo === 'desenho') {
      // Checa se usou laço se exigido
      const temLoop = programa.some((p) => p.tipo === 'repetir' && p.filhos?.length > 0);
      if (meta.exigirLoop && !temLoop) {
        feedback.info('Boa tentativa!', 'Você desenhou, mas a missão exige usar o bloco "Repetir [N] vezes" para tornar o código conciso e elegante.');
        return;
      }

      // Checa número de lados traçados
      if (estadoSimulacao.ladosContados >= meta.lados) {
        const estrelas = tentativas <= 2 ? 3 : (tentativas <= 4 ? 2 : 1);
        finalizarComVitoria(estrelas);
      } else {
        feedback.info('Desenho incompleto', `O robô traçou ${estadoSimulacao.ladosContados} lados, mas a figura exige ${meta.lados}.`);
      }
    }
  }

  async function finalizarComVitoria(estrelas) {
    tocarSom('vitoria');
    if (typeof window !== 'undefined' && window.gsap) {
      window.gsap.fromTo(canvasPalco, { scale: 0.95 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
    }
    feedback.sucesso('Missão Concluída! ⭐⭐⭐', atividade.conclusao);
    anunciar(`Parabéns! ${atividade.conclusao}`);

    // Registra a conclusão e o desempenho da habilidade na API se houver usuário
    try {
      if (window.api) {
        await window.api('/gamificacao/concluir-atividade', {
          method: 'POST',
          body: JSON.stringify({
            atividadeId: atividade.id,
            habilidades: atividade.habilidades,
            pontuacao: estrelas === 3 ? 10.0 : (estrelas === 2 ? 8.5 : 7.0),
          }),
        });
      }
    } catch {
      // Ignora erro offline
    }

    if (ctx && typeof ctx.aoConcluir === 'function') {
      ctx.aoConcluir({ tentativas, estrelas });
    }
  }

  // Montagem do painel de blocos disponíveis (Paleta)
  const paletaEl = h('div', { class: 'blocos-paleta' });
  paletaEl.appendChild(h('h3', { class: 'blocos-secao-titulo' }, 'Paleta de Blocos'));

  const categorias = [
    { id: 'movimento', titulo: 'Movimento' },
    { id: 'controle', titulo: 'Controle e Laços' },
    { id: 'aparencia', titulo: 'Aparência e Arte' },
  ];

  for (const cat of categorias) {
    const itens = atividade.blocosDisponiveis.filter((b) => b.categoria === cat.id);
    if (itens.length === 0) continue;

    const grupo = h('div', { class: 'blocos-grupo' });
    grupo.appendChild(h('h4', { class: 'blocos-cat-titulo' }, cat.titulo));

    itens.forEach((b) => {
      grupo.appendChild(h('button', {
        class: 'btn-bloco-paleta',
        style: `--bloco-cor: ${b.cor}`,
        onclick: () => {
          tocarSom('bloco');
          programa.push({
            id: `cmd-${Date.now()}-${Math.random()}`,
            tipo: b.id,
            vezes: b.padraoVezes || 4,
            filhos: b.comFilhos ? [] : undefined,
          });
          atualizarListaWorkspace();
        },
      }, b.rotulo));
    });

    paletaEl.appendChild(grupo);
  }

  // Barra de ferramentas superior
  const barraTopo = h('div', { class: 'blocos-barra-topo' },
    h('div', { class: 'blocos-controles' },
      h('button', {
        class: 'btn btn-primario btn-sm flex-inline-icon',
        onclick: () => executarAlgoritmo(),
      }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'play_arrow'), ' Executar Programa'),
      h('button', {
        class: 'btn btn-contorno-escuro btn-sm flex-inline-icon',
        onclick: () => {
          executando = false;
          estadoSimulacao = resetarEstadoSimulacao();
          feedback.limpar();
          desenharPalco();
        },
      }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'refresh'), ' Reiniciar Palco'),
      h('button', {
        class: 'btn btn-contorno-escuro btn-sm flex-inline-icon',
        onclick: () => {
          verCodigo = !verCodigo;
          if (verCodigo) {
            painelCodigo.classList.remove('oculto');
            painelWorkspace.classList.add('oculto');
          } else {
            painelCodigo.classList.add('oculto');
            painelWorkspace.classList.remove('oculto');
          }
        },
      }, h('span', { class: 'material-symbols-outlined icon-xs' }, 'code'), ' Ver Código'),
      criarBotaoSom(),
    ),
    h('div', { class: 'blocos-dica-meta' },
      h('span', { class: 'material-symbols-outlined icon-xs' }, 'info'),
      h('span', {}, atividade.instrucao),
    ),
  );

  // Inicializa workspace
  atualizarListaWorkspace();

  // Estrutura principal dividida em colunas
  const gradePrincipal = h('div', { class: 'blocos-grade-principal' },
    h('div', { class: 'blocos-coluna-esquerda' },
      paletaEl,
      h('div', { class: 'blocos-workspace-wrap' },
        h('h3', { class: 'blocos-secao-titulo' }, 'Área do Programa (Algoritmo)'),
        painelWorkspace,
        painelCodigo,
      ),
    ),
    h('div', { class: 'blocos-coluna-direita' },
      h('div', { class: 'blocos-palco-wrap' },
        h('h3', { class: 'blocos-secao-titulo' }, 'Palco de Execução'),
        canvasPalco,
        balaoFala,
      ),
    ),
  );

  return h('div', { class: 'jogador-blocos-container' },
    barraTopo,
    feedback.elemento,
    gradePrincipal,
  );
}

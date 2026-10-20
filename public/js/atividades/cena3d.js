/**
 * ============================================================================
 * LMS COMPASSO — MOTOR DE CENA 3D (THREE.JS + GSAP + FALLBACK 2D LEVE)
 * ============================================================================
 * Renderiza e anima os mundos 3D das atividades de lógica em Python:
 *  - Modo "grade": Robô 3D, piso modular, obstáculos, portas de energia,
 *    cristais colecionáveis e portal de chegada.
 *  - Modo "ordenacao": Torres 3D proporcionais aos elementos da lista.
 *  - Modo "hanoi": Três pinos 3D (A, B, C) e discos empilhados animados.
 * Inclui controles de câmera por toque/arraste, respeito a prefers-reduced-motion
 * e fallback automático 2D para dispositivos escolares sem WebGL.
 * ============================================================================
 */

const THREE_CDN_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
let promessaThree = null;

export function carregarThreeSobDemanda() {
  if (typeof window !== 'undefined' && window.THREE) {
    return Promise.resolve(window.THREE);
  }
  if (!promessaThree) {
    promessaThree = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = THREE_CDN_URL;
      script.async = true;
      script.onload = () => resolve(window.THREE);
      script.onerror = () => reject(new Error('Não foi possível carregar Three.js'));
      document.head.appendChild(script);
    });
  }
  return promessaThree;
}

export function detectarSuporteWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext
      && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')),
    );
  } catch {
    return false;
  }
}

/**
 * Cria o controlador visual (3D WebGL com fallback 2D integrado).
 */
export function criarControladorCena3D(container, cena3dConfig, { reduzirMovimento = false } = {}) {
  let modo2DForcado = !detectarSuporteWebGL();
  let threeAtivo = null;
  let animacaoFrameId = null;
  let timelineAtual = null;

  // Elementos internos do palco
  const camada3D = document.createElement('div');
  camada3D.className = 'py3d-canvas-wrap';
  const camada2D = document.createElement('div');
  camada2D.className = 'py3d-fallback-2d';
  container.replaceChildren(camada3D, camada2D);

  // Estado para renderização 2D leve e sincronização 3D
  let objetosCena = {};

  function renderizarFallback2D(estado = {}) {
    const modo = cena3dConfig.modo || 'grade';
    camada2D.innerHTML = '';

    if (modo === 'ordenacao') {
      const valores = estado.valores || cena3dConfig.valoresIniciais || [4, 2, 5, 1, 3];
      const fila = document.createElement('div');
      fila.className = 'py3d-2d-torres';
      valores.forEach((v, idx) => {
        const barra = document.createElement('div');
        barra.className = 'py3d-2d-torre';
        if (estado.destaque?.includes(idx)) barra.classList.add('destaque');
        barra.style.height = `${v * 28}px`;
        barra.innerHTML = `<span>${v}</span><small>[${idx}]</small>`;
        fila.appendChild(barra);
      });
      camada2D.appendChild(fila);
      return;
    }

    if (modo === 'hanoi') {
      const numDiscos = cena3dConfig.numDiscos || 3;
      const pinos = estado.pinos || {
        A: Array.from({ length: numDiscos }, (_, i) => numDiscos - i),
        B: [],
        C: [],
      };
      const wrap = document.createElement('div');
      wrap.className = 'py3d-2d-hanoi';
      ['A', 'B', 'C'].forEach((nomePino) => {
        const col = document.createElement('div');
        col.className = 'py3d-2d-pino';
        const haste = document.createElement('div');
        haste.className = 'py3d-2d-pino-pilha';
        (pinos[nomePino] || []).forEach((tam) => {
          const disco = document.createElement('div');
          disco.className = `py3d-2d-disco disco-${tam}`;
          disco.style.width = `${36 + tam * 24}px`;
          disco.textContent = `D${tam}`;
          haste.appendChild(disco);
        });
        const rotulo = document.createElement('strong');
        rotulo.textContent = `Pino ${nomePino}`;
        col.append(haste, rotulo);
        wrap.appendChild(col);
      });
      camada2D.appendChild(wrap);
      return;
    }

    // Modo Grade 2D
    const grade = cena3dConfig.grade || ['R.M'];
    const tab = document.createElement('div');
    tab.className = 'py3d-2d-grade';
    tab.style.gridTemplateColumns = `repeat(${grade[0].length}, minmax(44px, 56px))`;

    grade.forEach((linha, y) => {
      [...linha].forEach((simbolo, x) => {
        const cel = document.createElement('div');
        cel.className = 'py3d-2d-celula';
        const chave = `${x},${y}`;
        const roboAqui = estado.robo ? (estado.robo.x === x && estado.robo.y === y) : simbolo === 'R';
        if (simbolo === '#') {
          cel.classList.add('obstaculo');
          cel.textContent = '🧱';
        } else if (simbolo === 'P' && !estado.portasAbertas?.has(chave)) {
          cel.classList.add('porta');
          cel.textContent = '🚪';
        } else if (simbolo === 'M') {
          cel.classList.add('meta');
          cel.textContent = '🌀';
        } else if (simbolo === 'I' && !estado.itensColetados?.has(chave)) {
          cel.classList.add('item');
          cel.textContent = '💎';
        }
        if (roboAqui) {
          cel.classList.add('robo-ativo');
          cel.textContent = '🤖';
        }
        tab.appendChild(cel);
      });
    });
    camada2D.appendChild(tab);
  }

  async function inicializarCena3D() {
    renderizarFallback2D();
    if (modo2DForcado) {
      camada3D.style.display = 'none';
      camada2D.style.display = 'grid';
      return;
    }

    try {
      const THREE = await carregarThreeSobDemanda();
      camada3D.style.display = 'block';
      camada2D.style.display = 'none';
      camada3D.innerHTML = '';

      const largura = camada3D.clientWidth || 520;
      const altura = camada3D.clientHeight || 340;

      const cena = new THREE.Scene();
      cena.background = new THREE.Color(0x0b132b);

      const camera = new THREE.PerspectiveCamera(45, largura / altura, 0.1, 100);
      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
      renderer.setSize(largura, altura);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      camada3D.appendChild(renderer.domElement);

      const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.75);
      const luzDirecional = new THREE.DirectionalLight(0x93c5fd, 0.9);
      luzDirecional.position.set(6, 12, 8);
      cena.add(luzAmbiente, luzDirecional);

      const grupoRaiz = new THREE.Group();
      cena.add(grupoRaiz);

      objetosCena = { THREE, cena, camera, renderer, grupoRaiz, itensMesh: new Map(), portasMesh: new Map(), torresMesh: [], discosMesh: new Map() };
      construirGeometriaInicial();

      // Controle simples por arraste (mouse e toque) para girar a cena
      let arrastando = false;
      let ultimoX = 0;
      const domEl = renderer.domElement;
      domEl.addEventListener('pointerdown', (e) => { arrastando = true; ultimoX = e.clientX; });
      window.addEventListener('pointerup', () => { arrastando = false; });
      domEl.addEventListener('pointermove', (e) => {
        if (!arrastando) return;
        const delta = (e.clientX - ultimoX) * 0.008;
        ultimoX = e.clientX;
        grupoRaiz.rotation.y += delta;
      });

      const renderLoop = () => {
        animacaoFrameId = requestAnimationFrame(renderLoop);
        renderer.render(cena, camera);
      };
      renderLoop();
      threeAtivo = true;
    } catch {
      modo2DForcado = true;
      camada3D.style.display = 'none';
      camada2D.style.display = 'grid';
    }
  }

  function construirGeometriaInicial() {
    if (!objetosCena.THREE) return;
    const { THREE, grupoRaiz, camera } = objetosCena;
    while (grupoRaiz.children.length > 0) {
      grupoRaiz.remove(grupoRaiz.children[0]);
    }
    objetosCena.itensMesh.clear();
    objetosCena.portasMesh.clear();
    objetosCena.torresMesh = [];
    objetosCena.discosMesh.clear();

    const modo = cena3dConfig.modo || 'grade';

    if (modo === 'ordenacao') {
      const valores = cena3dConfig.valoresIniciais || [4, 2, 5, 1, 3];
      camera.position.set(0, 4.5, 9);
      camera.lookAt(0, 1.5, 0);

      valores.forEach((v, idx) => {
        const x = (idx - (valores.length - 1) / 2) * 1.4;
        const h = v * 0.65;
        const geom = new THREE.BoxGeometry(0.9, h, 0.9);
        const mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.35 });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(x, h / 2, 0);
        grupoRaiz.add(mesh);
        objetosCena.torresMesh.push(mesh);
      });
      return;
    }

    if (modo === 'hanoi') {
      const numDiscos = cena3dConfig.numDiscos || 3;
      camera.position.set(0, 4.2, 8.5);
      camera.lookAt(0, 1.2, 0);

      const posX = { A: -2.6, B: 0, C: 2.6 };
      ['A', 'B', 'C'].forEach((pino) => {
        const haste = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 2.6, 16),
          new THREE.MeshStandardMaterial({ color: 0x64748b }),
        );
        haste.position.set(posX[pino], 1.3, 0);
        grupoRaiz.add(haste);
      });

      const coresDisco = [0x10b981, 0xf59e0b, 0x3b82f6, 0xec4899];
      for (let tam = numDiscos; tam >= 1; tam -= 1) {
        const ordemPilha = numDiscos - tam;
        const raio = 0.4 + tam * 0.25;
        const disco = new THREE.Mesh(
          new THREE.CylinderGeometry(raio, raio, 0.38, 24),
          new THREE.MeshStandardMaterial({ color: coresDisco[(tam - 1) % coresDisco.length], roughness: 0.3 }),
        );
        disco.position.set(posX.A, 0.25 + ordemPilha * 0.42, 0);
        grupoRaiz.add(disco);
        objetosCena.discosMesh.set(tam, disco);
      }
      return;
    }

    // Modo Grade 3D (Robô + Labirinto)
    const grade = cena3dConfig.grade || ['R.M'];
    const alt = grade.length;
    const larg = grade[0].length;
    const offsetX = (larg - 1) / 2;
    const offsetZ = (alt - 1) / 2;

    camera.position.set(0, Math.max(larg, alt) * 1.35 + 2, Math.max(larg, alt) * 1.45 + 2);
    camera.lookAt(0, 0, 0);

    grade.forEach((linha, y) => {
      [...linha].forEach((cel, x) => {
        const px = x - offsetX;
        const pz = y - offsetZ;
        const chave = `${x},${y}`;

        const piso = new THREE.Mesh(
          new THREE.BoxGeometry(0.94, 0.16, 0.94),
          new THREE.MeshStandardMaterial({ color: cel === 'M' ? 0x10b981 : 0x1e293b }),
        );
        piso.position.set(px, -0.08, pz);
        grupoRaiz.add(piso);

        if (cel === '#') {
          const bloco = new THREE.Mesh(
            new THREE.BoxGeometry(0.88, 0.75, 0.88),
            new THREE.MeshStandardMaterial({ color: 0x475569 }),
          );
          bloco.position.set(px, 0.38, pz);
          grupoRaiz.add(bloco);
        } else if (cel === 'P') {
          const porta = new THREE.Mesh(
            new THREE.BoxGeometry(0.85, 0.9, 0.22),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.85 }),
          );
          porta.position.set(px, 0.45, pz);
          grupoRaiz.add(porta);
          objetosCena.portasMesh.set(chave, porta);
        } else if (cel === 'I') {
          const cristal = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.28, 0),
            new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 }),
          );
          cristal.position.set(px, 0.42, pz);
          grupoRaiz.add(cristal);
          objetosCena.itensMesh.set(chave, cristal);
        } else if (cel === 'R') {
          const roboGrupo = new THREE.Group();
          const corpo = new THREE.Mesh(
            new THREE.BoxGeometry(0.56, 0.52, 0.56),
            new THREE.MeshStandardMaterial({ color: 0x2563eb }),
          );
          corpo.position.y = 0.28;
          const visor = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.16, 0.12),
            new THREE.MeshStandardMaterial({ color: 0x9ae6b4, emissive: 0x38a169 }),
          );
          visor.position.set(0, 0.34, 0.26);
          roboGrupo.add(corpo, visor);
          roboGrupo.position.set(px, 0, pz);
          roboGrupo.rotation.y = Math.PI / 2; // Leste
          grupoRaiz.add(roboGrupo);
          objetosCena.roboMesh = roboGrupo;
          objetosCena.offsetX = offsetX;
          objetosCena.offsetZ = offsetZ;
        }
      });
    });
  }

  function pararAnimacao() {
    if (timelineAtual && typeof timelineAtual.kill === 'function') {
      timelineAtual.kill();
    }
    timelineAtual = null;
  }

  function reiniciarCena() {
    pararAnimacao();
    renderizarFallback2D();
    if (threeAtivo) construirGeometriaInicial();
  }

  /**
   * Anima a lista de eventos gerada pelo código Python usando GSAP (ou passo imediato se reduzirMovimento).
   */
  function reproduzirEventos(eventos, { velocidade = 1, aoPasso = () => {}, aoFinalizar = () => {} } = {}) {
    reiniciarCena();
    const duracaoBase = reduzirMovimento ? 0.02 : (0.42 / velocidade);
    const gsapRef = typeof window !== 'undefined' ? window.gsap : null;

    const estado2D = {
      robo: null,
      itensColetados: new Set(),
      portasAbertas: new Set(),
      valores: [...(cena3dConfig.valoresIniciais || [4, 2, 5, 1, 3])],
      pinos: null,
    };

    if (!gsapRef || modo2DForcado || !threeAtivo) {
      let idx = 0;
      const intervalo = setInterval(() => {
        if (idx >= eventos.length) {
          clearInterval(intervalo);
          aoFinalizar();
          return;
        }
        const ev = eventos[idx];
        aoPasso(ev, idx);
        aplicarEvento2D(ev, estado2D);
        renderizarFallback2D(estado2D);
        idx += 1;
      }, duracaoBase * 1000);
      timelineAtual = { kill: () => clearInterval(intervalo), pause: () => clearInterval(intervalo) };
      return timelineAtual;
    }

    const tl = gsapRef.timeline({ onComplete: aoFinalizar });
    timelineAtual = tl;

    eventos.forEach((ev, idx) => {
      tl.call(() => {
        aoPasso(ev, idx);
        aplicarEvento2D(ev, estado2D);
        renderizarFallback2D(estado2D);
      });

      if (ev.tipo === 'mover' && objetosCena.roboMesh) {
        const px = ev.x - objetosCena.offsetX;
        const pz = ev.y - objetosCena.offsetZ;
        tl.to(objetosCena.roboMesh.position, { x: px, z: pz, duration: duracaoBase, ease: 'power2.inOut' });
      } else if (ev.tipo === 'girar' && objetosCena.roboMesh) {
        const deltaAngulo = ev.sentido === 'direita' ? -Math.PI / 2 : Math.PI / 2;
        tl.to(objetosCena.roboMesh.rotation, { y: `+=${deltaAngulo}`, duration: duracaoBase * 0.8, ease: 'power2.out' });
      } else if (ev.tipo === 'coletar') {
        const mesh = objetosCena.itensMesh.get(`${ev.x},${ev.y}`);
        if (mesh) {
          tl.to(mesh.scale, { x: 0.01, y: 0.01, z: 0.01, duration: duracaoBase * 0.7, onComplete: () => { mesh.visible = false; } });
        }
      } else if (ev.tipo === 'abrir-porta') {
        const porta = objetosCena.portasMesh.get(`${ev.x},${ev.y}`);
        if (porta) {
          tl.to(porta.position, { y: -0.6, duration: duracaoBase * 0.8, onComplete: () => { porta.visible = false; } });
        }
      } else if (ev.tipo === 'trocar-lista') {
        const m1 = objetosCena.torresMesh[ev.i];
        const m2 = objetosCena.torresMesh[ev.j];
        if (m1 && m2) {
          const x1 = m1.position.x;
          const x2 = m2.position.x;
          tl.to(m1.position, { x: x2, duration: duracaoBase }, '<');
          tl.to(m2.position, { x: x1, duration: duracaoBase }, '<');
          objetosCena.torresMesh[ev.i] = m2;
          objetosCena.torresMesh[ev.j] = m1;
        }
      } else if (ev.tipo === 'mover-disco') {
        const discoMesh = objetosCena.discosMesh.get(ev.disco);
        const posX = { A: -2.6, B: 0, C: 2.6 };
        const alturaDestino = (ev.estadoPinos[ev.destino].length - 1) * 0.42 + 0.25;
        if (discoMesh) {
          tl.to(discoMesh.position, { y: 3.1, duration: duracaoBase * 0.45 })
            .to(discoMesh.position, { x: posX[ev.destino], duration: duracaoBase * 0.55 })
            .to(discoMesh.position, { y: alturaDestino, duration: duracaoBase * 0.45 });
        }
      } else {
        tl.to({}, { duration: duracaoBase * 0.5 });
      }
    });

    return tl;
  }

  function aplicarEvento2D(ev, estado2D) {
    if (ev.tipo === 'mover' || ev.tipo === 'colisao-borda' || ev.tipo === 'colisao-obstaculo') {
      estado2D.robo = { x: ev.x, y: ev.y };
    } else if (ev.tipo === 'coletar' && ev.sucesso) {
      estado2D.itensColetados.add(`${ev.x},${ev.y}`);
    } else if (ev.tipo === 'abrir-porta' && ev.sucesso) {
      estado2D.portasAbertas.add(`${ev.x},${ev.y}`);
    } else if (ev.tipo === 'comparar-lista' || ev.tipo === 'trocar-lista') {
      estado2D.valores = ev.valores;
      estado2D.destaque = [ev.i, ev.j];
    } else if (ev.tipo === 'mover-disco') {
      estado2D.pinos = ev.estadoPinos;
    }
  }

  function alternarModo2D(forcar2D) {
    modo2DForcado = Boolean(forcar2D);
    if (modo2DForcado) {
      if (animacaoFrameId) cancelAnimationFrame(animacaoFrameId);
      camada3D.style.display = 'none';
      camada2D.style.display = 'grid';
      renderizarFallback2D();
    } else {
      inicializarCena3D();
    }
  }

  inicializarCena3D();

  return {
    reproduzirEventos,
    reiniciarCena,
    pararAnimacao,
    alternarModo2D,
    estaEmModo2D: () => modo2DForcado,
  };
}

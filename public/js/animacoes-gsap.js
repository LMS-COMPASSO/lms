/**
 * ============================================================================
 * LMS COMPASSO — MOTOR DE MOVIMENTO ACESSÍVEL COM GSAP (MATCHMEDIA + A11Y)
 * ============================================================================
 * Centraliza animações GSAP (Core + ScrollTrigger + Flip) com guardrail
 * rigoroso de acessibilidade (WCAG 2.2 AA):
 *   - Verifica `(prefers-reduced-motion: reduce)` via `gsap.matchMedia()`
 *   - Verifica preferência persistida no LMS (`localStorage`: `lms_a11y_reduzir-movimento`)
 *   - Verifica classe ativa no documento (`html.a11y-reduzir-movimento`)
 *   - Quando ativo, aplica o estado final instantaneamente via `gsap.set`
 * ============================================================================
 */

const CHAVE_A11Y_REDUZIR = 'lms_a11y_reduzir-movimento';

/**
 * Determina se a redução de movimento está ativa no SO, no navegador ou no LMS.
 */
export function movimentoReduzidoAtivo(opcoes = {}) {
  if (typeof opcoes.reduzirMovimento === 'boolean') {
    return opcoes.reduzirMovimento;
  }

  let prefereSistema = false;
  try {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      prefereSistema = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  } catch {
    prefereSistema = false;
  }

  let prefereStorage = false;
  try {
    if (typeof localStorage !== 'undefined') {
      prefereStorage = localStorage.getItem(CHAVE_A11Y_REDUZIR) === '1';
    }
  } catch {
    prefereStorage = false;
  }

  let prefereClasse = false;
  try {
    if (typeof document !== 'undefined' && document.documentElement?.classList) {
      prefereClasse = document.documentElement.classList.contains('a11y-reduzir-movimento');
    }
  } catch {
    prefereClasse = false;
  }

  return prefereSistema || prefereStorage || prefereClasse;
}

/**
 * Resolve e registra GSAP + plugins ScrollTrigger e Flip quando disponíveis.
 */
export function obterGsap(opcoes = {}) {
  const win = typeof window !== 'undefined' ? window : globalThis;
  const gsapRef = opcoes.gsap || win?.gsap || null;
  if (!gsapRef) return { gsap: null, ScrollTrigger: null, Flip: null };

  const ScrollTriggerRef = opcoes.ScrollTrigger || win?.ScrollTrigger || null;
  const FlipRef = opcoes.Flip || win?.Flip || null;

  if (typeof gsapRef.registerPlugin === 'function') {
    const plugins = [ScrollTriggerRef, FlipRef].filter(Boolean);
    if (plugins.length > 0) {
      try {
        gsapRef.registerPlugin(...plugins);
      } catch {
        // Ignora caso plugin já esteja registrado
      }
    }
  }

  return { gsap: gsapRef, ScrollTrigger: ScrollTriggerRef, Flip: FlipRef };
}

/**
 * Aplica imediatamente os estados finais visíveis sem transição de movimento.
 */
export function aplicarEstadoFinal(alvos, props = {}, opcoes = {}) {
  if (!alvos) return;
  const { gsap } = obterGsap(opcoes);
  const propsFinais = {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    clearProps: 'transform,opacity',
    ...props,
  };

  if (gsap && typeof gsap.set === 'function') {
    gsap.set(alvos, propsFinais);
    return;
  }

  // Fallback seguro quando GSAP não está carregado
  if (typeof document !== 'undefined') {
    const lista = typeof alvos === 'string'
      ? Array.from(document.querySelectorAll(alvos))
      : (Array.isArray(alvos) ? alvos : [alvos]);
    for (const el of lista) {
      if (el && el.style) {
        el.style.opacity = '1';
        el.style.transform = '';
      }
    }
  }
}

/**
 * Registra listener único para reverter timelines caso o usuário ative movimento reduzido.
 */
function registrarListenerReversao(mm, setupReduzidoFn, contextoGsap, opcoes) {
  if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
  const aoAtualizarPrefs = () => {
    if (!movimentoReduzidoAtivo(opcoes)) return;
    try {
      mm.revert();
    } catch (erroRevert) {
      console.warn('Falha ao reverter contexto GSAP:', erroRevert?.message || erroRevert);
    }
    setupReduzidoFn(contextoGsap);
  };
  window.addEventListener('preferenciasA11yAtualizadas', aoAtualizarPrefs, { once: true });
}

/**
 * Executa animações via `gsap.matchMedia()` com fallback determinístico para
 * redução de movimento.
 */
export function executarComMatchMedia(setupAnimacaoFn, setupReduzidoFn = () => {}, opcoes = {}) {
  const { gsap, ScrollTrigger, Flip } = obterGsap(opcoes);
  const contextoReduzido = { gsap, ScrollTrigger, Flip, reduzido: true };

  if (!gsap || movimentoReduzidoAtivo(opcoes)) {
    setupReduzidoFn(contextoReduzido);
    return null;
  }

  if (typeof gsap.matchMedia !== 'function') {
    setupAnimacaoFn({ gsap, ScrollTrigger, Flip, reduzido: false });
    return null;
  }

  const mm = gsap.matchMedia();
  mm.add(
    {
      normal: '(prefers-reduced-motion: no-preference)',
      reduzido: '(prefers-reduced-motion: reduce)',
    },
    (contexto) => {
      const condicoes = contexto?.conditions || {};
      if (condicoes.reduzido || movimentoReduzidoAtivo(opcoes)) {
        setupReduzidoFn(contextoReduzido);
        return undefined;
      }
      return setupAnimacaoFn({ gsap, ScrollTrigger, Flip, reduzido: false });
    },
  );

  registrarListenerReversao(mm, setupReduzidoFn, contextoReduzido, opcoes);
  return mm;
}

let timelineFlipAtiva = null;

function resolverAlvosFlip(seletorOuAlvos) {
  if (typeof seletorOuAlvos === 'function') return seletorOuAlvos();
  if (typeof seletorOuAlvos === 'string' && typeof document !== 'undefined') {
    return document.querySelectorAll(seletorOuAlvos);
  }
  return seletorOuAlvos;
}

function capturarEstadoFlipSeguro(Flip, resolverAlvos) {
  try {
    const antes = resolverAlvos();
    if (!antes || (antes.length !== undefined && antes.length === 0)) return null;
    return Flip.getState(antes, { props: 'opacity' });
  } catch (erroFlip) {
    console.warn('Não foi possível capturar estado Flip anterior:', erroFlip?.message || erroFlip);
    return null;
  }
}

function encerrarFlipAnterior(Flip) {
  if (timelineFlipAtiva && typeof timelineFlipAtiva.kill === 'function') {
    timelineFlipAtiva.kill();
    timelineFlipAtiva = null;
  }
  if (Flip && typeof Flip.killFlipsOf === 'function') {
    try {
      Flip.killFlipsOf('*');
    } catch (erroKillFlip) {
      console.warn('Aviso ao interromper Flip em curso:', erroKillFlip?.message || erroKillFlip);
    }
  }
}

/**
 * Transição fluida de layout com GSAP Flip (Kanban ↔ Galeria ↔ Tabela, filtros, reordenação).
 */
export function animarFlip(seletorOuAlvos, acaoDomFn, opcoes = {}) {
  const { gsap, Flip } = obterGsap(opcoes);
  const resolverAlvos = () => resolverAlvosFlip(seletorOuAlvos);

  if (movimentoReduzidoAtivo(opcoes) || !gsap || !Flip || typeof Flip.getState !== 'function') {
    if (typeof acaoDomFn === 'function') acaoDomFn();
    aplicarEstadoFinal(resolverAlvos(), {}, opcoes);
    return false;
  }

  encerrarFlipAnterior(Flip);
  const estadoAnterior = capturarEstadoFlipSeguro(Flip, resolverAlvos);
  if (typeof acaoDomFn === 'function') acaoDomFn();

  const alvosDepois = resolverAlvos();
  const temAlvosDepois = alvosDepois && (alvosDepois.length === undefined || alvosDepois.length > 0);
  if (!estadoAnterior || !temAlvosDepois) {
    aplicarEstadoFinal(alvosDepois, {}, opcoes);
    return false;
  }

  executarComMatchMedia(
    () => {
      timelineFlipAtiva = Flip.from(estadoAnterior, {
        duration: opcoes.duration ?? 0.34,
        ease: opcoes.ease || 'power2.out',
        stagger: opcoes.stagger ?? 0.015,
        absolute: false,
        prune: true,
        simple: true,
        clearProps: 'transform,opacity',
        onEnter: (els) => (els?.length ? gsap.fromTo(els, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.24, clearProps: 'transform,opacity' }) : null),
        onComplete: () => { timelineFlipAtiva = null; },
      });
    },
    () => {
      aplicarEstadoFinal(resolverAlvos(), {}, opcoes);
    },
    opcoes,
  );

  return true;
}

function normalizarListaElementos(seletorOuElementos) {
  if (typeof seletorOuElementos === 'string' && typeof document !== 'undefined') {
    return seletorOuElementos ? Array.from(document.querySelectorAll(seletorOuElementos)) : [];
  }
  if (Array.isArray(seletorOuElementos)) return seletorOuElementos;
  if (seletorOuElementos && typeof seletorOuElementos.length === 'number') {
    return Array.from(seletorOuElementos);
  }
  return seletorOuElementos ? [seletorOuElementos] : [];
}

function agruparPorGatilho(lista, opcoes) {
  const grupos = new Map();
  for (const el of lista) {
    const pai = opcoes.grupoPorPai && el?.parentElement ? el.parentElement : (opcoes.trigger || el);
    if (!grupos.has(pai)) grupos.set(pai, []);
    grupos.get(pai).push(el);
  }
  return grupos;
}

function agendarRefreshScrollTrigger(ScrollTrigger) {
  if (typeof window === 'undefined' || typeof ScrollTrigger.refresh !== 'function' || window.__lmsScrollTriggerRefreshAgendado) {
    return;
  }
  window.__lmsScrollTriggerRefreshAgendado = true;
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

/**
 * Revelação progressiva suave controlada por ScrollTrigger (apenas GPU: transform/opacity).
 */
export function animarRevelacaoScroll(seletorOuElementos, opcoes = {}) {
  if (typeof document === 'undefined' && !opcoes.gsap) return null;

  const lista = normalizarListaElementos(seletorOuElementos);
  if (lista.length === 0) return null;

  return executarComMatchMedia(
    ({ gsap, ScrollTrigger }) => {
      if (!ScrollTrigger) {
        gsap.from(lista, {
          opacity: 0,
          y: opcoes.y ?? 16,
          duration: opcoes.duration ?? 0.38,
          stagger: opcoes.stagger ?? 0.05,
          ease: opcoes.ease || 'power2.out',
          clearProps: 'transform,opacity',
        });
        return;
      }

      const gruposPorPai = agruparPorGatilho(lista, opcoes);
      gruposPorPai.forEach((grupo, gatilho) => {
        gsap.from(grupo, {
          opacity: 0,
          y: opcoes.y ?? 18,
          duration: opcoes.duration ?? 0.42,
          stagger: opcoes.stagger ?? 0.05,
          ease: opcoes.ease || 'power2.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: gatilho,
            start: opcoes.start || 'top 96%',
            once: true,
          },
        });
      });

      agendarRefreshScrollTrigger(ScrollTrigger);
    },
    () => {
      aplicarEstadoFinal(lista, {}, opcoes);
    },
    opcoes,
  );
}

/**
 * Micro-animações de feedback pedagógico e gamificação (checklist, medalha, progresso, modal).
 */
export function animarFeedbackGamificacao(elemento, tipo = 'checklist', opcoes = {}) {
  if (!elemento) return false;

  executarComMatchMedia(
    ({ gsap }) => {
      if (tipo === 'checklist') {
        gsap.fromTo(
          elemento,
          { scale: 0.98 },
          { scale: 1, duration: 0.24, ease: 'power2.out', clearProps: 'transform' },
        );
      } else if (tipo === 'medalha') {
        gsap.fromTo(
          elemento,
          { opacity: 0.6, scale: 0.92, y: 8 },
          { opacity: 1, scale: 1, y: 0, duration: 0.36, ease: 'power2.out', clearProps: 'transform,opacity' },
        );
      } else if (tipo === 'progresso') {
        const largura = opcoes.largura || elemento.getAttribute?.('data-largura') || '100%';
        gsap.to(elemento, {
          width: largura,
          duration: 0.45,
          ease: 'power2.out',
        });
      } else if (tipo === 'modal') {
        gsap.fromTo(
          elemento,
          { opacity: 0, y: 14, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: 'power2.out', clearProps: 'transform,opacity' },
        );
      }
    },
    () => {
      if (tipo === 'progresso' && opcoes.largura && elemento.style) {
        elemento.style.width = opcoes.largura;
      }
      aplicarEstadoFinal(elemento, {}, opcoes);
    },
    opcoes,
  );

  return true;
}

if (typeof window !== 'undefined') {
  window.LmsAnimacoes = {
    movimentoReduzidoAtivo,
    obterGsap,
    aplicarEstadoFinal,
    executarComMatchMedia,
    animarFlip,
    animarRevelacaoScroll,
    animarFeedbackGamificacao,
  };
}

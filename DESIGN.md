---
name: LMS COMPASSO
description: Sistema de Gestão de Aprendizagem Serverless para a BNCC Computação na Educação Básica
colors:
  primary: "#2c5282"
  primary-dark: "#1a365d"
  primary-accent: "#2563eb"
  secondary: "#276749"
  secondary-light: "#38a169"
  warning: "#b7791f"
  danger: "#c53030"
  neutral-bg: "#f4f6fa"
  card-bg: "#ffffff"
  text-main: "#1a202c"
  text-muted: "#475569"
  border: "#e2e8f0"
  focus-ring: "#dd6b20"
  axis-pensamento: "#1d4ed8"
  axis-mundo: "#047857"
  axis-cultura: "#b45309"
typography:
  display:
    fontFamily: "Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 1.2rem + 1.8vw, 2.4rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  h2:
    fontFamily: "Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "clamp(1.3rem, 1.05rem + 1.2vw, 1.85rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  h3:
    fontFamily: "Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "clamp(1.1rem, 0.95rem + 0.7vw, 1.35rem)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "clamp(0.92rem, 0.88rem + 0.25vw, 1.05rem)"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.88rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  full: "9999px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "20px"
  space-6: "24px"
  space-8: "32px"
  space-10: "40px"
  space-12: "48px"
  space-16: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  card:
    backgroundColor: "{colors.card-bg}"
    rounded: "{rounded.md}"
    padding: "20px"
---

# Diretrizes Visuais e Sistema de Design — LMS COMPASSO

## Overview

O **LMS COMPASSO** adota uma linguagem visual sóbria, institucional, altamente legível e acessível (WCAG 2.2 nível AA), desenvolvida sob medida para a Educação Básica pública brasileira. A interface prioriza clareza pedagógica, respeito à carga cognitiva infantil e docente, foco em baixo consumo de banda e excelente ergonomia táctil em celulares modestos (320px–360px), notebooks escolares e monitores desktop.

Este documento formaliza as decisões de design de acordo com o padrão Impeccable/Stitch, servindo como fonte única da verdade para tipografia, espaçamento, cores, componentes e responsividade fluida.

## Colors

A paleta cromática estrutura-se em torno de pilares semânticos claros e identificadores cromáticos dedicados para os 3 eixos da BNCC Computação:

- **Primária Institucional (`#2c5282` / `#1a365d`):** Azul sóbrio e confiável para títulos, navegação principal e botões primários.
- **Eixo 1 — Pensamento Computacional (`#1d4ed8`):** Azul índigo para algoritmos, decomposição, lógica e simulação de blocos. Fundo contextual: `#eff6ff`, borda: `#93c5fd`.
- **Eixo 2 — Mundo Digital (`#047857`):** Verde esmeralda escuro para hardware, circuitos, computadores e redes. Fundo contextual: `#ecfdf5`, borda: `#6ee7b7`.
- **Eixo 3 — Cultura Digital (`#b45309`):** Âmbar e ocre profundo para segurança na internet, ética, IA e cidadania digital. Fundo contextual: `#fffbeb`, borda: `#fcd34d`.
- **Alerta e Perigo (`#b7791f` / `#c53030`):** Para avisos de validação e remoção de registros.
- **Foco Acessível (`#dd6b20` / `#1d4ed8`):** Anel de foco de alto contraste visível em navegação por teclado (3px sólido com offset de 2px).
- **Superfícies Neutras (`#f4f6fa` fundo / `#ffffff` cartão):** Proporcionam contraste superior a 7:1 para leitura contínua.

## Typography

A tipografia utiliza a pilha do sistema nativo (`'Segoe UI', Roboto, system-ui, sans-serif`), complementada pelos símbolos vetoriais do **Google Material Symbols Outlined** e fonte monoespaçada em snippets de código Python e códigos da BNCC:

- **Escala Fluida com `clamp()`:** Nenhum tamanho de fonte é fixo em pixels rígidos. Os títulos adaptam-se suavemente entre a tela de 320px de um smartphone e a de 1920px de um monitor.
  - `--fonte-h1`: `clamp(1.6rem, 1.2rem + 1.8vw, 2.4rem)`
  - `--fonte-h2`: `clamp(1.3rem, 1.05rem + 1.2vw, 1.85rem)`
  - `--fonte-h3`: `clamp(1.1rem, 0.95rem + 0.7vw, 1.35rem)`
  - `--fonte-corpo`: `clamp(0.92rem, 0.88rem + 0.25vw, 1.05rem)`
  - `--fonte-pequena`: `clamp(0.8rem, 0.77rem + 0.15vw, 0.88rem)`
- **Comprimento de Linha (Measure):** Textos descritivos e parágrafos explicativos são mantidos em `65ch` a `75ch` de largura máxima (`max-width: 70ch`), evitando fadiga visual.
- **Entradas de Texto sem Zoom em iOS:** Campos `input`, `select` e `textarea` possuem tamanho de fonte mínimo de `16px` em dispositivos móveis, impedindo o zoom involuntário do Safari no iOS.

## Layout

O sistema adota o paradigma **Mobile-First Fluido** estruturado em múltiplos de 4px e 8px:

- **Escala de Espaçamento Modular:**
  - Base 4px / 8px: `var(--espaco-1)` (4px), `var(--espaco-2)` (8px), `var(--espaco-3)` (12px), `var(--espaco-4)` (16px), `var(--espaco-6)` (24px), `var(--espaco-8)` (32px), `var(--espaco-12)` (48px).
- **Breakpoints Oficiais do Projeto:**
  - `320px–480px` (Smartphones de entrada): coluna única, menus em gaveta ou barra de rolagem horizontal tocável, botões esticados ou alinhados com quebra fluida, alvos de toque $\ge 44\times 44\text{px}$.
  - `481px–768px` (Tablets retrato): colunas duplas balanceadas, painéis de navegação responsivos.
  - `769px–1024px` (Notebooks escolares 1366x768 e tablets paisagem): gaveta lateral colapsável com backdrop, grelhas de 2 a 3 colunas auto-ajustáveis.
  - `1025px–1920px` (Desktops e monitores amplos): layout com barra lateral fixa, limites máximos de conteúdo (`max-width: 1120px` a `1200px`) centralizados com `margin-inline: auto`.
- **Proteção Absoluta contra Rolagem Horizontal (`overflow-x: clip / auto`):**
  - Grelhas usam `repeat(auto-fit, minmax(min(100%, 280px), 1fr))`, impedindo estouro de container.
  - Tabelas de dados pedagógicos e listas administrativas são encapsuladas em `.tabela-scroll` com `overflow-x: auto` e `-webkit-overflow-scrolling: touch`.
  - O Laboratório 3D Python reorganiza-se de 2 colunas lado a lado para pilha vertical em telas $\le 960\text{px}$.

## Elevation & Depth

- **Sombras Funcionais:** Sombras leves e suaves com difusão orgânica:
  - Cartão em repouso: `0 2px 8px rgba(15, 23, 42, 0.06)`
  - Cartão em foco / hover: `0 8px 20px rgba(15, 23, 42, 0.12)`
- **Camadas (Z-Index):**
  - Conteúdo padrão: `1`
  - Sticky Headers: `40`
  - Sidebar: `50`
  - Backdrop móvel: `95`
  - Modais: `100`
  - Skip link (Acessibilidade): `120`

## Shapes

- **Raios de Curvatura:**
  - Controles pequenos e badges: `6px` (`var(--raio-sm)`)
  - Cartões e painéis: `10px` a `16px` (`var(--raio-md)` / `var(--raio-lg)`)
  - Pílulas e chips de status: `999px` (`var(--raio-pilula)`)

## Components

1. **Botões (`.btn`):**
   - Altura mínima e área de toque: $\ge 44\text{px}$ em dispositivos móveis.
   - Variantes semânticas: `.btn-primario`, `.btn-secundario`, `.btn-neutro`, `.btn-perigo`, `.btn-branco`.
   - Estados de interação: foco visível via `:focus-visible`, micro-escala ao toque (`:active`), opacidade reduzida em `:disabled`.
2. **Wayfinding & Navegação (`Breadcrumb`, `NavMenu`, `ProgressTrail`):**
   - Breadcrumbs com `aria-label="Você está aqui"`, botão compacto de retorno em telas $\le 640\text{px}$ e marcação `aria-current="page"` no último item.
   - Pistas visuais dos 3 eixos BNCC indicando cor de seção, ícone e padrão de borda.
3. **Laboratório 3D Python (`jogador-python3d.js` + `cena3d.js`):**
   - Alternância fluida entre visualização 3D Three.js e grade 2D leve para compatibilidade universal.
   - Redimensionamento reativo via `ResizeObserver` na camada canvas para evitar distorção de aspecto.
   - Editor de código monoespaçado com numeração de linhas, trava de cursor no modo navegador (Pair Programming) e `min-width: 0` para evitar estouro de grelha CSS.
4. **Tabelas de Relatório Pedagógico:**
   - Headers com escopo semântico (`scope="col"`), células com alinhamento vertical centralizado e rolagem tátil isolada.

## Do's and Don'ts

### Do's:
- Sempre usar múltiplos de `var(--espaco-*)` para margens, espaçamentos internos e gaps.
- Sempre envolver tabelas em contêineres `.tabela-scroll` com largura máxima de 100%.
- Sempre garantir que qualquer elemento interativo (botão, link, aba, checkbox) tenha área de clique $\ge 44\times 44\text{px}$ em telas móveis.
- Sempre manter contraste de texto $\ge 4.5:1$ (WCAG AA) e anel de foco bem definido em `:focus-visible`.
- Sempre testar o comportamento em `320px`, `360px`, `768px`, `1024px` e `1366px`.

### Don'ts:
- Nunca utilizar larguras fixas em pixels (`width: 500px`) sem `max-width: 100%`.
- Nunca remover o `outline` de foco sem fornecer substituto de alto contraste equivalente.
- Nunca aplicar `overflow-x: hidden` no `body` como paliativo para esconder elementos quebrados; conserte a raiz do elemento que ultrapassa o viewport.
- Nunca usar tamanhos de fonte estáticos menores que 16px em campos de formulário móveis.
- Nunca ignorar o suporte a `prefers-reduced-motion` em animações GSAP ou transições 3D.


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
  success: "#15803d"
  info: "#0369a1"
  neutral-bg: "#f4f6fa"
  card-bg: "#ffffff"
  text-main: "#1a202c"
  text-muted: "#475569"
  border: "#e2e8f0"
  border-subtle: "#cbd5e1"
  focus-ring: "#dd6b20"
  axis-pensamento: "#1d4ed8"
  axis-pensamento-bg: "#eff6ff"
  axis-pensamento-border: "#93c5fd"
  axis-mundo: "#047857"
  axis-mundo-bg: "#ecfdf5"
  axis-mundo-border: "#6ee7b7"
  axis-cultura: "#b45309"
  axis-cultura-bg: "#fffbeb"
  axis-cultura-border: "#fcd34d"
  dark-bg: "#0b1120"
  dark-card-bg: "#111827"
  dark-border: "#1e293b"
  dark-text-main: "#f1f5f9"
  dark-text-muted: "#94a3b8"
  dark-primary-link: "#93c5fd"
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
  small:
    fontFamily: "Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "clamp(0.8rem, 0.77rem + 0.15vw, 0.88rem)"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  micro:
    fontFamily: "Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.04em"
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.88rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  icons:
    fontFamily: "Material Symbols Outlined, sans-serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "20px"
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
  breadcrumb-link:
    textColor: "{colors.primary-accent}"
    height: "28px"
    padding: "4px 6px"
    rounded: "{rounded.sm}"
  likert-option:
    rounded: "{rounded.sm}"
    height: "48px"
    width: "44px"
    padding: "6px 4px"
---

# Diretrizes Visuais e Sistema de Design Consolidado — LMS COMPASSO

## Overview

O **LMS COMPASSO** adota uma linguagem visual sóbria, pedagógica, altamente legível e estritamente acessível (**WCAG 2.2 Nível AA**), desenvolvida sob medida para a Educação Básica pública brasileira (Ensino Fundamental II e Médio). A interface prioriza:

1. **Baixa Sobrecarga Cognitiva:** Design previsível, agrupamento semântico por cartões e sinalização inequívoca de wayfinding ("Você está aqui").
2. **Resiliência a Dispositivos de Entrada:** Excelente ergonomia e performance comprovada em smartphones Android modestos (**Samsung Galaxy A03 / Galaxy A05 a 360px** com proporção 20:9 HD+), notebooks escolares (**1366x768**) e monitores desktop (**1080p a 1440p**).
3. **Eficiência sob Redes Concorridas (3G Escolar):** Ativos vetoriais SVG, tipografia de sistema (evitando bloqueio de renderização por fontes web pesadas), carregamento sob demanda do Three.js e fallback bidimensional automático.
4. **Alinhamento Curricular BNCC:** Sistema cromático e iconográfico dedicado aos 3 eixos da BNCC Computação:
   - **Pensamento Computacional** (Algoritmos, Decomposição, Reconhecimento de Padrões)
   - **Mundo Digital** (Hardware, Arquitetura da CPU, Circuitos e Redes TCP/IP)
   - **Cultura Digital** (Segurança, Cidadania, Ética, Privacidade e IA)

Este documento segue a especificação canônica do **Impeccable** (`pbakaus/impeccable`) e atua como fonte da verdade para design tokens, componentes, regras espaciais e testes de usabilidade com turmas piloto (ISO 9241-11 e escala psicométrica SUS).

---

## Colors

A paleta de cores estrutura-se em pilares funcionais rigorosamente contrastados, com contraste superior a `4.5:1` para texto comum e superior a `7:1` para superfícies de leitura:

### 1. Paleta Semântica e Institucional
- **Primária Institucional (`#2c5282` / `#1a365d`):** Azul corporativo educacional utilizado em títulos institucionais, cabeçalhos, botões principais e elementos de marca.
- **Destaque Interativo (`#2563eb`):** Azul vibrante para links visitáveis, indicadores de seleção e estados ativos.
- **Sucesso Pedagógico (`#15803d` / `#22c55e`):** Verde seguro para badges de conclusão, POST de hardware aprovado e requisitos atendidos.
- **Aviso e Atenção (`#b7791f` / `#f59e0b`):** Âmbar para dicas de atenção, senhas moderadas e passos pendentes.
- **Perigo e Erro (`#c53030` / `#dc2626`):** Vermelho com fundo rosado (`#fef2f2`) para validações de formulário inválidas (`aria-invalid="true"`).
- **Foco Acessível (`#dd6b20` / `#1d4ed8`):** Anel de foco de alto contraste visível em navegação por teclado (`3px` sólido com `2px` de offset).
- **Superfícies Neutras (`#f4f6fa` fundo / `#ffffff` cartões):** Contraste calibrado contra o texto principal (`#1a202c`) com índice de contraste de `11.8:1`.

### 2. Identificadores Cromáticos dos Eixos BNCC
| Eixo BNCC | Cor de Acento | Fundo Contextual | Borda de Contenção | Pista Visual |
| :--- | :---: | :---: | :---: | :---: |
| **Pensamento Computacional** | `#1d4ed8` | `#eff6ff` | `#93c5fd` | Indicador lateral e crachá azul |
| **Mundo Digital** | `#047857` | `#ecfdf5` | `#6ee7b7` | Indicador lateral e crachá verde |
| **Cultura Digital** | `#b45309` | `#fffbeb` | `#fcd34d` | Indicador lateral e crachá âmbar |

### 3. Modo de Alto Contraste (`.a11y-alto-contraste`)
Ativado explicitamente pelo usuário ou quando o sistema operacional reporta `prefers-contrast: more`:
- Fundo escuro absoluto (`#000000`) com texto em branco total (`#ffffff`).
- Bordas sólidas amarelas (`#ffff00`) ou ciano (`#00ffff`) em cartões e botões.
- Contraste medido: `21:1` (nível AAA).

---

## Typography

A tipografia do LMS COMPASSO combina a pilha nativa do sistema operacional com a escala tipográfica fluida `clamp()`:

### 1. Pilhas Tipográficas
- **Interface e Conteúdo Geral:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` (zero download de fontes, renderização imediata sem FOUT/FOIT).
- **Código, Endereços IP e BNCC:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace`.
- **Ícones Vetoriais:** `Material Symbols Outlined` via sprite SVG universal (`icons-sprite.svg`), garantindo renderização nítida em qualquer densidade de pixels (DPI 1.5x a 3x).

### 2. Escala Fluida com `clamp()`
Nenhuma tipografia de cabeçalho possui valor fixo em pixels:
- **H1 (Título da Página):** `clamp(1.6rem, 1.2rem + 1.8vw, 2.4rem)` — escala de 25.6px em 320px até 38.4px em 1920px.
- **H2 (Títulos de Seção):** `clamp(1.3rem, 1.05rem + 1.2vw, 1.85rem)`.
- **H3 (Títulos de Módulo / Card):** `clamp(1.1rem, 0.95rem + 0.7vw, 1.35rem)`.
- **Corpo de Texto:** `clamp(0.92rem, 0.88rem + 0.25vw, 1.05rem)`.
- **Texto Pequeno / Legendas:** `clamp(0.8rem, 0.77rem + 0.15vw, 0.88rem)`.
- **Micro-rótulos:** `0.6875rem` (`11px`) com peso `700` e caixa-alta.

### 3. Regras de Ergonomia de Leitura
- **Comprimento de Linha (Measure):** Blocos de texto contínuo são limitados a `65ch–75ch` (`max-width: 70ch`), evitando fadiga ocular em telas largas.
- **Entradas Móveis sem Zoom no iOS:** Todos os elementos interativos de formulário (`input`, `select`, `textarea`) possuem `font-size: max(16px, 1rem)` em telas $\le 640\text{px}$, impedindo o zoom automático agressivo do Safari móvel.

---

## Layout

O sistema segue a arquitetura **Mobile-First Estruturada** baseada na grade de múltiplos de 4px e 8px:

### 1. Escala Espacial Modular
- `--espaco-1`: `4px` (micro-espaçamentos de ícones e badges)
- `--espaco-2`: `8px` (gaps de botões compactos e margens internas)
- `--espaco-3`: `12px` (gaps entre cartões em telas compactas)
- `--espaco-4`: `16px` (padding padrão de cartões móveis)
- `--espaco-5`: `20px` (padding de cartões desktop)
- `--espaco-6`: `24px` (gaps de grid e separação de seções)
- `--espaco-8`: `32px` (respiro entre blocos de conteúdo)
- `--espaco-12`: `48px` (margem entre seções pedagógicas)
- `--espaco-16`: `64px` (padding vertical das seções principais)

### 2. Breakpoints Oficiais
| Classe | Intervalo | Características de Layout |
| :--- | :---: | :--- |
| **Mobile Entrada** (Galaxy A03/A05) | `320px–480px` | Coluna única (`1fr`), cabeçalho com wrap e navegação com rolagem horizontal touch (`-webkit-overflow-scrolling: touch`), botões esticados para 100% de largura, padding de seção reduzido para 24–32px. |
| **Tablet Retrato** | `481px–768px` | Grades duplas balanceadas (`grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)`), menus condensados. |
| **Notebook Escolar** | `769px–1024px` | Grades de 2 a 3 colunas, painéis de inspeção laterais ativos, tabelas largas com `.tabela-scroll`. |
| **Desktop / Monitores** | `1025px–1920px` | Limite máximo centralizado em 1120px ou 1200px (`margin-inline: auto`), visualização lado a lado no laboratório 3D. |

### 3. Regra Inviolável de Zero Rolagem Horizontal
Em nenhuma circunstância o documento principal deve permitir `scrollWidth > clientWidth`. As regras protetivas universais são:
1. `overflow-x: clip` no cabeçalho sticky e contêineres superiores.
2. Todas as grelhas flexíveis utilizam `minmax(min(100%, 280px), 1fr)`.
3. Contêineres flex ou grid que contenham texto longo ou itens dinâmicos declaram explicitamente `min-width: 0; box-sizing: border-box;`.
4. Tabelas pedagógicas usam contêiner `.tabela-scroll` com `overflow-x: auto` e `max-width: 100%`.

---

## Elevation & Depth

O design utiliza profundidade funcional sutil para hierarquia e foco:

### 1. Camadas de Sombra (Tiers)
- **Repouso (`--sombra-card`):** `0 2px 8px rgba(15, 23, 42, 0.06)` — cartões de atividades e painéis estáticos.
- **Elevação Táctil / Hover (`--sombra-hover`):** `0 8px 20px rgba(15, 23, 42, 0.12)` acompanhado de `transform: translateY(-2px)`.
- **Holográfico Escuro (Mundo Digital):** `0 16px 36px rgba(0, 0, 0, 0.6)` com borda fina translúcida `rgba(255, 255, 255, 0.1)`.

### 2. Perspectiva Tridimensional Isolada
- Palcos 3D utilizam `perspective: 1000px` encapsulado em contêiner com `overflow: hidden; box-sizing: border-box;`.
- Rotações em 3D (`transform-style: preserve-3d`) possuem escalas graduadas por breakpoint:
  - Desktop: `scale(0.92)`
  - Tablet: `scale(0.74)`
  - Mobile (360px): `scale(0.52)` com rotação atenuada (`rotateX(22deg) rotateZ(-8deg)`).

### 3. Hierarquia de Camadas Z-Index
- Camada base de conteúdo: `z-index: 1`
- Controles e badges flutuantes: `z-index: 10`
- Topo Sticky / Barra Superior: `z-index: 100`
- Gaveta de navegação móvel / Sidebar: `z-index: 150`
- Modais e Diálogos de Confirmação: `z-index: 500`
- Skip Link acessível (focado): `z-index: 1000`

---

## Shapes

- **Bordas Arredondadas (Radius):**
  - `--raio-sm`: `6px` (badges de habilidade BNCC, links de breadcrumb, inputs pequenos).
  - `--raio-md`: `10px` (botões padrão, itens de lista de etapas).
  - `--raio-lg`: `16px` (cartões de atividades, caixas de missões).
  - `--raio-xl`: `20px` (painéis holográficos e cofre digital).
  - `--raio-pilula`: `9999px` (chips de status, contadores de progresso e leds).

---

## Components

### 1. Botões de Ação (`.btn`)
- **Ergonomia Táctil:** Altura mínima de `44px` (`min-height: 44px;`) e largura de 100% em telas móveis quando empilhados.
- **Tipos Semânticos:**
  - `.btn-primario`: Ação dominante da página (azul institucional `#2c5282`).
  - `.btn-secundario`: Ações de suporte e navegação intermediária.
  - `.btn-contorno-claro`: Botões sobre fundos escuros com borda translúcida.
  - `.btn-perigo`: Exclusão de matrículas ou reset com aviso.

### 2. Wayfinding e Navegação (`Breadcrumb`, `NavMenu`, `ProgressTrail`)
- **Breadcrumb:** Declara `aria-label="Você está aqui"`, com `aria-current="page"` no último item. Links possuem área de clique $\ge 28\text{px}$ com padding táctil.
- **Botão de Retorno Mobile:** Em telas $\le 640\text{px}$, exibe botão contextual `← Voltar para [Etapa Anterior]` com tamanho $\ge 44\text{px}$.

### 3. Simulador 3D da Placa-Mãe e Ciclo da CPU (`mundo-digital.html`)
- **Acessibilidade WCAG 2.5.3 (Label in Name):** Todos os botões interativos de hardware declaram rótulos acessíveis iniciados pelo texto visível (`CPU Processador Central`, `NVMe M.2 Armazenamento SSD`, `PCIe 4.0 x16 (Placa de Vídeo) GPU Dedicada`, `Portas I/O`).
- **Controles de Perspectiva:** Botões `.btn-vista` reorganizam-se em `flex-direction: column` com largura total no celular.

### 4. Mensageiro e Cofre Digital (`cultura-digital.html`)
- **Truncamento de Conversas:** `.cd-conversa-previa` declarado como bloco com `text-overflow: ellipsis; white-space: nowrap; max-width: 100%`.
- **Prevenção de Zoom no iOS:** Campo de senha e inputs de mensagem com `font-size: max(16px, 1rem)`.

### 5. Escala Psicométrica SUS da Turma Piloto (`usabilidade-piloto.html`)
- **Alvos de Toque:** Cada uma das 5 opções da escala Likert (1 a 5) em todas as 10 perguntas possui `min-height: 48px; min-width: 44px;` com transição visual de toque e anel de foco visível.
- **Botão de Envio:** Largura de 100% no mobile e altura de 48px para facilidade de envio com o polegar.

---

## Do's and Don'ts

### Do's:
- **Faça:** Sempre respeite alvos de toque mínimos de `44x44px` para botões principais e `48px` em formulários móveis.
- **Faça:** Sempre utilize a escala fluida com `clamp()` e espaçamento modular em múltiplos de 4/8px.
- **Faça:** Sempre envolva tabelas de diário de classe e dados pedagógicos em contêineres `.tabela-scroll`.
- **Faça:** Sempre mantenha o anel de foco `:focus-visible` bem definido (`3px` com offset `2px`).
- **Faça:** Sempre teste layouts no perfil de smartphone modesto Android (360x800 a 3G lento).

### Don'ts:
- **Não faça:** Nunca utilize larguras fixas em pixels (`width: 400px`) sem declarar `max-width: 100%`.
- **Não faça:** Nunca aplique `overflow-x: hidden` no elemento `body` para disfarçar elementos transbordando; corrija a causa raiz no contêiner afetado.
- **Não faça:** Nunca use fontes estáticas menores que 16px em inputs móveis.
- **Não faça:** Nunca crie botões interativos cujo `aria-label` não contenha o texto visível impresso na tela (WCAG 2.5.3).
- **Não faça:** Nunca remova transições suaves quando o usuário não tiver habilitado `prefers-reduced-motion`.

# Direção de Arte, Design Tokens & Ativos do Notion — LMS COMPASSO

Este guia consolida a extração exata de tokens visuais de `DESIGN.md` e `public/css/style.css`, as especificações técnicas para ativos do Notion e as **Fichas de Direção de Arte** para ilustrações conceituais do projeto.

---

## 1. Tokens Extraídos do Design System Real

| Papel Semântico | Token CSS / `DESIGN.md` | Hex (Light / Dark) | Equivalente OKLCH Aproximado |
| :--- | :--- | :--- | :--- |
| **Primária Institucional** | `--cor-primaria` (`primary`) | `#2c5282` / `#2563eb` | `oklch(0.45 0.11 254)` / `oklch(0.55 0.21 261)` |
| **Primária Escura** | `--cor-primaria-escura` | `#1a365d` / `#1e3a8a` | `oklch(0.33 0.09 255)` |
| **Secundária / Sucesso** | `--cor-secundaria-suave` | `#38a169` / `#6ee7b7` | `oklch(0.63 0.14 152)` / `oklch(0.84 0.12 162)` |
| **Eixo 1 — Pensamento Computacional** | `--cor-secao-pensamento` | `#1d4ed8` / `#93c5fd` | `oklch(0.48 0.21 264)` / `oklch(0.81 0.10 251)` |
| **Eixo 2 — Mundo Digital** | `--cor-secao-mundo` | `#047857` / `#6ee7b7` | `oklch(0.50 0.11 163)` / `oklch(0.84 0.12 162)` |
| **Eixo 3 — Cultura Digital** | `--cor-secao-cultura` | `#b45309` / `#fcd34d` | `oklch(0.55 0.14 58)` / `oklch(0.86 0.14 86)` |
| **Superfície / Fundo** | `--cor-fundo` / `--cor-cartao` | `#f8fafc` / `#0b1120` | `oklch(0.98 0.004 247)` / `oklch(0.16 0.03 262)` |
| **Raios & Sombras** | `--radius-sm/md/lg` | `6px` / `10px` / `16px` | Sombras suaves `0 1px 3px rgba(0,0,0,0.04)` |
| **Tipografia** | `Segoe UI, Roboto, system-ui` | Fluida `clamp()` | Monoespaçada: `ui-monospace, Consolas, monospace` |

---

## 2. Especificações Técnicas dos Ativos Entregues

### 2.1. Covers / Banners do Notion (`1500x600px`, Proporção `5:2`, Zona Segura `900x350px`)
- `public/img/notion/cover-lms-compasso-1500x600.svg` — Capa principal do workspace Notion com emblema isométrico do compasso e selo dos 3 Eixos dentro da zona segura central (`x=300..1200`, `y=125..475`).
- `public/img/notion/cover-eixos-bncc-1500x600.svg` — Capa de trilhas pedagógicas com os três cards estruturantes da BNCC Computação rigorosamente centralizados nos `900x350px`.

### 2.2. Ícones de Página do Notion (`280x280px`, Proporção `1:1`, Transparente, `stroke-width="2"`)
Projetados com `viewBox="0 0 28 28"` e `stroke-width="2"` para manter legibilidade perfeita tanto em `24x24px` (sidebar do Notion) quanto em `280x280px`, adaptando-se automaticamente ao tema claro e escuro via `@media (prefers-color-scheme: dark)`:
- `public/img/notion/icon-pensamento-computacional-280x280.svg`
- `public/img/notion/icon-mundo-digital-280x280.svg`
- `public/img/notion/icon-cultura-digital-280x280.svg`
- `public/img/notion/icon-governanca-lgpd-280x280.svg`

### 2.3. Ilustrações Web Vetoriais (`currentColor` + Variáveis CSS)
- `public/img/ilustracoes/empty-state-trilha.svg` — Empty state para buscas e trilhas sem resultados.
- `public/img/ilustracoes/hero-onboarding-bncc.svg` — Ilustração modular de onboarding dos três eixos conectados ao compasso.

---

## 3. Fichas de Direção de Arte (Ilustrações Conceituais Complexas)

### Ficha 1 — Hero Onboarding: "O Compasso do Conhecimento Computacional"
1. **Conceito & Metáfora Visual:** Um compasso escolar minimalista flutuando sobre um tabuleiro modular isométrico onde blocos lógicos, um microprocessador translúcido e um escudo luminoso convergem em uma trilha ascendente. Comunica aprendizado guiado, clareza pedagógica e conexão entre o mundo físico e digital sem depender de texto.
2. **Paleta Restrita:** Fundo `#f8fafc` (Light) / `#0b1120` (Dark) | Elemento principal `#2c5282` e `#1a365d` | Destaques `#38a169`, `#1d4ed8` e `#b45309`.
3. **Prompt Técnico (EN):**
   > Isometric educational drafting compass hovering above an interactive modular grid of logic blocks, a subtle glowing microchip, and a minimalist security shield connected by clean light pathways, centered balanced composition with generous negative space, crisp editorial isometric vector-3D hybrid style with soft matte glassmorphism accents, soft diffused studio lighting with gentle top-left key light, restricted palette using deep slate navy #0b1120, institutional blue #2c5282, vibrant cobalt #1d4ed8, emerald #38a169, and warm amber #b45309 on clean light slate #f8fafc background, no text, no letters, no watermarks, no photorealistic skin or cluttered textures.

### Ficha 2 — Laboratório 3D Python: "Robótica em Sala de Aula Sem Fricção"
1. **Conceito & Metáfora Visual:** Um pequeno robô geométrico articulado percorre um labirinto limpo em perspectiva isométrica desviando de poças d'água estilizadas e coletando cristais de algoritmo. Comunica experimentação prática, erro seguro e pensamento lógico espacial.
2. **Paleta Restrita:** Fundo `#0b1120` | Elemento principal `#2563eb` e `#f1f5f9` | Destaque `#38a169` e `#fbbf24`.
3. **Prompt Técnico (EN):**
   > Friendly minimalist geometric educational robot navigating an isometric tiled puzzle grid with stylized turquoise water puddles and a glowing golden algorithm crystal, centered 3/4 isometric composition, clean low-poly editorial 3D illustration style inspired by tactile educational blocks, soft rim lighting and gentle ambient occlusion, color palette deep midnight #0b1120, cobalt blue #2563eb, off-white #f1f5f9, emerald #38a169, and amber gold #fbbf24, no text, no code snippets, no HUD overlays, no harsh neon glare.

### Ficha 3 — Mundo Digital: "Anatomia Transparente da CPU e Redes"
1. **Conceito & Metáfora Visual:** Uma placa-mãe didática com camadas isométricas separadas suavemente em eixo vertical (memória, CPU, barramento e pacotes luminosos), revelando como a informação viaja sem intimidar o estudante.
2. **Paleta Restrita:** Fundo `#ecfdf5` (Light) / `#111827` (Dark) | Elemento principal `#047857` e `#1a365d` | Destaque `#6ee7b7`.
3. **Prompt Técnico (EN):**
   > Exploded isometric architectural diagram of an educational computer motherboard with separated floating layers for CPU core, memory blocks, and glowing data packets flowing along geometric bus traces, centered vertical stack composition, minimalist technical illustration style with crisp 2px outlines and subtle depth shadows, palette deep emerald #047857, mint #6ee7b7, slate navy #1a365d, and clean alabaster #f8fafc, no text labels, no cluttered wires, no photorealism, no dark grunge.

### Ficha 4 — Cultura Digital & Governança LGPD: "Cidadania e Escudo de Dados Escolares"
1. **Conceito & Metáfora Visual:** Um escudo geométrico translúcido envolve um caderno escolar e um cadeado estilizado com linhas de circuito suaves, simbolizando privacidade ativa, ética digital e proteção de estudantes na web.
2. **Paleta Restrita:** Fundo `#fffbeb` (Light) / `#0b1120` (Dark) | Elemento principal `#2c5282` e `#b45309` | Destaque `#fcd34d` e `#38a169`.
3. **Prompt Técnico (EN):**
   > Translucent frosted-glass geometric shield protecting a minimalist student notebook and a clean rounded padlock connected to delicate circuit nodes, centered symmetrical composition with breathing margins, modern editorial flat-isometric illustration style with consistent clean strokes, palette warm amber #b45309, soft gold #fcd34d, institutional blue #2c5282, and emerald #38a169 on neutral #f8fafc background, no text, no padlocks with keyholes full of noise, no scary dark hacker imagery.

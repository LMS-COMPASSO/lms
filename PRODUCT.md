# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Professores e Instrutores da Educação Básica (Ensino Fundamental I e II):** Educadores que planejam aulas, aplicam atividades, acompanham o nível de consolidação de cada habilidade BNCC por turma e precisam lançar notas e frequências em diários de classe oficiais sem atrito ou jargão técnico.
- **Gestores Escolares, Coordenadores e Secretarias Municipais de Educação (SME):** Gestores públicos que necessitam de visão panorâmica e relatórios executivos para comprovar o cumprimento das metas curriculares da BNCC Computação (Resolução CNE/CP nº 1/2022) e zelar pelo limite saudável de tempo de tela (Resolução CNE nº 2/2025).
- **Estudantes do Ensino Fundamental (1º ao 9º ano):** Crianças e adolescentes (6 a 14 anos) em desenvolvimento do pensamento computacional, cultura digital e letramento tecnológico através de trilhas sequenciais, desafios práticos, programação em blocos e laboratório 3D em Python.

## Product Purpose

O **LMS COMPASSO** é uma plataforma aberta, leve e serverless de Gestão de Aprendizagem projetada para viabilizar a implementação prática da Base Nacional Comum Curricular (BNCC) para a Computação na Educação Básica. Seu propósito é universalizar o ensino de computação nas escolas públicas, oferecendo recursos completos tanto para ambientes conectados quanto para realidades com infraestrutura limitada ou sem internet (atividades desplugadas). O sucesso é medido pela consolidação efetiva das habilidades curriculares pelos estudantes e pela autonomia dos professores ao conduzir as atividades.

## Positioning

- **100% Alinhado à BNCC Computação:** Cobertura integral e estruturada nos 3 eixos oficiais (*Pensamento Computacional*, *Mundo Digital* e *Cultura Digital*) com progressão pedagógica do 1º ao 9º ano.
- **Suporte Nativo à Computação Desplugada:** Fichas em PDF para impressão e roteiros práticos que viabilizam o aprendizado em turmas sem laboratórios de informática ou sem conectividade.
- **Laboratório Python 3D no Navegador & Simuladores Temáticos:** Execução local de Python via WebAssembly (Pyodide v0.26.2 + Three.js r128) com modo colaborativo em dupla (*piloto* e *navegador*), somada aos simuladores de hardware/redes (`mundo-digital.html`) e cidadania digital (`cultura-digital.html`).
- **Monitoramento do Tempo de Tela:** Gestão ativa e métricas de equilíbrio entre interação digital e dinâmicas físicas, atendendo às recomendações da Resolução CNE nº 2/2025.
- **Arquitetura Serverless de Custo Zero:** Executado integralmente no Cloudflare Workers (Edge API + Assets estáticos) e Cloudflare D1 (`lms_prod`), eliminando gastos com servidores dedicados para redes municipais.
- **Foco Duplo no Dashboard:** Painel que unifica a gestão pedagógica detalhada de sala de aula (consolidação por habilidade, submissões Python e exportação em CSV) com a síntese de indicadores executivos para a Secretaria de Educação.
- **Governança e Privacidade Escolares (LGPD/GDPR):** Transparência no tratamento de dados estudantis com políticas dedicadas (`/privacy` e `/terms`), zero cookies de rastreamento e exportação de portabilidade JSON (`GET /api/auth/exportar-dados`).

## Operating Context

- Salas de aula, laboratórios escolares e secretarias de escolas municipais e estaduais com ampla variedade de infraestrutura e qualidade de banda (3G escolar e ambientes offline/desplugados).
- Dispositivos heterogêneos: smartphones Android de entrada (`360px` / Samsung Galaxy A03/A05), notebooks escolares (`1366x768`), tablets e monitores desktop.
- Rotinas de trabalho: planejamento pedagógico periódico, avaliações formativas, programação em dupla, pesquisa psicométrica de usabilidade SUS (Brooke, 1996) com turmas piloto, exportação de relatórios para diários de classe escolares e reuniões pedagógicas.
- Articulação e validação acadêmica vinculada ao Instituto Federal do Maranhão (IFMA) — Campus Grajaú (Projeto de Inovação SUAP/IFMA nº 14246/2025).

## Capabilities and Constraints

- **Stack Técnica:** Cloudflare Workers (Edge API + `env.ASSETS`), Cloudflare D1 (`lms_prod` SQLite serverless), HTML5 semântico, Vanilla CSS modular e Vanilla JavaScript (ES modules). Ícones via Google Material Symbols Outlined e sprite SVG próprio, microanimações via GSAP (`3.12.5`), cenas 3D com Three.js (`r128`) e runtime Python local via Pyodide (`v0.26.2`) em Web Worker.
- **Recursos Principais:** Controle de acesso RBAC (`administrador`, `instrutor`, `aluno`), login convencional e **Google Acadêmico** (Google Identity Services OAuth2/RS256), catálogo de cursos/módulos/aulas por eixo BNCC, avaliações com deduplicação e correção automática, simulador de blocos e Laboratório 3D Python, gamificação pedagógica (medalhas BNCC), certificados digitais A4 com validação pública, **suporte a 9 idiomas (`i18n.js`)**, avaliação SUS (`usabilidade-piloto.html`), planos institucionais e contratação pública (`planos.html`), exportação de diários em CSV e portabilidade LGPD em JSON.
- **Restrições de Engenharia:** Sem frameworks pesados no cliente (sem React, Vue ou Tailwind; frontend 100% HTML5 semântico, CSS modular e Vanilla JS estático em `public/`), priorizando máxima velocidade e consumo mínimo de dados no Edge; autenticação JWT HS256 (TTL 8h), hashing PBKDF2-SHA256 (100.000 iterações + salts individuais) e cabeçalhos de defesa MDN Web Security.
- **Terminologia Normativa:** Eixos "Pensamento Computacional", "Mundo Digital", "Cultura Digital"; códigos de habilidades da BNCC (ex.: `EF01CO01`, `EF06CO04`); segmentos Ensino Fundamental I (1º ao 5º ano) e Ensino Fundamental II (6º ao 9º ano).

## Brand Commitments

- **Nome:** LMS COMPASSO — Computação na Educação Básica, alinhada à BNCC.
- **Instituição de Apoio:** IFMA Campus Grajaú (Projeto de Inovação SUAP/IFMA nº 14246/2025 · Startup LMS COMPASSO).
- **Tom de Voz:** Institucional, didático, encorajador e transparente; acessível a educadores que não possuem formação prévia em Ciência da Computação.
- **Identidade Visual:** Paleta institucional de alto contraste (`#2c5282`, `#1a365d`, `#2563eb`), cores semânticas por eixo BNCC (Pensamento Computacional `#1d4ed8`, Mundo Digital `#047857`, Cultura Digital `#b45309`) e tipografia de sistema (`Segoe UI, Roboto, system-ui, sans-serif`) combinada a `Material Symbols Outlined` e `Cinzel`/`Inter` na impressão de certificados.

## Evidence on Hand

- Sistema em produção oficial na Cloudflare: `https://lms.thedelacosta.workers.dev/`
- Documentação pedagógica, técnica e jurídica: `docs/bncc-computacao.md`, `docs/politica-de-privacidade.md`, `docs/termos-de-servico.md`, `docs/direcao-de-arte-notion-ativos.md`
- Banco de dados relacional populado com esquema D1 e seeds representativos: `d1/schema.sql`, `d1/seed.sql`
- Suíte automatizada com **102 testes unitários** validados em `tests/`, além de suítes E2E Playwright, axe-core e regressão visual em `tests/e2e/` e testes Python em `tests/python/`
- **21 páginas HTML** ativas em `public/` (incluindo `index.html`, `boas-vindas.html`, `atividades.html`, `mundo-digital.html`, `cultura-digital.html`, `planos.html`, `usabilidade-piloto.html`, `dashboard.html`, `perfil.html`, `login.html`, `privacy.html` e `terms.html`)
- Ativos gráficos institucionais, covers e ícones para Notion em `public/img/notion/` e ilustrações vetoriais em `public/img/ilustracoes/`

## Product Principles

- **Equidade e Universalidade:** O sistema deve entregar excelência pedagógica tanto no laboratório conectado quanto na sala de aula sem internet com atividades impressas.
- **Pedagogia no Centro:** A tecnologia atua como facilitadora invisível; a interface orienta a aprendizagem e o planejamento sem fricção técnica.
- **Transparência Auditável:** Todos os índices de consolidação de habilidades, equilíbrio de tempo de tela e tratamento de dados pessoais devem ser claros, verificáveis e facilmente exportáveis.
- **Eficiência e Leveza:** Zero código desnecessário no cliente; tempos de resposta instantâneos e respeito ao plano de dados do usuário.

## Accessibility & Inclusion

- Alinhamento rigoroso às diretrizes **WCAG 2.2 nível AA**.
- Preferências persistidas no banco D1 (`preferencias_usuario`) e aplicadas antes da renderização para evitar flash visual: **Alto Contraste**, **Texto Ampliado (+15%)**, **Reduzir Animações** e **Tema Claro / Escuro / Sistema**.
- Navegação completa por teclado com estados de foco visíveis, links de salto (`pular-conteudo`) e estruturação semântica de marcos (`header`, `main`, `nav`, `section`).
- Contraste de cores seguro para projeção em salas de aula e telas de baixo brilho.
- Textos alternativos para elementos visuais e ícones acompanhados de rótulos acessíveis, além de validação automatizada contínua via `@axe-core/playwright`.
- Layout responsivo fluido de `320px`–`360px` a desktops de alta resolução, incluindo suporte a impressão em folha A4.

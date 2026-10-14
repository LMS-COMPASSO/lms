# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Professores e Instrutores da Educação Básica (Ensino Fundamental I e II):** Educadores que planejam aulas, aplicam atividades, acompanham o nível de consolidação de cada habilidade BNCC por turma e precisam lançar notas e frequências em diários de classe oficiais sem atrito ou jargão técnico.
- **Gestores Escolares, Coordenadores e Secretarias Municipais de Educação (SME):** Gestores públicos que necessitam de visão panorâmica e relatórios executivos para comprovar o cumprimento das metas curriculares da BNCC Computação (Resolução CNE/CP nº 1/2022) e zelar pelo limite saudável de tempo de tela (Resolução CNE nº 2/2025).
- **Estudantes do Ensino Fundamental (1º ao 9º ano):** Crianças e adolescentes (6 a 14 anos) em desenvolvimento do pensamento computacional, cultura digital e letramento tecnológico através de trilhas sequenciais, desafios práticos e programação em blocos.

## Product Purpose

O **LMS COMPASSO** é uma plataforma aberta, leve e serverless de Gestão de Aprendizagem projetada para viabilizar a implementação prática da Base Nacional Comum Curricular (BNCC) para a Computação na Educação Básica. Seu propósito é universalizar o ensino de computação nas escolas públicas, oferecendo recursos completos tanto para ambientes conectados quanto para realidades com infraestrutura limitada ou sem internet (atividades desplugadas). O sucesso é medido pela consolidação efetiva das habilidades curriculares pelos estudantes e pela autonomia dos professores ao conduzir as atividades.

## Positioning

- **100% Alinhado à BNCC Computação:** Cobertura integral e estruturada nos 3 eixos oficiais (*Pensamento Computacional*, *Mundo Digital* e *Cultura Digital*) com progressão pedagógica do 1º ao 9º ano.
- **Suporte Nativo à Computação Desplugada:** Fichas em PDF para impressão e roteiros práticos que viabilizam o aprendizado em turmas sem laboratórios de informática ou sem conectividade.
- **Monitoramento do Tempo de Tela:** Gestão ativa e métricas de equilíbrio entre interação digital e dinâmicas físicas, atendendo às recomendações da Resolução CNE nº 2/2025.
- **Arquitetura Serverless de Custo Zero:** Executado integralmente no Cloudflare Workers, Cloudflare D1 e Cloudflare R2, eliminando gastos com servidores dedicados para redes municipais.
- **Foco Duplo no Dashboard:** Painel que unifica a gestão pedagógica detalhada de sala de aula (consolidação por habilidade e exportação em CSV) com a síntese de indicadores executivos para a Secretaria de Educação.

## Operating Context

- Salas de aula, laboratórios escolares e secretarias de escolas municipais e estaduais com ampla variedade de infraestrutura e qualidade de banda.
- Dispositivos heterogêneos: computadores institucionais com hardware modesto, tablets e smartphones de professores e alunos.
- Rotinas de trabalho: planejamento pedagógico periódico, avaliações formativas, exportação de relatórios para diários de classe escolares e reuniões pedagógicas.
- Articulação e validação acadêmica vinculada ao Instituto Federal do Maranhão (IFMA) — Campus Grajaú.

## Capabilities and Constraints

- **Stack Técnica:** Cloudflare Workers (Edge API), Cloudflare D1 (SQLite serverless), HTML5 semântico, Vanilla CSS modular e Vanilla JavaScript (ES modules). Ícones via Google Material Symbols Outlined e microanimações via GSAP.
- **Recursos Principais:** Controle de acesso RBAC (Administrador, Instrutor, Aluno), catálogo de cursos por eixo da BNCC, sala de aula interativa, avaliações com correção automática, simulador de programação em blocos, gamificação pedagógica (medalhas por eixo), emissão de certificados digitais e exportação de diários escolares em CSV.
- **Restrições de Engenharia:** Sem frameworks pesados no cliente (sem React, Vue ou Tailwind), priorizando máxima velocidade e consumo mínimo de dados móveis no Edge; autenticação JWT com PBKDF2-SHA256 e salts individuais.
- **Terminologia Normativa:** Eixos "Pensamento Computacional", "Mundo Digital", "Cultura Digital"; códigos de habilidades da BNCC (ex.: `EF01CO01`, `EF06CO04`); segmentos Ensino Fundamental I (1º ao 5º ano) e Ensino Fundamental II (6º ao 9º ano).

## Brand Commitments

- **Nome:** LMS COMPASSO — Computação na Educação Básica, alinhada à BNCC.
- **Instituição de Apoio:** IFMA Campus Grajaú.
- **Tom de Voz:** Institucional, didático, encorajador e transparente; acessível a educadores que não possuem formação prévia em Ciência da Computação.
- **Identidade Visual:** Paleta profissional com ênfase no azul institucional (`#2563eb`), slate moderno, verde de consolidação pedagógica e gradientes discretos; tipografia limpa (Google Fonts: Inter e Material Symbols).

## Evidence on Hand

- Sistema em produção oficial na Cloudflare: `https://lms.thedelacosta.workers.dev/`
- Documentação pedagógica detalhada: `docs/bncc-computacao.md`
- Banco de dados relacional populado com esquema D1 e seeds representativos: `d1/schema.sql`, `d1/seed.sql`
- Suíte automatizada com 57 testes funcionais validados em `tests/`
- Telas funcionais ativas em `public/` (incluindo `dashboard.html`, `atividades.html`, `perfil.html`, `login.html`)

## Product Principles

- **Equidade e Universalidade:** O sistema deve entregar excelência pedagógica tanto no laboratório conectado quanto na sala de aula sem internet com atividades impressas.
- **Pedagogia no Centro:** A tecnologia atua como facilitadora invisível; a interface orienta a aprendizagem e o planejamento sem fricção técnica.
- **Transparência Auditável:** Todos os índices de consolidação de habilidades e engajamento devem ser claros, verificáveis e facilmente exportáveis para uso oficial.
- **Eficiência e Leveza:** Zero código desnecessário no cliente; tempos de resposta instantâneos e respeito ao plano de dados do usuário.

## Accessibility & Inclusion

- Alinhamento rigoroso às diretrizes WCAG 2.1 nível AA.
- Navegação completa por teclado com estados de foco visíveis e estruturação semântica de marcos (`header`, `main`, `nav`, `section`).
- Contraste de cores seguro para projeção em salas de aula e telas de baixo brilho.
- Textos alternativos para elementos visuais e ícones acompanhados de rótulos acessíveis.
- Layout responsivo fluido de 320px a desktops de alta resolução, incluindo suporte a impressão em folha A4.

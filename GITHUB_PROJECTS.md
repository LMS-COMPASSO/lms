# KANBAN GITHUB PROJECTS & STATUS DE ISSUES — LMS COMPASSO (BNCC COMPUTAÇÃO)

> **Projeto de Inovação SUAP/IFMA nº 14246/2025**  
> **Startup LMS COMPASSO — IFMA Campus Grajaú**  
> **Período do Piloto:** 01/07/2026 a 31/12/2026 | **Versão:** 1.2 (Atualizado em 20/10/2026)  
> **Documento de Referência:** SRS v1.0 & Complemento à BNCC Computação (Resolução CNE/CP nº 1/2022 e CNE/CEB nº 2/2025)

---

## 1. Visão Geral do Quadro Kanban e Governança de Branches

Este documento consolida o status real e auditado de todas as **50 Issues (`#1` a `#51`)** do repositório [`LMS-COMPASSO/lms`](https://github.com/LMS-COMPASSO/lms), sincronizando o código-fonte em produção na branch `main` com o quadro de acompanhamento do projeto.

### Higiene de Branches (Git)
- **Branch Principal Ativa:** `main` (contendo todas as entregas de Frontend, Backend Cloudflare Workers + D1, Laboratório 3D Python, Gamificação, Certificados e Wayfinding Digital).
- **Branches Removidas (Já Mescladas em `main`):**
  - `feat/dashboard-bmc-organizacao-projeto` → Mesclada e removida da origem remota (`origin`).

### Resumo Quantitativo de Status das Issues
| Coluna do Kanban | Status GitHub | Total de Issues | Percentual |
| :--- | :---: | :---: | :---: |
| **Concluído (Done)** | `CLOSED` | **33** | **66%** |
| **Em Progresso (In Progress)** | `OPEN` | **10** | **20%** |
| **Backlog / A Fazer (To Do)** | `OPEN` | **7** | **14%** |
| **Total Geral Auditado** | — | **50** | **100%** |

---

## 2. Itens Concluídos (`Done` / `CLOSED` — Implementados e Testados na `main`)

| Issue | Título | Categoria / Épico | Evidência de Implementação na `main` |
| :---: | :--- | :--- | :--- |
| **#2** | Tela Inicial do site | `frontend` / `duplicate` | Implementada em `public/index.html`, `public/boas-vindas.html` e `public/css/publico.css`. |
| **#3** | Criar telas pós-login com conteúdo e trilhas iniciais | `frontend` | Implementadas em `public/dashboard.html`, `cursos.html`, `curso-detalhe.html`, `atividades.html`, `mundo-digital.html`, `cultura-digital.html`, `matriculas.html`, `certificados.html`, `usuarios.html` e `perfil.html`. |
| **#4** | Criar exemplos de conteúdos no formato estático | `epic:pedagogico` | Catálogo com 21 atividades interativas (`public/js/atividades/catalogo.js`, `python3d.js`) e seed inicial (`d1/seed.sql`). |
| **#5** | Banco de Dados | `database` | Modelagem relacional SQLite/D1 em `d1/schema.sql` e `d1/seed.sql`. |
| **#6** | O sistema deve possuir 3 perfis: Aluno, Instrutor e Admin | `backend` / `duplicate` | RBAC de 3 perfis (`administrador`, `instrutor`, `aluno`) em `src/worker/helpers_utilitarios.js` (`requireRole`) e `public/js/layout.js`. |
| **#7** | Modelo LMS | `documentation` | Arquitetura própria do LMS COMPASSO documentada em `README.md`, `PRODUCT.md` e `docs/`. |
| **#8** | Pipeline de CI/CD no GitHub Actions | `devops` | Workflow `.github/workflows/ci.yml` executando `npm ci`, `npm test` (61 testes) e `npx wrangler deploy --dry-run`. |
| **#10** | Auditoria de Acessibilidade (WCAG 2.1 / 2.2 AA) | `frontend` / `compliance` | Wayfinding de 3s, contraste AA (>= 4.5:1 texto, >= 3:1 ícones SVG), alvos >= 44x44px, navegação por teclado, `aria-live` e painel de Ajustes de Acessibilidade (`public/js/layout.js`). |
| **#11** | Refinamento da Responsividade Mobile em Celulares Pequenos | `frontend` | Mobile-first (360px a 1536px), `.tabela-scroll` em todas as tabelas e menu drawer responsivo. |
| **#12** | Cálculo de Nota e Tentativas em Avaliações | `epic:avaliacao` | Implementado em `src/worker/routes/avaliacoes_rotas.js` e `public/js/atividades/logica.js`. |
| **#13** | Impressão e Download de Certificados em PDF | `duplicate` (#20) | Implementado via renderização A4 paisagem em `src/worker/routes/certificados_rotas.js`. |
| **#14** | Migração Completa do Banco: MySQL ➔ Cloudflare D1 | `database` | Migrado integralmente para Cloudflare D1 (`wrangler.jsonc`, `d1/schema.sql`). |
| **#15** | Backend Serverless em Cloudflare Workers (`index.js`) | `backend` | Implementado de forma modular em `src/worker/index.js` e `src/worker/routes/*.js`. |
| **#16** | Schema D1 Otimizado (`d1/schema.sql`) | `database` | 12 tabelas relacionais + índices em `d1/schema.sql` (incluindo `submissoes_python`, `medalhas`, `desempenho_habilidades`). |
| **#17** | Correção no Endpoint de Alteração de Senha | `bug` / `security` | Corrigido em `src/worker/routes/auth_rotas.js` com verificação e migração automática para PBKDF2. |
| **#18** | Correção no Cancelamento de Matrícula | `bug` / `backend` | Corrigido parser de rota `PATCH /api/matriculas/:id/cancelar` em `src/worker/routes/matriculas_rotas.js`. |
| **#19** | Controle de Propriedade de Cursos para Instrutores | `security` / `backend` | Validação de `instrutor_id` implementada em `src/worker/routes/cursos_rotas.js`. |
| **#20** | Visualizador de Certificado Imprimível A4 | `feature` | Rotas `/api/certificados/:id/html` e `/api/certificados/python3d` em `src/worker/routes/certificados_rotas.js`. |
| **#21** | Sincronização de Progresso na Sala de Aula | `epic:pedagogico` | Sincronização automática de aulas e atividades concluídas (`POST /api/aulas/:id/progresso` e `POST /api/gamificacao/concluir-atividade`). |
| **#22** | Governança Open-Source e Manuais Comunitários | `documentation` | `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` e `LICENSE` (MIT). |
| **#23** | Modularização da Documentação (`docs/`) | `documentation` | Guias estruturados em `docs/README.md`, `docs/bncc-computacao.md`, `docs/frontend-guia.md`, `docs/backend-cloudflare.md`, `docs/api-endpoints.md` e `docs/faq-troubleshooting.md`. |
| **#24** | [BUG] Matriz de Problemas Mapeados, Riscos e Soluções | `bug` / `documentation` | Todos os 4 roadblocks solucionados no código e documentados em `docs/faq-troubleshooting.md`. |
| **#27** | [BNCC] Tabela e Catálogo de Habilidades da BNCC Computação | `epic:pedagogico` | Catálogo estruturado em `public/js/atividades/catalogo.js` (`HABILIDADES`, `EIXOS_BNCC`), `d1/schema.sql` e `docs/bncc-computacao.md`. |
| **#28** | Estruturação de Trilhas de Aprendizagem Progressivas (EF I e II) | `epic:pedagogico` | Trilhas progressivas por ano (`1º ao 3º`, `4º e 5º`, `6º ao 9º`) e complexidade (Sequência → Decomposição → Robô → Blocos → Python 3D). |
| **#29** | [BNCC] Módulo de Computação Desplugada e Métricas da Res. CNE 2/2025 | `epic:desplugada` | Orientações desplugadas em todas as atividades e medidor de Equilíbrio de Tempo de Tela (Res. CNE 2/2025) no `dashboard.html`. |
| **#30** | Gerador de Fichas e Cadernos Desplugados em PDF | `epic:desplugada` | Implementado em `public/js/atividades/impressao.js` (`imprimirFichas` A4) e `public/compartilhar.html`. |
| **#32** | [BNCC] Avaliação Formativa por Habilidades com Correção Automática | `epic:avaliacao` | Correção automática e registro de proficiência por código BNCC em `desempenho_habilidades` e `submissoes_python`. |
| **#35** | Exportação de Relatórios e Diários em PDF e Planilhas CSV | `epic:relatorios` | Exportação de Diário Escolar em CSV (`GET /api/dashboard/relatorio-pedagogico?formato=csv`) e impressão A4 em `public/dashboard.html`. |
| **#36** | Dashboard Executivo da Gestão Escolar e Secretaria de Educação | `epic:relatorios` | Implementado em `public/dashboard.html` com 3 abas (`Visão Geral`, `Pedagógico & Habilidades`, `Gestão & Métricas`), KPIs e inspetor de código Python 3D. |
| **#47** | [SECURITY] Adicionar expiração e validação de validade aos JWTs | `security` / `audit` | Claims `iat`/`exp` obrigatórios e validados em `src/worker/crypto_seguranca.js` e `tests/crypto_seguranca.test.js`. |
| **#48** | [SECURITY] Remover segredo JWT versionado e eliminar fallback | `security` / `audit` | Validação estrita `exigirSegredoJwt` em `src/worker/crypto_seguranca.js` e remoção de segredo de `wrangler.jsonc`. |
| **#49** | [SECURITY] Fortalecer armazenamento de senhas com salt e KDF | `security` / `audit` | Hash `PBKDF2-SHA256` (100.000 iterações + salt aleatório de 16 bytes) com migração transparente em `src/worker/crypto_seguranca.js`. |

---

## 3. Itens em Progresso (`In Progress` — Entregas Parciais Ativas na `main`)

| Issue | Título | Progresso Atual na `main` | Próximo Passo para Conclusão |
| :---: | :--- | :--- | :--- |
| **#31** | [BNCC] Módulo de Planejamento Docente e Planos de Aula | Todas as 21 atividades já possuem painel docente com Objetivo Pedagógico, Habilidades BNCC, Versão Desplugada e Perguntas para Sala. | Criar tela/CRUD específico para o professor salvar planos de aula customizados no D1. |
| **#33** | [BNCC] Matriz de Rubricas Qualitativas e Diagnóstico de Defasagem | Rubricas de nível (`em_desenvolvimento`, `adequado`, `avancado`) e status da turma (`Consolidada`, `Adequada`, `Em Desenvolvimento`) ativas em `gamificacao_rotas.js` e `dashboard.html`. | Adicionar recomendação automática de atividade de reforço por habilidade com defasagem. |
| **#34** | Relatórios Consolidados por Aluno, Turma, Escola e Rede | Consolidação por aluno, turma e habilidade BNCC concluída no Dashboard. | Expandir filtro hierárquico por Escola e Rede Municipal (dependente da `#25`). |
| **#38** | Módulo de Comunicação Assíncrona e Mural de Avisos | Painel de Avisos na Topbar (`layout.js`), Modo Dupla (Pair Programming) e inspetor de código Python do aluno ativos. | Adicionar tabela `mural_avisos` e comentários do professor por submissão. |
| **#39** | Notificações Transacionais e Alertas | Central de notificações in-app (sino na Topbar) implementada em `public/js/layout.js`. | Integrar disparo opcional de alertas por e-mail via Cloudflare Email Routing / Resend. |
| **#41** | Execução do Piloto em Escolas Parceiras e Acompanhamento de KPIs | Plataforma pronta para operação com telemetria e exportação de diários escolares. | Coletar métricas reais de uso junto às turmas parceiras do IFMA Campus Grajaú. |
| **#42** | API REST Pública Documentada em OpenAPI / Swagger | Todos os endpoints estão documentados com exemplos em `docs/api-endpoints.md`. | Gerar especificação `public/data/openapi.json` no padrão OpenAPI 3.1. |
| **#44** | Auditoria de Segurança, Testes de Carga e Conformidade LGPD | Hardening de autenticação (`#47`, `#48`, `#49`) e 61 testes automatizados concluídos. | Executar bateria de testes de carga e anexar laudo de conformidade LGPD/ECA. |
| **#45** | Produção dos Guias Pedagógico e Técnico e Encerramento do Edital | Manuais técnicos e pedagógicos publicados em `docs/`. | Consolidar relatório final de prestação de contas do Edital SUAP/IFMA nº 14246/2025. |
| **#50** | [ARCHITECTURE] Registrar decisão de stack sustentável para o piloto | Arquitetura Serverless (Cloudflare Workers + D1 + Vanilla JS) implementada e validada em CI. | Formalizar documento ADR comparativo de TCO (custo zero no Free Tier Cloudflare vs. stack pesada). |
| **#51** | [SCOPE] Delimitar cobertura curricular do piloto frente ao catálogo EI–EM | Escopo do piloto delimitado ao Ensino Fundamental (1º ao 9º ano) em `PRODUCT.md`, `d1/seed.sql` e `docs/bncc-computacao.md`. | Homologar ata pedagógica final confirmando EI e EM como expansão pós-piloto. |

---

## 4. Itens no Backlog (`Backlog` / `To Do` — Evolução e Escala Municipal)

| Issue | Título | Prioridade (MoSCoW) | Escopo / Observação |
| :---: | :--- | :---: | :--- |
| **#9** | Rate Limiting no Endpoint de Login | `Must Have` | Limitação de tentativas por IP em `POST /api/auth/login` via Cloudflare Rate Limiting / D1. |
| **#25** | Modelagem da arquitetura para multiárea (Redes Municipais, Escolas e Turmas) | `Should Have` | Criação das tabelas `redes_ensino`, `escolas` e `turmas` para isolamento multi-tenant. |
| **#26** | Expansão do RBAC para 5 Perfis e Consentimento LGPD/ECA | `Should Have` | Inclusão dos perfis Gestor Municipal, Coordenador Pedagógico e Responsável Legal + termo ECA. |
| **#37** | Arquitetura Offline-First com PWA e Service Worker | `Should Have` | Manifesto `manifest.json` e `sw.js` para cache offline completo em laboratórios sem internet. |
| **#40** | Importação em Lote de Alunos e Turmas via Planilha | `Could Have` | Upload e parser de arquivo `.csv` para enturmação em massa no início do ano letivo. |
| **#43** | Integração com Sistemas de Gestão Escolar Municipais | `Could Have` | Webhooks/API de sincronização com diários eletrônicos municipais (pós-piloto). |
| **#1** | Login (SSO) | `Could Have` | Autenticação federada OAuth2 / Gov.br / Google Workspace Educacional (pós-piloto). |

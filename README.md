# 🏫 LMS BNCC Computação

Plataforma aberta de Gestão de Aprendizagem (LMS) orientada à implementação das diretrizes da **Base Nacional Comum Curricular (BNCC) para a Computação** na Educação Básica e Redes Municipais de Ensino.

O sistema opera sobre uma arquitetura moderna **Edge Serverless** com **Cloudflare Workers** e banco relacional **Cloudflare D1**, proporcionando alta velocidade, custo zero para pequenas redes escolares e facilidade de manutenção para iniciantes em programação.

---

## ✨ Principais Recursos

- 🎯 **Alinhamento Integral à BNCC Computação:** Cursos organizados nos 3 eixos fundamentais (*Pensamento Computacional*, *Mundo Digital* e *Cultura Digital*).
- 🔐 **Controle de Acesso por Perfil (RBAC):** Níveis diferenciados para Administradores da Secretaria, Instrutores/Professores e Alunos.
- 📊 **Dashboard Administrativo:** Indicadores escolares em tempo real e linha do tempo de eventos pedagógicos.
- 🎓 **Sala de Aula Interativa:** Módulos sequenciais, aulas multimídia (texto, vídeo, links) e cálculo de progresso por aula.
- 📝 **Avaliações com Correção Automática:** Questionários de múltipla escolha com cálculo imediato de notas e controle de tentativas.
- 📜 **Certificados Digitais com Validação Pública:** Emissão instantânea e visualização pronta para impressão e PDF em folha A4 com código autenticável.
- ⚡ **Frontend Leve e Puro:** Construído em HTML5, CSS Vanilla e JS nativo — sem dependências pesadas, ideal para hospedar de graça no GitHub Pages.

---

## ⚡ Início Rápido (Quick Start)

Para rodar a plataforma no seu computador em menos de 2 minutos:

```bash
# 1. Clone o repositório
git clone https://github.com/LMS-COMPASSO/lms.git
cd lms

# 2. Instale as dependências
npm install

# 3. Inicie o backend localmente na porta 8787
npm run cf:dev
```

Abra qualquer arquivo `.html` da pasta `public/` no seu navegador ou utilize a extensão *Live Server* do VS Code para navegar no sistema.

---

## 📚 Central de Documentação

Dividimos a documentação em guias específicos e detalhados para facilitar o estudo e a manutenção do projeto:

| Guia | Descrição | Público Alvo |
|---|---|---|
| 📘 **[Diretrizes da BNCC Computação](docs/bncc-computacao.md)** | Explicação detalhada dos 3 eixos, anos escolares, habilidades pedagógicas e atividades sugeridas. | Professores, Coordenadores e Educadores |
| ☁️ **[Guia do Backend (Cloudflare)](docs/backend-cloudflare.md)** | Configuração do Worker, banco D1, comandos do Wrangler CLI e gerenciamento visual no painel da Cloudflare. | Desenvolvedores e Técnicos de TI |
| 💻 **[Guia do Frontend & GitHub Pages](docs/frontend-guia.md)** | Arquitetura das páginas web, controle de autenticação JWT e como publicar o site gratuitamente no GitHub Pages. | Desenvolvedores Web e Iniciantes |
| 📡 **[Catálogo da API REST](docs/api-endpoints.md)** | Lista completa de endpoints, métodos HTTP, parâmetros de busca e modelos de requisição. | Desenvolvedores e Integradores |
| 📋 **[Quadro Kanban & Roadmap](PROJECT_KANBAN.md)** | Visão completa de etapas, evolução do projeto, roadmap pedagógico e problemas mitigados. | Gestores de Projeto e Colaboradores |
| ❓ **[Perguntas Frequentes & Solução de Problemas](docs/faq-troubleshooting.md)** | Como resolver erros comuns de CORS, token expirado, portas ocupadas e migrações do banco. | Todos os colaboradores |

---

## 🔑 Contas de Demonstração para Testes

Ao executar a carga de dados modelo (`npm run cf:seed:local` ou `cf:seed:remote`), as seguintes contas ficam disponíveis com a senha padrão **`Admin@12345`**:

| Perfil | Email | O que pode fazer? |
|---|---|---|
| **Administrador** | `admin@lms-bncc.edu.br` | Acesso completo a métricas, gestão de todos os usuários, aprovação de cursos e turmas |
| **Instrutora (Professora)** | `prof.marina@escola.gov.br` | Criação e gestão de cursos próprios, adição de aulas e elaboração de questionários |
| **Aluno** | `aluno.pedro@escola.gov.br` | Matrícula em cursos, estudo das aulas, realização de testes e emissão de certificados |

---

## 📂 Estrutura do Repositório

```text
├── .github/                    # Templates de Issues e Pull Requests
├── d1/                         # Arquivos SQL do banco Cloudflare D1 (schema e seed da BNCC)
├── docs/                       # Documentação modular detalhada (BNCC, Backend, Frontend, API)
├── public/                     # Frontend estático leve (HTML, CSS e JavaScript nativo)
│   ├── css/                    # Estilos visuais modernos e responsivos
│   └── js/                     # Conexão com a API (config.js e api.js)
├── src/
│   ├── worker/                 # Backend Serverless para Cloudflare Workers
│   └── config/                 # Configurações do ambiente legado
├── package.json                # Scripts de automação (cf:dev, cf:deploy, cf:db, cf:seed)
├── wrangler.jsonc              # Configuração oficial do Cloudflare Workers & D1
├── PROJECT_KANBAN.md           # Quadro Kanban completo, roadmap e matriz de problemas
├── CONTRIBUTING.md             # Como colaborar com código ou planos de aula
├── CODE_OF_CONDUCT.md          # Diretrizes de respeito e convivência acolhedora
├── SECURITY.md                 # Política de reporte responsável de vulnerabilidades
└── README.md                   # Este sumário principal
```

---

## 🤝 Comunidade e Como Colaborar

O projeto é aberto a contribuições tanto técnicas quanto pedagógicas:
- 📋 **[Quadro Kanban do Projeto (PROJECT_KANBAN.md)](PROJECT_KANBAN.md):** Acompanhe as próximas tarefas a fazer, itens em andamento e evoluções.
- 📘 **[Guia de Contribuição (CONTRIBUTING.md)](CONTRIBUTING.md):** Saiba como sugerir novos planos de aula ou abrir um Pull Request.
- 📜 **[Código de Conduta (CODE_OF_CONDUCT.md)](CODE_OF_CONDUCT.md):** Conheça nossos princípios de convivência inclusiva e empática.
- 🛡️ **[Política de Segurança (SECURITY.md)](SECURITY.md):** Procedimentos para reporte responsável de vulnerabilidades.

---

## ⚖️ Licença

Este software é distribuído sob a licença **MIT**, livre para uso, adaptação e expansão por escolas, secretarias de educação e projetos educacionais.

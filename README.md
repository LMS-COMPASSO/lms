# LMS BNCC Computação

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Cloudflare D1](https://img.shields.io/badge/Database-Cloudflare%20D1-orange?logo=sqlite&logoColor=white)](https://developers.cloudflare.com/d1/)
[![BNCC Computação](https://img.shields.io/badge/BNCC-Computação%20Escolar-2563eb)](docs/bncc-computacao.md)
[![Status Produção](https://img.shields.io/badge/Status-Online%20em%20Produção-22c55e)](https://lms.thedelacosta.workers.dev/)
[![Licença MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-blue.svg)](LICENSE)

Plataforma aberta de Gestão de Aprendizagem (LMS) orientada à implementação das diretrizes da **Base Nacional Comum Curricular (BNCC) para a Computação** (Resolução CNE/CP nº 1/2022) na Educação Básica e Redes Municipais de Ensino.

O sistema opera sobre uma arquitetura moderna **Edge Fullstack Serverless** na **Cloudflare** (Workers + D1 + Workers Static Assets), proporcionando alta velocidade, custo zero para pequenas redes escolares e facilidade de manutenção para equipes pedagógicas e técnicas.

---

## 🌐 Demonstração Online

Acesse o ambiente oficial em produção na Cloudflare:

👉 **[https://lms.thedelacosta.workers.dev/](https://lms.thedelacosta.workers.dev/)**

---

## ✨ Principais Recursos

- 🎯 **Alinhamento Integral à BNCC Computação:** Cursos organizados nos 3 eixos fundamentais (*Pensamento Computacional*, *Mundo Digital* e *Cultura Digital*), com segmentação para o Ensino Fundamental I (1º ao 5º ano) e Ensino Fundamental II (6º ao 9º ano).
- 🔐 **Controle de Acesso por Perfil (RBAC):** Níveis diferenciados para Administradores da Secretaria Municipal, Instrutores/Professores e Alunos.
- 📊 **Dashboard Administrativo:** Indicadores de engajamento escolar em tempo real, matrículas ativas, taxa de conclusão e linha do tempo de atividades pedagógicas.
- 🎓 **Sala de Aula Interativa:** Módulos sequenciais, aulas multimídia (texto, vídeo, links) e cálculo de progresso por aula.
- 📝 **Avaliações com Correção Automática:** Questionários de múltipla escolha com cálculo imediato de notas e controle de tentativas.
- 📜 **Certificados Digitais com Validação Pública:** Emissão instantânea com indicação de carga horária e eixo BNCC, layout pronto para impressão A4 e código verificador consultável pela Secretaria.
- ⚡ **Frontend Leve e Nativo:** Construído em HTML5, CSS Vanilla e JS nativo — entregue com máxima velocidade diretamente pelo CDN Edge da Cloudflare.

---

## ⚡ Início Rápido (Quick Start Local)

Para rodar a plataforma completa (frontend + backend + banco local) no seu computador:

```bash
# 1. Clone o repositório
git clone https://github.com/LMS-COMPASSO/lms.git
cd lms

# 2. Instale as dependências
npm install

# 3. Crie e popule o banco local D1 (apenas na primeira vez)
npm run cf:db:local
npm run cf:seed:local

# 4. Inicie o ambiente local completo
npm run cf:dev
```

Acesse **`http://localhost:8787`** no seu navegador para utilizar o sistema.

---

## 🔑 Contas de Demonstração para Testes

Ao executar a carga de dados modelo (`npm run cf:seed:local` ou `cf:seed:remote`), as seguintes contas ficam disponíveis com a senha padrão **`Admin@12345`**:

| Perfil | Email | O que pode fazer? |
|---|---|---|
| **Administrador** | `admin@lms-bncc.edu.br` | Acesso completo a métricas escolares, gestão de usuários e visão global do sistema |
| **Instrutora (Professora)** | `prof.marina@escola.gov.br` | Criação e gestão de cursos próprios, adição de aulas e questionários |
| **Aluno** | `aluno.pedro@escola.gov.br` | Matrícula em cursos, estudo das aulas, realização de testes e emissão de certificados |

---

## 📚 Central de Documentação

Dividimos a documentação técnica e pedagógica em guias detalhados na pasta `docs/`:

| Guia | Descrição | Público Alvo |
|---|---|---|
| 📘 **[Diretrizes da BNCC Computação](docs/bncc-computacao.md)** | Os 3 eixos curriculares, anos escolares, competências pedagógicas e sugestões de atividades. | Professores e Coordenadores |
| ☁️ **[Guia do Backend Cloudflare](docs/backend-cloudflare.md)** | Configuração do Worker, banco relacional D1, Wrangler CLI e deploy em produção. | Desenvolvedores e TI |
| 💻 **[Guia do Frontend](docs/frontend-guia.md)** | Arquitetura das páginas web, autenticação JWT e componentes visuais. | Desenvolvedores Web |
| 📡 **[Catálogo da API REST](docs/api-endpoints.md)** | Relação completa de endpoints, métodos HTTP, parâmetros e modelos de resposta. | Integradores de Sistemas |
| ❓ **[Perguntas Frequentes & Troubleshooting](docs/faq-troubleshooting.md)** | Solução de dúvidas comuns sobre portas, tokens, permissões e banco de dados. | Todos os colaboradores |

---

## 🛠️ Scripts NPM Disponíveis

| Comando | Descrição |
|---|---|
| `npm run cf:dev` | Inicia o servidor local completo (Frontend + API Worker) em `http://localhost:8787` |
| `npm run cf:deploy` | Faz o deploy em produção na Cloudflare (upload de páginas estáticas e Worker) |
| `npm run cf:db:local` | Executa a criação de tabelas (`schema.sql`) no banco local |
| `npm run cf:seed:local` | Carrega os cursos modelo da BNCC e usuários no banco local |
| `npm run cf:db:remote` | Executa as tabelas e índices no banco de produção Cloudflare D1 |
| `npm run cf:seed:remote` | Popula os cursos modelo da BNCC no banco oficial de produção |

---

## 📂 Estrutura do Repositório

```text
├── .github/                    # Templates de Issues e Pull Requests
├── d1/                         # Arquivos SQL do banco Cloudflare D1 (schema e seed BNCC)
│   ├── schema.sql              # Estrutura de tabelas e índices
│   └── seed.sql                # Dados modelo da BNCC Computação
├── docs/                       # Documentação modular detalhada (BNCC, Backend, Frontend, API)
├── public/                     # Frontend estático entregue pelo Edge da Cloudflare
│   ├── css/                    # Estilos CSS modernos e responsivos (mobile-first)
│   └── js/                     # Integração com a API (config.js, api.js, layout.js)
├── src/
│   ├── worker/                 # Backend Serverless para Cloudflare Workers
│   │   └── index.mjs           # Roteador unificado da API e delegação de Assets
│   └── config/                 # Configurações do ambiente legado
├── package.json                # Dependências e scripts de automação do projeto
├── wrangler.jsonc              # Configuração oficial do Cloudflare Workers, Assets & D1
├── CONTRIBUTING.md             # Como colaborar com código ou planos de aula
├── CODE_OF_CONDUCT.md          # Diretrizes de respeito e convivência acolhedora
├── SECURITY.md                 # Política de reporte responsável de vulnerabilidades
├── LICENSE                     # Licença de código aberto (MIT)
└── README.md                   # Este sumário principal
```

---

## 🤝 Comunidade e Como Colaborar

O projeto é aberto a contribuições de educadores, secretarias municipais e desenvolvedores:

- 📘 **[Guia de Contribuição (CONTRIBUTING.md)](CONTRIBUTING.md):** Como sugerir planos de aula, melhorias ou submeter Pull Requests.
- 📜 **[Código de Conduta (CODE_OF_CONDUCT.md)](CODE_OF_CONDUCT.md):** Princípios de convivência inclusiva e respeitosa.
- 🛡️ **[Política de Segurança (SECURITY.md)](SECURITY.md):** Instruções para reporte seguro de vulnerabilidades.

---

## ⚖️ Licença

Este software é distribuído sob a licença **MIT**, livre para uso, adaptação e implantação por escolas públicas, secretarias de educação e projetos pedagógicos sem custos de licenciamento.


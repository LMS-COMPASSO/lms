# 🏫 LMS BNCC Computação — Gestão de Aprendizagem Escolar Municipal

Plataforma aberta de Gestão de Aprendizagem (LMS) orientada à implementação das diretrizes da **Base Nacional Comum Curricular (BNCC) para a Computação** na Educação Básica e Redes Municipais de Ensino.

O sistema permite que secretarias de educação, escolas, coordenadores, professores e estudantes gerenciem cursos, módulos pedagógicos, aulas interativas, avaliações com correção automática e emissão de **certificados digitais de conclusão** com validação pública por código e QR-code.

---

## 🧭 Alinhamento Pedagógico com a BNCC Computação

A plataforma organiza todo o seu catálogo educacional em torno dos **3 Eixos Estruturantes da BNCC Computação**:

```
                              ┌─────────────────────────────────────────┐
                              │       BNCC DA COMPUTAÇÃO ESCOLAR        │
                              └────────────────────┬────────────────────┘
                                                   │
         ┌─────────────────────────────────────────┼────────────────────────────────────────┐
         │                                         │                                        │
         ▼                                         ▼                                        ▼
┌─────────────────────────┐             ┌─────────────────────────┐              ┌─────────────────────────┐
│ Pensamento Computacional│             │      Mundo Digital      │              │     Cultura Digital     │
├─────────────────────────┤             ├─────────────────────────┤              ├─────────────────────────┤
│ • Algoritmos no cotidiano│             │ • Hardware e Software   │              │ • Segurança e Privacid. │
│ • Decomposição lógica   │             │ • Internet e Redes      │              │ • Cidadania na Rede     │
│ • Reconhecimento padrões│             │ • Dados e Binários      │              │ • Fake news e Ética     │
└─────────────────────────┘             └─────────────────────────┘              └─────────────────────────┘
```

- **Pensamento Computacional:** Resolução de problemas, abstração, decomposição e algoritmos (atividades plugadas e desplugadas).
- **Mundo Digital:** Entendimento de como computadores, rede mundial, servidores e sensores funcionam.
- **Cultura Digital:** Uso ético, crítico, inclusivo e seguro da tecnologia, combatendo desinformação e cyberbullying.

---

## 🚀 Arquitetura e Migração: MySQL ➔ Cloudflare D1 + Workers

A plataforma suporta tanto o modo tradicional Node.js/Express/MySQL quanto a arquitetura moderna **Edge Serverless** com **Cloudflare Workers** e banco relacional **Cloudflare D1** (SQLite distribuído na nuvem).

### 💡 Por que migrar para o Cloudflare D1 em escolas municipais?
1. **Custo Zero para Pequenos Municípios:** No plano gratuito da Cloudflare, você tem direito a até 100.000 requisições/dia e banco D1 com 5 milhões de leituras e 100.000 escritas mensais — ideal para projetos pilotos ou redes escolares municipais sem orçamento para servidores VPS.
2. **Sem Manutenção de Servidor Linux:** Esqueça instalar Apache/Nginx, configurar certificados SSL Let's Encrypt ou gerenciar banco MySQL caindo por falta de memória.
3. **Altíssima Velocidade (Edge):** O backend executa em mais de 300 data centers da Cloudflare distribuídos pelo mundo (inclusive múltiplos pontos no Brasil como São Paulo, Rio de Janeiro e Fortaleza).
4. **Deploy em Segundos:** Uma única linha de comando (`npm run cf:deploy`) atualiza o backend inteiro globalmente em menos de 5 segundos.

---

## 📂 Estrutura do Repositório

```text
├── d1/                         # Arquivos SQL do banco de dados Cloudflare D1
│   ├── schema.sql              # Estrutura completa de tabelas e índices otimizados
│   └── seed.sql                # Dados iniciais prontos (cursos da BNCC, aulas e usuários de teste)
├── public/                     # Frontend estático (HTML5, CSS Vanilla e JS nativo)
│   ├── css/style.css           # Folha de estilo moderna, responsiva e acessível
│   ├── js/config.js            # Apontamento do backend (local vs produção na Cloudflare)
│   ├── js/api.js               # Cliente HTTP com interceptação JWT e tratamento de erros
│   ├── js/layout.js            # Barra lateral dinâmica e controle de menus por perfil
│   ├── index.html              # Tela de Login
│   ├── registrar.html          # Cadastro de novo aluno
│   ├── dashboard.html          # Painel com indicadores e linha do tempo de eventos
│   ├── cursos.html             # Catálogo de cursos com filtros por eixo BNCC e busca
│   ├── curso-detalhe.html      # Sala de aula com módulos, aulas e status de progresso
│   ├── matriculas.html         # Gestão de matrículas e reativação
│   ├── certificados.html       # Listagem e validador público de certificados
│   ├── perfil.html             # Dados pessoais e troca de senha
│   └── usuarios.html           # Gestão de usuários (exclusivo para Administrador)
├── src/
│   ├── worker/
│   │   ├── index.mjs           # Backend Serverless completo para Cloudflare Workers
│   │   └── index.js            # Exportação de compatibilidade
│   ├── controllers/            # Controladores da versão legada (Node.js/Express/MySQL)
│   ├── routes/                 # Rotas da versão legada
│   └── config/                 # Configuração legada de conexão
├── package.json                # Scripts npm e dependências
├── wrangler.jsonc              # Arquivo oficial de configuração da Cloudflare Workers/D1
└── README.md                   # Este manual didático
```

---

## 🛠️ Guia Passo a Passo: Manutenção do Backend Cloudflare D1

### 1. Pré-requisitos
- Ter o [Node.js](https://nodejs.org/) (versão 18 ou superior) instalado no computador.
- Ter uma conta gratuita criada na [Cloudflare](https://dash.cloudflare.com/).

Clone o repositório e instale as dependências:
```bash
git clone https://github.com/SEU-USUARIO/lms.git
cd lms
npm install
```

---

### 2. Comandos NPM Rápidos (Cheatsheet)

No arquivo `package.json`, configuramos atalhos intuitivos para que iniciantes não precisem decorar parâmetros complexos do terminal:

| Comando | O que ele faz? |
|---|---|
| `npm run cf:dev` | Inicia o backend do Cloudflare Worker localmente em `http://localhost:8787` |
| `npm run cf:deploy` | Publica o backend Worker na nuvem da Cloudflare |
| `npm run cf:db:local` | Aplica as tabelas (`d1/schema.sql`) no banco local de desenvolvimento |
| `npm run cf:db:remote` | Aplica as tabelas (`d1/schema.sql`) no banco oficial de **produção na nuvem** |
| `npm run cf:seed:local` | Carrega os cursos modelo da BNCC e usuários no banco local |
| `npm run cf:seed:remote` | Carrega os cursos modelo da BNCC e usuários no banco de **produção na nuvem** |

---

### 3. Configurando seu próprio banco D1 do zero

Se você estiver criando um projeto novo na sua própria conta Cloudflare:

#### Passo 1: Autenticar no terminal com sua conta Cloudflare
```bash
npx wrangler login
```
*Uma janela do seu navegador abrirá. Clique em **Autorizar**.*

#### Passo 2: Criar o banco D1
```bash
npx wrangler d1 create lms_prod
```
O terminal exibirá algo parecido com:
```json
{
  "binding": "DB",
  "database_name": "lms_prod",
  "database_id": "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

#### Passo 3: Colar o `database_id` no arquivo `wrangler.jsonc`
Abra o arquivo `wrangler.jsonc` na raiz do projeto e substitua o campo `database_id`:
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "lms-api",
  "main": "src/worker/index.mjs",
  "compatibility_date": "2026-09-12",
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "lms_prod",
      "database_id": "SEU_DATABASE_ID_AQUI"
    }
  ],
  "vars": {
    "JWT_SECRET": "coloque-aqui-uma-frase-secreta-muito-segura"
  }
}
```

#### Passo 4: Criar as tabelas e carregar os dados modelo
Basta rodar os dois comandos a seguir:
```bash
# 1. Cria todas as tabelas e índices
npm run cf:db:remote

# 2. Insere os cursos da BNCC, módulos, aulas e usuários iniciais
npm run cf:seed:remote
```

#### Passo 5: Fazer o Deploy da API
```bash
npm run cf:deploy
```
Ao final do deploy, o terminal fornecerá a sua URL pública, por exemplo:
`https://lms-api.sua-conta.workers.dev`

#### Passo 6: Apontar o Frontend para a nova API
Abra o arquivo `public/js/config.js` e atualize a constante `PRODUCTION_API`:
```javascript
const PRODUCTION_API = 'https://lms-api.sua-conta.workers.dev/api';
```

---

## 🖥️ Como gerenciar o Banco D1 pela Interface Web da Cloudflare (Sem Terminal!)

A Cloudflare oferece uma interface gráfica no navegador extremamente amigável para professores, coordenadores ou técnicos escolares:

```
[Cloudflare Dashboard]
   └─► Storage & Databases 
          └─► D1 SQL Database 
                 └─► "lms_prod" 
                        ├─► [Explore Data] (ver linhas, usuários, cursos)
                        ├─► [Console] (rodar consultas SQL diretamente)
                        └─► [Metrics] (consultas por segundo e latência)
```

1. Acesse o [Painel da Cloudflare (Cloudflare Dashboard)](https://dash.cloudflare.com/).
2. No menu lateral esquerdo, clique em **Storage & Databases** ➔ **D1 SQL Database**.
3. Clique sobre o banco **`lms_prod`**.
4. **Para ver tabelas e dados visualmente:**
   - Clique na aba **Explore Data**.
   - Selecione a tabela desejada no seletor (ex: `usuarios`, `cursos`, `matriculas`, `certificados`).
   - Você pode visualizar todas as linhas, filtrar registros e até editar valores diretamente na tela.
5. **Para rodar comandos SQL manuais:**
   - Clique na aba **Console**.
   - Digite sua consulta (ex: `SELECT * FROM usuarios;`) e clique em **Execute**.
6. **Para ver logs de erros e acessos em tempo real:**
   - No menu lateral, acesse **Workers & Pages** ➔ clique em **`lms-api`** ➔ aba **Observability (Logs)**.
   - Clique em **Begin Log Stream** para ver cada requisição que os alunos fazem ao vivo!

---

## 🧰 Dicas Úteis do Wrangler CLI

```bash
# 1. Ver todas as tabelas que existem no seu banco de dados na nuvem:
npx wrangler d1 execute lms_prod --remote --command="PRAGMA table_list;"

# 2. Consultar os usuários cadastrados diretamente pelo terminal:
npx wrangler d1 execute lms_prod --remote --command="SELECT id, nome, email, perfil FROM usuarios;"

# 3. Acompanhar os logs da API em tempo real pelo terminal (modo debug):
npx wrangler tail

# 4. Fazer backup/exportar o banco de dados D1 para um arquivo local:
npx wrangler d1 export lms_prod --remote --output=./backup_lms.sql
```

---

## 🔑 Credenciais Padrão de Acesso (Dados de Teste)

Ao rodar o seed do banco de dados, três contas de demonstração ficam disponíveis. Todas utilizam a mesma senha inicial:

| Perfil | Email | Senha Padrão | O que pode fazer? |
|---|---|---|---|
| **Administrador** | `admin@lms-bncc.edu.br` | `Admin@12345` | Acesso total: indicadores, criar usuários, editar e aprovar qualquer curso, cadastrar alunos |
| **Instrutor (Professora)** | `prof.marina@escola.gov.br` | `Admin@12345` | Criar e gerenciar seus próprios cursos, adicionar aulas, criar questionários e acompanhar turmas |
| **Aluno** | `aluno.pedro@escola.gov.br` | `Admin@12345` | Matricular-se em cursos publicados, assistir aulas, marcar progresso, responder provas e emitir certificado |

> 🔒 *Recomendação de segurança:* Altere a senha do usuário Administrador após o primeiro acesso na tela **Meu Perfil**.

---

## 📜 Emissão e Validação de Certificados Digitais

Na versão anterior com Node.js tradicional, a geração de PDFs dependia de bibliotecas com dependências nativas (`pdfkit`) que salvavam arquivos no disco rígido local — o que não funciona na nuvem serverless da Cloudflare.

### Nova Solução Inteligente no Worker:
- O Worker disponibiliza o endpoint público: `GET /api/certificados/visualizar/:codigo`
- Gera um certificado em HTML/CSS de altíssimo padrão gráfico, já padronizado para impressão em folha **A4 no formato paisagem (landscape)**.
- O aluno ou professor clica no botão **🖨️ Imprimir / Salvar em PDF** e o navegador gera o arquivo PDF vetorial nativo com tamanho reduzido e visual perfeito.
- A validação pública do certificado pode ser feita por qualquer pessoa na página `certificados.html` informando o código alfanumérico gerado (ex: `CERT-1726000000-AB12CD`).

---

## 🌐 Como Publicar o Frontend Gratuitamente no GitHub Pages

O frontend é composto exclusivamente de arquivos estáticos puros (`HTML`, `CSS`, `JS`), o que significa que ele pode ser hospedado a custo zero diretamente no **GitHub Pages**:

1. Suba este projeto para seu repositório no GitHub.
2. No repositório, clique em **Settings** ➔ **Pages**.
3. Em **Build and deployment** ➔ **Source**, selecione **Deploy from a branch**.
4. Selecione a branch `main` e a pasta `/public` (ou configure um GitHub Actions para publicação do diretório `public`).
5. O GitHub fornecerá seu link seguro (ex: `https://seu-usuario.github.io/lms/`).
6. No arquivo `public/js/config.js`, certifique-se de que a URL aponte para sua API na Cloudflare Workers (`https://lms-api.sua-conta.workers.dev/api`).

---

## 🤝 Comunidade e Como Colaborar

Para garantir um ambiente organizado, acolhedor e seguro para escolas, professores e desenvolvedores, disponibilizamos guias separados e detalhados:

- 📘 **[Guia de Contribuição (CONTRIBUTING.md)](CONTRIBUTING.md):** Instruções passo a passo de como sugerir conteúdos da BNCC ou melhorias de código.
- 📜 **[Código de Conduta (CODE_OF_CONDUCT.md)](CODE_OF_CONDUCT.md):** Nossos padrões de convivência empática e respeito para o ambiente escolar e open-source.
- 🛡️ **[Política de Segurança (SECURITY.md)](SECURITY.md):** Como relatar falhas e vulnerabilidades de maneira responsável.
- 📋 **Templates de Issues:** Modelos pré-formatados para relatar bugs ou propor novos cursos da BNCC na aba [Issues](../../issues).

---

## ⚖️ Licença

Este projeto é distribuído sob a licença **MIT**, livre para uso, adaptação e expansão por qualquer escola, prefeitura, secretaria municipal ou instituição de ensino.

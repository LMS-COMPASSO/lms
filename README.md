# LMS BNCC Computação

Sistema de Gestão de Aprendizagem (LMS) profissional voltado ao ensino da **BNCC Computação**,
construído com **Node.js + Express** e **MySQL**.

## ✨ Funcionalidades

- Autenticação com **JWT** e senhas protegidas com **bcrypt**
- Perfis de **Administrador**, **Instrutor** e **Aluno** (RBAC)
- Dashboard administrativo com **indicadores** e **linha do tempo**
- Cadastro, edição e exclusão de **cursos** (rascunho/publicado)
- Cursos organizados por **eixo BNCC** (Pensamento Computacional, Mundo Digital, Cultura Digital)
  e por **ano escolar**
- Estrutura de **módulos → aulas → avaliações (questões/alternativas) → certificados**
- **Matrículas** com cálculo automático de progresso
- Emissão de **certificados em PDF** com código de validação público
- Interface web responsiva (mobile-first), sem frameworks pesados no frontend

## 🏗️ Arquitetura

```
lms-bncc/
├── server.js                  # Ponto de entrada da aplicação
├── src/
│   ├── config/db.js           # Pool de conexões MySQL
│   ├── database/
│   │   ├── schema.sql         # Schema completo do banco
│   │   └── seed.js            # Cria o usuário administrador inicial
│   ├── middleware/
│   │   ├── auth.js            # Verificação de JWT
│   │   ├── role.js            # Controle de acesso por perfil
│   │   └── errorHandler.js
│   ├── controllers/           # Regras de negócio (auth, usuários, cursos, módulos,
│   │                            aulas, avaliações, matrículas, certificados, dashboard)
│   ├── routes/                # Definição dos endpoints REST
│   └── utils/
│       ├── jwt.js
│       └── certificateGenerator.js  # Geração de PDF com pdfkit
└── public/                    # Frontend (HTML + CSS + JS puro, responsivo)
```

## 🗄️ Modelo de dados (principais tabelas)

`usuarios` · `cursos` · `modulos` · `aulas` · `avaliacoes` · `questoes` ·
`alternativas` · `matriculas` · `progresso_aulas` · `tentativas_avaliacao` · `certificados`

Veja o diagrama completo em `src/database/schema.sql`.

## 🚀 Como executar

### 1. Pré-requisitos
- Node.js 18+
- MySQL 8+

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
# edite o .env com as credenciais do seu MySQL
```

### 4. Criar o banco de dados
```bash
mysql -u root -p < src/database/schema.sql
```

### 5. Criar o usuário administrador inicial
```bash
npm run seed
```
Isso cria o admin com o email/senha definidos em `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

### 6. Rodar a aplicação
```bash
npm run dev     # com nodemon (desenvolvimento)
# ou
npm start       # produção
```

A aplicação sobe em `http://localhost:3000`. Acesse com o usuário admin criado no passo 5.

## 🔐 Perfis e permissões

| Ação                              | Administrador | Instrutor           | Aluno            |
|------------------------------------|:--------------:|:--------------------:|:----------------:|
| Ver dashboard/indicadores          | ✅ (global)     | ✅ (só seus cursos)    | ❌               |
| Criar/editar/excluir usuários      | ✅              | ❌                    | ❌               |
| Criar cursos                       | ✅              | ✅ (próprios)          | ❌               |
| Publicar/despublicar curso         | ✅              | ✅ (próprios)          | ❌               |
| Ver cursos publicados              | ✅              | ✅                     | ✅               |
| Matricular-se em curso             | —              | —                     | ✅               |
| Marcar aula como concluída         | —              | —                     | ✅               |
| Responder avaliação                | —              | —                     | ✅               |
| Emitir certificado (após conclusão)| ✅              | ✅                     | ✅ (próprio)      |

## 📡 Principais endpoints da API

```
POST   /api/auth/registrar          Cadastro público (perfil aluno)
POST   /api/auth/login              Login (retorna JWT)
GET    /api/auth/me                 Dados do usuário logado
POST   /api/auth/alterar-senha

GET    /api/usuarios                [admin] Listar usuários
POST   /api/usuarios                [admin] Criar usuário
PUT    /api/usuarios/:id            [admin] Atualizar usuário
DELETE /api/usuarios/:id            [admin] Desativar usuário

GET    /api/cursos                  Listar cursos (filtros: status, eixo_bncc, ano_escolar, busca)
POST   /api/cursos                  [admin/instrutor] Criar curso
PUT    /api/cursos/:id              [admin/instrutor] Editar curso
PATCH  /api/cursos/:id/status       [admin/instrutor] Publicar/rascunho
DELETE /api/cursos/:id              [admin/instrutor] Excluir curso

GET    /api/modulos/curso/:cursoId
POST   /api/modulos/curso/:cursoId
GET    /api/aulas/modulo/:moduloId
POST   /api/aulas/:id/progresso     [aluno] Marcar aula concluída

GET    /api/avaliacoes/:id
POST   /api/avaliacoes/:id/responder [aluno]

GET    /api/matriculas
POST   /api/matriculas
PATCH  /api/matriculas/:id/cancelar

GET    /api/certificados
POST   /api/certificados/emitir
GET    /api/certificados/validar/:codigo   (pública)

GET    /api/dashboard/indicadores    [admin/instrutor]
GET    /api/dashboard/linha-do-tempo [admin/instrutor]
```

## 🎨 Frontend

Interface responsiva construída com HTML + CSS + JavaScript puro (sem build step),
localizada em `public/`. Usa `localStorage` para persistir o token JWT e monta o layout
(sidebar/topbar) dinamicamente conforme o perfil do usuário logado.

## 🔒 Segurança implementada

- Senhas com hash **bcrypt** (nunca armazenadas em texto puro)
- Autenticação via **JWT** com expiração configurável
- Middlewares de autorização por perfil (RBAC) em todas as rotas sensíveis
- **Helmet** para cabeçalhos HTTP seguros
- Validações de entrada nos controllers
- Exclusão lógica (soft delete) de usuários para preservar histórico

## 🧩 Próximos passos sugeridos

- Upload de imagens de capa dos cursos (ex.: multer + S3/local)
- Notificações por email (novas matrículas, certificados)
- Relatórios exportáveis (PDF/Excel) por turma/curso
- Testes automatizados (Jest + Supertest)

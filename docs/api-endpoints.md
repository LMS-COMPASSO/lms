# Catálogo de Endpoints da API REST

Todas as requisições autenticadas devem enviar o cabeçalho HTTP:

```http
Authorization: Bearer <SEU_TOKEN_JWT>
Content-Type: application/json
```

---

## 1. Autenticação e Perfil

| Método | Endpoint | Acesso | Descrição |
| --- | --- | :---: | --- |
| `GET` | `/api/health` | Público | Verifica o estado da API e conexão com o D1 |
| `POST` | `/api/auth/registrar` | Público | Cadastro de novo aluno (`nome`, `email`, `senha`) |
| `POST` | `/api/auth/login` | Público | Login com `email` e `senha`, retorna token JWT |
| `GET` | `/api/auth/me` | Autenticado | Retorna dados do usuário atualmente logado |
| `POST` | `/api/auth/alterar-senha` | Autenticado | Altera a senha (`senhaAtual`, `novaSenha`) |

---

## 2. Gestão de Usuários (Exclusivo Administrador)

| Método | Endpoint | Acesso | Descrição |
| --- | --- | :---: | --- |
| `GET` | `/api/usuarios?perfil=&busca=&ativo=` | Admin | Lista usuários com suporte a filtros e busca |
| `POST` | `/api/usuarios` | Admin | Cadastra novo usuário com perfil específico |
| `GET` | `/api/usuarios/:id` | Admin / Próprio | Consulta os dados de um usuário pelo ID |
| `PUT` | `/api/usuarios/:id` | Admin | Atualiza dados cadastrais de um usuário |
| `DELETE` | `/api/usuarios/:id` | Admin | Desativa logicamente um usuário (`ativo = 0`) |
| `POST` | `/api/usuarios/:id/redefinir-senha` | Admin | Redefine a senha de um usuário (`novaSenha`) |

---

## 3. Cursos (Alinhados à BNCC)

| Método | Endpoint | Acesso | Descrição |
| --- | --- | :---: | --- |
| `GET` | `/api/cursos?busca=&eixo_bncc=&ano_escolar=` | Autenticado | Lista cursos (alunos veem apenas publicados) |
| `POST` | `/api/cursos` | Admin, Instrutor | Cria um curso novo em modo `rascunho` |
| `GET` | `/api/cursos/:id` | Autenticado | Detalha curso, módulos, aulas e progresso |
| `PUT` | `/api/cursos/:id` | Admin, Instrutor | Atualiza título, descrição, carga horária e eixo |
| `PATCH` | `/api/cursos/:id/status` | Admin, Instrutor | Altera status (`rascunho` ou `publicado`) |
| `DELETE` | `/api/cursos/:id` | Admin, Instrutor | Exclui um curso e seus módulos/aulas vinculados |

---

## 4. Módulos e Aulas

| Método | Endpoint | Acesso | Descrição |
| --- | --- | :---: | --- |
| `GET` | `/api/modulos/curso/:cursoId` | Autenticado | Lista módulos pertencentes a um curso |
| `POST` | `/api/modulos/curso/:cursoId` | Admin, Instrutor | Adiciona módulo (`titulo`, `descricao`, `ordem`) |
| `PUT` | `/api/modulos/:id` | Admin, Instrutor | Atualiza os dados de um módulo |
| `DELETE` | `/api/modulos/:id` | Admin, Instrutor | Remove um módulo e suas aulas |
| `GET` | `/api/aulas/modulo/:moduloId` | Autenticado | Lista aulas pertencentes a um módulo |
| `POST` | `/api/aulas/modulo/:moduloId` | Admin, Instrutor | Cria nova aula (`titulo`, `tipo`, `conteudo`) |
| `GET` | `/api/aulas/:id` | Autenticado | Obtém o conteúdo completo de uma aula |
| `PUT` | `/api/aulas/:id` | Admin, Instrutor | Edita os dados de uma aula |
| `DELETE` | `/api/aulas/:id` | Admin, Instrutor | Remove uma aula |
| `POST` | `/api/aulas/:id/progresso` | Aluno | Marca aula como concluída/pendente (`concluida: 1`) |

---

## 5. Avaliações e Questionários

| Método | Endpoint | Acesso | Descrição |
| --- | --- | :---: | --- |
| `GET` | `/api/avaliacoes/modulo/:moduloId` | Autenticado | Lista avaliações de um módulo |
| `POST` | `/api/avaliacoes/modulo/:moduloId` | Admin, Instrutor | Cria avaliação com questões e alternativas |
| `GET` | `/api/avaliacoes/:id` | Autenticado | Obtém questionário (aluno não vê o gabarito) |
| `POST` | `/api/avaliacoes/:id/responder` | Aluno | Envia respostas e calcula nota automaticamente |
| `DELETE` | `/api/avaliacoes/:id` | Admin, Instrutor | Exclui uma avaliação |

---

## 6. Matrículas e Certificados

| Método | Endpoint | Acesso | Descrição |
| --- | --- | :---: | --- |
| `GET` | `/api/matriculas?curso_id=&status=` | Autenticado | Lista matrículas do aluno ou da escola |
| `POST` | `/api/matriculas` | Autenticado | Realiza matrícula em curso ou reativa cancelada |
| `PATCH` | `/api/matriculas/:id/cancelar` | Autenticado | Cancela a matrícula especificada |
| `GET` | `/api/certificados` | Autenticado | Lista certificados emitidos |
| `POST` | `/api/certificados/emitir` | Autenticado | Emite certificado para curso concluído |
| `GET` | `/api/certificados/validar/:codigo` | Público | Validação pública do certificado |
| `GET` | `/api/certificados/visualizar/:codigo` | Público | Renderização HTML e impressão A4 do certificado |

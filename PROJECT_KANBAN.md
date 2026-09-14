# 📋 Quadro Kanban do Projeto — LMS BNCC Computação

Este documento organiza o ciclo de vida, evolução técnica, roadmap pedagógico e histórico de resolução de problemas da plataforma **LMS BNCC Computação**.

Ele foi estruturado para ser utilizado diretamente como referência da equipe ou importado no **GitHub Projects (Projects v2)**.

---

## 🧭 Visão Geral do Quadro Kanban

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   📥 BACKLOG    │ ➔ │    📌 A FAZER   │ ➔ │  🔄 EM PROGRESSO│ ➔ │ 🔍 EM REVISÃO/QA │ ➔ │  ✅ CONCLUÍDO    │
│  Novas Ideias e │   │ Próxima Sprint  │   │  Desenvolvimento│   │  Validação e    │   │  Entregas em    │
│ Futuras Edições │   │  e Prioridades  │   │     em Curso    │   │      Testes     │   │    Produção     │
└─────────────────┘   └─────────────────┘   └─────────────────┘   └─────────────────┘   └─────────────────┘
```

---

## 🚀 Colunas e Cartões Detalhados

### 📥 1. Backlog (Futuras Evoluções & Recursos Planejados)

| ID | Cartão / Funcionalidade | Eixo / Área | Prioridade | Descrição & Critérios de Aceitação |
|---|---|---|:---:|---|
| **BK-01** | **Integração com Scratch / Blockly no Navegador** | Pensamento Computacional | Média | Incorporar um editor de código em blocos direto na sala de aula para que os alunos criem pequenos programas sem sair do LMS. |
| **BK-02** | **Gestão de Turmas Escolares e Escolas** | Gestão Escolar | Alta | Permitir vincular alunos a turmas específicas (ex: "5º Ano A - E.M. Darcy Ribeiro") e emitir relatórios agrupados por escola municipal. |
| **BK-03** | **Painel do Coordenador Pedagógico** | Gestão Escolar | Média | Relatórios de engajamento, taxa de conclusão por escola e exportação em planilhas CSV/XLSX. |
| **BK-04** | **Suporte a PWA (Progressive Web App) & Modo Offline** | Infraestrutura | Média | Permitir que laboratórios de informática com conexão intermitente baixem as aulas e sincronizem o progresso quando a internet voltar. |
| **BK-05** | **Login Social Educacional (Google / Microsoft)** | Autenticação | Baixa | Login único (*Single Sign-On*) integrado ao Google Workspace for Education e Microsoft Teams Escolar. |
| **BK-06** | **QR-Code Dinâmico no Certificado** | Certificação | Baixa | Estampar um QR-Code SVG direto no certificado HTML impresso que aponta para a URL pública de validação. |

---

### 📌 2. A Fazer (To Do — Próxima Sprint)

| ID | Tarefa Técnica | Área | Prioridade | Critérios de Aceitação |
|---|---|---|:---:|---|
| **TD-01** | **Pipeline de CI/CD no GitHub Actions** | DevOps | Alta | Criar workflow `.github/workflows/deploy.yml` para rodar lint, testes e deploy automático no Cloudflare Workers e GitHub Pages ao enviar para `main`. |
| **TD-02** | **Testes Automatizados de Integração (Miniflare/Vitest)** | Qualidade / QA | Alta | Adicionar suíte de testes cobrindo autenticação, matrículas e cálculo de progresso com banco D1 simulado. |
| **TD-03** | **Rate Limiting no Endpoint de Login** | Segurança | Média | Proteger o endpoint `POST /api/auth/login` contra ataques de força bruta limitando tentativas por IP. |
| **TD-04** | **Auditoria de Acessibilidade (WCAG 2.1 AA)** | Frontend | Média | Verificar navegação completa por teclado (`Tab`), leitor de tela (NVDA/TalkBack) e contraste de cores nas tabelas. |

---

### 🔄 3. Em Progresso (In Progress)

| ID | Tarefa | Responsável | Status Atual |
|---|---|---|---|
| **IP-01** | **Validação Piloto com Professores de Computação** | Equipe Pedagógica | Coletando feedbacks sobre a clareza dos questionários do 1º ao 5º Ano. |
| **IP-02** | **Refinamento da Responsividade Mobile em Celulares Pequenos** | Equipe Frontend | Ajustando barras de rolagem horizontal em tabelas de notas e matrículas. |

---

### 🔍 4. Em Revisão & Testes (Review / QA)

| ID | Funcionalidade | Tipo | Validação Realizada |
|---|---|---|---|
| **RV-01** | **Cálculo de Nota e Tentativas em Avaliações** | QA Backend | Validado envio de respostas, cálculo ponderado de notas e bloqueio após 3 tentativas. |
| **RV-02** | **Impressão e Download de Certificados em PDF** | QA Cross-browser | Testada a impressão no Google Chrome, Mozilla Firefox, Microsoft Edge e Safari Mobile. |

---

### ✅ 5. Concluído (Done — Entregas Consolidadas)

| ID | Entrega | Impacto |
|---|---|---|
| **DN-01** | **Migração Completa do Banco: MySQL ➔ Cloudflare D1** | Eliminação de custos de servidor e alta disponibilidade distribuída na borda (*Edge*). |
| **DN-02** | **Backend Serverless em Cloudflare Workers (`index.mjs`)** | API REST completa rodando em Web Standards com JWT nativo via Web Crypto API. |
| **DN-03** | **Schema D1 Otimizado (`d1/schema.sql`)** | Criação de tabelas relacionais com chaves estrangeiras (`CASCADE`) e 12 índices de alta performance. |
| **DN-04** | **Carga Inicial da BNCC Computação (`d1/seed.sql`)** | Cursos modelo cadastrados cobrindo os 3 eixos (*Pensamento Computacional*, *Mundo Digital* e *Cultura Digital*). |
| **DN-05** | **Correção no Endpoint de Alteração de Senha** | Resolvido bug que impedia atualização de senha por ausência do hash na consulta. |
| **DN-06** | **Correção no Cancelamento de Matrícula** | Corrigida a extração de ID na rota `/api/matriculas/:id/cancelar`. |
| **DN-07** | **Filtros Dinâmicos na Gestão de Usuários** | Busca e filtragem por perfil (`admin`, `instrutor`, `aluno`) funcionando em tempo real. |
| **DN-08** | **Reativação Inteligente de Matrículas** | Aluno pode reativar matrícula cancelada sem gerar erro de chave única duplicada. |
| **DN-09** | **Controle de Propriedade de Cursos para Instrutores** | Instrutores só podem alterar e excluir os cursos criados por eles mesmos. |
| **DN-10** | **Visualizador de Certificado Imprimível A4** | Renderização vetorial no endpoint `/api/certificados/visualizar/:codigo` pronta para PDF sem PDFKit. |
| **DN-11** | **Sincronização de Progresso na Sala de Aula** | Checkboxes de aulas concluídas mantêm o estado sincronizado com o banco ao recarregar a tela. |
| **DN-12** | **Governança Open-Source e Manuais Comunitários** | `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` e templates de Issue/PR criados. |
| **DN-13** | **Modularização da Documentação (`docs/`)** | README principal simplificado com guias específicos em `docs/`. |

---

## ⚠️ Matriz de Problemas Mapeados, Riscos e Soluções (Roadblocks)

| Problema / Desafio | Ocorrência / Sintoma | Causa Raiz | Solução / Mitigação Implementada |
|---|---|---|---|
| **Ausência de Sistema de Arquivos no Serverless** | `pdfkit` causava erro ao tentar salvar arquivo PDF no disco local na Cloudflare. | Ambientes Serverless Edge não possuem sistema de arquivos persistente em disco. | **Solução:** Criado endpoint HTML/CSS solene com `@media print` A4 paisagem, delegando a geração do PDF ao motor vetorial nativo do próprio navegador. |
| **Bloqueio de CORS no Frontend Estático** | Erros de requisição bloqueada ao testar o frontend local com a API na nuvem. | Domínios e portas de origem diferentes sem cabeçalhos autorizados. | **Solução:** Adicionado cabeçalho unificado `Access-Control-Allow-Origin: *` em todas as respostas da API no Worker, inclusive em requisições preflight `OPTIONS`. |
| **Senha Atual Rejeitada no Perfil** | Usuário digitava a senha correta, mas recebia "Senha atual incorreta". | `getUserById` omitia o campo `senha_hash` por segurança, deixando o valor como `undefined`. | **Solução:** Criada query específica que recupera o hash apenas no momento estrito da conferência de troca de senha. |
| **Cancelamento de Matrícula Quebrado** | Clicar em "Cancelar" na tabela de matrículas falhava silenciosamente. | O parser da URL pegava `parts[2]` (`"matriculas"`) em vez de `parts[3]` (o ID numérico). | **Solução:** Ajustado o índice de leitura para extrair o ID numérico correto da rota. |
| **Travamento de Commits Git por Assinatura GPG** | Comandos `git commit` ficavam travados aguardando confirmação no terminal de fundo. | `commit.gpgsign=true` ativo no Git global do Windows solicitando GUI PIN. | **Solução:** Uso do parâmetro `--no-gpg-sign` em execuções de CI/automação e documentação no guia de contribuição. |

---

## 🛠️ Como Adicionar e Usar este Kanban no GitHub Projects

Para ter este quadro funcionando de forma interativa e visual dentro do repositório no GitHub:

### Passo 1: Acessar a Aba Projects
1. Acesse o repositório no GitHub: `https://github.com/LMS-COMPASSO/lms`
2. No menu superior do repositório, clique na aba **Projects**.
3. Clique no botão verde **New project** (ou crie a partir da sua organização/usuário).

### Passo 2: Escolher o Modelo "Board"
1. Na lista de modelos, selecione **Board** (Kanban).
2. Dê o nome: `LMS BNCC Computação - Roadmap & Tarefas`.
3. Clique em **Create project**.

### Passo 3: Configurar as Colunas de Status
O GitHub Projects criará colunas padrão. Ajuste os nomes para:
1. `📥 Backlog`
2. `📌 A Fazer (To Do)`
3. `🔄 Em Progresso`
4. `🔍 Em Revisão / QA`
5. `✅ Concluído (Done)`

### Passo 4: Criar Campos Personalizados (*Custom Fields*)
Para organizar melhor as tarefas com viés educacional, clique no ícone `+` no canto direito da tabela do projeto e adicione:
- **Eixo BNCC (Single Select):** Opções: `Pensamento Computacional`, `Mundo Digital`, `Cultura Digital`, `Gestão Escolar`, `Geral`.
- **Prioridade (Single Select):** Opções: `🔴 Alta`, `🟡 Média`, `🟢 Baixa`.
- **Tipo (Single Select):** Opções: `✨ Funcionalidade`, `🐛 Bug`, `📚 Pedagógico`, `🛡️ Segurança`.

### Passo 5: Converter Itens em Issues com 1 Clique
No GitHub Projects, ao digitar qualquer cartão deste documento (ex: *"Integração com Scratch / Blockly no Navegador"*), você pode clicar com o botão direito e escolher **Convert to issue**. O GitHub criará automaticamente a issue rastreável vinculada ao código!

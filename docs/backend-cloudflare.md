# Guia do Backend: Cloudflare Workers & Cloudflare D1

Este guia fornece instruções completas de configuração, manutenção e operação do backend serverless da plataforma LMS utilizando **Cloudflare Workers** e o banco de dados relacional **Cloudflare D1**.

---

## Como Funciona a Arquitetura Serverless Edge?

Diferente de um servidor tradicional que roda em uma máquina virtual fixa:

1. **Cloudflare Workers:** Seu código JavaScript roda nos mais de 300 data centers da Cloudflare no mundo todo. Quando um aluno acessa a plataforma em qualquer cidade, o código responde a partir do data center mais próximo geograficamente (menor latência possível).
2. **Cloudflare D1:** É um banco de dados relacional SQL (baseado em SQLite) nativo da nuvem da Cloudflare. Não há portas para abrir, pools de conexões para monitorar ou servidores de banco de dados tradicionais para reiniciar.

---

## Comandos NPM Pré-configurados

No arquivo `package.json`, estão disponíveis atalhos prontos para facilitar a rotina:

```bash
# Iniciar o Worker localmente em modo desenvolvimento (http://localhost:8787)
npm run dev

# Fazer o deploy do Worker na nuvem da Cloudflare
npm run deploy

# Criar tabelas e índices no banco local de desenvolvimento
npm run cf:db:local

# Criar tabelas e índices no banco oficial de produção na Cloudflare
npm run cf:db:remote

# Inserir os dados de demonstração (cursos da BNCC e usuários) no banco local
npm run cf:seed:local

# Inserir os dados de demonstração no banco de produção na Cloudflare
npm run cf:seed:remote
```

---

## Configuração do Zero Passo a Passo

Se você estiver configurando o projeto para a sua própria conta Cloudflare:

### 1. Fazer Login no Wrangler CLI

```bash
npx wrangler login
```

*O navegador abrirá uma tela para autorizar o acesso à sua conta Cloudflare.*

### 2. Criar o Banco D1

```bash
npx wrangler d1 create lms_prod
```

O terminal retornará o identificador único do banco (`database_id`).

### 3. Atualizar o `wrangler.jsonc`

No arquivo `wrangler.jsonc` na raiz do projeto, insira o seu `database_id`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "lms",
  "main": "src/worker/index.js",
  "compatibility_date": "2026-09-12",
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "lms_prod",
      "database_id": "COLE_SEU_DATABASE_ID_AQUI"
    }
  ],
  "vars": {
    "JWT_SECRET": "coloque-uma-chave-secreta-longa-e-aleatoria"
  }
}
```

### 4. Executar Migrações e Dados Iniciais

```bash
# Cria as tabelas e índices
npm run cf:db:remote

# Carrega os cursos modelo da BNCC e contas de teste
npm run cf:seed:remote
```

### 5. Publicar o Worker

```bash
npm run deploy
```

Ao término, você receberá a URL pública do seu backend (ex: `https://lms.sua-conta.workers.dev`).

---

## Gerenciamento Visual pelo Painel da Cloudflare (Sem Terminal)

Para quem prefere uma interface gráfica no navegador:

1. Acesse o **[Cloudflare Dashboard](https://dash.cloudflare.com/)**.
2. No menu lateral, vá em **Storage & Databases** ➔ **D1 SQL Database**.
3. Selecione o banco de dados **`lms_prod`**.
4. **Visualizar dados e tabelas:**
   - Acesse a aba **Explore Data**.
   - Escolha qualquer tabela (`usuarios`, `cursos`, `matriculas`, etc.).
   - Você pode pesquisar registros, adicionar linhas e editar dados visualmente.
5. **Executar comandos SQL:**
   - Acesse a aba **Console**.
   - Digite sua instrução (ex: `SELECT * FROM cursos WHERE status = 'publicado';`) e clique em **Execute**.
6. **Acompanhar métricas e logs ao vivo:**
   - No menu lateral, clique em **Workers & Pages** ➔ selecione **`lms`**.
   - Acesse a aba **Observability** ➔ clique em **Begin Log Stream** para ver cada requisição em tempo real.

---

## Dicas Úteis do Wrangler CLI

```bash
# Listar todos os bancos D1 da sua conta
npx wrangler d1 list

# Ver todas as tabelas criadas no banco remoto
npx wrangler d1 execute lms_prod --remote --command="PRAGMA table_list;"

# Fazer backup do banco remoto para um arquivo SQL local
npx wrangler d1 export lms_prod --remote --output=./backup_lms.sql

# Inspecionar logs de erros em tempo real no seu terminal
npx wrangler tail
```

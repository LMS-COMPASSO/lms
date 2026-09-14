# ❓ Perguntas Frequentes & Solução de Problemas (Troubleshooting)

Este guia reúne as dúvidas mais comuns de iniciantes e os passos para solucionar rapidamente pequenos imprevistos de desenvolvimento e deploy.

---

## 1. Erro de CORS (Cross-Origin Resource Sharing)

### Sintoma
O console do navegador exibe uma mensagem vermelha parecida com:
`Access to fetch at 'https://...' from origin 'http://localhost' has been blocked by CORS policy`.

### Causa
O navegador bloqueia requisições quando o frontend e o backend rodam em domínios ou portas diferentes sem a autorização explícita do backend.

### Como Solucionar
O backend em `src/worker/index.mjs` já inclui os cabeçalhos universais de CORS:
```javascript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```
Certifique-se de que fez o deploy recente (`npm run cf:deploy`) para que esses cabeçalhos estejam ativos na sua URL pública.

---

## 2. "Sessão expirada. Faça login novamente."

### Sintoma
Ao tentar navegar entre as páginas, o sistema exibe uma mensagem de sessão expirada e retorna para a tela de login.

### Causa
O token JWT armazenado no seu navegador expirou ou o segredo `JWT_SECRET` no `wrangler.jsonc` foi alterado.

### Como Solucionar
Basta fazer login novamente com seu usuário e senha. Se desejar limpar a sessão manualmente no console do navegador (F12):
```javascript
localStorage.clear();
location.href = '/index.html';
```

---

## 3. "Tabela não encontrada" ou "no such table: usuarios"

### Sintoma
Ao rodar a API, os endpoints retornam erro 500 indicando que as tabelas não existem.

### Causa
O arquivo `d1/schema.sql` ainda não foi executado no banco de dados.

### Como Solucionar
- Se estiver rodando localmente:
  ```bash
  npm run cf:db:local
  npm run cf:seed:local
  ```
- Se estiver rodando na nuvem:
  ```bash
  npm run cf:db:remote
  npm run cf:seed:remote
  ```

---

## 4. "Database ID não encontrado" no deploy do Wrangler

### Sintoma
O comando `npm run cf:deploy` falha dizendo que o banco D1 não foi localizado.

### Causa
O valor do campo `database_id` no arquivo `wrangler.jsonc` ainda está com o ID de exemplo ou de outra conta.

### Como Solucionar
1. Liste seus bancos D1:
   ```bash
   npx wrangler d1 list
   ```
2. Copie o `database_id` retornado para o seu banco `lms_prod`.
3. Cole no campo `database_id` dentro do arquivo `wrangler.jsonc`.

---

## 5. Como resetar o banco de dados e recomeçar do zero?

Caso queira apagar todos os dados de teste e reconstruir a estrutura limpa:
```bash
# Executa o schema limpo (recria as tabelas)
npm run cf:db:remote

# Reinsere os cursos padrão da BNCC e usuários iniciais
npm run cf:seed:remote
```

---

## 6. Porta 8787 já em uso no desenvolvimento local

### Sintoma
O comando `npm run cf:dev` avisa que a porta `8787` já está ocupada por outro processo.

### Como Solucionar
Você pode especificar outra porta diretamente:
```bash
npx wrangler dev --port 8788
```
E atualizar temporariamente o seu `public/js/config.js` para apontar para `http://localhost:8788/api`.

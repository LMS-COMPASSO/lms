# Guia do Frontend: Interface Web e GitHub Pages

Este guia explica o funcionamento do frontend da plataforma **LMS BNCC Computação**, idealizado para ser simples de entender, rápido de carregar e sem a sobrecarga de frameworks pesados.

---

## Filosofia do Frontend: Leve, Puro e Acessível

O frontend utiliza exclusivamente as tecnologias nativas da web:

- **HTML5 Semântico:** Estrutura clara com tags acessíveis (`<main>`, `<aside>`, `<nav>`, `<table>`).
- **CSS Vanilla Moderno (`public/css/style.css`):** Design responsivo (mobile-first), com suporte a modo escuro elegante, variáveis CSS e sem necessidade de ferramentas de compilação ou TailwindCSS.
- **JavaScript Nativo (ES6+):** Utiliza a API `fetch` do navegador e manipulação direta do DOM, tornando a leitura do código fluida e ideal para quem está aprendendo desenvolvimento web.

---

## Mapa das Páginas do Frontend (`public/`)

| Arquivo | Finalidade | Perfis que Acessam |
| --- | --- | --- |
| **`index.html`** | Tela de login no sistema | Público |
| **`registrar.html`** | Cadastro inicial de novos alunos | Público |
| **`dashboard.html`** | Indicadores gerais, totais de alunos e linha do tempo | Administrador, Instrutor |
| **`cursos.html`** | Catálogo de cursos com busca e filtros por Eixo BNCC | Todos os perfis |
| **`curso-detalhe.html`** | Sala de aula com módulos, aulas e checklists de progresso | Todos os perfis |
| **`matriculas.html`** | Listagem de matrículas e solicitação de certificados | Todos os perfis |
| **`certificados.html`** | Visualização de certificados e ferramenta de validação | Todos os perfis |
| **`perfil.html`** | Consulta de dados pessoais e alteração de senha | Todos os perfis |
| **`usuarios.html`** | Gestão, filtro e redefinição de senhas de usuários | Administrador |

---

## Comunicação com o Backend

A comunicação entre a tela e o servidor ocorre por meio de dois scripts principais:

### 1. `public/js/config.js` (Configuração da API)

Define a URL base da API. Por padrão, utiliza URL relativa (`/api`), o que elimina problemas de CORS quando servido pelo Cloudflare Workers:

```javascript
const DEFAULT_API = '/api';

// Permite sobrescrever via localStorage para testes específicos:
const overrideApi = localStorage.getItem('debug_api');
window.LMS_API_BASE = overrideApi || DEFAULT_API;
```

### 2. `public/js/api.js` (Cliente HTTP com JWT)

- Armazena o token de autenticação JWT no `localStorage` sob a chave `lms_token`.
- Adiciona automaticamente o cabeçalho `Authorization: Bearer <TOKEN>` em todas as requisições autenticadas.
- Trata erros de rede e redireciona para o login caso a sessão tenha expirado (código HTTP `401`).

---

## Como Publicar o Frontend no GitHub Pages (Custo Zero)

Como o frontend é composto apenas de arquivos estáticos, você pode hospedá-lo gratuitamente no **GitHub Pages**:

1. No seu repositório no GitHub, acesse a aba **Settings**.
2. No menu lateral esquerdo, clique em **Pages**.
3. Na seção **Build and deployment**:
   - Em **Source**, selecione **Deploy from a branch**.
   - Escolha a branch `main` e a pasta `/public`.
4. Clique em **Save**.
5. Em poucos instantes, o GitHub fornecerá a URL pública do seu site (ex: `https://seu-usuario.github.io/lms/`).
6. Caso hospede o frontend separadamente da API Worker, defina a URL completa da API em `public/js/config.js`.

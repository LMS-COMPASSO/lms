# 🤝 Guia de Contribuição — LMS BNCC Computação

Ficamos muito felizes pelo seu interesse em contribuir com o **LMS BNCC Computação**! Este projeto é de código aberto e tem como missão apoiar redes públicas municipais e escolas no ensino de tecnologia e computação para crianças e jovens.

Você não precisa ser um programador experiente para contribuir: aceitamos desde correções de código até sugestões pedagógicas e planos de aula.

---

## 🎯 Como Você Pode Contribuir?

### 1. Educadores e Professores (Contribuições Pedagógicas)

- Sugerir novas atividades desplugadas ou plugadas para os 3 eixos da BNCC (Pensamento Computacional, Mundo Digital, Cultura Digital).
- Propor novos cursos ou módulos voltados para anos escolares específicos (1º ao 9º Ano).
- Revisar a linguagem e adequação pedagógica dos textos e questionários.
- Relatar sugestões abrindo uma **[Issue no GitHub](https://github.com/LMS-COMPASSO/lms/issues)** usando o template de Sugestão de Curso.

### 2. Desenvolvedores e Designers (Contribuições Técnicas)

- Melhorar a acessibilidade visual (WCAG), contraste e responsividade em celulares.
- Implementar novas rotas ou otimizar consultas SQL no Cloudflare D1.
- Adicionar novos testes e validações na API Serverless (Workers).
- Reportar e corrigir bugs encontrados.

---

## 🛠️ Passo a Passo para Contribuir com Código

### Passo 1: Fazer um Fork do Repositório

No canto superior direito da página deste repositório no GitHub, clique no botão **Fork** para criar uma cópia do projeto na sua conta.

### Passo 2: Clonar o seu Fork

No seu computador, abra o terminal e execute:

```bash
git clone https://github.com/SEU-USUARIO/lms.git
cd lms
```

### Passo 3: Criar uma Branch para sua Alteração

Evite trabalhar diretamente na branch `main`. Crie uma branch com um nome descritivo:

```bash
# Para uma melhoria de funcionalidade:
git checkout -b feature/minha-nova-funcionalidade

# Para a correção de um erro:
git checkout -b fix/correcao-bug-login
```

### Passo 4: Fazer suas Alterações e Testar Localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Inicie o backend localmente com o Wrangler:

   ```bash
   npm run cf:dev
   ```

3. Abra as páginas da pasta `public/` no navegador para verificar suas alterações.

### Passo 5: Criar Commits Claros e Padronizados

Utilizamos o padrão de **Conventional Commits** para manter o histórico limpo e compreensível:

- `feat:` Nova funcionalidade (ex: `feat: adiciona filtro por ano escolar nos cursos`)
- `fix:` Correção de bug (ex: `fix: corrige validacao de senha no perfil`)
- `docs:` Alterações na documentação (ex: `docs: adiciona instrucoes no README`)
- `style:` Formatação de layout ou CSS sem alterar lógica
- `refactor:` Refatoração de código

Exemplo:

```bash
git add .
git commit -m "feat: adiciona novo curso de pensamento computacional para o 3o ano"
```

### Passo 6: Enviar para o GitHub e Abrir o Pull Request

1. Envie sua branch para o seu repositório remoto:

   ```bash
   git push origin feature/minha-nova-funcionalidade
   ```

2. Acesse o repositório original no GitHub.
3. Você verá uma mensagem sugerindo abrir um **Pull Request**. Clique em **Compare & pull request**.
4. Preencha a descrição explicando o que foi feito e cite se há alguma issue relacionada.

---

## 📋 Boas Práticas

- **Mantenha a Simplicidade:** O projeto preza por código fácil de entender para professores e iniciantes em programação. Evite bibliotecas pesadas e desnecessárias no frontend.
- **Respeito aos Dados:** Nunca suba senhas, tokens ou certificados privados em commits públicos.
- **Respeite o Código de Conduta:** Todos os participantes devem seguir as diretrizes do [Código de Conduta](CODE_OF_CONDUCT.md).

---

## 💬 Dúvidas ou Dificuldades?

Abra uma **[Discussão](https://github.com/LMS-COMPASSO/lms/discussions)** ou uma **Issue** no GitHub. Toda dúvida é válida e estamos aqui para ajudar!

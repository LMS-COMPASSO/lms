# 🚀 Descrição do Pull Request

Explique de forma concisa o que este PR adiciona, corrige ou refatora no **LMS COMPASSO**.

## 📌 Tipo de Alteração
Marque com um `[x]` as opções aplicáveis:
- [ ] Correção de bug (*bug fix*)
- [ ] Nova funcionalidade (*feature*)
- [ ] Acessibilidade e Wayfinding Digital (WCAG 2.2 AA / Ícones / Cores)
- [ ] Conteúdo pedagógico ou alinhamento com a BNCC Computação
- [ ] Laboratório 3D Python (Three.js / Pyodide)
- [ ] Backend Serverless / Banco Cloudflare D1
- [ ] CI/CD, Automação de Qualidade ou Governança
- [ ] Documentação (*docs / README*)

## 📚 Habilidades da BNCC Computação Afetadas
- Liste as habilidades impactadas (ex.: `EF15CO02`, `EF69CO03`, ou `Nenhuma`).

## 🔗 Issues Vinculadas
- Conecta a alguma issue aberta? Exemplo: `Fixes #12` ou `Closes #34`

---

## 🧪 Portões de Validação Local (Obrigatório antes do PR)
Marque o que foi executado no seu ambiente local:
- [ ] `npm run quality` executado com **100% de sucesso** (sintaxe, schemas, testes unitários, dry-run e scan de segredos).
- [ ] `python3 tests/python/test_atividades_3d.py` validado com sucesso para atividades Python 3D.
- [ ] Testes unitários (`npm test`) com 67+ testes passando.
- [ ] Schemas e rotas (`node scripts/validar-schemas.js`) sem links quebrados.

---

## ♿ Checklist de Acessibilidade e Responsividade
- [ ] **Responsividade testada**: verificado nas larguras 360px (mobile), 768px (tablet), 1024px e 1366px (desktop).
- [ ] **Acessibilidade WCAG 2.2 AA**: testado com leitor de tela ou simulador de contraste; sem violações no axe-core.
- [ ] **Navegação por Teclado**: fluxo operável via `Tab` / `Shift+Tab` / `Esc` com foco visível.
- [ ] **Wayfinding**: breadcrumb com `aria-label="Você está aqui"` e item ativo com `aria-current="page"`.
- [ ] **Ícones Universais**: ícones importados do registro oficial (`icon-registry.json`) com nome acessível.

---

## ⚡ Impacto no Desempenho e Bundle
- [ ] Avaliado tempo de resposta e peso dos ativos (sem inclusão desnecessária de bibliotecas pesadas no bundle inicial).
- [ ] Pyodide e Three.js permanecem carregados sob demanda apenas na rota do laboratório 3D.

---

## 📸 Capturas de Tela / Evidências Visuais
*Cole aqui capturas de tela comparando o antes e o depois (modo padrão e modo alto contraste):*

---

## 🛡️ Checklist de Governança e Segurança
- [ ] Não incluí chaves de API, senhas, tokens ou dados sensíveis nos commits.
- [ ] Respeitei o vocabulário canônico do projeto ("Atividade", "Criar conta", "Entrar").
- [ ] Mensagem de commit no padrão Conventional Commits (ex.: `feat:`, `fix:`, `docs:`, `chore:`).
- [ ] Li e concordo com o [Código de Conduta](CODE_OF_CONDUCT.md) e o [Guia de Contribuição](CONTRIBUTING.md).

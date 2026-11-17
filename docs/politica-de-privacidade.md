# Política de Privacidade — LMS COMPASSO

**Última atualização:** 16 de novembro de 2026  
**Versão:** 1.0 (Auditorada sobre o código-fonte em produção)  
**Controlador / Iniciativa:** Startup LMS COMPASSO — Projeto de Inovação SUAP/IFMA nº 14246/2025 (Instituto Federal do Maranhão — Campus Grajaú)  
**Canal do Encarregado pelo Tratamento de Dados Pessoais (DPO):** `dpo@lms-compasso.edu.br`  
**Publicação Web:** `/privacy` (ou `/privacy.html`)  

---

## 1. Compromisso e Transparência (LGPD e Proteção Infantojuvenil)

O **LMS COMPASSO** é uma plataforma educacional de código aberto (Licença MIT) dedicada ao ensino da **BNCC Computação** (Resolução CNE/CEB nº 1/2022 e Resolução CNE nº 2/2025) nos eixos de **Pensamento Computacional**, **Mundo Digital** e **Cultura Digital**.

Este documento foi redigido a partir do mapeamento direto do esquema de banco de dados (`d1/schema.sql`), das rotas de API Serverless (`src/worker/`) e do armazenamento no navegador (`public/js/`), em conformidade com a **Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018)**, inclusive com o **Art. 14** (tratamento de dados de crianças e adolescentes no melhor interesse educacional) e, no que couber, com o **GDPR** europeu.

> **Princípio da Minimização:** Não exibimos anúncios, não vendemos dados escolares, não utilizamos cookies de rastreamento de terceiros e não coletamos localização GPS, microfone ou câmera (`Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`).

---

## 2. Quadro Resumo de Dados Coletados, Finalidades e Bases Legais

| Categoria / Tabela no Sistema | Dados Efetivamente Coletados no Código | Finalidade Específica | Base Legal (LGPD) | Prazo de Retenção / Exclusão |
| :--- | :--- | :--- | :--- | :--- |
| **Conta e Autenticação** (`usuarios`) | `nome`, `email`, `senha_hash` (PBKDF2-SHA256 com 100.000 iterações e salt de 16 bytes), `perfil` (`administrador`, `instrutor`, `aluno`), `avatar_url` (opcional via Google), `ativo`, `criado_em`, `atualizado_em` | Identificação escolar, controle de acesso baseado em papéis (RBAC) e autenticação segura por senha ou Google Acadêmico | **Execução de contrato / Políticas públicas educacionais** (Art. 7º, III e V) e **Melhor interesse do estudante** (Art. 14) | Enquanto a conta escolar estiver ativa; desativação lógica (`ativo = 0`) ou exclusão mediante solicitação institucional |
| **Acessibilidade e Tema** (`preferencias_usuario`) | `alto_contraste`, `fonte_ampliada`, `reduzir_movimento`, `tema` (`claro`, `escuro`, `sistema`) | Persistir preferências de acessibilidade WCAG 2.2 AA em diferentes computadores e celulares da escola | **Execução de contrato / Acessibilidade inclusiva** (Art. 7º, V e Art. 14) | Vinculada à conta; excluída em cascata (`ON DELETE CASCADE`) se o usuário for removido |
| **Jornada e Matrículas** (`matriculas`, `progresso_aulas`, `tentativas_avaliacao`) | `curso_id`, `status`, `progresso_percentual`, `data_matricula`, `data_conclusao`, `concluida`, `nota`, `aprovado`, `respostas` | Registrar avanço nas aulas, corrigir questionários, calcular equilíbrio de telas (Res. CNE 2/2025) e habilitar emissão de certificados | **Execução de contrato / Cumprimento de dever pedagógico** (Art. 7º, II e V) | Durante o vínculo escolar; removida em cascata (`ON DELETE CASCADE`) caso a conta seja excluída |
| **Certificação e Competências** (`certificados`, `usuario_medalhas`, `desempenho_habilidades`) | `codigo_validacao` (`CERT-...`), `url_arquivo`, `data_emissao`, `habilidade_codigo` (ex.: `EF05CO01`), `pontuacao`, `nivel_atingido` | Emitir certificados A4 verificáveis publicamente (`/api/certificados/validar/:codigo`), conceder medalhas BNCC e gerar Diário Escolar CSV | **Execução de contrato / Obrigação regulatória escolar** (Art. 7º, II e V) | Mantida enquanto durar o registro acadêmico ou até solicitação de exclusão |
| **Laboratório Python 3D e Trabalho em Dupla** (`submissoes_python`) | `atividade_id`, `codigo_python` (até 20.000 caracteres), `sucesso`, `tentativas`, `estrelas`, `parceiro_dupla`, `papel_dupla` (`individual`, `piloto`, `navegador`) | Salvar missões Python 3D resolvidas, validar a conquista da medalha Explorador Python 3D (6 missões reais) e permitir avaliação docente | **Execução de contrato educacional** (Art. 7º, V) | Vinculada à conta; removida em cascata (`ON DELETE CASCADE`) na exclusão do usuário |
| **Pesquisa de Usabilidade Piloto** (`avaliacoes_usabilidade_sus`) | `usuario_id` (opcional), `nome_participante`, `participante_tipo`, `escola_turma`, respostas `q1` a `q10`, `sus_score`, `tempo_segundos`, `tarefas_concluidas`, `comentarios` | Avaliação psicométrica SUS (Brooke, 1996) para melhoria contínua de usabilidade escolar | **Consentimento / Estudos por órgão de pesquisa — IFMA** (Art. 7º, I e IV; Art. 16, II) | Consultas públicas exibem apenas dados anonimizados (`Participante #ID`). Na desativação/exclusão da conta, os registros são desvinculados e anonimizados (`usuario_id = NULL`, `ON DELETE SET NULL`), conservando a amostra estatística para pesquisa (LGPD Art. 16, II) |
| **Proteção contra Força Bruta (RAM do Worker)** | Endereço IP (`cf-connecting-ip` / `x-forwarded-for`) e `email` em tentativa falha de login | Bloquear ataques de força bruta e *credential stuffing* após 5 tentativas erradas por 15 minutos (`auth_rotas.js`) | **Legítimo interesse em segurança da informação** (Art. 7º, IX e Art. 46) | **Armazenamento estritamente volátil em RAM** (limite máximo de 5.000 chaves com poda automática). Nunca é gravado no banco D1 |

---

## 3. Subprocessadores, Serviços Terceiros e Infraestrutura

A inspeção do código-fonte identifica exclusivamente os seguintes provedores e serviços externos:

1. **Cloudflare, Inc. (Workers & Banco de Dados D1 `lms_prod`):** Hospedagem serverless da API (`/api/*`), entrega dos arquivos estáticos (`env.ASSETS`), mitigação de DDoS/WAF e banco de dados relacional D1 (`wrangler.jsonc`). Além disso, entrega via CDN (`cdnjs.cloudflare.com`) a biblioteca gráfica `Three.js` (`r128`) e a biblioteca de animações `GSAP` (`3.12.5`) utilizadas no navegador.
2. **Google LLC (Google Identity Services & Google Fonts):**
   - **Autenticação Institucional (`accounts.google.com/gsi/client`, `oauth2.googleapis.com/token`, `www.googleapis.com/oauth2/v3/certs`):** Quando habilitado (`GOOGLE_CLIENT_ID`), verifica criptograficamente (RS256) o token da conta Google Workspace for Education do usuário e lê apenas `email`, `email_verified`, `name`, `picture`, `sub` e domínio institucional (`hd`).
   - **Tipografia e Ícones (`fonts.googleapis.com`, `fonts.gstatic.com`):** Carregamento de ícones `Material Symbols Outlined` e fontes `Cinzel` / `Inter` usadas nos certificados para impressão.
3. **jsDelivr CDN (`cdn.jsdelivr.net/pyodide/v0.26.2/full/`):** Fornece os binários WebAssembly do **Pyodide** para que o código Python dos estudantes seja executado localmente dentro de um *Web Worker* no próprio navegador do dispositivo, sem envio do código para execução remota em servidores de terceiros.

---

## 4. Armazenamento Local (`localStorage` / `sessionStorage`) e Política de Cookies

O **LMS COMPASSO** **não grava cookies HTTP de rastreamento, publicidade ou analytics comportamental**. Para manter o funcionamento leve e offline-resiliente em redes escolares, utilizamos estritamente chaves técnicas de armazenamento local no navegador (`localStorage` / `sessionStorage`):

| Chave no Navegador | Natureza | Finalidade Técnica |
| :--- | :--- | :--- |
| `lms_token` (e fallback `token`) | Essencial (Autenticação) | Armazena o token JWT assinado (HS256, validade padrão de 8 horas) para autenticar chamadas à API |
| `lms_usuario` (e fallback `usuario`) | Essencial (Sessão) | Cache local do resumo da conta logada (`id`, `nome`, `email`, `perfil`) para renderizar menus e permissões |
| `lms_tema` | Funcional (Preferência) | Guarda a escolha de tema visual (`claro`, `escuro` ou automático do sistema) |
| `lms_a11y_alto-contraste`, `lms_a11y_fonte-ampliada`, `lms_a11y_reduzir-movimento` | Funcional (Acessibilidade) | Aplicadas imediatamente antes da renderização para evitar flash visual (FOUC) de contraste ou movimento |
| `lms_idioma` | Funcional (Localização) | Armazena o idioma escolhido entre os 9 idiomas suportados (`pt-BR`, `en`, `es`, etc.) |
| `lms_sidebar_recolhida`, `lms_som_ativo` | Funcional (Interface) | Lembra o estado da barra lateral e preferência de áudio dos laboratórios |
| `lms_progresso_atividades_v1`, `lms_ultima_atividade_v1`, `lms_submissoes_python_local` | Funcional (Pedagógica) | Permite praticar atividades sem login prévio e manter rascunhos locais no dispositivo |
| `debug_api` | Técnica (Diagnóstico) | Sobrescrita opcional de URL base de API para testes de desenvolvimento local |

---

## 5. Segurança, Criptografia e Proteção de Dados Escolares

- **Hashing de Senhas:** Novas senhas e migrações automáticas no login utilizam `PBKDF2-SHA256` com `100.000` iterações e *salt* criptográfico aleatório de `16` bytes (`src/worker/crypto_seguranca.js`). Comparações ocorrem em tempo constante.
- **Autenticação por Tokens JWT:** Assinados com `HMAC-SHA256` e segredo mínimo obrigatório de 32 caracteres (`JWT_SECRET`), com expiração (`exp`) de 8 horas e bloqueio de segredos previsíveis.
- **Cabeçalhos de Defesa em Profundidade (MDN Web Security):** Toda resposta da API e de arquivos estáticos inclui `Content-Security-Policy` (sem `unsafe-eval` de JS), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin` e `Permissions-Policy`.
- **Neutralização de XSS e Injeções:** Consultas ao D1 usam exclusivamente *prepared statements* parametrizados (`?`); respostas HTML em certificados escapam caracteres perigosos (`escaparHtml`) e exportações CSV neutralizam *CSV Formula Injection* (`escaparCelulaCsv`).

---

## 6. Direitos dos Titulares (LGPD Art. 18 e GDPR) e Exclusão de Dados

Todo usuário (ou seu responsável legal / instituição de ensino, no caso de menores de idade) pode exercer a qualquer momento os seguintes direitos:

1. **Confirmação e Acesso / Portabilidade (`GET /api/auth/exportar-dados`):** Usuário autenticado pode baixar imediatamente todos os seus dados pessoais, matrículas, certificados, medalhas, habilidades BNCC e submissões Python em formato JSON diretamente pelo portal (`Meu Perfil`) ou via API.
2. **Correção de Dados Incompletos ou Desatualizados:** Via administração escolar (`PUT /api/usuarios/:id`) ou solicitação ao Encarregado.
3. **Desativação (`Soft Delete`) vs. Exclusão Definitiva (`Hard Delete`):**
   - A desativação padrão via painel administrativo (`DELETE /api/usuarios/:id`) define `ativo = 0`, impedindo novos logins sem apagar o histórico documental de certificados emitidos.
   - Mediante solicitação formal ao Encarregado (DPO) ou exclusão administrativa no banco D1, o registro do usuário é removido permanentemente (*hard delete*), acionando `ON DELETE CASCADE` para apagar `preferencias_usuario`, `matriculas`, `progresso_aulas`, `tentativas_avaliacao`, `certificados`, `usuario_medalhas`, `desempenho_habilidades` e `submissoes_python`, e anonimizando (`ON DELETE SET NULL`) registros estatísticos de `avaliacoes_usabilidade_sus`.
4. **Revogação de Consentimento e Oposição:** Aplicável a participações na pesquisa de usabilidade SUS e vínculo OAuth Google.

---

## 7. Transferência Internacional de Dados

Por utilizar infraestrutura distribuída em borda (*Edge Computing*) da **Cloudflare, Inc.** e serviços de autenticação opcional/fontes da **Google LLC**, determinados dados de tráfego ou metadados de autenticação podem transitar ou ser processados em datacenters localizados fora do território brasileiro (incluindo Estados Unidos e União Europeia).

Tais transferências observam o **Art. 33 da LGPD** e o **Capítulo V do GDPR**, amparadas em cláusulas contratuais padrão, certificações internacionais de segurança dos provedores e proteção criptográfica em trânsito (TLS/HTTPS obrigatório com HSTS).

---

## 8. Encarregado pelo Tratamento de Dados (DPO) e Contato

Para exercer direitos previstos na LGPD, solicitar exclusão definitiva de conta, reportar vulnerabilidades ou esclarecer dúvidas institucionais:

- **Controlador:** Startup LMS COMPASSO · Projeto de Inovação SUAP/IFMA nº 14246/2025 (IFMA Campus Grajaú)
- **E-mail do Encarregado (DPO):** `dpo@lms-compasso.edu.br`
- **Repositório Público & Segurança:** <https://github.com/LMS-COMPASSO/lms> (consulte também `SECURITY.md`)

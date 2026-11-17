# Termos de Serviço e Condições de Uso — LMS COMPASSO

**Última atualização:** 16 de novembro de 2026  
**Versão:** 1.0 (Alinhada às funcionalidades reais da plataforma)  
**Instituição Proponente / Responsável:** Startup LMS COMPASSO — Projeto de Inovação SUAP/IFMA nº 14246/2025 (IFMA Campus Grajaú)  
**Publicação Web:** `/terms` (ou `/terms.html`)  

---

## 1. Aceitação e Objeto do Serviço

Ao acessar ou utilizar o **LMS COMPASSO** (disponível em ambiente web serverless baseado em Cloudflare Workers e banco D1), você concorda integralmente com estes Termos de Serviço e com a nossa [Política de Privacidade](/privacy). Caso o usuário seja criança ou adolescente (estudante da Educação Básica), a utilização institucional pressupõe o vínculo com a escola/rede de ensino ou supervisão de responsável legal e docente.

O **LMS COMPASSO** oferece gratuitamente — e mediante modelos institucionais para redes de ensino — as seguintes funcionalidades reais implementadas no sistema:

1. **Catálogo de Cursos e Trilhas BNCC (`cursos`, `modulos`, `aulas`):** Organização curricular pelos três eixos estruturantes da Base Nacional Comum Curricular de Computação (Resolução CNE/CEB nº 1/2022): **Pensamento Computacional**, **Mundo Digital** e **Cultura Digital**.
2. **Atividades Interativas e Laboratório Python 3D (`/atividades.html`):** Desafios de sequenciamento lógico, decomposição de problemas, programação em blocos, simulação de robôs e laboratório tridimensional (Three.js + Pyodide WebAssembly) com suporte a trabalho em dupla colaborativa (`piloto` / `navegador`).
3. **Laboratórios Temáticos de Mundo Digital e Cultura Digital (`/mundo-digital.html`, `/cultura-digital.html`):** Inspeção 3D de hardware, simulação do ciclo da CPU e roteamento de pacotes TCP/IP, além de simulador de chat seguro, cofre de senhas e cidadania digital.
4. **Avaliações, Gamificação e Certificação (`/certificados.html`, `/perfil.html`):** Questionários avaliativos por módulo com cálculo automático de nota, sistema de medalhas BNCC, acompanhamento de desempenho por código de habilidade (`EF01CO02`, `EF69CO03`, etc.) e emissão de certificados digitais A4 com validação pública (`/api/certificados/validar/:codigo`).
5. **Painel Docente, Equilíbrio de Telas e Pesquisa SUS (`/dashboard.html`, `/usabilidade-piloto.html`):** Indicadores pedagógicos, monitoramento de equilíbrio entre atividades desplugadas e plugadas conforme a **Resolução CNE nº 2/2025**, exportação de Diário Escolar em CSV e coleta anônima/institucional de escala de usabilidade SUS (Brooke, 1996).

---

## 2. Perfis de Conta, Cadastro e Responsabilidades

O sistema opera com controle estrito de acesso baseado em papéis (RBAC):

- **Aluno (`aluno`):** Perfil padrão para novos cadastros manuais (`/api/auth/registrar`). Permite matrícula em cursos publicados, realização de aulas, envio de respostas a avaliações (respeitando o limite de tentativas configurado por avaliação), registro de atividades Python 3D e emissão de certificados após conclusão de 100% das aulas e aprovação nas avaliações vinculadas.
- **Instrutor (`instrutor`):** Pode criar e gerenciar seus próprios cursos, módulos, aulas, avaliações, visualizar relatórios pedagógicos e submissões Python apenas das turmas sob sua responsabilidade. A dedução automática de perfil instrutor via Google Acadêmico ocorre exclusivamente quando o e-mail verificado pelo Google apresenta prefixos/termos docentes (`prof.`, `professor`, `docente`, `coordenador`, `educador`) e pode ser ajustada pelo administrador escolar.
- **Administrador (`administrador`):** Responsável pela gestão de contas escolares, atribuição de perfis, redefinição de senhas e supervisão global da instância.

**Responsabilidades do Usuário:**
- Fornecer informações verídicas no cadastro e manter suas credenciais de acesso (ou conta Google Workspace for Education) sob sigilo;
- Não compartilhar tokens JWT ou tentar acessar recursos de outros usuários ou instrutores;
- Comunicar imediatamente ao administrador escolar ou ao canal oficial qualquer suspeita de uso indevido da conta.

---

## 3. Regras de Uso Aceitável

É expressamente proibido utilizar o LMS COMPASSO para:

1. Tentar burlar avaliações, automatizar submissões fraudulentas, manipular parâmetros de pontuação ou explorar vulnerabilidades de segurança (incluindo tentativas de força bruta no login ou injeção de fórmulas em relatórios);
2. Inserir conteúdos ofensivos, discriminatórios, ilegais ou protegidos por direitos autorais sem autorização nos campos de texto, perfis, código Python ou comentários de usabilidade;
3. Sobrecarregar intencionalmente a infraestrutura da API ou utilizar raspagem automatizada (*scraping*) abusiva fora das rotas públicas de validação de certificados;
4. Criar contas falsas se passando por docentes, gestores escolares ou terceiros.

---

## 4. Propriedade Intelectual e Licença Aberta (MIT)

- **Código-Fonte da Plataforma:** O software **LMS COMPASSO** é disponibilizado sob a **Licença MIT** (`LICENSE`), permitindo uso, cópia, modificação e implantação por escolas, secretarias de educação e desenvolvedores, mantidos os avisos de direitos autorais e a isenção de garantia previstos na licença.
- **Conteúdos Pedagógicos e Produções dos Estudantes:** Os códigos Python submetidos no Laboratório 3D, respostas e produções pedagógicas permanecem de titularidade dos respectivos estudantes, docentes e instituições de ensino que operam a plataforma.
- **Marca e Identidade Visual:** O nome **LMS COMPASSO**, logotipos e ativos gráficos do projeto devem ser utilizados em conformidade com a identidade institucional do projeto, sem sugerir endosso indevido em modificações não oficiais.

---

## 5. Planos Gratuitos, Assinaturas e Contratação Pública (`/planos.html`)

O LMS COMPASSO é disponibilizado nas seguintes modalidades apresentadas na plataforma:

1. **Plano Educacional Gratuito:** Acesso às atividades públicas da BNCC Computação e uso institucional gratuito para até **200 alunos** na modalidade de assinatura gratuita, sem cobrança por estudante nesse limite.
2. **Planos Escaláveis para Escolas e Redes:** Planos sob demanda dimensionados pela quantidade de alunos ativos, capacidade de armazenamento D1 e polos escolares, com ciclos mensais, semestrais ou anuais, conforme exibido na página `/planos.html`.
3. **Contratação pela Administração Pública:** Secretarias de Educação, Institutos Federais e redes públicas podem contratar suporte dedicado, implantação gerenciada e customizações via **Dispensa de Licitação** (Art. 75, II da Lei nº 14.133/2021) ou **Marco Legal das Startups** (Lei Complementar nº 182/2021), mediante emissão de minuta de proposta institucional e instrumento contratual específico.
4. **Cancelamento e Portabilidade:** Instituições contratantes ou usuários podem solicitar encerramento do vínculo ou cancelamento da matrícula/assinatura a qualquer momento, preservada a exportação dos dados pedagógicos (`GET /api/auth/exportar-dados` e relatórios CSV).

---

## 6. Disponibilidade e Limitação de Responsabilidade

A plataforma utiliza infraestrutura serverless de alta disponibilidade (Cloudflare Workers + D1), com meta operacional de **99,9% de disponibilidade** para ambientes institucionais contratados. Todavia, em conformidade com a Licença MIT aplicável ao software aberto:

- O ambiente comunitário gratuito é fornecido *"no estado em que se encontra"* (*as is*), podendo passar por manutenções programadas ou atualizações pedagógicas;
- Como a execução de código Python 3D ocorre localmente no navegador do usuário via WebAssembly (Pyodide) ou interpretador fallback, falhas decorrentes de dispositivos incompatíveis, bloqueios de rede local da escola ou extensões de navegador não geram responsabilidade por perda de dados não sincronizados;
- A instituição de ensino e os docentes mantêm a autonomia e responsabilidade pedagógica pela validação final de notas, frequência e emissão de histórico escolar oficial.

---

## 7. Alterações nos Termos e Foro Aplicável

Estes Termos podem ser atualizados para refletir evoluções técnicas do código, novas diretrizes do Conselho Nacional de Educação (CNE/MEC) ou adequações legais. Alterações relevantes serão publicadas nesta página com atualização da data de revisão.

Estes Termos são regidos pelas leis da **República Federativa do Brasil**. Fica eleito o foro da **Comarca de Grajaú, Estado do Maranhão**, sede do Campus proponente (IFMA Campus Grajaú), para dirimir quaisquer controvérsias oriundas deste instrumento, ressalvado o foro de domicílio do titular quando aplicável por força de lei consumerista ou estatuto protetivo.

**Dúvidas Jurídicas e Contato:** `dpo@lms-compasso.edu.br` · Projeto SUAP/IFMA nº 14246/2025.

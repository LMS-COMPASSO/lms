# 📊 Business Model Canvas (BMC) — LMS COMPASSO

## Plataforma Educacional para Ensino da BNCC Computação na Educação Básica (1º ao 9º ano)

> **Responsável / Autor:** Thiago Costa  
> **Instituição:** Instituto Federal do Maranhão (IFMA) — Campus Grajaú  
> **Versão:** 1.0 (2026) • 32 Cards Estratégicos Validados  
> **Conformidade Normativa:** Parecer CNE/CP nº 1/2022 (BNCC Computação) & Resolução CNE 2/2025 (Limites de Tempo de Tela)  
> **Acesso à Plataforma:** [https://lms.thedelacosta.workers.dev/](https://lms.thedelacosta.workers.dev/)

---

## 🖼️ Visualização do Canvas Executivo

O Business Model Canvas foi diagramado no formato canônico de 9 blocos de Alexander Osterwalder em **A4 Paisagem (Landscape)** e alta definição (200 DPI), disponível nos seguintes formatos:

- **PDF Executivo (1 página A4 Paisagem):** [`docs/bmc/lms-compasso-bmc.pdf`](file:///home/thiago/lms/docs/bmc/lms-compasso-bmc.pdf) | [`public/lms-compasso-bmc.pdf`](file:///home/thiago/lms/public/lms-compasso-bmc.pdf)
- **Imagem de Alta Resolução (PNG):** [`docs/bmc/img/lms-compasso-bmc.png`](file:///home/thiago/lms/docs/bmc/img/lms-compasso-bmc.png) | [`public/img/lms-compasso-bmc.png`](file:///home/thiago/lms/public/img/lms-compasso-bmc.png)
- **Visualizador Web Interativo com Botão de Impressão:** [`docs/bmc/lms-compasso-bmc.html`](file:///home/thiago/lms/docs/bmc/lms-compasso-bmc.html) | [`public/bmc.html`](file:///home/thiago/lms/public/bmc.html)

<div align="center">

![Business Model Canvas - LMS COMPASSO](file:///home/thiago/lms/docs/bmc/img/lms-compasso-bmc.png)

</div>

---

## 🧩 Os 9 Blocos Estratégicos do Canvas

### 1. Parcerias-Chave (Key Partners) — *Quem nos apoia*

1. **IFMA Campus Grajaú (`[IFMA GRAJAÚ]`):** Apoio institucional, fomento científico, infraestrutura acadêmica, orientação técnica docente e validação metodológica do projeto educacional.
2. **Redes Municipais de Ensino (`[REDES MUNICIPAIS]`):** Escolas e secretarias que fornecem o ambiente real de aplicação em sala de aula, co-design pedagógico e validação com alunos e professores.
3. **Provedores de Nuvem Edge (`[INFRA CLOUD]`):** Cloudflare Workers (edge compute), Cloudflare D1 (banco relacional serverless) e Cloudflare R2 (armazenamento S3-compatível), garantindo modelo pay-as-you-grow de baixíssimo custo e alta disponibilidade.
4. **Fóruns Educacionais e Articulação (`[ARTICULAÇÃO]`):** Parcerias e presença em encontros da UNDIME, Consed e fóruns municipais para difusão de boas práticas e engajamento institucional de dirigentes públicos.

---

### 2. Atividades-Chave (Key Activities) — *O que fazemos*

1. **Engenharia e Manutenção do Software LMS (`[ENGENHARIA]`):** Desenvolvimento e testes contínuos da arquitetura modular, PWA offline-first, banco D1/Postgres, dashboards de gestão e rotinas de segurança e privacidade (LGPD).
2. **Curadoria e Criação de Conteúdo Didático (`[PEDAGÓGICO]`):** Elaboração de planos de aula, sequências didáticas, desafios de programação em blocos e banco de dinâmicas desplugadas homologadas para a BNCC.
3. **Formação Docente e Onboarding Operacional (`[OPERAÇÃO]`):** Realização de oficinas pedagógicas práticas, capacitação contínua de professores, parametrização de turmas e acompanhamento de indicadores de engajamento escolar.

---

### 3. Recursos-Chave (Key Resources) — *O que necessitamos*

1. **Matriz Curricular Autoral da BNCC Computação (`[MATRIZ BNCC]`):** Banco estruturado de trilhas por ano (1º ao 9º ano), habilidades mapeadas dos 3 eixos (Pensamento Computacional, Mundo Digital, Cultura Digital) e rubricas avaliativas formativas.
2. **Stack Tecnológica Moderna e Open Source (`[STACK LEVE]`):** JavaScript moderno, PWA instalável, Cloudflare Edge, D1/Postgres, APIs REST e CSS nativo modular, eliminando custos recorrentes de royalties ou licenças de terceiros.
3. **Equipe Multidisciplinar Especializada (`[CAPITAL HUMANO]`):** Desenvolvedores de software, designers de aprendizagem, supervisão pedagógica e orientação acadêmica do IFMA.

---

### 4. Proposta de Valor (Value Propositions) — *O que entregamos*

1. **Cobertura Curricular Integral da BNCC Computação (`[BNCC 100%]`):** Trilhas progressivas do 1º ao 9º ano estruturadas exatamente nos eixos Pensamento Computacional, Mundo Digital e Cultura Digital, garantindo 100% de conformidade com a Res. CNE/CP nº 1/2022.
2. **Computação Desplugada para Redes sem Infraestrutura (`[SEM INTERNET]`):** Catálogo de atividades práticas e fichas em PDF imprimíveis que ensinam conceitos de lógica e algoritmos sem exigir computadores ou internet em sala de aula.
3. **Conformidade Nativa com Limites de Tela (`[TEMPO DE TELA]`):** Métrica de cálculo e relatórios que equilibram telas digitais com dinâmicas físicas desplugadas, prevenindo a sobrecarga digital (Res. CNE 2/2025).
4. **Planejamento e Avaliação Docente sem Fricção (`[SEM FRICÇÃO]`):** Assistente com alinhamento curricular automático, rubricas formativas e exportação de diários escolares para professores sem formação prévia em TI.
5. **PWA Offline-First, Leve e Acessível (`[OFFLINE-FIRST]`):** Roda com fluidez em celulares básicos e computadores obsoletos, mantém dados offline e atende diretrizes de acessibilidade WCAG 2.1 AA.

---

### 5. Relacionamento com Clientes (Customer Relationships) — *Como interagimos*

1. **Capacitação Prática e Oficinas Pedagógicas (`[FORMAÇÃO]`):** Oficinas imersivas presenciais e online para preparar o corpo docente no uso da plataforma e nas metodologias ativas da BNCC.
2. **Acompanhamento Pedagógico de Proximidade (`[SUPORTE]`):** Atendimento humanizado focado em dúvidas de planejamento pedagógico e adaptação dos planos às realidades locais.
3. **Painéis Executivos e Prestação de Contas (`[GESTÃO SME]`):** Relatórios periódicos com evidências auditáveis de adesão, aprendizagem e cumprimento das metas regulatórias para Secretários Municipais de Educação.

---

### 6. Canais (Channels) — *Como alcançamos*

1. **Relacionamento Institucional B2G e Editais (`[B2G DIRETO]`):** Contato direto com Secretarias Municipais de Educação (SME), encontros da UNDIME e acordos de cooperação técnica via IFMA.
2. **Plataforma Web de Acesso Direto (`[WEB / PWA]`):** Acesso instantâneo via navegador sem exigir download em lojas de aplicativos, facilitando a adesão imediata em qualquer dispositivo.
3. **Materiais Físicos e Fichas em PDF (`[FÍSICO / PDF]`):** Cadernos de atividades e fichas impressas distribuídos diretamente pelas escolas para alunos sem conectividade domiciliar ou escolar.

---

### 7. Segmentos de Clientes (Customer Segments) — *Para quem criamos valor*

1. **Secretarias Municipais de Educação (`[COMPRADOR]`):** Gestores públicos que precisam cumprir a obrigatoriedade da BNCC Computação e da Política Nacional de Educação Digital (PNDI) com prestação de contas transparente e custo viável.
2. **Professores da Educação Básica (`[USUÁRIO-CHAVE]`):** Educadores do Ensino Fundamental I e II com rotinas sobrecarregadas que necessitam de materiais prontos, intuitivos e formação prática sem jargões técnicos.
3. **Estudantes do Ensino Fundamental (`[BENEFICIÁRIO]`):** Crianças e jovens de 6 a 14 anos (1º ao 9º ano) desenvolvendo letramento digital, raciocínio lógico e cidadania digital por meio de trilhas lúdicas.
4. **Coordenadores Pedagógicos Escolares (`[GESTÃO LOCAL]`):** Profissionais escolares que demandam diagnósticos consolidados por turma e escola para identificar defasagens e direcionar intervenções docentes.

---

### 8. Estrutura de Custos (Cost Structure) — *O que gastamos*

1. **Infraestrutura em Nuvem Otimizada (`[NUVEM EDGE]`):** Hospedagem serverless (Cloudflare Workers), instâncias D1 gerenciadas e armazenamento R2 em modelo pay-as-you-grow de baixo custo por requisição.
2. **Equipe Técnica e Pedagógica (`[EQUIPE]`):** Custeio de bolsas de pesquisa/desenvolvimento e dedicação à engenharia de software, UX educacional e curadoria pedagógica continuada.
3. **Serviços Transacionais e Monitoramento (`[OPERAÇÕES]`):** E-mails transacionais de autenticação, monitoramento de qualidade (Sentry) e certificados de segurança.
4. **Logística de Formação e Validação Piloto (`[LOGÍSTICA]`):** Impressão de guias metodológicos, kits pedagógicos físicos e deslocamento para capacitações presenciais nas redes parceiras.

---

### 9. Fontes de Receita (Revenue Streams) — *Como geramos sustentabilidade*

1. **Assinatura de Licenciamento SaaS Municipal (`[SAAS B2G]`):** Contratos anuais ou semestrais com secretarias de educação municipal, precificados por faixa de alunos ativos ou número de escolas vinculadas.
2. **Pacotes de Formação Docente Continuada (`[CAPACITAÇÃO]`):** Comercialização de programas certificados de capacitação em letramento digital e metodologias ativas para as redes municipais.
3. **Setup e Integração Multi-Tenant (`[IMPLANTAÇÃO]`):** Taxa de implantação com parametrização de instâncias dedicadas, personalização de calendário letivo e integração a sistemas acadêmicos locais (ex.: i-Educar).
4. **Editais de Inovação e Fomento à Pesquisa (`[SUBVENÇÃO]`):** Captação de recursos públicos a fundo perdido via agências de fomento (FAPEMA, FINEP, CNPq e editais IFMA de inovação e extensão).

---

## 🛠️ Comandos de Atualização e Geração

Para atualizar ou regerar o PDF e PNG a partir do template:

```bash
npm run gerar:bmc
```

Esse comando executa o script modular [`scripts/gerar-bmc.sh`](file:///home/thiago/lms/scripts/gerar-bmc.sh):

1. Renderização headless do PDF em A4 Paisagem via Chromium (`docs/bmc/lms-compasso-bmc.pdf`).
2. Sincronização automática para a pasta pública (`public/lms-compasso-bmc.pdf`).
3. Conversão para imagem Ultra HD (200 DPI) em PNG (`docs/bmc/img/lms-compasso-bmc.png` e `public/img/lms-compasso-bmc.png`).

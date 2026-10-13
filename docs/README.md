# 📚 Central de Documentação — LMS COMPASSO

Esta pasta reúne todos os guias técnicos, pedagógicos, estratégicos e materiais de divulgação do **LMS COMPASSO**.

---

## 🧭 Guias Pedagógicos e Estratégicos

| Documento | Descrição | Público-Alvo |
| --- | --- | --- |
| **[`docs/bncc-computacao.md`](file:///home/thiago/lms/docs/bncc-computacao.md)** | Diretrizes curriculares dos 3 eixos da BNCC Computação (Resolução CNE/CP nº 1/2022). | Professores e Coordenadores |
| **[`docs/bmc/README.md`](file:///home/thiago/lms/docs/bmc/README.md)** | **Business Model Canvas (BMC)**: 32 cards estratégicos, PDF A4 e PNG de alta resolução. | Gestores, Investidores e Bancas |
| **[`docs/compartilhamento/`](file:///home/thiago/lms/docs/compartilhamento/)** | Modelos para compartilhamento, murais escolares e geração de QR Codes de divulgação. | Escolas e Secretarias |

---

## 💻 Guias Técnicos de Engenharia e Arquitetura

| Documento | Descrição | Público-Alvo |
| --- | --- | --- |
| **[`docs/backend-cloudflare.md`](file:///home/thiago/lms/docs/backend-cloudflare.md)** | Arquitetura serverless no Cloudflare Workers, banco D1 SQLite e Wrangler CLI. | Desenvolvedores Backend |
| **[`docs/frontend-guia.md`](file:///home/thiago/lms/docs/frontend-guia.md)** | Design system nativo, componentes, autenticação JWT e acessibilidade. | Desenvolvedores Frontend |
| **[`docs/api-endpoints.md`](file:///home/thiago/lms/docs/api-endpoints.md)** | Catálogo completo de rotas REST, parâmetros, cabeçalhos e respostas JSON. | Integradores de API |
| **[`docs/faq-troubleshooting.md`](file:///home/thiago/lms/docs/faq-troubleshooting.md)** | Resolução de problemas frequentes (portas, tokens, seeds e migrations). | Todos os Desenvolvedores |

---

## 📁 Estrutura da Pasta `docs/`

```text
docs/
├── bmc/                                # Subpasta dedicada ao Business Model Canvas
│   ├── README.md                       # Matriz dos 32 cards estratégicos do Canvas
│   ├── lms-compasso-bmc.html           # Template interativo A4 Paisagem
│   ├── lms-compasso-bmc.pdf            # PDF oficial para impressão
│   └── img/lms-compasso-bmc.png        # Imagem Ultra HD (200 DPI)
├── compartilhamento/                   # Materiais de divulgação, marcas e QR Codes
│   ├── compartilhamento-qrcode.html    # Folha de compartilhamento com QR Code
│   ├── compartilhar-simplificado.html  # Card quadrado do QR Code
│   ├── logo-compartilhamento.html      # Card institucional 1200x630 para redes e Canva
│   ├── lms-compasso-compartilhamento.pdf
│   └── img/
│       ├── logo.png                    # Logo horizontal transparente Ultra HD
│       ├── logo-branco.png             # Logo versão negativa transparente
│       ├── logo-icone.png              # Ícone quadrado transparente (1024x1024)
│       ├── logo-icone-branco.png       # Ícone branco transparente (1024x1024)
│       ├── logo-compartilhamento.png   # Banner institucional (1200x630)
│       └── lms-compasso-qrcode-simplificado.png
├── api-endpoints.md                    # Catálogo de endpoints da API
├── backend-cloudflare.md               # Guia técnico do backend
├── bncc-computacao.md                  # Matriz pedagógica da BNCC
├── faq-troubleshooting.md              # Perguntas frequentes e troubleshooting
└── frontend-guia.md                    # Guia de desenvolvimento do frontend
```

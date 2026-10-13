#!/usr/bin/env bash
# ==============================================================================
# LMS COMPASSO — Geração do Business Model Canvas (BMC)
# ==============================================================================
# 1. Renderiza o HTML A4 Paisagem para PDF via Chromium Headless
# 2. Converte o PDF para imagem Ultra HD (200 DPI) via pdftoppm
# 3. Sincroniza os arquivos gerados com docs/bmc/ e public/
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🎨 [1/3] Gerando PDF do Business Model Canvas (A4 Paisagem)..."
mkdir -p docs/bmc/img public/img

# Gera PDF executivo a partir do HTML canônico do BMC
chromium --headless --disable-gpu --no-sandbox \
  --print-to-pdf=docs/bmc/lms-compasso-bmc.pdf \
  --print-to-pdf-no-header \
  "file://${ROOT_DIR}/docs/bmc/lms-compasso-bmc.html"

# Sincroniza PDF com a pasta pública
cp docs/bmc/lms-compasso-bmc.pdf public/lms-compasso-bmc.pdf

echo "🖼️  [2/3] Convertendo PDF para imagem PNG de alta resolução (200 DPI)..."
pdftoppm -png -r 200 docs/bmc/lms-compasso-bmc.pdf docs/bmc/img/lms-compasso-bmc-hd

if [ -f docs/bmc/img/lms-compasso-bmc-hd-1.png ]; then
  mv docs/bmc/img/lms-compasso-bmc-hd-1.png docs/bmc/img/lms-compasso-bmc.png
fi

# Sincroniza PNG com a pasta pública
cp docs/bmc/img/lms-compasso-bmc.png public/img/lms-compasso-bmc.png

# Atualiza visualizador público se o HTML canônico foi editado
cp docs/bmc/lms-compasso-bmc.html public/bmc.html

echo "✅ [3/3] Business Model Canvas gerado com sucesso!"
echo "   - PDF: docs/bmc/lms-compasso-bmc.pdf & public/lms-compasso-bmc.pdf"
echo "   - PNG: docs/bmc/img/lms-compasso-bmc.png & public/img/lms-compasso-bmc.png"
echo "   - Web: public/bmc.html"

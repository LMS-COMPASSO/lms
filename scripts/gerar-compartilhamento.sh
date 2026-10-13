#!/usr/bin/env bash
# ==============================================================================
# LMS COMPASSO — Geração de Materiais de Compartilhamento & QR Code
# ==============================================================================
# Suporta:
#   --pdf    Gera folha A4 com QR Code oficial de compartilhamento
#   --png    Gera card quadrado com QR Code simplificado
#   (padrão) Gera ambos
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MODO="${1:-todos}"
mkdir -p docs/compartilhamento/img public/img

gerar_pdf() {
  echo "📄 Gerando PDF oficial de compartilhamento com QR Code..."
  chromium --headless --disable-gpu --no-sandbox \
    --print-to-pdf=docs/compartilhamento/lms-compasso-compartilhamento.pdf \
    --print-to-pdf-no-header \
    "file://${ROOT_DIR}/docs/compartilhamento/compartilhamento-qrcode.html"

  cp docs/compartilhamento/lms-compasso-compartilhamento.pdf public/lms-compasso-compartilhamento.pdf
  cp docs/compartilhamento/compartilhamento-qrcode.html public/compartilhar.html
  echo "✅ PDF de compartilhamento atualizado em docs/compartilhamento/ e public/"
}

gerar_png() {
  echo "🖼️  Gerando imagem simplificada do QR Code (800x800)..."
  chromium --headless --disable-gpu --no-sandbox \
    --window-size=800,800 \
    --screenshot=docs/compartilhamento/img/lms-compasso-qrcode-simplificado.png \
    "file://${ROOT_DIR}/docs/compartilhamento/compartilhar-simplificado.html"

  cp docs/compartilhamento/img/lms-compasso-qrcode-simplificado.png public/img/lms-compasso-qrcode-simplificado.png
  echo "✅ Imagem de QR Code atualizada em docs/compartilhamento/img/ e public/img/"
}

case "$MODO" in
  --pdf)
    gerar_pdf
    ;;
  --png)
    gerar_png
    ;;
  *)
    gerar_pdf
    gerar_png
    ;;
esac

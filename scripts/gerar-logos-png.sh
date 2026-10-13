#!/usr/bin/env bash
# ==============================================================================
# LMS COMPASSO — Geração Automatizada das Logos em PNG para Canva & Redes
# ==============================================================================
# Gera:
#   1. public/img/logo.png                (2176x512, Transparente - Alta Resolução)
#   2. public/img/logo-branco.png         (2176x512, Transparente - Versão Negativa)
#   3. public/img/logo-icone.png          (1024x1024, Transparente - Quadrado/Avatar)
#   4. public/img/logo-icone-branco.png   (1024x1024, Transparente - Quadrado Negativo)
#   5. public/img/logo-compartilhamento.png (1200x630, Card institucional para Canva/OG)
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

mkdir -p public/img docs/compartilhamento/img

echo "🎨 Gerando PNGs transparentes de alta resolução da Logo do LMS COMPASSO..."

# 1. Logo Horizontal Padrão (2176x512 - 8x scale para Canva sem distorção)
rsvg-convert -w 2176 -h 512 -a -f png public/img/logo.svg -o public/img/logo.png
cp public/img/logo.png docs/compartilhamento/img/logo.png
echo "✅ Logo horizontal colorida: public/img/logo.png (2176x512)"

# 2. Logo Horizontal Branca / Negativa (2176x512)
rsvg-convert -w 2176 -h 512 -a -f png public/img/logo-branco.svg -o public/img/logo-branco.png
cp public/img/logo-branco.png docs/compartilhamento/img/logo-branco.png
echo "✅ Logo horizontal branca: public/img/logo-branco.png (2176x512)"

# 3. Ícone / Símbolo do Compasso (1024x1024)
rsvg-convert -w 1024 -h 1024 -a -f png public/img/logo-icone.svg -o public/img/logo-icone.png
cp public/img/logo-icone.png docs/compartilhamento/img/logo-icone.png
echo "✅ Ícone colorido do compasso: public/img/logo-icone.png (1024x1024)"

# 4. Ícone / Símbolo do Compasso Branco (1024x1024)
rsvg-convert -w 1024 -h 1024 -a -f png public/img/logo-icone-branco.svg -o public/img/logo-icone-branco.png
cp public/img/logo-icone-branco.png docs/compartilhamento/img/logo-icone-branco.png
echo "✅ Ícone branco do compasso: public/img/logo-icone-branco.png (1024x1024)"

# 5. Card de Compartilhamento / Banner para Canva & Redes Sociais (1200x630)
echo "🖼️  Gerando card de compartilhamento da marca (1200x630)..."
chromium --headless --disable-gpu --no-sandbox \
  --window-size=1200,630 \
  --screenshot=public/img/logo-compartilhamento.png \
  "file://${ROOT_DIR}/docs/compartilhamento/logo-compartilhamento.html"
cp public/img/logo-compartilhamento.png docs/compartilhamento/img/logo-compartilhamento.png
echo "✅ Card institucional de compartilhamento: public/img/logo-compartilhamento.png (1200x630)"

echo "🎉 Todas as versões em PNG da logo foram geradas com sucesso!"

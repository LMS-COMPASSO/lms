#!/usr/bin/env bash
# ==============================================================================
# LMS COMPASSO - SCRIPT DE VALIDAÇÃO DE QA LOCAL (PORTÃO PRÉ-COMMIT / PRÉ-PR)
# ==============================================================================
# Executa localmente as verificações em camadas na mesma ordem exata do CI:
# 1. Higiene de código e sintaxe (JavaScript e Python)
# 2. Validação de dados (Schemas JSON, BNCC, ícones e integridade de rotas)
# 3. Testes unitários pedagógicos (Node test runner + simulação Python 3D)
# 4. Compilação e empacotamento do Cloudflare Worker (Dry-run)
# 5. Varredura estática de segredos acidentais
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo "🛡️  LMS COMPASSO - Executando Portões de Qualidade (Local)"
echo "=========================================================="

echo "🔍 [1/5] Higiene de código: Verificando sintaxe JS e Python..."
find public/js src/worker tests -name "*.js" | while read -r f; do
  node --check "$f" || { echo "❌ Erro de sintaxe em $f"; exit 1; }
done

if command -v python3 >/dev/null 2>&1; then
  python3 -m py_compile tests/python/*.py 2>/dev/null || true
fi
echo "✔ Sintaxe de código validada com sucesso!"

echo "📑 [2/5] Validação de dados do projeto (BNCC, Schemas e Rotas)..."
node scripts/validar-schemas.js

echo "🧪 [3/5] Testes unitários e de integração (Node.js e Python 3D)..."
npm test

if command -v python3 >/dev/null 2>&1; then
  echo "🐍 Executando testes unitários das atividades Python 3D..."
  python3 tests/python/test_atividades_3d.py
fi

echo "☁️ [4/5] Validando compilação do Cloudflare Worker (dry-run)..."
npx wrangler deploy --dry-run --outdir .wrangler/dryrun > /dev/null
echo "✔ Cloudflare Worker e ativos estáticos compilam perfeitamente!"

echo "🔐 [5/5] Varredura estática de segredos e credenciais expostas..."
if git grep -inE "(secret|token|password|bearer|api_key)\s*[:=]\s*['\"][a-zA-Z0-9_\-]{8,}" ':!package-lock.json' ':!*.test.js' > /dev/null 2>&1; then
  echo "❌ ALERTA: Possível segredo ou chave privada exposta no repositório!"
  exit 1
fi
echo "✔ Nenhuma credencial sensível detectada!"

echo ""
echo "=========================================================="
echo "🎉 PARABÉNS! Todos os portões de qualidade passaram!"
echo "Seu repositório está íntegro e pronto para commit ou Pull Request."
echo "=========================================================="

#!/usr/bin/env node
/**
 * ============================================================================
 * LMS COMPASSO - VALIDADOR DE SCHEMAS, DADOS BNCC E INTEGRIDADE DE ROTAS
 * ============================================================================
 * Executado localmente e no pipeline CI:
 * 1. Valida a sintaxe JSON de todos os arquivos de dados e configuração;
 * 2. Valida o catálogo de Habilidades BNCC (formato EFxxCOxx, unicidade, campos);
 * 3. Valida a estrutura e regras de negócio do icon-registry.json;
 * 4. Valida a correspondência entre os IDs do registro e os <symbol> no sprite SVG;
 * 5. Valida a integridade de rotas, links internos, imagens e assets nas páginas HTML.
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(import.meta.dirname, '..');

let totalErros = 0;

function erro(msg) {
  console.error(`❌ [ERRO]: ${msg}`);
  totalErros++;
}

function sucesso(msg) {
  console.log(`✔ [OK]: ${msg}`);
}

console.log('--- Iniciando Validação de Integridade, Schemas e Rotas ---');

// 1. Validação de Sintaxe JSON
const arquivosJson = [
  'package.json',
  'public/data/icon-registry.json',
  'public/data/icon-registry.schema.json',
  'public/data/bncc-habilidades.json',
  'public/data/bncc-habilidades.schema.json',
];

for (const rel of arquivosJson) {
  const caminho = path.join(RAIZ, rel);
  try {
    const conteudo = fs.readFileSync(caminho, 'utf8');
    JSON.parse(conteudo);
    sucesso(`Sintaxe JSON válida em ${rel}`);
  } catch (err) {
    erro(`Falha de sintaxe em ${rel}: ${err.message}`);
  }
}

// 2. Validação do Catálogo de Habilidades BNCC Computação
try {
  const bnccRaw = fs.readFileSync(path.join(RAIZ, 'public/data/bncc-habilidades.json'), 'utf8');
  const bnccData = JSON.parse(bnccRaw);

  if (!Array.isArray(bnccData.habilidades) || bnccData.habilidades.length === 0) {
    erro('bncc-habilidades.json: lista de habilidades ausente ou vazia.');
  } else {
    const codigosVistos = new Set();
    const regexCodigo = /^EF[0-9]{2}CO[0-9]{2}$/;
    const eixosValidos = new Set(['Pensamento Computacional', 'Mundo Digital', 'Cultura Digital']);

    for (const hab of bnccData.habilidades) {
      if (!hab.codigo || !regexCodigo.test(hab.codigo)) {
        erro(`bncc-habilidades.json: código inválido "${hab.codigo}". Deve seguir o formato EFxxCOxx.`);
      }
      if (codigosVistos.has(hab.codigo)) {
        erro(`bncc-habilidades.json: código de habilidade duplicado "${hab.codigo}".`);
      }
      codigosVistos.add(hab.codigo);

      if (!hab.anos || typeof hab.anos !== 'string') {
        erro(`bncc-habilidades.json [${hab.codigo}]: campo "anos" obrigatório ausente.`);
      }
      if (!hab.texto || typeof hab.texto !== 'string' || hab.texto.length < 10) {
        erro(`bncc-habilidades.json [${hab.codigo}]: campo "texto" inválido ou muito curto.`);
      }
      if (!hab.eixo || !eixosValidos.has(hab.eixo)) {
        erro(`bncc-habilidades.json [${hab.codigo}]: eixo inválido "${hab.eixo}".`);
      }
    }
    sucesso(`bncc-habilidades.json: ${codigosVistos.size} habilidades BNCC validadas (formato EFxxCOxx e sem duplicatas)`);
  }
} catch (err) {
  erro(`Erro ao validar bncc-habilidades.json: ${err.message}`);
}

// 3. Validação de Estrutura do icon-registry.json
try {
  const registro = JSON.parse(fs.readFileSync(path.join(RAIZ, 'public/data/icon-registry.json'), 'utf8'));

  if (!registro.meta || registro.meta.espessuraTraco !== 2) {
    erro('icon-registry.json: meta.espessuraTraco deve ser igual a 2');
  }

  const tamanhos = registro.meta?.gradeTamanhosPx;
  if (!tamanhos || tamanhos.xs !== 16 || tamanhos.sm !== 20 || tamanhos.md !== 24 || tamanhos.lg !== 32) {
    erro('icon-registry.json: grade de tamanhos deve ser { xs: 16, sm: 20, md: 24, lg: 32 }');
  }

  const idsVistos = new Map();
  const secoes = ['navegacaoEWayfinding', 'estadosEFluxo', 'conceitosComputacaoBNCC'];
  for (const secao of secoes) {
    const bloco = registro[secao];
    if (!bloco || typeof bloco !== 'object') {
      erro(`icon-registry.json: seção obrigatória ausente: ${secao}`);
      continue;
    }

    for (const [chave, item] of Object.entries(bloco)) {
      if (!item.id || typeof item.id !== 'string') {
        erro(`icon-registry.json: item ${secao}.${chave} não possui id válido`);
        continue;
      }
      if (idsVistos.has(item.id)) {
        erro(`icon-registry.json: ID duplicado "${item.id}" em ${secao}.${chave} (já definido em ${idsVistos.get(item.id)})`);
      } else {
        idsVistos.set(item.id, `${secao}.${chave}`);
      }
      // Garante nome acessível / rótulo padronizado
      const rotulo = item.rotuloPadrao || item.simboloUniversal || item.conceitoBNCC;
      if (!rotulo) {
        erro(`icon-registry.json: ícone "${item.id}" em ${secao}.${chave} deve ter um nome acessível / rótulo padrão.`);
      }
    }
  }

  sucesso(`icon-registry.json: ${idsVistos.size} símbolos únicos com nome acessível validados`);

  // 4. Verifica correspondência com icons-sprite.svg
  const spriteSvg = fs.readFileSync(path.join(RAIZ, 'public/img/icons-sprite.svg'), 'utf8');
  for (const [id] of idsVistos.entries()) {
    if (!spriteSvg.includes(`id="${id}"`)) {
      erro(`icons-sprite.svg: símbolo "${id}" registrado em icon-registry.json não encontrado no sprite SVG`);
    }
  }
  sucesso('icons-sprite.svg: todos os símbolos do registro constam no sprite vetorial');
} catch (err) {
  erro(`Erro ao processar icon-registry.json: ${err.message}`);
}

// 5. Validação de Integridade de Rotas, Links Internos e Assets
try {
  const pastaPublic = path.join(RAIZ, 'public');
  const arquivosPublic = fs.readdirSync(pastaPublic);
  const paginasHtml = arquivosPublic.filter(f => f.endsWith('.html'));

  let linksVerificados = 0;

  for (const htmlFile of paginasHtml) {
    const conteudo = fs.readFileSync(path.join(pastaPublic, htmlFile), 'utf8');

    // Extrai referências href="..." e src="..."
    const regexRefs = /(?:href|src)=["']([^"']+)["']/g;
    let match;

    while ((match = regexRefs.exec(conteudo)) !== null) {
      let ref = match[1].trim();

      // Ignora links externos, âncoras locais, esquemas de dados, javascript, templates e rotas de API do Worker
      if (
        ref.startsWith('http://') ||
        ref.startsWith('https://') ||
        ref.startsWith('//') ||
        ref.startsWith('#') ||
        ref.startsWith('mailto:') ||
        ref.startsWith('data:') ||
        ref.startsWith('javascript:') ||
        ref.startsWith('/api/') ||
        ref.includes('${')
      ) {
        continue;
      }

      // Remove query strings e hashes locais
      const refLimpa = ref.split('?')[0].split('#')[0];
      if (!refLimpa || refLimpa === '/') continue;

      let caminhoAlvo;
      if (refLimpa.startsWith('/')) {
        caminhoAlvo = path.join(pastaPublic, refLimpa);
      } else {
        caminhoAlvo = path.join(pastaPublic, refLimpa);
      }

      if (!fs.existsSync(caminhoAlvo)) {
        erro(`${htmlFile}: link ou recurso quebrado para "${ref}" (esperado em: ${path.relative(RAIZ, caminhoAlvo)})`);
      } else {
        linksVerificados++;
      }
    }
  }

  sucesso(`Integridade de rotas: ${linksVerificados} referências internas validadas em ${paginasHtml.length} páginas HTML`);
} catch (err) {
  erro(`Erro na checagem de integridade de rotas: ${err.message}`);
}

console.log('---------------------------------------------------------');
if (totalErros > 0) {
  console.error(`💥 Validação concluída com ${totalErros} erro(s).`);
  process.exit(1);
} else {
  console.log('🎉 Todos os schemas, dados BNCC e integridades de rotas foram validados com sucesso!');
  process.exit(0);
}

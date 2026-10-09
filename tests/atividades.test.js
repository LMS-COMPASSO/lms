import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ATIVIDADES,
  CONCEITOS,
  FAIXAS,
  HABILIDADES,
  NIVEIS,
  TIPOS,
  buscarAtividade,
} from '../public/js/atividades/catalogo.js';
import {
  avaliarClassificacao,
  avaliarOrdem,
  calcularEstrelas,
  contarConcluidas,
  embaralhar,
  embaralharDiferente,
  executarPrograma,
  lerMapa,
  menorPrograma,
  plural,
  registrarConclusao,
} from '../public/js/atividades/logica.js';

const porTipo = (tipo) => ATIVIDADES.filter((atividade) => atividade.tipo === tipo);

/* ---------------------------------------------------------------------------
 * Integridade do catálogo
 * ------------------------------------------------------------------------ */

test('o catálogo tem atividades de algoritmos do cotidiano e de decomposição lógica', () => {
  assert.ok(porTipo('ordenar').length >= 3);
  assert.ok(porTipo('decompor').length >= 3);
  assert.ok(porTipo('robo').length >= 3);
  assert.ok(ATIVIDADES.some((atividade) => atividade.conceito === 'algoritmos'));
  assert.ok(ATIVIDADES.some((atividade) => atividade.conceito === 'decomposicao'));
});

test('cada atividade tem identificação, texto pedagógico e orientações para o professor', () => {
  const ids = new Set();

  for (const atividade of ATIVIDADES) {
    assert.match(atividade.id, /^[a-z0-9-]+$/, `id inválido: ${atividade.id}`);
    assert.equal(ids.has(atividade.id), false, `id repetido: ${atividade.id}`);
    ids.add(atividade.id);

    assert.ok(TIPOS[atividade.tipo], `tipo desconhecido em ${atividade.id}`);
    assert.ok(CONCEITOS[atividade.conceito], `conceito desconhecido em ${atividade.id}`);
    assert.ok(FAIXAS[atividade.faixa], `faixa desconhecida em ${atividade.id}`);
    assert.ok(NIVEIS[atividade.nivel], `nível desconhecido em ${atividade.id}`);
    assert.ok(Number.isInteger(atividade.duracaoMin) && atividade.duracaoMin > 0);

    for (const campo of ['titulo', 'resumo', 'instrucao', 'dica', 'conclusao', 'anos', 'emoji']) {
      assert.equal(typeof atividade[campo], 'string', `${atividade.id}: falta ${campo}`);
      assert.ok(atividade[campo].trim().length > 0, `${atividade.id}: ${campo} vazio`);
    }

    assert.ok(atividade.habilidades.length > 0, `${atividade.id}: sem habilidades`);
    for (const codigo of atividade.habilidades) {
      assert.ok(HABILIDADES[codigo], `${atividade.id}: habilidade ${codigo} não está no dicionário`);
    }

    assert.ok(atividade.professor.objetivo.trim().length > 0);
    assert.ok(atividade.professor.desplugada.trim().length > 0, `${atividade.id}: falta a versão desplugada`);
    assert.ok(atividade.professor.conversa.length >= 2);
  }
});

test('as habilidades da BNCC Computação seguem o formato oficial dos códigos e têm texto', () => {
  for (const [codigo, habilidade] of Object.entries(HABILIDADES)) {
    assert.match(codigo, /^EF(\d{2})CO\d{2}$/);
    assert.ok(habilidade.texto.length > 20);
    assert.ok(habilidade.anos.length > 0);
  }
});

test('buscarAtividade encontra pelo id e devolve null quando não existe', () => {
  assert.equal(buscarAtividade('ordenar-escovar-dentes').tipo, 'ordenar');
  assert.equal(buscarAtividade('nao-existe'), null);
});

test('atividades de montar a sequência têm passos consistentes e a ordem de referência está correta', () => {
  for (const atividade of porTipo('ordenar')) {
    const ids = [...atividade.passos, ...(atividade.intrusos || [])].map((passo) => passo.id);
    assert.equal(new Set(ids).size, ids.length, `${atividade.id}: ids de passos repetidos`);
    assert.ok(atividade.passos.length >= 4, `${atividade.id}: poucos passos`);

    const etapas = atividade.passos.map((passo) => passo.etapa);
    assert.ok(etapas.every((etapa) => Number.isInteger(etapa) && etapa >= 1));
    assert.deepEqual(etapas, [...etapas].sort((a, b) => a - b), `${atividade.id}: passos fora da ordem de referência`);
    assert.equal(new Set(etapas).size, Math.max(...etapas), `${atividade.id}: etapas devem ser consecutivas`);

    const resposta = avaliarOrdem(atividade, atividade.passos.map((passo) => passo.id));
    assert.equal(resposta.ok, true, `${atividade.id}: a ordem de referência não é aceita`);
  }
});

test('atividades de dividir o problema têm partes e tarefas consistentes', () => {
  for (const atividade of porTipo('decompor')) {
    const idsPartes = atividade.partes.map((parte) => parte.id);
    const idsTarefas = atividade.tarefas.map((tarefa) => tarefa.id);
    assert.equal(new Set(idsPartes).size, idsPartes.length);
    assert.equal(new Set(idsTarefas).size, idsTarefas.length, `${atividade.id}: ids de tarefas repetidos`);
    assert.ok(atividade.partes.length >= 2);
    assert.ok(atividade.problema.trim().length > 0);

    for (const tarefa of atividade.tarefas) {
      assert.ok(
        idsPartes.includes(tarefa.parte) || tarefa.parte === 'fora',
        `${atividade.id}: tarefa ${tarefa.id} aponta para uma parte inexistente`,
      );
    }
    for (const parte of atividade.partes) {
      const total = atividade.tarefas.filter((tarefa) => tarefa.parte === parte.id).length;
      assert.ok(total >= 2, `${atividade.id}: a parte ${parte.id} precisa de pelo menos 2 tarefas`);
    }
    if (atividade.tarefas.some((tarefa) => tarefa.parte === 'fora')) {
      assert.ok(atividade.descarteTitulo, `${atividade.id}: falta o título da coluna de descarte`);
    }

    const gabarito = Object.fromEntries(atividade.tarefas.map((tarefa) => [tarefa.id, tarefa.parte]));
    assert.equal(avaliarClassificacao(atividade, gabarito).ok, true);
  }
});

test('todo mapa de robô tem solução, dentro do limite de comandos, e a solução executa com sucesso', () => {
  for (const atividade of porTipo('robo')) {
    const mapa = lerMapa(atividade.grade);
    const solucao = menorPrograma(mapa);

    assert.ok(solucao, `${atividade.id}: o mapa não tem solução`);
    assert.ok(solucao.length >= 4, `${atividade.id}: o mapa é fácil demais`);
    assert.ok(solucao.length <= atividade.limite, `${atividade.id}: o limite de comandos é menor que a solução`);
    assert.equal(executarPrograma(mapa, solucao).resultado, 'sucesso');

    if (mapa.itens.length > 0) {
      assert.ok(atividade.tema.item, `${atividade.id}: falta o emoji do item`);
      assert.ok(atividade.tema.faltouItem, `${atividade.id}: falta a mensagem para quando o item é esquecido`);
    }
  }
});

/* ---------------------------------------------------------------------------
 * Embaralhar
 * ------------------------------------------------------------------------ */

test('embaralhar mantém os mesmos elementos e não altera a lista original', () => {
  const original = [1, 2, 3, 4, 5];
  const resultado = embaralhar(original, () => 0.3);

  assert.deepEqual([...resultado].sort(), original);
  assert.deepEqual(original, [1, 2, 3, 4, 5]);
});

test('embaralharDiferente nunca devolve a ordem original quando há mais de um elemento', () => {
  const original = ['a', 'b', 'c', 'd'];
  // Um sorteio que sempre devolve zero reproduziria a ordem original em algumas versões do algoritmo.
  assert.notDeepEqual(embaralharDiferente(original, () => 0.999999), original);
  assert.notDeepEqual(embaralharDiferente(original, () => 0), original);
  assert.deepEqual(embaralharDiferente(['x']), ['x']);
});

/* ---------------------------------------------------------------------------
 * Montar a sequência
 * ------------------------------------------------------------------------ */

test('avaliarOrdem aceita passos de ordem livre em qualquer ordem', () => {
  const sanduiche = buscarAtividade('ordenar-sanduiche');
  const queijoAntes = ['lavar', 'pao', 'queijo', 'manteiga', 'fechar', 'servir'];
  const manteigaAntes = ['lavar', 'pao', 'manteiga', 'queijo', 'fechar', 'servir'];

  assert.equal(avaliarOrdem(sanduiche, queijoAntes).ok, true);
  assert.equal(avaliarOrdem(sanduiche, manteigaAntes).ok, true);
});

test('avaliarOrdem aponta os passos fora do lugar', () => {
  const dentes = buscarAtividade('ordenar-escovar-dentes');
  const resposta = avaliarOrdem(dentes, ['pegar', 'escovar', 'pasta', 'enxaguar', 'guardar']);

  assert.equal(resposta.ok, false);
  assert.deepEqual(resposta.foraDoLugar.sort(), ['escovar', 'pasta']);
  assert.deepEqual(resposta.faltando, []);
});

test('avaliarOrdem aponta passos que faltam e passos que não pertencem ao algoritmo', () => {
  const dentes = buscarAtividade('ordenar-escovar-dentes');
  const resposta = avaliarOrdem(dentes, ['pegar', 'pasta', 'sapatos', 'escovar']);

  assert.equal(resposta.ok, false);
  assert.deepEqual(resposta.intrusos, ['sapatos']);
  assert.deepEqual(resposta.faltando, ['enxaguar', 'guardar']);
  assert.deepEqual(resposta.foraDoLugar, []);
});

/* ---------------------------------------------------------------------------
 * Dividir o problema
 * ------------------------------------------------------------------------ */

test('avaliarClassificacao diferencia tarefas certas, erradas e ainda não classificadas', () => {
  const cafe = buscarAtividade('decompor-cafe-da-manha');
  const resposta = avaliarClassificacao(cafe, {
    aquecer: 'cafe',
    coar: 'sanduiche',
    manteiga: 'sanduiche',
  });

  assert.equal(resposta.ok, false);
  assert.deepEqual(resposta.corretas, ['aquecer', 'manteiga']);
  assert.deepEqual(resposta.erradas, ['coar']);
  assert.deepEqual(resposta.naoClassificadas, ['servir', 'recheio', 'fechar']);
  assert.equal(resposta.total, 6);
});

test('avaliarClassificacao exige que a tarefa intrusa seja colocada na coluna de descarte', () => {
  const festa = buscarAtividade('decompor-festa-aniversario');
  const gabarito = Object.fromEntries(festa.tarefas.map((tarefa) => [tarefa.id, tarefa.parte]));

  assert.equal(avaliarClassificacao(festa, gabarito).ok, true);
  assert.deepEqual(avaliarClassificacao(festa, { ...gabarito, licao: 'comida' }).erradas, ['licao']);
});

/* ---------------------------------------------------------------------------
 * Robô
 * ------------------------------------------------------------------------ */

test('lerMapa rejeita mapas malformados', () => {
  assert.throws(() => lerMapa(['R..', '..']), /tamanho diferente/);
  assert.throws(() => lerMapa(['R?M']), /Símbolo desconhecido/);
  assert.throws(() => lerMapa(['...', '..M']), /robô \(R\) e um destino \(M\)/);
});

test('executarPrograma leva o robô até o destino', () => {
  const mapa = lerMapa(buscarAtividade('robo-caminho-escola').grade);
  const execucao = executarPrograma(mapa, ['direita', 'direita', 'direita', 'baixo', 'baixo', 'baixo']);

  assert.equal(execucao.resultado, 'sucesso');
  assert.deepEqual(execucao.trilha.at(-1), { x: 3, y: 3, indice: 5, evento: 'mover' });
  assert.equal(execucao.trilha.length, 7);
});

test('executarPrograma para no comando que bate em um obstáculo e informa qual foi', () => {
  const mapa = lerMapa(buscarAtividade('robo-caminho-escola').grade);
  const execucao = executarPrograma(mapa, ['direita', 'baixo', 'baixo']);

  assert.equal(execucao.resultado, 'bateu-obstaculo');
  assert.equal(execucao.passoComErro, 1);
  assert.deepEqual(execucao.trilha.at(-1), { x: 1, y: 0, indice: 1, evento: 'obstaculo' });
});

test('executarPrograma avisa quando o robô tenta sair do mapa', () => {
  const mapa = lerMapa(buscarAtividade('robo-caminho-escola').grade);
  const execucao = executarPrograma(mapa, ['cima']);

  assert.equal(execucao.resultado, 'bateu-borda');
  assert.equal(execucao.passoComErro, 0);
});

test('executarPrograma distingue programa incompleto de chegar sem coletar o item', () => {
  const mapa = lerMapa(buscarAtividade('robo-padaria').grade);

  assert.equal(executarPrograma(mapa, ['direita']).resultado, 'incompleto');
  assert.equal(executarPrograma(mapa, ['direita', 'direita', 'direita', 'direita']).resultado, 'faltou-item');
  assert.deepEqual(
    executarPrograma(mapa, ['direita', 'direita', 'cima', 'cima', 'baixo', 'baixo', 'direita', 'direita']).resultado,
    'sucesso',
  );
});

test('menorPrograma conhece o tamanho da melhor solução de cada nível', () => {
  const tamanhos = Object.fromEntries(
    porTipo('robo').map((atividade) => [atividade.id, menorPrograma(lerMapa(atividade.grade)).length]),
  );

  assert.deepEqual(tamanhos, {
    'robo-caminho-escola': 6,
    'robo-desviando-pocas': 7,
    'robo-padaria': 8,
    'robo-horta': 13,
  });
});

test('menorPrograma devolve null quando o destino é inalcançável', () => {
  assert.equal(menorPrograma(lerMapa(['R#M'])), null);
});

test('calcularEstrelas premia o programa mais curto', () => {
  assert.equal(calcularEstrelas(6, 6), 3);
  assert.equal(calcularEstrelas(8, 6), 2);
  assert.equal(calcularEstrelas(9, 6), 1);
});

/* ---------------------------------------------------------------------------
 * Progresso e utilidades
 * ------------------------------------------------------------------------ */

test('registrarConclusao guarda a melhor pontuação sem alterar o progresso anterior', () => {
  const agora = new Date('2026-10-07T12:00:00Z');
  const inicial = {};
  const primeiro = registrarConclusao(inicial, 'robo-horta', { tentativas: 3, estrelas: 2 }, agora);
  const segundo = registrarConclusao(primeiro, 'robo-horta', { tentativas: 1, estrelas: 1 }, agora);

  assert.deepEqual(inicial, {});
  assert.equal(primeiro['robo-horta'].estrelas, 2);
  assert.equal(segundo['robo-horta'].estrelas, 2);
  assert.equal(segundo['robo-horta'].atualizadoEm, '2026-10-07T12:00:00.000Z');
});

test('contarConcluidas considera apenas as atividades do catálogo marcadas como concluídas', () => {
  const progresso = {
    'ordenar-escovar-dentes': { concluida: true },
    'robo-horta': { concluida: false },
    'atividade-removida': { concluida: true },
  };

  assert.equal(contarConcluidas(progresso, ATIVIDADES), 1);
});

test('plural usa singular apenas para a quantidade 1', () => {
  assert.equal(plural(1, 'passo', 'passos'), '1 passo');
  assert.equal(plural(0, 'passo', 'passos'), '0 passos');
  assert.equal(plural(3, 'passo', 'passos'), '3 passos');
});

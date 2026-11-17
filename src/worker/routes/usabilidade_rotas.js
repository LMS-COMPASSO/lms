/**
 * ============================================================================
 * LMS COMPASSO - ROTAS DE AVALIAÇÃO DE USABILIDADE (SUS - BROOKE 1996)
 * ============================================================================
 * Coleta e análise de dados de usabilidade da turma piloto do IFMA Campus Grajaú:
 * - Submeter formulário SUS com as 10 perguntas psicométricas padronizadas;
 * - Listar e agregar notas SUS médias, desvio padrão, percentual de conclusão
 *   e tempo médio de tarefas.
 * ============================================================================
 */

import {
  jsonResponse,
  readJsonBody,
  queryAll,
  queryOne,
  obterPayloadOpcional,
} from '../helpers_utilitarios.js';

/**
 * Garante a criação defensiva da tabela avaliacoes_usabilidade_sus caso o ambiente D1 local
 * ainda não tenha executado o schema completo.
 */
export async function garantirTabelaUsabilidadeSus(db) {
  if (!db || typeof db.prepare !== 'function') return;
  try {
    const existe = await queryOne(
      db,
      "SELECT name FROM sqlite_master WHERE type='table' AND name='avaliacoes_usabilidade_sus'",
    );
    if (!existe) {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS avaliacoes_usabilidade_sus (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER,
          nome_participante TEXT,
          participante_tipo TEXT NOT NULL CHECK(participante_tipo IN ('aluno', 'professor', 'observador')) DEFAULT 'aluno',
          escola_turma TEXT NOT NULL DEFAULT 'IFMA Campus Grajaú - 5º/6º ano',
          q1_frequencia INTEGER NOT NULL CHECK(q1_frequencia BETWEEN 1 AND 5),
          q2_complexidade INTEGER NOT NULL CHECK(q2_complexidade BETWEEN 1 AND 5),
          q3_facilidade_uso INTEGER NOT NULL CHECK(q3_facilidade_uso BETWEEN 1 AND 5),
          q4_necessidade_suporte INTEGER NOT NULL CHECK(q4_necessidade_suporte BETWEEN 1 AND 5),
          q5_integracao_funcoes INTEGER NOT NULL CHECK(q5_integracao_funcoes BETWEEN 1 AND 5),
          q6_inconsistencia INTEGER NOT NULL CHECK(q6_inconsistencia BETWEEN 1 AND 5),
          q7_aprendizado_rapido INTEGER NOT NULL CHECK(q7_aprendizado_rapido BETWEEN 1 AND 5),
          q8_sistema_pesado INTEGER NOT NULL CHECK(q8_sistema_pesado BETWEEN 1 AND 5),
          q9_confianca INTEGER NOT NULL CHECK(q9_confianca BETWEEN 1 AND 5),
          q10_esforco_previo INTEGER NOT NULL CHECK(q10_esforco_previo BETWEEN 1 AND 5),
          sus_score REAL NOT NULL,
          tempo_segundos INTEGER DEFAULT 0,
          tarefas_concluidas INTEGER DEFAULT 4,
          comentarios TEXT,
          criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
        )
      `).run();

      await db.prepare('CREATE INDEX IF NOT EXISTS idx_sus_tipo ON avaliacoes_usabilidade_sus(participante_tipo)').run();
      await db.prepare('CREATE INDEX IF NOT EXISTS idx_sus_criado_em ON avaliacoes_usabilidade_sus(criado_em)').run();
    }
  } catch {
    // Ignora caso mocks restritos não suportem sqlite_master
  }
}

function normalizarNotaLikert(valor) {
  const num = Number(valor);
  if (!Number.isFinite(num)) return 3;
  return Math.min(5, Math.max(1, Math.round(num)));
}

/**
 * Calcula o escore SUS segundo o método de John Brooke (1996).
 * Perguntas Ímpares (1, 3, 5, 7, 9): contribuição = resposta - 1
 * Perguntas Pares (2, 4, 6, 8, 10): contribuição = 5 - resposta
 * Pontuação total = soma das contribuições * 2.5 (escala de 0 a 100)
 */
export function calcularEscoreSus(respostas) {
  let soma = 0;
  // Q1
  soma += (Number(respostas.q1) || 3) - 1;
  // Q2
  soma += 5 - (Number(respostas.q2) || 3);
  // Q3
  soma += (Number(respostas.q3) || 3) - 1;
  // Q4
  soma += 5 - (Number(respostas.q4) || 3);
  // Q5
  soma += (Number(respostas.q5) || 3) - 1;
  // Q6
  soma += 5 - (Number(respostas.q6) || 3);
  // Q7
  soma += (Number(respostas.q7) || 3) - 1;
  // Q8
  soma += 5 - (Number(respostas.q8) || 3);
  // Q9
  soma += (Number(respostas.q9) || 3) - 1;
  // Q10
  soma += 5 - (Number(respostas.q10) || 3);

  return Math.min(100, Math.max(0, Math.round(soma * 2.5 * 10) / 10));
}

/**
 * Submete uma avaliação SUS de um participante (aluno ou professor).
 */
export async function submeterAvaliacaoSus(request, env, db) {
  await garantirTabelaUsabilidadeSus(db);
  const authOpcional = await obterPayloadOpcional(request, env, db);
  const body = await readJsonBody(request);

  const nome = String(body.nome || 'Participante Anônimo').trim().slice(0, 120);
  const tipo = ['aluno', 'professor', 'observador'].includes(body.tipo) ? body.tipo : 'aluno';
  const turma = String(body.turma || 'IFMA Campus Grajaú - 5º/6º ano').trim().slice(0, 120);
  const tempoBruto = Number(body.tempoSegundos);
  const tempoSegundos = Number.isFinite(tempoBruto) ? Math.max(0, Math.trunc(tempoBruto)) : 0;
  const tarefasBruto = body.tarefasConcluidas;
  let tarefasConcluidas = 4;
  if (tarefasBruto !== undefined && tarefasBruto !== null && tarefasBruto !== '') {
    const parsedTarefas = Number(tarefasBruto);
    tarefasConcluidas = Number.isFinite(parsedTarefas) ? Math.min(4, Math.max(0, Math.trunc(parsedTarefas))) : 4;
  }
  const comentarios = body.comentarios ? String(body.comentarios).trim().slice(0, 1000) : null;

  const q1 = normalizarNotaLikert(body.q1);
  const q2 = normalizarNotaLikert(body.q2);
  const q3 = normalizarNotaLikert(body.q3);
  const q4 = normalizarNotaLikert(body.q4);
  const q5 = normalizarNotaLikert(body.q5);
  const q6 = normalizarNotaLikert(body.q6);
  const q7 = normalizarNotaLikert(body.q7);
  const q8 = normalizarNotaLikert(body.q8);
  const q9 = normalizarNotaLikert(body.q9);
  const q10 = normalizarNotaLikert(body.q10);

  const susScore = calcularEscoreSus({ q1, q2, q3, q4, q5, q6, q7, q8, q9, q10 });
  const usuarioId = authOpcional?.user?.id || null;

  const resultado = await db.prepare(`
    INSERT INTO avaliacoes_usabilidade_sus (
      usuario_id, nome_participante, participante_tipo, escola_turma,
      q1_frequencia, q2_complexidade, q3_facilidade_uso, q4_necessidade_suporte, q5_integracao_funcoes,
      q6_inconsistencia, q7_aprendizado_rapido, q8_sistema_pesado, q9_confianca, q10_esforco_previo,
      sus_score, tempo_segundos, tarefas_concluidas, comentarios
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    usuarioId, nome, tipo, turma,
    q1, q2, q3, q4, q5,
    q6, q7, q8, q9, q10,
    susScore, tempoSegundos, tarefasConcluidas, comentarios,
  ).run();

  let classificacaoIndividual = 'Marginal';
  if (susScore >= 85) classificacaoIndividual = 'Excelente (Grau A+)';
  else if (susScore >= 70) classificacaoIndividual = 'Bom (Grau B)';

  return jsonResponse({
    sucesso: true,
    id: resultado.meta.last_row_id,
    susScore,
    classificacao: classificacaoIndividual,
    mensagem: 'Avaliação de usabilidade registrada com sucesso!',
  }, 201);
}

/**
 * Retorna o relatório consolidado com médias SUS.
 * Dados nominais/comentários (PII) são expostos apenas a instrutores e administradores autenticados;
 * consultas públicas recebem métricas agregadas e identificadores anonimizados.
 */
export async function obterRelatorioUsabilidadeSus(request, env, db) {
  await garantirTabelaUsabilidadeSus(db);
  const authOpcional = await obterPayloadOpcional(request, env, db);
  const podeVerPii = Boolean(
    authOpcional?.payload && ['administrador', 'instrutor'].includes(authOpcional.payload.perfil),
  );

  const lista = await queryAll(db, `
    SELECT id, nome_participante, participante_tipo, escola_turma, sus_score, tempo_segundos, tarefas_concluidas, comentarios, criado_em
    FROM avaliacoes_usabilidade_sus
    ORDER BY criado_em DESC
  `);

  if (!lista || lista.length === 0) {
    return jsonResponse({
      totalParticipantes: 0,
      mediaSusGeral: 0,
      mediaAlunos: 0,
      mediaProfessores: 0,
      classificacaoGeral: 'Sem dados',
      avaliacoes: [],
    });
  }

  const alunos = lista.filter((item) => item.participante_tipo === 'aluno');
  const professores = lista.filter((item) => item.participante_tipo === 'professor');

  const calcularMedia = (itens) => (itens.length ? Math.round((itens.reduce((acc, cur) => acc + cur.sus_score, 0) / itens.length) * 10) / 10 : 0);
  const mediaGeral = calcularMedia(lista);
  const mediaAlunos = calcularMedia(alunos);
  const mediaProfessores = calcularMedia(professores);

  const avaliacoesPublicas = podeVerPii
    ? lista
    : lista.map((item) => ({
      id: item.id,
      nome_participante: `Participante #${item.id}`,
      participante_tipo: item.participante_tipo,
      escola_turma: 'Turma Piloto',
      sus_score: item.sus_score,
      tempo_segundos: item.tempo_segundos,
      tarefas_concluidas: item.tarefas_concluidas,
      comentarios: null,
      criado_em: item.criado_em,
    }));

  let classificacaoGeral = 'Requer Ajustes';
  if (mediaGeral >= 85) classificacaoGeral = 'Melhor Imaginável / Excelente (A+)';
  else if (mediaGeral >= 70) classificacaoGeral = 'Aceitável / Bom (B)';

  return jsonResponse({
    totalParticipantes: lista.length,
    totalAlunos: alunos.length,
    totalProfessores: professores.length,
    mediaSusGeral: mediaGeral,
    mediaAlunos,
    mediaProfessores,
    classificacaoGeral,
    avaliacoes: avaliacoesPublicas,
  });
}


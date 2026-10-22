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

import { jsonResponse, jsonErro, readJsonBody, queryAll, queryOne } from '../helpers_utilitarios.js';

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
  const body = await readJsonBody(request);

  const nome = String(body.nome || 'Participante Anônimo').trim();
  const tipo = ['aluno', 'professor', 'observador'].includes(body.tipo) ? body.tipo : 'aluno';
  const turma = String(body.turma || 'IFMA Campus Grajaú - 5º/6º ano').trim();
  const tempoSegundos = Number(body.tempoSegundos) || 0;
  const tarefasConcluidas = Number(body.tarefasConcluidas) || 4;
  const comentarios = body.comentarios ? String(body.comentarios).trim() : null;

  const q1 = Math.min(5, Math.max(1, Number(body.q1) || 3));
  const q2 = Math.min(5, Math.max(1, Number(body.q2) || 3));
  const q3 = Math.min(5, Math.max(1, Number(body.q3) || 3));
  const q4 = Math.min(5, Math.max(1, Number(body.q4) || 3));
  const q5 = Math.min(5, Math.max(1, Number(body.q5) || 3));
  const q6 = Math.min(5, Math.max(1, Number(body.q6) || 3));
  const q7 = Math.min(5, Math.max(1, Number(body.q7) || 3));
  const q8 = Math.min(5, Math.max(1, Number(body.q8) || 3));
  const q9 = Math.min(5, Math.max(1, Number(body.q9) || 3));
  const q10 = Math.min(5, Math.max(1, Number(body.q10) || 3));

  const susScore = calcularEscoreSus({ q1, q2, q3, q4, q5, q6, q7, q8, q9, q10 });

  const resultado = await db.prepare(`
    INSERT INTO avaliacoes_usabilidade_sus (
      nome_participante, participante_tipo, escola_turma,
      q1_frequencia, q2_complexidade, q3_facilidade_uso, q4_necessidade_suporte, q5_integracao_funcoes,
      q6_inconsistencia, q7_aprendizado_rapido, q8_sistema_pesado, q9_confianca, q10_esforco_previo,
      sus_score, tempo_segundos, tarefas_concluidas, comentarios
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    nome, tipo, turma,
    q1, q2, q3, q4, q5,
    q6, q7, q8, q9, q10,
    susScore, tempoSegundos, tarefasConcluidas, comentarios,
  ).run();

  return jsonResponse({
    sucesso: true,
    id: resultado.meta.last_row_id,
    susScore,
    classificacao: susScore >= 85 ? 'Excelente (Grau A+)' : susScore >= 70 ? 'Bom (Grau B)' : 'Marginal',
    mensagem: 'Avaliação de usabilidade registrada com sucesso!',
  }, 201);
}

/**
 * Retorna o relatório consolidado com médias SUS e listagem dos participantes.
 */
export async function obterRelatorioUsabilidadeSus(request, env, db) {
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

  const calcularMedia = (itens) => itens.length ? Math.round((itens.reduce((acc, cur) => acc + cur.sus_score, 0) / itens.length) * 10) / 10 : 0;
  const mediaGeral = calcularMedia(lista);
  const mediaAlunos = calcularMedia(alunos);
  const mediaProfessores = calcularMedia(professores);

  return jsonResponse({
    totalParticipantes: lista.length,
    totalAlunos: alunos.length,
    totalProfessores: professores.length,
    mediaSusGeral: mediaGeral,
    mediaAlunos,
    mediaProfessores,
    classificacaoGeral: mediaGeral >= 85 ? 'Melhor Imaginável / Excelente (A+)' : mediaGeral >= 70 ? 'Aceitável / Bom (B)' : 'Requer Ajustes',
    avaliacoes: lista,
  });
}


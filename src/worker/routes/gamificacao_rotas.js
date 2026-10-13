/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - ROTAS DE GAMIFICAÇÃO E MEDALHAS (GAMIFICATION)
 * ============================================================================
 * Gerencia a concessão de selos e medalhas digitais para os estudantes ao
 * completarem trilhas, cursos e atividades dos eixos da BNCC Computação:
 * - Pensamento Computacional
 * - Mundo Digital
 * - Cultura Digital
 * ============================================================================
 */

import {
  jsonResponse,
  jsonErro,
  readJsonBody,
  queryAll,
  queryOne,
  authorizeUser,
} from '../helpers_utilitarios.js';

/**
 * Lista todas as medalhas do catálogo indicando quais o usuário logado já conquistou.
 * Permite filtrar por eixo da BNCC (?eixo_bncc=...).
 */
export async function listarMedalhas(request, env, db, url) {
  const { payload } = await authorizeUser(request, env, db);
  const usuarioId = payload.id;
  const eixoFiltro = url ? url.searchParams.get('eixo_bncc') : null;

  let sql = `
    SELECT m.id, m.codigo, m.titulo, m.descricao, m.eixo_bncc, m.icone, m.cor,
      m.criterio_tipo, m.criterio_meta,
      CASE WHEN um.id IS NOT NULL THEN 1 ELSE 0 END AS conquistada,
      um.conquistada_em
    FROM medalhas m
    LEFT JOIN usuario_medalhas um ON um.medalha_id = m.id AND um.usuario_id = ?
  `;
  const params = [usuarioId];

  if (eixoFiltro) {
    sql += ' WHERE m.eixo_bncc = ?';
    params.push(eixoFiltro);
  }

  sql += ' ORDER BY m.eixo_bncc ASC, m.id ASC';

  const medalhas = await queryAll(db, sql, params);

  // Calcula estatísticas gerais de gamificação
  const totalMedalhas = medalhas.length;
  const totalConquistadas = medalhas.filter((m) => m.conquistada === 1).length;

  const porEixo = {};
  for (const m of medalhas) {
    if (!porEixo[m.eixo_bncc]) {
      porEixo[m.eixo_bncc] = { total: 0, conquistadas: 0 };
    }
    porEixo[m.eixo_bncc].total += 1;
    if (m.conquistada === 1) {
      porEixo[m.eixo_bncc].conquistadas += 1;
    }
  }

  return jsonResponse({
    resumo: {
      total: totalMedalhas,
      conquistadas: totalConquistadas,
      percentualConclusao: totalMedalhas > 0 ? Math.round((totalConquistadas / totalMedalhas) * 100) : 0,
      porEixo,
    },
    medalhas,
  });
}

/**
 * Avalia o progresso do aluno e concede automaticamente medalhas correspondentes.
 */
export async function avaliarConquistasAutomaticas(request, env, db) {
  const { payload } = await authorizeUser(request, env, db);
  const usuarioId = payload.id;

  // 1. Matrículas com 100% de progresso ou concluídas
  const matriculasConcluidas = await queryAll(db, `
    SELECT m.*, c.eixo_bncc
    FROM matriculas m
    JOIN cursos c ON c.id = m.curso_id
    WHERE m.usuario_id = ? AND (m.status = 'concluida' OR m.progresso_percentual >= 100)
  `, [usuarioId]);

  // 2. Total de aulas concluídas
  const totalAulas = await queryOne(db, `
    SELECT COUNT(*) AS total
    FROM progresso_aulas pa
    JOIN matriculas m ON m.id = pa.matricula_id
    WHERE m.usuario_id = ? AND pa.concluida = 1
  `, [usuarioId]);

  // 3. Certificados emitidos
  const totalCertificados = await queryOne(db, `
    SELECT COUNT(*) AS total
    FROM certificados cert
    JOIN matriculas m ON m.id = cert.matricula_id
    WHERE m.usuario_id = ?
  `, [usuarioId]);

  // 4. Desempenho de habilidades registradas
  const habilidades = await queryAll(db, `
    SELECT habilidade_codigo, origem_tipo
    FROM desempenho_habilidades
    WHERE usuario_id = ?
  `, [usuarioId]);

  const medalhasConceder = [];

  // Primeiro passo: fez pelo menos uma aula ou atividade
  if (Number(totalAulas?.total || 0) >= 1 || habilidades.length >= 1) {
    medalhasConceder.push('primeiro_passo');
  }

  // Certificado conquistado
  if (Number(totalCertificados?.total || 0) >= 1) {
    medalhasConceder.push('trilha_completa');
  }

  // Habilidades de algoritmos / blocos
  if (habilidades.some((h) => ['EF01CO02', 'EF01CO03'].includes(h.habilidade_codigo))) {
    medalhasConceder.push('mestre_algoritmos');
  }
  if (habilidades.some((h) => ['EF03CO03', 'EF15CO04'].includes(h.habilidade_codigo))) {
    medalhasConceder.push('arquiteto_decomposicao');
  }
  if (habilidades.some((h) => ['EF69CO03', 'EF69CO04'].includes(h.habilidade_codigo))) {
    medalhasConceder.push('programador_blocos');
  }

  // Eixos concluídos
  for (const m of matriculasConcluidas) {
    if (m.eixo_bncc === 'Mundo Digital') {
      medalhasConceder.push('detetive_hardware_software');
    }
    if (m.eixo_bncc === 'Cultura Digital') {
      medalhasConceder.push('guardiao_privacidade');
    }
  }

  // Insere as medalhas no banco
  let novasConquistadas = 0;
  for (const cod of medalhasConceder) {
    const medalha = await queryOne(db, 'SELECT id FROM medalhas WHERE codigo = ?', [cod]);
    if (medalha) {
      try {
        await db.prepare('INSERT OR IGNORE INTO usuario_medalhas (usuario_id, medalha_id) VALUES (?, ?)')
          .bind(usuarioId, medalha.id)
          .run();
        novasConquistadas += 1;
      } catch {
        // Ignora duplicidade
      }
    }
  }

  return jsonResponse({
    sucesso: true,
    novasConquistadas,
  });
}

/**
 * Registra a conclusão de uma atividade dinâmica e computa o desempenho de habilidade BNCC.
 */
export async function registrarAtividadeConcluida(request, env, db) {
  const { payload } = await authorizeUser(request, env, db);
  const usuarioId = payload.id;
  const body = await readJsonBody(request);

  const atividadeId = String(body.atividadeId || '').trim();
  const habilidades = Array.isArray(body.habilidades) ? body.habilidades : [];
  const pontuacao = Number(body.pontuacao ?? 10.0);
  const cursoId = body.cursoId ? Number(body.cursoId) : null;

  if (!atividadeId) {
    return jsonErro('Identificador da atividade é obrigatório.', 400);
  }

  const nivelAtingido = pontuacao >= 8.5 ? 'avancado' : (pontuacao >= 6.0 ? 'adequado' : 'em_desenvolvimento');

  // Grava o registro para cada habilidade desenvolvida na atividade
  for (const cod of habilidades) {
    await db.prepare(`
      INSERT INTO desempenho_habilidades (usuario_id, curso_id, habilidade_codigo, origem_tipo, origem_id, pontuacao, nivel_atingido)
      VALUES (?, ?, ?, 'atividade', ?, ?, ?)
    `).bind(usuarioId, cursoId, cod, atividadeId, pontuacao, nivelAtingido).run();
  }

  // Avalia medalhas em decorrência da atividade
  const medalhasNovas = [];
  if (atividadeId.startsWith('ordenar-')) {
    const m = await queryOne(db, 'SELECT id FROM medalhas WHERE codigo = ?', ['mestre_algoritmos']);
    if (m) medalhasNovas.push(m.id);
  } else if (atividadeId.startsWith('decompor-')) {
    const m = await queryOne(db, 'SELECT id FROM medalhas WHERE codigo = ?', ['arquiteto_decomposicao']);
    if (m) medalhasNovas.push(m.id);
  } else if (atividadeId.startsWith('blocos-')) {
    const m = await queryOne(db, 'SELECT id FROM medalhas WHERE codigo = ?', ['programador_blocos']);
    if (m) medalhasNovas.push(m.id);
  }

  const mPrimeiro = await queryOne(db, 'SELECT id FROM medalhas WHERE codigo = ?', ['primeiro_passo']);
  if (mPrimeiro) medalhasNovas.push(mPrimeiro.id);

  for (const mid of medalhasNovas) {
    try {
      await db.prepare('INSERT OR IGNORE INTO usuario_medalhas (usuario_id, medalha_id) VALUES (?, ?)')
        .bind(usuarioId, mid)
        .run();
    } catch {
      // Ignora erro
    }
  }

  return jsonResponse({
    sucesso: true,
    habilidadesRegistradas: habilidades.length,
    nivelAtingido,
  });
}

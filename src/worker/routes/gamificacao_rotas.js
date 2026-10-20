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
 * Garante que as tabelas de gamificação existam no D1 SQLite, semeando as medalhas padrão caso necessário.
 */
export async function garantirTabelasGamificacao(db) {
  if (!db || typeof db.prepare !== 'function') return;
  try {
    const check = await queryOne(db, "SELECT name FROM sqlite_master WHERE type='table' AND name='medalhas'");
    if (!check) {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS medalhas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo TEXT NOT NULL UNIQUE,
          titulo TEXT NOT NULL,
          descricao TEXT NOT NULL,
          eixo_bncc TEXT NOT NULL CHECK(eixo_bncc IN ('Pensamento Computacional', 'Mundo Digital', 'Cultura Digital', 'Geral')),
          icone TEXT NOT NULL,
          cor TEXT NOT NULL DEFAULT '#2563eb',
          criterio_tipo TEXT NOT NULL,
          criterio_meta INTEGER NOT NULL DEFAULT 1,
          criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      await db.prepare(`
        CREATE TABLE IF NOT EXISTS usuario_medalhas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER NOT NULL,
          medalha_id INTEGER NOT NULL,
          conquistada_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
          FOREIGN KEY (medalha_id) REFERENCES medalhas(id) ON DELETE CASCADE,
          UNIQUE(usuario_id, medalha_id)
        )
      `).run();

      await db.prepare(`
        CREATE TABLE IF NOT EXISTS desempenho_habilidades (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER NOT NULL,
          curso_id INTEGER,
          habilidade_codigo TEXT NOT NULL,
          origem_tipo TEXT NOT NULL CHECK(origem_tipo IN ('atividade', 'avaliacao', 'projeto')) DEFAULT 'atividade',
          origem_id TEXT NOT NULL,
          pontuacao REAL NOT NULL DEFAULT 0.0,
          nivel_atingido TEXT NOT NULL CHECK(nivel_atingido IN ('em_desenvolvimento', 'adequado', 'avancado')) DEFAULT 'adequado',
          registrado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
          FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE SET NULL
        )
      `).run();

      await db.prepare(`
        CREATE TABLE IF NOT EXISTS submissoes_python (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER NOT NULL,
          atividade_id TEXT NOT NULL,
          codigo_python TEXT NOT NULL,
          sucesso INTEGER NOT NULL DEFAULT 1,
          tentativas INTEGER NOT NULL DEFAULT 1,
          estrelas INTEGER NOT NULL DEFAULT 3,
          parceiro_dupla TEXT,
          papel_dupla TEXT NOT NULL CHECK(papel_dupla IN ('individual', 'piloto', 'navegador')) DEFAULT 'individual',
          criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
      `).run();

      const padroes = [
        ['primeiro_passo', 'Primeiro Passo na Computação', 'Concluiu a primeira atividade interativa ou aula no LMS.', 'Geral', 'rocket_launch', '#3b82f6', 'atividades', 1],
        ['mestre_algoritmos', 'Mestre dos Algoritmos', 'Completou todas as trilhas de sequenciamento e passos lógicos.', 'Pensamento Computacional', 'psychology', '#8b5cf6', 'eixo_pc', 3],
        ['arquiteto_decomposicao', 'Arquiteto da Decomposição', 'Resolveu desafios quebrando problemas complexos em partes menores.', 'Pensamento Computacional', 'account_tree', '#6366f1', 'decomposicao', 2],
        ['programador_blocos', 'Programador em Blocos Jr.', 'Montou e executou com sucesso rotinas de lógica no simulador.', 'Pensamento Computacional', 'terminal', '#0ea5e9', 'blocos', 3],
        ['explorador_python_3d', 'Explorador Python 3D', 'Concluiu as 6 atividades tridimensionais de lógica de programação em Python.', 'Pensamento Computacional', 'view_in_ar', '#0284c7', 'concluir_python3d', 6],
        ['detetive_hardware_software', 'Detetive de Hardware & Software', 'Compreendeu os componentes de computadores, periféricos e redes.', 'Mundo Digital', 'memory', '#10b981', 'mundo_digital', 2],
        ['guardiao_privacidade', 'Guardião da Privacidade & Ética', 'Dominou práticas de cidadania digital, senhas seguras e direitos na web.', 'Cultura Digital', 'verified_user', '#f59e0b', 'cultura_digital', 2],
        ['trilha_completa', 'Pioneiro da BNCC Computação', 'Concluiu com êxito pelo menos um curso completo da plataforma.', 'Geral', 'workspace_premium', '#ec4899', 'cursos', 1],
      ];

      for (const p of padroes) {
        await db.prepare('INSERT OR IGNORE INTO medalhas (codigo, titulo, descricao, eixo_bncc, icone, cor, criterio_tipo, criterio_meta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .bind(...p)
          .run();
      }
    }
  } catch (err) {
    // Silencia erros caso seja ambiente de teste com mocks restritos
  }
}

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

  let medalhas;
  try {
    medalhas = await queryAll(db, sql, params);
  } catch (err) {
    if (err && String(err.message || err).includes('no such table')) {
      await garantirTabelasGamificacao(db);
      try {
        medalhas = await queryAll(db, sql, params);
      } catch {
        medalhas = [];
      }
    } else {
      throw err;
    }
  }

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
  const codigoPython = typeof body.codigoPython === 'string' ? body.codigoPython : null;
  const tentativas = Number(body.tentativas || 1);
  const estrelas = Number(body.estrelas || 3);
  const parceiroDupla = body.parceiroDupla ? String(body.parceiroDupla).trim() : null;
  const papelDupla = ['individual', 'piloto', 'navegador'].includes(body.papelDupla) ? body.papelDupla : 'individual';
  const concluiuTodasPython3d = Boolean(body.concluiuTodasPython3d);

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

  // Se for atividade Python 3D com código enviado, persiste em submissoes_python
  if (codigoPython) {
    try {
      await db.prepare(`
        INSERT INTO submissoes_python (usuario_id, atividade_id, codigo_python, sucesso, tentativas, estrelas, parceiro_dupla, papel_dupla)
        VALUES (?, ?, ?, 1, ?, ?, ?, ?)
      `).bind(usuarioId, atividadeId, codigoPython, tentativas, estrelas, parceiroDupla, papelDupla).run();
    } catch {
      // Caso a tabela ainda não exista no ambiente local, tenta criá-la
      await garantirTabelasGamificacao(db);
    }
  }

  // Avalia medalhas em decorrência da atividade
  const medalhasNovas = [];
  let medalhaExploradorPython3d = false;

  if (atividadeId.startsWith('ordenar-')) {
    const m = await queryOne(db, 'SELECT id FROM medalhas WHERE codigo = ?', ['mestre_algoritmos']);
    if (m) medalhasNovas.push(m.id);
  } else if (atividadeId.startsWith('decompor-')) {
    const m = await queryOne(db, 'SELECT id FROM medalhas WHERE codigo = ?', ['arquiteto_decomposicao']);
    if (m) medalhasNovas.push(m.id);
  } else if (atividadeId.startsWith('blocos-')) {
    const m = await queryOne(db, 'SELECT id FROM medalhas WHERE codigo = ?', ['programador_blocos']);
    if (m) medalhasNovas.push(m.id);
  } else if (atividadeId.startsWith('python3d-')) {
    let totalPythonConcluidas = concluiuTodasPython3d ? 6 : 0;
    if (!concluiuTodasPython3d) {
      try {
        const contagem = await queryOne(
          db,
          "SELECT COUNT(DISTINCT atividade_id) AS total FROM submissoes_python WHERE usuario_id = ? AND atividade_id LIKE 'python3d-%' AND sucesso = 1",
          [usuarioId],
        );
        totalPythonConcluidas = Number(contagem?.total || 0);
      } catch {
        totalPythonConcluidas = 0;
      }
    }
    if (totalPythonConcluidas >= 6) {
      const mPy = await queryOne(db, 'SELECT id FROM medalhas WHERE codigo = ?', ['explorador_python_3d']);
      if (mPy) {
        medalhasNovas.push(mPy.id);
        medalhaExploradorPython3d = true;
      }
    }
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
    medalhaExploradorPython3d,
  });
}

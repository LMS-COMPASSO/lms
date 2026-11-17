/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - ROTAS DE DASHBOARD E INDICADORES (DASHBOARD)
 * ============================================================================
 * Fornece dados consolidados para a gestão pedagógica:
 * - Indicadores gerais de engajamento escolar (/api/dashboard/indicadores)
 * - Linha do tempo de atividades recentes (/api/dashboard/linha-do-tempo)
 * ============================================================================
 */

import {
  jsonResponse,
  queryAll,
  queryOne,
  authorizeUser,
  exigirPerfil,
  parseIdPositivo,
  escaparCelulaCsv,
  CORS_HEADERS,
} from '../helpers_utilitarios.js';
import { garantirTabelasGamificacao } from './gamificacao_rotas.js';

function montarFiltroInstrutor(sqlBase, payload, clausulaInstrutor) {
  if (payload.perfil === 'instrutor') {
    return { sql: `${sqlBase} ${clausulaInstrutor}`, params: [payload.id] };
  }
  return { sql: sqlBase, params: [] };
}

async function contarSubmissoesPlugadas(db, payload) {
  try {
    const baseSql = 'SELECT COUNT(*) AS total FROM submissoes_python sp';
    const clausula = `WHERE EXISTS (
      SELECT 1 FROM matriculas mt
      JOIN cursos c ON c.id = mt.curso_id
      WHERE mt.usuario_id = sp.usuario_id AND c.instrutor_id = ?
    )`;
    const { sql, params } = montarFiltroInstrutor(baseSql, payload, clausula);
    const subRes = await queryOne(db, sql, params);
    return Number(subRes?.total || 0);
  } catch (erroSub) {
    console.warn('Tabela submissoes_python indisponível ao calcular indicadores:', erroSub?.message || erroSub);
    return 0;
  }
}

function montarConformidadeTempoTela(resumoAulas, totalSubmissoesPlugadas, resumoHoras) {
  const qtdDesplugadas = Number(resumoAulas?.desplugadas || 0);
  const qtdPlugadas = Number(resumoAulas?.plugadas || 0) + totalSubmissoesPlugadas;
  const totalAtividades = qtdDesplugadas + qtdPlugadas;
  const desplugadasPct = totalAtividades > 0 ? Math.round((qtdDesplugadas / totalAtividades) * 100) : 0;
  const plugadasPct = totalAtividades > 0 ? 100 - desplugadasPct : 0;
  const taxaEquilibrio = totalAtividades > 0
    ? Math.max(0, 100 - Math.abs(desplugadasPct - 50) * 2)
    : 0;
  const totalHorasEstimadas = Number(resumoHoras?.total_horas || 0)
    || Math.round(Number(resumoAulas?.minutos_aulas || 0) / 60);

  let status = 'Sem registros';
  if (totalAtividades > 0) {
    status = taxaEquilibrio >= 60 ? 'Conforme' : 'Atenção ao equilíbrio';
  }

  return {
    status,
    resolucao: 'Resolução CNE nº 2/2025',
    taxaEquilibrio,
    atividadesDesplugadasPercent: desplugadasPct,
    atividadesPlugadasPercent: plugadasPct,
    totalHorasEstimadas,
    recomendacao: 'Equilíbrio recomendado para a Educação Básica: alternância pedagógica com dinâmicas físicas e fichas desplugadas a cada 30 minutos de tela.',
  };
}

/**
 * Retorna estatísticas gerais e indicadores para o dashboard.
 */
export async function obterIndicadores(request, env, db) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador', 'instrutor']);

  const usuarios = await queryOne(db, `
    SELECT COUNT(*) AS total,
      SUM(CASE WHEN perfil = 'administrador' THEN 1 ELSE 0 END) AS administradores,
      SUM(CASE WHEN perfil = 'instrutor' THEN 1 ELSE 0 END) AS instrutores,
      SUM(CASE WHEN perfil = 'aluno' THEN 1 ELSE 0 END) AS alunos,
      SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) AS ativos
    FROM usuarios
  `);

  const qCursos = montarFiltroInstrutor(`
    SELECT SUM(CASE WHEN c.status = 'publicado' THEN 1 ELSE 0 END) AS publicados,
      SUM(CASE WHEN c.status = 'rascunho' THEN 1 ELSE 0 END) AS rascunhos,
      COUNT(*) AS total
    FROM cursos c
  `, payload, 'WHERE instrutor_id = ?');
  const cursos = await queryOne(db, qCursos.sql, qCursos.params);

  const qMatriculas = montarFiltroInstrutor(`
    SELECT SUM(CASE WHEN mt.status = 'ativa' THEN 1 ELSE 0 END) AS ativas,
      SUM(CASE WHEN mt.status = 'concluida' THEN 1 ELSE 0 END) AS concluidas,
      SUM(CASE WHEN mt.status = 'cancelada' THEN 1 ELSE 0 END) AS canceladas,
      COUNT(*) AS total,
      ROUND(AVG(mt.progresso_percentual), 2) AS progresso_medio
    FROM matriculas mt
    JOIN cursos c ON c.id = mt.curso_id
  `, payload, 'WHERE c.instrutor_id = ?');
  const matriculas = await queryOne(db, qMatriculas.sql, qMatriculas.params);

  const qCertificados = montarFiltroInstrutor(`
    SELECT COUNT(*) AS total
    FROM certificados cert
    JOIN matriculas mt ON mt.id = cert.matricula_id
    JOIN cursos c ON c.id = mt.curso_id
  `, payload, 'WHERE c.instrutor_id = ?');
  const certificados = await queryOne(db, qCertificados.sql, qCertificados.params);

  const qEixos = montarFiltroInstrutor(
    'SELECT eixo_bncc, COUNT(*) AS total FROM cursos',
    payload,
    'WHERE instrutor_id = ?',
  );
  const cursosPorEixo = await queryAll(db, `${qEixos.sql} GROUP BY eixo_bncc`, qEixos.params);

  const totalMatriculas = Number(matriculas.total || 0);
  const concluidasMatriculas = Number(matriculas.concluidas || 0);
  const taxaConclusao = totalMatriculas > 0
    ? Number(((concluidasMatriculas / totalMatriculas) * 100).toFixed(2))
    : 0;

  const qAulas = montarFiltroInstrutor(`
    SELECT
      SUM(CASE WHEN a.tipo IN ('texto', 'pdf') THEN 1 ELSE 0 END) AS desplugadas,
      SUM(CASE WHEN a.tipo IN ('video', 'link') THEN 1 ELSE 0 END) AS plugadas,
      SUM(COALESCE(a.duracao_min, 0)) AS minutos_aulas
    FROM aulas a
    JOIN modulos m ON m.id = a.modulo_id
    JOIN cursos c ON c.id = m.curso_id
  `, payload, 'WHERE c.instrutor_id = ?');
  const resumoAulas = await queryOne(db, qAulas.sql, qAulas.params);

  const qHoras = montarFiltroInstrutor(
    'SELECT SUM(COALESCE(carga_horaria, 0)) AS total_horas FROM cursos',
    payload,
    'WHERE instrutor_id = ?',
  );
  const resumoHoras = await queryOne(db, qHoras.sql, qHoras.params);
  const totalSubmissoesPlugadas = await contarSubmissoesPlugadas(db, payload);

  return jsonResponse({
    usuarios: payload.perfil === 'administrador' ? usuarios : undefined,
    cursos,
    matriculas,
    certificadosEmitidos: Number(certificados.total || 0),
    taxaConclusao,
    cursosPorEixoBNCC: cursosPorEixo,
    conformidadeTempoTela: montarConformidadeTempoTela(resumoAulas, totalSubmissoesPlugadas, resumoHoras),
  });
}

/**
 * Retorna a linha do tempo (timeline) cronológica das atividades recentes da plataforma.
 */
export async function obterLinhaDoTempo(request, env, db, url) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador', 'instrutor']);
  const limiteBruto = Number.parseInt(url.searchParams.get('limite') || '15', 10);
  const limite = Number.isFinite(limiteBruto) ? Math.min(100, Math.max(1, limiteBruto)) : 15;

  let sql = `SELECT tipo, data, usuario_nome, curso_titulo, extra FROM (
    SELECT 'matricula' AS tipo, mt.data_matricula AS data, u.nome AS usuario_nome, c.titulo AS curso_titulo, NULL AS extra
    FROM matriculas mt JOIN usuarios u ON u.id = mt.usuario_id JOIN cursos c ON c.id = mt.curso_id`;
  const params = [];
  if (payload.perfil === 'instrutor') {
    sql += ' WHERE c.instrutor_id = ?';
    params.push(payload.id);
  }

  sql += `
    UNION ALL
    SELECT 'conclusao' AS tipo, mt.data_conclusao AS data, u.nome AS usuario_nome, c.titulo AS curso_titulo, NULL AS extra
    FROM matriculas mt JOIN usuarios u ON u.id = mt.usuario_id JOIN cursos c ON c.id = mt.curso_id
    WHERE mt.status = 'concluida' AND mt.data_conclusao IS NOT NULL`;
  if (payload.perfil === 'instrutor') {
    sql += ' AND c.instrutor_id = ?';
    params.push(payload.id);
  }

  sql += `
    UNION ALL
    SELECT 'curso_publicado' AS tipo, c.atualizado_em AS data, ui.nome AS usuario_nome, c.titulo AS curso_titulo, NULL AS extra
    FROM cursos c JOIN usuarios ui ON ui.id = c.instrutor_id WHERE c.status = 'publicado'`;
  if (payload.perfil === 'instrutor') {
    sql += ' AND c.instrutor_id = ?';
    params.push(payload.id);
  }

  sql += `
    UNION ALL
    SELECT 'certificado' AS tipo, cert.data_emissao AS data, u.nome AS usuario_nome, c.titulo AS curso_titulo, cert.codigo_validacao AS extra
    FROM certificados cert JOIN matriculas mt ON mt.id = cert.matricula_id JOIN usuarios u ON u.id = mt.usuario_id JOIN cursos c ON c.id = mt.curso_id`;
  if (payload.perfil === 'instrutor') {
    sql += ' AND c.instrutor_id = ?';
    params.push(payload.id);
  }

  sql += ') ORDER BY data DESC LIMIT ?';
  params.push(limite);

  const registros = await queryAll(db, sql, params);
  return jsonResponse(registros);
}

/**
 * Retorna o relatório pedagógico agregado por habilidade da BNCC Computação.
 * Permite que professores e secretarias de educação acompanhem a consolidação
 * das habilidades por turma e exportem os dados formatados em CSV para diários escolares.
 */
export async function obterRelatorioPedagogico(request, env, db, url) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador', 'instrutor']);

  const cursoId = url.searchParams.get('curso_id');
  const eixoFiltro = url.searchParams.get('eixo_bncc');
  const formato = url.searchParams.get('formato');

  let sql = `
    SELECT dh.*, u.nome AS aluno_nome, u.email AS aluno_email,
      COALESCE(c.titulo, 'Atividades Gerais da BNCC') AS curso_titulo,
      COALESCE(c.eixo_bncc, 'Pensamento Computacional') AS curso_eixo,
      COALESCE(c.ano_escolar, 'Ensino Fundamental') AS ano_escolar
    FROM desempenho_habilidades dh
    JOIN usuarios u ON u.id = dh.usuario_id
    LEFT JOIN cursos c ON c.id = dh.curso_id
    WHERE 1 = 1
  `;
  const params = [];

  if (payload.perfil === 'instrutor') {
    sql += ` AND (
      c.instrutor_id = ?
      OR (
        dh.curso_id IS NULL
        AND EXISTS (
          SELECT 1 FROM matriculas mt
          JOIN cursos cm ON cm.id = mt.curso_id
          WHERE mt.usuario_id = dh.usuario_id AND cm.instrutor_id = ?
        )
      )
    )`;
    params.push(payload.id, payload.id);
  }

  if (cursoId) {
    sql += ' AND dh.curso_id = ?';
    params.push(parseIdPositivo(cursoId, 'curso_id'));
  }

  if (eixoFiltro) {
    sql += ' AND (c.eixo_bncc = ? OR (c.eixo_bncc IS NULL AND ? = "Pensamento Computacional"))';
    params.push(eixoFiltro, eixoFiltro);
  }

  sql += ' ORDER BY dh.habilidade_codigo ASC, u.nome ASC';

  const registros = await queryAll(db, sql, params);

  // Se o usuário solicitou exportação para Diário Escolar em CSV
  if (formato === 'csv') {
    const cabecalhoCsv = 'Aluno;Email;Curso;Eixo BNCC;Ano Escolar;Código Habilidade;Origem;Nota;Nível Atingido;Data\n';
    const linhasCsv = registros.map((r) => {
      const dataFormatada = (r.registrado_em || '').substring(0, 10);
      return [
        r.aluno_nome,
        r.aluno_email,
        r.curso_titulo,
        r.curso_eixo,
        r.ano_escolar,
        r.habilidade_codigo,
        r.origem_tipo,
        Number(r.pontuacao).toFixed(1),
        r.nivel_atingido,
        dataFormatada,
      ].map(escaparCelulaCsv).join(';');
    }).join('\n');

    return new Response(cabecalhoCsv + linhasCsv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="relatorio-pedagogico-bncc.csv"',
        ...CORS_HEADERS,
      },
    });
  }

  // Agrupamento consolidado por Habilidade BNCC para o painel
  const porHabilidade = {};
  for (const reg of registros) {
    const cod = reg.habilidade_codigo;
    if (!porHabilidade[cod]) {
      porHabilidade[cod] = {
        codigo: cod,
        totalAvaliacoes: 0,
        somaNotas: 0,
        alunosDistintos: new Set(),
        adequadosOuAvancados: 0,
        registros: [],
      };
    }
    porHabilidade[cod].totalAvaliacoes += 1;
    porHabilidade[cod].somaNotas += Number(reg.pontuacao || 0);
    porHabilidade[cod].alunosDistintos.add(reg.usuario_id);
    if (reg.nivel_atingido === 'adequado' || reg.nivel_atingido === 'avancado') {
      porHabilidade[cod].adequadosOuAvancados += 1;
    }
    porHabilidade[cod].registros.push(reg);
  }

  const consolidado = Object.values(porHabilidade).map((h) => {
    const media = h.totalAvaliacoes > 0 ? Number((h.somaNotas / h.totalAvaliacoes).toFixed(1)) : 0;
    const taxa = h.totalAvaliacoes > 0 ? Math.round((h.adequadosOuAvancados / h.totalAvaliacoes) * 100) : 0;
    let statusTurma = 'Em Desenvolvimento';
    if (taxa >= 85) statusTurma = 'Consolidada';
    else if (taxa >= 60) statusTurma = 'Adequada';

    return {
      codigo: h.codigo,
      totalAlunos: h.alunosDistintos.size,
      totalAvaliacoes: h.totalAvaliacoes,
      mediaPontuacao: media,
      taxaConsolidacao: taxa,
      statusTurma,
      registros: h.registros,
    };
  });

  return jsonResponse({
    totalRegistros: registros.length,
    totalHabilidadesAvaliadas: consolidado.length,
    habilidades: consolidado,
  });
}

/**
 * Lista as submissões de código Python 3D dos estudantes da turma para visualização docente.
 */
export async function listarSubmissoesPython(request, env, db, url) {
  const { payload } = await authorizeUser(request, env, db);
  exigirPerfil(payload, ['administrador', 'instrutor']);

  await garantirTabelasGamificacao(db);

  const atividadeFiltro = url ? url.searchParams.get('atividade_id') : null;
  let sql = `
    SELECT sp.id, sp.usuario_id, sp.atividade_id, sp.codigo_python, sp.sucesso,
      sp.tentativas, sp.estrelas, sp.parceiro_dupla, sp.papel_dupla, sp.criado_em,
      u.nome AS aluno_nome, u.email AS aluno_email
    FROM submissoes_python sp
    JOIN usuarios u ON u.id = sp.usuario_id
    WHERE 1 = 1
  `;
  const params = [];
  if (atividadeFiltro) {
    sql += ' AND sp.atividade_id = ?';
    params.push(atividadeFiltro);
  }
  if (payload.perfil === 'instrutor') {
    sql += ` AND EXISTS (
      SELECT 1 FROM matriculas mt
      JOIN cursos cm ON cm.id = mt.curso_id
      WHERE mt.usuario_id = sp.usuario_id AND cm.instrutor_id = ?
    )`;
    params.push(payload.id);
  }
  sql += ' ORDER BY sp.criado_em DESC LIMIT 50';

  const submissoes = await queryAll(db, sql, params);
  return jsonResponse({ total: submissoes.length, submissoes });
}

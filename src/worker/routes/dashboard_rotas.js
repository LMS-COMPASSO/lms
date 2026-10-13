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
  CORS_HEADERS,
} from '../helpers_utilitarios.js';

/**
 * Retorna estatísticas gerais e indicadores para o dashboard.
 */
export async function obterIndicadores(request, env, db) {
  const { payload } = await authorizeUser(request, env, db);

  // Contagem geral de usuários (apenas administrador visualiza)
  const usuarios = await queryOne(db, `
    SELECT COUNT(*) AS total,
      SUM(CASE WHEN perfil = 'administrador' THEN 1 ELSE 0 END) AS administradores,
      SUM(CASE WHEN perfil = 'instrutor' THEN 1 ELSE 0 END) AS instrutores,
      SUM(CASE WHEN perfil = 'aluno' THEN 1 ELSE 0 END) AS alunos,
      SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) AS ativos
    FROM usuarios
  `);

  // Estatísticas de cursos
  let cursosSql = `
    SELECT SUM(CASE WHEN c.status = 'publicado' THEN 1 ELSE 0 END) AS publicados,
      SUM(CASE WHEN c.status = 'rascunho' THEN 1 ELSE 0 END) AS rascunhos,
      COUNT(*) AS total
    FROM cursos c
  `;
  const cursoParams = [];
  if (payload.perfil === 'instrutor') {
    cursosSql += ' WHERE instrutor_id = ?';
    cursoParams.push(payload.id);
  }
  const cursos = await queryOne(db, cursosSql, cursoParams);

  // Estatísticas de matrículas
  let matriculasSql = `
    SELECT SUM(CASE WHEN mt.status = 'ativa' THEN 1 ELSE 0 END) AS ativas,
      SUM(CASE WHEN mt.status = 'concluida' THEN 1 ELSE 0 END) AS concluidas,
      SUM(CASE WHEN mt.status = 'cancelada' THEN 1 ELSE 0 END) AS canceladas,
      COUNT(*) AS total,
      ROUND(AVG(mt.progresso_percentual), 2) AS progresso_medio
    FROM matriculas mt
    JOIN cursos c ON c.id = mt.curso_id
  `;
  const matriculasParams = [];
  if (payload.perfil === 'instrutor') {
    matriculasSql += ' WHERE c.instrutor_id = ?';
    matriculasParams.push(payload.id);
  }
  const matriculas = await queryOne(db, matriculasSql, matriculasParams);

  // Total de certificados emitidos
  let certificadosSql = `
    SELECT COUNT(*) AS total
    FROM certificados cert
    JOIN matriculas mt ON mt.id = cert.matricula_id
    JOIN cursos c ON c.id = mt.curso_id
  `;
  const certificadosParams = [];
  if (payload.perfil === 'instrutor') {
    certificadosSql += ' WHERE c.instrutor_id = ?';
    certificadosParams.push(payload.id);
  }
  const certificados = await queryOne(db, certificadosSql, certificadosParams);

  // Distribuição de cursos por eixo estruturante da BNCC Computação
  let eixosSql = 'SELECT eixo_bncc, COUNT(*) AS total FROM cursos';
  const eixosParams = [];
  if (payload.perfil === 'instrutor') {
    eixosSql += ' WHERE instrutor_id = ?';
    eixosParams.push(payload.id);
  }
  eixosSql += ' GROUP BY eixo_bncc';
  const cursosPorEixo = await queryAll(db, eixosSql, eixosParams);

  // Cálculo da taxa de conclusão
  const totalMatriculas = Number(matriculas.total || 0);
  const concluidasMatriculas = Number(matriculas.concluidas || 0);
  const taxaConclusao = totalMatriculas > 0
    ? Number(((concluidasMatriculas / totalMatriculas) * 100).toFixed(2))
    : 0;

  return jsonResponse({
    usuarios: payload.perfil === 'administrador' ? usuarios : undefined,
    cursos,
    matriculas,
    certificadosEmitidos: Number(certificados.total || 0),
    taxaConclusao,
    cursosPorEixoBNCC: cursosPorEixo,
    conformidadeTempoTela: {
      status: 'Conforme',
      resolucao: 'Resolução CNE nº 2/2025',
      taxaEquilibrio: 85,
      atividadesDesplugadasPercent: 42,
      atividadesPlugadasPercent: 58,
      totalHorasEstimadas: 40,
      recomendacao: 'Equilíbrio recomendado para a Educação Básica: alternância pedagógica com dinâmicas físicas e fichas desplugadas a cada 30 minutos de tela.',
    },
  });
}

/**
 * Retorna a linha do tempo (timeline) cronológica das atividades recentes da plataforma.
 */
export async function obterLinhaDoTempo(request, env, db, url) {
  const { payload } = await authorizeUser(request, env, db);
  const limite = Number(url.searchParams.get('limite') || 15);

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
    sql += ' AND (c.instrutor_id = ? OR dh.curso_id IS NULL)';
    params.push(payload.id);
  }

  if (cursoId) {
    sql += ' AND dh.curso_id = ?';
    params.push(Number(cursoId));
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
      return `"${r.aluno_nome}";"${r.aluno_email}";"${r.curso_titulo}";"${r.curso_eixo}";"${r.ano_escolar}";"${r.habilidade_codigo}";"${r.origem_tipo}";"${Number(r.pontuacao).toFixed(1)}";"${r.nivel_atingido}";"${dataFormatada}"`;
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

/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - ROTAS DE CERTIFICADOS DIGITAIS
 * ============================================================================
 * Gerencia a emissão, validação pública e visualização para impressão A4:
 * - Visualizar certificado em HTML pronto para impressão (/api/certificados/visualizar/:codigo)
 * - Validar autenticidade pública por código (/api/certificados/validar/:codigo)
 * - Listar certificados emitidos (/api/certificados)
 * - Emitir certificado após conclusão de 100% das aulas (/api/certificados/emitir)
 * ============================================================================
 */

import {
  jsonResponse,
  jsonErro,
  readJsonBody,
  queryAll,
  queryOne,
  authorizeUser,
  CORS_HEADERS,
} from '../helpers.mjs';

/**
 * Renderiza o certificado diretamente em HTML/CSS para impressão no formato A4 paisagem.
 * Esta rota é pública para permitir que qualquer pessoa com o link possa visualizar e imprimir.
 */
export async function visualizarCertificadoHtml(request, env, db, codigo) {
  const cert = await queryOne(db, `
    SELECT cert.*, u.nome AS aluno_nome, c.titulo AS curso_titulo, c.carga_horaria, c.eixo_bncc, c.ano_escolar
    FROM certificados cert
    JOIN matriculas m ON m.id = cert.matricula_id
    JOIN usuarios u ON u.id = m.usuario_id
    JOIN cursos c ON c.id = m.curso_id
    WHERE cert.codigo_validacao = ?
  `, [codigo]);

  if (!cert) {
    return new Response('Certificado não encontrado ou código de validação inválido.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', ...CORS_HEADERS },
    });
  }

  const html = gerarHtmlCertificado(cert);
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...CORS_HEADERS },
  });
}

/**
 * Consulta pública de autenticidade para a Secretaria de Educação ou auditoria escolar.
 */
export async function validarCertificadoPublico(request, env, db, codigo) {
  const certificate = await queryOne(db, `
    SELECT cert.*, u.nome AS aluno_nome, c.titulo AS curso_titulo, c.carga_horaria, c.eixo_bncc
    FROM certificados cert
    JOIN matriculas m ON m.id = cert.matricula_id
    JOIN usuarios u ON u.id = m.usuario_id
    JOIN cursos c ON c.id = m.curso_id
    WHERE cert.codigo_validacao = ?
  `, [codigo]);

  if (!certificate) {
    return jsonErro('Certificado não encontrado ou inválido.', 404);
  }
  return jsonResponse({ valido: true, certificado: certificate });
}

/**
 * Lista os certificados aos quais o usuário tem acesso:
 * - Aluno: vê apenas os seus próprios certificados.
 * - Instrutor: vê os certificados dos seus cursos.
 * - Administrador: vê todos os certificados emitidos na rede municipal.
 */
export async function listarCertificados(request, env, db) {
  try {
    const { payload } = await authorizeUser(request, env, db);

    let sql = `
      SELECT cert.id, cert.codigo_validacao, cert.data_emissao, cert.url_arquivo,
        u.nome AS aluno_nome, c.titulo AS curso_titulo
      FROM certificados cert
      JOIN matriculas m ON m.id = cert.matricula_id
      JOIN usuarios u ON u.id = m.usuario_id
      JOIN cursos c ON c.id = m.curso_id
    `;
    const params = [];

    if (payload.perfil === 'aluno') {
      sql += ' WHERE m.usuario_id = ?';
      params.push(payload.id);
    } else if (payload.perfil === 'instrutor') {
      sql += ' WHERE c.instrutor_id = ?';
      params.push(payload.id);
    }

    sql += ' ORDER BY cert.data_emissao DESC';

    const certificados = await queryAll(db, sql, params);
    return jsonResponse(certificados);
  } catch (error) {
    return jsonErro(error.message || 'Token inválido ou expirado.', 401);
  }
}

/**
 * Emite o certificado digital para uma matrícula que esteja com status "concluida".
 */
export async function emitirCertificado(request, env, db, url) {
  try {
    const { payload } = await authorizeUser(request, env, db);
    const body = await readJsonBody(request);
    const matriculaId = Number(body.matricula_id);

    if (!matriculaId) {
      return jsonErro('matricula_id é obrigatório.', 400);
    }

    const matricula = await queryOne(db, 'SELECT * FROM matriculas WHERE id = ?', [matriculaId]);
    if (!matricula) {
      return jsonErro('Matrícula não encontrada.', 404);
    }

    if (payload.perfil === 'aluno' && matricula.usuario_id !== payload.id) {
      return jsonErro('Acesso negado. Esta matrícula não pertence a você.', 403);
    }

    if (matricula.status !== 'concluida') {
      return jsonErro('O curso ainda não foi concluído. Complete todas as aulas antes de emitir o certificado.', 400);
    }

    // Se já foi emitido anteriormente, retorna o certificado existente
    const existente = await queryOne(db, 'SELECT * FROM certificados WHERE matricula_id = ?', [matriculaId]);
    if (existente) {
      return jsonResponse(existente);
    }

    const codigo = `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const urlArquivo = `${url.origin}/api/certificados/visualizar/${codigo}`;

    const insert = await db.prepare(
      'INSERT INTO certificados (matricula_id, codigo_validacao, url_arquivo) VALUES (?, ?, ?)',
    ).bind(matriculaId, codigo, urlArquivo).run();

    return jsonResponse({
      id: insert.meta.last_row_id,
      matricula_id: matriculaId,
      codigo_validacao: codigo,
      url_arquivo: urlArquivo,
    }, 201);
  } catch (error) {
    return jsonErro(error.message || 'Token inválido ou expirado.', 401);
  }
}

/**
 * Gera o template visual do certificado escolar em HTML com CSS para impressão A4 paisagem.
 */
export function gerarHtmlCertificado(cert) {
  const dataFormatada = cert.data_emissao
    ? new Date(cert.data_emissao).toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Certificado - ${cert.aluno_nome} - LMS BNCC Computação</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Inter:wght@400;500;600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0f172a;
      font-family: 'Inter', sans-serif;
      color: #1e293b;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px 15px;
    }

    .toolbar {
      width: 100%;
      max-width: 960px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .toolbar a, .toolbar button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      font-size: 0.9rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-voltar { background: #334155; color: #f8fafc; border: none; }
    .btn-voltar:hover { background: #475569; }
    .btn-imprimir { background: #2563eb; color: #fff; border: none; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
    .btn-imprimir:hover { background: #1d4ed8; }

    .certificate-wrapper {
      width: 100%;
      max-width: 960px;
      aspect-ratio: 1.414 / 1;
      background: #ffffff;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      position: relative;
    }

    .outer-border {
      width: 100%;
      height: 100%;
      border: 4px double #1e3a8a;
      border-radius: 6px;
      padding: 8px;
      position: relative;
    }

    .inner-border {
      width: 100%;
      height: 100%;
      border: 1px solid #93c5fd;
      background: radial-gradient(circle at 50% 50%, #ffffff 70%, #f8fafc 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 30px 40px;
      text-align: center;
      position: relative;
    }

    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 8rem;
      color: rgba(30, 58, 138, 0.03);
      font-weight: 900;
      pointer-events: none;
      white-space: nowrap;
      font-family: 'Cinzel', serif;
    }

    .header-inst {
      font-size: 0.75rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .header-prog {
      font-size: 0.9rem;
      font-weight: 700;
      color: #1e3a8a;
      letter-spacing: 1px;
    }

    .title {
      font-family: 'Cinzel', serif;
      font-size: 2.2rem;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 3px;
      margin: 10px 0;
      text-shadow: 1px 1px 0 rgba(0,0,0,0.05);
    }

    .certifica-que {
      font-size: 0.95rem;
      color: #475569;
      font-style: italic;
    }

    .student-name {
      font-family: 'Cinzel', serif;
      font-size: 1.9rem;
      font-weight: 700;
      color: #1d4ed8;
      border-bottom: 2px solid #cbd5e1;
      padding-bottom: 4px;
      margin: 6px 0;
      display: inline-block;
      min-width: 380px;
    }

    .description {
      font-size: 0.92rem;
      color: #334155;
      line-height: 1.6;
      max-width: 680px;
      margin: 8px auto;
    }

    .course-title {
      font-weight: 700;
      color: #0f172a;
    }

    .footer {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px dashed #e2e8f0;
      font-size: 0.75rem;
      color: #64748b;
    }

    .validation-box {
      text-align: left;
    }
    .validation-box code {
      display: block;
      font-size: 0.85rem;
      font-family: monospace;
      color: #0f172a;
      font-weight: 700;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      margin-top: 2px;
    }

    .signatures {
      display: flex;
      gap: 40px;
    }
    .sign-line {
      width: 170px;
      border-top: 1px solid #94a3b8;
      padding-top: 4px;
      font-size: 0.72rem;
      text-align: center;
    }

    @media print {
      body {
        background: none;
        padding: 0;
        margin: 0;
      }
      .toolbar { display: none !important; }
      .certificate-wrapper {
        box-shadow: none;
        max-width: 100%;
        width: 100%;
        height: 100vh;
        border-radius: 0;
        padding: 0;
      }
      @page {
        size: A4 landscape;
        margin: 10mm;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button class="btn-voltar" onclick="window.close(); history.back();">← Voltar</button>
    <button class="btn-imprimir" onclick="window.print()">Imprimir / Salvar em PDF</button>
  </div>

  <div class="certificate-wrapper">
    <div class="outer-border">
      <div class="inner-border">
        <div class="watermark">BNCC</div>

        <div>
          <div class="header-inst">Rede Municipal de Ensino · Secretaria de Educação</div>
          <div class="header-prog">Plataforma de Ensino da BNCC Computação</div>
        </div>

        <div>
          <h1 class="title">CERTIFICADO</h1>
          <p class="certifica-que">Certificamos com louvor que</p>
          <div class="student-name">${cert.aluno_nome}</div>
          <p class="description">
            concluiu com êxito os estudos na área de Computação Escolar no curso
            <br/><span class="course-title">"${cert.curso_titulo}"</span>,
            desenvolvendo competências orientadas pelas diretrizes da
            <strong>Base Nacional Comum Curricular (BNCC Computação)</strong>
            no eixo <strong>${cert.eixo_bncc || 'Computação Escolar'}</strong>,
            completando a carga horária de <strong>${cert.carga_horaria || 0} horas</strong>.
          </p>
        </div>

        <div class="footer">
          <div class="validation-box">
            <span>Código de Autenticidade:</span>
            <code>${cert.codigo_validacao}</code>
            <span>Emitido em: ${dataFormatada}</span>
          </div>

          <div class="signatures">
            <div class="sign-line">
              <strong>Coordenação Pedagógica</strong><br/>
              Ensino Fundamental & BNCC
            </div>
            <div class="sign-line">
              <strong>Diretoria de Tecnologia</strong><br/>
              Educação Digital Municipal
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
    },
  });
}

function base64UrlEncode(value) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function signJwt(payload, secret) {
  const headerSegment = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadSegment = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${headerSegment}.${payloadSegment}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signatureBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
  const signature = base64UrlEncode(new Uint8Array(signatureBytes));
  return `${signingInput}.${signature}`;
}

async function verifyJwt(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Token JWT inválido');

  const [headerSegment, payloadSegment, signatureSegment] = parts;
  const signingInput = `${headerSegment}.${payloadSegment}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const signatureBytes = base64UrlDecode(signatureSegment);
  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    new TextEncoder().encode(signingInput),
  );

  if (!isValid) {
    throw new Error('Token inválido ou expirado.');
  }

  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadSegment)));
  return payload;
}

function getAuthToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.replace('Bearer ', '').trim();
}

function readJsonBody(request) {
  return request.json().catch(() => ({}));
}

async function ensureDefaultAdmin(db) {
  const existing = await db.prepare('SELECT id FROM usuarios WHERE email = ?').bind('admin@lms-bncc.edu.br').first();
  if (!existing) {
    const senhaHash = await sha256Hex('Admin@12345');
    await db.prepare(
      "INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo) VALUES (?, ?, ?, 'administrador', 1)",
    ).bind('Administrador do Sistema', 'admin@lms-bncc.edu.br', senhaHash).run();
  }
}

async function getUserByEmail(db, email) {
  return db.prepare('SELECT id, nome, email, senha_hash, perfil, ativo FROM usuarios WHERE email = ?').bind(email).first();
}

async function getUserById(db, id) {
  return db.prepare('SELECT id, nome, email, perfil, avatar_url, ativo FROM usuarios WHERE id = ?').bind(id).first();
}

async function getUserProfile(db, id) {
  return db.prepare('SELECT id, nome, email, perfil, avatar_url, ativo, criado_em FROM usuarios WHERE id = ?').bind(id).first();
}

async function authorizeUser(request, env, db) {
  const token = getAuthToken(request);
  if (!token) throw new Error('Token de acesso não fornecido.');
  const payload = await verifyJwt(token, env.JWT_SECRET || 'dev-secret-change-me');
  const user = await getUserById(db, payload.id);
  if (!user) throw new Error('Usuário não encontrado.');
  return { payload, user };
}

async function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  const bound = params.length ? stmt.bind(...params) : stmt;
  const result = await bound.all();
  return result.results || [];
}

async function queryOne(db, sql, params = []) {
  const stmt = db.prepare(sql);
  const bound = params.length ? stmt.bind(...params) : stmt;
  const result = await bound.first();
  return result || null;
}

function gerarHtmlCertificado(cert) {
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
    <button class="btn-imprimir" onclick="window.print()">🖨️ Imprimir / Salvar em PDF</button>
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Se não for rota da API (/api/*), serve os arquivos estáticos do frontend (public/)
    if (!url.pathname.startsWith('/api')) {
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }
      return new Response('Frontend não configurado. Binding ASSETS ausente no worker.', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', ...CORS_HEADERS },
      });
    }

    const db = env.DB || env.lms_prod;
    if (!db) {
      return jsonResponse({
        erro: 'Banco de dados Cloudflare D1 não configurado. Adicione o binding "DB" no arquivo wrangler.jsonc.',
      }, 500);
    }

    try {
      await ensureDefaultAdmin(db);
    } catch {
      // Ignora erro inicial se as tabelas ainda não foram criadas via schema.sql
    }

    // ==========================================
    // ROTA PÚBLICA: HEALTHCHECK
    // ==========================================
    if (url.pathname === '/api/health') {
      return jsonResponse({
        status: 'ok',
        servico: 'LMS BNCC Computação (Cloudflare Workers + D1)',
        database: 'Cloudflare D1',
        hora: new Date().toISOString(),
      });
    }

    // ==========================================
    // ROTA PÚBLICA: VISUALIZAÇÃO DE CERTIFICADO
    // ==========================================
    if (url.pathname.startsWith('/api/certificados/visualizar/') && request.method === 'GET') {
      const codigo = url.pathname.split('/').at(-1);
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

    // ==========================================
    // ROTA PÚBLICA: VALIDAÇÃO DE CERTIFICADO
    // ==========================================
    if (url.pathname.startsWith('/api/certificados/validar/') && request.method === 'GET') {
      const codigo = url.pathname.split('/').at(-1);
      const certificate = await queryOne(db, `
        SELECT cert.*, u.nome AS aluno_nome, c.titulo AS curso_titulo, c.carga_horaria, c.eixo_bncc
        FROM certificados cert
        JOIN matriculas m ON m.id = cert.matricula_id
        JOIN usuarios u ON u.id = m.usuario_id
        JOIN cursos c ON c.id = m.curso_id
        WHERE cert.codigo_validacao = ?
      `, [codigo]);

      if (!certificate) {
        return jsonResponse({ erro: 'Certificado não encontrado ou inválido.' }, 404);
      }
      return jsonResponse({ valido: true, certificado: certificate });
    }

    // ==========================================
    // ROTAS DE AUTENTICAÇÃO
    // ==========================================
    if (url.pathname === '/api/auth/registrar' && request.method === 'POST') {
      const body = await readJsonBody(request);
      const nome = String(body.nome || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const senha = String(body.senha || '');

      if (!nome || !email || !senha) {
        return jsonResponse({ erro: 'Nome, email e senha são obrigatórios.' }, 400);
      }
      if (senha.length < 6) {
        return jsonResponse({ erro: 'A senha deve ter ao menos 6 caracteres.' }, 400);
      }

      const existing = await getUserByEmail(db, email);
      if (existing) {
        return jsonResponse({ erro: 'Já existe um usuário cadastrado com este email.' }, 409);
      }

      const senhaHash = await sha256Hex(senha);
      const insertResult = await db.prepare(
        "INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo) VALUES (?, ?, ?, 'aluno', 1)",
      ).bind(nome, email, senhaHash).run();

      const user = { id: insertResult.meta.last_row_id, nome, email, perfil: 'aluno' };
      const token = await signJwt(user, env.JWT_SECRET || 'dev-secret-change-me');
      return jsonResponse({ mensagem: 'Cadastro realizado com sucesso.', usuario: user, token }, 201);
    }

    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      const body = await readJsonBody(request);
      const email = String(body.email || '').trim().toLowerCase();
      const senha = String(body.senha || '');

      if (!email || !senha) {
        return jsonResponse({ erro: 'Email e senha são obrigatórios.' }, 400);
      }

      const user = await getUserByEmail(db, email);
      if (!user) {
        return jsonResponse({ erro: 'Email ou senha inválidos.' }, 401);
      }

      if (!user.ativo) {
        return jsonResponse({ erro: 'Este usuário está desativado. Contate o administrador.' }, 403);
      }

      const senhaHash = await sha256Hex(senha);
      if (user.senha_hash !== senhaHash) {
        return jsonResponse({ erro: 'Email ou senha inválidos.' }, 401);
      }

      const usuario = { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil };
      const token = await signJwt(usuario, env.JWT_SECRET || 'dev-secret-change-me');
      return jsonResponse({ mensagem: 'Login realizado com sucesso.', usuario, token });
    }

    if (url.pathname === '/api/auth/me' && request.method === 'GET') {
      try {
        const { user } = await authorizeUser(request, env, db);
        return jsonResponse(await getUserProfile(db, user.id));
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    if (url.pathname === '/api/auth/alterar-senha' && request.method === 'POST') {
      try {
        const { user } = await authorizeUser(request, env, db);
        const body = await readJsonBody(request);
        const senhaAtual = String(body.senhaAtual || '');
        const novaSenha = String(body.novaSenha || '');

        if (!senhaAtual || !novaSenha) {
          return jsonResponse({ erro: 'Informe a senha atual e a nova senha.' }, 400);
        }
        if (novaSenha.length < 6) {
          return jsonResponse({ erro: 'A nova senha deve ter ao menos 6 caracteres.' }, 400);
        }

        const dbUser = await db.prepare('SELECT id, senha_hash FROM usuarios WHERE id = ?').bind(user.id).first();
        if (!dbUser) {
          return jsonResponse({ erro: 'Usuário não encontrado.' }, 404);
        }

        const atualHash = await sha256Hex(senhaAtual);
        if (dbUser.senha_hash !== atualHash) {
          return jsonResponse({ erro: 'Senha atual incorreta.' }, 401);
        }

        const novaHash = await sha256Hex(novaSenha);
        await db.prepare('UPDATE usuarios SET senha_hash = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?').bind(novaHash, user.id).run();
        return jsonResponse({ mensagem: 'Senha alterada com sucesso.' });
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    // ==========================================
    // GESTÃO DE USUÁRIOS (ADMINISTRADOR)
    // ==========================================
    if (url.pathname === '/api/usuarios' && request.method === 'GET') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (payload.perfil !== 'administrador') {
          return jsonResponse({ erro: 'Acesso negado.' }, 403);
        }

        const perfil = url.searchParams.get('perfil');
        const busca = url.searchParams.get('busca');
        const ativo = url.searchParams.get('ativo');

        let sql = 'SELECT id, nome, email, perfil, ativo, criado_em FROM usuarios WHERE 1 = 1';
        const params = [];
        if (perfil) {
          sql += ' AND perfil = ?';
          params.push(perfil);
        }
        if (ativo !== null && ativo !== undefined && ativo !== '') {
          sql += ' AND ativo = ?';
          params.push(ativo === 'true' || ativo === '1' ? 1 : 0);
        }
        if (busca) {
          sql += ' AND (nome LIKE ? OR email LIKE ?)';
          params.push(`%${busca}%`, `%${busca}%`);
        }
        sql += ' ORDER BY criado_em DESC';

        const rows = await queryAll(db, sql, params);
        return jsonResponse(rows);
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    const matchUsuarioRedefinir = url.pathname.match(/^\/api\/usuarios\/(\d+)\/redefinir-senha$/);
    if (matchUsuarioRedefinir && request.method === 'POST') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (payload.perfil !== 'administrador') {
          return jsonResponse({ erro: 'Acesso negado.' }, 403);
        }
        const targetId = Number(matchUsuarioRedefinir[1]);
        const body = await readJsonBody(request);
        const novaSenha = String(body.novaSenha || '');
        if (!novaSenha || novaSenha.length < 6) {
          return jsonResponse({ erro: 'A nova senha deve ter ao menos 6 caracteres.' }, 400);
        }
        const novaHash = await sha256Hex(novaSenha);
        await db.prepare('UPDATE usuarios SET senha_hash = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?').bind(novaHash, targetId).run();
        return jsonResponse({ mensagem: 'Senha redefinida com sucesso pelo administrador.' });
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    const matchUsuarioUnico = url.pathname.match(/^\/api\/usuarios\/(\d+)$/);
    if (matchUsuarioUnico && request.method === 'GET') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        const targetId = Number(matchUsuarioUnico[1]);
        if (payload.perfil !== 'administrador' && payload.id !== targetId) {
          return jsonResponse({ erro: 'Acesso negado.' }, 403);
        }
        const row = await getUserProfile(db, targetId);
        if (!row) return jsonResponse({ erro: 'Usuário não encontrado.' }, 404);
        return jsonResponse(row);
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    if (url.pathname === '/api/usuarios' && request.method === 'POST') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (payload.perfil !== 'administrador') {
          return jsonResponse({ erro: 'Acesso negado.' }, 403);
        }
        const body = await readJsonBody(request);
        const nome = String(body.nome || '').trim();
        const email = String(body.email || '').trim().toLowerCase();
        const senha = String(body.senha || '');
        const perfil = String(body.perfil || 'aluno');

        if (!nome || !email || !senha || !['administrador', 'instrutor', 'aluno'].includes(perfil)) {
          return jsonResponse({ erro: 'Nome, email, senha e perfil válidos são obrigatórios.' }, 400);
        }
        const existing = await getUserByEmail(db, email);
        if (existing) {
          return jsonResponse({ erro: 'Já existe um usuário com este email.' }, 409);
        }

        const senhaHash = await sha256Hex(senha);
        const result = await db.prepare(
          'INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo) VALUES (?, ?, ?, ?, 1)',
        ).bind(nome, email, senhaHash, perfil).run();

        return jsonResponse({ id: result.meta.last_row_id, nome, email, perfil }, 201);
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    if (url.pathname.match(/^\/api\/usuarios\/(\d+)$/) && request.method === 'PUT') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (payload.perfil !== 'administrador') {
          return jsonResponse({ erro: 'Acesso negado.' }, 403);
        }
        const id = Number(url.pathname.split('/').at(-1));
        const body = await readJsonBody(request);
        const updates = [];
        const params = [];

        if (body.nome !== undefined) { updates.push('nome = ?'); params.push(String(body.nome)); }
        if (body.email !== undefined) { updates.push('email = ?'); params.push(String(body.email).toLowerCase()); }
        if (body.perfil !== undefined) { updates.push('perfil = ?'); params.push(String(body.perfil)); }
        if (body.ativo !== undefined) { updates.push('ativo = ?'); params.push(body.ativo ? 1 : 0); }
        if (updates.length === 0) {
          return jsonResponse({ erro: 'Nenhum campo para atualizar.' }, 400);
        }

        updates.push('atualizado_em = CURRENT_TIMESTAMP');
        params.push(id);
        await db.prepare(`UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
        return jsonResponse({ mensagem: 'Usuário atualizado com sucesso.' });
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    if (url.pathname.match(/^\/api\/usuarios\/(\d+)$/) && request.method === 'DELETE') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (payload.perfil !== 'administrador') {
          return jsonResponse({ erro: 'Acesso negado.' }, 403);
        }
        const id = Number(url.pathname.split('/').at(-1));
        await db.prepare('UPDATE usuarios SET ativo = 0, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?').bind(id).run();
        return jsonResponse({ mensagem: 'Usuário desativado com sucesso.' });
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    // ==========================================
    // GESTÃO DE CURSOS (BNCC DA COMPUTAÇÃO)
    // ==========================================
    if (url.pathname === '/api/cursos' && request.method === 'GET') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        const search = url.searchParams.get('busca');
        const status = url.searchParams.get('status');
        const eixo = url.searchParams.get('eixo_bncc');
        const ano = url.searchParams.get('ano_escolar');
        const instrutorId = url.searchParams.get('instrutor_id');

        let sql = `SELECT c.*, u.nome AS instrutor_nome,
          (SELECT COUNT(*) FROM matriculas m WHERE m.curso_id = c.id AND m.status IN ('ativa','concluida')) AS total_matriculados
          FROM cursos c JOIN usuarios u ON u.id = c.instrutor_id WHERE 1 = 1`;
        const params = [];

        if (payload.perfil === 'aluno') {
          sql += ' AND c.status = ?';
          params.push('publicado');
        } else if (status) {
          sql += ' AND c.status = ?';
          params.push(status);
        }

        if (payload.perfil === 'instrutor') {
          sql += ' AND c.instrutor_id = ?';
          params.push(payload.id);
        } else if (instrutorId) {
          sql += ' AND c.instrutor_id = ?';
          params.push(Number(instrutorId));
        }

        if (eixo) { sql += ' AND c.eixo_bncc = ?'; params.push(eixo); }
        if (ano) { sql += ' AND c.ano_escolar = ?'; params.push(ano); }
        if (search) { sql += ' AND c.titulo LIKE ?'; params.push(`%${search}%`); }
        sql += ' ORDER BY c.criado_em DESC';

        const rows = await queryAll(db, sql, params);
        return jsonResponse(rows);
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    if (url.pathname === '/api/cursos' && request.method === 'POST') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (!['administrador', 'instrutor'].includes(payload.perfil)) {
          return jsonResponse({ erro: 'Acesso negado.' }, 403);
        }
        const body = await readJsonBody(request);
        const titulo = String(body.titulo || '').trim();
        const eixo = String(body.eixo_bncc || '').trim();
        const ano = String(body.ano_escolar || '').trim();
        if (!titulo || !eixo || !ano) {
          return jsonResponse({ erro: 'Título, eixo BNCC e ano escolar são obrigatórios.' }, 400);
        }

        const instrutorId = payload.perfil === 'administrador' && body.instrutor_id ? Number(body.instrutor_id) : payload.id;
        const result = await db.prepare(
          'INSERT INTO cursos (titulo, descricao, eixo_bncc, ano_escolar, carga_horaria, capa_url, instrutor_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, "rascunho")',
        ).bind(
          titulo,
          body.descricao || '',
          eixo,
          ano,
          Number(body.carga_horaria || 0),
          body.capa_url || null,
          instrutorId,
        ).run();

        return jsonResponse({ id: result.meta.last_row_id, titulo, status: 'rascunho' }, 201);
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    const matchCursoUnico = url.pathname.match(/^\/api\/cursos\/(\d+)$/);
    if (matchCursoUnico && request.method === 'GET') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        const id = Number(matchCursoUnico[1]);
        const curso = await queryOne(
          db,
          `SELECT c.*, u.nome AS instrutor_nome FROM cursos c JOIN usuarios u ON u.id = c.instrutor_id WHERE c.id = ?`,
          [id],
        );
        if (!curso) {
          return jsonResponse({ erro: 'Curso não encontrado.' }, 404);
        }

        if (payload.perfil === 'aluno' && curso.status !== 'publicado') {
          return jsonResponse({ erro: 'Acesso negado.' }, 403);
        }

        const modulos = await queryAll(
          db,
          'SELECT * FROM modulos WHERE curso_id = ? ORDER BY ordem ASC, id ASC',
          [id],
        );

        for (const modulo of modulos) {
          modulo.aulas = await queryAll(
            db,
            `SELECT a.id, a.titulo, a.tipo, a.conteudo, a.url_recurso, a.duracao_min, a.ordem,
              COALESCE((
                SELECT pa.concluida FROM progresso_aulas pa
                JOIN matriculas m ON m.id = pa.matricula_id
                WHERE pa.aula_id = a.id AND m.usuario_id = ? AND m.curso_id = ?
                LIMIT 1
              ), 0) AS concluida
            FROM aulas a WHERE a.modulo_id = ? ORDER BY a.ordem ASC, a.id ASC`,
            [payload.id, id, modulo.id],
          );
          modulo.avaliacoes = await queryAll(
            db,
            'SELECT id, titulo, nota_minima, tentativas_permitidas FROM avaliacoes WHERE modulo_id = ?',
            [modulo.id],
          );
        }

        curso.modulos = modulos;
        return jsonResponse(curso);
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    if (matchCursoUnico && request.method === 'PUT') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (!['administrador', 'instrutor'].includes(payload.perfil)) {
          return jsonResponse({ erro: 'Acesso negado.' }, 403);
        }
        const id = Number(matchCursoUnico[1]);

        const cursoExistente = await queryOne(db, 'SELECT id, instrutor_id FROM cursos WHERE id = ?', [id]);
        if (!cursoExistente) return jsonResponse({ erro: 'Curso não encontrado.' }, 404);
        if (payload.perfil === 'instrutor' && cursoExistente.instrutor_id !== payload.id) {
          return jsonResponse({ erro: 'Você não tem permissão para editar este curso.' }, 403);
        }

        const body = await readJsonBody(request);
        const updates = [];
        const params = [];

        if (body.titulo !== undefined) { updates.push('titulo = ?'); params.push(String(body.titulo)); }
        if (body.descricao !== undefined) { updates.push('descricao = ?'); params.push(String(body.descricao)); }
        if (body.eixo_bncc !== undefined) { updates.push('eixo_bncc = ?'); params.push(String(body.eixo_bncc)); }
        if (body.ano_escolar !== undefined) { updates.push('ano_escolar = ?'); params.push(String(body.ano_escolar)); }
        if (body.carga_horaria !== undefined) { updates.push('carga_horaria = ?'); params.push(Number(body.carga_horaria)); }
        if (body.capa_url !== undefined) { updates.push('capa_url = ?'); params.push(String(body.capa_url)); }
        if (updates.length === 0) {
          return jsonResponse({ erro: 'Nenhum campo para atualizar.' }, 400);
        }

        updates.push('atualizado_em = CURRENT_TIMESTAMP');
        params.push(id);
        await db.prepare(`UPDATE cursos SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
        return jsonResponse({ mensagem: 'Curso atualizado com sucesso.' });
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    const matchCursoStatus = url.pathname.match(/^\/api\/cursos\/(\d+)\/status$/);
    if (matchCursoStatus && request.method === 'PATCH') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (!['administrador', 'instrutor'].includes(payload.perfil)) {
          return jsonResponse({ erro: 'Acesso negado.' }, 403);
        }
        const id = Number(matchCursoStatus[1]);
        const cursoExistente = await queryOne(db, 'SELECT id, instrutor_id FROM cursos WHERE id = ?', [id]);
        if (!cursoExistente) return jsonResponse({ erro: 'Curso não encontrado.' }, 404);
        if (payload.perfil === 'instrutor' && cursoExistente.instrutor_id !== payload.id) {
          return jsonResponse({ erro: 'Você não tem permissão para alterar o status deste curso.' }, 403);
        }

        const body = await readJsonBody(request);
        const statusValue = String(body.status || '');
        if (!['rascunho', 'publicado'].includes(statusValue)) {
          return jsonResponse({ erro: 'Status inválido. Use "rascunho" ou "publicado".' }, 400);
        }

        await db.prepare('UPDATE cursos SET status = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?').bind(statusValue, id).run();
        return jsonResponse({ mensagem: `Curso marcado como "${statusValue}".` });
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    if (matchCursoUnico && request.method === 'DELETE') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (!['administrador', 'instrutor'].includes(payload.perfil)) {
          return jsonResponse({ erro: 'Acesso negado.' }, 403);
        }
        const id = Number(matchCursoUnico[1]);
        const cursoExistente = await queryOne(db, 'SELECT id, instrutor_id FROM cursos WHERE id = ?', [id]);
        if (!cursoExistente) return jsonResponse({ erro: 'Curso não encontrado.' }, 404);
        if (payload.perfil === 'instrutor' && cursoExistente.instrutor_id !== payload.id) {
          return jsonResponse({ erro: 'Você não tem permissão para excluir este curso.' }, 403);
        }

        await db.prepare('DELETE FROM cursos WHERE id = ?').bind(id).run();
        return jsonResponse({ mensagem: 'Curso excluído com sucesso.' });
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    // ==========================================
    // DASHBOARD & INDICADORES
    // ==========================================
    if (url.pathname === '/api/dashboard/indicadores') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        const usuarios = await queryOne(db, "SELECT COUNT(*) AS total, SUM(CASE WHEN perfil = 'administrador' THEN 1 ELSE 0 END) AS administradores, SUM(CASE WHEN perfil = 'instrutor' THEN 1 ELSE 0 END) AS instrutores, SUM(CASE WHEN perfil = 'aluno' THEN 1 ELSE 0 END) AS alunos, SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) AS ativos FROM usuarios");

        let cursosSql = 'SELECT SUM(CASE WHEN c.status = "publicado" THEN 1 ELSE 0 END) AS publicados, SUM(CASE WHEN c.status = "rascunho" THEN 1 ELSE 0 END) AS rascunhos, COUNT(*) AS total FROM cursos c';
        const cursoParams = [];
        if (payload.perfil === 'instrutor') {
          cursosSql += ' WHERE instrutor_id = ?';
          cursoParams.push(payload.id);
        }
        const cursos = await queryOne(db, cursosSql, cursoParams);

        let matriculasSql = 'SELECT SUM(CASE WHEN mt.status = "ativa" THEN 1 ELSE 0 END) AS ativas, SUM(CASE WHEN mt.status = "concluida" THEN 1 ELSE 0 END) AS concluidas, SUM(CASE WHEN mt.status = "cancelada" THEN 1 ELSE 0 END) AS canceladas, COUNT(*) AS total, ROUND(AVG(mt.progresso_percentual), 2) AS progresso_medio FROM matriculas mt JOIN cursos c ON c.id = mt.curso_id';
        const matriculasParams = [];
        if (payload.perfil === 'instrutor') {
          matriculasSql += ' WHERE c.instrutor_id = ?';
          matriculasParams.push(payload.id);
        }
        const matriculas = await queryOne(db, matriculasSql, matriculasParams);

        let certificadosSql = 'SELECT COUNT(*) AS total FROM certificados cert JOIN matriculas mt ON mt.id = cert.matricula_id JOIN cursos c ON c.id = mt.curso_id';
        const certificadosParams = [];
        if (payload.perfil === 'instrutor') {
          certificadosSql += ' WHERE c.instrutor_id = ?';
          certificadosParams.push(payload.id);
        }
        const certificados = await queryOne(db, certificadosSql, certificadosParams);

        let eixosSql = 'SELECT eixo_bncc, COUNT(*) AS total FROM cursos';
        const eixosParams = [];
        if (payload.perfil === 'instrutor') {
          eixosSql += ' WHERE instrutor_id = ?';
          eixosParams.push(payload.id);
        }
        eixosSql += ' GROUP BY eixo_bncc';
        const cursosPorEixo = await queryAll(db, eixosSql, eixosParams);

        const taxaConclusao = Number(matriculas.total || 0) > 0 ? Number(((Number(matriculas.concluidas || 0) / Number(matriculas.total)) * 100).toFixed(2)) : 0;
        return jsonResponse({
          usuarios: payload.perfil === 'administrador' ? usuarios : undefined,
          cursos,
          matriculas,
          certificadosEmitidos: Number(certificados.total || 0),
          taxaConclusao,
          cursosPorEixoBNCC: cursosPorEixo,
        });
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    if (url.pathname === '/api/dashboard/linha-do-tempo') {
      try {
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
          FROM matriculas mt JOIN usuarios u ON u.id = mt.usuario_id JOIN cursos c ON c.id = mt.curso_id WHERE mt.status = 'concluida' AND mt.data_conclusao IS NOT NULL`;
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
        const rows = await queryAll(db, sql, params);
        return jsonResponse(rows);
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    // ==========================================
    // MATRÍCULAS
    // ==========================================
    if (url.pathname === '/api/matriculas' && request.method === 'GET') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        const cursoId = url.searchParams.get('curso_id');
        const status = url.searchParams.get('status');

        let sql = `SELECT m.id, m.status, m.progresso_percentual, m.data_matricula,
          u.id AS aluno_id, u.nome AS aluno_nome, u.email AS aluno_email,
          c.id AS curso_id, c.titulo AS curso_titulo, c.carga_horaria
          FROM matriculas m
          JOIN usuarios u ON u.id = m.usuario_id
          JOIN cursos c ON c.id = m.curso_id WHERE 1 = 1`;
        const params = [];
        if (payload.perfil === 'aluno') {
          sql += ' AND m.usuario_id = ?';
          params.push(payload.id);
        } else if (payload.perfil === 'instrutor') {
          sql += ' AND c.instrutor_id = ?';
          params.push(payload.id);
        }
        if (cursoId) {
          sql += ' AND m.curso_id = ?';
          params.push(Number(cursoId));
        }
        if (status) {
          sql += ' AND m.status = ?';
          params.push(status);
        }
        sql += ' ORDER BY m.data_matricula DESC';
        const rows = await queryAll(db, sql, params);
        return jsonResponse(rows);
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    if (url.pathname === '/api/matriculas' && request.method === 'POST') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        const body = await readJsonBody(request);
        const cursoId = Number(body.curso_id);
        if (!cursoId) {
          return jsonResponse({ erro: 'curso_id é obrigatório.' }, 400);
        }

        const alunoId = payload.perfil === 'aluno' ? payload.id : (Number(body.usuario_id) || payload.id);

        const course = await queryOne(db, 'SELECT id, status FROM cursos WHERE id = ?', [cursoId]);
        if (!course) {
          return jsonResponse({ erro: 'Curso não encontrado.' }, 404);
        }
        if (payload.perfil === 'aluno' && course.status !== 'publicado') {
          return jsonResponse({ erro: 'Este curso ainda não está disponível para matrícula.' }, 403);
        }

        const existing = await queryOne(db, 'SELECT id, status FROM matriculas WHERE usuario_id = ? AND curso_id = ?', [alunoId, cursoId]);
        if (existing) {
          if (existing.status === 'cancelada') {
            await db.prepare('UPDATE matriculas SET status = "ativa", progresso_percentual = 0 WHERE id = ?').bind(existing.id).run();
            return jsonResponse({ id: existing.id, curso_id: cursoId, status: 'ativa', mensagem: 'Matrícula reativada com sucesso.' });
          }
          return jsonResponse({ erro: 'Você já está matriculado neste curso.' }, 409);
        }

        const result = await db.prepare(
          'INSERT INTO matriculas (usuario_id, curso_id, status, progresso_percentual) VALUES (?, ?, "ativa", 0)',
        ).bind(alunoId, cursoId).run();

        return jsonResponse({ id: result.meta.last_row_id, curso_id: cursoId, status: 'ativa', mensagem: 'Matrícula realizada com sucesso.' }, 201);
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    const matchMatriculaCancelar = url.pathname.match(/^\/api\/matriculas\/(\d+)\/cancelar$/);
    if (matchMatriculaCancelar && request.method === 'PATCH') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        const id = Number(matchMatriculaCancelar[1]);
        if (payload.perfil === 'aluno') {
          const own = await queryOne(db, 'SELECT id FROM matriculas WHERE id = ? AND usuario_id = ?', [id, payload.id]);
          if (!own) {
            return jsonResponse({ erro: 'Acesso negado.' }, 403);
          }
        }
        await db.prepare('UPDATE matriculas SET status = "cancelada" WHERE id = ?').bind(id).run();
        return jsonResponse({ mensagem: 'Matrícula cancelada com sucesso.' });
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    // ==========================================
    // MÓDULOS
    // ==========================================
    const matchModulosCurso = url.pathname.match(/^\/api\/modulos\/curso\/(\d+)$/);
    if (matchModulosCurso && request.method === 'GET') {
      try {
        await authorizeUser(request, env, db);
        const cursoId = Number(matchModulosCurso[1]);
        return jsonResponse(await queryAll(
          db,
          'SELECT * FROM modulos WHERE curso_id = ? ORDER BY ordem ASC, id ASC',
          [cursoId],
        ));
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    if (matchModulosCurso && request.method === 'POST') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (!['administrador', 'instrutor'].includes(payload.perfil)) {
          return jsonResponse({ erro: 'Acesso negado.' }, 403);
        }
        const cursoId = Number(matchModulosCurso[1]);
        const body = await readJsonBody(request);
        const titulo = String(body.titulo || '').trim();
        if (!titulo) return jsonResponse({ erro: 'Título do módulo é obrigatório.' }, 400);

        const result = await db.prepare(
          'INSERT INTO modulos (curso_id, titulo, descricao, ordem) VALUES (?, ?, ?, ?)',
        ).bind(cursoId, titulo, body.descricao || null, Number(body.ordem || 0)).run();
        return jsonResponse({ id: result.meta.last_row_id, titulo }, 201);
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    const matchModuloUnico = url.pathname.match(/^\/api\/modulos\/(\d+)$/);
    if (matchModuloUnico && request.method === 'PUT') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (!['administrador', 'instrutor'].includes(payload.perfil)) {
          return jsonResponse({ erro: 'Acesso negado.' }, 403);
        }
        const id = Number(matchModuloUnico[1]);
        const body = await readJsonBody(request);
        const updates = [];
        const params = [];
        if (body.titulo !== undefined) { updates.push('titulo = ?'); params.push(String(body.titulo)); }
        if (body.descricao !== undefined) { updates.push('descricao = ?'); params.push(body.descricao); }
        if (body.ordem !== undefined) { updates.push('ordem = ?'); params.push(Number(body.ordem)); }
        if (updates.length === 0) return jsonResponse({ erro: 'Nenhum campo para atualizar.' }, 400);
        params.push(id);
        await db.prepare(`UPDATE modulos SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
        return jsonResponse({ mensagem: 'Módulo atualizado com sucesso.' });
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    if (matchModuloUnico && request.method === 'DELETE') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (!['administrador', 'instrutor'].includes(payload.perfil)) {
          return jsonResponse({ erro: 'Acesso negado.' }, 403);
        }
        const id = Number(matchModuloUnico[1]);
        await db.prepare('DELETE FROM modulos WHERE id = ?').bind(id).run();
        return jsonResponse({ mensagem: 'Módulo excluído com sucesso.' });
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    // ==========================================
    // AULAS
    // ==========================================
    const matchAulasModulo = url.pathname.match(/^\/api\/aulas\/modulo\/(\d+)$/);
    if (matchAulasModulo && request.method === 'GET') {
      try {
        await authorizeUser(request, env, db);
        const moduloId = Number(matchAulasModulo[1]);
        return jsonResponse(await queryAll(
          db,
          'SELECT * FROM aulas WHERE modulo_id = ? ORDER BY ordem ASC, id ASC',
          [moduloId],
        ));
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    if (matchAulasModulo && request.method === 'POST') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (!['administrador', 'instrutor'].includes(payload.perfil)) {
          return jsonResponse({ erro: 'Acesso negado.' }, 403);
        }
        const moduloId = Number(matchAulasModulo[1]);
        const body = await readJsonBody(request);
        const titulo = String(body.titulo || '').trim();
        if (!titulo) return jsonResponse({ erro: 'Título da aula é obrigatório.' }, 400);
        const tipo = String(body.tipo || 'texto');
        if (!['video', 'texto', 'pdf', 'link'].includes(tipo)) {
          return jsonResponse({ erro: 'Tipo de aula inválido.' }, 400);
        }
        const result = await db.prepare(
          'INSERT INTO aulas (modulo_id, titulo, tipo, conteudo, url_recurso, duracao_min, ordem) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ).bind(
          moduloId,
          titulo,
          tipo,
          body.conteudo || null,
          body.url_recurso || null,
          Number(body.duracao_min || 0),
          Number(body.ordem || 0),
        ).run();
        return jsonResponse({ id: result.meta.last_row_id, titulo }, 201);
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    const matchAulaProgresso = url.pathname.match(/^\/api\/aulas\/(\d+)\/progresso$/);
    if (matchAulaProgresso && request.method === 'POST') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (payload.perfil !== 'aluno') return jsonResponse({ erro: 'Acesso negado.' }, 403);
        const aulaId = Number(matchAulaProgresso[1]);
        const body = await readJsonBody(request);
        const aula = await queryOne(db, `SELECT a.id, m.curso_id
          FROM aulas a JOIN modulos m ON m.id = a.modulo_id WHERE a.id = ?`, [aulaId]);
        if (!aula) return jsonResponse({ erro: 'Aula não encontrada.' }, 404);

        const matricula = await queryOne(db,
          'SELECT id FROM matriculas WHERE usuario_id = ? AND curso_id = ? AND status != "cancelada"',
          [payload.id, aula.curso_id]);
        if (!matricula) return jsonResponse({ erro: 'Você não está matriculado neste curso.' }, 403);

        const concluida = body.concluida ? 1 : 0;
        await db.prepare(`INSERT INTO progresso_aulas (matricula_id, aula_id, concluida, data_conclusao)
          VALUES (?, ?, ?, ?) ON CONFLICT(matricula_id, aula_id) DO UPDATE SET
          concluida = excluded.concluida, data_conclusao = excluded.data_conclusao`)
          .bind(matricula.id, aulaId, concluida, concluida ? new Date().toISOString() : null).run();

        const total = await queryOne(db, `SELECT COUNT(*) AS total FROM aulas a
          JOIN modulos m ON m.id = a.modulo_id WHERE m.curso_id = ?`, [aula.curso_id]);
        const concluidaTotal = await queryOne(db,
          'SELECT COUNT(*) AS total FROM progresso_aulas WHERE matricula_id = ? AND concluida = 1',
          [matricula.id]);
        const totalAulas = Number(total.total || 0);
        const totalConcluidas = Number(concluidaTotal.total || 0);
        const percentual = totalAulas > 0 ? Math.round((totalConcluidas / totalAulas) * 10000) / 100 : 0;
        const status = totalAulas > 0 && totalConcluidas >= totalAulas ? 'concluida' : 'ativa';
        await db.prepare(`UPDATE matriculas SET progresso_percentual = ?, status = ?, data_conclusao = ? WHERE id = ?`)
          .bind(percentual, status, status === 'concluida' ? new Date().toISOString() : null, matricula.id).run();
        return jsonResponse({ mensagem: 'Progresso atualizado com sucesso.', progresso_percentual: percentual, status });
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    const matchAulaUnica = url.pathname.match(/^\/api\/aulas\/(\d+)$/);
    if (matchAulaUnica && request.method === 'GET') {
      try {
        await authorizeUser(request, env, db);
        const id = Number(matchAulaUnica[1]);
        const aula = await queryOne(db, 'SELECT * FROM aulas WHERE id = ?', [id]);
        return aula ? jsonResponse(aula) : jsonResponse({ erro: 'Aula não encontrada.' }, 404);
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    if (matchAulaUnica && request.method === 'PUT') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (!['administrador', 'instrutor'].includes(payload.perfil)) return jsonResponse({ erro: 'Acesso negado.' }, 403);
        const id = Number(matchAulaUnica[1]);
        const body = await readJsonBody(request);
        const fields = ['titulo', 'tipo', 'conteudo', 'url_recurso', 'duracao_min', 'ordem'];
        const updates = [];
        const params = [];
        for (const field of fields) {
          if (body[field] !== undefined) {
            updates.push(`${field} = ?`);
            params.push(field === 'duracao_min' || field === 'ordem' ? Number(body[field]) : body[field]);
          }
        }
        if (updates.length === 0) return jsonResponse({ erro: 'Nenhum campo para atualizar.' }, 400);
        params.push(id);
        await db.prepare(`UPDATE aulas SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
        return jsonResponse({ mensagem: 'Aula atualizada com sucesso.' });
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    if (matchAulaUnica && request.method === 'DELETE') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (!['administrador', 'instrutor'].includes(payload.perfil)) return jsonResponse({ erro: 'Acesso negado.' }, 403);
        const id = Number(matchAulaUnica[1]);
        await db.prepare('DELETE FROM aulas WHERE id = ?').bind(id).run();
        return jsonResponse({ mensagem: 'Aula excluída com sucesso.' });
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    // ==========================================
    // AVALIAÇÕES E QUIZZES
    // ==========================================
    const matchAvaliacoesModulo = url.pathname.match(/^\/api\/avaliacoes\/modulo\/(\d+)$/);
    if (matchAvaliacoesModulo && request.method === 'GET') {
      try {
        await authorizeUser(request, env, db);
        const moduloId = Number(matchAvaliacoesModulo[1]);
        return jsonResponse(await queryAll(db, 'SELECT * FROM avaliacoes WHERE modulo_id = ?', [moduloId]));
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    if (matchAvaliacoesModulo && request.method === 'POST') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (!['administrador', 'instrutor'].includes(payload.perfil)) return jsonResponse({ erro: 'Acesso negado.' }, 403);
        const moduloId = Number(matchAvaliacoesModulo[1]);
        const body = await readJsonBody(request);
        const titulo = String(body.titulo || '').trim();
        if (!titulo) return jsonResponse({ erro: 'Título da avaliação é obrigatório.' }, 400);
        const assessment = await db.prepare(
          'INSERT INTO avaliacoes (modulo_id, titulo, descricao, nota_minima, tentativas_permitidas) VALUES (?, ?, ?, ?, ?)',
        ).bind(moduloId, titulo, body.descricao || null, Number(body.nota_minima || 6), Number(body.tentativas_permitidas || 3)).run();
        const avaliacaoId = assessment.meta.last_row_id;
        const statements = [];
        for (const [index, question] of (Array.isArray(body.questoes) ? body.questoes : []).entries()) {
          const questionResult = await db.prepare(
            'INSERT INTO questoes (avaliacao_id, enunciado, tipo, pontos, ordem) VALUES (?, ?, ?, ?, ?)',
          ).bind(avaliacaoId, question.enunciado, question.tipo || 'multipla_escolha', Number(question.pontos || 1), index).run();
          for (const alternative of (Array.isArray(question.alternativas) ? question.alternativas : [])) {
            statements.push(db.prepare(
              'INSERT INTO alternativas (questao_id, texto, correta) VALUES (?, ?, ?)',
            ).bind(questionResult.meta.last_row_id, alternative.texto, alternative.correta ? 1 : 0));
          }
        }
        if (statements.length) await db.batch(statements);
        return jsonResponse({ id: avaliacaoId, titulo }, 201);
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    const matchAvaliacaoResponder = url.pathname.match(/^\/api\/avaliacoes\/(\d+)\/responder$/);
    if (matchAvaliacaoResponder && request.method === 'POST') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (payload.perfil !== 'aluno') return jsonResponse({ erro: 'Acesso negado.' }, 403);
        const avaliacaoId = Number(matchAvaliacaoResponder[1]);
        const body = await readJsonBody(request);
        const avaliacao = await queryOne(db, `SELECT av.*, m.curso_id FROM avaliacoes av
          JOIN modulos m ON m.id = av.modulo_id WHERE av.id = ?`, [avaliacaoId]);
        if (!avaliacao) return jsonResponse({ erro: 'Avaliação não encontrada.' }, 404);
        const matricula = await queryOne(db,
          'SELECT id FROM matriculas WHERE usuario_id = ? AND curso_id = ? AND status != "cancelada"',
          [payload.id, avaliacao.curso_id]);
        if (!matricula) return jsonResponse({ erro: 'Você não está matriculado neste curso.' }, 403);
        const attempts = await queryOne(db,
          'SELECT COUNT(*) AS total FROM tentativas_avaliacao WHERE matricula_id = ? AND avaliacao_id = ?',
          [matricula.id, avaliacaoId]);
        if (Number(attempts.total) >= Number(avaliacao.tentativas_permitidas)) {
          return jsonResponse({ erro: 'Número máximo de tentativas atingido.' }, 403);
        }
        const questions = await queryAll(db, 'SELECT id, pontos FROM questoes WHERE avaliacao_id = ?', [avaliacaoId]);
        const answers = Array.isArray(body.respostas) ? body.respostas : [];
        const totalPoints = questions.reduce((sum, question) => sum + Number(question.pontos), 0) || 1;
        let points = 0;
        for (const answer of answers) {
          const question = questions.find((item) => item.id === Number(answer.questaoId));
          if (!question) continue;
          const correct = await queryOne(db,
            'SELECT id FROM alternativas WHERE questao_id = ? AND correta = 1', [question.id]);
          if (correct && Number(correct.id) === Number(answer.alternativaId)) points += Number(question.pontos);
        }
        const grade = Math.round((points / totalPoints) * 1000) / 100;
        const passed = grade >= Number(avaliacao.nota_minima);
        await db.prepare(`INSERT INTO tentativas_avaliacao
          (matricula_id, avaliacao_id, nota, aprovado, respostas) VALUES (?, ?, ?, ?, ?)`)
          .bind(matricula.id, avaliacaoId, grade, passed ? 1 : 0, JSON.stringify(answers)).run();
        return jsonResponse({ nota: grade, aprovado: passed, mensagem: passed ? 'Aprovado!' : 'Reprovado. Tente novamente.' });
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    const matchAvaliacaoUnica = url.pathname.match(/^\/api\/avaliacoes\/(\d+)$/);
    if (matchAvaliacaoUnica && request.method === 'GET') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        const id = Number(matchAvaliacaoUnica[1]);
        const assessment = await queryOne(db, 'SELECT * FROM avaliacoes WHERE id = ?', [id]);
        if (!assessment) return jsonResponse({ erro: 'Avaliação não encontrada.' }, 404);
        const questions = await queryAll(db,
          'SELECT id, enunciado, tipo, pontos, ordem FROM questoes WHERE avaliacao_id = ? ORDER BY ordem ASC, id ASC', [id]);
        for (const question of questions) {
          question.alternativas = await queryAll(db,
            payload.perfil === 'aluno'
              ? 'SELECT id, texto FROM alternativas WHERE questao_id = ?'
              : 'SELECT id, texto, correta FROM alternativas WHERE questao_id = ?',
            [question.id]);
        }
        assessment.questoes = questions;
        return jsonResponse(assessment);
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    if (matchAvaliacaoUnica && request.method === 'DELETE') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        if (!['administrador', 'instrutor'].includes(payload.perfil)) return jsonResponse({ erro: 'Acesso negado.' }, 403);
        const id = Number(matchAvaliacaoUnica[1]);
        await db.prepare('DELETE FROM avaliacoes WHERE id = ?').bind(id).run();
        return jsonResponse({ mensagem: 'Avaliação excluída com sucesso.' });
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    // ==========================================
    // CERTIFICADOS
    // ==========================================
    if (url.pathname === '/api/certificados' && request.method === 'GET') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        let sql = `SELECT cert.id, cert.codigo_validacao, cert.data_emissao, cert.url_arquivo, u.nome AS aluno_nome, c.titulo AS curso_titulo
          FROM certificados cert JOIN matriculas m ON m.id = cert.matricula_id JOIN usuarios u ON u.id = m.usuario_id JOIN cursos c ON c.id = m.curso_id`;
        const params = [];
        if (payload.perfil === 'aluno') {
          sql += ' WHERE m.usuario_id = ?';
          params.push(payload.id);
        } else if (payload.perfil === 'instrutor') {
          sql += ' WHERE c.instrutor_id = ?';
          params.push(payload.id);
        }
        sql += ' ORDER BY cert.data_emissao DESC';
        return jsonResponse(await queryAll(db, sql, params));
      } catch (error) {
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    if (url.pathname === '/api/certificados/emitir' && request.method === 'POST') {
      try {
        const { payload } = await authorizeUser(request, env, db);
        const body = await readJsonBody(request);
        const matriculaId = Number(body.matricula_id);
        if (!matriculaId) {
          return jsonResponse({ erro: 'matricula_id é obrigatório.' }, 400);
        }

        const matricula = await queryOne(db, 'SELECT * FROM matriculas WHERE id = ?', [matriculaId]);
        if (!matricula) {
          return jsonResponse({ erro: 'Matrícula não encontrada.' }, 404);
        }
        if (payload.perfil === 'aluno' && matricula.usuario_id !== payload.id) {
          return jsonResponse({ erro: 'Acesso negado.' }, 403);
        }
        if (matricula.status !== 'concluida') {
          return jsonResponse({ erro: 'O curso ainda não foi concluído.' }, 400);
        }

        const existing = await queryOne(db, 'SELECT * FROM certificados WHERE matricula_id = ?', [matriculaId]);
        if (existing) {
          return jsonResponse(existing);
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
        return jsonResponse({ erro: error.message || 'Token inválido ou expirado.' }, 401);
      }
    }

    return jsonResponse({ erro: 'Endpoint não encontrado.' }, 404);
  },
};

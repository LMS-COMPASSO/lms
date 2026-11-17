/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - ROTAS DO WORKSPACE ESTILO NOTION & HUB DE IDEIAS
 * ============================================================================
 * Gerencia o ambiente pessoal de organização de estudos, notas por blocos,
 * quadros Kanban, galeria com capas/ícones e vínculos à BNCC Computação:
 * - Listar itens do workspace com filtros (/api/workspace)
 * - Criar item / aplicar template pedagógico (/api/workspace)
 * - Obter, atualizar e mover status de um item (/api/workspace/:id)
 * - Excluir item individual ou apagar todos os itens do titular (LGPD Art. 18, VI)
 * ============================================================================
 */

import {
  jsonResponse,
  jsonErro,
  readJsonBody,
  queryAll,
  queryOne,
  authorizeUser,
  parseIdPositivo,
} from '../helpers_utilitarios.js';

export const STATUS_WORKSPACE_VALIDOS = new Set(['ideia', 'planejando', 'execucao', 'concluido']);
export const EIXOS_WORKSPACE_VALIDOS = new Set(['Pensamento Computacional', 'Mundo Digital', 'Cultura Digital']);
export const PRIORIDADES_WORKSPACE_VALIDAS = new Set(['baixa', 'media', 'alta']);
export const TIPOS_BLOCO_VALIDOS = new Set([
  'paragrafo',
  'titulo',
  'checklist',
  'toggle',
  'callout',
  'codigo',
  'bncc',
]);

const REGEX_HABILIDADE_BNCC = /^EF\d{2}CO\d{2}$/;
const REGEX_DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;
const REGEX_IDENTIFICADOR_VISUAL = /^[a-z0-9-]+$/i;
const MAX_BLOCOS_POR_ITEM = 200;
const MAX_BYTES_BLOCOS_JSON = 50_000;

/**
 * Garante que a tabela `estudante_workspace_itens` e seus índices existam no D1.
 */
export async function garantirTabelaWorkspace(db) {
  if (!db || typeof db.prepare !== 'function') return;
  try {
    const check = await queryOne(db, "SELECT name FROM sqlite_master WHERE type='table' AND name='estudante_workspace_itens'");
    if (!check) {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS estudante_workspace_itens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER NOT NULL,
          titulo TEXT NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('ideia', 'planejando', 'execucao', 'concluido')) DEFAULT 'ideia',
          eixo_bncc TEXT NOT NULL CHECK(eixo_bncc IN ('Pensamento Computacional', 'Mundo Digital', 'Cultura Digital')) DEFAULT 'Pensamento Computacional',
          habilidade_codigo TEXT,
          curso_id INTEGER,
          prioridade TEXT NOT NULL CHECK(prioridade IN ('baixa', 'media', 'alta')) DEFAULT 'media',
          prazo TEXT,
          cover_id TEXT NOT NULL DEFAULT 'cover-lms-compasso',
          icone_id TEXT NOT NULL DEFAULT 'icon-lightbulb',
          template_origem TEXT,
          blocos_json TEXT NOT NULL DEFAULT '[]',
          ordem INTEGER NOT NULL DEFAULT 0,
          criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
          FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE SET NULL
        )
      `).run();
      await db.prepare('CREATE INDEX IF NOT EXISTS idx_workspace_usuario ON estudante_workspace_itens(usuario_id)').run();
      await db.prepare('CREATE INDEX IF NOT EXISTS idx_workspace_status ON estudante_workspace_itens(usuario_id, status)').run();
      await db.prepare('CREATE INDEX IF NOT EXISTS idx_workspace_eixo ON estudante_workspace_itens(usuario_id, eixo_bncc)').run();
      await db.prepare('CREATE INDEX IF NOT EXISTS idx_workspace_curso ON estudante_workspace_itens(curso_id)').run();
    }
  } catch (erroSchema) {
    console.warn('Tabela de workspace não pôde ser verificada:', erroSchema?.message || erroSchema);
  }
}

function sanitizarBlocoIndividual(bloco, indice) {
  const obj = bloco && typeof bloco === 'object' ? bloco : {};
  const tipo = TIPOS_BLOCO_VALIDOS.has(obj.tipo) ? obj.tipo : 'paragrafo';
  const idLimpo = typeof obj.id === 'string' && REGEX_IDENTIFICADOR_VISUAL.test(obj.id)
    ? obj.id.slice(0, 64)
    : `blk-${indice + 1}`;
  const texto = String(obj.texto ?? '').slice(0, 4000);
  const detalhe = String(obj.detalhe ?? '').slice(0, 4000);
  const itemLimpo = { id: idLimpo, tipo, texto };

  switch (tipo) {
    case 'titulo':
      itemLimpo.nivel = obj.nivel === 'h3' ? 'h3' : 'h2';
      break;
    case 'checklist':
      itemLimpo.concluido = Boolean(obj.concluido);
      break;
    case 'toggle':
      itemLimpo.aberto = Boolean(obj.aberto);
      itemLimpo.detalhe = detalhe;
      break;
    case 'callout':
      itemLimpo.tom = ['pensamento', 'mundo', 'cultura', 'info'].includes(obj.tom) ? obj.tom : 'info';
      itemLimpo.icone = typeof obj.icone === 'string' && REGEX_IDENTIFICADOR_VISUAL.test(obj.icone)
        ? obj.icone.slice(0, 40)
        : 'icon-lightbulb';
      break;
    case 'codigo':
      itemLimpo.linguagem = ['python', 'pseudocodigo', 'html'].includes(obj.linguagem) ? obj.linguagem : 'python';
      break;
    case 'bncc': {
      const hab = String(obj.habilidade ?? '').trim().toUpperCase();
      itemLimpo.habilidade = REGEX_HABILIDADE_BNCC.test(hab) ? hab : '';
      itemLimpo.detalhe = detalhe;
      break;
    }
    default:
      break;
  }
  return itemLimpo;
}

function parseListaBlocosBruta(entrada) {
  if (typeof entrada !== 'string') return entrada;
  try {
    return JSON.parse(entrada);
  } catch (erroParse) {
    console.warn('JSON de blocos inválido recebido no Workspace:', erroParse?.message || erroParse);
    return null;
  }
}

/**
 * Normaliza e valida a lista de blocos do editor estilo Notion.
 */
export function sanitizarBlocosWorkspace(entrada) {
  const lista = parseListaBlocosBruta(entrada);
  if (!Array.isArray(lista) || lista.length > MAX_BLOCOS_POR_ITEM) {
    return null;
  }

  const blocosLimpos = lista.map(sanitizarBlocoIndividual);
  const json = JSON.stringify(blocosLimpos);
  if (json.length > MAX_BYTES_BLOCOS_JSON) {
    return null;
  }
  return { blocos: blocosLimpos, blocosJson: json };
}

function extrairBlocosDoRegistro(registro) {
  if (Array.isArray(registro.blocos)) return registro.blocos;
  if (typeof registro.blocos_json !== 'string') return [];
  const parsed = parseListaBlocosBruta(registro.blocos_json);
  return Array.isArray(parsed) ? parsed : [];
}

function formatarItemWorkspace(registro) {
  if (!registro) return null;
  const blocos = extrairBlocosDoRegistro(registro);
  const checklists = blocos.filter((b) => b && b.tipo === 'checklist');
  const checklistConcluidos = checklists.filter((b) => Boolean(b.concluido)).length;

  return {
    id: Number(registro.id),
    usuario_id: Number(registro.usuario_id),
    titulo: registro.titulo,
    status: registro.status,
    eixo_bncc: registro.eixo_bncc,
    habilidade_codigo: registro.habilidade_codigo || null,
    curso_id: registro.curso_id !== null && registro.curso_id !== undefined ? Number(registro.curso_id) : null,
    curso_titulo: registro.curso_titulo || null,
    prioridade: registro.prioridade,
    prazo: registro.prazo || null,
    cover_id: registro.cover_id || 'cover-lms-compasso',
    icone_id: registro.icone_id || 'icon-lightbulb',
    template_origem: registro.template_origem || null,
    blocos,
    checklist_total: checklists.length,
    checklist_concluidos: checklistConcluidos,
    ordem: Number(registro.ordem || 0),
    criado_em: registro.criado_em || null,
    atualizado_em: registro.atualizado_em || null,
  };
}

function validarTituloWorkspace(body) {
  const titulo = String(body.titulo ?? '').trim();
  if (!titulo || titulo.length > 160) {
    return { erro: 'Título é obrigatório e deve ter até 160 caracteres.' };
  }
  return { campo: 'titulo', valor: titulo };
}

function validarStatusWorkspace(body) {
  const status = String(body.status ?? 'ideia').trim().toLowerCase();
  if (!STATUS_WORKSPACE_VALIDOS.has(status)) {
    return { erro: 'Status inválido. Use ideia, planejando, execucao ou concluido.' };
  }
  return { campo: 'status', valor: status };
}

function validarEixoWorkspace(body) {
  const eixo = String(body.eixo_bncc ?? 'Pensamento Computacional').trim();
  if (!EIXOS_WORKSPACE_VALIDOS.has(eixo)) {
    return { erro: 'Eixo BNCC inválido.' };
  }
  return { campo: 'eixo_bncc', valor: eixo };
}

function validarPrioridadeWorkspace(body) {
  const prioridade = String(body.prioridade ?? 'media').trim().toLowerCase();
  if (!PRIORIDADES_WORKSPACE_VALIDAS.has(prioridade)) {
    return { erro: 'Prioridade inválida. Use baixa, media ou alta.' };
  }
  return { campo: 'prioridade', valor: prioridade };
}

function validarHabilidadeWorkspace(body) {
  const rawHab = body.habilidade_codigo === null || body.habilidade_codigo === undefined
    ? ''
    : String(body.habilidade_codigo).trim().toUpperCase();
  if (rawHab && !REGEX_HABILIDADE_BNCC.test(rawHab)) {
    return { erro: 'Código de habilidade BNCC inválido (esperado formato EFxxCOxx).' };
  }
  return { campo: 'habilidade_codigo', valor: rawHab || null };
}

function validarCursoIdWorkspace(body) {
  if (body.curso_id === null || body.curso_id === '' || body.curso_id === undefined) {
    return { campo: 'curso_id', valor: null };
  }
  return { campo: 'curso_id', valor: parseIdPositivo(body.curso_id, 'ID do curso') };
}

function validarPrazoWorkspace(body) {
  const rawPrazo = body.prazo === null || body.prazo === undefined ? '' : String(body.prazo).trim();
  if (rawPrazo && !REGEX_DATA_ISO.test(rawPrazo)) {
    return { erro: 'Prazo inválido. Utilize o formato YYYY-MM-DD.' };
  }
  return { campo: 'prazo', valor: rawPrazo || null };
}

function validarIdentificadorVisualWorkspace(raw, padrao, mensagemErro, campo) {
  const valor = String(raw ?? padrao).trim();
  if (!REGEX_IDENTIFICADOR_VISUAL.test(valor) || valor.length > 64) {
    return { erro: mensagemErro };
  }
  return { campo, valor };
}

function validarTemplateOrigemWorkspace(body) {
  const rawTpl = body.template_origem === null || body.template_origem === undefined
    ? ''
    : String(body.template_origem).trim();
  if (rawTpl && (!REGEX_IDENTIFICADOR_VISUAL.test(rawTpl) || rawTpl.length > 64)) {
    return { erro: 'Identificador de template inválido.' };
  }
  return { campo: 'template_origem', valor: rawTpl || null };
}

function validarOrdemWorkspace(body) {
  const ordem = Number(body.ordem ?? 0);
  if (!Number.isFinite(ordem) || ordem < 0 || ordem > 1_000_000) {
    return { erro: 'Ordem inválida.' };
  }
  return { campo: 'ordem', valor: Math.trunc(ordem) };
}

function validarBlocosWorkspace(body) {
  const entradaBlocos = body.blocos !== undefined
    ? body.blocos
    : (body.blocos_json !== undefined ? body.blocos_json : []);
  const blocosValidados = sanitizarBlocosWorkspace(entradaBlocos);
  if (!blocosValidados) {
    return { erro: 'Lista de blocos inválida ou excede o tamanho máximo permitido.' };
  }
  return { campo: 'blocos_json', valor: blocosValidados.blocosJson };
}

const VALIDATORS_METADADOS_WORKSPACE = [
  { presente: (b) => b.titulo !== undefined, validar: validarTituloWorkspace },
  { presente: (b) => b.status !== undefined, validar: validarStatusWorkspace },
  { presente: (b) => b.eixo_bncc !== undefined, validar: validarEixoWorkspace },
  { presente: (b) => b.prioridade !== undefined, validar: validarPrioridadeWorkspace },
  { presente: (b) => b.habilidade_codigo !== undefined, validar: validarHabilidadeWorkspace },
  { presente: (b) => b.curso_id !== undefined, validar: validarCursoIdWorkspace },
  { presente: (b) => b.prazo !== undefined, validar: validarPrazoWorkspace },
  { presente: (b) => b.cover_id !== undefined, validar: (b) => validarIdentificadorVisualWorkspace(b.cover_id, 'cover-lms-compasso', 'Identificador de capa inválido.', 'cover_id') },
  { presente: (b) => b.icone_id !== undefined, validar: (b) => validarIdentificadorVisualWorkspace(b.icone_id, 'icon-lightbulb', 'Identificador de ícone inválido.', 'icone_id') },
  { presente: (b) => b.template_origem !== undefined, validar: validarTemplateOrigemWorkspace },
  { presente: (b) => b.ordem !== undefined, validar: validarOrdemWorkspace },
  { presente: (b) => b.blocos !== undefined || b.blocos_json !== undefined, validar: validarBlocosWorkspace },
];

function validarCamposMetadados(body, parcial = false) {
  const resultado = {};
  for (const regra of VALIDATORS_METADADOS_WORKSPACE) {
    if (parcial && !regra.presente(body)) continue;
    const itemValidado = regra.validar(body);
    if (itemValidado.erro) {
      return { erro: itemValidado.erro };
    }
    resultado[itemValidado.campo] = itemValidado.valor;
  }
  return { dados: resultado };
}

/**
 * Lista os itens do Workspace pertencentes ao usuário autenticado.
 */
export async function listarWorkspaceItens(request, env, db, url) {
  const { payload } = await authorizeUser(request, env, db);
  await garantirTabelaWorkspace(db);

  const status = url?.searchParams.get('status')?.trim().toLowerCase() || '';
  const eixo = url?.searchParams.get('eixo_bncc')?.trim() || '';
  const prioridade = url?.searchParams.get('prioridade')?.trim().toLowerCase() || '';
  const cursoParam = url?.searchParams.get('curso_id')?.trim() || '';
  const busca = url?.searchParams.get('busca')?.trim() || '';

  let sql = `
    SELECT w.*, c.titulo AS curso_titulo
    FROM estudante_workspace_itens w
    LEFT JOIN cursos c ON c.id = w.curso_id
    WHERE w.usuario_id = ?
  `;
  const params = [payload.id];

  if (status && STATUS_WORKSPACE_VALIDOS.has(status)) {
    sql += ' AND w.status = ?';
    params.push(status);
  }
  if (eixo && EIXOS_WORKSPACE_VALIDOS.has(eixo)) {
    sql += ' AND w.eixo_bncc = ?';
    params.push(eixo);
  }
  if (prioridade && PRIORIDADES_WORKSPACE_VALIDAS.has(prioridade)) {
    sql += ' AND w.prioridade = ?';
    params.push(prioridade);
  }
  if (cursoParam) {
    const cursoId = parseIdPositivo(cursoParam, 'ID do curso');
    sql += ' AND w.curso_id = ?';
    params.push(cursoId);
  }
  if (busca) {
    sql += ' AND (w.titulo LIKE ? OR w.habilidade_codigo LIKE ? OR w.blocos_json LIKE ?)';
    params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
  }

  sql += ' ORDER BY w.ordem ASC, w.atualizado_em DESC, w.id DESC';

  const linhas = await queryAll(db, sql, params);
  return jsonResponse({
    itens: linhas.map(formatarItemWorkspace),
  });
}

/**
 * Busca um item específico do Workspace garantindo propriedade do titular.
 */
export async function obterWorkspaceItem(request, env, db, targetId) {
  const { payload } = await authorizeUser(request, env, db);
  await garantirTabelaWorkspace(db);
  const id = parseIdPositivo(targetId, 'ID do item');

  const item = await queryOne(
    db,
    `SELECT w.*, c.titulo AS curso_titulo
     FROM estudante_workspace_itens w
     LEFT JOIN cursos c ON c.id = w.curso_id
     WHERE w.id = ?`,
    [id],
  );
  if (!item) {
    return jsonErro('Item do workspace não encontrado.', 404);
  }
  if (Number(item.usuario_id) !== Number(payload.id)) {
    return jsonErro('Acesso negado. Este item pertence a outro usuário.', 403);
  }

  return jsonResponse(formatarItemWorkspace(item));
}

/**
 * Cria um novo card/página de ideia ou estudo no Workspace do usuário autenticado.
 */
export async function criarWorkspaceItem(request, env, db) {
  const { payload } = await authorizeUser(request, env, db);
  await garantirTabelaWorkspace(db);
  const body = await readJsonBody(request);

  const validacao = validarCamposMetadados(body, false);
  if (validacao.erro) {
    return jsonErro(validacao.erro, 400);
  }
  const d = validacao.dados;

  const resultado = await db.prepare(`
    INSERT INTO estudante_workspace_itens (
      usuario_id, titulo, status, eixo_bncc, habilidade_codigo, curso_id,
      prioridade, prazo, cover_id, icone_id, template_origem, blocos_json, ordem
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    payload.id,
    d.titulo,
    d.status,
    d.eixo_bncc,
    d.habilidade_codigo,
    d.curso_id,
    d.prioridade,
    d.prazo,
    d.cover_id,
    d.icone_id,
    d.template_origem,
    d.blocos_json,
    d.ordem,
  ).run();

  const novoId = resultado.meta?.last_row_id;
  const criado = novoId
    ? await queryOne(
      db,
      `SELECT w.*, c.titulo AS curso_titulo
       FROM estudante_workspace_itens w
       LEFT JOIN cursos c ON c.id = w.curso_id
       WHERE w.id = ?`,
      [novoId],
    )
    : null;

  return jsonResponse(
    formatarItemWorkspace(
      criado || {
        id: novoId || 1,
        usuario_id: payload.id,
        ...d,
      },
    ),
    201,
  );
}

/**
 * Atualiza integral ou parcialmente um item do Workspace pertencente ao usuário.
 */
export async function atualizarWorkspaceItem(request, env, db, targetId) {
  const { payload } = await authorizeUser(request, env, db);
  await garantirTabelaWorkspace(db);
  const id = parseIdPositivo(targetId, 'ID do item');

  const existente = await queryOne(db, 'SELECT id, usuario_id FROM estudante_workspace_itens WHERE id = ?', [id]);
  if (!existente) {
    return jsonErro('Item do workspace não encontrado.', 404);
  }
  if (Number(existente.usuario_id) !== Number(payload.id)) {
    return jsonErro('Acesso negado. Você só pode editar seus próprios itens.', 403);
  }

  const body = await readJsonBody(request);
  const validacao = validarCamposMetadados(body, true);
  if (validacao.erro) {
    return jsonErro(validacao.erro, 400);
  }
  const d = validacao.dados;

  const campos = [];
  const params = [];
  for (const [chave, valor] of Object.entries(d)) {
    campos.push(`${chave} = ?`);
    params.push(valor);
  }
  if (campos.length === 0) {
    return jsonErro('Nenhum campo válido informado para atualização.', 400);
  }
  campos.push('atualizado_em = CURRENT_TIMESTAMP');
  params.push(id, payload.id);

  await db.prepare(
    `UPDATE estudante_workspace_itens SET ${campos.join(', ')} WHERE id = ? AND usuario_id = ?`,
  ).bind(...params).run();

  const atualizado = await queryOne(
    db,
    `SELECT w.*, c.titulo AS curso_titulo
     FROM estudante_workspace_itens w
     LEFT JOIN cursos c ON c.id = w.curso_id
     WHERE w.id = ?`,
    [id],
  );

  return jsonResponse(formatarItemWorkspace(atualizado || { id, usuario_id: payload.id, ...d }));
}

/**
 * Atualiza rapidamente o status (coluna Kanban) e/ou ordem de um item.
 */
export async function atualizarStatusWorkspaceItem(request, env, db, targetId) {
  const { payload } = await authorizeUser(request, env, db);
  await garantirTabelaWorkspace(db);
  const id = parseIdPositivo(targetId, 'ID do item');

  const existente = await queryOne(db, 'SELECT id, usuario_id, status, ordem FROM estudante_workspace_itens WHERE id = ?', [id]);
  if (!existente) {
    return jsonErro('Item do workspace não encontrado.', 404);
  }
  if (Number(existente.usuario_id) !== Number(payload.id)) {
    return jsonErro('Acesso negado.', 403);
  }

  const body = await readJsonBody(request);
  const novoStatus = String(body.status ?? existente.status).trim().toLowerCase();
  if (!STATUS_WORKSPACE_VALIDOS.has(novoStatus)) {
    return jsonErro('Status inválido. Use ideia, planejando, execucao ou concluido.', 400);
  }
  const novaOrdem = body.ordem !== undefined ? Number(body.ordem) : Number(existente.ordem || 0);
  if (!Number.isFinite(novaOrdem) || novaOrdem < 0 || novaOrdem > 1_000_000) {
    return jsonErro('Ordem inválida.', 400);
  }

  await db.prepare(
    'UPDATE estudante_workspace_itens SET status = ?, ordem = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ? AND usuario_id = ?',
  ).bind(novoStatus, Math.trunc(novaOrdem), id, payload.id).run();

  return jsonResponse({ id, status: novoStatus, ordem: Math.trunc(novaOrdem) });
}

/**
 * Exclui definitivamente um item do Workspace pertencente ao usuário autenticado.
 */
export async function excluirWorkspaceItem(request, env, db, targetId) {
  const { payload } = await authorizeUser(request, env, db);
  await garantirTabelaWorkspace(db);
  const id = parseIdPositivo(targetId, 'ID do item');

  const existente = await queryOne(db, 'SELECT id, usuario_id FROM estudante_workspace_itens WHERE id = ?', [id]);
  if (!existente) {
    return jsonErro('Item do workspace não encontrado.', 404);
  }
  if (Number(existente.usuario_id) !== Number(payload.id)) {
    return jsonErro('Acesso negado. Você só pode excluir seus próprios itens.', 403);
  }

  await db.prepare('DELETE FROM estudante_workspace_itens WHERE id = ? AND usuario_id = ?')
    .bind(id, payload.id)
    .run();

  return jsonResponse({ mensagem: 'Item do workspace excluído com sucesso.', id });
}

/**
 * Exclui definitivamente todos os itens do Workspace do usuário autenticado (LGPD Art. 18, VI).
 */
export async function apagarTodosWorkspaceItens(request, env, db) {
  const { payload } = await authorizeUser(request, env, db);
  await garantirTabelaWorkspace(db);

  const resultado = await db.prepare('DELETE FROM estudante_workspace_itens WHERE usuario_id = ?')
    .bind(payload.id)
    .run();

  return jsonResponse({
    mensagem: 'Todos os seus itens do Workspace foram excluídos permanentemente (LGPD Art. 18, VI).',
    removidos: Number(resultado?.meta?.changes || 0),
  });
}

/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - BACKEND SERVERLESS (CLOUDFLARE WORKERS + D1)
 * ============================================================================
 * Ponto de entrada principal da API Serverless (index.js).
 * O fluxo de funcionamento foi desenhado para máxima clareza e didática:
 *
 * 1. O método fetch() recebe a requisição HTTP.
 * 2. Trata requisições OPTIONS (CORS preflight).
 * 3. Se não for rota da API (/api/*), serve os arquivos estáticos de public/.
 * 4. Valida a conexão com o banco Cloudflare D1.
 * 5. Faz o roteamento baseado em segmentos da URL (sem regex complexo).
 * 6. Trata exceções centralmente com a classe ErroHttp.
 * ============================================================================
 */

import {
  CORS_HEADERS,
  jsonResponse,
  jsonErro,
  ensureDefaultAdmin,
  ErroHttp,
} from './helpers_utilitarios.js';

import * as authRoutes from './routes/auth_rotas.js';
import * as courseRoutes from './routes/cursos_rotas.js';
import * as moduleRoutes from './routes/modulos_rotas.js';
import * as lessonRoutes from './routes/aulas_rotas.js';
import * as assessmentRoutes from './routes/avaliacoes_rotas.js';
import * as enrollmentRoutes from './routes/matriculas_rotas.js';
import * as certificateRoutes from './routes/certificados_rotas.js';
import * as userRoutes from './routes/usuarios_rotas.js';
import * as dashboardRoutes from './routes/dashboard_rotas.js';

/**
 * Roteia requisições do domínio de Autenticação (/api/auth/*)
 */
async function rotearAuth(partes, metodo, request, env, db) {
  const acao = partes[2];
  if (acao === 'registrar' && metodo === 'POST') return authRoutes.registrar(request, env, db);
  if (acao === 'login' && metodo === 'POST') return authRoutes.login(request, env, db);
  if (acao === 'me' && metodo === 'GET') return authRoutes.obterMeuPerfil(request, env, db);
  if (acao === 'alterar-senha' && metodo === 'POST') return authRoutes.alterarSenha(request, env, db);

  return jsonErro('Endpoint de autenticação não encontrado.', 404);
}

/**
 * Roteia requisições do domínio de Usuários (/api/usuarios/*)
 */
async function rotearUsuarios(partes, metodo, request, env, db, url) {
  // /api/usuarios
  if (partes.length === 2) {
    if (metodo === 'GET') return userRoutes.listarUsuarios(request, env, db, url);
    if (metodo === 'POST') return userRoutes.criarUsuario(request, env, db);
  }

  // /api/usuarios/:id/redefinir-senha
  if (partes.length === 4 && partes[3] === 'redefinir-senha' && metodo === 'POST') {
    return userRoutes.redefinirSenhaUsuario(request, env, db, partes[2]);
  }

  // /api/usuarios/:id
  if (partes.length === 3) {
    const id = partes[2];
    if (metodo === 'GET') return userRoutes.obterUsuarioPorId(request, env, db, id);
    if (metodo === 'PUT') return userRoutes.atualizarUsuario(request, env, db, id);
    if (metodo === 'DELETE') return userRoutes.desativarUsuario(request, env, db, id);
  }

  return jsonErro('Endpoint de usuário não encontrado.', 404);
}

/**
 * Roteia requisições do domínio de Cursos (/api/cursos/*)
 */
async function rotearCursos(partes, metodo, request, env, db, url) {
  // /api/cursos
  if (partes.length === 2) {
    if (metodo === 'GET') return courseRoutes.listarCursos(request, env, db, url);
    if (metodo === 'POST') return courseRoutes.criarCurso(request, env, db);
  }

  // /api/cursos/:id/status
  if (partes.length === 4 && partes[3] === 'status' && metodo === 'PATCH') {
    return courseRoutes.alterarStatusCurso(request, env, db, partes[2]);
  }

  // /api/cursos/:id
  if (partes.length === 3) {
    const id = partes[2];
    if (metodo === 'GET') return courseRoutes.obterCurso(request, env, db, id);
    if (metodo === 'PUT') return courseRoutes.atualizarCurso(request, env, db, id);
    if (metodo === 'DELETE') return courseRoutes.excluirCurso(request, env, db, id);
  }

  return jsonErro('Endpoint de curso não encontrado.', 404);
}

/**
 * Roteia requisições do domínio de Módulos (/api/modulos/*)
 */
async function rotearModulos(partes, metodo, request, env, db) {
  // /api/modulos/curso/:cursoId
  if (partes.length === 4 && partes[2] === 'curso') {
    const cursoId = partes[3];
    if (metodo === 'GET') return moduleRoutes.listarModulosDoCurso(request, env, db, cursoId);
    if (metodo === 'POST') return moduleRoutes.criarModulo(request, env, db, cursoId);
  }

  // /api/modulos/:id
  if (partes.length === 3) {
    const id = partes[2];
    if (metodo === 'PUT') return moduleRoutes.atualizarModulo(request, env, db, id);
    if (metodo === 'DELETE') return moduleRoutes.excluirModulo(request, env, db, id);
  }

  return jsonErro('Endpoint de módulo não encontrado.', 404);
}

/**
 * Roteia requisições do domínio de Aulas (/api/aulas/*)
 */
async function rotearAulas(partes, metodo, request, env, db) {
  // /api/aulas/modulo/:moduloId
  if (partes.length === 4 && partes[2] === 'modulo') {
    const moduloId = partes[3];
    if (metodo === 'GET') return lessonRoutes.listarAulasDoModulo(request, env, db, moduloId);
    if (metodo === 'POST') return lessonRoutes.criarAula(request, env, db, moduloId);
  }

  // /api/aulas/:id/progresso
  if (partes.length === 4 && partes[3] === 'progresso' && metodo === 'POST') {
    return lessonRoutes.atualizarProgressoAula(request, env, db, partes[2]);
  }

  // /api/aulas/:id
  if (partes.length === 3) {
    const id = partes[2];
    if (metodo === 'GET') return lessonRoutes.obterAula(request, env, db, id);
    if (metodo === 'PUT') return lessonRoutes.atualizarAula(request, env, db, id);
    if (metodo === 'DELETE') return lessonRoutes.excluirAula(request, env, db, id);
  }

  return jsonErro('Endpoint de aula não encontrado.', 404);
}

/**
 * Roteia requisições do domínio de Avaliações (/api/avaliacoes/*)
 */
async function rotearAvaliacoes(partes, metodo, request, env, db) {
  // /api/avaliacoes/modulo/:moduloId
  if (partes.length === 4 && partes[2] === 'modulo') {
    const moduloId = partes[3];
    if (metodo === 'GET') return assessmentRoutes.listarAvaliacoesDoModulo(request, env, db, moduloId);
    if (metodo === 'POST') return assessmentRoutes.criarAvaliacao(request, env, db, moduloId);
  }

  // /api/avaliacoes/:id/responder
  if (partes.length === 4 && partes[3] === 'responder' && metodo === 'POST') {
    return assessmentRoutes.responderAvaliacao(request, env, db, partes[2]);
  }

  // /api/avaliacoes/:id
  if (partes.length === 3) {
    const id = partes[2];
    if (metodo === 'GET') return assessmentRoutes.obterAvaliacao(request, env, db, id);
    if (metodo === 'DELETE') return assessmentRoutes.excluirAvaliacao(request, env, db, id);
  }

  return jsonErro('Endpoint de avaliação não encontrado.', 404);
}

/**
 * Roteia requisições do domínio de Matrículas (/api/matriculas/*)
 */
async function rotearMatriculas(partes, metodo, request, env, db, url) {
  // /api/matriculas
  if (partes.length === 2) {
    if (metodo === 'GET') return enrollmentRoutes.listarMatriculas(request, env, db, url);
    if (metodo === 'POST') return enrollmentRoutes.matricularAluno(request, env, db);
  }

  // /api/matriculas/:id/cancelar
  if (partes.length === 4 && partes[3] === 'cancelar' && metodo === 'PATCH') {
    return enrollmentRoutes.cancelarMatricula(request, env, db, partes[2]);
  }

  return jsonErro('Endpoint de matrícula não encontrado.', 404);
}

/**
 * Roteia requisições do domínio de Certificados (/api/certificados/*)
 */
async function rotearCertificados(partes, metodo, request, env, db, url) {
  // /api/certificados/visualizar/:codigo
  if (partes.length === 4 && partes[2] === 'visualizar' && metodo === 'GET') {
    return certificateRoutes.visualizarCertificadoHtml(request, env, db, partes[3]);
  }

  // /api/certificados/validar/:codigo
  if (partes.length === 4 && partes[2] === 'validar' && metodo === 'GET') {
    return certificateRoutes.validarCertificadoPublico(request, env, db, partes[3]);
  }

  // /api/certificados
  if (partes.length === 2 && metodo === 'GET') {
    return certificateRoutes.listarCertificados(request, env, db);
  }

  // /api/certificados/emitir
  if (partes.length === 3 && partes[2] === 'emitir' && metodo === 'POST') {
    return certificateRoutes.emitirCertificado(request, env, db, url);
  }

  return jsonErro('Endpoint de certificado não encontrado.', 404);
}

/**
 * Roteia requisições do domínio de Dashboard (/api/dashboard/*)
 */
async function rotearDashboard(partes, metodo, request, env, db, url) {
  if (partes.length === 3 && partes[2] === 'indicadores' && metodo === 'GET') {
    return dashboardRoutes.obterIndicadores(request, env, db);
  }
  if (partes.length === 3 && partes[2] === 'linha-do-tempo' && metodo === 'GET') {
    return dashboardRoutes.obterLinhaDoTempo(request, env, db, url);
  }
  return jsonErro('Endpoint de dashboard não encontrado.', 404);
}

/**
 * Despacha a requisição para o roteador correspondente com base nos segmentos da URL.
 */
async function despacharRotaApi(partes, metodo, request, env, db, url) {
  const dominio = partes[1];

  if (dominio === 'health' && metodo === 'GET') {
    return jsonResponse({
      status: 'ok',
      servico: 'LMS BNCC Computação (Cloudflare Workers + D1)',
      database: 'Cloudflare D1',
      hora: new Date().toISOString(),
    });
  }

  switch (dominio) {
    case 'auth':
      return rotearAuth(partes, metodo, request, env, db);
    case 'usuarios':
      return rotearUsuarios(partes, metodo, request, env, db, url);
    case 'cursos':
      return rotearCursos(partes, metodo, request, env, db, url);
    case 'modulos':
      return rotearModulos(partes, metodo, request, env, db);
    case 'aulas':
      return rotearAulas(partes, metodo, request, env, db);
    case 'avaliacoes':
      return rotearAvaliacoes(partes, metodo, request, env, db);
    case 'matriculas':
      return rotearMatriculas(partes, metodo, request, env, db, url);
    case 'certificados':
      return rotearCertificados(partes, metodo, request, env, db, url);
    case 'dashboard':
      return rotearDashboard(partes, metodo, request, env, db, url);
    default:
      return jsonErro('Endpoint não encontrado.', 404);
  }
}

export default {
  /**
   * Ponto de entrada do Cloudflare Worker
   */
  async fetch(request, env) {
    const url = new URL(request.url);
    const rota = url.pathname;
    const metodo = request.method;

    // Trata CORS pré-voo
    if (metodo === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Serve o frontend estático se não for chamada de API
    if (!rota.startsWith('/api')) {
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }
      return new Response('Frontend não configurado. Binding ASSETS ausente no worker.', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', ...CORS_HEADERS },
      });
    }

    // Valida o banco D1
    const db = env.DB || env.lms_prod;
    if (!db) {
      return jsonErro(
        'Banco de dados Cloudflare D1 não configurado. Adicione o binding "DB" no arquivo wrangler.jsonc.',
        500,
      );
    }

    // Garante existência do admin padrão inicial
    try {
      await ensureDefaultAdmin(db);
    } catch {
      // Ignora erro inicial antes do schema
    }

    // Divide a URL em segmentos para roteamento didático sem regex
    const partes = rota.split('/').filter(Boolean);

    // Processa a rota da API com tratamento central de erros
    try {
      return await despacharRotaApi(partes, metodo, request, env, db, url);
    } catch (error) {
      if (error instanceof ErroHttp) {
        return jsonErro(error.message, error.status);
      }
      console.error(`Erro ao processar rota ${metodo} ${rota}:`, error);
      return jsonErro(error.message || 'Erro interno no servidor.', 500);
    }
  },
};

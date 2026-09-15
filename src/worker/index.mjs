/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - BACKEND SERVERLESS (CLOUDFLARE WORKERS + D1)
 * ============================================================================
 * Este é o ponto de entrada principal da API Serverless.
 * O fluxo de funcionamento foi desenhado para máxima clareza:
 *
 * 1. O método fetch() recebe a requisição HTTP.
 * 2. Trata requisições OPTIONS (CORS preflight).
 * 3. Se não for rota da API (/api/*), serve os arquivos estáticos de public/.
 * 4. Valida a conexão com o banco Cloudflare D1.
 * 5. Despacha para roteadores específicos por domínio (auth, cursos, etc.).
 * ============================================================================
 */

import {
  CORS_HEADERS,
  jsonResponse,
  jsonErro,
  ensureDefaultAdmin,
} from './helpers.mjs';

import * as authRoutes from './routes/authRoutes.mjs';
import * as courseRoutes from './routes/courseRoutes.mjs';
import * as moduleRoutes from './routes/moduleRoutes.mjs';
import * as lessonRoutes from './routes/lessonRoutes.mjs';
import * as assessmentRoutes from './routes/assessmentRoutes.mjs';
import * as enrollmentRoutes from './routes/enrollmentRoutes.mjs';
import * as certificateRoutes from './routes/certificateRoutes.mjs';
import * as userRoutes from './routes/userRoutes.mjs';
import * as dashboardRoutes from './routes/dashboardRoutes.mjs';

/**
 * Roteia requisições do domínio de Autenticação (/api/auth/*)
 */
async function rotearAuth(rota, metodo, request, env, db) {
  if (rota === '/api/auth/registrar' && metodo === 'POST') {
    return authRoutes.registrar(request, env, db);
  }
  if (rota === '/api/auth/login' && metodo === 'POST') {
    return authRoutes.login(request, env, db);
  }
  if (rota === '/api/auth/me' && metodo === 'GET') {
    return authRoutes.obterMeuPerfil(request, env, db);
  }
  if (rota === '/api/auth/alterar-senha' && metodo === 'POST') {
    return authRoutes.alterarSenha(request, env, db);
  }
  return jsonErro('Endpoint de autenticação não encontrado.', 404);
}

/**
 * Roteia requisições do domínio de Usuários (/api/usuarios/*)
 */
async function rotearUsuarios(rota, metodo, request, env, db, url) {
  if (rota === '/api/usuarios') {
    if (metodo === 'GET') return userRoutes.listarUsuarios(request, env, db, url);
    if (metodo === 'POST') return userRoutes.criarUsuario(request, env, db);
  }

  const matchRedefinir = rota.match(/^\/api\/usuarios\/(\d+)\/redefinir-senha$/);
  if (matchRedefinir && metodo === 'POST') {
    return userRoutes.redefinirSenhaUsuario(request, env, db, matchRedefinir[1]);
  }

  const matchId = rota.match(/^\/api\/usuarios\/(\d+)$/);
  if (matchId) {
    if (metodo === 'GET') return userRoutes.obterUsuarioPorId(request, env, db, matchId[1]);
    if (metodo === 'PUT') return userRoutes.atualizarUsuario(request, env, db, matchId[1]);
    if (metodo === 'DELETE') return userRoutes.desativarUsuario(request, env, db, matchId[1]);
  }

  return jsonErro('Endpoint de usuário não encontrado.', 404);
}

/**
 * Roteia requisições do domínio de Cursos (/api/cursos/*)
 */
async function rotearCursos(rota, metodo, request, env, db, url) {
  if (rota === '/api/cursos') {
    if (metodo === 'GET') return courseRoutes.listarCursos(request, env, db, url);
    if (metodo === 'POST') return courseRoutes.criarCurso(request, env, db);
  }

  const matchStatus = rota.match(/^\/api\/cursos\/(\d+)\/status$/);
  if (matchStatus && metodo === 'PATCH') {
    return courseRoutes.alterarStatusCurso(request, env, db, matchStatus[1]);
  }

  const matchId = rota.match(/^\/api\/cursos\/(\d+)$/);
  if (matchId) {
    if (metodo === 'GET') return courseRoutes.obterCurso(request, env, db, matchId[1]);
    if (metodo === 'PUT') return courseRoutes.atualizarCurso(request, env, db, matchId[1]);
    if (metodo === 'DELETE') return courseRoutes.excluirCurso(request, env, db, matchId[1]);
  }

  return jsonErro('Endpoint de curso não encontrado.', 404);
}

/**
 * Roteia requisições do domínio de Módulos (/api/modulos/*)
 */
async function rotearModulos(rota, metodo, request, env, db) {
  const matchCurso = rota.match(/^\/api\/modulos\/curso\/(\d+)$/);
  if (matchCurso) {
    if (metodo === 'GET') return moduleRoutes.listarModulosDoCurso(request, env, db, matchCurso[1]);
    if (metodo === 'POST') return moduleRoutes.criarModulo(request, env, db, matchCurso[1]);
  }

  const matchId = rota.match(/^\/api\/modulos\/(\d+)$/);
  if (matchId) {
    if (metodo === 'PUT') return moduleRoutes.atualizarModulo(request, env, db, matchId[1]);
    if (metodo === 'DELETE') return moduleRoutes.excluirModulo(request, env, db, matchId[1]);
  }

  return jsonErro('Endpoint de módulo não encontrado.', 404);
}

/**
 * Roteia requisições do domínio de Aulas (/api/aulas/*)
 */
async function rotearAulas(rota, metodo, request, env, db) {
  const matchModulo = rota.match(/^\/api\/aulas\/modulo\/(\d+)$/);
  if (matchModulo) {
    if (metodo === 'GET') return lessonRoutes.listarAulasDoModulo(request, env, db, matchModulo[1]);
    if (metodo === 'POST') return lessonRoutes.criarAula(request, env, db, matchModulo[1]);
  }

  const matchProgresso = rota.match(/^\/api\/aulas\/(\d+)\/progresso$/);
  if (matchProgresso && metodo === 'POST') {
    return lessonRoutes.atualizarProgressoAula(request, env, db, matchProgresso[1]);
  }

  const matchId = rota.match(/^\/api\/aulas\/(\d+)$/);
  if (matchId) {
    if (metodo === 'GET') return lessonRoutes.obterAula(request, env, db, matchId[1]);
    if (metodo === 'PUT') return lessonRoutes.atualizarAula(request, env, db, matchId[1]);
    if (metodo === 'DELETE') return lessonRoutes.excluirAula(request, env, db, matchId[1]);
  }

  return jsonErro('Endpoint de aula não encontrado.', 404);
}

/**
 * Roteia requisições do domínio de Avaliações (/api/avaliacoes/*)
 */
async function rotearAvaliacoes(rota, metodo, request, env, db) {
  const matchModulo = rota.match(/^\/api\/avaliacoes\/modulo\/(\d+)$/);
  if (matchModulo) {
    if (metodo === 'GET') return assessmentRoutes.listarAvaliacoesDoModulo(request, env, db, matchModulo[1]);
    if (metodo === 'POST') return assessmentRoutes.criarAvaliacao(request, env, db, matchModulo[1]);
  }

  const matchResponder = rota.match(/^\/api\/avaliacoes\/(\d+)\/responder$/);
  if (matchResponder && metodo === 'POST') {
    return assessmentRoutes.responderAvaliacao(request, env, db, matchResponder[1]);
  }

  const matchId = rota.match(/^\/api\/avaliacoes\/(\d+)$/);
  if (matchId) {
    if (metodo === 'GET') return assessmentRoutes.obterAvaliacao(request, env, db, matchId[1]);
    if (metodo === 'DELETE') return assessmentRoutes.excluirAvaliacao(request, env, db, matchId[1]);
  }

  return jsonErro('Endpoint de avaliação não encontrado.', 404);
}

/**
 * Roteia requisições do domínio de Matrículas (/api/matriculas/*)
 */
async function rotearMatriculas(rota, metodo, request, env, db, url) {
  if (rota === '/api/matriculas') {
    if (metodo === 'GET') return enrollmentRoutes.listarMatriculas(request, env, db, url);
    if (metodo === 'POST') return enrollmentRoutes.matricularAluno(request, env, db);
  }

  const matchCancelar = rota.match(/^\/api\/matriculas\/(\d+)\/cancelar$/);
  if (matchCancelar && metodo === 'PATCH') {
    return enrollmentRoutes.cancelarMatricula(request, env, db, matchCancelar[1]);
  }

  return jsonErro('Endpoint de matrícula não encontrado.', 404);
}

/**
 * Roteia requisições do domínio de Certificados (/api/certificados/*)
 */
async function rotearCertificados(rota, metodo, request, env, db, url) {
  if (rota.startsWith('/api/certificados/visualizar/') && metodo === 'GET') {
    const codigo = rota.split('/').at(-1);
    return certificateRoutes.visualizarCertificadoHtml(request, env, db, codigo);
  }

  if (rota.startsWith('/api/certificados/validar/') && metodo === 'GET') {
    const codigo = rota.split('/').at(-1);
    return certificateRoutes.validarCertificadoPublico(request, env, db, codigo);
  }

  if (rota === '/api/certificados' && metodo === 'GET') {
    return certificateRoutes.listarCertificados(request, env, db);
  }

  if (rota === '/api/certificados/emitir' && metodo === 'POST') {
    return certificateRoutes.emitirCertificado(request, env, db, url);
  }

  return jsonErro('Endpoint de certificado não encontrado.', 404);
}

/**
 * Roteia requisições do domínio de Dashboard (/api/dashboard/*)
 */
async function rotearDashboard(rota, metodo, request, env, db, url) {
  if (rota === '/api/dashboard/indicadores' && metodo === 'GET') {
    return dashboardRoutes.obterIndicadores(request, env, db);
  }
  if (rota === '/api/dashboard/linha-do-tempo' && metodo === 'GET') {
    return dashboardRoutes.obterLinhaDoTempo(request, env, db, url);
  }
  return jsonErro('Endpoint de dashboard não encontrado.', 404);
}

/**
 * Despacha a requisição para o roteador correspondente
 */
async function despacharRotaApi(rota, metodo, request, env, db, url) {
  if (rota === '/api/health' && metodo === 'GET') {
    return jsonResponse({
      status: 'ok',
      servico: 'LMS BNCC Computação (Cloudflare Workers + D1)',
      database: 'Cloudflare D1',
      hora: new Date().toISOString(),
    });
  }

  if (rota.startsWith('/api/auth')) return rotearAuth(rota, metodo, request, env, db);
  if (rota.startsWith('/api/usuarios')) return rotearUsuarios(rota, metodo, request, env, db, url);
  if (rota.startsWith('/api/cursos')) return rotearCursos(rota, metodo, request, env, db, url);
  if (rota.startsWith('/api/modulos')) return rotearModulos(rota, metodo, request, env, db);
  if (rota.startsWith('/api/aulas')) return rotearAulas(rota, metodo, request, env, db);
  if (rota.startsWith('/api/avaliacoes')) return rotearAvaliacoes(rota, metodo, request, env, db);
  if (rota.startsWith('/api/matriculas')) return rotearMatriculas(rota, metodo, request, env, db, url);
  if (rota.startsWith('/api/certificados')) return rotearCertificados(rota, metodo, request, env, db, url);
  if (rota.startsWith('/api/dashboard')) return rotearDashboard(rota, metodo, request, env, db, url);

  return jsonErro('Endpoint não encontrado.', 404);
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

    // Processa a rota da API
    return despacharRotaApi(rota, metodo, request, env, db, url);
  },
};

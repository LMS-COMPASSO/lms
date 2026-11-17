/**
 * ============================================================================
 * LMS BNCC COMPUTAÇÃO - CLIENTE HTTP E GERENCIADOR DE SESSÃO
 * ============================================================================
 * Este arquivo fornece funções simples para que as páginas do frontend
 * conversem com o backend através de requisições HTTP (API REST).
 *
 * Conceitos aplicados aqui:
 * 1. Armazenamento local (localStorage): guarda o token de acesso no navegador.
 * 2. Autenticação JWT: envia o token no cabeçalho "Authorization: Bearer <TOKEN>".
 * 3. Tratamento de sessão: se o servidor responder 401, desloga o usuário.
 * 4. Proteção de páginas: redireciona para o login quem não tiver sessão ativa.
 * ============================================================================
 */

// Define a URL base da API. Por padrão usa a rota relativa "/api"
const API_BASE = (window.LMS_API_BASE || '/api').replace(/\/$/, '');

/**
 * Retorna o token JWT salvo no navegador (ou null se não houver login).
 */
function obterToken() {
  return localStorage.getItem('lms_token');
}

/**
 * Retorna os dados do usuário logado (nome, email, perfil) salvos no navegador.
 */
function obterUsuario() {
  const dados = localStorage.getItem('lms_usuario');
  return dados ? JSON.parse(dados) : null;
}

/**
 * Salva os dados de autenticação após um login ou cadastro bem-sucedido.
 *
 * @param {string} token - Token JWT recebido do backend.
 * @param {object} usuario - Objeto com os dados do usuário.
 */
function salvarSessao(token, usuario) {
  localStorage.setItem('lms_token', token);
  localStorage.setItem('lms_usuario', JSON.stringify(usuario));
}

/**
 * Limpa a sessão do navegador e redireciona para a tela de login.
 */
function encerrarSessao() {
  localStorage.removeItem('lms_token');
  localStorage.removeItem('lms_usuario');
  window.location.href = '/login.html';
}

/**
 * Auxiliar interno para traduzir mensagens antes ou depois do carregamento do módulo i18n.js
 */
function traduzirApi(chave, padrao) {
  if (typeof window !== 'undefined' && typeof window.t === 'function') {
    return window.t(chave, {}, padrao);
  }
  return padrao;
}

const MAPA_ERROS_API_SERVIDOR = {
  'Email ou senha inválidos.': 'api.erroCredenciais',
  'Muitas tentativas de login. Aguarde antes de tentar novamente.': 'api.erroMuitasTentativas',
  'Este email já está cadastrado.': 'api.erroEmailCadastrado',
  'Este e-mail já está em uso.': 'api.erroEmailEmUso',
  'Todos os campos obrigatórios devem ser preenchidos.': 'api.erroCamposObrigatorios',
  'A senha deve ter pelo menos 6 caracteres.': 'api.erroSenhaCurta',
  'Senha atual incorreta.': 'api.erroSenhaAtual',
  'Acesso negado.': 'api.erroAcessoNegado',
  'Usuário não encontrado.': 'api.erroUsuarioNaoEncontrado',
  'Curso não encontrado.': 'api.erroCursoNaoEncontrado',
  'Token inválido ou expirado.': 'api.erroTokenInvalido',
  'Não autorizado.': 'api.erroNaoAutorizado',
};

function traduzirMensagemServidor(msg) {
  if (!msg || typeof msg !== 'string') return traduzirApi('api.erroServidor', 'Erro ao processar a solicitação no servidor.');
  const chave = MAPA_ERROS_API_SERVIDOR[msg.trim()];
  if (chave) return traduzirApi(chave, msg);
  return msg;
}

/**
 * Realiza uma chamada HTTP à API REST com envio automático do token JWT.
 *
 * @param {string} caminho - Rota da API (ex: '/cursos' ou '/auth/me').
 * @param {object} opcoes - Configurações do fetch (method, body, headers).
 * @returns {Promise<any>} Dados retornados pelo backend em formato JSON.
 */
async function api(caminho, opcoes = {}) {
  const token = obterToken();

  // Prepara os cabeçalhos da requisição
  const headers = {
    'Content-Type': 'application/json',
    ...opcoes.headers,
  };

  // Se houver um usuário logado, anexa o token JWT
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let resposta;
  try {
    resposta = await fetch(`${API_BASE}${caminho}`, { ...opcoes, headers });
  } catch {
    throw new Error(traduzirApi('api.erroConexao', 'Não foi possível conectar ao servidor. Verifique sua conexão à internet.'));
  }

  // Se a sessão autenticada expirou ou o token atual foi rejeitado, encerra a sessão
  const rotaPublicaAuth = caminho.startsWith('/auth/login')
    || caminho.startsWith('/auth/registrar')
    || caminho.startsWith('/auth/google');
  if (resposta.status === 401 && token && !rotaPublicaAuth) {
    encerrarSessao();
    throw new Error(traduzirApi('api.sessaoExpirada', 'Sessão expirada. Faça login novamente.'));
  }

  // Lê a resposta do backend
  const texto = await resposta.text();
  let dados = {};
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = { erro: texto.slice(0, 200) };
    }
  }

  // Se o status HTTP indicar erro (4xx ou 5xx), lança uma exceção com a mensagem
  if (!resposta.ok) {
    throw new Error(dados.erro ? traduzirMensagemServidor(dados.erro) : traduzirApi('api.erroServidor', 'Erro ao processar a solicitação no servidor.'));
  }

  return dados;
}

/**
 * Protege páginas internas: verifica se o usuário está logado e se possui o perfil necessário.
 * Redireciona automaticamente caso o acesso não seja autorizado.
 *
 * @param {Array<string>|null} perfisPermitidos - Lista de perfis autorizados (ex: ['administrador']).
 * @returns {object|null} Dados do usuário se autorizado.
 */
function exigirAutenticacao(perfisPermitidos = null) {
  const usuario = obterUsuario();
  if (!obterToken() || !usuario) {
    window.location.href = '/login.html';
    return null;
  }

  if (perfisPermitidos && !perfisPermitidos.includes(usuario.perfil)) {
    const destinoFallback = usuario.perfil === 'aluno' ? '/cursos.html' : '/dashboard.html';
    if (window.location.pathname !== destinoFallback) {
      window.location.href = destinoFallback;
    }
    return null;
  }

  return usuario;
}

/**
 * Formata uma data respeitando o idioma ativo (Intl.DateTimeFormat).
 *
 * @param {string|Date} dataStr - Data em formato ISO ou objeto Date.
 * @returns {string} Data formatada ou "-" se vazia.
 */
function formatarData(dataStr) {
  if (!dataStr) return '-';
  if (typeof window !== 'undefined' && window.LMS_I18N?.formatarData) {
    return window.LMS_I18N.formatarData(dataStr);
  }
  const data = new Date(dataStr);
  if (Number.isNaN(data.getTime())) return String(dataStr);
  const langDoc = typeof document !== 'undefined' ? (document.documentElement?.lang || 'pt-BR') : 'pt-BR';
  const dataFormatada = data.toLocaleDateString(langDoc);
  const horaFormatada = data.toLocaleTimeString(langDoc, { hour: '2-digit', minute: '2-digit' });
  return `${dataFormatada} ${horaFormatada}`;
}

/**
 * Escapa caracteres especiais de HTML para exibir com segurança textos cadastrados por usuários.
 *
 * @param {any} texto - Valor a ser exibido dentro de um HTML montado como texto.
 * @returns {string} Texto sem tags ou aspas que possam ser interpretadas pelo navegador.
 */
function escaparHtml(texto) {
  const substituicoes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(texto ?? '').replace(/[&<>"']/g, (caractere) => substituicoes[caractere]);
}

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
  window.location.href = '/index.html';
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
    throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão à internet.');
  }

  // Se a sessão expirou ou o token for inválido, redireciona para o login
  if (resposta.status === 401) {
    encerrarSessao();
    throw new Error('Sessão expirada. Faça login novamente.');
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
    throw new Error(dados.erro || 'Erro ao processar a solicitação no servidor.');
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
    window.location.href = '/index.html';
    return null;
  }

  if (perfisPermitidos && !perfisPermitidos.includes(usuario.perfil)) {
    window.location.href = '/dashboard.html';
    return null;
  }

  return usuario;
}

/**
 * Formata uma data no padrão brasileiro (DD/MM/AAAA HH:mm).
 *
 * @param {string} dataStr - String de data em formato ISO.
 * @returns {string} Data formatada ou "-" se vazia.
 */
function formatarData(dataStr) {
  if (!dataStr) return '-';
  const data = new Date(dataStr);
  const dataFormatada = data.toLocaleDateString('pt-BR');
  const horaFormatada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dataFormatada} ${horaFormatada}`;
}

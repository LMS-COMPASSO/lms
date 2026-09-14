// Wrapper simples para chamadas à API REST do LMS, com token JWT em localStorage
const API_BASE = (window.LMS_API_BASE || 'https://lms-api.thedelacosta.workers.dev/api').replace(/\/$/, '');

function obterToken() {
  return localStorage.getItem('lms_token');
}

function obterUsuario() {
  const dados = localStorage.getItem('lms_usuario');
  return dados ? JSON.parse(dados) : null;
}

function salvarSessao(token, usuario) {
  localStorage.setItem('lms_token', token);
  localStorage.setItem('lms_usuario', JSON.stringify(usuario));
}

function encerrarSessao() {
  localStorage.removeItem('lms_token');
  localStorage.removeItem('lms_usuario');
  window.location.href = '/index.html';
}

async function api(caminho, opcoes = {}) {
  const token = obterToken();
  const headers = { 'Content-Type': 'application/json', ...(opcoes.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let resposta;
  try {
    resposta = await fetch(`${API_BASE}${caminho}`, { ...opcoes, headers });
  } catch (error) {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
  }

  if (resposta.status === 401) {
    encerrarSessao();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const texto = await resposta.text();
  let dados = {};
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = { erro: texto.slice(0, 200) };
    }
  }

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro ao processar a solicitação.');
  }

  return dados;
}

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

function formatarData(dataStr) {
  if (!dataStr) return '-';
  const d = new Date(dataStr);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

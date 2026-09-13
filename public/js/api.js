// Wrapper simples para chamadas à API REST do LMS, com token JWT em localStorage
const API_BASE = '/api';

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

  const resposta = await fetch(`${API_BASE}${caminho}`, { ...opcoes, headers });

  if (resposta.status === 401) {
    encerrarSessao();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const dados = await resposta.json().catch(() => ({}));

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

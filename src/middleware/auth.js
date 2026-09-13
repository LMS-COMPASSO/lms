const { verificarToken } = require('../utils/jwt');

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de acesso não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verificarToken(token);
    req.usuario = payload; // { id, nome, email, perfil }
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

module.exports = autenticar;

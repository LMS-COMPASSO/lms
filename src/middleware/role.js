/**
 * Middleware factory para restringir rotas por perfil de usuário.
 * Uso: permitirPerfis('administrador', 'instrutor')
 */
function permitirPerfis(...perfisPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return res.status(403).json({
        erro: 'Acesso negado. Você não tem permissão para executar esta ação.',
      });
    }

    next();
  };
}

module.exports = permitirPerfis;

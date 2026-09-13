// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('Erro:', err.message);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ erro: 'Registro duplicado. Este dado já existe no sistema.' });
  }

  if (err.code && err.code.startsWith('ER_')) {
    return res.status(400).json({ erro: 'Erro ao processar a solicitação no banco de dados.' });
  }

  res.status(err.status || 500).json({
    erro: err.message || 'Erro interno do servidor.',
  });
}

module.exports = errorHandler;

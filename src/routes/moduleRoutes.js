const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const autenticar = require('../middleware/auth');
const permitirPerfis = require('../middleware/role');

router.use(autenticar);

router.get('/curso/:cursoId', moduleController.listarPorCurso);
router.post('/curso/:cursoId', permitirPerfis('administrador', 'instrutor'), moduleController.criar);
router.put('/:id', permitirPerfis('administrador', 'instrutor'), moduleController.atualizar);
router.delete('/:id', permitirPerfis('administrador', 'instrutor'), moduleController.excluir);

module.exports = router;

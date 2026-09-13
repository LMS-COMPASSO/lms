const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const autenticar = require('../middleware/auth');
const permitirPerfis = require('../middleware/role');

router.use(autenticar);

router.get('/', courseController.listar);
router.get('/:id', courseController.obter);
router.post('/', permitirPerfis('administrador', 'instrutor'), courseController.criar);
router.put('/:id', permitirPerfis('administrador', 'instrutor'), courseController.atualizar);
router.patch('/:id/status', permitirPerfis('administrador', 'instrutor'), courseController.alterarStatus);
router.delete('/:id', permitirPerfis('administrador', 'instrutor'), courseController.excluir);

module.exports = router;

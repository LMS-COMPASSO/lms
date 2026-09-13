const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const autenticar = require('../middleware/auth');
const permitirPerfis = require('../middleware/role');

router.use(autenticar);

router.get('/modulo/:moduloId', assessmentController.listarPorModulo);
router.get('/:id', assessmentController.obter);
router.post('/modulo/:moduloId', permitirPerfis('administrador', 'instrutor'), assessmentController.criar);
router.delete('/:id', permitirPerfis('administrador', 'instrutor'), assessmentController.excluir);
router.post('/:id/responder', permitirPerfis('aluno'), assessmentController.responder);

module.exports = router;

const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const autenticar = require('../middleware/auth');
const permitirPerfis = require('../middleware/role');

router.use(autenticar);

router.get('/modulo/:moduloId', lessonController.listarPorModulo);
router.get('/:id', lessonController.obter);
router.post('/modulo/:moduloId', permitirPerfis('administrador', 'instrutor'), lessonController.criar);
router.put('/:id', permitirPerfis('administrador', 'instrutor'), lessonController.atualizar);
router.delete('/:id', permitirPerfis('administrador', 'instrutor'), lessonController.excluir);
router.post('/:id/progresso', permitirPerfis('aluno'), lessonController.marcarProgresso);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const autenticar = require('../middleware/auth');
const permitirPerfis = require('../middleware/role');

router.use(autenticar, permitirPerfis('administrador'));

router.get('/', userController.listar);
router.get('/:id', userController.obter);
router.post('/', userController.criar);
router.put('/:id', userController.atualizar);
router.put('/:id/senha', userController.redefinirSenha);
router.delete('/:id', userController.excluir);

module.exports = router;

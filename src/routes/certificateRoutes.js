const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const autenticar = require('../middleware/auth');

router.get('/validar/:codigo', certificateController.validar); // pública, sem autenticação

router.use(autenticar);
router.get('/', certificateController.listar);
router.post('/emitir', certificateController.emitir);

module.exports = router;

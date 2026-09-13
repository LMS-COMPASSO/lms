const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const autenticar = require('../middleware/auth');

router.use(autenticar);

router.get('/', enrollmentController.listar);
router.post('/', enrollmentController.matricular);
router.patch('/:id/cancelar', enrollmentController.cancelar);

module.exports = router;

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const autenticar = require('../middleware/auth');
const permitirPerfis = require('../middleware/role');

router.use(autenticar, permitirPerfis('administrador', 'instrutor'));

router.get('/indicadores', dashboardController.indicadores);
router.get('/linha-do-tempo', dashboardController.linhaDoTempo);

module.exports = router;

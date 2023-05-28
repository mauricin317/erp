const { Router } = require('express');
const jwt = require('../jwt')
const router = Router();
const controller = require('../controllers/integraciones.controller');

//GET
router.get("/",jwt.ensureToken,controller.getIntegracion);
//POST
router.post("/",jwt.ensureToken,controller.createIntegracion);

module.exports = router;
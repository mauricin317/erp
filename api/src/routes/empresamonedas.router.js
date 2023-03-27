const { Router } = require('express');
const router = Router();
const jwt = require('../jwt')
const controller = require('../controllers/empresamonedas.controller');

//GET
router.get("/",jwt.ensureToken,controller.getEmpresamonedas);
//POST
router.post("/",jwt.ensureToken,controller.createEmpresamoneda);

module.exports = router;
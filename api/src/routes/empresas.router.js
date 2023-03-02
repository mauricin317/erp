const { Router } = require('express');
const jwt = require('../jwt')
const router = Router();
const controller = require('../controllers/empresas.controller');

//GET
router.get("/",jwt.ensureToken,controller.getEmpresas);
//DELETE
router.delete("/:idempresa",jwt.ensureToken,controller.deleteEmpresa);

module.exports = router;
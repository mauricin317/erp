const { Router } = require('express');
const jwt = require('../jwt')
const router = Router();
const controller = require('../controllers/empresas.controller');

//GET
router.get("/",jwt.ensureToken,controller.getEmpresas);
//POST
router.post("/",jwt.ensureToken,controller.createEmpresa);
//PUT
router.put("/:idempresa",jwt.ensureToken,controller.editEmpresa);
//DELETE
router.delete("/:idempresa",jwt.ensureToken,controller.deleteEmpresa);

module.exports = router;
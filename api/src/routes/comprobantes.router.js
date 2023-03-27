const { Router } = require('express');
const jwt = require('../jwt')
const router = Router();
const controller = require('../controllers/comprobantes.controller');

//GET
router.get("/",jwt.ensureToken,controller.getComprobantes);
router.get("/detalles/:idcomprobante",jwt.ensureToken,controller.getEmpresa);
//POST
router.post("/",jwt.ensureToken,controller.createEmpresa);
//PUT
router.put("/",jwt.ensureToken,controller.voidComprobante);
//DELETE


module.exports = router;
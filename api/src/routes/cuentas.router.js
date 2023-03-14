const { Router } = require('express');
const jwt = require('../jwt')
const router = Router();
const controller = require('../controllers/cuentas.controller');

//GET
router.get("/",jwt.ensureToken,controller.getCuentas);
router.get("/:idcuenta",jwt.ensureToken,controller.getCuenta);
router.get("/detalle",jwt.ensureToken,controller.getCuentaDetalle);
//POST
router.post("/",jwt.ensureToken,controller.createCuenta);
//PUT
router.put("/:idcuenta",jwt.ensureToken,controller.editCuenta);
//DELETE
router.delete("/:idcuenta",jwt.ensureToken,controller.deleteCuenta);

module.exports = router;
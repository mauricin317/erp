const { Router } = require('express');
const jwt = require('../jwt')
const router = Router();
const controller = require('../controllers/periodos.controller');

//GET
router.get("/",jwt.ensureToken,controller.getPeriodos);
router.get("/:idperiodo",jwt.ensureToken,controller.getPeriodo);
//POST
router.post("/",jwt.ensureToken,controller.createPeriodo);
//PUT
router.put("/:idperiodo",jwt.ensureToken,controller.editPeriodo);
//DELETE
router.delete("/:idperiodo",jwt.ensureToken,controller.deletePeriodo);

module.exports = router;
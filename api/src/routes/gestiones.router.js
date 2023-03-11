const { Router } = require('express');
const jwt = require('../jwt')
const router = Router();
const controller = require('../controllers/gestiones.controller');

//GET
router.get("/",jwt.ensureToken,controller.getGestiones);
router.get("/:idgestion",jwt.ensureToken,controller.getGestion);
router.get("/periodos/:idgestion",jwt.ensureToken,controller.getPeriodos);
//POST
router.post("/",jwt.ensureToken,controller.createGestion);
//PUT
router.put("/:idgestion",jwt.ensureToken,controller.editGestion);
//DELETE
router.delete("/:idgestion",jwt.ensureToken,controller.deleteGestion);

module.exports = router;
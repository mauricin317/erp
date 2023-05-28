const { Router } = require("express");
const jwt = require("../jwt");
const router = Router();
const controller = require("../controllers/categorias.controller");

//GET
router.get("/", jwt.ensureToken, controller.getCategorias);
//POST
router.post("/", jwt.ensureToken, controller.createCategoria);
//PUT
router.put("/:idcategoria", jwt.ensureToken, controller.editCategoria);
//DELETE
router.delete("/:idcategoria", jwt.ensureToken, controller.deleteCategoria);

module.exports = router;

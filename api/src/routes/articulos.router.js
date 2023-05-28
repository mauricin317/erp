const { Router } = require("express");
const jwt = require("../jwt");
const router = Router();
const controller = require("../controllers/articulos.controller");

//GET
router.get("/", jwt.ensureToken, controller.getArticulos);
//POST
router.post("/", jwt.ensureToken, controller.createArticulo);
//PUT
router.put("/:idarticulo", jwt.ensureToken, controller.editArticulo);
//DELETE
router.delete("/:idarticulo", jwt.ensureToken, controller.deleteArticulo);

module.exports = router;

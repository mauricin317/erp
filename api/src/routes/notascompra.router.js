const { Router } = require("express");
const jwt = require("../jwt");
const router = Router();
const controller = require("../controllers/notascompra.controller");

//GET
router.get("/", jwt.ensureToken, controller.getNotasCompra);
router.get("/articulos", jwt.ensureToken, controller.getNotasCompraArticulos);
router.get(
  "/detalles/:idnota",
  jwt.ensureToken,
  controller.getDetallesNotaCompra
);
//POST
router.post("/", jwt.ensureToken, controller.createNotasCompra);
//PUT
//router.put("/", jwt.ensureToken, controller.anularNotasCompra);

module.exports = router;

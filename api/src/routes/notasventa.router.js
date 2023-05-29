const { Router } = require("express");
const jwt = require("../jwt");
const router = Router();
const controller = require("../controllers/notasventa.controller");

//GET
router.get("/", jwt.ensureToken, controller.getNotasVenta);
router.get("/articulos", jwt.ensureToken, controller.getNotasVentaArticulos);
router.get(
  "/detalles/:idnota",
  jwt.ensureToken,
  controller.getDetallesNotaVenta
);
//POST
router.post("/", jwt.ensureToken, controller.createNotasVenta);
//PUT
router.put("/", jwt.ensureToken, controller.anularNotaVenta);

module.exports = router;

const { Router } = require("express");
const jwt = require("../jwt");
const router = Router();
const controller = require("../controllers/dashboard.controller");

//GET
router.get("/articulos", jwt.ensureToken, controller.getLimitArticulos);
router.get("/articulos-bajo-stock", jwt.ensureToken, controller.getLowStocks);
//POST

//PUT

//DELETE

module.exports = router;

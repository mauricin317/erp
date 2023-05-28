const { Router } = require("express");
const jwt = require("../jwt");
const router = Router();
const controller = require("../controllers/lotes.controller");

//GET
router.get("/:idarticulo", jwt.ensureToken, controller.getLotesArticulo);

module.exports = router;

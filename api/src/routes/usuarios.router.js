const { Router } = require('express');
const router = Router();
const controller = require('../controllers/usuarios.controller');
const jwt = require('../jwt')

//GET
router.get("/",controller.getUsers);
router.get("/session",jwt.ensureToken,controller.getSession);
//POST
router.post("/session",jwt.ensureToken,controller.setSession);
module.exports = router;
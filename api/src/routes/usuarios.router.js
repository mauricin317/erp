const { Router } = require('express');
const router = Router();
const controller = require('../controllers/usuarios.controller');


router.get("/",controller.getUsers);

module.exports = router;
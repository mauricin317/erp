const { Router } = require('express');
const router = Router();
const controller = require('../controllers/login.controller');

//POST
router.post("/",controller.validateUser);

module.exports = router;
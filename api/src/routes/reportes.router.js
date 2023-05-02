const { Router } = require('express');
const router = Router();
const controller = require('../controllers/reportes.controller');
const jwt = require('../jwt')

//GET
router.get("/",jwt.ensureToken , controller.getReportData);


//REPORTES PARA JASPER
router.get("/empresas", controller.getReporteEmpresas); //api/reportes/empresas


module.exports = router;
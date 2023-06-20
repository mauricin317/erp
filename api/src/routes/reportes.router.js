const { Router } = require("express");
const router = Router();
const controller = require("../controllers/reportes.controller");
const jwt = require("../jwt");

//GET
router.get("/", jwt.ensureToken, controller.getReportData);

//ENDPOINTS PARA JASPER
router.get("/empresas", controller.getReporteEmpresas); // api/reportes/empresas
router.get("/plan-cuentas", controller.getReportePlanCuentas); // api/reportes/plan-cuentas
router.get("/comprobante", controller.getReporteComprobante); // api/reportes/comprobante
router.get("/nota-compra", controller.getReporteNotaCompra); // api/reportes/comprobante
router.get("/nota-venta", controller.getReporteNotaVenta); // api/reportes/comprobante

router.get("/libro-diario", controller.getReporteLibroDiario); // api/reportes/libro-diario
router.get("/sumas-saldos", controller.getReporteSumasSaldos); // api/reportes/sumas-saldos
router.get("/libro-mayor-todos", controller.getReporteLibroMayorTodos); // api/reportes/libro-mayor-todos
router.get("/libro-mayor-periodo", controller.getReporteLibroMayorPeriodo); // api/reportes/libro-mayor-periodo
router.get("/articulos-bajo-stock", controller.getReporteArticulosBajoStock); // api/reportes/articulos-bajo-stock

module.exports = router;

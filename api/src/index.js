const express = require("express");
const cors = require("cors");

//import routes
var loginRouter = require("./routes/login.router");
var usuariosRouter = require("./routes/usuarios.router");
var empresasRouter = require("./routes/empresas.router");
var gestionesRouter = require("./routes/gestiones.router");
var periodosRouter = require("./routes/periodos.router");
var cuentasRouter = require("./routes/cuentas.router");
var empresamonedasRouter = require("./routes/empresamonedas.router");
var comprobantesRouter = require("./routes/comprobantes.router");
var reportesRouter = require("./routes/reportes.router");
var integracionesRouter = require("./routes/integraciones.router");
var categoriasRouter = require("./routes/categorias.router");
var articulosRouter = require("./routes/articulos.router");
var lotesRouter = require("./routes/lotes.router");
var notascompraRouter = require("./routes/notascompra.router");
var notasventaRouter = require("./routes/notasventa.router");

const app = express();
const PORT = 4000;

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//#####     ROUTER     #####
app.use("/api/login", loginRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/empresas", empresasRouter);
app.use("/api/gestiones", gestionesRouter);
app.use("/api/periodos", periodosRouter);
app.use("/api/cuentas", cuentasRouter);
app.use("/api/empresamonedas", empresamonedasRouter);
app.use("/api/comprobantes", comprobantesRouter);
app.use("/api/empresamonedas", empresamonedasRouter);
app.use("/api/reportes", reportesRouter);
app.use("/api/integracion", integracionesRouter);
app.use("/api/categorias", categoriasRouter);
app.use("/api/articulos", articulosRouter);
app.use("/api/lotes", lotesRouter);
app.use("/api/notascompra", notascompraRouter);
app.use("/api/notasventa", notasventaRouter);
// 404: Not found
app.use(function (req, res, next) {
  res.status(404).json({ ERROR: "Not found." });
});

// 500: Error reporting
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ ERROR: "Internal server error." });
});

//START server
app.listen(PORT, () =>
  console.log(`
🚀 Server ready at: http://localhost:${PORT}`)
);

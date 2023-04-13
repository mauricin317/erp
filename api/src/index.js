const express = require('express');
const cors = require('cors');

//import routes
var loginRouter = require('./routes/login.router');
var usuariosRouter = require('./routes/usuarios.router');
var empresasRouter = require('./routes/empresas.router');
var gestionesRouter = require('./routes/gestiones.router');
var periodosRouter = require('./routes/periodos.router');
var cuentasRouter = require('./routes/cuentas.router');
var empresamonedasRouter = require('./routes/empresamonedas.router');
var comprobantesRouter = require('./routes/comprobantes.router');


const app = express();
const PORT = 4000;

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//#####     ROUTER     #####
app.use('/api/login',loginRouter);
app.use('/api/usuarios',usuariosRouter);
app.use('/api/empresas',empresasRouter);
app.use('/api/gestiones',gestionesRouter);
app.use('/api/periodos',periodosRouter);
app.use('/api/cuentas',cuentasRouter);
app.use('/api/empresamonedas',empresamonedasRouter);
app.use('/api/comprobantes',comprobantesRouter);
app.use('/api/empresamonedas',empresamonedasRouter);
// 404: Not found
app.use(function(req, res, next){
  res.status(404).json({ERROR: 'Not found.'});
});

// 500: Error reporting
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).json({ERROR: 'Internal server error.'} );
});

//START server
app.listen(PORT, () =>
  console.log(`
🚀 Server ready at: http://localhost:${PORT}`),
)
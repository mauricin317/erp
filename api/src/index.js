const express = require('express');
const expressWinston = require('express-winston');
const winston = require('winston');
const cors = require('cors');

//import routes
var loginRouter = require('./routes/login.router');
var usuariosRouter = require('./routes/usuarios.router');
var empresasRouter = require('./routes/empresas.router');

const app = express();
const PORT = 4000;

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// express-winston logger makes sense BEFORE the router
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  )
}));

//#####     ROUTER     #####
app.use('/api/login',loginRouter);
app.use('/api/usuarios',usuariosRouter);
app.use('/api/empresas',empresasRouter);

// 404: Not found
app.use(function(req, res, next){
  res.status(404).json({ERROR: 'Not found.'});
});

// 500: Error reporing
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).json({ERROR: 'Internal server error.'} );
});

// express-winston errorLogger makes sense AFTER the router.
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  )
}));

//START server
app.listen(PORT, () =>
  console.log(`
🚀 Server ready at: http://localhost:${PORT}`),
)
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//routes
var usuariosRouter = require('./routes/usuarios.router');

app.use('/usuarios',usuariosRouter);

const server = app.listen(PORT, () =>
  console.log(`
🚀 Server ready at: http://localhost:${PORT}`),
)
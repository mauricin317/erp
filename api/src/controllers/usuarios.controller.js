const { PrismaClient } = require('@prisma/client')
const jwt = require("../jwt");

const prisma = new PrismaClient()

module.exports = {
    getUsers: async (req, res) => {
        try {
            const allUsers = await prisma.usuario.findMany()
            res.json(allUsers);
        } catch (error) {
            console.log(error.message);
            res.status(400).json({ok:false})
        }
    },
    getSession: async (req, res) => {
        try {
            const tokenData = req.user;
            res.json({ok:true, token:tokenData});
        } catch (error) {
            console.log(error.message);
            res.status(400).json({ok:false})
        }
    },
    setSession: async (req, res) => {
        try {
            const {idempresa} = req.body;
            const user = req.user;
            if(idempresa && user){
                tokenData = {
                    idusuario: user.idusuario,
                    nombre: user.nombre,
                    admin: user.admin,
                    idempresa: idempresa
                };
                const token = jwt.signToken(JSON.stringify(tokenData));
               return res.json({ ok: true, token: token });
              }else{
               return res.json({ ok: false });
              }
        } catch (error) {
            console.log(error.message);
            res.status(400).json({ok:false})
        }
    },
}
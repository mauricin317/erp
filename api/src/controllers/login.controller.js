const { PrismaClient } = require('@prisma/client')
const jwt = require("../jwt");

const prisma = new PrismaClient()

module.exports = {
    validateUser: async (req,res)=>{
        try {
            const { usuario = '',contraseña = '' } = req.body;
            const findUser = await prisma.usuario.findFirstOrThrow({
                where: {
                    usuario: usuario,
                    pass: contraseña,
                }
            })
            if(findUser){
                tokenData = {
                    idusuario: findUser.idusuario,
                    nombre: findUser.nombre,
                    admin: true,
                    idempresa: null
                };
                const token = jwt.signToken(JSON.stringify(tokenData));
                res.json({ok:true, token:token});
            }else{
                res.json({ok:false});
            } 
        } catch (error) {
            console.log("Error: ", error.message);
            if(error.message === "No usuario found")
                res.json({ok:false, message:'Login incorrecto'})
            else
                res.status(400).json({ok:false, message:'Bad Request'})
        }
    }
}
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = {
    getEmpresas: async (req,res)=>{
        try {
          const {idusuario} = req.user
          const findMonedas = await prisma.moneda.findMany({
            where:{
              idusuario: idusuario
            },
            orderBy:{
              idmoneda: "asc"
            }
          })
          if(findMonedas){
            const findEmpresas = await prisma.empresa.findMany({
              where: {
                idusuario:idusuario,
                estado:1,
              },
              include: {
                empresamoneda: {
                  where:{
                    activo: 1,
                  },
                  select: {
                    idmonedaprincipal: true,
                    idmonedaalternativa: true,
                  },
                }
              }
            })
            if(findEmpresas){
              return res.json({ok:true, data:findEmpresas, monedas:findMonedas});
            }else{
                return res.json({ok:true, data:[], monedas:findMonedas, mensaje:"No se encontraron empresas"})
            }
          }else{
            res.json({ok:true, data:[], monedas:[], mensaje:"No se encontraron monedas"})
          }
            res.json(allUsers);
        } catch (error) {
          console.log("Error: ", error.message);
          res.status(400).json({ok:false, message:'Bad Request'})
        }
    },
    deleteEmpresa: async (req,res)=>{
      try {
        
      } catch (error) {
        console.log("Error: ", error.message);
        res.status(400).json({ok:false, message:'Bad Request'})
      }
  },
}
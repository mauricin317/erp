const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = {
  getIntegracion: async (req,res)=>{
      try {
        const {idempresa} = req.user
        const findIntegracion = await prisma.integracion.findFirst({
          where: {
            idempresa: idempresa
          }
        })
        if(findIntegracion){
          return res.json({ok:true, data:findIntegracion, idempresa:idempresa});
        }else{
            return res.json({ok:false, data:[], mensaje:"No hay integracion configuradas"})
        }
      } catch (error) {
        console.log("Error: ", error.message);
        res.status(400).json({ok:false, mensaje:'Bad Request'})
      }
  },
  createIntegracion:async (req,res)=>{
    try {
      const {idempresa} = req.user
      let {caja, creditofiscal, debitofiscal, compras, ventas, it, itxpagar, estado} = req.body
      const updateIntegracion = await prisma.integracion.update({
        where: {
          idempresa: idempresa,
        },
        data:{
          caja: Number(caja),
          creditofiscal: Number(creditofiscal),
          debitofiscal: Number(debitofiscal),
          compras: Number(compras),
          ventas: Number(ventas),
          it: Number(it),
          itxpagar: Number(itxpagar),
          estado: Number(estado),
        }
      })
      if(updateIntegracion){
        return res.json({ok:true, data:updateIntegracion, mensaje:"Integracion Actualizada"});
      }else{
          return res.json({ok:false, mensaje:"Error al Actualizar datos"})
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:'Bad Request'})
    }
  },
}
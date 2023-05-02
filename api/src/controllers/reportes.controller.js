const { PrismaClient } = require('@prisma/client')
const jwt = require("../jwt");

const prisma = new PrismaClient()

module.exports = {
    getReportData: async (req, res) => {
        try {
          const {idempresa} = req.user
          const findEmpresamoneda = await prisma.$queryRaw`
          select idmoneda as id,idmoneda, m.nombre, idmonedaprincipal, idmonedaalternativa from moneda m left join empresamoneda e on e.idmonedaprincipal=m.idmoneda or e.idmonedaalternativa = m.idmoneda where e.activo=1 and idempresa=${idempresa}`
          if(findEmpresamoneda.length){
            const findGestiones = await prisma.gestion.findMany({
              where:{
                idempresa: idempresa
              },
              select:{
                idgestion: true,
                nombre: true
              }
            })
            if(findGestiones.length){
              const findPeriodos = await prisma.periodo.findMany({
                where:{
                  gestion:{
                    idempresa: idempresa
                  }
                },
                select:{
                  idperiodo: true,
                  nombre: true,
                  idgestion: true
                }
              })
              if(findGestiones.length){
                return res.json({ok:true, gestiones:findGestiones, periodos:findPeriodos, monedas:findEmpresamoneda})
              }else{
                return res.json({ok:false, gestiones:[], monedas:[], periodos:[], mensaje:"No existen Periodos"})
              }
            }else{
              return res.json({ok:false, gestiones:[], monedas:[], periodos:[], mensaje:"No existen Gestiones"})
            }
          }else{
            return res.json({ok:false, gestiones:[], monedas:[], periodos:[], mensaje:"No se han configurado monedas"})
          }
        } catch (error) {
          console.log("Error: ", error.message);
          res.status(400).json({ok:false, mensaje:'Bad Request'})
        }
    },
    getReporteEmpresas: async (req, res) => {
      try{
        console.log(req.query)
        let { idusuario } = req.query
        const findEmpresas = await prisma.$queryRaw`
          select empresa.*, usuario.usuario as nombreusuario from empresa join usuario on empresa.idusuario=usuario.idusuario where empresa.idusuario= ${Number(idusuario)} and empresa.estado=1 order by idempresa`
        if(findEmpresas.length){
          return res.json(findEmpresas)
        }else{
          res.status(400).json('No se encontraron resultados')
        }
      }catch(error) {
        console.log("Error: ", error.message);
        res.status(400).json({ok:false, mensaje:'Bad Request'})
      }
    }
}
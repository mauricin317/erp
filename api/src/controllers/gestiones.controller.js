const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = {
  getGestiones: async (req,res)=>{
      try {
        const {idempresa} = req.user
        const findGestiones = await prisma.gestion.findMany({
          where: {
            idempresa: idempresa
          },
          orderBy:{
            fechainicio: 'desc'
          }
          
        })
        if(findGestiones){
          return res.json({ok:true, data:findGestiones, idempresa:idempresa});
        }else{
            return res.json({ok:true, data:[], mensaje:"No se encontraron gestiones"})
        }
      } catch (error) {
        console.log("Error: ", error.message);
        res.status(400).json({ok:false, mensaje:'Bad Request'})
      }
  },
  getPeriodos: async (req,res)=>{
    try {
      const { idgestion } = req.params;
      const findPeriodos = await prisma.periodo.findMany({
        where: {
          idgestion: Number(idgestion),
        },
        orderBy:{
          fechainicio: 'desc'
        }
      })
      if(findPeriodos){
        return res.json({ok:true, data:findPeriodos});
      }else{
          return res.json({ok:true, data:[], mensaje:"No se encontraron periodos"})
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:'Bad Request'})
    }
  },
  getGestion: async (req,res)=>{
    try {
      const { idgestion } = req.params;
      const findeGestion = await prisma.gestion.findUnique({
        where: {
          idgestion:Number(idgestion),
        },
      })
      if(findeGestion){
        return res.json({ok:true, data:findeGestion});
      }else{
          return res.json({ok:true, data:[], mensaje:"No se encontró la gestión"})
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:'Bad Request'})
    }
  },
  createGestion: async (req,res)=>{
    try {
      const { idempresa, idusuario } = req.user
      let {nombre,fechainicio,fechafin} = req.body
      const validarNombre = await prisma.gestion.findFirst({
        where:{
          AND:[
            { nombre: nombre },
            { idempresa: idempresa },
          ],
        },
      })
      if(validarNombre){
        res.json({ok:false, mensaje:"Ya existe ese nombre de gestión"})
      }else{
        const validarFechas = await prisma.$queryRaw`
            SELECT * FROM gestion WHERE ((${fechainicio}::date BETWEEN fechainicio AND fechafin) OR (${fechafin}::date BETWEEN fechainicio AND fechafin)) AND idempresa = ${idempresa};
          `
        if(validarFechas.length){
          res.json({ok:false, mensaje:"No debe haber solapamiento con otras gestiones"})
        }else{
          const crearGestion = await prisma.gestion.create({
            data:{
              nombre,
              fechainicio: new Date(fechainicio),
              fechafin: new Date(fechafin),
              idusuario,
              idempresa
            },
          })
          if(crearGestion){
            res.json({ok:true, mensaje:'Gestión creada con éxito', data:crearGestion})
          }else{
            res.json({ok:false, mensaje:'Error al crear Gestión'})
          }
        }
        
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:'Bad Request'})
    }
  },
  editGestion: async (req,res)=>{
    try {
      const { idgestion } = req.params;
      const { idempresa, idusuario } = req.user
      let { nombre,fechainicio,fechafin } = req.body;
      const validarNombre = await prisma.gestion.findFirst({
        where:{
          nombre,
          idempresa,
          NOT:[ {idgestion: Number(idgestion)}]
        },
      })
      if(validarNombre){
        res.json({ok:false, mensaje:"Ya existe ese nombre de gestión"})
      }else{
        const validarFechas = await prisma.$queryRaw`
            SELECT * FROM gestion WHERE ((${fechainicio}::date BETWEEN fechainicio AND fechafin) OR (${fechafin}::date BETWEEN fechainicio AND fechafin)) AND idempresa = ${idempresa} AND idgestion!=${Number(idgestion)};
          `
        if(validarFechas.length){
          res.json({ok:false, mensaje:"No debe haber solapamiento con otras gestiones"})
        }else{
          const updateGestion = await prisma.gestion.update({
            where:{
              idgestion: Number(idgestion)
            },
            data:{
              nombre,
              fechainicio: new Date(fechainicio),
              fechafin: new Date(fechafin),
            },
          })
          if(updateGestion){
            return res.json({ok:true, mensaje:"Gestión modificada con Éxito", data:updateGestion})
          }else{
              return res.json({ok:false, mensaje:"No se pudo modificar la gestión"})
          }
        }
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:'Bad Request'})
    }
  },
  deleteGestion: async (req,res)=>{
    try {
      const { idgestion } = req.params;
      const { idempresa } = req.user

      const validarPeriodos = await prisma.periodo.findFirst({
        where:{
          idgestion: Number(idgestion)
        },
        select:{
          idperiodo: true
        }
      });
      if(validarPeriodos){
        res.json({ok:false, mensaje:"No se puede eliminar una gestion con periodos"})
      }else{
        const deleteGestion = await prisma.empresa.update({
          where:{
            idempresa: idempresa
          },
          data:{
            gestion:{
              delete:{
                idgestion: Number(idgestion)
              }
            }
          },
          include:{
            gestion: true
          }
        })
        if(deleteGestion){
          return res.json({ok:true, mensaje:"Eliminado con Éxito", data:deleteGestion.gestion})
        }else{
            return res.json({ok:false, mensaje:"Error al eliminar la gestión"})
        }
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:error.message})
    }
  },
}
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = {
  getPeriodos: async (req,res)=>{
      try {
        const { idempresa } = req.user
        const findPeriodos = await prisma.periodo.findMany({
          where: { 
            gestion:{
              empresa:{
                idempresa: idempresa
              }
          } }
        });
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
  getPeriodo: async (req,res)=>{
    try {
      const { idperiodo } = req.params;
      const findPeriodo = await prisma.periodo.findUnique({
        where: {
          idperiodo:Number(idperiodo),
        },
      })
      if(findPeriodo){
        return res.json({ok:true, data:findPeriodo});
      }else{
          return res.json({ok:true, data:[], mensaje:"No se encontró el periodo"})
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:'Bad Request'})
    }
  },
  createPeriodo: async (req,res)=>{
    try {
      const { idusuario } = req.user
      let { nombre,fechainicio,fechafin,idgestion } = req.body
      const validarNombre = await prisma.periodo.findFirst({
        where:{
          nombre, 
          idgestion: Number(idgestion)
        },
      })
      if( validarNombre ){
        res.json({ok:false, mensaje:"Ya existe un periodo con ese nombre en esta gestión"})
      }else{
        const validarFechas = await prisma.$queryRaw`
            SELECT * FROM periodo WHERE ((${fechainicio}::date BETWEEN fechainicio AND fechafin) OR (${fechafin}::date BETWEEN fechainicio AND fechafin)) AND idgestion=${Number(idgestion)};
          `
        if(validarFechas.length){
          res.json({ok:false, mensaje:"No debe haber solapamiento con otros periodos"})
        }else{
          const crearPeriodo = await prisma.periodo.create({
            data:{
              nombre,
              fechainicio: new Date(fechainicio),
              fechafin: new Date(fechafin),
              idusuario,
              idgestion: Number(idgestion)
            }
          })
          if(crearPeriodo){
            res.json({ok:true, mensaje:'Periodo creado con éxito', data:crearPeriodo})
          }else{
            res.json({ok:false, mensaje:'Error al crear periodo'})
          }
        }
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:'Bad Request'})
    }
  },
  editPeriodo: async (req,res)=>{
    try {
      const { idperiodo } = req.params;
      const { idempresa } = req.user
      let {nombre, fechainicio, fechafin, idgestion } = req.body;
      const validarNombre = await prisma.periodo.findFirst({
        where:{
          nombre,
          idgestion: Number(idgestion),
          NOT:[ {idperiodo: Number(idperiodo)}]
        },
      })
      if(validarNombre){
        res.json({ok:false, mensaje:"Ya existe otro periodo con ese nombre en esta gestión"})
      }else{
        const validarFechas = await prisma.$queryRaw`
            SELECT * FROM periodo WHERE ((${fechainicio}::date BETWEEN fechainicio AND fechafin) OR (${fechafin}::date BETWEEN fechainicio AND fechafin)) AND idgestion = ${Number(idgestion)} AND idperiodo!=${Number(idperiodo)};
          `
        if(validarFechas.length){
          res.json({ok:false, mensaje:"No debe haber solapamiento con otros periodos"})
        }else{
          const updatePeriodo = await prisma.periodo.update({
            where:{
              idperiodo: Number(idperiodo)
            },
            data:{
              nombre,
              fechainicio: new Date(fechainicio),
              fechafin: new Date(fechafin),
            },
          })
          if(updatePeriodo){
            return res.json({ok:true, mensaje:"Periodo modificado con Éxito", data:updatePeriodo})
          }else{
              return res.json({ok:false, mensaje:"No se pudo modificar el periodo"})
          }
        }
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:'Bad Request'})
    }
  },
  deletePeriodo: async (req,res)=>{
    try {
      const { idperiodo } = req.params;

      const deletePeriodo = await prisma.periodo.delete({
        where:{
          idperiodo: Number(idperiodo)
        },
      })
      if(deletePeriodo){
        return res.json({ok:true, mensaje:"Eliminado con Éxito", data:deletePeriodo})
      }else{
          return res.json({ok:false, mensaje:"Error al eliminar el periodo"})
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:error.message})
    }
  },
}
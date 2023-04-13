const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = {
  getComprobantes: async (req,res)=>{
      try {
        const { idusuario, idempresa } = req.user
        const findComprobantes = await prisma.comprobante.findMany({
          where: {
            idusuario,
            idempresa
          },
          orderBy:{
            serie: 'desc'
          },
          include: {
            moneda: true
          }
        })
        let mapComprobantes = [];
        if(findComprobantes){
          mapComprobantes = findComprobantes.map((comprobante, i) =>{
            return {
              ...comprobante,
              id: comprobante.idcomprobante,
              moneda: comprobante.moneda.nombre
            }
          })
        }
        const findTipoCambio = await prisma.empresamoneda.findFirst({
          where: {
            idempresa,
            activo: 1
          }
        })
        if(findTipoCambio){
          const findMonedas = await prisma.moneda.findMany({
            where:{
              OR:[
                {idmoneda:findTipoCambio.idmonedaprincipal},
                {idmoneda:findTipoCambio.idmonedaalternativa}
              ]
            }
          })
          return res.json({ok:true, data:mapComprobantes, tipo_cambio: findTipoCambio.cambio, monedas: findMonedas})
          
        }else{
          return res.json({ok:true, data:mapComprobantes, tipo_cambio: 1, monedas:[]})
        }
      } catch (error) {
        console.log("Error: ", error.message);
        return res.status(400).json({ok:false, mensaje:'Bad Request'})
      }
  },
  geDetalleComprobante: async (req,res)=>{
    try {
      const { idcomprobante } = req.params;
      const findMonedas = await prisma.comprobante.findFirst({
        where: {
          idcomprobante:Number(idcomprobante),
        },
        select:{
          idcomprobante: true,
          idmoneda: true,
          empresa:{
            select:{
              empresamoneda:{
                where:{
                  activo: 1
                },
                select:{
                  idmonedaprincipal: true,
                }
              }
            }
          }
        }
      })
      let strdebe = 'd.montodebe';
      let strhaber = 'd.montohaber';
      if(findMonedas?.idmoneda != findMonedas?.empresa?.empresamoneda[0]?.idmonedaprincipal){
        strdebe= 'd.montodebealt';
        strhaber='d.montohaberalt';
      }
      const findDetalleComprobante = await prisma.$queryRawUnsafe(`
        SELECT d.idcuenta AS id, d.idcuenta, concat(c.codigo,' - ', c.nombre) as cuenta, d.glosa, ${strdebe} AS debe, ${strhaber} AS haber FROM detallecomprobante d LEFT JOIN cuenta c ON c.idcuenta=d.idcuenta WHERE idcomprobante=${Number(idcomprobante)} ORDER BY d.numero;
      `)
      if(findDetalleComprobante.length){
        return res.json({ok:true, data:findDetalleComprobante});
      }else{
        return res.json({ok:false, data:[], mensaje:"No se encontraron detalles"})
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:'Bad Request'})
    }
  },
  createComprobante: async (req,res)=>{
    try {
      const { idusuario, idempresa } = req.user
      let { glosa, fecha, tc, tipocomprobante, idmoneda, detalles } = req.body

      if(Number(tipocomprobante) == 1){
        const findComprobanteApertura = await prisma.$queryRaw`
          SELECT * FROM comprobante c left join gestion g on c.idempresa=g.idempresa where tipocomprobante=1 AND c.idempresa=${idempresa} AND c.estado>=0 AND ${fecha}::date between fechainicio and fechafin LIMIT 1;
        `
        if(findComprobanteApertura.length){
          return res.json({ok:false, mensaje:"Ya existe un comprobante de apertura para esta gestión"})
        }
      }
      const validarFechas = await prisma.$queryRaw`
        SELECT * FROM periodo p LEFT JOIN gestion g ON p.idgestion=g.idgestion WHERE (${fecha}::date BETWEEN p.fechainicio AND p.fechafin) AND p.estado=1 AND g.idempresa=${idempresa} LIMIT 1
      `
      if(!validarFechas.length){
        return res.json({ok:false, mensaje:"La fecha no pertenece a un periodo abierto de la empresa"})
      }
      const findUltimaSerie = await prisma.empresa.findFirst({
        where:{
          idempresa: idempresa
        },
        select:{
          empresamoneda:{
            where:{
              activo: 1,
            },
            select:{
              idmonedaprincipal: true
            }
          },
          _count:{
            select:{
              comprobante: true
            }
          }
        }
      })
      let nueva_serie = 1;
      let idmonpri = 1;
      let tipo_cambio =  Number(tc);
      if(findUltimaSerie){
        nueva_serie = findUltimaSerie._count.comprobante + 1
        idmonpri = findUltimaSerie.empresamoneda[0].idmonedaprincipal
      }

      let detalles_format_create = detalles.map((d, i)=>{

        return {
          numero: i,
          glosa: d.glosa,
          montodebe: idmoneda == idmonpri ? d.debe : d.debe * tipo_cambio,
          montohaber: idmoneda == idmonpri ? d.haber : d.haber * tipo_cambio,
          montodebealt: idmoneda != idmonpri ? d.debe : d.debe / tipo_cambio,
          montohaberalt: idmoneda != idmonpri ? d.haber: d.haber / tipo_cambio,
          idusuario: idusuario,
          idcuenta: d.idcuenta,
        }
      })
      const createComprobante = await prisma.comprobante.create({
        data:{
          serie: nueva_serie,
          glosa: glosa,
          fecha: new Date(fecha),
          tc: tipo_cambio,
          estado: 1,
          tipocomprobante: Number(tipocomprobante),
          idusuario: idusuario,
          idmoneda: Number(idmoneda),
          idempresa: idempresa,
          detallecomprobante:{
            createMany: {
              data: detalles_format_create,
            }
          }
        }
      })
      if(createComprobante){
        return res.json({ok:true, mensaje:"Guardado con éxito", datos:createComprobante})
      }else{
        return res.json({ok:false, mensaje:'Ocurrio un error al crear comprobante'})
      }
      
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:'Bad Request'})
    }
  },
  voidComprobante: async (req,res)=>{
    try {
      const { idcomprobante,estado } = req.body;
      const { idempresa } = req.user
      const findNota = await prisma.nota.findFirst({
        where: {
          idcomprobante: Number(idcomprobante),
          idempresa
        }
      })
      if(findNota){
        return res.json({ok:false, mensaje:"Este comprobante pertenece a una nota, no se puede anular"})
      }else{
        const anularComprobante = await prisma.comprobante.update({
          where:{
            idcomprobante: Number(idcomprobante),
          },
          data:{
            estado: Number(estado)
          }
        })
        if(anularComprobante){
          return res.json({ok:true, mensaje:"Comprobante Anulado"})
        }else{
          return res.json({ok:false, mensaje:"Ocurrio un error al anular el comprobante"})
        }
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:'Bad Request'})
    }
  },
}
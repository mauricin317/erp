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
  getEmpresa: async (req,res)=>{
    try {
      const { idempresa } = req.params;
      const {idusuario} = req.user
      const findEmpresa = await prisma.empresa.findUnique({
        where: {
          idempresa:Number(idempresa),
        },
      })
      if(findEmpresa){
        return res.json({ok:true, data:findEmpresa});
      }else{
          return res.json({ok:true, data:[], mensaje:"No se encontró la empresa"})
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:'Bad Request'})
    }
  },
  createEmpresa: async (req,res)=>{
    try {
      const { idusuario } = req.user
      let { nombre,nit,sigla,telefono,correo,direccion,niveles,moneda } = req.body
      const findEmpresa = await prisma.empresa.findFirst({
        where:{
          OR:[
            { nombre: nombre },
            { nit: nit },
            { sigla: sigla },
          ],
          estado: 1
        },
      })
      if(findEmpresa){
        res.json({ok:false, mensaje:"Ya existe una empresa con esos datos"})
      }else{
        const crearEmpresa = await prisma.empresa.create({
          data:{
            nombre, nit, sigla, telefono, correo, direccion, niveles: Number(niveles), idusuario,
            empresamoneda: {
              create: [
                { activo:1, idmonedaprincipal: Number(moneda) },
              ]
            },
            integracion: {
              create:{  }
            }
          }
        })
        if(crearEmpresa){
          const generarCuentas = await prisma.$queryRaw`
            SELECT generar_cuentas_principales(${crearEmpresa.idempresa}::bigint, ${idusuario}::bigint, ${Number(niveles)}::int2) as total;
          `
            res.json({ok:true, mensaje:'Empresa creada con éxito', data:crearEmpresa})
        }else{
          res.json({ok:false, mensaje:'Error al crear empresa'})
        }
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:'Bad Request'})
    }
  },
  editEmpresa: async (req,res)=>{
    try {
      const { idempresa } = req.params;
      const { idusuario } = req.user;
      let { nombre,nit,sigla,telefono,correo,direccion,moneda } = req.body;

      const findEmpresaMoneda = await prisma.empresamoneda.findFirst({
        where:{
          idempresa: Number(idempresa),
          activo: 1
        },
      });

      const findEmpresa = await prisma.empresa.findFirst({
        where:{
          OR:[
            { nombre: nombre },
            { nit: nit },
            { sigla: sigla },
          ],
          estado: 1,
          NOT:[{
            idempresa: Number(idempresa)
          }]
        },
      })
      if(findEmpresa){
        res.json({ok:false, mensaje:"Ya existe una empresa con esos datos"})
      }else{
        const updateEmpresa = await prisma.usuario.update({
          where:{
            idusuario: idusuario
          },
          data:{
            empresa:{
              update:{
                where:{
                  idempresa: Number(idempresa)
                },
                data:{
                  nombre, nit, sigla, telefono, correo, direccion,
                  empresamoneda:{
                    update:{
                      where:{
                        idempresamoneda: findEmpresaMoneda.idempresamoneda
                      },
                      data:{
                        idmonedaprincipal: Number(moneda)
                      }
                    }
                  }
                }
              }
            }
          },
          include: { empresa: true }
        })
        if(updateEmpresa){
          const empresa = updateEmpresa.empresa.filter(emp => emp.idempresa = idempresa)[0]
          return res.json({ok:true, mensaje:"Empresa modificada con Éxito", data:empresa})
        }else{
            return res.json({ok:false, mensaje:"No se pudo eliminar la empresa"})
        }
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
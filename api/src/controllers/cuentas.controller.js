const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = {
  getCuentas: async (req,res)=>{
      try {
        const {idempresa} = req.user
        const findCuentas = await prisma.empresa.findFirst({
          where: {
            idempresa: idempresa
          },
          select:{
            cuenta: {
              orderBy:{
                codigo: 'asc'
              }
            },
          }
          
        })
        if(findCuentas){
          return res.json({ok:true, data:findCuentas.cuenta, niveles:findCuentas.niveles, idempresa:idempresa});
        }else{
            return res.json({ok:false, data:[], mensaje:"No se encontraron Cuentas"})
        }
      } catch (error) {
        console.log("Error: ", error.message);
        res.status(400).json({ok:false, mensaje:'Bad Request'})
      }
  },
  getCuenta: async (req,res)=>{
    try {
      const { idcuenta } = req.params;
      const findCuenta = await prisma.cuenta.findUnique({
        where: {
          idcuenta:Number(idcuenta),
        },
      })
      if(findCuenta){
        return res.json({ok:true, data:findCuenta});
      }else{
          return res.json({ok:true, data:[], mensaje:"No se encontró la cuenta"})
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:'Bad Request'})
    }
  },
  getCuentaDetalle: async (req,res)=>{
    try {
      const { idempresa, idusuario } = req.user
      const fidCuentasDetalle = await prisma.$queryRaw`
      SELECT idcuenta as id, *,concat(codigo,' - ', nombre) as label  FROM cuenta WHERE idempresa=${idempresa} AND tipocuenta=1 ORDER BY replace(codigo, '.', '')::int ASC;
      `
    if(fidCuentasDetalle.length){
        return res.json({ok:true, data:fidCuentasDetalle});
      }else{
          return res.json({ok:true, data:[], mensaje:"No se encontró la gestión"})
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:'Bad Request'})
    }
  },
  createCuenta: async (req,res)=>{
    try {
      const { idempresa, idusuario } = req.user
      let { codigo, nombre, nivel, tipocuenta, idcuentapadre } = req.body
      const validarNombre = await prisma.cuenta.findFirst({
        where:{
          nombre: {
            equals: nombre,
            mode: 'insensitive',
          },
          idempresa,
        },
      })
      if(validarNombre){
        res.json({ok:false, mensaje:"Ya existe ese nombre de Cuenta"})
      }else{

        let ultimaCuenta;
        if(idcuentapadre != null){
          ultimaCuenta = await prisma.cuenta.findFirst({
            where:{
              idcuentapadre: Number(idcuentapadre)
            },
            orderBy:{
              codigo: 'desc'
            }
          })
        }else{
          ultimaCuenta = await prisma.cuenta.findFirst({
            where:{
              nivel: 1,
              idempresa
            },
            orderBy:{
              codigo: 'desc'
            }
          })
        }
        let codigoNuevo;
        if(ultimaCuenta){
          let codigoPadre = ultimaCuenta.codigo
          codigoNuevo = (codigoPadre.split('.').map((num, i) => i==(nivel-1)? (parseInt(num)+1)+'' : num)).join('.')
        }else{
          codigoNuevo = codigo
        }

        const crearCuenta = await prisma.empresa.update({
          where: { idempresa: idempresa },
          data:{
            cuenta:{
              create:{
                codigo: codigoNuevo,
                nombre,
                nivel: Number(nivel),
                tipocuenta: Number(tipocuenta),
                idusuario: idusuario,
                idcuentapadre: idcuentapadre ? Number(idcuentapadre) : null
              }
            }
          }
        })
        if(crearCuenta){
          return res.json({ok:true, data: crearCuenta})
      }else{
          return res.json({ok:false, mensaje:"Error al crear Cuenta"})
      }
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:'Bad Request'})
    }
  },
  editCuenta: async (req,res)=>{
    try {
      const { idcuenta } = req.params;
      const { idempresa, idusuario } = req.user
      let { nombre } = req.body;
      const validarNombre = await prisma.cuenta.findFirst({
        where:{
          nombre: {
            equals: nombre,
            mode: 'insensitive'
          },
          idempresa,
          NOT:[ {idcuenta: Number(idcuenta)}]
        },
      })
      if(validarNombre){
        res.json({ok:false, mensaje:"Ya existe ese nombre de cuenta"})
      }else{
        const updateCuenta = await prisma.cuenta.update({
          where:{
            idcuenta: Number(idcuenta)
          },
          data:{
            nombre
          }
        })
        if(updateCuenta){
          return res.json({ok:true, data: updateCuenta})
        }else{
            return res.json({ok:false, mensaje:"No se pudo actualizar la cuenta"})
        }
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:'Bad Request'})
    }
  },
  deleteCuenta: async (req,res)=>{
    try {
      const { idcuenta } = req.params;
      const { idempresa } = req.user

      const validarComprobantes = await prisma.detallecomprobante.findFirst({
        where:{
          idcuenta: Number(idcuenta)
        },
        select:{
          iddetallecomprobante: true
        }
      });
      if(validarComprobantes){
        res.json({ok:false, mensaje:"No se puede eliminar porque existen comprobantes con esta cuenta"})
      }else{
        const validarIntegracion = await prisma.integracion.findFirst({
          where:{
            OR:[
              { caja: Number(idcuenta) },
              { creditofiscal: Number(idcuenta) },
              { debitofiscal: Number(idcuenta) },
              { compras: Number(idcuenta) },
              { ventas: Number(idcuenta) },
              { it: Number(idcuenta) },
              { itxpagar: Number(idcuenta) },
            ],
          },
          select:{
            idempresa: true
          }
        });
        if(validarComprobantes){
          res.json({ok:false, mensaje:"No se puede eliminar porque a cuenta es parte de las cuentas de integracion"})
        }else{
          const deleteGestion = await prisma.empresa.update({
            where:{
              idempresa: idempresa
            },
            data:{
              cuenta:{
                delete:{
                  idcuenta: Number(idcuenta)
                }
              }
            },
            include:{
              cuenta: true
            }
          })
          if(deleteGestion){
            return res.json({ok:true, mensaje:"Eliminado con Éxito", data:deleteGestion.cuenta})
          }else{
              return res.json({ok:false, mensaje:"Error al eliminar la cuenta"})
          }
        }
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:error.message})
    }
  },
}
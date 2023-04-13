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
      } catch (error) {
        console.log("Error: ", error.message);
        res.status(400).json({ok:false, mensaje:'Bad Request'})
      }
  },
  getEmpresa: async (req,res)=>{
    try {
      const { idempresa } = req.params;
      if(isNaN(idempresa)){
       return res.json({ok:false, mensaje:'No ha seleccionado una empresa'})
      }
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
  deleteEmpresa: async (req,res)=>{
    try {
      const { idempresa } = req.params;
      const { idusuario } = req.user
      const deleteEmpresa = await prisma.usuario.update({
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
                estado: 0
              }
            }
          }
        },
        include: { empresa: true }
      })
      if(deleteEmpresa){
        const empresa = deleteEmpresa.empresa.filter(emp => emp.idempresa = idempresa)[0]
        return res.json({ok:true, mensaje:"Eliminado con Éxito", data:empresa})
      }else{
          return res.json({ok:false, mensaje:"No se pudo eliminar la empresa"})
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ok:false, mensaje:'Bad Request'})
    }
  },
}
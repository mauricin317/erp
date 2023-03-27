const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = {
    getEmpresamonedas: async (req,res)=>{
        try {
            const { idempresa, idusuario } = req.user
            const findMonedas = await prisma.moneda.findMany({
                where: {
                    idusuario: idusuario
                },
                orderBy: {
                    idmoneda: "asc"
                }
            })
            if(findMonedas){
                const findEmpresamonedas = await prisma.$queryRaw`
                SELECT e.idempresamoneda as id, e.*, mo.nombre as monedaprincipal,(SELECT nombre from moneda where idmoneda=e.idmonedaalternativa) as monedaalternativa FROM empresamoneda e JOIN moneda mo on mo.idmoneda=e.idmonedaprincipal WHERE idempresa=${idempresa} ORDER BY fecharegistro DESC;
                `
                const countComprobantes = await prisma.comprobante.count({
                    where:{
                        idempresa: idempresa
                    }
                })
                if(findEmpresamonedas.length){    
                    res.json({ok:true, data:findEmpresamonedas, monedas:findMonedas, comprobantes_count:countComprobantes})
                }else{
                    res.json({ok:true, data:[], monedas:findMonedas, mensaje:"No se encontraron registros"})
                } 
            }else{
                res.json({ok:true, data:[], monedas:[], mensaje:"No se encontraron monedas"});
            } 
            
        } catch (error) {
            console.log("Error: ", error.message);
            if(error.message === "No usuario found")
                res.json({ok:false, mensaje:'Login incorrecto'})
            else
                res.status(400).json({ok:false, mensaje:'Bad Request'})
        }
    },
    createEmpresamoneda: async (req,res)=>{
        try {
            const { idempresamoneda,idmonedaalternativa, cambio } = req.body
            const { idempresa, idusuario } = req.user
            const editarEmpresamoneda = await prisma.empresamoneda.update({
                where:{
                    idempresamoneda: Number(idempresamoneda)
                },
                data:{
                    activo: 0
                }
            })
            if(editarEmpresamoneda){
                const crearEmpresamoneda = await prisma.empresamoneda.create({
                    data:{
                        activo:1,
                        idempresa: idempresa,
                        idmonedaprincipal: editarEmpresamoneda.idmonedaprincipal,
                        idmonedaalternativa: Number(idmonedaalternativa),
                        cambio: cambio,
                        idusuario: idusuario
                    }
                })
                if(crearEmpresamoneda){
                    res.json({ok:true, mensaje:"moneda actualizada exitosamente"})    
                }else{
                    res.json({ok:false, mensaje:"Error al crear empresamoneda"})    
                }
            }else{
                res.json({ok:false, mensaje:"Error al actualizar empresamoneda"})
            }
        } catch (error) {
            console.log("Error: ", error.message);
            res.status(400).json({ok:false, mensaje:'Bad Request'})
        }
    }
}
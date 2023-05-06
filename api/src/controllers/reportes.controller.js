const { PrismaClient } = require('@prisma/client')

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
        let { idusuario } = req.query
        const findEmpresas = await prisma.$queryRaw`
        SELECT empresa.*, usuario.usuario AS nombreusuario 
        FROM empresa JOIN usuario ON empresa.idusuario=usuario.idusuario 
        WHERE empresa.idusuario= ${Number(idusuario)} AND empresa.estado=1 ORDER BY idempresa
        `
        if(findEmpresas){
          return res.json(findEmpresas)
        }else{
          res.status(400).json('No se encontraron resultados')
        }
      }catch(error) {
        console.log("Error: ", error.message);
        res.status(400).json({ok:false, mensaje:'Bad Request'})
      }
    },
    getReportePlanCuentas: async (req, res) => {
      try{
        let { idempresa } = req.query
        const findDatos = await prisma.$queryRaw`
        SELECT cuenta.*, empresa.nombre AS empresa, usuario.usuario AS nombreusuario FROM cuenta 
        JOIN empresa ON cuenta.idempresa=empresa.idempresa
        JOIN usuario ON cuenta.idusuario=usuario.idusuario
        WHERE cuenta.idempresa=${Number(idempresa)} ORDER BY cuenta.codigo asc;
        `
        if(findDatos){
          return res.json(findDatos)
        }else{
          res.status(400).json('No se encontraron resultados')
        }
      }catch(error) {
        console.log("Error: ", error.message);
        res.status(400).json({ok:false, mensaje:'Bad Request'})
      }
    },
    getReporteComprobante: async (req, res) => {
      try{
        let { idcomprobante } = req.query
        const findDatos = await prisma.$queryRaw`
        SELECT c.serie, u.usuario AS nombreusuario,	e.nombre AS empresa, c.glosa AS glosa_c, c.fecha, c.tc,	c.idmoneda AS idmoneda, em.idmonedaprincipal AS idmonpri,
          c.tipocomprobante, m.nombre AS moneda, m.abreviatura AS simbolo, c.estado, d.numero, d.glosa AS glosa_d, d.montodebe, d.montohaber, d.montodebealt,	d.montohaberalt, CONCAT( cu.codigo,' - ',cu.nombre) AS cuenta
        FROM detallecomprobante d
          LEFT JOIN comprobante c ON 
          c.idcomprobante = d.idcomprobante 
          LEFT JOIN moneda m ON 
          m.idmoneda = c.idmoneda 
          LEFT JOIN empresamoneda em ON
          em.idempresa = c.idempresa
          LEFT JOIN cuenta cu ON 
          cu.idcuenta = d.idcuenta 
          LEFT JOIN empresa e ON 
          c.idempresa = e.idempresa 
          LEFT JOIN usuario u ON 
          c.idusuario = u.idusuario 
        WHERE 
          c.idcomprobante=${Number(idcomprobante)} AND em.activo=1;
        `
        if(findDatos){
          return res.json(findDatos)
        }else{
          res.status(400).json('No se encontraron resultados')
        }
      }catch(error) {
        console.log("Error: ", error.message);
        res.status(400).json({ok:false, mensaje:'Bad Request'})
      }
    },
    getReporteLibroDiario: async (req, res) => {
      try{
        let { idmoneda, idperiodo, idgestion } = req.query
        const findDatos = await prisma.$queryRaw`
        SELECT c.serie, 0 AS numero, c.fecha, m.nombre AS moneda, e.nombre AS empresa, c.glosa AS glosaC, g.nombre AS gestion, p.nombre AS periodo,	CONCAT( cu.codigo,' - ',cu.nombre) AS nombrecuenta,
          m.abreviatura AS simbolo, 0 AS sumadebe, 0 AS sumahaber, 0 AS sumadebealt, 0 AS sumahaberalt, u.usuario AS nombreusuario, em.idmonedaprincipal AS idmonpri
        FROM detallecomprobante d
          LEFT JOIN comprobante c ON d.idcomprobante = c.idcomprobante 
          LEFT JOIN moneda m ON m.idmoneda = ${Number(idmoneda)} 
          LEFT JOIN cuenta cu ON d.idcuenta = cu.idcuenta 
          LEFT JOIN empresa e ON cu.idempresa = e.idempresa 
          LEFT JOIN gestion g ON g.idempresa = e.idempresa 
          LEFT JOIN periodo p ON p.idgestion = g.idgestion AND c.fecha BETWEEN p.fechainicio AND p.fechafin 
          LEFT JOIN empresamoneda em ON em.idempresa = e.idempresa 
          LEFT JOIN usuario u ON u.idusuario = e.idusuario
        WHERE c.estado>=0 AND  em.activo=1 AND (p.idperiodo=${Number(idperiodo)}  OR g.idgestion=${Number(idgestion)} ) AND d.numero=1
        GROUP BY m.nombre, e.nombre, g.nombre, p.nombre, nombrecuenta, c.fecha, c.glosa, d.numero, m.abreviatura, c.serie, idmonpri, u.usuario
          UNION
        SELECT c.serie, d.numero, c.fecha, m.nombre AS moneda, e.nombre AS empresa, c.glosa AS glosaC, g.nombre AS gestion,	p.nombre AS periodo, Concat( cu.codigo,' - ',cu.nombre) AS nombrecuenta,
          m.abreviatura AS simbolo, SUM( d.montodebe) AS sumadebe, SUM( d.montohaber) AS sumahaber, SUM( d.montodebealt) AS sumadebealt, SUM( d.montohaberalt) AS sumahaberalt, u.usuario AS nombreusuario, em.idmonedaprincipal AS idmonpri
        FROM detallecomprobante d
          LEFT JOIN comprobante c ON d.idcomprobante = c.idcomprobante 
          LEFT JOIN moneda m ON m.idmoneda = ${Number(idmoneda)} 
          LEFT JOIN cuenta cu ON d.idcuenta = cu.idcuenta 
          LEFT JOIN empresa e ON cu.idempresa = e.idempresa 
          LEFT JOIN gestion g ON g.idempresa = e.idempresa 
          LEFT JOIN periodo p ON p.idgestion = g.idgestion AND c.fecha BETWEEN p.fechainicio AND p.fechafin 
          LEFT JOIN empresamoneda em ON em.idempresa = e.idempresa 
          LEFT JOIN usuario u ON u.idusuario = e.idusuario
        WHERE c.estado>=0 AND  em.activo=1 AND (p.idperiodo=${Number(idperiodo)}  OR g.idgestion=${Number(idgestion)} )
        GROUP BY m.nombre, e.nombre, g.nombre, p.nombre, nombrecuenta, c.fecha, c.glosa, d.numero, m.abreviatura, c.serie, idmonpri, u.usuario
        ORDER BY fecha , serie, numero;
        `
        if(findDatos){
          return res.json(findDatos)
        }else{
          res.status(400).json('No se encontraron resultados')
        }
      }catch(error) {
        console.log("Error: ", error.message);
        res.status(400).json({ok:false, mensaje:'Bad Request'})
      }
    },
    getReporteSumasSaldos: async (req, res) => {
      try{
        let { idmoneda, idgestion } = req.query
        const findDatos = await prisma.$queryRaw`
        SELECT CONCAT(cu.codigo,' - ',cu.nombre) AS cuenta, SUM(d.montodebe) AS sumdebe, SUM(d.montohaber) AS sumhaber, SUM(d.montodebealt) AS sumdebealt, SUM(d.montohaberalt) AS sumhaberalt,
          CASE WHEN SUM(d.montodebe-d.montohaber)<=0 THEN 0 ELSE SUM(d.montodebe-d.montohaber) END AS saldodebe, 
          CASE WHEN SUM(d.montohaber - d.montodebe)<=0 THEN 0 ELSE SUM(d.montohaber - d.montodebe) END AS saldohaber,
          CASE WHEN SUM(d.montodebealt-d.montohaberalt)<=0 THEN 0 ELSE SUM(d.montodebealt-d.montohaberalt) END AS saldodebealt, 
          CASE WHEN SUM(d.montohaberalt - d.montodebealt)<=0 THEN 0 ELSE SUM(d.montohaberalt - d.montodebealt) END AS saldohaberalt,
          g.nombre AS gestion, m.nombre AS moneda, m.abreviatura AS simbolo, em.idmonedaprincipal AS idmonpri, e.nombre AS empresa, u.usuario AS nombreusuario
        FROM detallecomprobante d 
          LEFT JOIN comprobante c ON d.idComprobante = c.idcomprobante
          LEFT JOIN gestion g ON g.idempresa = c.idempresa 
          LEFT JOIN cuenta cu ON d.idcuenta = cu.idcuenta				   
          LEFT JOIN empresa e ON cu.idempresa = e.idempresa			
          LEFT JOIN usuario u ON u.idusuario = 1
          LEFT JOIN empresamoneda em ON em.idempresa = e.idempresa
          LEFT JOIN moneda m ON m.idmoneda=${Number(idmoneda)}  
        WHERE g.idgestion=${Number(idgestion)}   AND (((c.fecha) Between g.FechaInicio And g.FechaFin) And (c.estado!='-1')) AND ((em.Activo)=1)
        GROUP BY cuenta, e.nombre, u.usuario, g.nombre, m.nombre, m.abreviatura, em.idmonedaprincipal;
        `
        if(findDatos){
          return res.json(findDatos)
        }else{
          res.status(400).json('No se encontraron resultados')
        }
      }catch(error) {
        console.log("Error: ", error.message);
        res.status(400).json({ok:false, mensaje:'Bad Request'})
      }
    },
    getReporteLibroMayorTodos: async (req, res) => {
      try{
        let { idmoneda, idgestion, idperiodo } = req.query
        const findDatos = await prisma.$queryRaw`
        SELECT tab.*, 
          SUM(CASE WHEN debe<>0 THEN debe ELSE haber*(-1) END) 
          OVER (PARTITION BY tab.cuenta ORDER BY tab.fecha) AS saldo,
          SUM(CASE WHEN debealt<>0 THEN debealt ELSE haberalt*(-1) END) 
          OVER (PARTITION BY tab.cuenta ORDER BY tab.fecha) AS saldoalt
        FROM (SELECT DISTINCT ON (c2.idcuenta) CONCAT(c2.codigo,' - ',c2.nombre) AS cuenta,'01-01-2000' AS fecha ,0 AS serie,0 AS tipocomprobante, '0' AS glosa,0 AS debe,0 AS haber,0 AS debealt,0 AS haberalt,0 AS numero,
          m.abreviatura AS simbolo, m.nombre AS moneda,e.nombre AS empresa,	g.nombre AS gestion, p.nombre AS periodo,u.usuario AS nombreusuario, em.idmonedaprincipal AS idmonpri
        FROM detallecomprobante d 
          LEFT JOIN comprobante c ON c.idcomprobante=d.idcomprobante
          LEFT JOIN cuenta c2  ON d.idcuenta=c2.idcuenta 
          LEFT JOIN moneda m ON m.idmoneda = ${Number(idmoneda)} 
          LEFT JOIN empresa e ON c2.idempresa = e.idempresa 
          LEFT JOIN gestion g ON g.idempresa = e.idempresa 
          LEFT JOIN periodo p ON p.idgestion = g.idgestion AND c.fecha BETWEEN p.fechainicio AND p.fechafin 
          LEFT JOIN empresamoneda em ON em.idempresa = e.idempresa 
          LEFT JOIN usuario u ON u.idusuario = e.idusuario
        WHERE c.estado>=0 AND em.activo=1 AND (p.idperiodo=${Number(idperiodo)}   OR g.idgestion=${Number(idgestion)}  ) AND c2.tipocuenta=1
        GROUP BY c2.idcuenta, c2.codigo, cuenta, simbolo,moneda,empresa,gestion, periodo,nombreusuario,idmonpri
        UNION 
        SELECT CONCAT(c2.codigo,' - ',c2.nombre) AS cuenta, c.fecha, c.serie, c.tipocomprobante, c.glosa, d.montodebe AS debe, d.montohaber AS haber, d.montodebealt AS debealt, d.montohaberalt AS haberalt, d.numero,
          m.abreviatura AS simbolo, m.nombre AS moneda,e.nombre AS empresa,	g.nombre AS gestion, p.nombre AS periodo,u.usuario AS nombreusuario, em.idmonedaprincipal AS idmonpri
        FROM detallecomprobante d
          LEFT JOIN comprobante c ON c.idcomprobante=d.idcomprobante
          LEFT JOIN cuenta c2 ON c2.idcuenta = d.idcuenta  
          LEFT JOIN moneda m ON m.idmoneda =  ${Number(idmoneda)} 
          LEFT JOIN empresa e ON c2.idempresa = e.idempresa 
          LEFT JOIN gestion g ON g.idempresa = e.idempresa 
          LEFT JOIN periodo p ON p.idgestion = g.idgestion AND c.fecha BETWEEN p.fechainicio AND p.fechafin 
          LEFT JOIN empresamoneda em ON em.idempresa = e.idempresa 
          LEFT JOIN usuario u ON u.idusuario = e.idusuario
        WHERE c.estado>=0 AND  em.activo=1 AND (p.idperiodo=${Number(idperiodo)}  OR g.idgestion=${Number(idgestion)}  )
        ORDER BY cuenta, fecha) AS tab;
        `
        if(findDatos){
          return res.json(findDatos)
        }else{
          res.status(400).json('No se encontraron resultados')
        }
      }catch(error) {
        console.log("Error: ", error.message);
        res.status(400).json({ok:false, mensaje:'Bad Request'})
      }
    },
    getReporteLibroMayorPeriodo: async (req, res) => {
      try{
        let { idmoneda, idgestion, idperiodo } = req.query
        const findDatos = await prisma.$queryRaw`
        SELECT tab.*, 
          SUM(CASE WHEN debe<>0 THEN debe ELSE haber*(-1) END) 
          OVER (PARTITION BY tab.cuenta ORDER BY tab.fecha) AS saldo,
          SUM(CASE WHEN debealt<>0 THEN debealt ELSE haberalt*(-1) END) 
          OVER (PARTITION BY tab.cuenta ORDER BY tab.fecha) AS saldoalt
        FROM (SELECT CONCAT(c2.codigo,' - ',c2.nombre) AS cuenta, '01-01-2000' AS fecha, 0 AS serie, 0 AS tipocomprobante, '0' AS glosa, 0 AS debe, 0 AS haber, 0 AS debealt, 0 AS haberalt, 0 AS numero,
          m.abreviatura AS simbolo, m.nombre AS moneda,e.nombre AS empresa, g.nombre AS gestion, p.nombre AS periodo,u.usuario AS nombreusuario, em.idmonedaprincipal AS idmonpri
          FROM detallecomprobante d 
            LEFT JOIN comprobante c ON c.idcomprobante=d.idcomprobante
            LEFT JOIN cuenta c2  ON d.idcuenta=c2.idcuenta 
            LEFT JOIN moneda m ON m.idmoneda =$P{id_moneda} 
            LEFT JOIN empresa e ON c2.idempresa = e.idempresa 
            LEFT JOIN gestion g ON g.idempresa = e.idempresa 
            LEFT JOIN periodo p ON p.idgestion = g.idgestion AND c.fecha BETWEEN p.fechainicio AND p.fechafin 
            LEFT JOIN empresamoneda em ON em.idempresa = e.idempresa 
            LEFT JOIN usuario u ON u.idusuario = e.idusuario
          WHERE c.estado>=0 AND em.activo=1 AND (p.idperiodo=${Number(idperiodo)}  OR g.idgestion=${Number(idgestion)} ) AND c2.tipocuenta=1
          GROUP BY c2.codigo, cuenta, simbolo,moneda,empresa,gestion, periodo,nombreusuario,idmonpri 
        UNION 
        SELECT CONCAT(c2.codigo,' - ',c2.nombre) AS cuenta, c.fecha, c.serie, c.tipocomprobante, c.glosa, d.montodebe AS debe, d.montohaber AS haber, d.montodebealt AS debealt, d.montohaberalt AS haberalt, d.numero,
          m.abreviatura AS simbolo, m.nombre AS moneda,e.nombre AS empresa,	g.nombre AS gestion, p.nombre AS periodo,u.usuario AS nombreusuario, em.idmonedaprincipal AS idmonpri
        FROM detallecomprobante d
          LEFT JOIN comprobante c ON c.idcomprobante=d.idcomprobante
          LEFT JOIN cuenta c2 ON c2.idcuenta = d.idcuenta  
          LEFT JOIN moneda m ON m.idmoneda = $P{id_moneda} 
          LEFT JOIN empresa e ON c2.idempresa = e.idempresa 
          LEFT JOIN gestion g ON g.idempresa = e.idempresa 
          LEFT JOIN periodo p ON p.idgestion = g.idgestion AND c.fecha BETWEEN p.fechainicio AND p.fechafin 
          LEFT JOIN empresamoneda em ON em.idempresa = e.idempresa 
          LEFT JOIN usuario u ON u.idusuario = e.idusuario
        WHERE c.estado>=0 AND  em.activo=1 AND (p.idperiodo=${Number(idperiodo)} OR g.idgestion=${Number(idgestion)})
        GROUP BY cuenta, fecha) AS tab;
        `
        if(findDatos){
          return res.json(findDatos)
        }else{
          res.status(400).json('No se encontraron resultados')
        }
      }catch(error) {
        console.log("Error: ", error.message);
        res.status(400).json({ok:false, mensaje:'Bad Request'})
      }
    },

}
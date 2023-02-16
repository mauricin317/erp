import { conn } from "../../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function detallecomprobante (req, res) {
        const {method,body} = req;
        if(req.session.user){
            const {idusuario, idempresa} = req.session.user;
            const { idcomprobante } = req.query;

            switch (method) {
                case "GET":
                    let moneda = await conn.query('select c.idcomprobante, c.idmoneda, e.idmonedaprincipal from comprobante c left join empresamoneda e on c.idempresa=e.idempresa where c.idcomprobante=$1 AND e.activo=1',[idcomprobante]);
                    let strdebe = 'd.montodebe';
                    let strhaber = 'd.montohaber';
                    if(moneda.rows[0].idmoneda != moneda.rows[0].idmonedaprincipal){
                        strdebe= 'd.montodebealt';
                        strhaber='d.montohaberalt';
                    }
                    let query = `SELECT d.idcuenta AS id, d.idcuenta, concat(c.codigo,' - ', c.nombre) as cuenta, d.glosa, ${strdebe} AS debe, ${strhaber} AS haber FROM detallecomprobante d LEFT JOIN cuenta c ON c.idcuenta=d.idcuenta WHERE idcomprobante=$1 ORDER BY d.numero`;
                    let values = [idcomprobante];
                    let response = await conn.query(query,values);
                    if(response.rowCount > 0){
                        return res.json({ok:true, data:response.rows})
                    }else{
                        return res.json({ok:false, data:[], mensaje:"No se encontraron detalles"})
                    }
                default:
                    return res.json({error: "Bad request"});
            }
        }else{
            return res.json({error:"Unauthorized"});
        }
    },
    {
      cookieName: "myapp_cookiename",
      password: "complex_password_at_least_32_characters_long",
      // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
      cookieOptions: {
        secure: process.env.NODE_ENV === "production",
      },
    },
)
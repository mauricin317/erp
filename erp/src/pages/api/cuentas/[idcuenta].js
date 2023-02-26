import { conn } from "../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function periodo (req, res) {
        const {method,body} = req;
        const { idcuenta } = req.query;
        if(req.session.user){
            const {idusuario} = req.session.user;
            const {idempresa} = req.session.user;
                switch (method) {
                    case "GET":
                        if(idcuenta == "detalle"){
                            let query = `SELECT idcuenta as id, *,concat(codigo,' - ', nombre) as label  FROM cuenta WHERE idempresa=$1 AND tipocuenta=1 ORDER BY replace(codigo, '.', '')::int ASC`;
                            let values = [idempresa];
                            let response = await conn.query(query,values);
                            return res.json({ok:true, data:response.rows})
                        }
                    case "PUT":
                        const {nombre} = body;
                        let query0 = 'SELECT * FROM cuenta WHERE nombre ILIKE $1 AND idempresa=$2';
                        let values0 = [nombre,idempresa];
                        let validacion0 = await conn.query(query0,values0);
                        if(validacion0.rowCount > 0){
                            return res.json({ok:false, mensaje:"Ya existe ese nombre de Cuenta"})
                        }
                        let query1 = 'UPDATE cuenta set nombre=$1 where idcuenta=$2';
                        let values1 = [nombre,idcuenta];
                        let response1 = await conn.query(query1,values1);
                        if(response1.rowCount == 1){
                            return res.json({ok:true})
                        }else{
                            return res.json({ok:false, mensaje:"No se pudo actualizar la cuenta"})
                        }
                    case "DELETE":
                        let query2 = 'SELECT * FROM detallecomprobante WHERE idcuenta=$1';
                        let values2 = [idcuenta];
                        let response2 = await conn.query(query2,values2);
                        if(response2.rowCount > 0){
                            return res.json({ok:false, mensaje:"Ya existen comprobantes con esta cuenta"})
                        }
                        let query3 = 'SELECT * FROM integracion WHERE $1 IN (caja, creditofiscal, debitofiscal, compras, ventas, it, itxpagar)';
                        let values3 = [idcuenta];
                        let response3 = await conn.query(query3,values3);
                        if(response3.rowCount > 0){
                            return res.json({ok:false, mensaje:"La cuenta es parte de las cuentas de integracion"})
                        }
                        let query4 = 'DELETE FROM cuenta WHERE idcuenta=$1';
                        let values4 = [idcuenta];
                        let response4 = await conn.query(query4,values4);
                        if(response4.rowCount == 1){
                            return res.json({ok:true, mensaje:"Eliminado con Éxito"})
                        }else{
                            return res.json({ok:false, mensaje:"Error al eliminar la Cuenta"})
                        }
                    default:
                        return res.status(404).send("Bad request");
                }
        }else{
            return res.status(401).send("Unauthorized")
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
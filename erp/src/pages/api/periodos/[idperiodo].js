/* eslint-disable import/no-anonymous-default-export */

import { conn } from "../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function periodo (req, res) {
        const {method,body} = req;
        const { idperiodo } = req.query;
        if(req.session.user){
            switch (method) {
                case "PUT":
                    let {nombre,fechainicio,fechafin,idgestion} = body
                    let query0 = 'SELECT * FROM periodo WHERE nombre=$1 AND (idgestion=$2 AND idperiodo!=$3)';
                    let values0 = [nombre,idgestion,idperiodo];
                    let validacion1 = await conn.query(query0,values0);
                    if(validacion1.rowCount > 0){
                        return res.json({ok:false, mensaje:"Ya existe ese nombre de periodo"})
                    }
                    let query1 = 'SELECT * FROM periodo WHERE (($1 BETWEEN fechainicio AND fechafin) OR ($2 BETWEEN fechainicio AND fechafin)) AND (idgestion = $3 AND idperiodo!=$4)';
                    let values1 = [fechainicio,fechafin,idgestion,idperiodo];
                    let validacion2 = await conn.query(query1,values1);
                    if(validacion2.rowCount > 0){
                        return res.json({ok:false, mensaje:"No debe haber solapamiento entre periodos"})
                    }
                    let query2 = 'UPDATE periodo set nombre=$1, fechainicio=$2, fechafin=$3 where idperiodo=$4';
                    let values2 = [nombre,fechainicio,fechafin,idperiodo];
                    let response2 = await conn.query(query2,values2);
                    if(response2.rowCount == 1){
                        return res.json({ok:true})
                    }else{
                        return res.json({ok:false, mensaje:"No se pudo actualizar el periodo"})
                    }
                case "DELETE":
                    let query4 = 'DELETE FROM periodo WHERE idperiodo=$1';
                    let values4 = [idperiodo];
                    let response4 = await conn.query(query4,values4);
                    if(response4.rowCount == 1){
                        return res.json({ok:true, mensaje:"Eliminado con Éxito"})
                    }else{
                        return res.json({ok:false, mensaje:"Error al eliminar el periodo"})
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

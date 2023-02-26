/* eslint-disable import/no-anonymous-default-export */

import { conn } from "../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function gestion (req, res) {
        const {method,body} = req;
        const { idgestion } = req.query;
        if(req.session.user){
            const {idempresa} = req.session.user;
            switch (method) {
                case "GET":
                    let queryG = 'SELECT * FROM gestion WHERE idgestion=$1 LIMIT 1';
                    let valuesG = [idgestion];
                    let responseG = await conn.query(queryG,valuesG);
                    if(responseG.rowCount == 1){
                        return res.json({ok:true, data:responseG.rows[0]})
                    }else{
                        return res.json({ok:false, data:[], mensaje:"No se pudo obtener la gestion"})
                    }
                case "PUT":
                    let {nombre,fechainicio,fechafin} = body
                    let query0 = 'SELECT * FROM gestion WHERE nombre=$1 AND (idempresa=$2 AND idgestion!=$3)';
                    let values0 = [nombre,idempresa,idgestion];
                    let validacion1 = await conn.query(query0,values0);
                    if(validacion1.rowCount > 0){
                        return res.json({ok:false, mensaje:"Ya existe ese nombre de gestion"})
                    }
                    let query1 = 'SELECT * FROM gestion WHERE (($1 BETWEEN fechainicio AND fechafin) OR ($2 BETWEEN fechainicio AND fechafin)) AND (idempresa = $3 AND idgestion!=$4)';
                    let values1 = [fechainicio,fechafin,idempresa,idgestion];
                    let validacion2 = await conn.query(query1,values1);
                    if(validacion2.rowCount > 0){
                        return res.json({ok:false, mensaje:"No debe haber solapamiento entre gestiones"})
                    }
                    let query2 = 'UPDATE gestion set nombre=$1, fechainicio=$2, fechafin=$3 where idgestion=$4';
                    let values2 = [nombre,fechainicio,fechafin,idgestion];
                    let response2 = await conn.query(query2,values2);
                    if(response2.rowCount == 1){
                        return res.json({ok:true})
                    }else{
                        return res.json({ok:false, mensaje:"No se pudo actualizar la gestion"})
                    }
                case "DELETE":
                    let query3 = 'SELECT idperiodo from periodo WHERE idgestion=$1';
                    let values3 = [idgestion];
                    let response3 = await conn.query(query3,values3);
                    if(response3.rowCount > 0){
                        return res.json({ok:false, mensaje:"No se puede eliminar una gestion con periodos"})
                    }
                    let query4 = 'DELETE FROM gestion WHERE idgestion=$1';
                    let values4 = [idgestion];
                    let response4 = await conn.query(query4,values4);
                    if(response4.rowCount == 1){
                        return res.json({ok:true, mensaje:"Eliminado con Éxito"})
                    }else{
                        return res.json({ok:false, mensaje:"Error al eliminar la gestion"})
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

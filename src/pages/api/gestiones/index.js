/* eslint-disable import/no-anonymous-default-export */

import { conn } from "../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function gestiones (req, res) {
        const {method,body} = req;
        if(req.session.user){
            const {idusuario} = req.session.user;
            const {idempresa} = req.session.user;
            switch (method) {
                case "GET":
                    let query = `SELECT idgestion as id,nombre , fechainicio, fechafin, estado FROM gestion WHERE idempresa=$1 order by fechainicio desc`;
                    let values = [idempresa];
                    let response = await conn.query(query,values);
                    if(response.rowCount > 0){
                        return res.json({ok:true, data:response.rows, idempresa:idempresa})
                    }else{
                        return res.json({ok:false, data:[], mensaje:"No se encontraron gestiones"})
                    }
                case "POST":
                    let {nombre,fechainicio,fechafin} = body
                    let query0 = 'SELECT * FROM gestion WHERE nombre=$1 AND idempresa=$2';
                    let values0 = [nombre,idempresa];
                    let validacion1 = await conn.query(query0,values0);
                    if(validacion1.rowCount > 0){
                        return res.json({ok:false, mensaje:"Ya existe ese nombre de gestion"})
                    }
                    let query1 = 'SELECT * FROM gestion WHERE (($1 BETWEEN fechainicio AND fechafin) OR ($2 BETWEEN fechainicio AND fechafin)) AND idempresa = $3';
                    let values1 = [fechainicio,fechafin,idempresa];
                    let validacion2 = await conn.query(query1,values1);
                    if(validacion2.rowCount > 0){
                        return res.json({ok:false, mensaje:"No debe haber solapamiento entre gestiones"})
                    }
                    let query2 = 'INSERT INTO gestion (nombre, fechainicio, fechafin, idusuario, idempresa) values($1,$2,$3,$4,$5)';
                    let values2 = [nombre,fechainicio,fechafin,idusuario,idempresa];
                    let response2 = await conn.query(query2,values2);
                    if(response2.rowCount == 1){
                        return res.json({ok:true})
                    }else{
                        return res.json({ok:false, mensaje:"No se pudo guardar la gestion"})
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

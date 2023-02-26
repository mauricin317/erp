/* eslint-disable import/no-anonymous-default-export */

import { conn } from "../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function periodos (req, res) {
        const {method,body} = req;
        if(req.session.user){
            const {idusuario} = req.session.user;
            switch (method) {
                case "GET":
                    /*let query = `SELECT idperiodo as id,nombre , fechainicio, fechafin, estado FROM periodo WHERE idgestion=$1 order by estado desc, fechainicio`;
                    let values = [idgestion];
                    let response = await conn.query(query,values);
                    if(response.rowCount > 0){
                        return res.json({ok:true, data:response.rows})
                    }else{
                        return res.json({ok:false, data:[], mensaje:"No se encontraron periodos"})
                    }*/
                    return res.json({ok:false, data:[], mensaje:"No se encontraron periodos"})
                case "POST":
                    let {nombre,fechainicio,fechafin,idgestion} = body
                    let query0 = 'SELECT * FROM periodo WHERE nombre=$1 AND idgestion=$2';
                    let values0 = [nombre,idgestion];
                    let validacion1 = await conn.query(query0,values0);
                    if(validacion1.rowCount > 0){
                        return res.json({ok:false, mensaje:"Ya existe ese nombre de gestion"})
                    }
                    let query1 = 'SELECT * FROM periodo WHERE (($1 BETWEEN fechainicio AND fechafin) OR ($2 BETWEEN fechainicio AND fechafin)) AND idgestion=$3';
                    let values1 = [fechainicio,fechafin,idgestion];
                    let validacion2 = await conn.query(query1,values1);
                    if(validacion2.rowCount > 0){
                        return res.json({ok:false, mensaje:"No debe haber solapamiento entre periodos"})
                    }
                    let query2 = 'INSERT INTO periodo (nombre, fechainicio, fechafin, idusuario, idgestion) values($1,$2,$3,$4,$5)';
                    let values2 = [nombre,fechainicio,fechafin,idusuario,idgestion];
                    let response2 = await conn.query(query2,values2);
                    if(response2.rowCount == 1){
                        return res.json({ok:true})
                    }else{
                        return res.json({ok:false, mensaje:"No se pudo guardar el periodo"})
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
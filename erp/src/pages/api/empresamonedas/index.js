/* eslint-disable import/no-anonymous-default-export */

import { conn } from "../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function empresamoneda (req, res) {
        const {method,body} = req;
        if(req.session.user){
            const {idusuario, idempresa} = req.session.user;
            switch (method) {
                case "GET":
                    let query0 = 'SELECT * FROM moneda WHERE idusuario=$1 ORDER BY idmoneda ASC';
                    let values0 = [idusuario];
                    let response0 = await conn.query(query0,values0);
                    if(response0.rowCount > 0){
                        let query1 = 'SELECT e.idempresamoneda as id, e.*, mo.nombre as monedaprincipal,(SELECT nombre from moneda where idmoneda=e.idmonedaalternativa) as monedaalternativa FROM empresamoneda e JOIN moneda mo on mo.idmoneda=e.idmonedaprincipal WHERE idempresa=$1 ORDER BY fecharegistro DESC';
                        let values1 = [idempresa];
                        let response1 = await conn.query(query1,values1);
                        let query01 = 'SELECT count(*) FROM comprobante WHERE idempresa=$1';
                        let values01 = [idempresa];
                        let response01 = await conn.query(query01,values01);
                        if(response1.rowCount > 0){
                            return res.json({ok:true, data:response1.rows, monedas:response0.rows, comprobantes_count:response01.rows[0].count})
                        }else{
                            return res.json({ok:true, data:[], monedas:response0.rows, mensaje:"No se encontraron registros"})
                        }
                    }else{
                        return res.json({ok:true, data:[], monedas:[], mensaje:"No se encontraron monedas"})
                    }
                case "POST":
                    let {idempresamoneda,idmonedaalternativa, cambio} = body
                    let query2 = 'UPDATE empresamoneda SET activo=0 WHERE idempresamoneda=$1 RETURNING *';
                    let values2 = [idempresamoneda];
                    let response2 = await conn.query(query2,values2);
                    if(response2.rowCount == 1){
                        let datos_em = response2.rows[0];
                        let query3 = 'INSERT INTO empresamoneda(activo, fecharegistro, idempresa, idmonedaprincipal,idmonedaalternativa, cambio, idusuario) values(1,NOW()::timestamp,$1,$2,$3,$4,$5)';
                        let values3 = [idempresa,datos_em.idmonedaprincipal,idmonedaalternativa,cambio,idusuario];
                        let response3 = await conn.query(query3,values3);
                        if(response3.rowCount > 0){
                            return res.json({ok:true})
                        }else{
                            return res.json({ok:false, mensaje:"Error al crear la empresamoneda"})
                        }
                    }else{
                        return res.json({ok:false, mensaje:"Error al actualizar la empresamoneda"})
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
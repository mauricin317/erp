/* eslint-disable import/no-anonymous-default-export */

import { conn } from "../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function empresas (req, res) {
        const {method,body} = req;
        
        if(req.session.user){
            const {idusuario} = req.session.user;
            switch (method) {
                case "GET":
                    let queryMonedas = 'SELECT * FROM moneda WHERE idusuario=$1 ORDER BY idmoneda ASC';
                    let valuesMonedas = [idusuario];
                    let responseMonedas = await conn.query(queryMonedas,valuesMonedas);
                    if(responseMonedas.rowCount>0){
                        let query = 'SELECT e.*, em.idmonedaprincipal, em.idmonedaalternativa FROM empresa e LEFT JOIN empresamoneda em ON em.idempresa=e.idempresa WHERE e.idusuario=$1 AND estado=1 AND activo=1';
                        let values = [idusuario];
                        let response = await conn.query(query,values);
                        if(response.rowCount > 0){
                            return res.json({ok:true, data:response.rows, monedas:responseMonedas.rows});
                        }else{
                            return res.json({ok:true, data:[], monedas:responseMonedas.rows, mensaje:"No se encontraron empresas"})
                        }
                    }else{
                        return res.json({ok:true, data:[], monedas:[], mensaje:"No se encontraron monedas"})
                    }
                case "POST":
                    let {nombre,nit,sigla,telefono,correo,direccion,niveles,moneda} = body
                    let query1 = 'SELECT * FROM empresa WHERE nombre=$1 OR nit=$2 OR sigla=$3 AND estado=1';
                    let values1 = [nombre,nit,sigla];
                    let response1 = await conn.query(query1,values1);
                    if(response1.rowCount > 0){
                        return res.json({ok:false, mensaje:"Ya existe una empresa con esos datos"})
                    }
                    let query2 = 'INSERT INTO empresa (nombre, nit, sigla, telefono, correo, direccion, niveles, idusuario) values($1,$2,$3,$4,$5,$6,$7,$8) RETURNING idempresa';
                    let values2 = [nombre,nit,sigla,telefono,correo,direccion,niveles,idusuario];
                    let response2 = await conn.query(query2,values2);
                    if(response2.rowCount == 1){
                        let idempresa = response2.rows[0].idempresa;
                        let query3 = 'INSERT INTO empresamoneda(activo, fecharegistro, idempresa, idmonedaprincipal, idusuario) values(1,NOW()::timestamp,$1,$2,$3)';
                        let values3 = [idempresa,moneda,idusuario];
                        let response3 = await conn.query(query3,values3);
                        let query4 = 'SELECT generar_cuentas_principales($1, $2, $3) as total'
                        let values4 = [idempresa,idusuario,niveles];
                        let response4 = await conn.query(query4,values4);
                        let query5 = 'INSERT INTO integracion(idempresa) VALUES($1)'
                        let values5 = [idempresa];
                        let response5 = await conn.query(query5,values5);
                        if(response3.rowCount == 1 && response4.rows[0].total == 7 && response5.rowCount == 1){
                            return res.json({ok:true})
                        }else{
                            return res.json({ok:false, mensaje:"No se pudo guardar la moneda o las cuentas principales"})
                        }
                    }else{
                        return res.json({ok:false, mensaje:"No se pudo guardar la empresa"})
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



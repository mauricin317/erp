/* eslint-disable import/no-anonymous-default-export */

import { conn } from "../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function cuentas (req, res) {
        const {method,body} = req;
        if(req.session.user){
            const {idusuario} = req.session.user;
            const {idempresa} = req.session.user;
            switch (method) {
                case "GET":
                    let query = `SELECT * FROM cuenta WHERE idempresa=$1 ORDER BY replace(codigo, '.', '')::int ASC`;
                    let values = [idempresa];
                    
                    let queryNivel = `SELECT niveles FROM empresa WHERE idempresa=$1 LIMIT 1`;
                    let valuesNivel = [idempresa];
                    let responseNivel = await conn.query(queryNivel,valuesNivel);
                    if(responseNivel.rowCount > 0){
                        let response = await conn.query(query,values);
                        if(response.rowCount > 0){
                            return res.json({ok:true, data:response.rows, niveles:responseNivel.rows[0].niveles, idempresa:idempresa})
                        }else{
                            return res.json({ok:false, data:[], niveles:responseNivel.rows[0].niveles, idempresa:idempresa, mensaje:"No se encontraron Cuentas"})
                        }
                    }else{
                        return res.json({ok:false, data:[], mensaje:"Error"})
                    }
                case "POST":
                    const {codigo, nombre, nivel, tipocuenta, idcuentapadre} = body;
                    let query0 = 'SELECT * FROM cuenta WHERE nombre ILIKE $1 AND idempresa=$2';
                    let values0 = [nombre,idempresa];
                    let validacion0 = await conn.query(query0,values0);
                    if(validacion0.rowCount > 0){
                        return res.json({ok:false, mensaje:"Ya existe ese nombre de Cuenta"})
                    }
                    let queryCod;
                    let valuesCod;
                    if(idcuentapadre != null){
                        queryCod = `SELECT * FROM cuenta WHERE idcuentapadre=$1 ORDER BY codigo DESC LIMIT 1`;
                        valuesCod = [idcuentapadre];
                    }else{
                        queryCod = `SELECT * FROM cuenta WHERE idcuentapadre IS NULL AND idempresa=$1 ORDER BY codigo DESC LIMIT 1`;
                        valuesCod = [idempresa];
                    }
                    let codigoNuevo=''
                    let responseCod = await conn.query(queryCod,valuesCod);
                    if(responseCod.rowCount == 1){
                        // Generar Ultimo Codigo a partir de la cuenta del mismo nivel
                        let codigoPadre = responseCod.rows[0].codigo
                        codigoNuevo = (codigoPadre.split('.').map((num, i) => i==(nivel-1)? (parseInt(num)+1)+'' : num)).join('.')
                    }else{
                        codigoNuevo=codigo
                    }
                    let query1 = 'INSERT INTO cuenta(codigo,nombre,nivel,tipocuenta,idusuario,idempresa,idcuentapadre) values($1,$2,$3,$4,$5,$6,$7)';
                    let values1 = [codigoNuevo,nombre,nivel,tipocuenta,idusuario,idempresa,idcuentapadre];
                    let responsePost = await conn.query(query1,values1);
                    if(responsePost.rowCount == 1){
                        return res.json({ok:true})
                    }else{
                        return res.json({ok:false, mensaje:"Error al crear Cuenta"})
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

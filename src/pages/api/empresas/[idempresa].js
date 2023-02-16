/* eslint-disable import/no-anonymous-default-export */

import { conn } from "../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function empresa (req, res) {
        const {method,body} = req;
        const { idempresa } = req.query;
        if(req.session.user){
            switch (method) {
                case "GET":
                    let queryG = 'SELECT * FROM empresa WHERE idempresa=$1 and estado=1';
                    let valuesG = [idempresa];
                    let responseG = await conn.query(queryG,valuesG);
                    if(responseG.rowCount == 1){
                        return res.json({ok:true, data:responseG.rows})
                    }else{
                        return res.json({ok:false, data:[], mensaje:"No se pudo obtener la empresa"})
                    }
                case "PUT":
                    let {nombre,nit,sigla,telefono,correo,direccion,niveles,moneda} = body
                    let query1 = 'SELECT * FROM empresa WHERE (nombre=$1 OR nit=$2 OR sigla=$3) AND (estado=1 AND idempresa!=$4)';
                    let values1 = [nombre,nit,sigla,idempresa];
                    let response1 = await conn.query(query1,values1);
                    if(response1.rowCount > 0){
                        return res.json({ok:false, mensaje:"Ya existe una empresa con esos datos"})
                    }
                    let query2 = 'UPDATE empresa SET nombre=$1, nit=$2, sigla=$3, telefono=$4, correo=$5, direccion=$6, niveles=$7 WHERE idempresa=$8';
                    let values2 = [nombre,nit,sigla,telefono,correo,direccion,niveles, idempresa];
                    let response2 = await conn.query(query2,values2);
                    if(response2.rowCount == 1){
                        let query3 = 'UPDATE empresamoneda SET idmonedaprincipal=$1 WHERE idempresa=$2 AND activo=1';
                        let values3 = [moneda, idempresa];
                        let response3 = await conn.query(query3,values3);
                        if(response3.rowCount == 1){
                            return res.json({ok:true})
                        }else{
                            return res.json({ok:false, mensaje:"No se pudo actualizar la empresamoneda"})
                        }
                    }else{
                        return res.json({ok:false, mensaje:"No se pudo actualizar la empresa"})
                    }
                case "DELETE":
                    let query = 'UPDATE empresa SET estado=0 WHERE idempresa=$1';
                    let values = [idempresa];
                    let response = await conn.query(query,values);
                    if(response.rowCount == 1){
                        return res.json({ok:true, mensaje:"Eliminado con Éxito"})
                    }else{
                        return res.json({ok:false, mensaje:"No se pudo eliminar la empresa"})
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

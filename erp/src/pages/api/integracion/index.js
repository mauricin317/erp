/* eslint-disable import/no-anonymous-default-export */

import { conn } from "../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function integracion (req, res) {
        const {method,body} = req;
        if(req.session.user){
            const {idusuario, idempresa} = req.session.user;
            switch (method) {
                case "GET":
                    let query = 'SELECT * FROM integracion WHERE idempresa=$1';
                    let values = [idempresa];
                    let response = await conn.query(query,values);
                    if(response.rowCount == 1){
                        return res.json({ok:true, data:response.rows})
                    }else{
                        return res.json({ok:true, data:[], mensaje:"No hay integracion configuradas"})
                    }
                case "POST":
                    const {caja, creditofiscal, debitofiscal, compras, ventas, it, itxpagar, estado} = body;
                    let query1 = 'UPDATE integracion set caja=$1, creditofiscal=$2, debitofiscal=$3, compras=$4, ventas=$5, it=$6, itxpagar=$7, estado=$8 where idempresa=$9';
                    let values1 = [caja, creditofiscal, debitofiscal, compras, ventas, it, itxpagar, estado, idempresa];
                    let response1 = await conn.query(query1,values1);
                    if(response1.rowCount == 1){
                        return res.json({ok:true, mensaje:"Integracion Actualizada"})
                    }else{
                        return res.json({ok:false, mensaje:"Error al Actualizar datos"})
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
/* eslint-disable import/no-anonymous-default-export */

import { conn } from "../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function monedas (req, res) {
        const {method,body} = req;
        if(req.session.user){
            const {idusuario} = req.session.user;
            switch (method) {
                case "GET":
                    let query = 'SELECT * FROM moneda WHERE idusuario=$1 ORDER BY idmoneda ASC';
                    let values = [idusuario];
                    let response = await conn.query(query,values);
                    if(response.rowCount > 0){
                        return res.json({ok:true, data:response.rows})
                    }else{
                        return res.json({ok:true, data:[], mensaje:"No se encontraron monedas"})
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
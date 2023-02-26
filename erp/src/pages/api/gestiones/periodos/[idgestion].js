/* eslint-disable import/no-anonymous-default-export */

import { conn } from "../../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function gestion (req, res) {
        const {method,body} = req;
        const { idgestion } = req.query;
        if(req.session.user){
            switch (method) {
                case "GET":
                    let query = `SELECT idperiodo as id,nombre , fechainicio, fechafin, estado FROM periodo WHERE idgestion=$1 order by fechainicio`;
                    let values = [idgestion];
                    let response = await conn.query(query,values);
                    if(response.rowCount > 0){
                        return res.json({ok:true, data:response.rows})
                    }else{
                        return res.json({ok:false, data:[], mensaje:"No se encontraron periodos"})
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
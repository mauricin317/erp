/* eslint-disable import/no-anonymous-default-export */

import { conn } from "../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function reportes (req, res) {
        const {method,body} = req;
        if(req.session.user){
            const {idusuario, idempresa} = req.session.user;
            switch (method) {
                case "GET":
                    let query0 = 'Select idmoneda as id,idmoneda, m.nombre, idmonedaprincipal, idmonedaalternativa from moneda m left join empresamoneda e on e.idmonedaprincipal=m.idmoneda or e.idmonedaalternativa = m.idmoneda where e.activo=1 and idempresa=$1';
                    let values0 = [idempresa];
                    let response0 = await conn.query(query0,values0);
                    if(response0.rowCount > 1){
                        let query1 = 'Select idgestion as id, idgestion, nombre from gestion where idempresa=$1';
                        let values1 = [idempresa];
                        let response1 = await conn.query(query1,values1);
                        if(response1.rowCount > 0){
                            let query2 = 'Select idperiodo as id, idperiodo, p.nombre, p.idgestion from periodo p left join gestion g on g.idgestion=p.idgestion where idempresa=$1';
                            let values2 = [idempresa];
                            let response2 = await conn.query(query2,values2);
                            if(response2.rowCount > 0){
                                return res.json({ok:true, gestiones:response1.rows, periodos:response2.rows, monedas:response0.rows})
                            }else{
                                return res.json({ok:false, gestiones:[], monedas:[], periodos:[], mensaje:"No existen Periodos"})
                            }
                        }else{
                            return res.json({ok:false, gestiones:[], monedas:[], periodos:[], mensaje:"No existen Gestiones"})
                        }
                    }else{
                        return res.json({ok:false, gestiones:[], monedas:[], periodos:[], mensaje:"No existen Comprobantes"})
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
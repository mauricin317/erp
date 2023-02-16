import { conn } from "../../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function detallecompra (req, res) {
        const {method,body} = req;
        if(req.session.user){
            const {idusuario, idempresa} = req.session.user;
            const { idnota } = req.query;

            switch (method) {
                case "GET":
                    let query = `select l.idarticulo as id, l.idarticulo, a.nombre, l.fechavencimiento, l.cantidad, l.preciocompra, (l.cantidad*l.preciocompra) as subtotal from lote l left join articulo a on l.idarticulo=a.idarticulo where idnota=$1;`;
                    let values = [idnota];
                    let response = await conn.query(query,values);
                    if(response.rowCount > 0){
                        return res.json({ok:true, data:response.rows})
                    }else{
                        return res.json({ok:false, data:[], mensaje:"No se encontraron lotes"})
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
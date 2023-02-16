import { conn } from "../../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function detalleventa (req, res) {
        const {method,body} = req;
        if(req.session.user){
            const {idusuario, idempresa} = req.session.user;
            const { idnota } = req.query;

            switch (method) {
                case "GET":
                    let query = `select d.idarticulo as id, d.idarticulo, a.nombre, d.nrolote, d.cantidad, d.precioventa, (d.cantidad*d.precioventa) as subtotal from detalle d left join articulo a on d.idarticulo=a.idarticulo where d.idnota=$1;`;
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
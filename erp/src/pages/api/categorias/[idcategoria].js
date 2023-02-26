import { conn } from "../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function categoria (req, res) {
        const {method,body} = req;
        const { idcategoria, cantidad } = req.query;
        if(req.session.user){
            const {idusuario} = req.session.user;
            const {idempresa} = req.session.user;
                switch (method) {
                    case "GET":
                        if(cantidad){
                            let querylsc = 'SELECT a.idarticulo as id, a.*, ARRAY_AGG (ac.idcategoria) categorias FROM articulos_bajo_stock_chart($1, $2, $3) as a left JOIN articulocategoria ac USING (idarticulo) GROUP BY a.idarticulo, a.nombre, a.cantidad order by a.cantidad';
                            //SELECT a.idarticulo as id, a.*, ARRAY_AGG (ac.idcategoria) categorias FROM articulo a left JOIN articulocategoria ac USING (idarticulo) WHERE a.idempresa=$1
                            // 
                            let valueslsc = [idempresa, idcategoria, cantidad];
                            let responselsc = await conn.query(querylsc,valueslsc);
                            if(responselsc.rowCount){
                                return res.json({ok:true, data: responselsc.rows})
                            }else{
                                return res.json({ok:true, data:[], mensaje:"Error al cargar articulos"})
                            }
                        }else{
                            return res.json({ok:false, mensaje:"Error"})
                        }
                    case "PUT":
                        const {nombre, descripcion} = body;
                        let query0 = 'SELECT * FROM categoria WHERE nombre ILIKE $1 AND idempresa=$2';
                        let values0 = [nombre,idempresa];
                        let validacion0 = await conn.query(query0,values0);
                        if(validacion0.rowCount > 0){
                            return res.json({ok:false, mensaje:"Ya existe ese nombre de Categoria"})
                        }
                        let query1 = 'UPDATE categoria set nombre=$1, descripcion=$2 where idcategoria=$3';
                        let values1 = [nombre,descripcion,idcategoria];
                        let response1 = await conn.query(query1,values1);
                        if(response1.rowCount == 1){
                            return res.json({ok:true})
                        }else{
                            return res.json({ok:false, mensaje:"No se pudo actualizar la Categoria"})
                        }
                    case "DELETE":
                        let query3 = 'SELECT * FROM articulocategoria WHERE idcategoria=$1';
                        let values3 = [idcategoria];
                        let validacion3 = await conn.query(query3,values3);
                        if(validacion3.rowCount > 0){
                            return res.json({ok:false, mensaje:"Esta categoría ya está relacionada"})
                        }
                        let query4 = 'DELETE FROM categoria WHERE idcategoria=$1';
                        let values4 = [idcategoria];
                        let response4 = await conn.query(query4,values4);
                        if(response4.rowCount == 1){
                            return res.json({ok:true, mensaje:"Eliminado con Éxito"})
                        }else{
                            return res.json({ok:false, mensaje:"Error al eliminar la Cuenta"})
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
/* eslint-disable import/no-anonymous-default-export */

import { conn } from "../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function gestion (req, res) {
        const {method,body} = req;
        const { idarticulo } = req.query;
        if(req.session.user){
            const {idempresa} = req.session.user;
            switch (method) {
                case "GET":
                    if(idarticulo == "detalle"){
                        let query = `SELECT a.idarticulo as id, a.*  FROM articulo a WHERE idempresa=$1`;
                        let values = [idempresa];
                        let response = await conn.query(query,values);
                        
                        return res.json({ok:true, data:response.rows})
                    }else{
                        let query = `SELECT l.nrolote as id, l.*  FROM lote l WHERE idarticulo=$1 ORDER BY fechaingreso DESC;`;
                        let values = [idarticulo];
                        let response = await conn.query(query,values);
                        if(response.rowCount > 0){
                            return res.json({ok:true, data:response.rows})
                        }else{
                            return res.json({ok:true, data:[]})
                        }
                    }
                case "PUT":
                    let {nombre,descripcion,precioventa, categorias} = body
                    let query0 = 'SELECT * FROM articulo WHERE nombre=$1 AND idempresa=$2 AND idarticulo!=$3';
                    let values0 = [nombre,idempresa,idarticulo];
                    let validacion1 = await conn.query(query0,values0);
                    if(validacion1.rowCount > 0){
                        return res.json({ok:false, mensaje:"Ya existe un articulo con ese nombre"})
                    }
                    let query2 = 'UPDATE articulo set nombre=$1, descripcion=$2, precioventa=$3 where idarticulo=$4';
                    let values2 = [nombre,descripcion,precioventa,idarticulo];
                    let response2 = await conn.query(query2,values2);
                    if(response2.rowCount == 1){
                        await conn.query("DELETE FROM articulocategoria WHERE idarticulo=$1",[idarticulo]);
                        var params = []
                        var chunks = []
                        categorias.forEach((d, i) => {
                            var valueClause = []
                            params.push(idarticulo)
                            valueClause.push('$' + params.length)
                            params.push(d.idcategoria)
                            valueClause.push('$' + params.length)
                            chunks.push('(' + valueClause.join(', ') + ')')
                        });
                        let queryc1 = "INSERT INTO articulocategoria(idarticulo, idcategoria) VALUES " + chunks.join(', ');
                        let valuesc1 = params;
                        let responsec1 = await conn.query(queryc1,valuesc1);
                        if(responsec1.rowCount >= 1){
                            return res.json({ok:true, mensaje:"Guardado con éxito"})
                        }else{
                            return res.json({ok:false, mensaje:"Error al actualizar categorias"})
                        }
                    }else{
                        return res.json({ok:false, mensaje:"No se pudo actualizar el articulo"})
                    }
                case "DELETE":
                    let queryv1 = 'SELECT * FROM lote WHERE idarticulo=$1';
                    let valuesv1 = [idarticulo];
                    let responsev1 = await conn.query(queryv1,valuesv1);
                    if(responsev1.rowCount > 0){
                        return res.json({ok:false, mensaje:"El artículo ya está relacionado"})
                    }
                    let query3 = 'DELETE FROM articulocategoria WHERE idarticulo=$1';
                    let values3 = [idarticulo];
                    let response3 = await conn.query(query3,values3);
                    if(response3.rowCount >= 1){
                        let query4 = 'DELETE FROM articulo WHERE idarticulo=$1';
                        let values4 = [idarticulo];
                        let response4 = await conn.query(query4,values4);
                        if(response4.rowCount == 1){
                            return res.json({ok:true, mensaje:"Eliminado con Éxito"})
                        }else{
                            return res.json({ok:false, mensaje:"Error al eliminar el artículo"})
                        }
                    }else{
                        return res.json({ok:false, mensaje:"Error al eliminar la articulocategorias"})
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

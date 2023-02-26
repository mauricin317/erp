/* eslint-disable import/no-anonymous-default-export */

import { conn } from "../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function articulos (req, res) {
        const {method,body, query} = req;
        const {nota, limit } = query
        if(req.session.user){   
            const {idusuario} = req.session.user;
            const {idempresa} = req.session.user;
            switch (method) {
                case "GET":
                    if(nota=='compra'){
                        let querycompra = `SELECT a.idarticulo as id, a.*, ARRAY_AGG (ac.idcategoria) categorias FROM articulo a left JOIN articulocategoria ac USING (idarticulo) WHERE a.idempresa=$1 GROUP BY a.idarticulo, a.nombre, a.descripcion, a.cantidad, a.precioventa, a.idempresa, a.idusuario ORDER BY a.nombre;`;
                        let valuescompra = [idempresa];
                        let responsecompra = await conn.query(querycompra,valuescompra);
                        if(responsecompra.rowCount > 0){
                            return res.json({ok:true, data:responsecompra.rows})
                        }else{
                            return res.json({ok:false, data:[], mensaje:"Error al cargar detalles"})
                        }
                    }
                    if(nota=='venta'){
                        let querycompra = `SELECT a.idarticulo as id, a.idarticulo, a.nombre, a.precioventa, ARRAY_AGG(l.nrolote ORDER BY fechaingreso) lotes , json_object_agg(l.nrolote, l.stock ORDER BY fechaingreso) stocks FROM articulo a left JOIN lote l USING (idarticulo) WHERE l.estado=1 AND a.idempresa=$1 GROUP BY a.idarticulo, a.nombre, a.descripcion, a.cantidad, a.precioventa, a.idempresa, a.idusuario ORDER BY a.nombre;`;
                        let valuescompra = [idempresa];
                        let responsecompra = await conn.query(querycompra,valuescompra);
                        if(responsecompra.rowCount > 0){
                            return res.json({ok:true, data:responsecompra.rows})
                        }else{
                            return res.json({ok:false, data:[], mensaje:"Error al cargar detalles"})
                        }
                    }
                    let queryc = `SELECT * FROM categoria WHERE idempresa=$1`;
                    let valuesc = [idempresa];
                    let responsec = await conn.query(queryc,valuesc);
                    let query = `SELECT a.idarticulo as id, a.*, ARRAY_AGG (ac.idcategoria) categorias FROM articulo a left JOIN articulocategoria ac USING (idarticulo) WHERE a.idempresa=$1 GROUP BY a.idarticulo, a.nombre, a.descripcion, a.cantidad, a.precioventa, a.idempresa, a.idusuario order by a.cantidad` + (limit != undefined ? ` LIMIT ${limit};` : ';');
                    let values = [idempresa];
                    let response = await conn.query(query,values);
                    if(responsec.rowCount > 0){
                        if(response.rowCount > 0){
                            return res.json({ok:true, data:response.rows, categorias:responsec.rows})
                        }else{
                            return res.json({ok:true, data:[], categorias:responsec.rows})
                        }
                    }else{
                        return res.json({ok:false, data:[], categorias:[], mensaje:"No existen Categorias"})
                    }
                case "POST":
                    let {nombre,descripcion,precioventa, categorias} = body
                    let query0 = 'SELECT * FROM articulo WHERE nombre=$1 AND idempresa=$2';
                    let values0 = [nombre,idempresa];
                    let validacion1 = await conn.query(query0,values0);
                    if(validacion1.rowCount > 0){
                        return res.json({ok:false, mensaje:"Ya existe un artículo con ese nombre"})
                    }
                    let query2 = 'INSERT INTO articulo(nombre, descripcion, cantidad, precioventa, idempresa, idusuario) values($1,$2,$3,$4,$5,$6) RETURNING idarticulo';
                    let values2 = [nombre,descripcion,0,precioventa,idempresa, idusuario];
                    let response2 = await conn.query(query2,values2);
                    if(response2.rowCount == 1){
                        let idarticulo = response2.rows[0].idarticulo;
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
                        let query3 = "INSERT INTO articulocategoria(idarticulo, idcategoria) VALUES " + chunks.join(', ');
                        let values3 = params;
                        let response3 = await conn.query(query3,values3);
                        if(response3.rowCount >= 1){
                            return res.json({ok:true, mensaje:"Guardado con éxito"})
                        }else{
                            return res.json({ok:false, mensaje:"Error al guardar articulocategoria"})
                        }
                    }else{
                        return res.json({ok:false, mensaje:"No se pudo guardar la gestion"})
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

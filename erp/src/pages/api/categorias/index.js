/* eslint-disable import/no-anonymous-default-export */

import { conn } from "../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function categorias (req, res) {
        const {method,body} = req;
        if(req.session.user){
            const {idusuario} = req.session.user;
            const {idempresa} = req.session.user;
            switch (method) {
                case "GET":
                    let query = `SELECT * FROM categoria WHERE idempresa=$1`;
                    let values = [idempresa];
                    let response = await conn.query(query,values);
                        if(response.rowCount > 0){
                            return res.json({ok:true, data:response.rows, idempresa:idempresa})
                        }else{
                            return res.json({ok:false, data:[], idempresa:idempresa, mensaje:"No se encontraron Categorias"})
                        }
                        
                case "POST":
                    const {nombre,  descripcion, idcategoriapadre} = body;
                    let query0 = 'SELECT * FROM categoria WHERE nombre ILIKE $1 AND idempresa=$2';
                    let values0 = [nombre,idempresa];
                    let validacion0 = await conn.query(query0,values0);
                    if(validacion0.rowCount > 0){
                        return res.json({ok:false, mensaje:"Ya existe ese nombre de Categoria"})
                    }
                    let query1 = 'INSERT INTO categoria(nombre,descripcion,idempresa,idusuario,idcategoriapadre) values($1,$2,$3,$4,$5)';
                    let values1 = [nombre,descripcion,idempresa,idusuario,idcategoriapadre];
                    let responsePost = await conn.query(query1,values1);
                    if(responsePost.rowCount == 1){
                        return res.json({ok:true})
                    }else{
                        return res.json({ok:false, mensaje:"Error al crear Categoria"})
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
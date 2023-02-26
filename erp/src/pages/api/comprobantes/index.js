/* eslint-disable import/no-anonymous-default-export */

import { conn } from "../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
    async function comprobantes (req, res) {
        const {method,body} = req;
        if(req.session.user){
            const {idusuario, idempresa} = req.session.user;
            switch (method) {
                case "GET":
                    let query = 'SELECT idcomprobante as id, c.*, m.nombre as moneda from comprobante  c left join moneda m on m.idmoneda=c.idmoneda WHERE c.idusuario=$1 AND idempresa=$2 ORDER BY serie DESC';
                    let values = [idusuario, idempresa];
                    let response = await conn.query(query,values);
                    let query2 = 'SELECT cambio, idmonedaprincipal, idmonedaalternativa FROM empresamoneda WHERE idempresa=$1 AND activo=1 LIMIT 1';
                    let values2 =[idempresa];
                    let response2 = await conn.query(query2,values2);
                    if(response2.rowCount == 1){
                        let query3 = 'SELECT * FROM moneda WHERE idmoneda=$1 OR idmoneda=$2';
                        let values3 =[response2.rows[0].idmonedaprincipal,response2.rows[0].idmonedaalternativa];
                        let response3 = await conn.query(query3,values3);
                        return res.json({ok:true, data:response.rows, tipo_cambio: response2.rows[0].cambio, monedas: response3.rows})
                    }else{
                        return res.json({ok:true, data:response.rows, tipo_cambio: 1, monedas:[]})
                    }
                    
                case "POST":
                    const {glosa, fecha, tc, tipocomprobante, idmoneda, detalles} = body;
                    if(tipocomprobante==1){
                        let query4 = "SELECT * FROM comprobante c left join gestion g on c.idempresa=g.idempresa where tipocomprobante=1 AND c.idempresa=$1 AND c.estado>=0 AND $2 between fechainicio and fechafin LIMIT 1;";
                        let values4 = [idempresa, fecha];
                        let response4 = await conn.query(query4,values4);
                        if(response4.rowCount == 1){
                            return res.json({ok:false, mensaje:"Ya existe un comprobante de apertura para esta gestión"})
                        }
                    }
                    let query5 = "SELECT * FROM periodo p LEFT JOIN gestion g ON p.idgestion=g.idgestion WHERE ($1 BETWEEN p.fechainicio AND p.fechafin) AND p.estado=1 AND g.idempresa=$2 LIMIT 1";
                    let values5 = [fecha, idempresa];
                    let response5 = await conn.query(query5,values5);
                    if(response5.rowCount == 1){
                        let nueva_serie = await conn.query("select count(c.*), e.idmonedaprincipal  from comprobante c left join empresamoneda e on e.idempresa = c.idempresa where c.idempresa=$1 and e.activo=1 group by e.idmonedaprincipal",[idempresa])
                        let serie = 1;
                        let idmonpri = 1
                        if(nueva_serie.rowCount>0){
                            serie = parseInt(nueva_serie.rows[0].count)+1
                            idmonpri = nueva_serie.rows[0].idmonedaprincipal
                        }
                        let query6 = "INSERT INTO comprobante(serie, glosa, fecha, tc, estado, tipocomprobante, idusuario, idmoneda, idempresa) VALUES ($1, $2, $3, $4, 1, $5, $6, $7, $8) RETURNING idcomprobante, tc ;"
                        let values6 = [serie,glosa,fecha,tc,tipocomprobante,idusuario,idmoneda,idempresa]
                        let response6 = await conn.query(query6,values6);
                        
                        if(response6.rowCount == 1){
                            let idcomprobante = response6.rows[0].idcomprobante;
                            let tipo_cambio = response6.rows[0].tc;
                            var params = []
                            var chunks = []
                            detalles.forEach((d, i) => {
                                var valueClause = []
                                params.push(i+1)
                                valueClause.push('$' + params.length)
                                params.push(d.glosa)
                                valueClause.push('$' + params.length)
                                params.push(idmoneda == idmonpri ? d.debe : d.debe * tipo_cambio)
                                valueClause.push('$' + params.length)
                                params.push(idmoneda == idmonpri ? d.haber : d.haber * tipo_cambio)
                                valueClause.push('$' + params.length)
                                params.push(idmoneda != idmonpri ? d.debe : d.debe / tipo_cambio)
                                valueClause.push('$' + params.length)
                                params.push(idmoneda != idmonpri ? d.haber: d.haber / tipo_cambio)
                                valueClause.push('$' + params.length)
                                params.push(idusuario)
                                valueClause.push('$' + params.length)
                                params.push(idcomprobante)
                                valueClause.push('$' + params.length)
                                params.push(d.idcuenta)
                                valueClause.push('$' + params.length)
                                chunks.push('(' + valueClause.join(', ') + ')')
                            });
                            let query7 = "INSERT INTO detallecomprobante(numero, glosa, montodebe, montohaber, montodebealt, montohaberalt, idusuario, idcomprobante, idcuenta) VALUES " + chunks.join(', ');
                            let values7 = params;
                            let response7 = await conn.query(query7,values7);
                            if(response7.rowCount >= 2){
                                return res.json({ok:true, mensaje:"Guardado con éxito", datos:{idcomprobante: idcomprobante,serie: serie}})
                            }else{
                                return res.json({ok:false, mensaje:"Error al guardar detalles"})
                            }
                        }else{
                            return res.json({ok:false, mensaje:"Error al guardar comprobante"})
                        }
                    }else{
                        return res.json({ok:false, mensaje:"La fecha no pertenece a un periodo abierto de la empresa"})
                    }
                case "PUT":
                    let {idcomprobante,estado} = body
                    let query8 = "SELECT * FROM nota where idcomprobante=$1";
                    let values8 = [idcomprobante];
                    let response8 = await conn.query(query8,values8);
                    if(response8.rowCount >= 1){
                        return res.json({ok:false, mensaje:"Este comprobante pertenece a una nota, no se puede anular"})
                    }
                    let query9 = "UPDATE comprobante set estado=$1 WHERE idcomprobante=$2";
                    let values9 = [estado, idcomprobante];
                    let response9 = await conn.query(query9,values9);
                    if(response9.rowCount == 1){
                        return res.json({ok:true})
                    }else{
                        return res.json({ok:false, mensaje:"Ocurrio un error al anular el comprobante"})
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
/* eslint-disable import/no-anonymous-default-export */

import { conn } from "../../../utils/database";
import { withIronSessionApiRoute } from "iron-session/next";

async function generarComprobante(fecha , total, idnota, idusuario, idempresa){
    let query = 'SELECT caja, ventas, debitofiscal, it, itxpagar, estado FROM integracion WHERE idempresa=$1';
    let values = [idempresa];
    let response = await conn.query(query,values);
    if(response.rowCount==1){
        let integracion = response.rows[0];
        if(integracion.estado == 0) return false;
        let nueva_serie = await conn.query("select count(c.*), e.idmonedaprincipal, e.cambio  from comprobante c left join empresamoneda e on e.idempresa = c.idempresa where c.idempresa=$1 and e.activo=1 group by e.idmonedaprincipal, e.cambio;",[idempresa])
        let serie = 1;
        let idmonpri = 1;
        let tipocambio = 1
        if(nueva_serie.rowCount>0){
            serie = parseInt(nueva_serie.rows[0].count)+1
            idmonpri = nueva_serie.rows[0].idmonedaprincipal
            tipocambio = nueva_serie.rows[0].cambio
        }
        let query6 = "INSERT INTO comprobante(serie, glosa, fecha, tc, estado, tipocomprobante, idusuario, idmoneda, idempresa) VALUES ($1, $2, $3, $4, 1, $5, $6, $7, $8) RETURNING idcomprobante, tc ;"
        let values6 = [serie,"Venta de Mercaderias",fecha,tipocambio,2,idusuario,idmonpri,idempresa]
        let response6 = await conn.query(query6,values6);                
        if(response6.rowCount == 1){
            let idcomprobante = response6.rows[0].idcomprobante;
            let tipo_cambio = response6.rows[0].tc;
            var params = [];
            var chunks = [];
            var valueClause = [];
             //Cuenta Caja
             valueClause = []; 
             params.push(1) // nro
             valueClause.push('$' + params.length)
             params.push("Venta de Mercaderias") //glosa
             valueClause.push('$' + params.length)
             params.push(total) //debe
             valueClause.push('$' + params.length)
             params.push(0) //haber
             valueClause.push('$' + params.length)
             params.push(total / tipo_cambio) //debealt
             valueClause.push('$' + params.length)
             params.push(0) //haberalt
             valueClause.push('$' + params.length)
             params.push(idusuario) //idusuario
             valueClause.push('$' + params.length)
             params.push(idcomprobante) // idcomprobante
             valueClause.push('$' + params.length)
             params.push(integracion.caja) // idcuenta
             valueClause.push('$' + params.length)
             chunks.push('(' + valueClause.join(', ') + ')')
            //Cuenta IT
            valueClause = []; 
            params.push(2) // nro
            valueClause.push('$' + params.length)
            params.push("Venta de Mercaderias") //glosa
            valueClause.push('$' + params.length)
            params.push(total * 0.03) //debe
            valueClause.push('$' + params.length)
            params.push(0) //haber
            valueClause.push('$' + params.length)
            params.push((total * 0.03) / tipo_cambio) //debealt
            valueClause.push('$' + params.length)
            params.push(0) //haberalt
            valueClause.push('$' + params.length)
            params.push(idusuario) //idusuario
            valueClause.push('$' + params.length)
            params.push(idcomprobante) // idcomprobante
            valueClause.push('$' + params.length)
            params.push(integracion.it) // idcuenta
            valueClause.push('$' + params.length)
            chunks.push('(' + valueClause.join(', ') + ')')
            //Cuenta Debito Fiscal
            valueClause = []; 
            params.push(3) // nro
            valueClause.push('$' + params.length)
            params.push("Venta de Mercaderias") //glosa
            valueClause.push('$' + params.length)
            params.push(0) //debe
            valueClause.push('$' + params.length)
            params.push(total * 0.13) //haber
            valueClause.push('$' + params.length)
            params.push(0) //debealt
            valueClause.push('$' + params.length)
            params.push((total * 0.13) / tipo_cambio) //haberalt
            valueClause.push('$' + params.length)
            params.push(idusuario) //idusuario
            valueClause.push('$' + params.length)
            params.push(idcomprobante) // idcomprobante
            valueClause.push('$' + params.length)
            params.push(integracion.debitofiscal) // idcuenta
            valueClause.push('$' + params.length)
            chunks.push('(' + valueClause.join(', ') + ')')
            //Cuenta Ventas
            valueClause = []; 
            params.push(4) // nro
            valueClause.push('$' + params.length)
            params.push("Venta de Mercaderias") //glosa
            valueClause.push('$' + params.length)
            params.push(0) //debe
            valueClause.push('$' + params.length)
            params.push(total - (total * 0.13)) //haber
            valueClause.push('$' + params.length)
            params.push(0) //debealt
            valueClause.push('$' + params.length)
            params.push((total - (total * 0.13)) / tipo_cambio) //haberalt
            valueClause.push('$' + params.length)
            params.push(idusuario) //idusuario
            valueClause.push('$' + params.length)
            params.push(idcomprobante) // idcomprobante
            valueClause.push('$' + params.length)
            params.push(integracion.ventas) // idcuenta
            valueClause.push('$' + params.length)
            chunks.push('(' + valueClause.join(', ') + ')')
            //Cuenta IT por Pagar
            valueClause = []; 
            params.push(5) // nro
            valueClause.push('$' + params.length)
            params.push("Venta de Mercaderias") //glosa
            valueClause.push('$' + params.length)
            params.push(0) //debe
            valueClause.push('$' + params.length)
            params.push(total * 0.03) //haber
            valueClause.push('$' + params.length)
            params.push(0) //debealt
            valueClause.push('$' + params.length)
            params.push((total * 0.03) / tipo_cambio) //haberalt
            valueClause.push('$' + params.length)
            params.push(idusuario) //idusuario
            valueClause.push('$' + params.length)
            params.push(idcomprobante) // idcomprobante
            valueClause.push('$' + params.length)
            params.push(integracion.itxpagar) // idcuenta
            valueClause.push('$' + params.length)
            chunks.push('(' + valueClause.join(', ') + ')')
            
           
            let query7 = "INSERT INTO detallecomprobante(numero, glosa, montodebe, montohaber, montodebealt, montohaberalt, idusuario, idcomprobante, idcuenta) VALUES " + chunks.join(', ');
            let values7 = params;
            let response7 = await conn.query(query7,values7);
            if(response7.rowCount == 5){
                let query8 = "UPDATE nota SET idcomprobante=$1 WHERE idnota=$2";
                let values8 = [idcomprobante, idnota];
                let response8 = await conn.query(query8,values8);
                if(response8.rowCount == 1) return true
            }
        }
    }
    return false;
}

export default withIronSessionApiRoute(
    async function notasventa (req, res) {
        const {method,body} = req;
        if(req.session.user){
            const {idusuario, idempresa} = req.session.user;
            switch (method) {
                case "GET":
                    let query = 'SELECT idnota as id, n.* from nota n WHERE idempresa=$1 and tipo=2 ORDER BY fecha DESC , idnota';
                    let values = [idempresa];
                    let response = await conn.query(query,values);
                    if(response.rowCount >= 1){
                        return res.json({ok:true, data:response.rows})
                    }else{
                        return res.json({ok:true, data:[]})
                    }
                    
                case "POST":
                    const {descripcion, fecha, total, detalles} = body;
                    let query5 = "SELECT * FROM periodo p LEFT JOIN gestion g ON p.idgestion=g.idgestion WHERE ($1 BETWEEN p.fechainicio AND p.fechafin) AND p.estado=1 AND g.idempresa=$2 LIMIT 1";
                    let values5 = [fecha, idempresa];
                    let response5 = await conn.query(query5,values5);
                    if(response5.rowCount == 1){
                        let nuevo_nronota = await conn.query("select count(n.*) from nota n where idempresa=$1 and tipo=2",[idempresa])
                        let nronota = 1;
                        if(nuevo_nronota.rowCount>0){
                            nronota = parseInt(nuevo_nronota.rows[0].count)+1
                        }
                        let query6 = "INSERT INTO nota(nronota, fecha, descripcion, total, tipo, idusuario, idempresa, estado) VALUES ($1, $2, $3, $4, 2, $5, $6, 1) RETURNING idnota;"
                        let values6 = [nronota,fecha,descripcion,total,idusuario,idempresa]
                        let response6 = await conn.query(query6,values6);
                        
                        if(response6.rowCount == 1){
                            let idnota = response6.rows[0].idnota;
                            var params = []
                            var chunks = []
                            detalles.forEach((d, i) => {
                                var valueClause = []
                                params.push(d.idarticulo)
                                valueClause.push('$' + params.length)
                                params.push(d.nrolote)
                                valueClause.push('$' + params.length)
                                params.push(idnota)
                                valueClause.push('$' + params.length)
                                params.push(d.cantidad)
                                valueClause.push('$' + params.length)
                                params.push(d.precioventa)
                                valueClause.push('$' + params.length)
                                params.push(1)
                                valueClause.push('$' + params.length)
                                chunks.push('(' + valueClause.join(', ') + ')')
                            });
                            let query7 = "INSERT INTO detalle(idarticulo, nrolote, idnota, cantidad, precioventa, estado) VALUES " + chunks.join(', ');
                            let values7 = params;
                            let response7 = await conn.query(query7,values7);
                            if(response7.rowCount >= 1){
                                await generarComprobante(fecha, total, idnota, idusuario, idempresa);
                                return res.json({ok:true, mensaje:"Guardado con éxito", datos:{idnota: idnota,nronota: nronota}})
                            }else{
                                return res.json({ok:false, mensaje:"Error al guardar detalles"})
                            }
                        }else{
                            return res.json({ok:false, mensaje:"Error al guardar nota de venta"})
                        }
                    }else{
                        return res.json({ok:false, mensaje:"La fecha no pertenece a un periodo abierto de la empresa"})
                    }
                case "PUT":
                    let {idnota,estado} = body
                    let query8 = "UPDATE nota set estado=$1 WHERE idnota=$2 returning idcomprobante";
                    let values8 = [estado, idnota];
                    let response8 = await conn.query(query8,values8);
                    if(response8.rowCount == 1){
                        let query9 = "UPDATE detalle set estado=$1 WHERE idnota=$2";
                        let values9 = [estado, idnota];
                        let response9 = await conn.query(query9,values9);
                        if(response9.rowCount >= 1){
                            let query10 = "UPDATE comprobante set estado=$1 WHERE idcomprobante=$2";
                            let values10 = [estado, response8.rows[0].idcomprobante];
                            let response10 = await conn.query(query10,values10);
                            return res.json({ok:true})
                        }
                    }else{
                        return res.json({ok:false, mensaje:"Ocurrio un error al anular el nota de venta"})
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
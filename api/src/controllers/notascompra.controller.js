const { PrismaClient } = require("@prisma/client");
const { createComprobante } = require("./comprobantes.controller");

const prisma = new PrismaClient();

async function generarComprobante(params) {
  const { fecha, total, idnota, idusuario, idempresa } = params;
  const findIntegracion = await prisma.integracion.findFirst({
    where: {
      idempresa: Number(idempresa),
      estado: 1,
    },
  });
  if (!findIntegracion) {
    return false;
  }
  const { caja, compras, creditofiscal } = findIntegracion;
  const countComprobantes = await prisma.comprobante.count({
    where: {
      idempresa: Number(idempresa),
    },
  });
  const findMonedas = await prisma.empresamoneda.findFirst({
    where: {
      idempresa: Number(idempresa),
      activo: 1,
    },
    select: {
      idmonedaprincipal: true,
      cambio: true,
    },
  });
  let nueva_serie = countComprobantes + 1;
  let idmonpricipal = findMonedas.idmonedaprincipal;
  let tipocambio = findMonedas.cambio;
  const crearComprobante = prisma.comprobante.create({
    data: {
      serie: nueva_serie,
      glosa: "Compra de Mercaderías",
      fecha: new Date(fecha),
      tc: tipocambio,
      estado: 1,
      tipocomprobante: 3,
      idusuario,
      idempresa,
      idmoneda: idmonpricipal,
      detallecomprobante: {
        createMany: {
          data: [
            {
              numero: 0,
              glosa: "Compra de Mercaderías",
              montodebe: total - total * 0.13,
              montohaber: 0,
              montodebealt: total - (total * 0.13) / tipocambio,
              montohaberalt: 0,
              idusuario,
              idcuenta: compras,
            },
            {
              numero: 1,
              glosa: "Compra de Mercaderías",
              montodebe: total * 0.13,
              montohaber: 0,
              montodebealt: (total * 0.13) / tipocambio,
              montohaberalt: 0,
              idusuario,
              idcuenta: creditofiscal,
            },
            {
              numero: 2,
              glosa: "Compra de Mercaderías",
              montodebe: 0,
              montohaber: total,
              montodebealt: 0,
              montohaberalt: total / tipocambio,
              idusuario,
              idcuenta: caja,
            },
          ],
        },
      },
    },
  });
  if (crearComprobante) {
    await prisma.nota.update({
      where: {
        idnota: Number(idnota),
      },
      data: {
        idcomprobante: (await crearComprobante).idcomprobante,
      },
    });
    return true;
  }
}

module.exports = {
  getNotasCompra: async (req, res) => {
    try {
      const { idempresa } = req.user;
      const findNotasCompra = await prisma.nota.findMany({
        where: {
          idempresa,
          tipo: 1,
        },
        orderBy: {
          fecha: "desc",
        },
      });
      if (findNotasCompra) {
        let _findNotasCompra = findNotasCompra.map((nota) => {
          return {
            ...nota,
            id: nota.idnota,
          };
        });
        return res.json({
          ok: true,
          data: _findNotasCompra,
        });
      } else {
        return res.json({
          ok: true,
          data: [],
        });
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ ok: false, mensaje: "Bad Request" });
    }
  },
  getNotasCompraArticulos: async (req, res) => {
    try {
      const { idempresa } = req.user;
      const findArticulo = await prisma.articulo.findMany({
        where: {
          idempresa,
        },
      });
      if (findArticulo) {
        let _findArticulo = findArticulo.map((art) => {
          return {
            ...art,
            id: art.idarticulo,
          };
        });
        return res.json({
          ok: true,
          data: _findArticulo,
        });
      } else {
        return res.json({
          ok: true,
          data: [],
        });
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ ok: false, mensaje: "Bad Request" });
    }
  },
  getDetallesNotaCompra: async (req, res) => {
    try {
      const { idnota } = req.params;
      const findLotes = await prisma.lote.findMany({
        where: {
          idnota: Number(idnota),
        },
        include: {
          articulo: true,
        },
      });
      if (findLotes) {
        let _findLotes = findLotes.map((lote) => {
          return {
            ...lote,
            id: lote.idarticulo,
            nombre: lote.articulo.nombre,
            subtotal: lote.cantidad * lote.preciocompra,
          };
        });
        return res.json({
          ok: true,
          data: _findLotes,
        });
      } else {
        return res.json({
          ok: true,
          data: [],
          mensaje: "No se encontraron lotes",
        });
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ ok: false, mensaje: "Bad Request" });
    }
  },
  createNotasCompra: async (req, res) => {
    try {
      const { idempresa, idusuario } = req.user;
      const { descripcion, fecha, total, detalles } = req.body;
      const validarFecha = await prisma.$queryRaw`
        SELECT * FROM periodo p LEFT JOIN gestion g ON p.idgestion=g.idgestion WHERE (${fecha}::date BETWEEN p.fechainicio AND p.fechafin) AND p.estado=1 AND g.idempresa=${idempresa} LIMIT 1
      `;
      if (!validarFecha.length) {
        res.json({
          ok: false,
          mensaje: "La fecha no pertenece a un periodo abierto de la empresa",
        });
      } else {
        let nronota = 1;
        const countNotas = await prisma.nota.count({
          where: {
            idempresa,
            tipo: 1,
          },
        });
        if (countNotas) {
          nronota = countNotas + 1;
        }
        const crearNota = await prisma.nota.create({
          data: {
            nronota,
            fecha: new Date(fecha),
            descripcion,
            total: Number(total),
            tipo: 1,
            estado: 1,
            idusuario,
            idempresa,
            lote: {
              createMany: {
                data: detalles.map((d) => {
                  return {
                    idarticulo: d.idarticulo,
                    nrolote: 0,
                    fechaingreso: new Date(fecha),
                    fechavencimiento:
                      d.fechavencimiento != ""
                        ? new Date(d.fechavencimiento)
                        : null,
                    cantidad: d.cantidad,
                    preciocompra: d.preciocompra,
                    stock: d.cantidad,
                    estado: 1,
                  };
                }),
              },
            },
          },
        });
        if (crearNota) {
          await generarComprobante({
            fecha,
            total,
            idnota: crearNota.idnota,
            idusuario,
            idempresa,
          });
          res.json({
            ok: true,
            mensaje: "Nota de Compra creada",
            data: crearNota,
          });
        } else {
          res.json({ ok: false, mensaje: "Error al crear Nota de Compra" });
        }
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ ok: false, mensaje: "Bad Request" });
    }
  },
  anularNotaCompra: async (req, res) => {
    try {
      let { idnota, estado } = req.body;
      const validarVentas = await prisma.$queryRaw`
          SELECT * FROM detalle d LEFT JOIN lote l ON d.idarticulo=l.idarticulo AND d.nrolote=l.nrolote WHERE l.idnota=${Number(
            idnota
          )}
          `;
      if (validarVentas) {
        res.json({
          ok: false,
          mensaje: "Ya existen ventas de estos lotes, no se puede anular",
        });
      } else {
        const updateNota = await prisma.nota.update({
          where: {
            idnota: Number(idnota),
          },
          data: {
            estado: Number(estado),
            lote: {
              updateMany: {
                where: {
                  idnota: Number(idnota),
                },
                data: {
                  estado: Number(estado),
                },
              },
            },
          },
        });
        if (updateNota) {
          if (updateNota.idcomprobante) {
            await prisma.comprobante.update({
              where: {
                idcomprobante: updateNota.idcomprobante,
              },
              data: {
                estado: Number(estado),
              },
            });
          }
          return res.json({
            ok: true,
            mensaje: "Nota de Compra anulada con Éxito",
            data: updateNota,
          });
        } else {
          return res.json({
            ok: false,
            mensaje: "Ocurrio un error al anular la nota de compra",
          });
        }
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ ok: false, mensaje: "Bad Request" });
    }
  },
};

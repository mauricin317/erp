const { PrismaClient } = require("@prisma/client");

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
  const { caja, ventas, debitofiscal, it, itxpagar } = findIntegracion;
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
      glosa: "Venta de Mercaderías",
      fecha: new Date(fecha),
      tc: tipocambio,
      estado: 1,
      tipocomprobante: 2,
      idusuario,
      idempresa,
      idmoneda: idmonpricipal,
      detallecomprobante: {
        createMany: {
          data: [
            {
              numero: 0,
              glosa: "Venta de Mercaderías",
              montodebe: total,
              montohaber: 0,
              montodebealt: total / tipocambio,
              montohaberalt: 0,
              idusuario,
              idcuenta: caja,
            },
            {
              numero: 1,
              glosa: "Venta de Mercaderías",
              montodebe: total * 0.03,
              montohaber: 0,
              montodebealt: (total * 0.03) / tipocambio,
              montohaberalt: 0,
              idusuario,
              idcuenta: it,
            },
            {
              numero: 2,
              glosa: "Venta de Mercaderías",
              montodebe: 0,
              montohaber: total * 0.13,
              montodebealt: 0,
              montohaberalt: (total * 0.13) / tipocambio,
              idusuario,
              idcuenta: debitofiscal,
            },
            {
              numero: 3,
              glosa: "Venta de Mercaderías",
              montodebe: 0,
              montohaber: total - total * 0.13,
              montodebealt: 0,
              montohaberalt: total - (total * 0.13) / tipocambio,
              idusuario,
              idcuenta: ventas,
            },
            {
              numero: 4,
              glosa: "Venta de Mercaderías",
              montodebe: 0,
              montohaber: total * 0.03,
              montodebealt: 0,
              montohaberalt: (total * 0.03) / tipocambio,
              idusuario,
              idcuenta: itxpagar,
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
  getNotasVenta: async (req, res) => {
    try {
      const { idempresa } = req.user;
      const findNotasVenta = await prisma.nota.findMany({
        where: {
          idempresa,
          tipo: 2,
        },
        orderBy: {
          fecha: "desc",
        },
      });
      if (findNotasVenta) {
        let _findNotasVenta = findNotasVenta.map((nota) => {
          return {
            ...nota,
            id: nota.idnota,
          };
        });
        return res.json({
          ok: true,
          data: _findNotasVenta,
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
  getNotasVentaArticulos: async (req, res) => {
    try {
      const { idempresa } = req.user;
      const findArticulo = await prisma.articulo.findMany({
        where: {
          idempresa,
        },
        include: {
          lote: {
            where: {
              estado: 1,
            },
            select: {
              idnota: true,
              nrolote: true,
              stock: true,
            },
            orderBy: {
              fechaingreso: "asc",
            },
          },
        },
        orderBy: {
          nombre: "asc",
        },
      });
      if (findArticulo) {
        let _findArticulo = findArticulo.map((art) => {
          return {
            ...art,
            id: art.idarticulo,
            lotes: art.lote.map((l) => {
              return l.nrolote;
            }),
            stocks: art.lote.reduce((acc, l) => {
              acc[l.nrolote] = l.stock;
              return acc;
            }, {}),
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
  getDetallesNotaVenta: async (req, res) => {
    try {
      const { idnota } = req.params;
      const findDetalles = await prisma.detalle.findMany({
        where: {
          idnota: Number(idnota),
        },
        include: {
          articulo: true,
        },
      });
      if (findDetalles) {
        let _findDetalles = findDetalles.map((detalle) => {
          return {
            ...detalle,
            id: detalle.idarticulo,
            nombre: detalle.articulo.nombre,
            subtotal: detalle.cantidad * detalle.precioventa,
          };
        });
        return res.json({
          ok: true,
          data: _findDetalles,
        });
      } else {
        return res.json({
          ok: true,
          data: [],
          mensaje: "No se encontraron detalles",
        });
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ ok: false, mensaje: "Bad Request" });
    }
  },
  createNotasVenta: async (req, res) => {
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
            tipo: 2,
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
            tipo: 2,
            estado: 1,
            idusuario,
            idempresa,
            detalle: {
              createMany: {
                data: detalles.map((d) => {
                  return {
                    idarticulo: d.idarticulo,
                    nrolote: d.nrolote,
                    cantidad: d.cantidad,
                    precioventa: d.precioventa,
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
            mensaje: "Nota de Venta creada",
            data: crearNota,
          });
        } else {
          res.json({ ok: false, mensaje: "Error al crear Nota de Venta" });
        }
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ ok: false, mensaje: "Bad Request" });
    }
  },
  anularNotaVenta: async (req, res) => {
    try {
      let { idnota, estado } = req.body;
      const updateNota = await prisma.nota.update({
        where: {
          idnota: Number(idnota),
        },
        data: {
          estado: Number(estado),
          detalle: {
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
          mensaje: "Nota de Venta anulada con Éxito",
          data: updateNota,
        });
      } else {
        return res.json({
          ok: false,
          mensaje: "Ocurrio un error al anular la nota de venta",
        });
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ ok: false, mensaje: "Bad Request" });
    }
  },
};

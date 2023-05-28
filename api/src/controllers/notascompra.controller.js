const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

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
      const { idempresa } = req.user;
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
  editArticulo: async (req, res) => {
    try {
      const { idarticulo } = req.params;
      const { idempresa } = req.user;
      let { nombre, descripcion, precioventa, categorias } = req.body;
      const validarNombre = await prisma.articulo.findFirst({
        where: {
          nombre,
          idempresa,
          NOT: [{ idarticulo: Number(idarticulo) }],
        },
      });
      if (validarNombre) {
        res.json({ ok: false, mensaje: "Ya existe ese nombre de Articulo" });
      } else {
        await prisma.articulocategoria.deleteMany({
          where: {
            idarticulo: Number(idarticulo),
          },
        });
        const updateArticulo = await prisma.articulo.update({
          where: {
            idarticulo: Number(idarticulo),
          },
          data: {
            nombre,
            descripcion,
            precioventa,
            articulocategoria: {
              createMany: {
                data: categorias.map((cat) => {
                  return { idcategoria: cat.idcategoria };
                }),
              },
            },
          },
        });
        if (updateArticulo) {
          return res.json({
            ok: true,
            mensaje: "Articulo actualizada con Éxito",
            data: updateArticulo,
          });
        } else {
          return res.json({
            ok: false,
            mensaje: "No se pudo modificar la categoría",
          });
        }
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ ok: false, mensaje: "Bad Request" });
    }
  },
};

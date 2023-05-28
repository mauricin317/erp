const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
  getArticulos: async (req, res) => {
    try {
      const { idempresa } = req.user;
      const findCategorias = await prisma.categoria.findMany({
        where: {
          idempresa: idempresa,
        },
      });
      const findArticulos = await prisma.articulo.findMany({
        where: {
          idempresa: idempresa,
        },
        include: {
          articulocategoria: {
            include: {
              categoria: true,
            },
          },
        },
      });
      if (findArticulos) {
        let _findArticulos = findArticulos.map((art) => {
          return {
            ...art,
            id: art.idarticulo,
            categorias: art.articulocategoria.map((articulocategoria) => {
              return articulocategoria.categoria.idcategoria;
            }),
            articulocategoria: null,
          };
        });
        return res.json({
          ok: true,
          data: _findArticulos,
          categorias: findCategorias,
          idempresa: idempresa,
        });
      } else {
        return res.json({
          ok: true,
          idempresa: idempresa,
          data: [],
          categorias: findCategorias,
        });
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ ok: false, mensaje: "Bad Request" });
    }
  },
  createArticulo: async (req, res) => {
    try {
      const { idempresa, idusuario } = req.user;
      let { nombre, descripcion, precioventa, categorias } = req.body;
      const validarNombre = await prisma.articulo.findFirst({
        where: {
          AND: [{ nombre: nombre }, { idempresa: idempresa }],
        },
      });
      if (validarNombre) {
        res.json({ ok: false, mensaje: "Ya existe ese nombre de articulo" });
      } else {
        const crearArticulo = await prisma.articulo.create({
          data: {
            nombre,
            descripcion,
            cantidad: 0,
            precioventa,
            idempresa,
            idusuario,
            articulocategoria: {
              createMany: {
                data: categorias.map((cat) => {
                  return { idcategoria: cat.idcategoria };
                }),
              },
            },
          },
        });
        if (crearArticulo) {
          res.json({
            ok: true,
            mensaje: "Articulo creada",
            data: crearArticulo,
          });
        } else {
          res.json({ ok: false, mensaje: "Error al crear Articulo" });
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
  deleteArticulo: async (req, res) => {
    try {
      const { idarticulo } = req.params;
      const validarRelacion = await prisma.lote.findFirst({
        where: {
          idarticulo: Number(idarticulo),
        },
      });
      if (validarRelacion) {
        res.json({
          ok: false,
          mensaje: "Esta artículo ya está relacionada",
        });
      } else {
        await prisma.articulocategoria.deleteMany({
          where: {
            idarticulo: Number(idarticulo),
          },
        });
        const deleteArticulo = await prisma.articulo.delete({
          where: {
            idarticulo: Number(idarticulo),
          },
        });
        if (deleteArticulo) {
          return res.json({
            ok: true,
            mensaje: "Eliminado con Éxito",
            data: deleteArticulo,
          });
        } else {
          return res.json({
            ok: false,
            mensaje: "Error al eliminar la categoria",
          });
        }
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ ok: false, mensaje: error.message });
    }
  },
};

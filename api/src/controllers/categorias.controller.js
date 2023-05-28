const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
  getCategorias: async (req, res) => {
    try {
      const { idempresa } = req.user;
      const findCategorias = await prisma.categoria.findMany({
        where: {
          idempresa: idempresa,
        },
      });
      if (findCategorias) {
        return res.json({
          ok: true,
          data: findCategorias,
          idempresa: idempresa,
        });
      } else {
        return res.json({
          ok: true,
          idempresa: idempresa,
          mensaje: "No se encontraron Categorias",
        });
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ ok: false, mensaje: "Bad Request" });
    }
  },
  createCategoria: async (req, res) => {
    try {
      const { idempresa, idusuario } = req.user;
      let { nombre, descripcion, idcategoriapadre } = req.body;
      const validarNombre = await prisma.categoria.findFirst({
        where: {
          AND: [{ nombre: nombre }, { idempresa: idempresa }],
        },
      });
      if (validarNombre) {
        res.json({ ok: false, mensaje: "Ya existe ese nombre de categoria" });
      } else {
        const crearCategoria = await prisma.categoria.create({
          data: {
            nombre,
            descripcion,
            idcategoriapadre: Number(idcategoriapadre) || null,
            idempresa,
            idusuario,
          },
        });
        if (crearCategoria) {
          res.json({
            ok: true,
            mensaje: "Categoría creada",
            data: crearCategoria,
          });
        } else {
          res.json({ ok: false, mensaje: "Error al crear Categoría" });
        }
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ ok: false, mensaje: "Bad Request" });
    }
  },
  editCategoria: async (req, res) => {
    try {
      const { idcategoria } = req.params;
      const { idempresa, idusuario } = req.user;
      let { nombre, descripcion } = req.body;
      const validarNombre = await prisma.categoria.findFirst({
        where: {
          nombre,
          idempresa,
          NOT: [{ idcategoria: Number(idcategoria) }],
        },
      });
      if (validarNombre) {
        res.json({ ok: false, mensaje: "Ya existe ese nombre de Categoria" });
      } else {
        const updateCategoria = await prisma.categoria.update({
          where: {
            idcategoria: Number(idcategoria),
          },
          data: {
            nombre,
            descripcion,
          },
        });
        if (updateCategoria) {
          return res.json({
            ok: true,
            mensaje: "Categoria actualizada con Éxito",
            data: updateCategoria,
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
  deleteCategoria: async (req, res) => {
    try {
      const { idcategoria } = req.params;
      const validarRelacion = await prisma.articulocategoria.findFirst({
        where: {
          idcategoria: Number(idcategoria),
        },
      });
      if (validarRelacion) {
        res.json({
          ok: false,
          mensaje: "Esta categoría ya está relacionada",
        });
      } else {
        const deleteCategoria = await prisma.categoria.delete({
          where: {
            idcategoria: Number(idcategoria),
          },
        });
        if (deleteCategoria) {
          return res.json({
            ok: true,
            mensaje: "Eliminado con Éxito",
            data: deleteCategoria,
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

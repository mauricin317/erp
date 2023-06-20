const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
  getLimitArticulos: async (req, res) => {
    try {
      let { limit } = req.query;
      const { idempresa } = req.user;
      const findCategorias = await prisma.categoria.findMany({
        where: {
          idempresa: idempresa,
        },
      });
      const findDatos = await prisma.$queryRaw`
          SELECT a.idarticulo as id, a.*, ARRAY_AGG (ac.idcategoria) categorias FROM articulo a left JOIN articulocategoria ac USING (idarticulo) WHERE a.idempresa=${idempresa} GROUP BY a.idarticulo, a.nombre, a.descripcion, a.cantidad, a.precioventa, a.idempresa, a.idusuario order by a.cantidad limit ${Number(
        limit ?? 0
      )}
          `;
      if (findCategorias) {
        if (findDatos) {
          return res.json({
            ok: true,
            data: findDatos,
            categorias: findCategorias,
            idempresa: idempresa,
          });
        } else {
          return res.json({
            ok: true,
            data: [],
            categorias: findCategorias,
            idempresa: idempresa,
          });
        }
      } else {
        return res.json({
          ok: false,
          data: [],
          categorias: [],
          idempresa: idempresa,
          mensaje: "No existen Categorias",
        });
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ ok: false, mensaje: "Bad Request" });
    }
  },
  getLowStocks: async (req, res) => {
    try {
      const { idempresa } = req.user;
      const { idcategoria, cantidad } = req.query;
      const findDatos = await prisma.$queryRaw`
        SELECT a.idarticulo as id, a.*, ARRAY_AGG (ac.idcategoria) categorias FROM articulos_bajo_stock_chart(${idempresa}::int, ${idcategoria}::int, ${cantidad}::int) as a left JOIN articulocategoria ac USING (idarticulo) GROUP BY a.idarticulo, a.nombre, a.cantidad order by a.cantidad
        `;
      if (findDatos) {
        return res.json({ ok: true, data: findDatos, idempresa: idempresa });
      } else {
        return res.json({
          ok: true,
          data: [],
          idempresa: idempresa,
          mensaje: "Error al cargar datos",
        });
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ ok: false, mensaje: "Bad Request" });
    }
  },
};

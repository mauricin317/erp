const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
  getLotesArticulo: async (req, res) => {
    try {
      const { idarticulo } = req.params;
      const { idempresa } = req.user;
      const findLotes = await prisma.lote.findMany({
        where: {
          idarticulo: Number(idarticulo),
        },
        orderBy: {
          fechaingreso: "desc",
        },
      });
      if (findLotes) {
        let _findLotes = findLotes.map((lote) => {
          return {
            ...lote,
            id: lote.nrolote,
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
          mensaje: "No se encontraron Lotes",
        });
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(400).json({ ok: false, mensaje: "Bad Request" });
    }
  },
};

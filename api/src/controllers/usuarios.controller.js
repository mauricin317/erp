const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = {
    getUsers: async (req, res) => {
        try {
            const allUsers = await prisma.usuario.findMany()
            res.json(allUsers);
        } catch (error) {
            console.log(error.message);
            res.status(400).json({ok:false})
        }
    },
}
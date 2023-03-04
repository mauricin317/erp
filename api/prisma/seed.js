const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()


async function main() {

  const admin = await prisma.usuario.upsert({
    where: { usuario: 'admin' },
    update: {},
    create: {
      nombre: 'Administrador',
      usuario: 'admin',
      pass: 'admin123',
      moneda: {
        create: [{
          nombre: 'Boliviano',
          descripcion: 'Boliviano',
          abreviatura: 'Bs',
        },{
          nombre: 'Dolar',
          descripcion: 'Dolar Estadounidense',
          abreviatura: 'USD',
        }],
      },
    },
  })

  console.log({ admin })

}

main()

  .then(async () => {

    await prisma.$disconnect()

  })

  .catch(async (e) => {

    console.error(e)

    await prisma.$disconnect()

    process.exit(1)

  })
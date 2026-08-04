import { PrismaClient } from '@prisma/client'
import { scryptSync, randomBytes } from 'crypto'

const prisma = new PrismaClient()

function hashPassword(password: string, salt: Buffer) {
  return scryptSync(password, salt, 64).toString('hex')
}

async function seedAdminUser() {
  const email = (process.env.ADMIN_EMAIL || 'sharol@sharol.tienda').toLowerCase()
  const password = process.env.ADMIN_PASSWORD || 'SharolAdmin2026!'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`✓ Usuario admin ya existe: ${email}`)
    return
  }

  const salt = randomBytes(32)
  await prisma.user.create({
    data: {
      name: 'Sharol',
      email,
      passwordHash: hashPassword(password, salt),
      salt: salt.toString('hex'),
      role: 'ADMIN',
    },
  })
  console.log(`✓ Usuario admin creado: ${email}`)
}

async function main() {
  await prisma.passwordResetToken.deleteMany()
  await prisma.loginAttempt.deleteMany()
  await prisma.session.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  const catJoyas = await prisma.category.create({
    data: { name: 'Joyas', slug: 'joyas' },
  })
  const catCarteras = await prisma.category.create({
    data: { name: 'Carteras', slug: 'carteras' },
  })
  const catZapatos = await prisma.category.create({
    data: { name: 'Zapatos', slug: 'zapatos' },
  })
  const catRopa = await prisma.category.create({
    data: { name: 'Ropa', slug: 'ropa' },
  })

  // Nota: actualmente todas las fotos de public/ son aretes (joyas).
  // Se asignan a la categoría Joyas. Las categorías Carteras/Zapatos/Ropa
  // aparecerán cuando se suban productos reales desde el panel de administración.
  await prisma.product.create({
    data: {
      name: 'Aretes Elegantes Dorados',
      description: 'Aretes finos exclusivos de la nueva colección. Ideales para resaltar con estilo y elegancia.',
      price: 55.00,
      stock: 15,
      images: '/WhatsApp Image 2026-07-14 at 12.04.28 PM.jpeg',
      categoryId: catJoyas.id,
    },
  })

  await prisma.product.create({
    data: {
      name: 'Joya Exclusiva Brillante',
      description: 'Detalle fino con incrustaciones de alta calidad. Para mujeres que van por más.',
      price: 45.00,
      stock: 20,
      images: '/WhatsApp Image 2026-07-14 at 12.04.27 PM.jpeg',
      categoryId: catJoyas.id,
    },
  })

  await prisma.product.create({
    data: {
      name: 'Aretes Glam Statement',
      description: 'Aretes llamativos con acabado dorado, perfectos para un look con personalidad.',
      price: 120.00,
      stock: 8,
      images: '/WhatsApp Image 2026-07-14 at 12.04.21 PM.jpeg',
      categoryId: catJoyas.id,
    },
  })

  await prisma.product.create({
    data: {
      name: 'Joya de Día a Noche',
      description: 'Pieza versátil que realza cualquier ocasión con elegancia y sofisticación.',
      price: 150.00,
      stock: 10,
      images: '/WhatsApp Image 2026-07-14 at 12.04.19 PM.jpeg',
      categoryId: catJoyas.id,
    },
  })

  await prisma.product.create({
    data: {
      name: 'Aretes Casual Chic',
      description: 'Diseño exclusivo con excelente terminación y estilo inigualable.',
      price: 180.00,
      stock: 6,
      images: '/WhatsApp Image 2026-07-14 at 12.04.20 PM.jpeg',
      categoryId: catJoyas.id,
    },
  })

  await seedAdminUser()

  await prisma.review.createMany({
    data: [
      {
        name: 'María Fernanda',
        city: 'Lima',
        rating: 5,
        comment:
          'Los aretes son preciosos, se nota la calidad. El envío llegó rápido y muy bien empacado. Volveré a comprar sin dudarlo.',
      },
      {
        name: 'Camila R.',
        city: 'Arequipa',
        rating: 5,
        comment:
          'Compré una joya de la colección y es tal cual la foto, elegante y luminosa. La atención por WhatsApp fue súper amable.',
      },
      {
        name: 'Valeria T.',
        city: 'Trujillo',
        rating: 5,
        comment:
          'Me encantó todo el proceso: desde la compra hasta la confirmación. Los aretes son cómodos y hermosos.',
      },
    ],
  })

  console.log('¡Nombres y descripciones actualizados correctamente con las fotos reales!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { prisma } from '@backend/db'

export const productRepository = {
  findAllWithCategory() {
    return prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })
  },

  findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true },
    })
  },

  create(data: {
    name: string
    description: string
    price: number
    stock: number
    images: string
    categoryId: string
  }) {
    return prisma.product.create({ data })
  },

  update(
    id: string,
    data: {
      name: string
      description: string
      price: number
      stock: number
      images: string
      categoryId: string
    }
  ) {
    return prisma.product.update({ where: { id }, data })
  },

  delete(id: string) {
    return prisma.product.delete({ where: { id } })
  },
}

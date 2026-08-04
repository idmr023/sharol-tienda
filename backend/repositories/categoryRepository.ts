import { prisma } from '@backend/db'

export const categoryRepository = {
  findAll() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } })
  },

  create(name: string, slug: string) {
    return prisma.category.create({ data: { name, slug } })
  },

  delete(id: string) {
    return prisma.category.delete({ where: { id } })
  },
}

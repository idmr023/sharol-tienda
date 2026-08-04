import { prisma } from '@backend/db'
import type { ValidReviewInput } from '@backend/validation/reviews'

export const reviewRepository = {
  findAll() {
    return prisma.review.findMany({ orderBy: { createdAt: 'desc' } })
  },
  create(input: ValidReviewInput, userId?: string) {
    return prisma.review.create({
      data: {
        name: input.name,
        city: input.city,
        rating: input.rating,
        comment: input.comment,
        userId: userId || null,
      },
    })
  },
}

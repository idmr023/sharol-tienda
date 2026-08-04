import { ValidationError } from './errors'

export interface ReviewInput {
  name?: unknown
  city?: unknown
  rating?: unknown
  comment?: unknown
}

export interface ValidReviewInput {
  name: string
  city: string
  rating: number
  comment: string
}

export function parseReviewInput(input: ReviewInput): ValidReviewInput {
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  const city = typeof input.city === 'string' ? input.city.trim() : 'Lima'
  const ratingNum = Number(input.rating)
  const comment = typeof input.comment === 'string' ? input.comment.trim() : ''

  if (!name || name.length > 80) {
    throw new ValidationError('El nombre es obligatorio (máx. 80 caracteres)')
  }
  if (!city || city.length > 60) {
    throw new ValidationError('La ciudad es obligatoria')
  }
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    throw new ValidationError('La calificación debe ser un número entero entre 1 y 5')
  }
  if (!comment || comment.length > 500) {
    throw new ValidationError('El comentario es obligatorio (máx. 500 caracteres)')
  }

  return { name, city, rating: ratingNum, comment }
}

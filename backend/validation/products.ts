import { ValidationError } from './errors'

export interface ProductInput {
  name?: unknown
  description?: unknown
  price?: unknown
  stock?: unknown
  images?: unknown
  categoryId?: unknown
}

export interface ValidProductInput {
  name: string
  description: string
  price: number
  stock: number
  images: string
  categoryId: string
}

const IMAGE_URL_PATTERN = /^(https?:\/\/|\/)/

export function parseProductInput(input: ProductInput): ValidProductInput {
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  const description = typeof input.description === 'string' ? input.description.trim() : ''
  const images = typeof input.images === 'string' ? input.images.trim() : ''
  const categoryId = typeof input.categoryId === 'string' ? input.categoryId.trim() : ''

  const price = typeof input.price === 'number' ? input.price : Number(input.price)
  const stock = typeof input.stock === 'number' ? input.stock : Number(input.stock)

  if (!name || name.length > 120) {
    throw new ValidationError('El nombre es obligatorio (máx. 120 caracteres)')
  }
  if (!description || description.length > 2000) {
    throw new ValidationError('La descripción es obligatoria (máx. 2000 caracteres)')
  }
  if (!Number.isFinite(price) || price <= 0) {
    throw new ValidationError('El precio debe ser un número positivo')
  }
  if (!Number.isInteger(stock) || stock < 0) {
    throw new ValidationError('El stock debe ser un entero mayor o igual a 0')
  }
  if (!images || !IMAGE_URL_PATTERN.test(images)) {
    throw new ValidationError('La imagen debe ser una URL válida o una ruta local')
  }
  if (!categoryId) {
    throw new ValidationError('La categoría es obligatoria')
  }

  return { name, description, price, stock, images, categoryId }
}

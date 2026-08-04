import { describe, expect, it } from 'vitest'
import { parseProductInput } from './products'
import { ValidationError } from './errors'

const validInput = {
  name: 'Anillo de Plata',
  description: 'Anillo fino de plata esterlina.',
  price: 45.5,
  stock: 10,
  images: '/anillo.jpeg',
  categoryId: 'cat-1',
}

describe('parseProductInput', () => {
  it('acepta un producto válido', () => {
    expect(parseProductInput(validInput)).toMatchObject({
      name: 'Anillo de Plata',
      price: 45.5,
      stock: 10,
    })
  })

  it('convierte precios y stock enviados como strings (formulario)', () => {
    const result = parseProductInput({ ...validInput, price: '45.5', stock: '10' })
    expect(result.price).toBe(45.5)
    expect(result.stock).toBe(10)
  })

  it('rechaza precios no positivos', () => {
    expect(() => parseProductInput({ ...validInput, price: 0 })).toThrow(ValidationError)
    expect(() => parseProductInput({ ...validInput, price: -5 })).toThrow(ValidationError)
  })

  it('rechaza stock negativo o no entero', () => {
    expect(() => parseProductInput({ ...validInput, stock: -1 })).toThrow(ValidationError)
    expect(() => parseProductInput({ ...validInput, stock: 2.5 })).toThrow(ValidationError)
  })

  it('rechaza URLs de imagen no válidas', () => {
    expect(() => parseProductInput({ ...validInput, images: 'javascript:alert(1)' })).toThrow(
      ValidationError
    )
  })

  it('acepta rutas locales como imagen', () => {
    expect(parseProductInput({ ...validInput, images: '/foto.jpeg' }).images).toBe('/foto.jpeg')
  })

  it('rechaza nombre vacío', () => {
    expect(() => parseProductInput({ ...validInput, name: '   ' })).toThrow(ValidationError)
  })
})

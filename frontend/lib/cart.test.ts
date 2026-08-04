import { describe, expect, it } from 'vitest'
import {
  addToCart,
  cartTotals,
  removeFromCart,
  updateQuantity,
  type CartItem,
} from './cart'

const watch: CartItem = {
  id: 'p1',
  name: 'Aretes',
  price: 55,
  images: '/a.jpeg',
  quantity: 1,
}

const ring: CartItem = {
  id: 'p2',
  name: 'Anillo',
  price: 45,
  images: '/b.jpeg',
  quantity: 2,
}

describe('addToCart', () => {
  it('agrega un producto nuevo con cantidad 1', () => {
    const result = addToCart([], { id: 'p1', name: 'Aretes', price: 55, images: '/a.jpeg' })
    expect(result).toEqual([watch])
  })

  it('incrementa la cantidad si el producto ya existe', () => {
    const result = addToCart([watch], { id: 'p1', name: 'Aretes', price: 55, images: '/a.jpeg' })
    expect(result).toEqual([{ ...watch, quantity: 2 }])
  })

  it('no muta el carrito original', () => {
    const original = [watch]
    const result = addToCart(original, { id: 'p3', name: 'Cartera', price: 120, images: '/c.jpeg' })
    expect(original).toEqual([watch])
    expect(result).toHaveLength(2)
  })
})

describe('removeFromCart', () => {
  it('elimina el producto indicado', () => {
    expect(removeFromCart([watch, ring], 'p1')).toEqual([ring])
  })

  it('devuelve el mismo carrito si el id no existe', () => {
    expect(removeFromCart([watch], 'no-existe')).toEqual([watch])
  })
})

describe('updateQuantity', () => {
  it('actualiza la cantidad con el delta', () => {
    expect(updateQuantity([watch], 'p1', 3)).toEqual([{ ...watch, quantity: 4 }])
  })

  it('elimina el item si la cantidad llegaría a 0', () => {
    expect(updateQuantity([watch], 'p1', -1)).toEqual([])
  })

  it('no baja la cantidad por debajo de 1', () => {
    expect(updateQuantity([watch], 'p1', -1)).toEqual([])
  })

  it('ignora productos que no existen', () => {
    expect(updateQuantity([watch], 'p9', 1)).toEqual([watch])
  })
})

describe('cartTotals', () => {
  it('calcula total de items y precio', () => {
    expect(cartTotals([watch, ring])).toEqual({ totalItems: 3, totalPrice: 55 + 45 * 2 })
  })

  it('devuelve ceros para un carrito vacío', () => {
    expect(cartTotals([])).toEqual({ totalItems: 0, totalPrice: 0 })
  })
})

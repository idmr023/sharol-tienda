export interface CartItem {
  id: string
  name: string
  price: number
  images: string
  quantity: number
}

export type CartProduct = Omit<CartItem, 'quantity'>

const STORAGE_KEY = 'sharol_cart'

export function addToCart(
  cart: CartItem[],
  product: CartProduct,
  quantity = 1
): CartItem[] {
  const existing = cart.find((item) => item.id === product.id)
  if (existing) {
    return cart.map((item) =>
      item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
    )
  }
  return [...cart, { ...product, quantity }]
}

export function removeFromCart(cart: CartItem[], id: string): CartItem[] {
  return cart.filter((item) => item.id !== id)
}

export function updateQuantity(cart: CartItem[], id: string, delta: number): CartItem[] {
  return cart
    .map((item) => {
      if (item.id !== id) return item
      const nextQuantity = item.quantity + delta
      return nextQuantity > 0 ? { ...item, quantity: nextQuantity } : null
    })
    .filter((item): item is CartItem => item !== null)
}

export function cartTotals(cart: CartItem[]): { totalItems: number; totalPrice: number } {
  return cart.reduce(
    (totals, item) => ({
      totalItems: totals.totalItems + item.quantity,
      totalPrice: totals.totalPrice + item.price * item.quantity,
    }),
    { totalItems: 0, totalPrice: 0 }
  )
}

export function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as CartItem[]) : []
  } catch (error) {
    console.error('No se pudo leer el carrito guardado:', error)
    return []
  }
}

export function persistCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  } catch (error) {
    console.error('No se pudo guardar el carrito:', error)
  }
}

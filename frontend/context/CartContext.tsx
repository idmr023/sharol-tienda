'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import {
  addToCart as addToCartPure,
  removeFromCart as removeFromCartPure,
  updateQuantity as updateQuantityPure,
  cartTotals,
  loadCartFromStorage,
  persistCart,
  type CartItem,
  type CartProduct,
} from '@frontend/lib/cart'

interface ToastState {
  id: number
  message: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: CartProduct, quantity?: number) => void
  buyNow: (product: CartProduct, quantity?: number) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, delta: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  toast: ToastState | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Cargar el carrito persistido una sola vez tras el mount.
    // No se usa inicializador lazy porque rompería la hidratación SSR (localStorage no existe en el servidor).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(loadCartFromStorage())
  }, [])

  useEffect(() => {
    persistCart(cart)
  }, [cart])

  const showToast = useCallback((message: string) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    setToast({ id: Date.now(), message })
    toastTimeout.current = setTimeout(() => setToast(null), 2200)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current)
    }
  }, [])

  const addToCart = useCallback(
    (product: CartProduct, quantity?: number) => {
      setCart((prev) => addToCartPure(prev, product, quantity))
      showToast('Añadido al carrito')
    },
    [showToast]
  )

  const buyNow = useCallback(
    (product: CartProduct, quantity?: number) => {
      setCart((prev) => addToCartPure(prev, product, quantity))
      setIsCartOpen(true)
    },
    []
  )

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => removeFromCartPure(prev, id))
  }, [])

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart((prev) => updateQuantityPure(prev, id, delta))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const { totalItems, totalPrice } = cartTotals(cart)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        buyNow,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        toast,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}

'use client'

import React from 'react'
import { useCart } from '@frontend/context/CartContext'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CartEmpty } from '@frontend/components/CartEmpty'
import { CartItemsList } from '@frontend/components/CartItemsList'
import { CartSummary } from '@frontend/components/CartSummary'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart()

  const handleCheckout = () => {
    window.location.href = '/checkout'
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-rose-900/40 pb-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-rose-400 hover:text-white text-xs font-semibold uppercase tracking-wider mb-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la tienda</span>
            </Link>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Tu Carrito de Compras
            </h1>
          </div>
          <span className="text-xs px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-widest font-semibold">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}{' '}
            {cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'Artículo' : 'Artículos'}
          </span>
        </div>

        {cart.length === 0 ? (
          <CartEmpty />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <CartItemsList
              cart={cart}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
            />
            <CartSummary totalPrice={totalPrice} onCheckout={handleCheckout} />
          </div>
        )}
      </div>
    </div>
  )
}
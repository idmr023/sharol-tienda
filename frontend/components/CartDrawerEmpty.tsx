'use client'

import React from 'react'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@frontend/context/CartContext'

export function CartDrawerEmpty() {
  const { setIsCartOpen } = useCart()

  const handleExplore = () => {
    setIsCartOpen(false)
  }

  return (
    <div className="text-center py-20 text-rose-300/60 space-y-6">
      <ShoppingBag className="w-16 h-16 mx-auto stroke-1" />
      <p className="font-serif text-lg text-white">Tu carrito está vacío</p>
      <p className="text-sm">Explora nuestras joyas, carteras y más.</p>
      <Link
        href="/"
        onClick={handleExplore}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-[0_0_20px_rgba(225,29,72,0.4)] transition active:scale-95"
      >
        <span>Explorar Tienda</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
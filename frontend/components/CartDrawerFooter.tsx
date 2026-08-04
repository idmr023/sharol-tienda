'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@frontend/lib/utils'
import { useCart } from '@frontend/context/CartContext'
import type { CartItem } from '@frontend/lib/cart'

export function CartDrawerFooter({ cart, totalPrice }: { cart: CartItem[]; totalPrice: number }) {
  const { setIsCartOpen } = useCart()
  const router = useRouter()

  if (cart.length === 0) return null

  const handleCheckout = () => {
    setIsCartOpen(false)
    router.push('/checkout')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="p-6 border-t border-rose-900/50 bg-black/40 space-y-4"
    >
      <div className="flex justify-between items-center text-lg font-serif font-bold text-white">
        <span>Total:</span>
        <span className="text-rose-400">{formatPrice(totalPrice)}</span>
      </div>
      <button
        onClick={handleCheckout}
        className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-[0.99]"
      >
        <span>Proceder al Pago</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  )
}
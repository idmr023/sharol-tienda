'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { formatPrice } from '@frontend/lib/utils'
import { useCart } from '@frontend/context/CartContext'
import type { CartItem } from '@frontend/lib/cart'

export function CartDrawerItems({ cart }: { cart: CartItem[] }) {
  const { removeFromCart } = useCart()

  return (
    <AnimatePresence initial={false}>
      {cart.map((item) => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.22 }}
          className="flex gap-4 p-4 rounded-xl bg-black/40 border border-rose-900/40 items-center"
        >
          <img
            src={item.images}
            alt={item.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-semibold text-white line-clamp-1">
              {item.name}
            </h3>
            <p className="text-rose-400 font-bold text-sm mt-1">
              {formatPrice(item.price)}
            </p>
            <p className="text-xs text-rose-300/70 mt-1">Cantidad: {item.quantity}</p>
          </div>
          <button
            onClick={() => removeFromCart(item.id)}
            aria-label={`Eliminar ${item.name}`}
            className="p-2 text-rose-400 hover:text-red-400 transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
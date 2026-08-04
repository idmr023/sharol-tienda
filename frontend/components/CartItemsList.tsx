'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus } from 'lucide-react'
import { formatPrice } from '@frontend/lib/utils'
import type { CartItem } from '@frontend/lib/cart'

interface CartItemsListProps {
  cart: CartItem[]
  updateQuantity: (id: string, delta: number) => void
  removeFromCart: (id: string) => void
}

export function CartItemsList({ cart, updateQuantity, removeFromCart }: CartItemsListProps) {
  return (
    <div className="lg:col-span-8 space-y-4">
      <AnimatePresence initial={false}>
        {cart.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="bg-[#121212] border border-rose-900/40 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 shadow-xl"
          >
            <img
              src={item.images}
              alt={item.name}
              className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-rose-900/50"
            />
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h3 className="font-serif font-bold text-lg text-white">{item.name}</h3>
              <p className="text-rose-400 font-semibold text-base">
                {formatPrice(item.price)}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-3 pt-3">
                <span className="text-xs text-rose-300/70 uppercase tracking-wider font-semibold">
                  Cantidad:
                </span>
                <div className="flex items-center border border-rose-900/60 rounded-xl bg-black/40 overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-2 hover:bg-rose-900/40 text-rose-300 transition"
                    title="Reducir cantidad"
                    aria-label={`Reducir cantidad de ${item.name}`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <motion.span
                    key={item.quantity}
                    initial={{ scale: 0.7, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-4 text-sm font-semibold text-white"
                  >
                    {item.quantity}
                  </motion.span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-2 hover:bg-rose-900/40 text-rose-300 transition"
                    title="Aumentar cantidad"
                    aria-label={`Aumentar cantidad de ${item.name}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-rose-300/60 block uppercase tracking-wider">
                  Subtotal
                </span>
                <span className="font-serif font-bold text-white text-lg">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"
                title="Eliminar producto"
                aria-label={`Eliminar ${item.name}`}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
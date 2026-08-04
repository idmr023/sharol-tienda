'use client'

import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ShoppingBag } from 'lucide-react'
import { useCart } from '@frontend/context/CartContext'
import { CartDrawerEmpty } from '@frontend/components/CartDrawerEmpty'
import { CartDrawerItems } from '@frontend/components/CartDrawerItems'
import { CartDrawerFooter } from '@frontend/components/CartDrawerFooter'

export function CartDrawer() {
  const { cart, removeFromCart, totalPrice, isCartOpen, setIsCartOpen } = useCart()

  useEffect(() => {
    if (isCartOpen) {
      document.body.classList.add('cart-open')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.classList.remove('cart-open')
      document.body.style.overflow = ''
    }
    return () => {
      document.body.classList.remove('cart-open')
      document.body.style.overflow = ''
    }
  }, [isCartOpen])

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="w-screen max-w-md bg-[#121212] text-white shadow-2xl flex flex-col border-l border-rose-500/20"
            >
              <div className="flex items-center justify-between p-6 border-b border-rose-900/50 bg-black/40">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-rose-400" />
                  <h2 className="font-serif text-xl font-bold text-white">Tu Carrito</h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  aria-label="Cerrar carrito"
                  className="p-2 rounded-full hover:bg-white/10 text-rose-300 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <CartDrawerEmpty />
                ) : (
                  <>
                    <CartDrawerItems cart={cart} />
                    <CartDrawerFooter cart={cart} totalPrice={totalPrice} />
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
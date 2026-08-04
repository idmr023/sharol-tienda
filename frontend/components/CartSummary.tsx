'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { formatPrice } from '@frontend/lib/utils'

interface CartSummaryProps {
  totalPrice: number
  onCheckout: () => void
}

export function CartSummary({ totalPrice, onCheckout }: CartSummaryProps) {

  return (
    <div className="lg:col-span-4 bg-[#121212] border border-rose-900/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl sticky top-28">
      <h2 className="font-serif text-xl font-bold text-white border-b border-rose-900/50 pb-4">
        Resumen de Compra
      </h2>

      <div className="space-y-3 text-sm text-rose-200/80">
        <div className="flex justify-between">
          <span>Subtotal productos</span>
          <span className="font-semibold text-white">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span>Envíos a todo el Perú</span>
          <span className="text-rose-400 font-medium">Calculado al pagar</span>
        </div>
      </div>

      <div className="pt-4 border-t border-rose-900/50 flex justify-between items-center font-serif font-bold text-xl text-white">
        <span>Total a Pagar</span>
        <span className="text-rose-400">{formatPrice(totalPrice)}</span>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onCheckout}
        className="w-full py-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-[0_0_25px_rgba(225,29,72,0.6)] transition flex items-center justify-center gap-2"
      >
        <span>Proceder al Pago</span>
        <ArrowRight className="w-5 h-5" />
      </motion.button>

      <p className="text-[11px] text-center text-rose-300/60 leading-relaxed">
        ✨ Compra 100% garantizada con atención personalizada y envíos seguros a Lima y
        provincias.
      </p>
    </div>
  )
}
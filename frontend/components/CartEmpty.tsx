'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function CartEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121212] border border-rose-900/40 rounded-3xl p-16 text-center space-y-6 shadow-2xl"
    >
      <ShoppingBag className="w-16 h-16 mx-auto text-rose-500/40 stroke-1" />
      <h2 className="font-serif text-2xl font-bold text-white">Tu carrito está vacío</h2>
      <p className="text-rose-300/70 text-sm max-w-md mx-auto">
        Explora nuestra colección exclusiva de joyas, carteras y moda para encontrar tu
        próxima pieza favorita.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-[0_0_20px_rgba(225,29,72,0.4)] transition active:scale-95"
      >
        <span>Explorar Colección</span>
        <ArrowRight className="w-5 h-5" />
      </Link>
    </motion.div>
  )
}
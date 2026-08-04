'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '@frontend/context/CartContext'
import { useWishlist } from '@frontend/context/WishlistContext'
import { AccountModal } from '@frontend/components/AccountModal'
import { ProductQuickView } from '@frontend/components/ProductQuickView'
import { ShoppingBag, Heart, Eye, Sparkles } from 'lucide-react'
import { formatPrice, parseImages } from '@frontend/lib/utils'

export interface CatalogProduct {
  id: string
  name: string
  description: string
  price: number
  stock: number
  images: string
  category: { name: string }
}

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { addToCart } = useCart()
  const { isFavorite, toggle } = useWishlist()
  const [accountOpen, setAccountOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)

  const favorite = isFavorite(product.id)
  const soldOut = product.stock <= 0
  const lowStock = !soldOut && product.stock <= 3
  const image = parseImages(product.images)[0] ?? '/logo.jpeg'

  const handleWishlist = async () => {
    const result = await toggle(product.id)
    if (result === 'login') setAccountOpen(true)
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="group bg-[#121212] border border-rose-900/40 rounded-3xl overflow-hidden shadow-xl hover:shadow-rose-950/50 hover:border-rose-700/60 transition flex flex-col"
      >
        <div
          className="relative aspect-[4/5] overflow-hidden bg-black/40 cursor-pointer"
          onClick={() => setQuickOpen(true)}
        >
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />

          <button
            onClick={(e) => {
              e.stopPropagation()
              handleWishlist()
            }}
            aria-label={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm border shadow-lg transition active:scale-90 ${
              favorite
                ? 'bg-rose-600 border-rose-400 text-white'
                : 'bg-black/40 border-rose-900/50 text-rose-200 hover:text-white hover:bg-rose-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
          </button>

          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-rose-200 text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1 border border-rose-900/50">
            <Sparkles className="w-3 h-3 text-rose-400" />
            {product.category.name}
          </span>

          {soldOut ? (
            <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
              Agotado
            </span>
          ) : lowStock ? (
            <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wider">
              ¡Últimas {product.stock}!
            </span>
          ) : null}

          <div className="absolute bottom-3 right-3 p-2 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition duration-300 shadow-lg">
            <Eye className="w-4 h-4" />
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <h3
            onClick={() => setQuickOpen(true)}
            className="font-serif text-lg font-bold text-white group-hover:text-rose-400 transition cursor-pointer"
          >
            {product.name}
          </h3>
          <p className="text-xs text-rose-200/60 mt-1 line-clamp-2 flex-1">{product.description}</p>
          <div className="mt-4 pt-4 border-t border-rose-900/40 flex items-center justify-between">
            <span className="text-xl font-serif font-bold text-rose-400">
              {formatPrice(product.price)}
            </span>
            <button
              disabled={soldOut}
              onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, images: image })}
              className="bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>
        </div>
      </motion.div>

      <ProductQuickView product={product} isOpen={quickOpen} onClose={() => setQuickOpen(false)} />
      <AccountModal isOpen={accountOpen} onClose={() => setAccountOpen(false)} />
    </>
  )
}

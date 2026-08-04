'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import { motion, animate } from 'framer-motion'
import { Sparkles, ArrowRight, ShoppingBag, Heart } from 'lucide-react'
import { useCart } from '@frontend/context/CartContext'
import { useWishlist } from '@frontend/context/WishlistContext'
import { AccountModal } from '@frontend/components/AccountModal'
import { formatPrice } from '@frontend/lib/utils'
import type { Product } from '@frontend/lib/types'

interface ShowroomProps {
  products: Product[]
  activeProduct: Product | null
  onSelect: (product: Product) => void
}

function AnimatedPrice({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)
  const previous = useRef(value)

  useEffect(() => {
    const controls = animate(previous.current, value, {
      duration: 0.45,
      ease: 'easeOut',
      onUpdate: (next) => setDisplay(next),
    })
    previous.current = value
    return () => controls.stop()
  }, [value])

  return <span>{formatPrice(Math.round(display * 100) / 100)}</span>
}

export const Showroom = forwardRef<HTMLDivElement, ShowroomProps>(function Showroom(
  { products, activeProduct, onSelect },
  ref
) {
  const { buyNow } = useCart()
  const { isFavorite, toggle } = useWishlist()
  const [accountOpen, setAccountOpen] = useState(false)

  const handleWishlist = async (product: Product) => {
    const result = await toggle(product.id)
    if (result === 'login') setAccountOpen(true)
  }

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-12 overflow-y-auto bg-gradient-to-b from-rose-950 via-rose-900 to-black"
    >
      {/* Main Showroom Grid */}
      <div className="max-w-7xl mx-auto w-full my-auto py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Colección Estelar</span>
          </div>
          <motion.h2
            key={activeProduct?.id ?? 'none'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight"
          >
            {activeProduct ? activeProduct.name : 'Joyas, Carteras & Moda'}
          </motion.h2>
          <p className="text-rose-200/80 text-base sm:text-lg font-light leading-relaxed">
            {activeProduct
              ? activeProduct.description
              : 'Selecciona una pieza abajo para explorar su diseño exclusivo, detalles y adquirirlo al instante con envíos a todo el Perú.'}
          </p>
          <div className="flex items-center gap-4 pt-2 flex-wrap">
            <span className="text-3xl font-serif font-bold text-rose-300">
              <AnimatedPrice value={activeProduct?.price ?? products[0]?.price ?? 0} />
            </span>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                const product = activeProduct ?? products[0]
                if (product) buyNow(product)
              }}
              className="px-8 py-4 rounded-full bg-white text-rose-950 font-semibold hover:bg-rose-100 shadow-xl transition flex items-center gap-2"
            >
              <span>¡Comprar Ahora!</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Product Carousel / Showcase Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 * index, ease: 'easeOut' }}
              onClick={() => onSelect(product)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelect(product)
              }}
              className={`group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer border-2 transition duration-300 shadow-2xl ${
                activeProduct?.id === product.id
                  ? 'border-rose-400 scale-[1.03]'
                  : 'border-rose-900/50 hover:border-rose-500'
              }`}
            >
              <img
                src={product.images}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleWishlist(product)
                }}
                aria-label={
                  isFavorite(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'
                }
                className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-sm border shadow-lg transition active:scale-90 ${
                  isFavorite(product.id)
                    ? 'bg-rose-600 border-rose-400 text-white'
                    : 'bg-black/40 border-rose-900/60 text-rose-200 hover:text-white hover:bg-rose-600'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-current' : ''}`}
                />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                <span className="text-[10px] text-rose-300 uppercase tracking-widest font-semibold">
                  {product.category.name}
                </span>
                <h3 className="font-serif font-bold text-sm text-white line-clamp-1">
                  {product.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AccountModal isOpen={accountOpen} onClose={() => setAccountOpen(false)} />
    </div>
  )
})

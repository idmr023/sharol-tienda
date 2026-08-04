'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Zap, ZoomIn } from 'lucide-react'
import { useCart } from '@frontend/context/CartContext'
import { formatPrice, parseImages } from '@frontend/lib/utils'

interface QuickViewProduct {
  id: string
  name: string
  description: string
  price: number
  stock: number
  images: string
  category: { name: string }
}

export function ProductQuickView({
  product,
  isOpen,
  onClose,
}: {
  product: QuickViewProduct | null
  isOpen: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && product && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-3xl bg-[#121212] border border-rose-900/40 rounded-3xl shadow-2xl p-6 sm:p-8"
          >
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-4 right-4 p-2 rounded-full text-rose-300 hover:text-white hover:bg-white/10 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <QuickViewBody product={product} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function QuickViewBody({ product }: { product: QuickViewProduct }) {
  const images = useMemo(() => {
    const parsed = parseImages(product.images)
    return parsed.length > 0 ? parsed : ['/logo.jpeg']
  }, [product.images])

  const [activeIndex, setActiveIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 })
  const [zoomed, setZoomed] = useState(false)
  const { addToCart, buyNow } = useCart()

  const soldOut = product.stock <= 0
  const lowStock = !soldOut && product.stock <= 3

  const handleZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomOrigin({ x, y })
  }

  const cartPayload = {
    id: product.id,
    name: product.name,
    price: product.price,
    images: images[0],
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <div
          className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-rose-900/40 bg-black/40"
          onMouseMove={handleZoom}
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
        >
          <img
            src={images[activeIndex]}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-200 ${
              zoomed ? 'scale-[2.2]' : 'scale-100'
            }`}
            style={{
              transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
            }}
          />
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-rose-300 text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1">
            <ZoomIn className="w-3 h-3" />
            Pasa el cursor para ver en detalle
          </div>
          {lowStock && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500/90 text-black text-[10px] font-bold uppercase tracking-wider">
              ¡Solo {product.stock} en stock!
            </span>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 mt-3">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver imagen ${index + 1}`}
                className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition ${
                  activeIndex === index
                    ? 'border-rose-500'
                    : 'border-rose-900/40 hover:border-rose-700'
                }`}
              >
                <img src={image} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-widest text-rose-400 font-semibold">
          {product.category.name}
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
          {product.name}
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-rose-200/80">{product.description}</p>

        <div className="mt-5 flex items-center gap-3">
          <span className="font-serif text-3xl font-bold text-rose-400">
            {formatPrice(product.price)}
          </span>
          {soldOut && (
            <span className="px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold">
              Agotado
            </span>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
            Cantidad
          </span>
          <div className="flex items-center gap-2 bg-black/40 border border-rose-900/50 rounded-xl px-2 py-1.5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Disminuir cantidad"
              className="p-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-white/10 transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-semibold text-white text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))}
              aria-label="Aumentar cantidad"
              className="p-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-white/10 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button
            disabled={soldOut}
            onClick={() => addToCart(cartPayload, quantity)}
            className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold shadow-md transition flex items-center justify-center gap-2 text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Agregar al carrito
          </button>
          <button
            disabled={soldOut}
            onClick={() => buyNow(cartPayload, quantity)}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-rose-200 font-medium transition flex items-center justify-center gap-2 text-sm"
          >
            <Zap className="w-4 h-4 text-rose-400" />
            Comprar ahora
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Heart, Loader2 } from 'lucide-react'
import { ProductCard, type CatalogProduct } from '@frontend/components/ProductCard'
import { useWishlist } from '@frontend/context/WishlistContext'
import { useAuth } from '@frontend/context/AuthContext'
import { AccountModal } from '@frontend/components/AccountModal'
import { formatPrice } from '@frontend/lib/utils'

type SortOption = 'recent' | 'price_asc' | 'price_desc'

export function CatalogClient({
  products,
  categories,
  initialQuery,
  initialWishlistOnly,
}: {
  products: CatalogProduct[]
  categories: { id: string; name: string }[]
  initialQuery: string
  initialWishlistOnly: boolean
}) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState<string>('all')
  const [sort, setSort] = useState<SortOption>('recent')
  const [maxPrice, setMaxPrice] = useState<number>(0)
  const [wishlistOnly, setWishlistOnly] = useState(initialWishlistOnly)
  const [accountOpen, setAccountOpen] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const { ids, isFavorite, loading: wishlistLoading } = useWishlist()

  const priceCap = useMemo(
    () => Math.max(...products.map((product) => product.price), 0),
    [products]
  )
  const effectiveMax = maxPrice > 0 ? maxPrice : priceCap

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = products.filter((product) => {
      if (category !== 'all' && product.category.name !== category) return false
      if (product.price > effectiveMax) return false
      if (q) {
        const haystack = `${product.name} ${product.description} ${product.category.name}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (wishlistOnly && !isFavorite(product.id)) return false
      return true
    })

    switch (sort) {
      case 'price_asc':
        list = [...list].sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        list = [...list].sort((a, b) => b.price - a.price)
        break
      default:
        break
    }
    return list
  }, [products, category, effectiveMax, query, wishlistOnly, isFavorite, sort])

  const toggleWishlistView = () => {
    if (!user) {
      setAccountOpen(true)
      return
    }
    setWishlistOnly((prev) => !prev)
  }

  const busy = authLoading || wishlistLoading

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="border-b border-rose-900/40 pb-6">
          <span className="text-xs uppercase tracking-[0.3em] text-rose-400 font-semibold">
            Colección exclusiva
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mt-2">
            Nuestra Tienda
          </h1>
          <p className="text-sm text-rose-200/70 mt-2">
            Joyas y accesorios seleccionados para ti, con envíos a todo el Perú.
          </p>
        </div>

        <div className="bg-[#121212] border border-rose-900/40 rounded-3xl p-5 space-y-5 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex items-center gap-2 bg-black/40 border border-rose-900/50 rounded-xl px-4 py-2.5 focus-within:border-rose-500 transition">
              <Search className="w-4 h-4 text-rose-300 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, descripción..."
                aria-label="Buscar productos"
                className="w-full bg-transparent text-sm text-white placeholder:text-rose-300/40 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-rose-300 shrink-0" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                aria-label="Ordenar por precio"
                className="flex-1 lg:w-auto px-3 py-2.5 rounded-xl bg-black/40 border border-rose-900/50 focus:outline-none focus:border-rose-500 text-white text-sm"
              >
                <option value="recent">Más recientes</option>
                <option value="price_asc">Menor precio</option>
                <option value="price_desc">Mayor precio</option>
              </select>
            </div>

            <button
              onClick={toggleWishlistView}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                wishlistOnly && user
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : 'bg-black/40 border-rose-900/50 text-rose-300 hover:border-rose-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlistOnly && user ? 'fill-current' : ''}`} />
              {user ? `Favoritos (${ids.size})` : 'Mis favoritos'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                category === 'all'
                  ? 'bg-rose-600 text-white'
                  : 'bg-black/40 text-rose-300 hover:bg-white/10 border border-rose-900/40'
              }`}
            >
              Todas
            </button>
            {categories.map((item) => (
              <button
                key={item.id}
                onClick={() => setCategory(item.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                  category === item.name
                    ? 'bg-rose-600 text-white'
                    : 'bg-black/40 text-rose-300 hover:bg-white/10 border border-rose-900/40'
                }`}
              >
                {item.name}
              </button>
            ))}

            <label className="ml-auto flex items-center gap-2 text-xs text-rose-300/80">
              <span className="hidden sm:inline">Máx.</span>
              <input
                type="range"
                min={0}
                max={Math.ceil(priceCap)}
                step={10}
                value={effectiveMax}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                aria-label="Filtrar por precio máximo"
                className="accent-rose-500 w-32"
              />
              <span className="font-semibold text-white w-20 text-right">
                {formatPrice(effectiveMax)}
              </span>
            </label>
          </div>
        </div>

        {busy ? (
          <div className="flex items-center justify-center py-24 text-rose-300">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#121212] border border-rose-900/40 p-16 rounded-3xl text-center space-y-3 shadow-2xl">
            <Search className="w-12 h-12 mx-auto text-rose-500/40 stroke-1" />
            <h2 className="font-serif text-2xl font-bold">Sin resultados</h2>
            <p className="text-sm text-rose-200/70">
              {wishlistOnly && user
                ? 'Aún no tienes favoritos guardados. Toca el corazón de un producto para guardarlo.'
                : 'Prueba con otros filtros o términos de búsqueda.'}
            </p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </div>

      <AccountModal isOpen={accountOpen} onClose={() => setAccountOpen(false)} />
    </main>
  )
}

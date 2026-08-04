'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ShoppingBag, Settings2, User, Search, Heart } from 'lucide-react'
import { useCart } from '@frontend/context/CartContext'
import { useAuth } from '@frontend/context/AuthContext'
import { useWishlist } from '@frontend/context/WishlistContext'
import { AccountModal } from './AccountModal'

function MagneticElement({
  children,
  strength = 10,
  className,
}: {
  children: React.ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.5 })
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.5 })

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const offsetX = e.clientX - (rect.left + rect.width / 2)
    const offsetY = e.clientY - (rect.top + rect.height / 2)
    x.set((offsetX / rect.width) * strength)
    y.set((offsetY / rect.height) * strength)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function MagneticNavbar() {
  const { totalItems, setIsCartOpen } = useCart()
  const { isAdmin, user } = useAuth()
  const { count: wishlistCount } = useWishlist()
  const [accountOpen, setAccountOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = search.trim()
    router.push(q ? `/tienda?q=${encodeURIComponent(q)}` : '/tienda')
    setSearch('')
  }

  const openWishlist = () => {
    if (user) {
      router.push('/tienda?wishlist=1')
    } else {
      setAccountOpen(true)
    }
  }

  const iconClasses =
    'relative p-3 rounded-full text-rose-200 hover:text-white hover:bg-white/10 transition backdrop-blur-sm'

  return (
    <>
      {/* DESKTOP HEADER */}
      <header className="fixed top-6 inset-x-6 max-w-7xl mx-auto z-50 flex items-center justify-between pointer-events-none">
        <MagneticElement strength={6}>
          <Link href="/" className="pointer-events-auto flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-rose-400/50 shadow-md">
              <img src="/logo.jpeg" alt="Sharol Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-widest text-white group-hover:text-rose-400 transition block drop-shadow-md">
                SHAROL
              </span>
              <span className="text-[9px] tracking-widest text-rose-300 uppercase block -mt-1 font-medium drop-shadow-md">
                Exclusividad & Estilo
              </span>
            </div>
          </Link>
        </MagneticElement>

        <form
          onSubmit={submitSearch}
          className="hidden md:flex pointer-events-auto flex-1 max-w-md mx-4 items-center gap-2 bg-black/40 border border-rose-900/50 rounded-full px-4 py-2 focus-within:border-rose-500 transition"
        >
          <Search className="w-4 h-4 text-rose-300 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar joyas, aretes, carteras..."
            aria-label="Buscar productos"
            className="w-full bg-transparent text-sm text-white placeholder:text-rose-300/40 focus:outline-none"
          />
        </form>

        <div className="pointer-events-auto flex items-center gap-3">
          {isAdmin && (
            <MagneticElement strength={8}>
              <Link href="/admin" aria-label="Administración" className={iconClasses}>
                <Settings2 className="w-5 h-5 drop-shadow-md" />
              </Link>
            </MagneticElement>
          )}

          <MagneticElement strength={8}>
            <button
              onClick={openWishlist}
              aria-label="Mis favoritos"
              title={user ? 'Mis favoritos' : 'Inicia sesión para guardar favoritos'}
              className={iconClasses}
            >
              <Heart className="w-5 h-5 drop-shadow-md" />
              <AnimatedBadge count={user ? wishlistCount : 0} />
            </button>
          </MagneticElement>

          <MagneticElement strength={8}>
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Abrir carrito"
              className={iconClasses}
            >
              <ShoppingBag className="w-5 h-5 drop-shadow-md" />
              <AnimatedBadge count={totalItems} />
            </button>
          </MagneticElement>

          <MagneticElement strength={8}>
            <button
              onClick={() => setAccountOpen(true)}
              aria-label="Mi cuenta"
              title={user ? `Hola, ${user.name.split(' ')[0]}` : 'Ingresar o crear cuenta'}
              className={iconClasses}
            >
              <User className="w-5 h-5 drop-shadow-md" />
              {user && (
                <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black/40" />
              )}
            </button>
          </MagneticElement>
        </div>
      </header>

      {/* MOBILE HEADER */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 px-4 h-16 flex items-center justify-between pointer-events-none">
        <Link href="/" className="pointer-events-auto flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-rose-400/50">
            <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-serif text-base font-bold tracking-wider text-white drop-shadow-md">SHAROL</span>
        </Link>

        <div className="pointer-events-auto flex items-center gap-2">
          {isAdmin && (
            <Link href="/admin" aria-label="Administración" className="p-2.5 rounded-full text-rose-200 hover:text-white hover:bg-white/10 transition">
              <Settings2 className="w-5 h-5 drop-shadow-md" />
            </Link>
          )}

          <Link
            href="/tienda"
            aria-label="Buscar productos"
            className="p-2.5 rounded-full text-rose-200 hover:text-white hover:bg-white/10 transition"
          >
            <Search className="w-5 h-5 drop-shadow-md" />
          </Link>

          <button
            onClick={openWishlist}
            aria-label="Mis favoritos"
            className="relative p-2.5 rounded-full text-rose-200 hover:text-white hover:bg-white/10 transition"
          >
            <Heart className="w-5 h-5 drop-shadow-md" />
            <AnimatedBadge count={user ? wishlistCount : 0} />
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Abrir carrito"
            className="relative p-2.5 rounded-full text-rose-200 hover:text-white hover:bg-white/10 transition"
          >
            <ShoppingBag className="w-5 h-5 drop-shadow-md" />
            <AnimatedBadge count={totalItems} />
          </button>

          <button
            onClick={() => setAccountOpen(true)}
            aria-label="Mi cuenta"
            className="relative p-2.5 rounded-full text-rose-200 hover:text-white hover:bg-white/10 transition"
          >
            <User className="w-5 h-5 drop-shadow-md" />
            {user && (
              <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 border border-black/40" />
            )}
          </button>
        </div>
      </header>

      <AccountModal isOpen={accountOpen} onClose={() => setAccountOpen(false)} />
    </>
  )
}

function AnimatedBadge({ count }: { count: number }) {
  return (
    <motion.span
      key={count}
      initial={{ scale: 0 }}
      animate={{ scale: count > 0 ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      className="absolute top-1 right-1 bg-rose-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md pointer-events-none"
    >
      {count}
    </motion.span>
  )
}

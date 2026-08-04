'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from '@frontend/context/AuthContext'

export type WishlistToggleResult = 'added' | 'removed' | 'login'

interface WishlistContextType {
  ids: Set<string>
  loading: boolean
  isFavorite: (productId: string) => boolean
  toggle: (productId: string) => Promise<WishlistToggleResult>
  count: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [ids, setIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      // Reset sincrónico al cerrar sesión. La regla no distingue el setState
      // asíncrono post-await ni la reacción a una dependencia (user).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIds(new Set())
      return
    }
    let cancelled = false
    fetch('/api/wishlist')
      .then((res) => (res.ok ? res.json() : { productIds: [] }))
      .then((data) => {
        if (!cancelled) setIds(new Set(data.productIds ?? []))
      })
      .catch(() => {
        if (!cancelled) setIds(new Set())
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const isFavorite = useCallback((productId: string) => ids.has(productId), [ids])

  const toggle = useCallback(
    async (productId: string): Promise<WishlistToggleResult> => {
      if (!user) return 'login'
      if (ids.has(productId)) {
        const res = await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' })
        if (res.ok) {
          setIds((prev) => {
            const next = new Set(prev)
            next.delete(productId)
            return next
          })
          return 'removed'
        }
        return 'removed'
      }
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (res.ok) {
        setIds((prev) => new Set(prev).add(productId))
        return 'added'
      }
      if (res.status === 401) return 'login'
      return 'removed'
    },
    [ids, user]
  )

  return (
    <WishlistContext.Provider
      value={{ ids, loading, isFavorite, toggle, count: ids.size }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider')
  return context
}

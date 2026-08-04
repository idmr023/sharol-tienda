'use client'

import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Star, Loader2, MessageSquareHeart } from 'lucide-react'
import { useAuth } from '@frontend/context/AuthContext'

const inputClasses =
  'w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-rose-900/50 focus:outline-none focus:border-rose-500 text-white text-sm placeholder:text-rose-300/40 transition'

export function ReviewModal({
  isOpen,
  onClose,
  onPublished,
}: {
  isOpen: boolean
  onClose: () => void
  onPublished: () => void
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
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-lg bg-[#121212] border border-rose-900/40 rounded-3xl shadow-2xl p-6 sm:p-8"
          >
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-4 right-4 p-2 rounded-full text-rose-300 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <ReviewForm onSuccess={onClose} onPublished={onPublished} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function ReviewForm({
  onSuccess,
  onPublished,
}: {
  onSuccess: () => void
  onPublished: () => void
}) {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [city, setCity] = useState('Lima')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, city, rating, comment }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'No se pudo guardar tu reseña')
        setBusy(false)
        return
      }
      onPublished()
      onSuccess()
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
      setBusy(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
          <MessageSquareHeart className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-white">Comparte tu experiencia</h2>
          <p className="text-xs text-rose-300/70">Tu opinión hace crecer esta comunidad.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-rose-300 mb-1">
              Nombre
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
              placeholder="Tu nombre"
              maxLength={80}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-rose-300 mb-1">
              Ciudad
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={inputClasses}
              placeholder="Lima"
              maxLength={60}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-rose-300 mb-1.5">
            Tu calificación
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                aria-label={`${star} estrellas`}
                className="transition hover:scale-110 active:scale-95"
              >
                <Star
                  className={`w-7 h-7 transition ${
                    star <= rating
                      ? 'fill-rose-400 text-rose-400'
                      : 'fill-rose-900/30 text-rose-900/50 hover:text-rose-500'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-rose-300 mb-1">
            Comentario
          </label>
          <textarea
            required
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className={`${inputClasses} resize-none`}
            placeholder="Cuéntanos qué te pareció..."
            maxLength={500}
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5"
          >
            {error}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium shadow-md transition text-sm flex items-center justify-center gap-2"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          Publicar reseña
        </button>
      </form>
    </>
  )
}

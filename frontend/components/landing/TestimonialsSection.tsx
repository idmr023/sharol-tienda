'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Quote, Star, PenLine, Loader2, Lock } from 'lucide-react'
import { ReviewModal } from '@frontend/components/ReviewModal'
import { AccountModal } from '@frontend/components/AccountModal'
import { useAuth } from '@frontend/context/AuthContext'

interface Review {
  id: string
  name: string
  city: string
  rating: number
  comment: string
  createdAt: string
}

const FALLBACK: Review[] = [
  {
    id: 'seed-1',
    name: 'María Fernanda',
    city: 'Lima',
    rating: 5,
    comment: 'Los aretes son preciosos, se nota la calidad. El envío llegó rápido y muy bien empacado.',
    createdAt: '',
  },
  {
    id: 'seed-2',
    name: 'Camila R.',
    city: 'Arequipa',
    rating: 5,
    comment: 'Compré la cartera ejecutiva y es tal cual la foto, elegante y espaciosa.',
    createdAt: '',
  },
  {
    id: 'seed-3',
    name: 'Valeria T.',
    city: 'Trujillo',
    rating: 5,
    comment: 'Me encantó todo el proceso: desde la pasarela de pago hasta la confirmación.',
    createdAt: '',
  },
]

export function TestimonialsSection() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const openReview = () => {
    if (user) {
      setModalOpen(true)
    } else {
      setAccountOpen(true)
    }
  }

  const loadReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews')
      if (!res.ok) throw new Error('Error al cargar reseñas')
      const data = await res.json()
      setReviews(data.length > 0 ? data : FALLBACK)
    } catch {
      setReviews(FALLBACK)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReviews()
  }, [loadReviews])

  useEffect(() => {
    if (paused || reviews.length === 0) return
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % reviews.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [paused, reviews.length])

  const safeIndex = reviews.length > 0 ? index % reviews.length : 0
  const current = reviews[safeIndex]

  const handlePublished = () => {
    loadReviews()
    setIndex(0)
  }

  return (
    <section className="bg-[#0d0d0d] py-24 sm:py-32 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-rose-400 font-semibold">
            Clientes felices
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-3">
            Lo que dicen <span className="text-rose-400 italic">de nosotras</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55 }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative bg-[#121212] border border-rose-900/40 rounded-3xl p-10 sm:p-14 text-center shadow-2xl"
        >
          {loading ? (
            <div className="min-h-[10rem] flex items-center justify-center text-rose-300">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
          ) : current ? (
            <>
              <Quote className="w-10 h-10 text-rose-500/30 mx-auto mb-6" />

              <div className="min-h-[10rem] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.blockquote
                    key={current.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="font-serif text-xl sm:text-2xl text-white leading-relaxed">
                      “{current.comment}”
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-6">
                      {Array.from({ length: 5 }).map((_, star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star < current.rating
                              ? 'fill-rose-400 text-rose-400'
                              : 'fill-rose-900/30 text-rose-900/50'
                          }`}
                        />
                      ))}
                    </div>
                    <footer className="mt-4">
                      <p className="font-semibold text-rose-300">{current.name}</p>
                      <p className="text-xs text-rose-300/50 mt-0.5">{current.city}</p>
                    </footer>
                  </motion.blockquote>
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-center gap-2 mt-8">
                {reviews.map((review, dot) => (
                  <button
                    key={review.id}
                    onClick={() => setIndex(dot)}
                    aria-label={`Ver reseña ${dot + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      dot === safeIndex ? 'w-6 bg-rose-500' : 'w-2 bg-rose-900 hover:bg-rose-700'
                    }`}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="min-h-[10rem] flex items-center justify-center text-rose-300/60">
              Sé la primera en dejar una reseña.
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
        >
          <p className="text-sm text-rose-200/60">¿Quieres compartir tu experiencia?</p>
          <button
            onClick={openReview}
            className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-md transition active:scale-95"
          >
            {user ? <PenLine className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {user ? 'Escribir una reseña' : 'Inicia sesión para reseñar'}
          </button>
        </motion.div>
      </div>

      <ReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onPublished={handlePublished}
      />

      <AccountModal isOpen={accountOpen} onClose={() => setAccountOpen(false)} />
    </section>
  )
}

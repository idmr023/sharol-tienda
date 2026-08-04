'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { useCart } from '@frontend/context/CartContext'

export function Toast() {
  const { toast } = useCart()

  return (
    <div className="fixed bottom-6 inset-x-0 z-[60] flex justify-center pointer-events-none px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="flex items-center gap-2.5 bg-white text-rose-950 font-medium text-sm pl-3.5 pr-5 py-3 rounded-full shadow-2xl border border-rose-100"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

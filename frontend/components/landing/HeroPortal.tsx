'use client'

import { forwardRef } from 'react'
import { Sparkles, ChevronDown } from 'lucide-react'

export const HeroPortal = forwardRef<HTMLDivElement>(function HeroPortal(_, ref) {
  return (
    <div
      ref={ref}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none bg-gradient-to-br from-rose-900 via-rose-950 to-black px-4 text-center overflow-hidden"
    >
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fb7185_1px,transparent_1px)] [background-size:24px_24px] animate-pulse" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <div className="w-24 h-24 rounded-full mx-auto overflow-hidden border-2 border-rose-300 shadow-2xl animate-bounce">
          <img src="/logo.jpeg" alt="Sharol Logo" className="w-full h-full object-cover" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs font-semibold tracking-widest uppercase backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-rose-300 animate-spin" />
          <span>Experiencia Inmersiva 2026</span>
        </div>

        <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white drop-shadow-lg">
          Para mujeres que van por <span className="text-rose-400 italic">más</span>
        </h1>

        <p className="text-rose-200/80 text-lg sm:text-2xl font-light tracking-wide max-w-2xl mx-auto">
          Desliza hacia abajo para entrar al universo de exclusividad, joyas, carteras y alta moda.
        </p>

        <div className="pt-8 flex flex-col items-center gap-2 text-rose-300 animate-pulse">
          <span className="text-xs uppercase tracking-widest font-semibold">Desliza para avanzar</span>
          <ChevronDown className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
})

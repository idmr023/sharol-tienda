'use client'

import { motion, type Variants } from 'framer-motion'
import { Truck, Gem, HeartHandshake, ShieldCheck } from 'lucide-react'

const FEATURES = [
  {
    icon: Truck,
    title: 'Envíos a todo el Perú',
    description: 'Llega tu pedido seguro y puntual a Lima y todas las provincias del país.',
  },
  {
    icon: Gem,
    title: 'Calidad garantizada',
    description: 'Seleccionamos cada pieza con estándares exigentes de diseño y acabado.',
  },
  {
    icon: HeartHandshake,
    title: 'Atención personalizada',
    description: 'Te acompañamos por WhatsApp antes y después de tu compra.',
  },
  {
    icon: ShieldCheck,
    title: 'Compra protegida',
    description: 'Paga con Yape, Plin o contra entrega con total confianza.',
  },
]

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.32, 0.72, 0, 1] } },
}

export function FeaturesSection() {
  return (
    <section className="bg-[#0d0d0d] py-24 sm:py-32 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-rose-400 font-semibold">
            Por qué elegirnos
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-3">
            Una experiencia <span className="text-rose-400 italic">pensada para ti</span>
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={item}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="group bg-[#121212] border border-rose-900/40 rounded-3xl p-8 hover:border-rose-500/50 hover:shadow-[0_0_30px_rgba(225,29,72,0.15)] transition"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                  <Icon className="w-6 h-6 text-rose-400" />
                </div>
                <h3 className="font-serif font-bold text-white text-lg">{feature.title}</h3>
                <p className="text-sm text-rose-200/70 leading-relaxed mt-2">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

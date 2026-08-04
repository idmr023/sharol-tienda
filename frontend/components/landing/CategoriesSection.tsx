'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

export interface CategorySummary {
  name: string
  image: string
  count: number
}

export function CategoriesSection({ categories }: { categories: CategorySummary[] }) {
  return (
    <section className="bg-gradient-to-b from-[#0d0d0d] to-rose-950/30 py-24 sm:py-32 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-end justify-between gap-6 mb-14"
        >
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-rose-400 font-semibold">
              Colección por categoría
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-3">
              Encuentra tu <span className="text-rose-400 italic">estilo</span>
            </h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <motion.a
              key={category.name}
              href="#showroom"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -8 }}
              className="group relative aspect-[3/4] rounded-3xl overflow-hidden border border-rose-900/40"
            >
              <img
                src={category.image}
                alt={`Colección ${category.name}`}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-5 flex flex-col justify-end">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-rose-300 uppercase tracking-widest">
                      {category.count} {category.count === 1 ? 'pieza' : 'piezas'}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-white mt-1">
                      {category.name}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}

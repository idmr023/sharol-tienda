'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HeroPortal } from './landing/HeroPortal'
import { Showroom } from './landing/Showroom'
import { FeaturesSection } from './landing/FeaturesSection'
import { CategoriesSection, type CategorySummary } from './landing/CategoriesSection'
import { TestimonialsSection } from './landing/TestimonialsSection'
import { StoreFooter } from './landing/StoreFooter'
import { WhatsAppButton } from './WhatsAppButton'
import type { Product } from '@frontend/lib/types'

gsap.registerPlugin(ScrollTrigger)

export default function ImmersiveLanding({ products }: { products: Product[] }) {
  const heroRef = useRef<HTMLElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [activeProduct, setActiveProduct] = useState<Product | null>(products[0] ?? null)

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: '+=1400',
            pin: true,
            scrub: 0.5,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        tl.to(portalRef.current, {
          scale: 10,
          opacity: 0,
          ease: 'power2.inOut',
          duration: 1.5,
        })

        tl.fromTo(
          contentRef.current,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, ease: 'power2.out', duration: 1 },
          '-=1'
        )
      }, heroRef)

      return () => ctx.revert()
    })

    mm.add('(prefers-reduced-motion: reduce)', () => {
      if (portalRef.current) portalRef.current.style.display = 'none'
      if (contentRef.current) {
        contentRef.current.style.opacity = '1'
        contentRef.current.style.transform = 'none'
      }
    })

    return () => {
      mm.revert()
      document.body.style.overflow = 'auto'
    }
  }, [])

  const categories = useMemo<CategorySummary[]>(() => {
    const map = new Map<string, CategorySummary>()
    for (const product of products) {
      const name = product.category.name
      const current = map.get(name)
      if (current) {
        current.count += 1
      } else {
        map.set(name, { name, image: product.images, count: 1 })
      }
    }
    return Array.from(map.values())
  }, [products])

  return (
    <main>
      <section
        id="showroom"
        ref={heroRef}
        className="relative w-full h-screen overflow-hidden bg-rose-950 text-white selection:bg-rose-500 selection:text-white"
      >
        <HeroPortal ref={portalRef} />
        <Showroom
          ref={contentRef}
          products={products}
          activeProduct={activeProduct}
          onSelect={setActiveProduct}
        />
      </section>

      <FeaturesSection />
      <CategoriesSection categories={categories} />
      <TestimonialsSection />
      <StoreFooter />
      <WhatsAppButton />
    </main>
  )
}

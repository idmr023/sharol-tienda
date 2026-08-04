'use client'

import React, { useEffect, useState } from 'react'
import { useCart } from '@frontend/context/CartContext'
import { useAuth, type AuthUser } from '@frontend/context/AuthContext'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { formatPrice } from '@frontend/lib/utils'
import type { CartItem } from '@frontend/lib/cart'
import { CheckoutForm } from '@frontend/components/CheckoutForm'
import { OrderSuccess } from '@frontend/components/OrderSuccess'

type PaymentMethod = 'YAPE' | 'PLIN' | 'TRANSFERENCIA'

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart()
  const { user } = useAuth()

  const [successOrder, setSuccessOrder] = useState<string | null>(null)
  const [successPayment, setSuccessPayment] = useState<PaymentMethod>('YAPE')

  useEffect(() => {
    if (!successOrder) return
    const timer = setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 100,
        origin: { x: 0.2, y: 0.7 },
        colors: ['#fb7185', '#ffffff'],
      })
    }, 600)
    return () => clearTimeout(timer)
  }, [successOrder])

  const handleSuccess = (orderId: string, paymentMethod: PaymentMethod) => {
    setSuccessPayment(paymentMethod)
    setSuccessOrder(orderId)
    clearCart()
  }

  if (successOrder) {
    return (
      <OrderSuccess
        orderId={successOrder}
        paymentMethod={successPayment}
        totalPrice={totalPrice}
      />
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center px-4">
        <h1 className="font-serif text-2xl font-bold text-white mb-2">No hay productos en el carrito</h1>
        <p className="text-rose-300/70 mb-6">Agrega productos para proceder al pago.</p>
        <Link
          href="/carrito"
          className="px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-full shadow-lg transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ver Carrito</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Link
          href="/carrito"
          className="inline-flex items-center gap-2 text-rose-400 hover:text-white font-medium text-xs tracking-wider uppercase transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Regresar al Carrito</span>
        </Link>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">Pasarela de Pagos & Envío</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <CheckoutForm
            key={user?.id ?? 'guest'}
            user={user}
            cart={cart}
            totalPrice={totalPrice}
            onSuccess={handleSuccess}
          />

          <div className="lg:col-span-5 bg-[#121212] border border-rose-900/40 p-8 rounded-3xl space-y-6 shadow-2xl sticky top-28">
            <h2 className="font-serif text-xl font-bold text-white border-b border-rose-900/50 pb-4">
              Resumen del Pedido
            </h2>
            <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <img
                    src={item.images}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-xl border border-rose-900/40"
                  />
                  <div className="flex-1">
                    <h3 className="font-serif font-semibold text-white text-sm line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-rose-300/70">Cant: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-white text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-rose-900/50 space-y-2 text-sm text-rose-200/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envíos a todo el Perú</span>
                <span className="text-rose-400">Calculado por zona</span>
              </div>
              <div className="flex justify-between text-lg font-serif font-bold text-white pt-3 border-t border-rose-900/50">
                <span>Total a Pagar</span>
                <span className="text-rose-400">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
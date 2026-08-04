'use client'

import React, { useEffect, useState } from 'react'
import { useCart } from '@frontend/context/CartContext'
import { useAuth } from '@frontend/context/AuthContext'
import { ArrowLeft, Lock } from 'lucide-react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { formatPrice } from '@frontend/lib/utils'
import type { CartItem } from '@frontend/lib/cart'
import { CheckoutForm } from '@frontend/components/CheckoutForm'
import { OrderSuccess } from '@frontend/components/OrderSuccess'
import { AccountModal } from '@frontend/components/AccountModal'

type PaymentMethod = 'YAPE' | 'PLIN' | 'TRANSFERENCIA'

function CheckoutPageContent() {
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

export default function CheckoutPage() {
  const { user, loading } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)

  // Show a loading screen while auth state is being fetched from the server.
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center px-4">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-rose-300/70 text-sm">Verificando sesión...</p>
      </div>
    )
  }

  // Require login to proceed to checkout / view payment details
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center px-4">
        <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-full mb-6">
          <Lock className="w-8 h-8 text-rose-400 animate-pulse" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-white mb-2 text-center">Inicia sesión para proceder al pago</h1>
        <p className="text-rose-300/70 mb-8 max-w-md text-center text-sm sm:text-base">
          Debes iniciar sesión o registrarte para completar tu pedido y adjuntar tu comprobante de pago de forma segura.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none justify-center">
          <button
            onClick={() => setModalOpen(true)}
            className="px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-full shadow-lg shadow-rose-950/50 hover:shadow-rose-600/20 active:scale-[0.98] transition-all duration-300 text-center cursor-pointer"
          >
            Iniciar Sesión / Registrarse
          </button>
          <Link
            href="/carrito"
            className="px-8 py-3.5 bg-transparent border border-rose-900/50 hover:border-rose-500 text-rose-300 hover:text-white font-semibold rounded-full transition-all duration-300 text-center flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Regresar al Carrito</span>
          </Link>
        </div>

        <AccountModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    )
  }

  return <CheckoutPageContent />
}
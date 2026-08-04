'use client'

import React from 'react'
import { CheckCircle2, ArrowLeft, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

interface OrderSuccessProps {
  orderId: string
  paymentMethod: 'YAPE' | 'PLIN' | 'TRANSFERENCIA'
  totalPrice: number
}

export function OrderSuccess({ orderId, paymentMethod }: OrderSuccessProps) {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#121212] border border-rose-900/50 p-8 rounded-3xl shadow-2xl text-center space-y-6">
        <CheckCircle2 className="w-16 h-16 text-rose-400 mx-auto" />
        <h1 className="font-serif text-2xl font-bold text-white">¡Pedido Registrado con Éxito!</h1>
        <p className="text-sm text-rose-300/70">
          Tu pago mediante{' '}
          <span className="uppercase text-rose-400 font-semibold">{paymentMethod}</span> ha sido
          registrado y el comprobante ha sido enviado automáticamente al correo de Sharol para su verificación y confirmación.
        </p>
        <div className="bg-black/40 p-4 rounded-xl text-left border border-rose-900/40">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block">
            Código de Pedido:
          </span>
          <span className="font-mono text-sm font-bold text-white">{orderId}</span>
        </div>

        <Link
          href="/"
          className="block w-full py-3 bg-white/10 hover:bg-white/20 text-rose-200 font-medium rounded-2xl transition text-xs tracking-wider flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la Tienda
        </Link>
        
        <Link
          href="/carrito"
          className="block w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-2xl transition text-xs tracking-wider flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          Ver mi Carrito
        </Link>
      </div>
    </div>
  )
}
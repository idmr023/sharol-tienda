'use client'

import React, { useState } from 'react'
import type { AuthUser } from '@frontend/context/AuthContext'
import { CheckCircle2, QrCode, Smartphone, Loader2, AlertCircle, Landmark } from 'lucide-react'
import { formatPrice } from '@frontend/lib/utils'
import { WHATSAPP } from '@frontend/lib/constants'
import type { CartItem } from '@frontend/lib/cart'
import confetti from 'canvas-confetti'

type PaymentMethod = 'YAPE' | 'PLIN' | 'TRANSFERENCIA'

interface CheckoutFormProps {
  user: AuthUser | null
  cart: CartItem[]
  totalPrice: number
  onSuccess: (orderId: string, paymentMethod: PaymentMethod) => void
}

export function CheckoutForm({ user, cart, totalPrice, onSuccess }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    customerName: user?.name ?? '',
    customerEmail: user?.email ?? '',
    customerPhone: user?.phone ?? '',
    shippingAddress: '',
    city: 'Lima',
  })

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('YAPE')
  const [loading, setLoading] = useState(false)
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [voucherError, setVoucherError] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isValidImage = file.type.startsWith('image/') || file.type === 'application/pdf'
    if (!isValidImage) {
      setVoucherError('El archivo debe ser una imagen (captura de pantalla) o PDF')
      setVoucherPreview(null)
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setVoucherError('El archivo no debe superar los 10 MB')
      setVoucherPreview(null)
      return
    }

    setVoucherError(null)
    const reader = new FileReader()
    reader.onloadend = () => setVoucherPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const simulateAutoVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return

    if (!voucherPreview) {
      setVoucherError('Por favor sube la captura de tu comprobante de pago para verificar.')
      return
    }

    setVerifying(true)
    setTimeout(async () => {
      setVerifying(false)
      setLoading(true)
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            paymentMethod,
            voucherUrl: voucherPreview,
            items: cart.map((i) => ({ productId: i.id, quantity: i.quantity, price: i.price })),
          }),
        })

        const data = await res.json()
        if (res.ok) {
          confetti({
            particleCount: 120,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#fb7185', '#f43f5e', '#ffffff', '#fda4af'],
          })
          onSuccess(data.orderId, paymentMethod)
        } else {
          setVoucherError(data.error || 'Error al procesar el pedido')
        }
      } catch (err) {
        console.error(err)
        setVoucherError('Error de red al procesar el pedido')
      } finally {
        setLoading(false)
      }
    }, 2500)
  }

  return (
    <form
      onSubmit={simulateAutoVerification}
      className="lg:col-span-7 bg-[#121212] border border-rose-900/40 p-8 rounded-3xl space-y-6 shadow-2xl relative"
    >
      {verifying && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 rounded-3xl flex flex-col items-center justify-center space-y-4 p-6 text-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <h3 className="font-serif text-2xl font-bold text-white">Verificando Pasarela Bancaria...</h3>
          <p className="text-sm text-rose-300">
            Validando autenticidad del comprobante, relación de aspecto y formato digital en tiempo real.
          </p>
        </div>
      )}
      <h2 className="font-serif text-xl font-bold text-white border-b border-rose-900/50 pb-4">
        1. Datos de Envío
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-rose-300 mb-1">
            Nombre Completo
          </label>
          <input
            type="text"
            required
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-rose-900/50 focus:outline-none focus:border-rose-500 text-white text-sm"
            placeholder="Ej. Sharol Quispe"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-rose-300 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-rose-900/50 focus:outline-none focus:border-rose-500 text-white text-sm"
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-rose-300 mb-1">
              Celular / WhatsApp
            </label>
            <input
              type="tel"
              required
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-rose-900/50 focus:outline-none focus:border-rose-500 text-white text-sm"
              placeholder="999 999 999"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-rose-300 mb-1">
            Dirección de Envío
          </label>
          <input
            type="text"
            required
            value={formData.shippingAddress}
            onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-rose-900/50 focus:outline-none focus:border-rose-500 text-white text-sm"
            placeholder="Av. Larco 123, Miraflores"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-rose-300 mb-1">
            Ciudad / Departamento
          </label>
          <select
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-rose-900/50 focus:outline-none focus:border-rose-500 text-white text-sm"
          >
            <option value="Lima">Lima Metropolitana</option>
            <option value="Arequipa">Arequipa</option>
            <option value="Trujillo">Trujillo</option>
            <option value="Cusco">Cusco</option>
            <option value="Piura">Piura</option>
            <option value="Otro">Otro Departamento del Perú</option>
          </select>
        </div>
      </div>

      <h2 className="font-serif text-xl font-bold text-white border-b border-rose-900/50 pb-4 pt-4">
        2. Método de Pago
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { id: 'YAPE' as const, label: 'Yape', icon: Smartphone },
          { id: 'PLIN' as const, label: 'Plin', icon: QrCode },
          { id: 'TRANSFERENCIA' as const, label: 'Transferencia', icon: Landmark },
        ].map((method) => {
          const Icon = method.icon
          const active = paymentMethod === method.id
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => {
                setPaymentMethod(method.id)
                setVoucherError(null)
              }}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition ${
                active
                  ? 'bg-rose-600/20 border-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                  : 'bg-black/40 border-rose-900/40 text-rose-300/70 hover:border-rose-700'
              }`}
            >
              <Icon className="w-6 h-6 text-rose-400" />
              <span className="text-xs font-semibold">{method.label}</span>
            </button>
          )
        })}
      </div>

      <div className="bg-purple-950/30 border border-purple-500/30 p-5 rounded-2xl text-xs space-y-3 text-rose-200">
        <p className="font-semibold text-purple-300 text-sm">
          {paymentMethod === 'TRANSFERENCIA' ? 'Transferencia Bancaria Directa:' : `Pago Rápido con ${paymentMethod}:`}
        </p>
        {paymentMethod === 'TRANSFERENCIA' ? (
          <div className="space-y-1 text-rose-300">
            <p>Realiza la transferencia desde la app de tu banco de preferencia a cualquiera de nuestras cuentas:</p>
            <ul className="list-disc pl-4 space-y-1 font-mono text-[11px] text-white">
              <li>BCP Soles: <span className="font-bold text-rose-400">193-98273615-0-82</span> (Sharol Joyas)</li>
              <li>Interbank Soles: <span className="font-bold text-rose-400">200-3098271625</span></li>
              <li>CCI BCP: <span className="font-bold text-rose-400">002-1939827361508201</span></li>
            </ul>
          </div>
        ) : (
          <p>
            {paymentMethod === 'YAPE' ? 'Yapea' : 'Plinea'} al número:{' '}
            <span className="font-mono font-bold text-white text-sm">{WHATSAPP.display}</span>{' '}
            (Sharol Tienda).
          </p>
        )}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-rose-300">
            Sube la captura de tu comprobante vertical (Yape/Plin/Banco):
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="w-full text-xs text-rose-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-600 file:text-white hover:file:bg-rose-500 cursor-pointer"
          />
          {voucherError && (
            <p className="text-red-400 text-[11px] flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{voucherError}</span>
            </p>
          )}
        </div>
        {voucherPreview && (
          <div className="w-20 h-20 rounded-xl overflow-hidden border border-rose-500/50 relative">
            {voucherPreview.startsWith('data:application/pdf') ? (
              <div className="w-full h-full flex items-center justify-center bg-rose-900/30">
                <CheckCircle2 className="w-8 h-8 text-rose-400" />
              </div>
            ) : (
              <img src={voucherPreview} alt="Voucher" className="w-full h-full object-cover" />
            )}
          </div>
        )}
        <p className="text-rose-300/60 text-[11px]">
          Tu comprobante se procesará heurísticamente para validar dimensiones y formato real antes de enviar tu orden para la validación de Sharol.
        </p>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-[0_0_25px_rgba(225,29,72,0.6)] transition disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              Confirmar y Enviar Pedido ({formatPrice(totalPrice)})
            </>
          )}
        </button>
      </div>
    </form>
  )
}
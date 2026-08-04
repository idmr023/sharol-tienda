'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  User,
  Mail,
  Lock,
  Phone,
  X,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  ShieldCheck,
  ShoppingBag,
  Package,
  CheckCircle2,
  Truck,
  Pencil,
  ChevronLeft,
  KeyRound,
} from 'lucide-react'
import { useAuth } from '@frontend/context/AuthContext'
import { orderStatusLabel, orderStatusStyle } from '@frontend/lib/orderStatus'

type Mode = 'login' | 'register' | 'forgot'

const inputClasses =
  'w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/40 border border-rose-900/50 focus:outline-none focus:border-rose-500 text-white text-sm placeholder:text-rose-300/40 transition'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: { id: string; name: string; image: string | null }
}

interface UserOrder {
  id: string
  totalAmount: number
  status: string
  paymentMethod: string
  tracking: string | null
  createdAt: string
  items: OrderItem[]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatPrice(value: number): string {
  return `S/ ${value.toFixed(2)}`
}

export function AccountModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { user } = useAuth()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className={`relative w-full ${
              user ? 'max-w-lg' : 'max-w-md'
            } bg-[#121212] border border-rose-900/40 rounded-3xl shadow-2xl p-6 sm:p-8`}
          >
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-4 right-4 p-2 rounded-full text-rose-300 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {user ? (
              <LoggedInPanel onClose={onClose} />
            ) : (
              <AuthForm onSuccess={onClose} />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function LoggedInPanel({ onClose }: { onClose: () => void }) {
  const { user, isAdmin, logout } = useAuth()
  const [tab, setTab] = useState<'profile' | 'orders'>('profile')
  if (!user) return null

  const tabClasses = (active: boolean) =>
    `flex-1 py-2 rounded-lg text-sm font-medium transition ${
      active ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-300 hover:text-white hover:bg-white/5'
    }`

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-rose-400" />
        </div>
        <div className="min-w-0">
          <h2 className="font-serif text-xl font-bold text-white truncate">
            Hola, {user.name.split(' ')[0]}
          </h2>
          <p className="text-xs text-rose-200/70 truncate">{user.email}</p>
        </div>
      </div>

      <div className="flex bg-black/40 border border-rose-900/50 p-1 rounded-xl mb-5">
        <button onClick={() => setTab('profile')} className={tabClasses(tab === 'profile')}>
          Mi Perfil
        </button>
        <button onClick={() => setTab('orders')} className={tabClasses(tab === 'orders')}>
          Mis Compras
        </button>
      </div>

      {tab === 'profile' ? <ProfilePanel /> : <OrdersPanel />}

      <div className="mt-5 flex flex-col gap-2">
        {isAdmin && (
          <a
            href="/admin"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium transition text-sm flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Ir a Administración
          </a>
        )}
        <button
          onClick={async () => {
            await logout()
            onClose()
          }}
          className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-rose-200 transition text-sm flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

function ProfilePanel() {
  const { user, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)

  const startEditing = () => {
    setName(user?.name ?? '')
    setEmail(user?.email ?? '')
    setPhone(user?.phone ?? '')
    setError(null)
    setSuccess(false)
    setEditing(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setBusy(true)
    const result = await updateProfile({ name, email, phone })
    setBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setEditing(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (!user) return null

  return (
    <div>
      {!editing ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 bg-black/30 border border-rose-900/40 rounded-xl px-4 py-3 w-full">
              <User className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-rose-300/50">Nombre</p>
                <p className="text-sm text-white truncate">{user.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-black/30 border border-rose-900/40 rounded-xl px-4 py-3">
            <Mail className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-rose-300/50">Correo</p>
              <p className="text-sm text-white truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-black/30 border border-rose-900/40 rounded-xl px-4 py-3">
            <Phone className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-rose-300/50">Teléfono</p>
              <p className="text-sm text-white truncate">{user.phone ?? '—'}</p>
            </div>
          </div>
          <button
            onClick={startEditing}
            className="w-full py-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-600/40 text-rose-300 hover:text-white font-medium transition text-sm flex items-center justify-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Editar perfil
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
              placeholder="Tu nombre"
              maxLength={80}
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              placeholder="Correo electrónico"
              autoComplete="email"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClasses}
              placeholder="Teléfono (7 a 12 dígitos)"
              inputMode="numeric"
              maxLength={12}
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
              Perfil actualizado correctamente.
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-rose-200 transition text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium transition text-sm flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function OrdersPanel() {
  const [orders, setOrders] = useState<UserOrder[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    fetch('/api/user/orders')
      .then(async (res) => {
        if (!res.ok) throw new Error('No se pudieron cargar tus compras')
        const data = await res.json()
        setOrders(data.orders ?? [])
      })
      .catch(() => setError('No se pudieron cargar tus compras.'))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-3">
      {error && (
        <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5">
          {error}
        </p>
      )}
      {orders === null && !error && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
        </div>
      )}
      {orders !== null && orders.length === 0 && (
        <div className="text-center py-8">
          <ShoppingBag className="w-10 h-10 text-rose-500/40 mx-auto mb-3" />
          <p className="text-sm text-rose-200/70">Aún no tienes compras registradas.</p>
          <p className="text-xs text-rose-200/50 mt-1">
            Cuando realices tu primer pedido aparecerá aquí con su seguimiento.
          </p>
        </div>
      )}
      {orders?.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}

function OrderCard({ order }: { order: UserOrder }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-black/30 border border-rose-900/40 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-4 py-3 hover:bg-white/5 transition flex items-center gap-3"
      >
        <Package className="w-5 h-5 text-rose-400 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${orderStatusStyle(order.status)}`}>
              {orderStatusLabel(order.status)}
            </span>
            <span className="text-[11px] text-rose-200/50">{formatDate(order.createdAt)}</span>
          </div>
          <p className="text-sm text-white mt-1 truncate">
            {order.items.map((i) => i.product.name).join(', ')}
          </p>
          <p className="text-xs text-rose-200/70 mt-0.5">
            {order.items.reduce((acc, i) => acc + i.quantity, 0)} producto(s) ·{' '}
            {formatPrice(order.totalAmount)}
          </p>
        </div>
        <ChevronLeft className={`w-4 h-4 text-rose-400 shrink-0 transition-transform ${open ? '-rotate-90' : 'rotate-0'}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-rose-900/30">
              <p className="text-[10px] uppercase tracking-wider text-rose-300/50 pt-3">Detalle</p>
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <span className="text-rose-300/60 w-6 text-right">{item.quantity}×</span>
                  <span className="text-white flex-1">{item.product.name}</span>
                  <span className="text-rose-200/70">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm pt-1">
                <span className="text-rose-200/70">Total</span>
                <span className="text-white font-semibold">{formatPrice(order.totalAmount)}</span>
              </div>

              {order.tracking && (
                <div className="flex items-center gap-2 text-xs text-rose-200/80 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                  <Truck className="w-3.5 h-3.5 text-rose-400" />
                  Seguimiento: {order.tracking}
                </div>
              )}

              {(order.status === 'ENVIADO' || order.status === 'ENTREGADO') && !order.tracking && (
                <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tu pedido está en camino. Comparte el número de pedido con Sharol si necesitas el código de seguimiento.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AuthForm({ onSuccess }: { onSuccess: () => void }) {
  const { login, register, loading } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // forgot-password state
  const [forgotStep, setForgotStep] = useState<'email' | 'reset'>('email')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [forgotOk, setForgotOk] = useState<string | null>(null)

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    setForgotOk(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden')
        return
      }
    }

    setBusy(true)
    const result =
      mode === 'login'
        ? await login(email, password)
        : await register(name, email, phone, password)
    setBusy(false)

    if (result.error) {
      setError(result.error)
      return
    }
    onSuccess()
  }

  const handleForgotEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setForgotOk(null)
    setBusy(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'No se pudo procesar la solicitud')
        return
      }
      setForgotStep('reset')
      setForgotOk('¡Código enviado! Revisa tu bandeja de entrada o spam.')
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (newPassword !== confirmNewPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'No se pudo restablecer la contraseña')
        return
      }
      setForgotOk('Contraseña restablecida. Ya puedes iniciar sesión.')
      setForgotStep('email')
      setMode('login')
      setPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setCode('')
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  if (mode === 'forgot') {
    return (
      <ForgotForm
        step={forgotStep}
        email={email}
        setEmail={setEmail}
        code={code}
        setCode={setCode}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmNewPassword={confirmNewPassword}
        setConfirmNewPassword={setConfirmNewPassword}
        error={error}
        ok={forgotOk}
        busy={busy}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        onRequestCode={handleForgotEmail}
        onReset={handleReset}
        onBack={() => {
          setError(null)
          setForgotOk(null)
          setMode('login')
        }}
      />
    )
  }

  return (
    <>
      <div className="flex bg-black/40 border border-rose-900/50 p-1 rounded-xl mb-6">
        <button
          onClick={() => switchMode('login')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            mode === 'login'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-rose-300 hover:text-white hover:bg-white/5'
          }`}
        >
          Iniciar sesión
        </button>
        <button
          onClick={() => switchMode('register')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            mode === 'register'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-rose-300 hover:text-white hover:bg-white/5'
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <h2 className="font-serif text-xl font-bold text-white mb-1">
        {mode === 'login' ? 'Bienvenida de vuelta' : 'Crea tu cuenta'}
      </h2>
      <p className="text-xs text-rose-300/70 mb-5">
        {mode === 'login'
          ? 'Ingresa para llevar tu exclusividad a otro nivel.'
          : 'Únete a la comunidad Sharol y compra al instante.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'register' && (
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
              placeholder="Tu nombre"
              maxLength={80}
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
            placeholder="Correo electrónico"
            autoComplete="email"
          />
        </div>

        {mode === 'register' && (
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClasses}
              placeholder="Tu número de teléfono (7 a 12 dígitos)"
              inputMode="numeric"
              maxLength={12}
            />
          </div>
        )}

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
            placeholder="Contraseña"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-200 transition"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {mode === 'register' && (
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClasses}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
            />
          </div>
        )}

        {mode === 'register' && (
          <p className="text-[11px] text-rose-300/50 leading-relaxed">
            Mínimo 8 caracteres con mayúsculas, minúsculas y números.
          </p>
        )}

        {mode === 'login' && (
          <button
            type="button"
            onClick={() => {
              setMode('forgot')
              setForgotStep('email')
              setError(null)
              setForgotOk(null)
            }}
            className="text-xs text-rose-300/70 hover:text-rose-200 transition flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Olvidé mi contraseña
          </button>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5"
          >
            {error}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={busy || loading}
          className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium shadow-md transition text-sm flex items-center justify-center gap-2"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
        </button>
      </form>
    </>
  )
}

function ForgotForm({
  step,
  email,
  setEmail,
  code,
  setCode,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  error,
  ok,
  busy,
  showPassword,
  setShowPassword,
  onRequestCode,
  onReset,
  onBack,
}: {
  step: 'email' | 'reset'
  email: string
  setEmail: (v: string) => void
  code: string
  setCode: (v: string) => void
  newPassword: string
  setNewPassword: (v: string) => void
  confirmNewPassword: string
  setConfirmNewPassword: (v: string) => void
  error: string | null
  ok: string | null
  busy: boolean
  showPassword: boolean
  setShowPassword: (v: boolean) => void
  onRequestCode: (e: React.FormEvent) => void
  onReset: (e: React.FormEvent) => void
  onBack: () => void
}) {
  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-rose-300/70 hover:text-rose-200 transition mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver
      </button>

      <h2 className="font-serif text-xl font-bold text-white mb-1">Recuperar contraseña</h2>
      <p className="text-xs text-rose-300/70 mb-5">
        {step === 'email'
          ? 'Ingresa tu correo y te enviaremos un código de 6 dígitos.'
          : 'Ingresa el código recibido en tu correo y tu nueva contraseña.'}
      </p>

      {ok && (
        <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5 mb-4">
          {ok}
        </p>
      )}

      {step === 'email' ? (
        <form onSubmit={onRequestCode} className="space-y-3.5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              placeholder="Correo electrónico"
              autoComplete="email"
            />
          </div>
          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium shadow-md transition text-sm flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Enviar código
          </button>
        </form>
      ) : (
        <form onSubmit={onReset} className="space-y-3.5">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={inputClasses}
              placeholder="Código de 6 dígitos"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClasses}
              placeholder="Nueva contraseña"
              autoComplete="new-password"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className={inputClasses}
              placeholder="Repite la nueva contraseña"
              autoComplete="new-password"
            />
          </div>
          <p className="text-[11px] text-rose-300/50 leading-relaxed">
            Mínimo 8 caracteres con mayúsculas, minúsculas y números.
          </p>
          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium shadow-md transition text-sm flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Restablecer contraseña
          </button>
        </form>
      )}
    </>
  )
}

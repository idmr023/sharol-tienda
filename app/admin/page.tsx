'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Package,
  ShoppingBag,
  Plus,
  Trash2,
  ArrowLeft,
  Tags,
  Pencil,
  CheckCircle,
  Loader2,
  TrendingUp,
  AlertTriangle,
  Truck,
  ClipboardCheck,
  XCircle,
  Image,
  Check,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@frontend/lib/utils'
import { useAuth } from '@frontend/context/AuthContext'
import { ShieldAlert } from 'lucide-react'
import {
  ORDER_STATUSES,
  orderStatusLabel,
  orderStatusStyle,
} from '@frontend/lib/orderStatus'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  images: string
  categoryId: string
  category: { name: string }
}

interface Category {
  id: string
  name: string
  slug: string
}

interface StatusHistoryEntry {
  id: string
  status: string
  note?: string | null
  createdAt: string
}

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  city: string
  totalAmount: number
  status: string
  paymentMethod: string
  voucherUrl?: string | null
  tracking?: string | null
  adminNote?: string | null
  createdAt: string
  statusHistory: StatusHistoryEntry[]
  items: { id: string; quantity: number; price: number; product: { name: string } }[]
}

interface DashboardMetrics {
  totalSalesMonth: number
  totalSalesAll: number
  pendingCount: number
  deliveredCount: number
  lowStockCount: number
  productCount: number
  lowStock: { id: string; name: string; stock: number; images: string }[]
  topSelling: { productId: string; name: string; sold: number }[]
}

type Tab = 'resumen' | 'products' | 'categories' | 'orders'

const inputClasses =
  'w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-rose-900/50 focus:outline-none focus:border-rose-500 text-white text-sm placeholder:text-rose-300/30'
const labelClasses =
  'block text-xs font-semibold uppercase tracking-wider text-rose-300 mb-1'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  images: '',
  categoryId: '',
}

const emptyMetrics: DashboardMetrics = {
  totalSalesMonth: 0,
  totalSalesAll: 0,
  pendingCount: 0,
  deliveredCount: 0,
  lowStockCount: 0,
  productCount: 0,
  lowStock: [],
  topSelling: [],
}

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('resumen')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [savingField, setSavingField] = useState<{ id: string; field: string } | null>(null)

  const [productForm, setProductForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState('')

  const [trackingInput, setTrackingInput] = useState<Record<string, string>>({})
  const [noteInput, setNoteInput] = useState<Record<string, string>>({})

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, orderRes, catRes, dashRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/admin/orders'),
        fetch('/api/categories'),
        fetch('/api/admin/dashboard'),
      ])
      const [prodData, orderData, catData, dashData] = await Promise.all([
        prodRes.json(),
        orderRes.json(),
        catRes.json(),
        dashRes.json(),
      ])
      setProducts(prodData)
      setOrders(orderData)
      setCategories(catData)
      setMetrics(dashData ?? emptyMetrics)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Carga inicial de datos al montar. La función es async, pero la regla
    // no distingue el setState asíncrono post-await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [fetchData])

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products'
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock, 10),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Error al guardar el producto')
      } else {
        setProductForm(emptyForm)
        setEditingId(null)
        fetchData()
      }
    } catch (error) {
      console.error(error)
      alert('Error de red al guardar el producto')
    } finally {
      setBusy(false)
    }
  }

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setProductForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      images: product.images,
      categoryId: product.categoryId,
    })
    setActiveTab('products')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás segura de eliminar este producto?')) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) fetchData()
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Error al crear la categoría')
      } else {
        setCategoryName('')
        fetchData()
      }
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría? Solo se puede si no tiene productos.')) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error || 'No se pudo eliminar la categoría')
    } else {
      fetchData()
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    if (status === 'CANCELADO' && !confirm('¿Cancelar este pedido? El stock será devuelto al inventario.')) {
      return
    }
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) fetchData()
    else alert('Error al actualizar el estado')
  }

  const handleSaveTracking = async (id: string) => {
    setSavingField({ id, field: 'tracking' })
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tracking: trackingInput[id] ?? '' }),
    })
    setSavingField(null)
    if (res.ok) fetchData()
    else alert('Error al guardar el seguimiento')
  }

  const handleSaveNote = async (id: string) => {
    setSavingField({ id, field: 'note' })
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNote: noteInput[id] ?? '' }),
    })
    setSavingField(null)
    if (res.ok) fetchData()
    else alert('Error al guardar la nota')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-300" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-[#121212] border border-rose-900/40 p-10 rounded-3xl shadow-2xl">
          <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-rose-500 stroke-1" />
          <h1 className="font-serif text-2xl font-bold text-white mb-2">Acceso restringido</h1>
          <p className="text-sm text-rose-200/70 mb-6">
            Solo la administradora Sharol puede acceder a este panel.
          </p>
          <Link
            href="/"
            className="inline-flex px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium transition text-sm"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-rose-400 hover:text-white font-medium mb-2 transition text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la tienda</span>
            </Link>
            <h1 className="font-serif text-3xl font-bold text-white">Panel de Administración</h1>
            <p className="text-sm text-rose-300/70">
              Gestiona tus ventas, productos, categorías, stock y pedidos.
            </p>
          </div>

          <div className="flex bg-black/40 border border-rose-900/50 p-1 rounded-xl overflow-x-auto">
            <TabButton active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')}>
              <TrendingUp className="w-4 h-4" /> Resumen
            </TabButton>
            <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>
              <ShoppingBag className="w-4 h-4" /> Pedidos ({orders.length})
            </TabButton>
            <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')}>
              <Package className="w-4 h-4" /> Productos
            </TabButton>
            <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')}>
              <Tags className="w-4 h-4" /> Categorías
            </TabButton>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32 text-rose-300">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'resumen' && <ResumenTab metrics={metrics} orders={orders} />}

            {activeTab === 'products' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-[#121212] border border-rose-900/40 p-6 rounded-3xl shadow-2xl self-start">
                  <h2 className="font-serif text-xl font-bold text-white mb-4 flex items-center gap-2">
                    {editingId ? (
                      <Pencil className="w-5 h-5 text-rose-500" />
                    ) : (
                      <Plus className="w-5 h-5 text-rose-500" />
                    )}
                    <span>{editingId ? 'Editar Producto' : 'Agregar Nuevo Producto'}</span>
                  </h2>

                  <form onSubmit={handleSubmitProduct} className="space-y-4">
                    <div>
                      <label className={labelClasses}>Nombre</label>
                      <input
                        type="text"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className={inputClasses}
                        placeholder="Ej. Anillo de Plata"
                      />
                    </div>

                    <div>
                      <label className={labelClasses}>Descripción</label>
                      <textarea
                        required
                        rows={3}
                        value={productForm.description}
                        onChange={(e) =>
                          setProductForm({ ...productForm, description: e.target.value })
                        }
                        className={`${inputClasses} resize-none`}
                        placeholder="Detalles del producto..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClasses}>Precio (S/)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          value={productForm.price}
                          onChange={(e) =>
                            setProductForm({ ...productForm, price: e.target.value })
                          }
                          className={inputClasses}
                          placeholder="45.00"
                        />
                      </div>
                      <div>
                        <label className={labelClasses}>Stock</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={productForm.stock}
                          onChange={(e) =>
                            setProductForm({ ...productForm, stock: e.target.value })
                          }
                          className={inputClasses}
                          placeholder="10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClasses}>
                        URLs de Imagen <span className="text-rose-300/50">(separadas por coma)</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={productForm.images}
                        onChange={(e) =>
                          setProductForm({ ...productForm, images: e.target.value })
                        }
                        className={`${inputClasses} resize-none`}
                        placeholder="https://.../foto1.jpg, https://.../foto2.jpg"
                      />
                      <p className="text-[10px] text-rose-300/50 mt-1 flex items-center gap-1">
                        <Image className="w-3 h-3" />
                        La primera foto es la principal. Se muestran como galería.
                      </p>
                    </div>

                    <div>
                      <label className={labelClasses}>Categoría</label>
                      <select
                        required
                        value={productForm.categoryId}
                        onChange={(e) =>
                          setProductForm({ ...productForm, categoryId: e.target.value })
                        }
                        className={`${inputClasses} bg-[#1a1a1a]`}
                      >
                        <option value="">Selecciona una categoría</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={busy}
                        className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
                      >
                        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                        {editingId ? 'Guardar Cambios' : 'Guardar Producto'}
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null)
                            setProductForm(emptyForm)
                          }}
                          className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-rose-200 transition text-sm"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="lg:col-span-7 space-y-4">
                  <h2 className="font-serif text-xl font-bold text-white">
                    Inventario Actual ({products.length})
                  </h2>
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-[#121212] border border-rose-900/40 p-4 rounded-2xl shadow-xl flex items-center gap-4"
                    >
                      <img
                        src={product.images.split(',')[0].trim()}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-xl border border-rose-900/40"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-bold text-white truncate">{product.name}</h3>
                        <p className="text-xs text-rose-300/70">
                          {formatPrice(product.price)} &bull; Stock:{' '}
                          <span
                            className={
                              product.stock <= 3
                                ? 'text-amber-400 font-semibold'
                                : 'text-rose-300/70'
                            }
                          >
                            {product.stock}
                          </span>
                        </p>
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300">
                          {product.category.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="p-2 text-rose-300 hover:text-white hover:bg-white/10 rounded-lg transition"
                          title="Editar producto"
                          aria-label={`Editar ${product.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-rose-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Eliminar producto"
                          aria-label={`Eliminar ${product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 bg-[#121212] border border-rose-900/40 p-6 rounded-3xl shadow-2xl self-start">
                  <h2 className="font-serif text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-rose-500" />
                    <span>Nueva Categoría</span>
                  </h2>
                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <div>
                      <label className={labelClasses}>Nombre</label>
                      <input
                        type="text"
                        required
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className={inputClasses}
                        placeholder="Ej. Accesorios"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
                    >
                      {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                      Crear Categoría
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-8 space-y-4">
                  <h2 className="font-serif text-xl font-bold text-white">
                    Categorías ({categories.length})
                  </h2>
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-[#121212] border border-rose-900/40 p-4 rounded-2xl shadow-xl flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                        <Tags className="w-5 h-5 text-rose-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif font-bold text-white">{category.name}</h3>
                        <p className="text-[10px] font-mono text-rose-400">/{category.slug}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-rose-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title="Eliminar categoría"
                        aria-label={`Eliminar categoría ${category.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <OrdersTab
                orders={orders}
                trackingInput={trackingInput}
                setTrackingInput={setTrackingInput}
                noteInput={noteInput}
                setNoteInput={setNoteInput}
                savingField={savingField}
                onUpdateStatus={handleUpdateStatus}
                onSaveTracking={handleSaveTracking}
                onSaveNote={handleSaveNote}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint?: string
  accent?: boolean
}) {
  return (
    <div
      className={`bg-[#121212] border rounded-3xl p-6 shadow-xl flex flex-col justify-between ${
        accent ? 'border-rose-500/50' : 'border-rose-900/40'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-rose-300/80 font-semibold">
          {label}
        </span>
        <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <span className="font-serif text-3xl font-bold text-white">{value}</span>
        {hint && <p className="text-xs text-rose-300/60 mt-1">{hint}</p>}
      </div>
    </div>
  )
}

function ResumenTab({ metrics, orders }: { metrics: DashboardMetrics; orders: Order[] }) {
  const pendingOrders = orders.filter((order) =>
    ['SOLICITADO', 'CONFIRMADO'].includes(order.status)
  )

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Ventas del mes"
          value={formatPrice(metrics.totalSalesMonth)}
          hint="Pedidos del mes (sin cancelados)"
          accent
        />
        <MetricCard
          icon={<ClipboardCheck className="w-4 h-4" />}
          label="Por atender"
          value={String(metrics.pendingCount)}
          hint="Solicitados o con pago por verificar"
        />
        <MetricCard
          icon={<CheckCircle className="w-4 h-4" />}
          label="Entregados"
          value={String(metrics.deliveredCount)}
          hint={`Ventas totales: ${formatPrice(metrics.totalSalesAll)}`}
        />
        <MetricCard
          icon={<Package className="w-4 h-4" />}
          label="Productos"
          value={String(metrics.productCount)}
          hint={`${metrics.lowStockCount} con stock bajo`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#121212] border border-rose-900/40 p-6 rounded-3xl shadow-2xl">
          <h2 className="font-serif text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Productos con stock bajo
          </h2>
          {metrics.lowStock.length === 0 ? (
            <p className="text-sm text-rose-300/60">Todo el inventario está saludable. ✨</p>
          ) : (
            <div className="space-y-3">
              {metrics.lowStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 bg-black/40 border border-rose-900/40 rounded-xl p-3"
                >
                  <img
                    src={product.images.split(',')[0].trim()}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover border border-rose-900/40"
                  />
                  <span className="flex-1 text-sm text-white truncate">{product.name}</span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      product.stock <= 0
                        ? 'bg-red-500/15 text-red-300 border border-red-500/40'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {product.stock <= 0 ? 'Agotado' : `${product.stock} uds`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#121212] border border-rose-900/40 p-6 rounded-3xl shadow-2xl">
          <h2 className="font-serif text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-rose-400" />
            Más vendidos
          </h2>
          {metrics.topSelling.length === 0 ? (
            <p className="text-sm text-rose-300/60">Aún no hay ventas registradas.</p>
          ) : (
            <div className="space-y-3">
              {metrics.topSelling.map((item, index) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 bg-black/40 border border-rose-900/40 rounded-xl p-3"
                >
                  <span className="w-7 h-7 rounded-lg bg-rose-600/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm text-white truncate">{item.name}</span>
                  <span className="text-xs text-rose-300 font-semibold">
                    {item.sold} vendidos
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#121212] border border-rose-900/40 p-6 rounded-3xl shadow-2xl">
        <h2 className="font-serif text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-rose-400" />
          Pedidos por atender
        </h2>
        {pendingOrders.length === 0 ? (
          <p className="text-sm text-rose-300/60">No hay pedidos pendientes. ¡Perfecto! 🎉</p>
        ) : (
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 bg-black/40 border border-rose-900/40 rounded-xl p-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{order.customerName}</p>
                  <p className="text-xs text-rose-300/60 truncate">
                    {order.customerPhone} &bull; {order.paymentMethod} &bull;{' '}
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${orderStatusStyle(order.status)}`}>
                  {orderStatusLabel(order.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function OrdersTab({
  orders,
  trackingInput,
  setTrackingInput,
  noteInput,
  setNoteInput,
  savingField,
  onUpdateStatus,
  onSaveTracking,
  onSaveNote,
}: {
  orders: Order[]
  trackingInput: Record<string, string>
  setTrackingInput: React.Dispatch<React.SetStateAction<Record<string, string>>>
  noteInput: Record<string, string>
  setNoteInput: React.Dispatch<React.SetStateAction<Record<string, string>>>
  savingField: { id: string; field: string } | null
  onUpdateStatus: (id: string, status: string) => void
  onSaveTracking: (id: string) => void
  onSaveNote: (id: string) => void
}) {
  const progressStatuses = ORDER_STATUSES.filter((status) => status !== 'CANCELADO')

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl font-bold text-white">
        Historial de Pedidos ({orders.length})
      </h2>
      {orders.length === 0 ? (
        <div className="bg-[#121212] border border-rose-900/40 p-12 rounded-3xl text-center text-rose-300/60">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 stroke-1" />
          <p>No hay pedidos registrados todavía.</p>
        </div>
      ) : (
        orders.map((order) => {
          const currentIndex = progressStatuses.indexOf(order.status as never)
          const isCancelled = order.status === 'CANCELADO'

          return (
            <div
              key={order.id}
              className="bg-[#121212] border border-rose-900/40 p-6 rounded-3xl shadow-2xl space-y-5"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-rose-900/40 pb-4">
                <div>
                  <span className="text-xs font-mono text-rose-500">Orden ID: {order.id}</span>
                  <h3 className="font-serif font-bold text-white text-lg">
                    {order.customerName}
                  </h3>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${orderStatusStyle(order.status)}`}>
                    {orderStatusLabel(order.status)}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                    {order.paymentMethod}
                  </span>
                  <span className="font-serif font-bold text-white text-lg">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-rose-200/80">
                <div>
                  <span className="font-semibold block text-rose-300">Contacto:</span>
                  {order.customerEmail} - {order.customerPhone}
                </div>
                <div>
                  <span className="font-semibold block text-rose-300">Dirección:</span>
                  {order.shippingAddress}, {order.city}
                </div>
                <div>
                  <span className="font-semibold block text-rose-300">Fecha:</span>
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs font-semibold uppercase text-rose-300 block mb-2">
                  Productos Comprados:
                </span>
                <div className="space-y-1 bg-black/40 p-3 rounded-xl border border-rose-900/40">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-white">
                      <span>
                        {item.product.name} (x{item.quantity})
                      </span>
                      <span className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {order.voucherUrl && (
                <div className="pt-2">
                  <span className="text-xs font-semibold uppercase text-rose-300 block mb-2">
                    Comprobante de pago:
                  </span>
                  <a
                    href={order.voucherUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <img
                      src={order.voucherUrl}
                      alt="Comprobante de pago"
                      className="w-28 h-36 object-cover rounded-xl border border-rose-500/50 hover:scale-105 transition"
                    />
                  </a>
                </div>
              )}

              {order.tracking && (
                <div className="pt-1">
                  <span className="text-xs font-semibold uppercase text-rose-300">
                    Seguimiento:{' '}
                  </span>
                  <span className="text-sm text-white font-mono">{order.tracking}</span>
                </div>
              )}

              {order.adminNote && (
                <div className="pt-1">
                  <span className="text-xs font-semibold uppercase text-rose-300">
                    Nota interna:{' '}
                  </span>
                  <span className="text-sm text-white">{order.adminNote}</span>
                </div>
              )}

              <div className="pt-3 border-t border-rose-900/40 space-y-5">
                <div>
                  <span className="text-xs font-semibold uppercase text-rose-300 block mb-3">
                    Progreso del pedido
                  </span>
                  <div className="flex items-center flex-wrap gap-1.5">
                    {progressStatuses.map((status, index) => {
                      const reached = !isCancelled && index <= currentIndex
                      const isCurrent = index === currentIndex
                      return (
                        <button
                          key={status}
                          onClick={() => onUpdateStatus(order.id, status)}
                          disabled={isCancelled}
                          title={`Marcar como ${orderStatusLabel(status)}`}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition active:scale-95 ${
                            isCurrent
                              ? 'bg-rose-600 border-rose-500 text-white shadow-md'
                              : reached
                              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
                              : 'bg-black/40 border-rose-900/40 text-rose-300/40 hover:text-rose-200 hover:border-rose-700'
                          }`}
                        >
                          {reached && !isCurrent && <Check className="w-3 h-3 inline mr-1" />}
                          {orderStatusLabel(status)}
                        </button>
                      )
                    })}
                    {!isCancelled && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'CANCELADO')}
                        className="px-3 py-1.5 rounded-full text-[11px] font-semibold border border-red-500/40 text-red-300 bg-red-500/10 hover:bg-red-500/25 transition active:scale-95 flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase text-rose-300 block mb-1.5 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      N° de seguimiento
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={trackingInput[order.id] ?? order.tracking ?? ''}
                        onChange={(e) =>
                          setTrackingInput((prev) => ({ ...prev, [order.id]: e.target.value }))
                        }
                        className={inputClasses}
                        placeholder="Ej. Olva 1234567890"
                      />
                      <button
                        onClick={() => onSaveTracking(order.id)}
                        disabled={savingField?.id === order.id && savingField.field === 'tracking'}
                        className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-sm transition shrink-0 flex items-center justify-center"
                        aria-label="Guardar seguimiento"
                      >
                        {savingField?.id === order.id && savingField.field === 'tracking' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase text-rose-300 block mb-1.5 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      Nota interna
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={noteInput[order.id] ?? order.adminNote ?? ''}
                        onChange={(e) =>
                          setNoteInput((prev) => ({ ...prev, [order.id]: e.target.value }))
                        }
                        className={inputClasses}
                        placeholder="Ej. Cliente pidió entrega el sábado"
                      />
                      <button
                        onClick={() => onSaveNote(order.id)}
                        disabled={savingField?.id === order.id && savingField.field === 'note'}
                        className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-sm transition shrink-0 flex items-center justify-center"
                        aria-label="Guardar nota"
                      >
                        {savingField?.id === order.id && savingField.field === 'note' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {order.statusHistory.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold uppercase text-rose-300 block mb-2">
                      Historial
                    </span>
                    <ol className="space-y-1.5 border-l border-rose-900/40 pl-4">
                      {order.statusHistory.map((entry) => (
                        <li key={entry.id} className="text-xs text-rose-200/80">
                          <span className={`font-semibold ${orderStatusStyle(entry.status)} inline-block px-2 py-0.5 rounded-full text-[10px]`}>
                            {orderStatusLabel(entry.status)}
                          </span>{' '}
                          <span className="text-rose-300/50">
                            {new Date(entry.createdAt).toLocaleString()}
                          </span>
                          {entry.note && <span className="text-white"> — {entry.note}</span>}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
        active
          ? 'bg-rose-600 text-white shadow-sm'
          : 'text-rose-300 hover:text-white hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  )
}

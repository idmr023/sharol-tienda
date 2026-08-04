export const ORDER_STATUSES = [
  'SOLICITADO',
  'CONFIRMADO',
  'EN_PREPARACION',
  'ENVIADO',
  'ENTREGADO',
  'CANCELADO',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  SOLICITADO: 'Solicitado',
  CONFIRMADO: 'Pago verificado',
  EN_PREPARACION: 'En preparación',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  SOLICITADO: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
  CONFIRMADO: 'bg-sky-500/15 border-sky-500/40 text-sky-300',
  EN_PREPARACION: 'bg-violet-500/15 border-violet-500/40 text-violet-300',
  ENVIADO: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
  ENTREGADO: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
  CANCELADO: 'bg-red-500/15 border-red-500/40 text-red-300',
}

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? status
}

export function orderStatusStyle(status: string): string {
  return ORDER_STATUS_STYLES[status as OrderStatus] ?? 'bg-white/10 border-white/20 text-white'
}

export function orderStatusPipeline(current: string): OrderStatus[] {
  const order = ORDER_STATUSES.filter(
    (status): status is Exclude<OrderStatus, 'CANCELADO'> => status !== 'CANCELADO'
  )
  const idx = order.indexOf(current as (typeof order)[number])
  if (idx === -1) return []
  return order.slice(0, idx + 1)
}

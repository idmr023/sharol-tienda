import { NextResponse } from 'next/server'
import { orderRepository } from '@backend/repositories/orderRepository'
import {
  cancelOrderAndRestoreStock,
  OrderNotFoundError,
} from '@backend/services/orderService'
import { authErrorResponse, requireAdmin } from '@backend/services/authSession'
import { ORDER_STATUSES } from '@backend/validation/orders'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const existing = await orderRepository.findById(id)
    if (!existing) {
      return NextResponse.json({ error: 'El pedido no existe' }, { status: 404 })
    }

    if (typeof body.status === 'string') {
      const status = body.status.trim().toUpperCase()
      if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
        return NextResponse.json(
          { error: 'Estado de pedido no válido' },
          { status: 400 }
        )
      }
      const note = typeof body.note === 'string' ? body.note.trim() : undefined

      if (status === 'CANCELADO' && existing.status !== 'CANCELADO') {
        await cancelOrderAndRestoreStock(id)
      } else {
        await orderRepository.updateStatus(id, status, note)
      }
    }

    if (typeof body.tracking === 'string') {
      await orderRepository.updateTracking(id, body.tracking)
    }

    if (typeof body.adminNote === 'string') {
      await orderRepository.updateAdminNote(id, body.adminNote)
    }

    const updated = await orderRepository.findByIdWithItems(id)
    return NextResponse.json(updated)
  } catch (error) {
    const auth = authErrorResponse(error)
    if (auth) return auth
    if (error instanceof OrderNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('PATCH /api/admin/orders/[id]:', error)
    return NextResponse.json({ error: 'Error al actualizar el pedido' }, { status: 500 })
  }
}

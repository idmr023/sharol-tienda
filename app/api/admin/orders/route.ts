import { NextResponse } from 'next/server'
import { orderRepository } from '@backend/repositories/orderRepository'
import { authErrorResponse, requireAdmin } from '@backend/services/authSession'

export async function GET() {
  try {
    await requireAdmin()
    const orders = await orderRepository.findAllWithItems()
    return NextResponse.json(orders)
  } catch (error) {
    const auth = authErrorResponse(error)
    if (auth) return auth
    console.error('GET /api/admin/orders:', error)
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 })
  }
}

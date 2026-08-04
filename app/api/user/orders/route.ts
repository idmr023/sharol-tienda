import { NextResponse } from 'next/server'
import { orderRepository } from '@backend/repositories/orderRepository'
import { authErrorResponse, requireAuth } from '@backend/services/authSession'

export async function GET() {
  try {
    const currentUser = await requireAuth()

    const orders = await orderRepository.findByUserIdWithItems(currentUser.id)

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress,
        city: order.city,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        tracking: order.tracking,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          product: {
            id: item.product.id,
            name: item.product.name,
            image: item.product.images?.[0] ?? null,
          },
        })),
        statusHistory: order.statusHistory.map((h) => ({
          status: h.status,
          note: h.note,
          createdAt: h.createdAt,
        })),
      })),
    })
  } catch (error) {
    return authErrorResponse(error)
  }
}

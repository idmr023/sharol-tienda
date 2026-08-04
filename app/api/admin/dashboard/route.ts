import { NextResponse } from 'next/server'
import { prisma } from '@backend/db'
import { authErrorResponse, requireAdmin } from '@backend/services/authSession'

export async function GET() {
  try {
    await requireAdmin()

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [orders, ordersMonth, pendingOrders, products, lowStock, topSellers] =
      await Promise.all([
        prisma.order.findMany({ select: { totalAmount: true, status: true, createdAt: true } }),
        prisma.order.findMany({
          where: {
            createdAt: { gte: monthStart },
            status: { not: 'CANCELADO' },
          },
          select: { totalAmount: true },
        }),
        prisma.order.findMany({
          where: { status: { in: ['SOLICITADO', 'CONFIRMADO'] } },
          select: { id: true },
        }),
        prisma.product.findMany({ select: { id: true, stock: true, name: true } }),
        prisma.product.findMany({
          where: { stock: { lte: 3 } },
          orderBy: { stock: 'asc' },
          take: 8,
          select: { id: true, name: true, stock: true, images: true },
        }),
        prisma.orderItem.groupBy({
          by: ['productId'],
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 5,
        }),
      ])

    const productNames = new Map(
      products.map((p) => [p.id, p.name])
    )
    const topSelling = topSellers.map((seller) => ({
      productId: seller.productId,
      name: productNames.get(seller.productId) ?? 'Desconocido',
      sold: seller._sum.quantity ?? 0,
    }))

    const totalSalesMonth = ordersMonth.reduce((acc, o) => acc + o.totalAmount, 0)
    const totalSalesAll = orders.reduce(
      (acc, o) => (o.status !== 'CANCELADO' ? acc + o.totalAmount : acc),
      0
    )
    const pendingCount = pendingOrders.length
    const deliveredCount = orders.filter((o) => o.status === 'ENTREGADO').length
    const lowStockCount = lowStock.length
    const productCount = products.length

    return NextResponse.json({
      totalSalesMonth,
      totalSalesAll,
      pendingCount,
      deliveredCount,
      lowStockCount,
      productCount,
      lowStock,
      topSelling,
    })
  } catch (error) {
    const auth = authErrorResponse(error)
    if (auth) return auth
    console.error('GET /api/admin/dashboard:', error)
    return NextResponse.json({ error: 'Error al obtener métricas' }, { status: 500 })
  }
}

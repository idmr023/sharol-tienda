import { prisma } from '@backend/db'
import type { PaymentMethod } from '@backend/validation/orders'

export interface OrderItemData {
  productId: string
  quantity: number
  price: number
}

export interface CreateOrderData {
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  city: string
  totalAmount: number
  paymentMethod: PaymentMethod
  voucherUrl?: string | null
  userId?: string | null
  items: OrderItemData[]
}

export const orderRepository = {
  create(data: CreateOrderData) {
    return prisma.order.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddress: data.shippingAddress,
        city: data.city,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        voucherUrl: data.voucherUrl ?? null,
        userId: data.userId ?? null,
        status: 'SOLICITADO',
        statusHistory: {
          create: {
            status: 'SOLICITADO',
            note: 'Pedido registrado',
          },
        },
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    })
  },

  findAllWithItems() {
    return prisma.order.findMany({
      include: {
        items: {
          include: { product: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  findByIdWithItems(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  },

  findByUserIdWithItems(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  updateStatus(id: string, status: string, note?: string) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status },
      })
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          note: note?.trim() || null,
        },
      })
      return updated
    })
  },

  updateTracking(id: string, tracking: string) {
    return prisma.order.update({
      where: { id },
      data: { tracking: tracking.trim() || null },
    })
  },

  updateAdminNote(id: string, adminNote: string) {
    return prisma.order.update({
      where: { id },
      data: { adminNote: adminNote.trim() || null },
    })
  },

  findById(id: string) {
    return prisma.order.findUnique({ where: { id } })
  },
}

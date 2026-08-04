import { prisma } from '@backend/db'
import type { ValidOrderInput } from '@backend/validation/orders'
import { orderRepository } from '@backend/repositories/orderRepository'

export class OutOfStockError extends Error {
  constructor(public readonly productName: string) {
    super(`Stock insuficiente para "${productName}"`)
    this.name = 'OutOfStockError'
  }
}

export class ProductNotFoundError extends Error {
  constructor(productId: string) {
    super(`El producto ${productId} no existe`)
    this.name = 'ProductNotFoundError'
  }
}

export class OrderNotFoundError extends Error {
  constructor(orderId: string) {
    super(`El pedido ${orderId} no existe`)
    this.name = 'OrderNotFoundError'
  }
}

export const CANCEL_STATUS = 'CANCELADO'

export async function createOrderFromCheckout(
  input: ValidOrderInput,
  userId?: string | null
): Promise<string> {
  const orderId = await prisma.$transaction(async (tx) => {
    let total = 0

    for (const item of input.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } })
      if (!product) {
        throw new ProductNotFoundError(item.productId)
      }
      if (product.stock < item.quantity) {
        throw new OutOfStockError(product.name)
      }
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: product.stock - item.quantity },
      })
      total += product.price * item.quantity
    }

    const order = await tx.order.create({
      data: {
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        shippingAddress: input.shippingAddress,
        city: input.city,
        totalAmount: total,
        paymentMethod: input.paymentMethod,
        voucherUrl: input.voucherUrl ?? null,
        userId: userId ?? null,
        status: 'SOLICITADO',
        statusHistory: {
          create: {
            status: 'SOLICITADO',
            note: 'Pedido registrado',
          },
        },
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    })

    return order.id
  })

  return orderId
}

export async function cancelOrderAndRestoreStock(orderId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })
    if (!order) {
      throw new OrderNotFoundError(orderId)
    }
    if (order.status === CANCEL_STATUS) return

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: CANCEL_STATUS },
    })
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: CANCEL_STATUS,
        note: 'Pedido cancelado (stock devuelto)',
      },
    })
  })
}

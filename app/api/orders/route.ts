import { NextResponse } from 'next/server'
import {
  createOrderFromCheckout,
  OutOfStockError,
  ProductNotFoundError,
} from '@backend/services/orderService'
import { parseOrderInput } from '@backend/validation/orders'
import { ValidationError } from '@backend/validation/errors'
import { getCurrentUser } from '@backend/services/authSession'
import { sendVoucherEmail } from '@backend/services/voucherMailer'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const order = parseOrderInput(body)
    const currentUser = await getCurrentUser()
    const orderId = await createOrderFromCheckout(order, currentUser?.id)

    // Enviar el comprobante al correo de Sharol para verificación manual.
    // Si falla el correo, el pedido se mantiene registrado (también es visible en /admin).
    try {
      await sendVoucherEmail(orderId)
    } catch (mailError) {
      console.error(`No se pudo enviar el correo del pedido ${orderId}:`, mailError)
    }

    return NextResponse.json({ success: true, orderId }, { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof OutOfStockError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('POST /api/orders:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

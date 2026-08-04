import { Resend } from 'resend'
import { prisma } from '@backend/db'
import { formatPrice } from '@frontend/lib/utils'

const API_KEY = process.env.RESEND_API_KEY
const FROM = process.env.MAIL_FROM || 'Sharol Tienda <onboarding@resend.dev>'
const TO = process.env.SHAROL_EMAIL || process.env.ADMIN_EMAIL || 'sharol@sharol.tienda'

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'application/pdf': 'pdf',
}

function voucherExtension(mimeType: string): string {
  return EXTENSIONS[mimeType] || 'jpg'
}

function paymentLabel(method: string): string {
  switch (method) {
    case 'YAPE':
      return 'Yape'
    case 'PLIN':
      return 'Plin'
    case 'TRANSFERENCIA':
      return 'Transferencia Bancaria'
    default:
      return method
  }
}

function buildHtml(order: {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  city: string
  totalAmount: number
  paymentMethod: string
  createdAt: Date
  items: { quantity: number; price: number; product: { name: string } }[]
}): string {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${item.product.name} × ${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;text-align:right;">S/ ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join('')

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f7f7f7;padding:24px;border-radius:12px;">
    <div style="background:#0d0d0d;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;">
      <h1 style="margin:0;font-size:20px;letter-spacing:2px;">SHAROL TIENDA</h1>
      <p style="margin:4px 0 0;font-size:12px;color:#fda4af;">Nuevo pedido pendiente de verificación</p>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;color:#333;">
      <h2 style="margin:0 0 16px;font-size:18px;">Pedido <span style="font-family:monospace;color:#e11d48;">#${order.id}</span></h2>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:4px 0;color:#888;">Cliente</td>
          <td style="padding:4px 0;text-align:right;font-weight:600;">${order.customerName}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#888;">Correo</td>
          <td style="padding:4px 0;text-align:right;">${order.customerEmail}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#888;">Celular / WhatsApp</td>
          <td style="padding:4px 0;text-align:right;">${order.customerPhone}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#888;">Envío</td>
          <td style="padding:4px 0;text-align:right;">${order.shippingAddress}, ${order.city}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#888;">Método de pago</td>
          <td style="padding:4px 0;text-align:right;font-weight:600;">${paymentLabel(order.paymentMethod)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#888;">Fecha</td>
          <td style="padding:4px 0;text-align:right;">${new Date(order.createdAt).toLocaleString('es-PE')}</td>
        </tr>
      </table>

      <h3 style="margin:20px 0 8px;font-size:14px;color:#555;">Productos</h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f1f1f1;">
            <th style="padding:8px 12px;text-align:left;font-size:12px;">Producto</th>
            <th style="padding:8px 12px;text-align:right;font-size:12px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <p style="text-align:right;font-size:18px;font-weight:700;margin:16px 0 0;">
        Total: <span style="color:#e11d48;">S/ ${order.totalAmount.toFixed(2)}</span>
      </p>

      <div style="margin-top:20px;padding:14px 16px;background:#fff1f2;border:1px solid #fecdd3;border-radius:8px;font-size:13px;color:#9f1239;">
        El comprobante de pago va adjunto en este correo. Verifica que el monto coincida con el total
        y confirma el pedido en el panel de administración.
      </div>
    </div>
  </div>`
}

export async function sendVoucherEmail(orderId: string): Promise<void> {
  if (!API_KEY) {
    console.warn(
      `[voucherMailer] RESEND_API_KEY no configurada; no se envió el correo del pedido ${orderId}.`
    )
    return
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  })

  if (!order) {
    throw new Error(`Pedido ${orderId} no encontrado para enviar el comprobante`)
  }

  if (!order.voucherUrl) {
    throw new Error(`El pedido ${orderId} no tiene comprobante adjunto`)
  }

  const dataUrlPattern = /^data:([^;]+);base64,(.+)$/
  const match = order.voucherUrl.match(dataUrlPattern)
  if (!match) {
    throw new Error(`Comprobante del pedido ${orderId} no es una data URL válida`)
  }

  const mimeType = match[1].toLowerCase()
  const base64Content = match[2]

  const resend = new Resend(API_KEY)
  const { error } = await resend.emails.send({
    from: FROM,
    to: [TO],
    subject: `🧾 Nuevo comprobante de pago — Pedido #${orderId}`,
    html: buildHtml(order),
    attachments: [
      {
        filename: `comprobante-${orderId.slice(0, 8)}.${voucherExtension(mimeType)}`,
        content: Buffer.from(base64Content, 'base64'),
      },
    ],
  })

  if (error) {
    throw new Error(`Resend: ${error.message}`)
  }
}

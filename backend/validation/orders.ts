import { ValidationError } from './errors'

export const PAYMENT_METHODS = ['YAPE', 'PLIN', 'TRANSFERENCIA'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const ORDER_STATUSES = [
  'SOLICITADO',
  'CONFIRMADO',
  'EN_PREPARACION',
  'ENVIADO',
  'ENTREGADO',
  'CANCELADO',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const VOUCHER_MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export interface VoucherValidationResult {
  valid: boolean
  error?: string
}

// Formatos cuya firma binaria podemos verificar con seguridad.
const VERIFIABLE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
}

function hasValidSignature(mimeType: string, data: Uint8Array): boolean {
  // WebP: contenedor RIFF con firma WEBP en el offset 8.
  if (mimeType === 'image/webp') {
    return (
      data[0] === 0x52 &&
      data[1] === 0x49 &&
      data[2] === 0x46 &&
      data[3] === 0x46 &&
      data[8] === 0x57 &&
      data[9] === 0x45 &&
      data[10] === 0x42 &&
      data[11] === 0x50
    )
  }

  const signatures = VERIFIABLE_SIGNATURES[mimeType]
  if (!signatures) {
    // Formatos sin firma verificable (HEIC, AVIF, etc.) se dejan pasar:
    // Sharol revisará el comprobante manualmente por correo.
    return true
  }
  return signatures.some((sig) => sig.every((byte, index) => data[index] === byte))
}

export function validateVoucher(dataUrl: string): VoucherValidationResult {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return { valid: false, error: 'Comprobante no proporcionado' }
  }

  const dataUrlPattern = /^data:([^;]+);base64,(.+)$/
  const match = dataUrl.match(dataUrlPattern)
  if (!match) {
    return { valid: false, error: 'Formato de comprobante inválido' }
  }

  const mimeType = match[1].toLowerCase()
  const base64Data = match[2]

  if (!mimeType.startsWith('image/') && mimeType !== 'application/pdf') {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Sube una imagen (captura de pantalla) o un PDF.',
    }
  }

  let binaryData: Uint8Array
  try {
    binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))
  } catch {
    return { valid: false, error: 'Datos del comprobante corruptos' }
  }

  if (binaryData.length > VOUCHER_MAX_SIZE) {
    return {
      valid: false,
      error: `El comprobante supera el tamaño máximo de ${VOUCHER_MAX_SIZE / (1024 * 1024)} MB`,
    }
  }

  if (!hasValidSignature(mimeType, binaryData)) {
    return {
      valid: false,
      error: 'El archivo no parece ser una imagen/PDF válida (firma inválida)',
    }
  }

  return { valid: true }
}

export interface OrderItemInput {
  productId?: unknown
  quantity?: unknown
  price?: unknown
}

export interface ValidOrderItem {
  productId: string
  quantity: number
  price: number
}

export interface OrderInput {
  customerName?: unknown
  customerEmail?: unknown
  customerPhone?: unknown
  shippingAddress?: unknown
  city?: unknown
  paymentMethod?: unknown
  voucherUrl?: unknown
  items?: unknown
}

export interface ValidOrderInput {
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  city: string
  paymentMethod: PaymentMethod
  voucherUrl?: string
  items: ValidOrderItem[]
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[0-9]{7,12}$/

export function parseOrderInput(input: OrderInput): ValidOrderInput {
  const customerName = typeof input.customerName === 'string' ? input.customerName.trim() : ''
  const customerEmail = typeof input.customerEmail === 'string' ? input.customerEmail.trim() : ''
  const customerPhone = typeof input.customerPhone === 'string' ? input.customerPhone.trim() : ''
  const shippingAddress =
    typeof input.shippingAddress === 'string' ? input.shippingAddress.trim() : ''
  const city = typeof input.city === 'string' ? input.city.trim() : 'Lima'

  if (!customerName || customerName.length > 120) {
    throw new ValidationError('El nombre del cliente es obligatorio (máx. 120 caracteres)')
  }
  if (!EMAIL_PATTERN.test(customerEmail)) {
    throw new ValidationError('El correo electrónico no es válido')
  }
  if (!PHONE_PATTERN.test(customerPhone)) {
    throw new ValidationError('El celular debe contener entre 7 y 12 dígitos')
  }
  if (!shippingAddress || shippingAddress.length > 300) {
    throw new ValidationError('La dirección de envío es obligatoria (máx. 300 caracteres)')
  }
  if (!city || city.length > 80) {
    throw new ValidationError('La ciudad es obligatoria (máx. 80 caracteres)')
  }

  const rawMethod =
    typeof input.paymentMethod === 'string' ? input.paymentMethod.trim().toUpperCase() : 'TRANSFERENCIA'
  const paymentMethod: PaymentMethod = PAYMENT_METHODS.includes(rawMethod as PaymentMethod)
    ? (rawMethod as PaymentMethod)
    : 'TRANSFERENCIA'

  let voucherUrl: string | undefined
  if (input.voucherUrl !== undefined && input.voucherUrl !== null) {
    if (typeof input.voucherUrl !== 'string' || input.voucherUrl.length > 15_000_000) {
      throw new ValidationError('El comprobante de pago no es válido')
    }
    const voucherValidation = validateVoucher(input.voucherUrl)
    if (!voucherValidation.valid) {
      throw new ValidationError(voucherValidation.error || 'Comprobante inválido')
    }
    voucherUrl = input.voucherUrl.trim()
    if (voucherUrl.length === 0) voucherUrl = undefined
  } else {
    // Voucher is now mandatory for ALL payment methods (Yape, Plin, Transferencia)
    throw new ValidationError('El comprobante de pago es obligatorio')
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new ValidationError('El pedido debe incluir al menos un producto')
  }

  const items = input.items.map((raw) => {
    const item = raw as OrderItemInput
    const productId = typeof item.productId === 'string' ? item.productId.trim() : ''
    const quantity = Number(item.quantity)
    const price = Number(item.price)

    if (!productId) {
      throw new ValidationError('Cada producto debe tener un id válido')
    }
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 999) {
      throw new ValidationError('La cantidad de cada producto debe ser un entero positivo')
    }
    if (!Number.isFinite(price) || price < 0) {
      throw new ValidationError('El precio de cada producto no es válido')
    }
    return { productId, quantity, price }
  })

  return {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    city,
    paymentMethod,
    voucherUrl,
    items,
  }
}

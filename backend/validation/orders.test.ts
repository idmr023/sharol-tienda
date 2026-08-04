import { describe, expect, it } from 'vitest'
import { parseOrderInput, validateVoucher } from './orders'
import { ValidationError } from './errors'

// Valid vertical PNG (200x360, ratio 1.8) — real magic bytes + IHDR
const VALID_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAMgAAAFoCAIAAACdUSOTAAAA6UlEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4NcATVUAAWphYF0AAAAASUVORK5CYII='

const validInput = {
  customerName: 'Sharol Quispe',
  customerEmail: 'sharol@example.com',
  customerPhone: '916663318',
  shippingAddress: 'Av. Larco 123, Miraflores',
  city: 'Lima',
  paymentMethod: 'YAPE',
  voucherUrl: `data:image/png;base64,${VALID_PNG_B64}`,
  items: [{ productId: 'abc', quantity: 2, price: 55 }],
}

describe('parseOrderInput', () => {
  it('acepta un pedido válido y normaliza el método de pago', () => {
    const result = parseOrderInput(validInput)
    expect(result).toMatchObject({
      customerName: 'Sharol Quispe',
      paymentMethod: 'YAPE',
      items: [{ productId: 'abc', quantity: 2, price: 55 }],
    })
  })

  it('rechaza un correo inválido', () => {
    expect(() => parseOrderInput({ ...validInput, customerEmail: 'correo-mal' })).toThrow(
      ValidationError
    )
  })

  it('rechaza un celular con caracteres no numéricos', () => {
    expect(() => parseOrderInput({ ...validInput, customerPhone: '91a663318' })).toThrow(
      ValidationError
    )
  })

  it('rechaza un pedido sin items', () => {
    expect(() => parseOrderInput({ ...validInput, items: [] })).toThrow(ValidationError)
  })

  it('rechaza cantidades no enteras', () => {
    expect(() =>
      parseOrderInput({ ...validInput, items: [{ productId: 'abc', quantity: 1.5, price: 55 }] })
    ).toThrow(ValidationError)
  })

  it('normaliza el método de pago a TRANSFERENCIA si es desconocido', () => {
    const result = parseOrderInput({ ...validInput, paymentMethod: 'RANDOM' })
    expect(result.paymentMethod).toBe('TRANSFERENCIA')
  })

  it('acepta TRANSFERENCIA como método de pago válido', () => {
    const result = parseOrderInput({ ...validInput, paymentMethod: 'TRANSFERENCIA' })
    expect(result.paymentMethod).toBe('TRANSFERENCIA')
  })

  it('rechaza un pedido sin comprobante (voucher obligatorio)', () => {
    const { voucherUrl: _omit, ...withoutVoucher } = validInput
    expect(() => parseOrderInput(withoutVoucher)).toThrow(ValidationError)
  })

  it('recorta espacios de los campos de texto', () => {
    const result = parseOrderInput({ ...validInput, customerName: '  Sharol  ' })
    expect(result.customerName).toBe('Sharol')
  })
})

describe('validateVoucher', () => {
  it('acepta una imagen PNG válida', () => {
    expect(validateVoucher(`data:image/png;base64,${VALID_PNG_B64}`).valid).toBe(true)
  })

  it('rechaza una data URL que no es imagen ni PDF', () => {
    const textB64 = btoa('esto no es una imagen')
    expect(validateVoucher(`data:text/plain;base64,${textB64}`).valid).toBe(false)
  })

  it('rechaza un archivo con firma binaria inválida (txt renombrado a png)', () => {
    const fakePng = btoa('esto no es una imagen png de verdad')
    const result = validateVoucher(`data:image/png;base64,${fakePng}`)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/firma inválida/)
  })

  it('rechaza un comprobante sin data URL', () => {
    expect(validateVoucher('https://example.com/voucher.jpg').valid).toBe(false)
  })
})

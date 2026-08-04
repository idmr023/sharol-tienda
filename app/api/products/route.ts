import { NextResponse } from 'next/server'
import { productRepository } from '@backend/repositories/productRepository'
import { parseProductInput } from '@backend/validation/products'
import { ValidationError } from '@backend/validation/errors'
import { authErrorResponse, requireAdmin } from '@backend/services/authSession'

export async function GET() {
  try {
    const products = await productRepository.findAllWithCategory()
    return NextResponse.json(products)
  } catch (error) {
    console.error('GET /api/products:', error)
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json().catch(() => ({}))
    const product = parseProductInput(body)
    const created = await productRepository.create(product)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    const auth = authErrorResponse(error)
    if (auth) return auth
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('POST /api/products:', error)
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}

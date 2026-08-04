import { NextResponse } from 'next/server'
import { productRepository } from '@backend/repositories/productRepository'
import { parseProductInput } from '@backend/validation/products'
import { ValidationError } from '@backend/validation/errors'
import { authErrorResponse, requireAdmin } from '@backend/services/authSession'

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const product = parseProductInput(body)
    const updated = await productRepository.update(id, product)
    return NextResponse.json(updated)
  } catch (error) {
    const auth = authErrorResponse(error)
    if (auth) return auth
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('PUT /api/products/[id]:', error)
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    await requireAdmin()
    const { id } = await params
    await productRepository.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const auth = authErrorResponse(error)
    if (auth) return auth
    console.error('DELETE /api/products/[id]:', error)
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 })
  }
}

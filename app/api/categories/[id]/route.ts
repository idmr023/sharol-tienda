import { NextResponse } from 'next/server'
import { categoryRepository } from '@backend/repositories/categoryRepository'
import { authErrorResponse, requireAdmin } from '@backend/services/authSession'

type RouteContext = { params: Promise<{ id: string }> }

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    await requireAdmin()
    const { id } = await params
    await categoryRepository.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const auth = authErrorResponse(error)
    if (auth) return auth
    console.error('DELETE /api/categories/[id]:', error)
    return NextResponse.json({ error: 'No se pudo eliminar la categoría (puede tener productos)' }, { status: 500 })
  }
}

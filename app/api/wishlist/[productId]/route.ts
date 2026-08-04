import { NextResponse } from 'next/server'
import { prisma } from '@backend/db'
import { authErrorResponse, requireAuth } from '@backend/services/authSession'

type RouteContext = { params: Promise<{ productId: string }> }

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireAuth()
    const { productId } = await params

    await prisma.wishlistItem.deleteMany({
      where: { userId: user.id, productId },
    })

    return NextResponse.json({ removed: true })
  } catch (error) {
    const auth = authErrorResponse(error)
    if (auth) return auth
    console.error('DELETE /api/wishlist/[productId]:', error)
    return NextResponse.json({ error: 'Error al quitar el favorito' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@backend/db'
import { authErrorResponse, requireAuth } from '@backend/services/authSession'

export async function GET() {
  try {
    const user = await requireAuth()
    const items = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      select: { productId: true },
    })
    return NextResponse.json({ productIds: items.map((item) => item.productId) })
  } catch (error) {
    const auth = authErrorResponse(error)
    if (auth) return auth
    console.error('GET /api/wishlist:', error)
    return NextResponse.json({ error: 'Error al obtener favoritos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json().catch(() => ({}))
    const productId = typeof body.productId === 'string' ? body.productId.trim() : ''

    if (!productId) {
      return NextResponse.json({ error: 'Se requiere un producto válido' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'El producto no existe' }, { status: 404 })
    }

    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      create: { userId: user.id, productId },
      update: {},
    })

    return NextResponse.json({ productId }, { status: 201 })
  } catch (error) {
    const auth = authErrorResponse(error)
    if (auth) return auth
    console.error('POST /api/wishlist:', error)
    return NextResponse.json({ error: 'Error al guardar el favorito' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { reviewRepository } from '@backend/repositories/reviewRepository'
import { parseReviewInput } from '@backend/validation/reviews'
import { ValidationError } from '@backend/validation/errors'
import { authErrorResponse, requireAuth } from '@backend/services/authSession'

export async function GET() {
  try {
    const reviews = await reviewRepository.findAll()
    return NextResponse.json(reviews)
  } catch (error) {
    console.error('GET /api/reviews:', error)
    return NextResponse.json({ error: 'Error al obtener reseñas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json().catch(() => ({}))
    const input = parseReviewInput(body ?? {})

    const review = await reviewRepository.create(input, user.id)

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }
    const auth = authErrorResponse(error)
    if (auth) return auth
    console.error('POST /api/reviews:', error)
    return NextResponse.json({ error: 'Error al guardar la reseña' }, { status: 500 })
  }
}

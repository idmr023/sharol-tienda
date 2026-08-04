import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from '@backend/validation/errors'
import { parseProfileInput } from '@backend/validation/auth'
import { userRepository } from '@backend/repositories/userRepository'
import { authErrorResponse, requireAuth } from '@backend/services/authSession'

export async function GET() {
  try {
    const currentUser = await requireAuth()
    const user = await userRepository.findPublicById(currentUser.id)
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? null,
        role: user.role,
      },
    })
  } catch (error) {
    return authErrorResponse(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await requireAuth()
    const body = await req.json()
    const input = parseProfileInput(body ?? {})

    const existing = await userRepository.findByEmail(input.email)
    if (existing && existing.id !== currentUser.id) {
      return NextResponse.json(
        { error: 'Ese correo ya está registrado por otra cuenta.' },
        { status: 409 }
      )
    }

    const user = await userRepository.updateProfile(currentUser.id, input)

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? null,
        role: user.role,
      },
    })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }
    return authErrorResponse(error)
  }
}

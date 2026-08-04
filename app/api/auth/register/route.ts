import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { ValidationError } from '@backend/validation/errors'
import { parseRegisterInput } from '@backend/validation/auth'
import { userRepository } from '@backend/repositories/userRepository'
import {
  createSession,
  hashPassword,
  signAccessToken,
  signRefreshToken,
} from '@backend/services/authService'
import { setAuthCookies } from '@backend/services/authSession'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const input = parseRegisterInput(body ?? {})

    const existing = await userRepository.findByEmail(input.email)
    if (existing) {
      return NextResponse.json(
        { error: 'Este correo ya está registrado. Inicia sesión.' },
        { status: 409 }
      )
    }

    const salt = randomBytes(32)
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash: hashPassword(input.password, salt),
      salt: salt.toString('hex'),
      role: 'CUSTOMER',
    })

    const accessToken = signAccessToken({ sub: user.id, email: user.email, role: 'CUSTOMER' })
    const refreshToken = signRefreshToken({ sub: user.id, email: user.email, role: 'CUSTOMER' })
    await createSession(user.id, refreshToken)
    await setAuthCookies(accessToken, refreshToken)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }
    console.error('POST /api/auth/register:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

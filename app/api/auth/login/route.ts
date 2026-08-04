import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from '@backend/validation/errors'
import { parseLoginInput } from '@backend/validation/auth'
import { userRepository } from '@backend/repositories/userRepository'
import {
  clearLoginAttempts,
  createSession,
  isLoginLocked,
  recordLoginAttempt,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
} from '@backend/services/authService'
import { setAuthCookies } from '@backend/services/authSession'
import { prisma } from '@backend/db'

async function assignPendingOrdersToUser(userId: string, email: string): Promise<void> {
  const pendingOrders = await prisma.order.findMany({
    where: { userId: null, customerEmail: email, status: 'SOLICITADO' },
  })

  for (const order of pendingOrders) {
    await prisma.order.update({
      where: { id: order.id },
      data: { userId },
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const input = parseLoginInput(body ?? {})
    const ip = getClientIp(req)

    const lock = await isLoginLocked(input.email, ip)
    if (lock.locked) {
      await recordLoginAttempt(input.email, ip, false)
      return NextResponse.json(
        {
          error: `Demasiados intentos fallidos. Espera ${lock.retryAfterSeconds} segundos.`,
        },
        { status: 429 }
      )
    }

    const user = await userRepository.findByEmail(input.email)
    if (!user || !user.active) {
      await recordLoginAttempt(input.email, ip, false)
      return NextResponse.json(
        { error: 'Correo o contraseña incorrectos.' },
        { status: 401 }
      )
    }

    if (!verifyPassword(input.password, user.passwordHash, user.salt)) {
      await recordLoginAttempt(input.email, ip, false)
      return NextResponse.json(
        { error: 'Correo o contraseña incorrectos.' },
        { status: 401 }
      )
    }

    await clearLoginAttempts(input.email, ip)
    await recordLoginAttempt(input.email, ip, true)

    const role = user.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER'
    const accessToken = signAccessToken({ sub: user.id, email: user.email, role })
    const refreshToken = signRefreshToken({ sub: user.id, email: user.email, role })
    await createSession(user.id, refreshToken)
    await setAuthCookies(accessToken, refreshToken)

    // Asignar órdenes pendientes al usuario autenticado
    await assignPendingOrdersToUser(user.id, input.email)

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? null,
        role,
      },
    })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }
    console.error('POST /api/auth/login:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return '127.0.0.1'
}
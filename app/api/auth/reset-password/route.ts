import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from '@backend/validation/errors'
import { parseResetPasswordInput } from '@backend/validation/auth'
import { resetPasswordWithCode } from '@backend/services/authService'
import { clearAuthCookies } from '@backend/services/authSession'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const input = parseResetPasswordInput(body ?? {})

    const ok = await resetPasswordWithCode(input.email, input.code, input.password)
    if (!ok) {
      return NextResponse.json(
        { error: 'Código inválido o expirado. Solicita uno nuevo.' },
        { status: 400 }
      )
    }

    await clearAuthCookies()

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }
    console.error('POST /api/auth/reset-password:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from '@backend/validation/errors'
import { parseForgotPasswordInput } from '@backend/validation/auth'
import { createPasswordResetToken } from '@backend/services/authService'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = parseForgotPasswordInput(body ?? {})

    const demoCode = await createPasswordResetToken(email)

    // Sin integración de correos: si el usuario existe, el código se devuelve
    // al cliente (flujo demo). En producción se enviaría por email.
    return NextResponse.json({
      ok: true,
      demoCode,
    })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }
    console.error('POST /api/auth/forgot-password:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

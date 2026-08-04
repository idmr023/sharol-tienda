import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revokeSession } from '@backend/services/authService'
import { clearAuthCookies, REFRESH_COOKIE } from '@backend/services/authSession'

export async function POST() {
  try {
    const store = await cookies()
    const refreshToken = store.get(REFRESH_COOKIE)?.value
    if (refreshToken) {
      await revokeSession(refreshToken)
    }
    await clearAuthCookies()
    return NextResponse.json({ message: 'Sesión cerrada.' })
  } catch (error) {
    console.error('POST /api/auth/logout:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

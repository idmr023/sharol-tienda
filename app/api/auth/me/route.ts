import { NextResponse } from 'next/server'
import { getCurrentUser } from '@backend/services/authSession'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No has iniciado sesión' }, { status: 401 })
    }
    return NextResponse.json({ user })
  } catch (error) {
    console.error('GET /api/auth/me:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

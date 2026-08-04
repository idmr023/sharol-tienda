import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  hashToken,
  REFRESH_DAYS,
  revokeSession,
  rotateRefreshToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '@backend/services/authService'
import { userRepository } from '@backend/repositories/userRepository'
import type { Role } from '@backend/validation/auth'

export const ACCESS_COOKIE = 'sharol_access_token'
export const REFRESH_COOKIE = 'sharol_refresh_token'

const isProd = process.env.NODE_ENV === 'production'

export interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string | null
  role: Role
}

export class AuthError extends Error {
  constructor(
    public readonly status: 401 | 403,
    message: string
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

const baseCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict' as const,
  path: '/',
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const store = await cookies()
  store.set(ACCESS_COOKIE, accessToken, {
    ...baseCookieOptions,
    maxAge: 15 * 60,
  })
  store.set(REFRESH_COOKIE, refreshToken, {
    ...baseCookieOptions,
    maxAge: REFRESH_DAYS * 86400,
  })
}

export async function clearAuthCookies() {
  const store = await cookies()
  store.delete(ACCESS_COOKIE)
  store.delete(REFRESH_COOKIE)
}

function toPublicUser(raw: {
  id: string
  name: string
  email: string
  phone?: string | null
  role: string
}): AuthUser | null {
  if (raw.role !== 'ADMIN' && raw.role !== 'CUSTOMER') return null
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone ?? null,
    role: raw.role,
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const store = await cookies()
  const accessToken = store.get(ACCESS_COOKIE)?.value
  const refreshToken = store.get(REFRESH_COOKIE)?.value

  const accessPayload = accessToken ? verifyAccessToken(accessToken) : null
  if (accessPayload) {
    const user = await userRepository.findPublicById(accessPayload.sub)
    if (!user || !toPublicUser(user)) return null
    return toPublicUser(user)
  }

  if (!refreshToken) return null
  const refreshPayload = verifyRefreshToken(refreshToken)
  if (!refreshPayload) {
    await clearAuthCookies()
    return null
  }

  const session = await userRepository.findSessionByTokenHash(hashToken(refreshToken))
  if (!session || session.revoked || session.expiresAt.getTime() < Date.now()) {
    await revokeSession(refreshToken)
    await clearAuthCookies()
    return null
  }

  const rawUser = session.user
  if (!rawUser || !rawUser.active || !toPublicUser(rawUser)) {
    await clearAuthCookies()
    return null
  }

  const newAccess = signAccessToken({ sub: rawUser.id, email: rawUser.email, role: toPublicUser(rawUser)!.role })
  const newRefresh = signRefreshToken({ sub: rawUser.id, email: rawUser.email, role: toPublicUser(rawUser)!.role })
  await rotateRefreshToken(refreshToken, rawUser.id, newRefresh)
  await setAuthCookies(newAccess, newRefresh)

  return toPublicUser(rawUser)
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) throw new AuthError(401, 'No has iniciado sesión')
  return user
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') throw new AuthError(403, 'Se requieren permisos de administrador')
  return user
}

export function authErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  throw error
}

import { scryptSync, randomBytes, randomInt, timingSafeEqual, createHash } from 'crypto'
import jwt from 'jsonwebtoken'
import { userRepository } from '@backend/repositories/userRepository'
import type { Role } from '@backend/validation/auth'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'sharol-tienda-access-key-2026'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'sharol-tienda-refresh-key-2026'
const ACCESS_EXPIRES = '15m'
const REFRESH_DAYS = 7

// ─── Password ─────────────────────────────────────────
export function hashPassword(password: string, salt: Buffer): string {
  return scryptSync(password, salt, 64).toString('hex')
}

export function verifyPassword(password: string, storedHash: string, saltHex: string): boolean {
  const salt = Buffer.from(saltHex, 'hex')
  const hash = scryptSync(password, salt, 64)
  return timingSafeEqual(hash, Buffer.from(storedHash, 'hex'))
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function createSalt(): string {
  return randomBytes(32).toString('hex')
}

// ─── JWT ──────────────────────────────────────────────
export interface TokenPayload {
  sub: string
  email: string
  role: Role
  type?: 'access' | 'refresh'
}

export function signAccessToken(payload: Omit<TokenPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'access' }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  })
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as TokenPayload
    return decoded.type === 'access' ? decoded : null
  } catch {
    return null
  }
}

export function signRefreshToken(payload: Omit<TokenPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'refresh' }, REFRESH_SECRET, {
    expiresIn: `${REFRESH_DAYS}d`,
  })
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as TokenPayload
    return decoded.type === 'refresh' ? decoded : null
  } catch {
    return null
  }
}

// ─── Session management ───────────────────────────────
export async function createSession(userId: string, refreshToken: string) {
  return userRepository.createSession(userId, hashToken(refreshToken))
}

export async function revokeSession(refreshToken: string) {
  await userRepository.revokeSession(hashToken(refreshToken))
}

export async function revokeAllUserSessions(userId: string) {
  await userRepository.revokeAllUserSessions(userId)
}

export async function rotateRefreshToken(oldRefreshToken: string, userId: string, newRefreshToken: string) {
  return userRepository.rotateSession(hashToken(oldRefreshToken), userId, hashToken(newRefreshToken))
}

// ─── Rate limiting ────────────────────────────────────
export async function recordLoginAttempt(email: string, ip: string, success: boolean) {
  await userRepository.recordLoginAttempt(email, ip, success)
}

export async function isLoginLocked(email: string, ip: string) {
  return userRepository.isLoginLocked(email, ip)
}

export async function clearLoginAttempts(email: string, ip: string) {
  await userRepository.clearLoginAttempts(email, ip)
}

// ─── Password recovery ────────────────────────────────
const RESET_TTL_MINUTES = 30

export function generateResetCode(): string {
  return String(randomInt(100000, 999999))
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await userRepository.findByEmail(email)
  if (!user) return null

  const code = generateResetCode()
  const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60_000)
  await userRepository.createResetToken(user.id, hashToken(code), expiresAt)
  return code
}

export async function resetPasswordWithCode(
  email: string,
  code: string,
  newPassword: string
): Promise<boolean> {
  const user = await userRepository.findByEmail(email)
  if (!user) return false

  const token = await userRepository.findValidResetToken(user.id, hashToken(code))
  if (!token) return false

  await userRepository.markResetTokenUsed(token.id)

  const salt = randomBytes(32)
  await userRepository.updatePassword(user.id, hashPassword(newPassword, salt), salt.toString('hex'))
  await userRepository.revokeAllUserSessions(user.id)

  return true
}

export { REFRESH_DAYS }

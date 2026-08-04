import { prisma } from '@backend/db'
import type { Role } from '@backend/validation/auth'

export interface StoredUser {
  id: string
  name: string
  email: string
  phone?: string | null
  passwordHash: string
  salt: string
  role: string
  active: boolean
}

const SESSION_DAYS = 7

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        passwordHash: true,
        salt: true,
        role: true,
        active: true,
      },
    })
  },

  findPublicById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    })
  },

  create(data: {
    name: string
    email: string
    phone?: string | null
    passwordHash: string
    salt: string
    role: Role
  }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone ?? null,
        passwordHash: data.passwordHash,
        salt: data.salt,
        role: data.role,
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    })
  },

  updateProfile(
    userId: string,
    data: { name: string; email: string; phone?: string | null }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    })
  },

  updatePassword(userId: string, passwordHash: string, salt: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash, salt },
      select: { id: true },
    })
  },

  createResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
      select: { id: true },
    })
  },

  findValidResetToken(userId: string, tokenHash: string) {
    return prisma.passwordResetToken.findFirst({
      where: { userId, tokenHash, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })
  },

  markResetTokenUsed(id: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { used: true },
    })
  },

  createSession(userId: string, tokenHash: string) {
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000)
    return prisma.session.create({
      data: { userId, tokenHash, expiresAt },
      select: { id: true },
    })
  },

  findSessionByTokenHash(tokenHash: string) {
    return prisma.session.findUnique({
      where: { tokenHash },
      select: {
        revoked: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            active: true,
          },
        },
      },
    })
  },

  revokeSession(tokenHash: string) {
    return prisma.session.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    })
  },

  revokeAllUserSessions(userId: string) {
    return prisma.session.updateMany({
      where: { userId },
      data: { revoked: true },
    })
  },

  async rotateSession(oldTokenHash: string, userId: string, newTokenHash: string) {
    await prisma.session.updateMany({
      where: { tokenHash: oldTokenHash },
      data: { revoked: true },
    })
    return this.createSession(userId, newTokenHash)
  },

  async recordLoginAttempt(email: string, ip: string, success: boolean) {
    return prisma.loginAttempt.create({
      data: { email: email.toLowerCase(), ip, success },
    })
  },

  async isLoginLocked(email: string, ip: string): Promise<{ locked: boolean; retryAfterSeconds: number }> {
    const windowMs = 15 * 60 * 1000
    const cutoff = new Date(Date.now() - windowMs)
    const emailKey = email.toLowerCase()

    const [recent, oldest] = await Promise.all([
      prisma.loginAttempt.count({
        where: { email: emailKey, ip, success: false, createdAt: { gt: cutoff } },
      }),
      prisma.loginAttempt.findFirst({
        where: { email: emailKey, ip, success: false, createdAt: { gt: cutoff } },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
    ])

    const MAX_ATTEMPTS = 5
    if (recent >= MAX_ATTEMPTS) {
      const expiresAt = oldest
        ? new Date(oldest.createdAt.getTime() + windowMs)
        : new Date()
      const retryAfter = Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 1000))
      return { locked: true, retryAfterSeconds: retryAfter }
    }

    return { locked: false, retryAfterSeconds: 0 }
  },

  async clearLoginAttempts(email: string, ip: string) {
    await prisma.loginAttempt.deleteMany({
      where: { email: email.toLowerCase(), ip, success: false },
    })
  },
}

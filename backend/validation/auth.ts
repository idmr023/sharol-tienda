import { ValidationError } from './errors'

export const ROLES = ['ADMIN', 'CUSTOMER'] as const
export type Role = (typeof ROLES)[number]

export interface RegisterInput {
  name?: unknown
  email?: unknown
  password?: unknown
  phone?: unknown
}

export interface ValidRegisterInput {
  name: string
  email: string
  password: string
  phone: string
}

export interface LoginInput {
  email?: unknown
  password?: unknown
}

export interface ValidLoginInput {
  email: string
  password: string
}

export interface ProfileInput {
  name?: unknown
  email?: unknown
  phone?: unknown
}

export interface ValidProfileInput {
  name: string
  email: string
  phone?: string
}

export interface ForgotPasswordInput {
  email?: unknown
}

export interface ResetPasswordInput {
  email?: unknown
  code?: unknown
  password?: unknown
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[0-9]{7,12}$/

export function parsePhone(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const phone = String(value).trim()
  if (!PHONE_PATTERN.test(phone)) {
    throw new ValidationError('El teléfono debe contener entre 7 y 12 dígitos')
  }
  return phone
}

export function parseRegisterInput(input: RegisterInput): ValidRegisterInput {
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
  const password = typeof input.password === 'string' ? input.password : ''
  const phone = parsePhone(input.phone)

  if (!name || name.length > 80) {
    throw new ValidationError('El nombre es obligatorio (máx. 80 caracteres)')
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 120) {
    throw new ValidationError('El correo electrónico no es válido')
  }
  if (!phone) {
    throw new ValidationError('El número de teléfono es obligatorio')
  }
  if (password.length < 8 || password.length > 72) {
    throw new ValidationError('La contraseña debe tener entre 8 y 72 caracteres')
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    throw new ValidationError('La contraseña debe incluir mayúsculas, minúsculas y números')
  }

  return { name, email, password, phone }
}

export function parseLoginInput(input: LoginInput): ValidLoginInput {
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
  const password = typeof input.password === 'string' ? input.password : ''

  if (!EMAIL_PATTERN.test(email)) {
    throw new ValidationError('El correo electrónico no es válido')
  }
  if (!password || password.length > 72) {
    throw new ValidationError('La contraseña es obligatoria')
  }

  return { email, password }
}

export function parseProfileInput(input: ProfileInput): ValidProfileInput {
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''

  if (!name || name.length > 80) {
    throw new ValidationError('El nombre es obligatorio (máx. 80 caracteres)')
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 120) {
    throw new ValidationError('El correo electrónico no es válido')
  }

  return { name, email, phone: parsePhone(input.phone) }
}

export function parseForgotPasswordInput(input: ForgotPasswordInput): { email: string } {
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
  if (!EMAIL_PATTERN.test(email)) {
    throw new ValidationError('El correo electrónico no es válido')
  }
  return { email }
}

export function parseResetPasswordInput(input: ResetPasswordInput): {
  email: string
  code: string
  password: string
} {
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
  const code = typeof input.code === 'string' ? input.code.trim() : ''
  const password = typeof input.password === 'string' ? input.password : ''

  if (!EMAIL_PATTERN.test(email)) {
    throw new ValidationError('El correo electrónico no es válido')
  }
  if (!/^[0-9]{6}$/.test(code)) {
    throw new ValidationError('El código debe tener 6 dígitos')
  }
  if (password.length < 8 || password.length > 72) {
    throw new ValidationError('La contraseña debe tener entre 8 y 72 caracteres')
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    throw new ValidationError('La contraseña debe incluir mayúsculas, minúsculas y números')
  }

  return { email, code, password }
}

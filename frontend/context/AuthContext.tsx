'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type AuthRole = 'ADMIN' | 'CUSTOMER'

export interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string | null
  role: AuthRole
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (name: string, email: string, phone: string, password: string) => Promise<{ error?: string }>
  updateProfile: (data: { name: string; email: string; phone?: string }) => Promise<{ error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/auth/me', { signal: controller.signal })
      .then(async (res) => {
        if (res.status === 401) return null
        if (!res.ok) throw new Error('No se pudo validar la sesión')
        const data = await res.json()
        return data.user ?? null
      })
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  const login = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) return { error: data.error || 'No se pudo iniciar sesión' }
        setUser(data.user)
        return {}
      } catch {
        return { error: 'Error de conexión. Inténtalo de nuevo.' }
      }
    },
    []
  )

  const register = useCallback(
    async (name: string, email: string, phone: string, password: string): Promise<{ error?: string }> => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password }),
        })
        const data = await res.json()
        if (!res.ok) return { error: data.error || 'No se pudo crear la cuenta' }
        setUser(data.user)
        return {}
      } catch {
        return { error: 'Error de conexión. Inténtalo de nuevo.' }
      }
    },
    []
  )

  const updateProfile = useCallback(
    async (data: { name: string; email: string; phone?: string }): Promise<{ error?: string }> => {
      try {
        const res = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const result = await res.json()
        if (!res.ok) return { error: result.error || 'No se pudo actualizar el perfil' }
        setUser((prev) => (prev ? { ...prev, ...result.user } : prev))
        return {}
      } catch {
        return { error: 'Error de conexión. Inténtalo de nuevo.' }
      }
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        loading,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}

'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { API_URL } from '@/lib/api'
import { clearSession, getSession, getToken, saveSession, type User } from '@/lib/auth'

export const BALANCE_UPDATED_EVENT = 'bit90:balance-updated'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (patch: Partial<User>) => void
  refreshBalance: () => Promise<number | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const session = getSession()
      if (session) {
        setUser(session.user)
        setToken(session.token)
      }
    } catch {
      clearSession()
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback((newToken: string, newUser: User) => {
    saveSession(newToken, newUser)
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      const activeToken = getToken()
      if (activeToken) saveSession(activeToken, next)
      return next
    })
  }, [])

  const refreshBalance = useCallback(async () => {
    const activeToken = token || getToken()
    if (!activeToken) return null

    try {
      const res = await fetch(`${API_URL}users/me`, {
        headers: { Authorization: `Bearer ${activeToken}` },
        cache: 'no-store',
      })
      if (!res.ok) return null

      const data = await res.json()
      const nextBalance = Number(data.balance)
      if (!Number.isFinite(nextBalance)) return null

      updateUser({
        phone: data.phone ?? undefined,
        balance: nextBalance,
      })
      return nextBalance
    } catch {
      return null
    }
  }, [token, updateUser])

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, updateUser, refreshBalance }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

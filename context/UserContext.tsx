'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface UserState {
  userId: number
  username: string
  email: string
  isAdmin: boolean
}

interface UserContextValue {
  user: UserState | null
  setUser: (user: UserState | null) => void
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({
  children,
  initialUser = null,
}: {
  children: ReactNode
  initialUser?: UserState | null
}) {
  const [user, setUser] = useState<UserState | null>(initialUser)

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/login'
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser debe usarse dentro de <UserProvider>')
  return ctx
}
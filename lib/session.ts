import { getIronSession, IronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId: number
  username: string
  email: string
  isAdmin: boolean
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'hack2dawn_session',
  cookieOptions: {
    httpOnly: true,                                      // JS del browser NO puede leerla → anti-XSS
    secure: process.env.NODE_ENV === 'production',      // Solo HTTPS en producción
    sameSite: 'lax' as const,                           // Anti-CSRF
    maxAge: 60 * 60 * 24,                               // 24 horas en segundos
  },
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function getSessionUser(): Promise<SessionData | null> {
  const session = await getSession()
  if (!session.userId) return null
  return {
    userId: session.userId,
    username: session.username,
    email: session.email,
    isAdmin: session.isAdmin,
  }
}
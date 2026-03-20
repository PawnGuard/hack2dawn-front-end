import { getIronSession, IronSession, unsealData } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId: number
  username: string
  email: string
  isAdmin: boolean
  teamId: number | null
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

// Para Route Handlers y Server Components (pueden leer Y escribir)
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

// Para verificar si hay sesión activa (solo lectura)
export async function getSessionUser(): Promise<SessionData | null> {
  const session = await getSession()
  if (!session.userId) return null
  return {
    userId: session.userId,
    username: session.username,
    email: session.email,
    isAdmin: session.isAdmin,
    teamId: session.teamId,
  }
}

// Para el Middleware (solo descifra, no escribe)
export const COOKIE_NAME = 'hack2dawn_session'  // ← Exporta el nombre para el Middleware
export const SESSION_PASSWORD = process.env.SESSION_SECRET as string
export { unsealData }  // ← Re-exporta unsealData para usar en middleware
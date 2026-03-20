// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { unsealData } from 'iron-session'
import { SessionData, COOKIE_NAME, SESSION_PASSWORD } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Leer y descifrar la sesión (solo lectura, sin escribir) ──
  let session: Partial<SessionData> = {}

  const cookieValue = request.cookies.get(COOKIE_NAME)?.value

  if (cookieValue) {
    try {
      // unsealData solo descifra → no necesita acceso de escritura
      session = await unsealData<SessionData>(cookieValue, {
        password: SESSION_PASSWORD,
      })
    } catch {
      // Cookie inválida, corrupta o con secreto diferente → tratar como sin sesión
      session = {}
    }
  }

  const isLoggedIn = Boolean(session.userId)
  const hasTeam    = session.teamId !== null && session.teamId !== undefined
  const isAdmin    = session.isAdmin === true

  // ── Grupos de rutas ──────────────────────────────────────────
  const isAuthRoute = ['/login', '/register'].some(r => pathname.startsWith(r))

  const isProtectedRoute = ['/home', '/challenges', '/scoreboard', '/dashboard'].some(
    r => pathname.startsWith(r)
  )

  const requiresTeam = ['/home', '/challenges'].some(r => pathname.startsWith(r))

  const isAdminRoute    = pathname.startsWith('/admin')
  const isTeamSelect    = pathname.startsWith('/dashboard/team/select')
  const isTeamDashboard = pathname.startsWith('/dashboard/team') && !isTeamSelect

  // ── Reglas en orden de prioridad ─────────────────────────────

  // REGLA 1: Auth routes → si ya estás logueado, redirigir fuera
  if (isAuthRoute && isLoggedIn) {
    if (!hasTeam && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard/team/select', request.url))
    }
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // REGLA 2: Rutas protegidas → requieren sesión
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // REGLA 3: Rutas que requieren equipo
  if (requiresTeam && isLoggedIn && !hasTeam && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard/team/select', request.url))
  }

  // REGLA 4: Team dashboard → sin equipo va a team-select
  if (isTeamDashboard && isLoggedIn && !hasTeam) {
    return NextResponse.redirect(new URL('/dashboard/team/select', request.url))
  }

  // REGLA 5: Team-select → si ya tiene equipo, redirigir al dashboard de equipo
  if (isTeamSelect && isLoggedIn && hasTeam) {
    return NextResponse.redirect(new URL('/dashboard/team', request.url))
  }

  // REGLA 6: Admin sin permisos → /home
  if (isAdminRoute && isLoggedIn && !isAdmin) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // REGLA 7: Admin sin sesión → login
  if (isAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/home/:path*',
    '/challenges/:path*',
    '/scoreboard/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
}
// middleware.ts (raíz del proyecto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('session')?.value;
  const userRole = request.cookies.get('role')?.value;
  const hasTeam  = request.cookies.get('hasTeam')?.value;

  // Rutas que requieren estar logueado
  const protectedRoutes = [/* '/home', */ /*'/dashboard',*/ '/scoreboard'];
  // Rutas solo para Admin
  const adminRoutes = ['/admin'];

  const isProtected = protectedRoutes.some(r => pathname.startsWith(r));
  const isAdmin     = adminRoutes.some(r => pathname.startsWith(r));
  const isTeamDashboard = pathname.startsWith('/dashboard/team') && !pathname.startsWith('/dashboard/team/select');

  // 1. Sin sesión → /login
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Sin equipo en Team Dashboard -> /dashboard/team/select
  if (isTeamDashboard && session && !hasTeam) {
    return NextResponse.redirect(new URL('/dashboard/team/select', request.url));
  }

  // 3. No es Admin → /home
  if (isAdmin && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Solo aplica el middleware a estas rutas (ignora _next, api, assets)
  matcher: ['/home/:path*', '/dashboard/:path*', '/admin/:path*'],
};

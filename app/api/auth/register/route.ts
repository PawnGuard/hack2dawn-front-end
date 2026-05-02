// ── api/auth/register/route.ts ──
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ctfdCreateUser, ctfdVerifyCredentials } from '@/lib/ctfd' // ← Importamos ctfdVerifyCredentials

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // NOTA: Si en tu app pides más datos (como perfil, isTecCampus), 
    // asegúrate de extraerlos aquí para pasarlos a ctfdCreateUser.
    const { name, email, password } = body

    // ── Validación básica en el servidor ──
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 },
      )
    }

    // ── 1. Crear usuario en CTFd via admin token ───────────────────
    // (Pasa el body completo si ctfdCreateUser espera más parámetros en tu versión final)
    const result = await ctfdCreateUser(body)

    if (!result.success || !result.data) {
      const ctfdErrors = result.errors ?? {}

      if (ctfdErrors.name)
        return NextResponse.json({ error: 'Ese username ya está en uso', field: 'name' }, { status: 409 })
      if (ctfdErrors.email)
        return NextResponse.json({ error: 'Ese email ya está registrado', field: 'email' }, { status: 409 })

      return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 502 })
    }

    const newUser = result.data

    // ── 2. ¡NUEVO! Auto-login para generar Cookie y CSRF ──────────
    // Ahora que existe, iniciamos sesión como si fuera el navegador
    const verifyResult = await ctfdVerifyCredentials(name, password)

    if (!verifyResult) {
      // Caso muy raro: se creó en DB pero el login falló.
      // Le pedimos al usuario que inicie sesión manualmente.
      return NextResponse.json(
        { error: 'Cuenta creada, pero falló el auto-login. Por favor inicia sesión manualmente.' },
        { status: 502 }
      )
    }

    const { sessionCookie, csrfToken } = verifyResult

    // ── 3. Crear sesión con iron-session ───────────────────────────
    const session = await getSession()
    session.userId = newUser.id
    session.username = newUser.name
    session.email = newUser.email
    session.isAdmin = newUser.type === 'admin'
    session.teamId   = null // Nuevo usuario no tiene equipo aún
    
    // Guardamos las credenciales de CTFd para que pueda enviar flags y crear equipos
    session.ctfdSessionCookie = sessionCookie
    session.ctfdCsrfToken = csrfToken

    await session.save() // ← Firma, encripta y setea la cookie httpOnly

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: session.isAdmin,
      },
    })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
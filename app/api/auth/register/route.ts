import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ctfdCreateUser } from '@/lib/ctfd'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = body as {
      name: string
      email: string
      password: string
    }

    // ── Validación básica en el servidor (nunca confíes solo en el cliente) ──
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 },
      )
    }
    if (name.length < 3 || name.length > 20 || /\s/.test(name)) {
      return NextResponse.json(
        { error: 'Username: 3-20 caracteres, sin espacios' },
        { status: 400 },
      )
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 },
      )
    }

    // ── Crear usuario en CTFd via admin token ───────────────────
    const result = await ctfdCreateUser({ name, email, password })

    if (!result.success || !result.data) {
      const ctfdErrors = result.errors ?? {}

      if (ctfdErrors.name)
        return NextResponse.json({ error: 'Ese username ya está en uso', field: 'name' }, { status: 409 })
      if (ctfdErrors.email)
        return NextResponse.json({ error: 'Ese email ya está registrado', field: 'email' }, { status: 409 })

      return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 502 })
    }

    const newUser = result.data

    // ── Crear sesión con iron-session ───────────────────────────
    const session = await getSession()
    session.userId = newUser.id
    session.username = newUser.name
    session.email = newUser.email
    session.isAdmin = newUser.type === 'admin'
    session.teamId   = null // Nuevo usuario no tiene equipo aún
    await session.save() // ← Firma, encripta y setea la cookie httpOnly

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
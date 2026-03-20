import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ctfdGetUserTeam, ctfdVerifyCredentials } from '@/lib/ctfd'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { identifier, password } = body as {
      identifier: string   // username o email
      password: string
    }

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Credenciales requeridas' },
        { status: 400 },
      )
    }

    // ── Verificar credenciales contra CTFd via Basic Auth ───────
    // CTFd usa el campo `name` (username) para Basic Auth
    const user = await ctfdVerifyCredentials(identifier, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 },
      )
    }

    if (user.banned) {
      return NextResponse.json(
        { error: 'Esta cuenta ha sido suspendida' },
        { status: 403 },
      )
    }

    const teamId = await ctfdGetUserTeam(user.id)

    // ── Crear sesión ────────────────────────────────────────────
    const session = await getSession()
    session.userId = user.id
    session.username = user.name
    session.email = user.email
    session.isAdmin = user.type === 'admin'
    session.teamId   = teamId
    await session.save()

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.type === 'admin',
      },
    })
  } catch (err) {
    console.error('[login]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

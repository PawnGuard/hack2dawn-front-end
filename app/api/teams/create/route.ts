// app/api/teams/create/route.ts
import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { ctfdCreateTeam, ctfdAddTeamMember, ctfdSetTeamCaptain } from '@/lib/ctfd'

export async function POST(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  if (session.teamId) {
    return NextResponse.json({ error: 'Ya perteneces a un equipo' }, { status: 400 })
  }

  const { name, password } = await req.json()

  // Validación de nombre
  if (!name || name.trim().length < 2) {
    return NextResponse.json(
      { field: 'name', error: 'El nombre debe tener al menos 2 caracteres' },
      { status: 400 }
    )
  }
  if (name.trim().length > 32) {
    return NextResponse.json(
      { field: 'name', error: 'Máximo 32 caracteres' },
      { status: 400 }
    )
  }

  // Validación del token — mínimo 6 chars alfanuméricos
  // No generamos aquí, solo verificamos que llegó bien formado
  if (!password || !/^[a-zA-Z0-9]{6,}$/.test(password)) {
    return NextResponse.json(
      { error: 'Token de equipo inválido' },
      { status: 400 }
    )
  }

  // ── Paso 1: Crear equipo ──────────────────────────────────────
  const createRes = await ctfdCreateTeam({ name: name.trim(), password })

  if (!createRes.success || !createRes.data) {
    if (createRes.errors?.name) {
      return NextResponse.json(
        { field: 'name', error: 'Ese nombre de equipo ya está en uso' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Error al crear el equipo' }, { status: 500 })
  }

  const teamId = createRes.data.id

  // ── Paso 2: Agregar usuario como miembro ──────────────────────
  const memberOk = await ctfdAddTeamMember(teamId, session.userId)
  if (!memberOk) {
    return NextResponse.json({ error: 'Error al unirte al equipo' }, { status: 500 })
  }

  // ── Paso 3: Asignar como capitán ──────────────────────────────
  await ctfdSetTeamCaptain(teamId, session.userId)

  // ── Paso 4: Actualizar sesión ─────────────────────────────────
  session.teamId = teamId
  await session.save()

  // No necesitas devolver teamCode — el cliente ya lo tiene
  return NextResponse.json({ teamId, teamName: name.trim() }, { status: 201 })
}

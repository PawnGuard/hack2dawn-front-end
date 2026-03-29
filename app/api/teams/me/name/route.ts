import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { ctfdGetTeam, ctfdRenameTeam } from '@/lib/ctfd'

export async function PATCH(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!session.teamId) return NextResponse.json({ error: 'No perteneces a un equipo' }, { status: 404 })

  const team = await ctfdGetTeam(session.teamId)
  if (!team) return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 })

  // Solo el capitán puede renombrar
  if (team.captain_id !== session.userId) {
    return NextResponse.json({ error: 'Solo el capitán puede cambiar el nombre' }, { status: 403 })
  }

  const { name } = await req.json()

  if (!name?.trim() || name.trim().length < 2) {
    return NextResponse.json({ field: 'name', error: 'Mínimo 2 caracteres' }, { status: 400 })
  }
  if (name.trim().length > 32) {
    return NextResponse.json({ field: 'name', error: 'Máximo 32 caracteres' }, { status: 400 })
  }

  const result = await ctfdRenameTeam(session.teamId, name.trim())

  if (!result.success) {
    if (result.errors?.name) {
      return NextResponse.json({ field: 'name', error: 'Ese nombre ya está en uso' }, { status: 400 })
    }
    return NextResponse.json({ error: 'No se pudo cambiar el nombre' }, { status: 500 })
  }

  return NextResponse.json({ teamName: result.data?.name }, { status: 200 })
}
import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { ctfdGetTeam, ctfdKickTeamMember } from '@/lib/ctfd'

export async function DELETE(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!session.teamId) return NextResponse.json({ error: 'No perteneces a un equipo' }, { status: 404 })

  const { userId } = await req.json()
  const targetId: number = userId ?? session.userId  // sin userId = leave propio

  const team = await ctfdGetTeam(session.teamId)
  if (!team) return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 })

  const isCaptain = team.captain_id === session.userId
  const isSelf = targetId === session.userId

  // Capitán no puede abandonar sin transferir antes
  if (isSelf && isCaptain) {
    return NextResponse.json(
      { error: 'Transfiere la capitanía antes de abandonar el equipo' },
      { status: 400 }
    )
  }

  // Solo el capitán puede expulsar a otros
  if (!isSelf && !isCaptain) {
    return NextResponse.json({ error: 'Solo el capitán puede expulsar miembros' }, { status: 403 })
  }

  const ok = await ctfdKickTeamMember(session.teamId, targetId)
  if (!ok) return NextResponse.json({ error: 'No se pudo completar la operación' }, { status: 500 })

  // Si el usuario se fue a sí mismo, limpiar sesión
  if (isSelf) {
    session.teamId = null
    await session.save()
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { ctfdGetTeam, ctfdSetTeamCaptain } from '@/lib/ctfd'

export async function PATCH(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!session.teamId) return NextResponse.json({ error: 'No perteneces a un equipo' }, { status: 404 })

  const team = await ctfdGetTeam(session.teamId)
  if (!team) return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 })

  if (team.captain_id !== session.userId) {
    return NextResponse.json({ error: 'Solo el capitán puede transferir la capitanía' }, { status: 403 })
  }

  const { userId } = await req.json()

  if (!userId || userId === session.userId) {
    return NextResponse.json({ error: 'Usuario inválido para transferencia' }, { status: 400 })
  }

  const ok = await ctfdSetTeamCaptain(session.teamId, userId)
  if (!ok) return NextResponse.json({ error: 'No se pudo transferir la capitanía' }, { status: 500 })

  return NextResponse.json({ captainId: userId }, { status: 200 })
}
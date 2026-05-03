// app/api/teams/me/members/route.ts
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ctfdGetTeam, ctfdKickTeamMember, ctfdGetTeamMemberIds } from '@/lib/ctfd'

export async function DELETE(req: Request) {
  const session = await getSession()

  if (!session?.userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  if (!session.teamId) {
    return NextResponse.json({ error: 'No perteneces a un equipo' }, { status: 404 })
  }

  const { userId } = await req.json()
  const targetId: number = userId ?? session.userId

  // 1. Obtener datos del equipo con Admin Token
  const team = await ctfdGetTeam(session.teamId)
  if (!team) {
    return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 })
  }

  const isCaptain = team.captain_id === session.userId
  const isSelf = targetId === session.userId

  // Para saber si hay más miembros, obtenemos la lista de IDs (Admin Token)
  const memberIds = await ctfdGetTeamMemberIds(session.teamId) || []
  const memberCount = memberIds.length

  // Validación 1: El capitán no puede abandonar si hay más miembros sin transferir la capitanía antes
  if (isSelf && isCaptain && memberCount > 1) {
    return NextResponse.json(
      { error: 'Transfiere la capitanía a otro miembro antes de abandonar el equipo' },
      { status: 400 }
    )
  }

  // Validación 2: Solo el capitán puede expulsar a otros miembros
  if (!isSelf && !isCaptain) {
    return NextResponse.json({ error: 'Solo el capitán puede expulsar miembros' }, { status: 403 })
  }

  // 2. Ejecutar la expulsión/salida usando ADMIN TOKEN (salta reglas restrictivas de CTFd)
  const ok = await ctfdKickTeamMember(session.teamId, targetId)
  if (!ok) {
    return NextResponse.json({ error: 'No se pudo completar la operación en el equipo' }, { status: 500 })
  }

  // 3. Si el usuario se salió él mismo, borramos su `teamId` de la sesión local
  if (isSelf) {
    session.teamId = null
    await session.save()
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
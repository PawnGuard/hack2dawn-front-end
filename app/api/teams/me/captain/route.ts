// app/api/teams/me/captain/route.ts
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ctfdGetTeam, ctfdSetTeamCaptain } from '@/lib/ctfd'

export async function PATCH(req: Request) {
  const session = await getSession()

  // 1. Validaciones básicas de la sesión local
  if (!session?.userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  if (!session.teamId) {
    return NextResponse.json({ error: 'No perteneces a un equipo' }, { status: 404 })
  }

  const { userId } = await req.json()
  if (!userId || userId === session.userId) {
    return NextResponse.json({ error: 'Usuario inválido para transferencia' }, { status: 400 })
  }

  // 2. Verificamos que el usuario que ejecuta esto es el capitán actual
  // Usamos ctfdGetTeam (Admin) para garantizar que leemos la DB más fresca
  const team = await ctfdGetTeam(session.teamId)
  if (!team) {
    return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 })
  }
  
  if (team.captain_id !== session.userId) {
    return NextResponse.json({ error: 'Solo el capitán puede transferir la capitanía' }, { status: 403 })
  }

  // 3. Ejecutamos el cambio usando el Admin Token
  // ctfdSetTeamCaptain ya inyecta el Admin Token internamente
  const ok = await ctfdSetTeamCaptain(session.teamId, userId)
  
  if (!ok) {
    return NextResponse.json({ error: 'No se pudo transferir la capitanía' }, { status: 500 })
  }

  return NextResponse.json({ captainId: userId }, { status: 200 })
}
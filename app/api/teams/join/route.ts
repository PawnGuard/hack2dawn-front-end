import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { ctfdFindTeamByName, ctfdAddTeamMember, getTeamInviteCode, ctfdGetTeamMemberIds } from '@/lib/ctfd'

const MAX_TEAM_SIZE = process.env.NEXT_PUBLIC_MAX_TEAM_SIZE;

export async function POST(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  if (session.teamId) {
    return NextResponse.json({ error: 'Ya perteneces a un equipo' }, { status: 400 })
  }

  const { name, token } = await req.json()

  if (!name?.trim()) {
    return NextResponse.json({ field: 'name', error: 'Ingresa el nombre del equipo' }, { status: 400 })
  }
  if (!token?.trim()) {
    return NextResponse.json({ field: 'token', error: 'Ingresa el token de invitación' }, { status: 400 })
  }

  // Buscar equipo por nombre exacto
  const team = await ctfdFindTeamByName(name.trim())
  if (!team) {
    return NextResponse.json({ field: 'name', error: 'Equipo no encontrado' }, { status: 404 })
  }

  // Verificar token contra el custom field invite_code
  const inviteCode = getTeamInviteCode(team)
  if (!inviteCode || inviteCode !== token.trim()) {
    return NextResponse.json({ field: 'token', error: 'Token de invitación incorrecto' }, { status: 401 })
  }

  if (MAX_TEAM_SIZE) {
    console.log('[join] Verificando tamaño del equipo...')
    const memberIds = await ctfdGetTeamMemberIds(team.id)
    if (memberIds.length >= parseInt(MAX_TEAM_SIZE, 10)) {
      return NextResponse.json(
        { field: 'name', error: `El equipo ya está lleno (máx. ${MAX_TEAM_SIZE} miembros)` },
        { status: 400 }
      )
    }
  }

  // Agregar miembro vía admin token
  const ok = await ctfdAddTeamMember(team.id, session.userId)
  if (!ok) {
    return NextResponse.json({ error: 'No se pudo unir al equipo' }, { status: 500 })
  }

  session.teamId = team.id
  await session.save()

  return NextResponse.json({ teamId: team.id, teamName: team.name }, { status: 200 })
}
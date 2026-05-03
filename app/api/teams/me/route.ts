// app/api/teams/me/route.ts
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { 
  ctfdGetTeam, 
  ctfdGetTeamMemberIds, 
  ctfdGetUser, 
  getTeamInviteCode, 
  ctfdGetTeamStats 
} from '@/lib/ctfd'
import { TeamDashboardData } from '@/lib/types/ctfd'

export async function GET() {
  const session = await getSession()

  if (!session?.userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  if (!session.teamId) {
    return NextResponse.json({ error: 'No perteneces a un equipo' }, { status: 404 })
  }

  // ── Paso 1: Datos del equipo usando ADMIN TOKEN (Para ver el Invite Code) ──
  const team = await ctfdGetTeam(session.teamId)
  if (!team) {
    return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 })
  }

  // ── Paso 2: Obtener Rank y Score oficial del Scoreboard ──
  const { score, rank } = await ctfdGetTeamStats(session.teamId)

  // ── Paso 3: IDs de miembros (Admin Token garantiza verlos todos) ──
  const memberIds = await ctfdGetTeamMemberIds(session.teamId) || []

  // ── Paso 4: Datos de cada miembro en paralelo ──
  const memberProfiles = await Promise.all(
    memberIds.map(id => ctfdGetUser(id))
  )

  const members = memberProfiles
    .filter((u): u is NonNullable<typeof u> => u !== null)
    .map(u => ({
      id: u.id,
      username: u.name,
      score: u.score ?? 0,
      isCaptain: u.id === team.captain_id,
      isMe: u.id === session.userId,
    }))
    .sort((a, b) => b.score - a.score)

  // ── Paso 5: Armar el payload ──
  const payload: TeamDashboardData = {
    teamId: team.id,
    teamName: team.name,
    teamScore: score,
    teamRank: rank,
    inviteCode: getTeamInviteCode(team), // Ahora sí vendrá en team.fields
    captainId: team.captain_id,
    isCaptain: team.captain_id === session.userId,
    members,
  }

  return NextResponse.json(payload, { status: 200 })
}
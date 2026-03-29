import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { ctfdGetTeam, ctfdGetTeamMemberIds, ctfdGetUser, getTeamInviteCode, ctfdGetTeamRank } from '@/lib/ctfd'
import { TeamDashboardData } from '@/lib/types/ctfd'

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  if (!session.teamId) {
    return NextResponse.json({ error: 'No perteneces a un equipo' }, { status: 404 })
  }

  // ── Paso 1: Datos del equipo (nombre, captain_id, fields) ──────
  const [team, rank] = await Promise.all([
    ctfdGetTeam(session.teamId),
    ctfdGetTeamRank(session.teamId),
  ])

  if (!team) {
    return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 })
  }

  // ── Paso 2: IDs de miembros ────────────────────────────────────
  const memberIds = await ctfdGetTeamMemberIds(session.teamId)

  // ── Paso 3: Datos de cada miembro en paralelo ──────────────────
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

  const payload: TeamDashboardData = {
    teamId: team.id,
    teamName: team.name,
    teamScore: team.score,
    teamRank: team.rank ?? null,
    inviteCode: getTeamInviteCode(team),
    captainId: team.captain_id,
    isCaptain: team.captain_id === session.userId,
    members,
  }

  return NextResponse.json(payload, { status: 200 })
}
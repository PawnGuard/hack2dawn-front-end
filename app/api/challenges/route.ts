import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  ctfdGetChallengeList,
  ctfdGetTeamSolvedIds,
  ctfdGetTeamStats,
} from '@/lib/ctfd'
import type { ChallengesResponse } from '@/types/challenges'
import eventLore from '@/data/event-lore.json'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const teamId = session.teamId ?? null

  const [challenges, teamSolvedIds, teamStats] = await Promise.all([
    // Lista de retos con solved_by_me del usuario (fuente: Personal Token)
    ctfdGetChallengeList(
      session.ctfdToken ? `Token ${session.ctfdToken}` : undefined
    ),
    // IDs de retos resueltos por el equipo (fuente: Admin Token)
    teamId
      ? ctfdGetTeamSolvedIds(teamId)
      : Promise.resolve(new Set<number>()),
    // Score y rank oficiales del equipo (fuente: scoreboard)
    teamId
      ? ctfdGetTeamStats(teamId)
      : Promise.resolve({ score: 0, rank: null }),
  ])

  // 3. Enriquecer cada reto con `solvedByTeam`
  const enriched = challenges.map(challenge => ({
    ...challenge,
    solvedByTeam: teamSolvedIds.has(challenge.id),
  }))

  // 4. Progreso del equipo — fuentes correctas
  const result: ChallengesResponse = {
    challenges: enriched,
    progress: {
      teamId:              String(teamId ?? 'team-unknown'),
      teamName:            session.username ?? 'Tu equipo',
      // completedChallenges: cuántos resolvió el EQUIPO, no el usuario
      completedChallenges: teamSolvedIds.size,
      totalChallenges:     challenges.length,
      // teamScore: score oficial de CTFd, no calculado localmente
      teamScore:           teamStats.score,
      // teamRank: rank oficial del scoreboard
      teamRank:            teamStats.rank,
      updatedAt:           new Date().toISOString(),
    },
    lore: eventLore,
  }

  return NextResponse.json(result)
}
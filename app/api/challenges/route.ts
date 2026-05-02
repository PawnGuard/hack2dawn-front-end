import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  ctfdGetTeamSolvedIds,
  ctfdGetTeamStats,
  ctfdGetChallengeListDual
} from '@/lib/ctfd'
import type { ChallengeSummary, ChallengesResponse } from '@/types/challenges'
import eventLore from '@/data/event-lore.json'

function countUnits(challenges: ChallengeSummary[]) {
  const machines = new Set<string>()
  let standalones = 0

  for (const ch of challenges) {
    if (ch.machineId && ch.continent) {
      machines.add(`${ch.continent}::${ch.machineId}`)
    } else {
      standalones += 1
    }
  }

  return machines.size + standalones
}

function countCompletedUnits(challenges: ChallengeSummary[]) {
  const machineSteps = new Map<string, { total: number; done: number }>()
  let standalonesDone = 0

  for (const ch of challenges) {
    const isDone = ch.status === 'COMPLETED' || ch.solvedByTeam

    if (ch.machineId && ch.continent) {
      const key = `${ch.continent}::${ch.machineId}`
      const entry = machineSteps.get(key) ?? { total: 0, done: 0 }
      entry.total += 1
      if (isDone) entry.done += 1
      machineSteps.set(key, entry)
    } else if (isDone) {
      standalonesDone += 1
    }
  }

  let machinesDone = 0
  for (const { total, done } of machineSteps.values()) {
    if (done === total) machinesDone += 1
  }

  return machinesDone + standalonesDone
}

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    console.warn('[api/challenges] no session userId')
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const teamId = session.teamId ?? null
  console.log('[api/challenges] session', {
    userId: session.userId,
    teamId,
    hasToken: Boolean(session.ctfdToken),
  })

  const [challenges, teamSolvedIds, teamStats] = await Promise.all([
    // Lista de retos con solved_by_me del usuario (fuente: Personal Token)
    ctfdGetChallengeListDual(
      session.ctfdToken ? `Token ${session.ctfdToken}` : undefined,
      session.teamId,
      session.userId
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

  console.log('[api/challenges] counts', {
    challenges: challenges.length,
    enriched: enriched.length,
    teamSolved: teamSolvedIds.size,
    totalChallenges: countUnits(enriched),
    completedChallenges: countCompletedUnits(enriched),
  })

  // 4. Progreso del equipo — fuentes correctas
  const result: ChallengesResponse = {
    challenges: enriched,
    progress: {
      teamId:              String(teamId ?? 'team-unknown'),
      teamName:            session.username ?? 'Tu equipo',
      // completedChallenges: cuántos resolvió el EQUIPO, no el usuario
      completedChallenges: countCompletedUnits(enriched),
      totalChallenges:     countUnits(enriched),
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
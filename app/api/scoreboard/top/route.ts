import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ctfdAdminGetScoreboardTop, ctfdAdminGetTeamSolvesCount } from '@/services/ctfd/scoreboard'
import { getEventWindow, getEventWindowKey, isEventOver } from '@/lib/event-window'
import type { ScoreboardResponse, TeamScore } from '@/types/scoreboard'

type ScoreboardState = {
  lastPositions: Map<string, number>
  windowKey: string
  frozenSnapshots: Map<number, ScoreboardResponse>
  frozenWindowKey: string
}

const state: ScoreboardState = {
  lastPositions: new Map(),
  windowKey: '',
  frozenSnapshots: new Map(),
  frozenWindowKey: '',
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let nextIndex = 0

  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (true) {
      const i = nextIndex
      nextIndex += 1
      if (i >= items.length) break
      results[i] = await mapper(items[i])
    }
  })

  await Promise.all(workers)
  return results
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { start } = getEventWindow()
    const windowKey = getEventWindowKey()

    if (state.windowKey && state.windowKey !== windowKey) {
      state.lastPositions = new Map()
    }
    state.windowKey = windowKey

    if (state.frozenWindowKey && state.frozenWindowKey !== windowKey) {
      state.frozenSnapshots = new Map()
      state.frozenWindowKey = ''
    }

    if (Date.now() < start.getTime()) {
      const payload: ScoreboardResponse = { teams: [], updatedAt: new Date().toISOString() }
      return NextResponse.json(payload, { status: 200 })
    }

    const countParam = req.nextUrl.searchParams.get('count')
    const count = countParam ? Number(countParam) : 10

    if (isEventOver()) {
      const cached = state.frozenSnapshots.get(count)
      if (cached) {
        return NextResponse.json(cached, { status: 200 })
      }
    }

    // ctfdAdminGetScoreboardTop usa next: { revalidate: 15 } internamente
    const rows = await ctfdAdminGetScoreboardTop(count)

    // ctfdAdminGetTeamSolvesCount usa next: { revalidate: 60 } internamente
    const flagResults = await mapWithConcurrency(rows, 3, async (r) => {
      const flagsCaptured = await ctfdAdminGetTeamSolvesCount(r.account_id)
      return { teamId: r.account_id, flagsCaptured }
    })

    const flagsByTeamId = new Map(flagResults.map((f) => [f.teamId, f.flagsCaptured]))

    const teams: TeamScore[] = rows.map((r) => {
      const teamId = String(r.account_id)
      const previousPosition = state.lastPositions.get(teamId) ?? -1

      return {
        teamId,
        teamName: r.name,
        score: r.score ?? 0,
        flagsCaptured: flagsByTeamId.get(r.account_id) ?? 0,
        position: r.pos,
        previousPosition,
      }
    })

    const eventOver = isEventOver()

    if (!eventOver) {
      state.lastPositions = new Map(teams.map((t) => [t.teamId, t.position]))
    }

    const payload: ScoreboardResponse = {
      teams,
      updatedAt: new Date().toISOString(),
      locked: eventOver,
    }

    if (eventOver) {
      state.frozenWindowKey = windowKey
      state.frozenSnapshots.set(count, payload)
    }

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    console.error('[API /scoreboard/top] Error:', error)
    return NextResponse.json({ error: 'Error al obtener el scoreboard' }, { status: 500 })
  }
}

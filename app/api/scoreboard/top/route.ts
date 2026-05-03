import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ctfdGetScoreboardTop, ctfdGetTeamSolvesCount } from '@/services/ctfd/scoreboard'
import { getEventWindow, getEventWindowKey, isEventOver } from '@/lib/event-window'
import type { ScoreboardResponse, TeamScore } from '@/types/scoreboard'

type ScoreboardState = {
  lastPositions: Map<string, number>
  lastPayload: ScoreboardResponse | null
  cacheUntilMs: number
  flagsCache: Map<number, { value: number; expiresAtMs: number }>
  windowKey: string
}

const state: ScoreboardState = {
  lastPositions: new Map(),
  lastPayload: null,
  cacheUntilMs: 0,
  flagsCache: new Map(),
  windowKey: '',
}

const SCOREBOARD_CACHE_MS = 2_000
const FLAGS_CACHE_MS = 60_000

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
    if (!session?.ctfdSessionCookie) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { start } = getEventWindow()
    const windowKey = getEventWindowKey()

    // Si cambiaron las fechas por env, reiniciar caches en caliente.
    if (state.windowKey && state.windowKey !== windowKey) {
      state.lastPositions = new Map()
      state.lastPayload = null
      state.cacheUntilMs = 0
      state.flagsCache = new Map()
    }
    state.windowKey = windowKey

    // Antes del inicio: no consultar CTFd.
    if (Date.now() < start.getTime()) {
      const payload: ScoreboardResponse = { teams: [], updatedAt: new Date().toISOString() }
      state.lastPayload = payload
      state.cacheUntilMs = Date.now() + SCOREBOARD_CACHE_MS
      return NextResponse.json(payload, { status: 200 })
    }

    const countParam = req.nextUrl.searchParams.get('count')
    const count = countParam ? Number(countParam) : 10

    const now = Date.now()
    if (state.lastPayload && now < state.cacheUntilMs) {
      return NextResponse.json(state.lastPayload, { status: 200 })
    }

    // Al terminar el evento, congelamos la última foto.
    if (isEventOver() && state.lastPayload) {
      return NextResponse.json(state.lastPayload, { status: 200 })
    }

    const rows = await ctfdGetScoreboardTop(session.ctfdSessionCookie, count)

    // Optimización: el score debe ser realtime; los "flags" pueden ir con cache de 1 min.
    const flagsByTeamId = new Map<number, number>()
    const needsRefresh: number[] = []
    const nowMs = Date.now()

    for (const r of rows) {
      const cached = state.flagsCache.get(r.account_id)
      if (cached && cached.expiresAtMs > nowMs) {
        flagsByTeamId.set(r.account_id, cached.value)
      } else {
        flagsByTeamId.set(r.account_id, cached?.value ?? 0)
        needsRefresh.push(r.account_id)
      }
    }

    if (needsRefresh.length) {
      const refreshed = await mapWithConcurrency(
        needsRefresh,
        3,
        async (teamId) => {
          const flagsCaptured = await ctfdGetTeamSolvesCount(session.ctfdSessionCookie, teamId)
          return { teamId, flagsCaptured }
        },
      )

      for (const r of refreshed) {
        state.flagsCache.set(r.teamId, { value: r.flagsCaptured, expiresAtMs: nowMs + FLAGS_CACHE_MS })
        flagsByTeamId.set(r.teamId, r.flagsCaptured)
      }
    }

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

    state.lastPositions = new Map(teams.map((t) => [t.teamId, t.position]))

    const payload: ScoreboardResponse = {
      teams,
      updatedAt: new Date().toISOString(),
    }

    state.lastPayload = payload
    state.cacheUntilMs = now + SCOREBOARD_CACHE_MS

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    console.error('[API /scoreboard/top] Error:', error)
    return NextResponse.json({ error: 'Error al obtener el scoreboard' }, { status: 500 })
  }
}

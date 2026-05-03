import { NextRequest, NextResponse } from 'next/server'
import { ctfdAdminGetScoreboardAll } from '@/services/ctfd/scoreboard'
import { getEventWindow, getEventWindowKey, isEventOver } from '@/lib/event-window'
import type { ScoreboardResponse, TeamScore } from '@/types/scoreboard'

type PublicScoreboardState = {
  lastPayload: ScoreboardResponse | null
  cacheUntilMs: number
  windowKey: string
}

const state: PublicScoreboardState = {
  lastPayload: null,
  cacheUntilMs: 0,
  windowKey: '',
}

const CACHE_DURING_MS = 3_000
const CACHE_AFTER_MS = 60_000

export async function GET(req: NextRequest) {
  try {
    const { start } = getEventWindow()
    const windowKey = getEventWindowKey()
    const nowMs = Date.now()

    if (state.windowKey && state.windowKey !== windowKey) {
      state.lastPayload = null
      state.cacheUntilMs = 0
    }
    state.windowKey = windowKey

    // Antes de iniciar: no exponer scoreboard.
    if (nowMs < start.getTime()) {
      const payload: ScoreboardResponse = { teams: [], updatedAt: new Date().toISOString() }
      return NextResponse.json(payload, { status: 200 })
    }

    if (state.lastPayload && nowMs < state.cacheUntilMs) {
      return NextResponse.json(state.lastPayload, { status: 200 })
    }

    // Después de finalizar: congelar y cachear más tiempo.
    if (isEventOver() && state.lastPayload) {
      return NextResponse.json(state.lastPayload, { status: 200 })
    }

    const rows = await ctfdAdminGetScoreboardAll()

    const teams: TeamScore[] = rows
      .filter((r) => typeof r?.pos === 'number')
      .sort((a, b) => a.pos - b.pos)
      .map((r) => ({
        teamId: String(r.account_id),
        teamName: r.name,
        score: r.score ?? 0,
        flagsCaptured: 0,
        position: r.pos,
        previousPosition: -1,
      }))

    const payload: ScoreboardResponse = {
      teams,
      updatedAt: new Date().toISOString(),
    }

    state.lastPayload = payload
    state.cacheUntilMs = nowMs + (isEventOver() ? CACHE_AFTER_MS : CACHE_DURING_MS)

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    console.error('[API /scoreboard/public] Error:', error)
    return NextResponse.json({ error: 'Error al obtener el scoreboard' }, { status: 500 })
  }
}

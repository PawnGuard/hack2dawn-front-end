import { NextResponse } from 'next/server'
import { ctfdAdminGetScoreboardAll } from '@/services/ctfd/scoreboard'
import { getEventWindow, getEventWindowKey, isEventOver } from '@/lib/event-window'
import type { ScoreboardResponse, TeamScore } from '@/types/scoreboard'

const state: { snapshot: ScoreboardResponse | null; windowKey: string } = {
  snapshot: null,
  windowKey: '',
}

export async function GET() {
  try {
    const { start } = getEventWindow()
    const windowKey = getEventWindowKey()

    if (state.windowKey && state.windowKey !== windowKey) {
      state.snapshot = null
      state.windowKey = ''
    }

    if (Date.now() < start.getTime()) {
      const payload: ScoreboardResponse = { teams: [], updatedAt: new Date().toISOString() }
      return NextResponse.json(payload, { status: 200 })
    }

    if (isEventOver() && state.snapshot && state.windowKey === windowKey) {
      return NextResponse.json(state.snapshot, { status: 200 })
    }

    // ctfdAdminGetScoreboardAll usa next: { revalidate: 15 } internamente
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

    const eventOver = isEventOver()

    const payload: ScoreboardResponse = {
      teams,
      updatedAt: new Date().toISOString(),
      locked: eventOver,
    }

    if (eventOver) {
      state.snapshot = payload
      state.windowKey = windowKey
    }

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    console.error('[API /scoreboard/public] Error:', error)
    return NextResponse.json({ error: 'Error al obtener el scoreboard' }, { status: 500 })
  }
}

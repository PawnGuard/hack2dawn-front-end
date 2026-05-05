import { NextResponse } from 'next/server'
import { ctfdAdminGetScoreboardAll } from '@/services/ctfd/scoreboard'
import { getEventWindow, isEventOver } from '@/lib/event-window'
import type { ScoreboardResponse, TeamScore } from '@/types/scoreboard'

export async function GET() {
  try {
    const { start } = getEventWindow()

    if (Date.now() < start.getTime()) {
      const payload: ScoreboardResponse = { teams: [], updatedAt: new Date().toISOString() }
      return NextResponse.json(payload, { status: 200 })
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

    const payload: ScoreboardResponse = {
      teams,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    console.error('[API /scoreboard/public] Error:', error)
    return NextResponse.json({ error: 'Error al obtener el scoreboard' }, { status: 500 })
  }
}

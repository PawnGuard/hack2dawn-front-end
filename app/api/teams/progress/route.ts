import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ctfdGetMyTeamSolves, ctfdGetMyTeamStats } from '@/services/ctfd/teams'
import { ctfdGetChallengeListDual } from '@/lib/ctfd'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.ctfdSessionCookie) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const [allChallenges, solvedIds, stats] = await Promise.all([
      ctfdGetChallengeListDual(null, null, null), 
      ctfdGetMyTeamSolves(session.ctfdSessionCookie),
      ctfdGetMyTeamStats(session.ctfdSessionCookie)
    ])

    // ── LÓGICA DE AGRUPACIÓN (Simular múltiples flags como 1 solo Lab) ──
    const machinesMap = new Map<string, { totalFlags: number; solvedFlags: number }>()

    for (const chall of allChallenges) {
      if (!chall.machineId) continue

      const current = machinesMap.get(chall.machineId) ?? { totalFlags: 0, solvedFlags: 0 }
      current.totalFlags += 1
      
      if (solvedIds.has(chall.id)) {
        current.solvedFlags += 1
      }
      
      machinesMap.set(chall.machineId, current)
    }

    let completedLabsCount = 0
    const totalLabsCount = machinesMap.size

    for (const [_, machine] of machinesMap.entries()) {
      if (machine.solvedFlags === machine.totalFlags && machine.totalFlags > 0) {
        completedLabsCount += 1
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        completedLabs: completedLabsCount,
        totalLabs: totalLabsCount,
        score: stats.score,
        rank: stats.rank
      }
    })
  } catch (error) {
    console.error('[API /teams/progress] Error:', error)
    return NextResponse.json({ error: 'Error al obtener el progreso' }, { status: 500 })
  }
}
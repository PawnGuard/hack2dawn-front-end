import { getUserHeaders } from './core'
import { CTFdResponse } from './types'

const BASE = process.env.CTFD_BASE_URL!

/**
 * Obtiene todos los IDs de los retos que el equipo actual ha resuelto.
 */
export async function ctfdGetMyTeamSolves(sessionCookie: string): Promise<Set<number>> {
  const res = await fetch(`${BASE}/api/v1/teams/me/solves`, {
    headers: getUserHeaders(sessionCookie),
    cache: 'no-store',
  })

  if (!res.ok) {
    console.error('[ctfdGetMyTeamSolves] Error fetching solves', res.status)
    return new Set()
  }

  const body = await res.json() as CTFdResponse<{ challenge_id: number }[]>
  if (!body.success || !body.data) return new Set()

  return new Set(body.data.map(s => s.challenge_id))
}

/**
 * Obtiene el score total y el rank del equipo actual.
 */
export async function ctfdGetMyTeamStats(sessionCookie: string): Promise<{ score: number; rank: number | null }> {
  // Score
  const meRes = await fetch(`${BASE}/api/v1/teams/me`, {
    headers: getUserHeaders(sessionCookie),
    cache: 'no-store',
  })

  let score = 0
  let teamId = 0
  
  if (meRes.ok) {
    const meBody = await meRes.json()
    if (meBody.success && meBody.data) {
      score = meBody.data.score ?? 0
      teamId = meBody.data.id
    }
  }

  // Rank
  let rank = null
  if (teamId > 0) {
    const sbRes = await fetch(`${BASE}/api/v1/scoreboard`, {
      headers: getUserHeaders(sessionCookie),
      cache: 'no-store',
    })
    
    if (sbRes.ok) {
      const sbBody = await sbRes.json()
      if (sbBody.success && sbBody.data) {
        const standing = sbBody.data.find((s: any) => s.account_id === teamId)
        if (standing) rank = standing.pos
      }
    }
  }

  return { score, rank }
}
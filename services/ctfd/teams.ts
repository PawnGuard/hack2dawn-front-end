import { getUserHeaders, getAdminHeaders } from './core'
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

export async function ctfdGetTeamFailsAdmin(teamId: number): Promise<Record<number, number>> {
  // Al usar el Token de Admin, CTFd SÍ nos dice el historial completo del equipo
  const res = await fetch(`${BASE}/api/v1/teams/${teamId}/fails`, {
    headers: getAdminHeaders(),
    cache: 'no-store',
  })
  
  if (!res.ok) return {}

  const body = await res.json()
  if (!body.success || !body.data) return {}

  const failsCount: Record<number, number> = {}
  body.data.forEach((fail: any) => {
    const cId = fail.challenge_id ?? fail.challenge?.id
    if (cId) {
      failsCount[cId] = (failsCount[cId] || 0) + 1
    }
  })
  
  return failsCount
}

export async function ctfdGetMyTeamDetailed(sessionCookie: string) {
  // /api/v1/teams/me devuelve el equipo actual incluyendo a sus miembros 
  // con el formato: { members: [{ id, name, score }, ...], captain_id, name, score, ... }
  const res = await fetch(`${BASE}/api/v1/teams/me`, {
    headers: getUserHeaders(sessionCookie),
    cache: 'no-store',
  })
  
  if (!res.ok) return null
  
  const body = await res.json()
  if (!body.success || !body.data) return null
  
  return body.data // Devuelve el equipo completo con la lista de members pre-cargada
}

export async function ctfdGetMyTeamRank(sessionCookie: string, teamId: number): Promise<number | null> {
  // Consulta directa al scoreboard. CTFd devuelve el array ordenado.
  const res = await fetch(`${BASE}/api/v1/scoreboard`, {
    headers: getUserHeaders(sessionCookie),
    cache: 'no-store',
  })
  
  if (!res.ok) return null
  
  const body = await res.json()
  if (!body.success || !body.data) return null
  
  // En el scoreboard, account_id corresponde al teamId si CTFd está en Team Mode
  const standing = body.data.find((s: any) => s.account_id === teamId)
  return standing ? standing.pos : null
}
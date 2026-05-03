// services/ctfd/users.ts
import { getUserHeaders } from './core'
const BASE = process.env.CTFD_BASE_URL!

// Obtiene el perfil completo del usuario autenticado (incluye afiliación, website, score)
export async function ctfdGetMyProfile(sessionCookie: string) {
  const res = await fetch(`${BASE}/api/v1/users/me`, {
    headers: getUserHeaders(sessionCookie),
    cache: 'no-store'
  })
  
  if (!res.ok) return null
  const body = await res.json()
  return body.success ? body.data : null
}

// Obtiene los solves del usuario autenticado con su nombre de reto y puntos
export async function ctfdGetMySolves(sessionCookie: string) {
  const res = await fetch(`${BASE}/api/v1/users/me/solves`, {
    headers: getUserHeaders(sessionCookie),
    cache: 'no-store'
  })
  
  if (!res.ok) return []
  const body = await res.json()
  
  // CTFd en /me/solves suele devolver { challenge_id, challenge: { name, value }, date, ... }
  // Mapeamos para garantizar la estructura que espera el frontend
  if (body.success && body.data) {
    return body.data.map((solve: any) => ({
      id: solve.id,
      challenge_id: solve.challenge_id,
      challenge_name: solve.challenge?.name ?? `Challenge #${solve.challenge_id}`,
      date: solve.date,
      value: solve.challenge?.value ?? 0,
    }))
  }
  return []
}

export async function ctfdGetMyFails(sessionCookie: string) {
  const res = await fetch(`${BASE}/api/v1/users/me/fails`, {
    headers: getUserHeaders(sessionCookie),
    cache: 'no-store'
  })
  
  if (!res.ok) return []
  const body = await res.json()
  return body.success && body.data ? body.data : []
}
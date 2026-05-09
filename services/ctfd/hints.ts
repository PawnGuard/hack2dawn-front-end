// services/ctfd/hints.ts
import { BASE_URL, getAdminHeaders, getUserHeaders } from './core'
import type { CTFdResponse, CTFdHint, HintUnlockResult } from './types'

// ─────────────────────────────────────────────────────────────────
// GET /api/v1/hints/:id
// Retorna el hint. Si ya fue desbloqueado por el usuario, incluye
// el campo `content`. Si no, content llega como null/undefined.
// ─────────────────────────────────────────────────────────────────
export async function ctfdGetHint(
  hintId: number,
  sessionCookie: string,
): Promise<CTFdHint | null> {
  const res = await fetch(`${BASE_URL}/api/v1/hints/${hintId}`, {
    headers: getUserHeaders(sessionCookie),
    cache: 'no-store',
  })

  if (!res.ok) {
    console.error(`[ctfdGetHint] Error fetching hint ${hintId}:`, res.status)
    return null
  }

  const body = await res.json() as CTFdResponse<CTFdHint>
  return body.success ? (body.data ?? null) : null
}

// ─────────────────────────────────────────────────────────────────
// GET /api/v1/challenges/:challengeId/hints
// ─────────────────────────────────────────────────────────────────
export async function ctfdGetChallengeHints(
  challengeId: number,
  sessionCookie: string,   // ← usa sesión de usuario, no admin
): Promise<CTFdHint[]> {
  const res = await fetch(`${BASE_URL}/api/v1/hints?challenge_id=${challengeId}`, {
    headers: getUserHeaders(sessionCookie),  // ← getUserHeaders, no getAdminHeaders
    cache: 'no-store',
  })
  if (!res.ok) return []
  const body = await res.json() as CTFdResponse<CTFdHint[]>
  return body.success ? (body.data ?? []) : []
}

// ─────────────────────────────────────────────────────────────────
// POST /api/v1/unlocks
// Paso 1 del flujo: desbloquear el hint consumiendo los puntos.
// Requiere CSRF Token del usuario autenticado.
// ─────────────────────────────────────────────────────────────────
export async function ctfdUnlockHint(
  hintId: number,
  sessionCookie: string,
  csrfToken: string,
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${BASE_URL}/api/v1/unlocks`, {
    method: 'POST',
    headers: getUserHeaders(sessionCookie, csrfToken),
    body: JSON.stringify({ target: hintId, type: 'hints' }),
    cache: 'no-store',
  })

  const rawText = await res.text()

  console.log(`[ctfdUnlockHint] raw response:`, rawText)

  let body
  try {
    body = JSON.parse(rawText)
  } catch {
    return { success: false, error: `Error parsing JSON: ${rawText}` }
  }


  if (!res.ok || !body.success) {
    let msg = 'Error desconocido al desbloquear pista.'
    
    if (body.message) {
      msg = body.message
    } else if (body.errors) {
      // Si "errors" es un objeto (como en el caso del "score")
      if (typeof body.errors === 'object' && !Array.isArray(body.errors)) {
        // Extraemos los valores del objeto y los unimos
        msg = Object.values(body.errors).join(', ')
      } 
      // Si "errors" llega a ser un array en otras rutas
      else if (Array.isArray(body.errors)) {
        msg = body.errors.join(', ')
      }
    }
    
    // Puedes mapear el mensaje en inglés a español para mejor experiencia de usuario
    if (msg.includes('You do not have enough points')) {
      msg = 'No tienes suficientes puntos para desbloquear esta pista.'
    } else if (msg.includes('Already unlocked') || msg.includes('already unlocked')) {
      msg = 'Esta pista ya fue desbloqueada.'
    }

    return { success: false, error: msg }
  }

  return { success: true }
}

// ─────────────────────────────────────────────────────────────────
// Flujo completo: desbloquear + obtener contenido en un solo paso
// Úsalo desde tu API route /api/hints/[id]/unlock
// ─────────────────────────────────────────────────────────────────
export async function ctfdUnlockAndGetHint(
  hintId: number,
  sessionCookie: string,
  csrfToken: string,
): Promise<HintUnlockResult> {
  // 1. Desbloquear
  const unlock = await ctfdUnlockHint(hintId, sessionCookie, csrfToken)
  if (!unlock.success) {
    return { success: false, error: unlock.error }
  }

  // 2. Obtener el hint ya con content visible
  const hint = await ctfdGetHint(hintId, sessionCookie)
  if (!hint?.content) {
    return { success: false, error: 'Hint desbloqueado pero sin contenido disponible.' }
  }

  return { success: true, content: hint.content }
}

// ─────────────────────────────────────────────────────────────────
// Obtiene los hints de múltiples challenges en paralelo.
// Úsalo en el Server Component de [slug]/page.tsx para enriquecer
// los machineSteps con sus hints antes de pasarlos al Client Component.
// ─────────────────────────────────────────────────────────────────
export async function ctfdGetHintsForChallenges(
  challengeIds: number[],
  sessionCookie: string,
): Promise<Record<number, CTFdHint[]>> {
  // GET /api/v1/hints?challenge_id=X con cookie de usuario
  // CTFd devuelve solo los hints del reto, con content si ya están desbloqueados
  const results = await Promise.all(
    challengeIds.map(async (id) => {
      const res = await fetch(`${BASE_URL}/api/v1/hints?challenge_id=${id}`, {
        headers: getUserHeaders(sessionCookie),
        cache: 'no-store',
      })
      if (!res.ok) return { id, hints: [] as CTFdHint[] }
      const body = await res.json() as CTFdResponse<CTFdHint[]>
      return { id, hints: body.success ? (body.data ?? []) : [] }
    })
  )

  return Object.fromEntries(results.map(r => [r.id, r.hints]))
}
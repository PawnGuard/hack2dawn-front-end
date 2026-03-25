import { CTFdResponse, CTFdTeam, CTFdUser, CTFdStanding, CTFdSolve } from "./types/ctfd"

const BASE = process.env.CTFD_BASE_URL!
const ADMIN_TOKEN = process.env.CTFD_ADMIN_TOKEN!
const NGINX_SECRET = process.env.NGINX_INTERNAL_SECRET!
const INVITE_CODE_FIELD_ID = 3  

function ctfdHeaders(): HeadersInit {
  return {
    'Authorization': `Token ${ADMIN_TOKEN}`,
    'Content-Type': 'application/json',
    'x-internal-key': NGINX_SECRET,
  }
}

{/* Crear usuarios */}

// ─── Crear usuario en CTFd ──────────────────────────────────────
export async function ctfdCreateUser(payload: {
  name: string
  email: string
  password: string
}): Promise<CTFdResponse<CTFdUser>> {

  const url = `${BASE}/api/v1/users`

  const res = await fetch(url, {
    method: 'POST',
    headers: ctfdHeaders(),
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      type: 'user',
      verified: true,
      hidden: false,
      banned: false,
      fields: [],
    }),
    cache: 'no-store', // Mutación → nunca cachear
  })

  // ── LOG TEMPORAL ─────────────────────────────────────────────
  console.log('Status de CTFd:', res.status, res.statusText)
  const rawText = await res.text()
  console.log('Respuesta raw de CTFd:', rawText.substring(0, 300))
  // ────────────────────────────────────────────────────────────

  try {
    return JSON.parse(rawText)
  } catch {
    throw new Error(`CTFd devolvió HTML (status ${res.status}): ${rawText.substring(0, 200)}`)
  }
}

// ─── Verificar credenciales de un usuario via el /login de CTFd 
// (la página... si, es raro pero la unica solución que encontre jaja) 
// fuente: https://github.com/CTFd/CTFd/issues/2020 ─────────
export async function ctfdVerifyCredentials(
  username: string,
  password: string,
): Promise<CTFdUser | null> {

  // ── Paso 1: GET /login ───────────────────────────────────────
  const loginPageRes = await fetch(`${BASE}/login`, {
    headers: { 'x-internal-key': NGINX_SECRET },
    cache: 'no-store',
  })

  console.log('[verify] P1 - GET /login status:', loginPageRes.status)
  if (!loginPageRes.ok) {
    console.error('[verify] P1 FALLO - /login no respondió OK')
    return null
  }

  const html = await loginPageRes.text()
  console.log('[verify] P1 - HTML length:', html.length)

  // Prueba ambos patrones de nonce — CTFd puede variar el orden de atributos
  const nonceMatch =
    html.match(/name="nonce"\s+value="([^"]+)"/) ||
    html.match(/id="nonce"[^>]+value="([^"]+)"/) ||
    html.match(/value="([^"]+)"\s+name="nonce"/)   // ← orden invertido

  console.log('[verify] P1 - nonce encontrado:', nonceMatch?.[1]?.substring(0, 20))
  if (!nonceMatch?.[1]) {
    console.error('[verify] P1 FALLO - nonce no encontrado en HTML')
    // Log del HTML para ver la forma real del input
    const nonceIndex = html.indexOf('nonce')
    console.error('[verify] P1 - contexto del nonce en HTML:', html.substring(nonceIndex - 20, nonceIndex + 100))
    return null
  }

  const nonce = nonceMatch[1]
  const initialCookie = loginPageRes.headers.get('set-cookie')?.split(';')[0] ?? ''
  console.log('[verify] P1 - initialCookie:', initialCookie.substring(0, 30))

  // ── Paso 2: POST /login ──────────────────────────────────────
  const loginRes = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': initialCookie,
      'x-internal-key': NGINX_SECRET,
    },
    body: new URLSearchParams({
      name: username,
      password: password,
      nonce: nonce,
      _submit: 'Submit',
    }).toString(),
    redirect: 'manual',
    cache: 'no-store',
  })

  const location = loginRes.headers.get('location') ?? ''
  console.log('[verify] P2 - POST /login status:', loginRes.status)
  console.log('[verify] P2 - Location header:', location)
  console.log('[verify] P2 - Set-Cookie header:', loginRes.headers.get('set-cookie')?.substring(0, 60))

  if (loginRes.status !== 302) {
    console.error('[verify] P2 FALLO - no fue redirect 302, fue:', loginRes.status)
    const body = await loginRes.text()
    console.error('[verify] P2 - body:', body.substring(0, 200))
    return null
  }

  if (location.includes('/login')) {
    console.error('[verify] P2 FALLO - redirigió de vuelta a /login → credenciales incorrectas o nonce inválido')
    return null
  }

  // ── Paso 3: Extraer session cookie ──────────────────────────
  const setCookieHeader = loginRes.headers.get('set-cookie') ?? ''
  console.log('[verify] P3 - set-cookie raw:', setCookieHeader.substring(0, 80))

  const sessionCookie = setCookieHeader.split(';')[0]
  console.log('[verify] P3 - sessionCookie extraída:', sessionCookie.substring(0, 30))

  if (!sessionCookie.startsWith('session=')) {
    console.error('[verify] P3 FALLO - cookie no empieza con "session=", valor:', sessionCookie)
    return null
  }

  // ── Paso 4: GET /api/v1/users/me con session cookie ─────────
  const meRes = await fetch(`${BASE}/api/v1/users/me`, {
    headers: {
      'Cookie': sessionCookie,
      'Content-Type': 'application/json',
      'x-internal-key': NGINX_SECRET,
    },
    cache: 'no-store',
  })

  console.log('[verify] P4 - GET /users/me status:', meRes.status)
  if (!meRes.ok) {
    const errText = await meRes.text()
    console.error('[verify] P4 FALLO - /users/me respondió:', errText.substring(0, 200))
    return null
  }

  const body: CTFdResponse<CTFdUser> = await meRes.json()
  console.log('[verify] P4 - success:', body.success, '| userId:', body.data?.id)
  return body.success ? (body.data ?? null) : null
}

// ─── Obtener usuario por ID (con admin token) ───────────────────
export async function ctfdGetUser(userId: number): Promise<CTFdUser | null> {
  const res = await fetch(`${BASE}/api/v1/users/${userId}`, {
    headers: ctfdHeaders(),
    next: { revalidate: 30 },
  })
  if (!res.ok) return null
  const body: CTFdResponse<CTFdUser> = await res.json()
  return body.success ? (body.data ?? null) : null
}

{/* ENDPOINTS DE EQUIPOS */}

// ─── Obtener equipo del usuario por ID (con admin token) ───────────────────
export async function ctfdGetUserTeam(userId: number): Promise<number | null> {
  const res = await fetch(`${BASE}/api/v1/users/${userId}`, {
    headers: ctfdHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) return null
  const body: CTFdResponse<CTFdUser> = await res.json()
  return body.data?.team_id ?? null
}

// ─── Crear equipo ───────────────────────────────────────────────
export async function ctfdCreateTeam(payload: {
  name: string
  password: string    // contraseña para que otros se unan al equipo
}): Promise<CTFdResponse<CTFdTeam>> {
  const res = await fetch(`${BASE}/api/v1/teams`, {
    method: 'POST',
    headers: ctfdHeaders(),
    body: JSON.stringify({
      name: payload.name,
      password: payload.password,
      hidden: false,
      banned: false,
      fields: [
        {
          field_id: INVITE_CODE_FIELD_ID,
          value: payload.password,
        }
      ],
    }),
    cache: 'no-store',
  })
  
  // ── LOG TEMPORAL ─────────────────────────────────────────────
  const text = await res.text()
  console.log('[createTeam] status:', res.status)
  console.log('[createTeam] response:', text.substring(0, 500))
  // ─────────────────────────────────────────────────────────────

  try { return JSON.parse(text) }
  catch { throw new Error(`CTFd error (${res.status}): ${text.substring(0, 200)}`) }
}

// ─── Agregar usuario a un equipo ────────────────────────────────
// POST /api/v1/teams/{teamId}/members
export async function ctfdAddTeamMember(
  teamId: number,
  userId: number,
): Promise<boolean> {
  const res = await fetch(`${BASE}/api/v1/teams/${teamId}/members`, {
    method: 'POST',
    headers: ctfdHeaders(),
    body: JSON.stringify({ user_id: userId }),
    cache: 'no-store',
  })
  const body = await res.json()
  return body.success === true
}

// ─── Establecer capitán del equipo ──────────────────────────────
// PATCH /api/v1/teams/{teamId} con captain_id
export async function ctfdSetTeamCaptain(
  teamId: number,
  userId: number,
): Promise<boolean> {
  const res = await fetch(`${BASE}/api/v1/teams/${teamId}`, {
    method: 'PATCH',
    headers: ctfdHeaders(),
    body: JSON.stringify({ captain_id: userId }),
    cache: 'no-store',
  })
  const body = await res.json()
  return body.success === true
}

// ─── Buscar equipo por nombre (q + field) ────────────────────────────────
export async function ctfdFindTeamByName(name: string): Promise<CTFdTeam | null> {
  const url = new URL(`${BASE}/api/v1/teams`)
  url.searchParams.set('q', name)
  url.searchParams.set('field', 'name')

  const res = await fetch(url.toString(), {
    headers: ctfdHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) return null
  const body: CTFdResponse<CTFdTeam[]> = await res.json()

  // Encuentra el equipo exacto en la lista
  const teamBasic = body.data?.find(t => t.name === name) ?? null
  if (!teamBasic) return null

  // Consulta el equipo por ID para obtener los fields completos
  const teamRes = await fetch(`${BASE}/api/v1/teams/${teamBasic.id}`, {
    headers: ctfdHeaders(),
    cache: 'no-store',
  })
  if (!teamRes.ok) return null
  const teamBody: CTFdResponse<CTFdTeam> = await teamRes.json()

  // ── LOG TEMPORAL ─────────────────────────────────────────────
  console.log('[findTeam] fields recibidos:', JSON.stringify(teamBody.data?.fields))
  // ─────────────────────────────────────────────────────────────

  return teamBody.data ?? null
}

export function getTeamInviteCode(team: CTFdTeam): string | null {
  const field = team.fields?.find(
    f => f.name === 'invite_code' || f.field_id === INVITE_CODE_FIELD_ID
  )
  return field?.value ?? null
}

// ─── Obtener equipo completo con fields ─────────────────────────
export async function ctfdGetTeam(teamId: number): Promise<CTFdTeam | null> {
  const res = await fetch(`${BASE}/api/v1/teams/${teamId}`, {
    headers: ctfdHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) return null
  const body: CTFdResponse<CTFdTeam> = await res.json()
  return body.data ?? null
}

// ─── Obtener IDs de miembros del equipo ─────────────────────────
export async function ctfdGetTeamMemberIds(teamId: number): Promise<number[]> {
  const res = await fetch(`${BASE}/api/v1/teams/${teamId}/members`, {
    headers: ctfdHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) return []
  const body: CTFdResponse<number[]> = await res.json()
  return body.data ?? []
}

// ─── Cambiar nombre del equipo ───────────────────────────────────
// PATCH /api/v1/teams/{teamId} { name }
export async function ctfdRenameTeam(teamId: number, name: string): Promise<CTFdResponse<CTFdTeam>> {
  const res = await fetch(`${BASE}/api/v1/teams/${teamId}`, {
    method: 'PATCH',
    headers: ctfdHeaders(),
    body: JSON.stringify({ name }),
    cache: 'no-store',
  })
  const text = await res.text()
  try { return JSON.parse(text) }
  catch { throw new Error(`CTFd error (${res.status}): ${text.substring(0, 200)}`) }
}

// ─── Expulsar miembro del equipo ─────────────────────────────────
// DELETE /api/v1/teams/{teamId}/members { user_id }
export async function ctfdKickTeamMember(teamId: number, userId: number): Promise<boolean> {
  const res = await fetch(`${BASE}/api/v1/teams/${teamId}/members`, {
    method: 'DELETE',
    headers: ctfdHeaders(),
    body: JSON.stringify({ user_id: userId }),
    cache: 'no-store',
  })
  const body = await res.json()
  return body.success === true
}

export async function ctfdGetTeamRank(teamId: number): Promise<number | null> {
  try {
    const res = await fetch(`${BASE}/api/v1/scoreboard`, {
      headers: ctfdHeaders(),
      cache: 'no-store',
    })
    if (!res.ok) return null

    const body: CTFdResponse<CTFdStanding[]> = await res.json()
    if (!body.data) return null

    const standing = body.data.find(s => s.account_id === teamId)
    return standing?.pos ?? null
  } catch {
    return null
  }
}

{/* ENDPOINTS DE USUARIO */}

// ─── Obtener Solves de un usuario ─────────────────────────────────
export async function ctfdGetUserSolves(userId: number): Promise<CTFdSolve[]> {
  const res = await fetch(`${BASE}/api/v1/users/${userId}/solves`, {
    headers: ctfdHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) return []
  const body: CTFdResponse<CTFdSolve[]> = await res.json()
  return body.data ?? []
}

// ─── Obtener detalles de un reto ──────────────────────────────────
// Para obtener los puntos (value) y el nombre real del reto
export async function ctfdGetChallenge(challengeId: number): Promise<{ name: string, value: number } | null> {
  const res = await fetch(`${BASE}/api/v1/challenges/${challengeId}`, {
    headers: ctfdHeaders(),
    next: { revalidate: 60 }, // Cacheable por 1 minuto, los retos cambian poco
  })
  if (!res.ok) return null
  const body: CTFdResponse<any> = await res.json()
  return body.data ? { name: body.data.name, value: body.data.value } : null
}

// ─── Actualizar perfil de usuario ─────────────────────────────────
// PATCH /api/v1/users/{id}
export async function ctfdUpdateUser(
  userId: number,
  payload: { name?: string; affiliation?: string; website?: string }
): Promise<CTFdResponse<CTFdUser>> {
  const res = await fetch(`${BASE}/api/v1/users/${userId}`, {
    method: 'PATCH',
    headers: ctfdHeaders(),
    body: JSON.stringify(payload),
    cache: 'no-store',
  })
  const text = await res.text()
  try { return JSON.parse(text) }
  catch { throw new Error(`CTFd error (${res.status}): ${text.substring(0, 200)}`) }
}

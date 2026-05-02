import { ChallengeContinent, ChallengeSummary } from "@/types/challenges"
import { 
  CTFdResponse, 
  CTFdTeam, 
  CTFdUser, 
  CTFdStanding, 
  CTFdSolve, 
  CTFdChallengeRaw, 
  CTFdChallengeSummary
 } from "./types/ctfd"

const BASE = process.env.CTFD_BASE_URL!
const ADMIN_TOKEN = process.env.CTFD_ADMIN_TOKEN!
const NGINX_SECRET = process.env.NGINX_INTERNAL_SECRET!
const INVITE_CODE_FIELD_ID = 3  
const TEC_CAMPUS_FIELD_ID = Number(process.env.CTFD_TEC_CAMPUS_FIELD_ID)
const FIRST_NAME_FIELD_ID = Number(process.env.CTFD_FIRST_NAME_FIELD_ID)
const LAST_NAME_FIELD_ID = Number(process.env.CTFD_LAST_NAME_FIELD_ID)
const AGE_FIELD_ID = Number(process.env.CTFD_AGE_FIELD_ID)
const PHONE_FIELD_ID = Number(process.env.CTFD_PHONE_FIELD_ID)
const MATRICULA_FIELD_ID = Number(process.env.CTFD_MATRICULA_FIELD_ID)
const COUNTRY_FIELD_ID = Number(process.env.CTFD_COUNTRY_FIELD_ID ?? 10)
const CAREER_FIELD_ID = Number(process.env.CTFD_CAREER_FIELD_ID)
const STUDY_LEVEL_FIELD_ID = Number(process.env.CTFD_STUDY_LEVEL_FIELD_ID)
const CTFS_ATTENDED_FIELD_ID = Number(process.env.CTFD_CTFS_ATTENDED_FIELD_ID)
const SHIRT_SIZE_FIELD_ID = Number(process.env.CTFD_SHIRT_SIZE_FIELD_ID)
const HEARD_FROM_FIELD_ID = Number(process.env.CTFD_HEARD_FROM_FIELD_ID)
const EMERGENCY_NAME_FIELD_ID = Number(process.env.CTFD_EMERGENCY_NAME_FIELD_ID)
const EMERGENCY_RELATION_FIELD_ID = Number(process.env.CTFD_EMERGENCY_RELATION_FIELD_ID)
const EMERGENCY_PHONE_FIELD_ID = Number(process.env.CTFD_EMERGENCY_PHONE_FIELD_ID)
const EMERGENCY_EMAIL_FIELD_ID = Number(process.env.CTFD_EMERGENCY_EMAIL_FIELD_ID)

type RegisterProfileData = {
  firstName: string
  lastName: string
  age: number
  phone: string
  matricula?: number | null
  country: string
  career?: string
  studyLevel?: string
  ctfsAttended?: number | null
  shirtSize: string
  heardFrom: string
  emergencyName: string
  emergencyRelation: string
  emergencyPhone: string
  emergencyEmail: string
}

function addCustomField(
  customFields: Array<{ field_id: number; value: string }>,
  fieldId: number,
  value: string | number | null | undefined,
) {
  if (!Number.isFinite(fieldId)) return
  if (value === null || value === undefined || `${value}`.trim() === '') return
  customFields.push({ field_id: fieldId, value: String(value) })
}

function ctfdHeaders(): HeadersInit {
  return {
    'Authorization': `Token ${ADMIN_TOKEN}`,
    'Content-Type': 'application/json',
    'x-internal-key': NGINX_SECRET,
  }
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
}

function mapDifficulty(points: number): 'Easy' | 'Medium' | 'Hard' | 'Insane' {
  if (points <= 125) return 'Easy'
  if (points <= 275) return 'Medium'
  if (points <= 400) return 'Hard'
  return 'Insane'
}

{/* Crear usuarios */}

// ─── Crear usuario en CTFd ──────────────────────────────────────
export async function ctfdCreateUser(payload: {
  name: string
  email: string
  password: string
  isTecCampus?: boolean
  profile?: RegisterProfileData
}): Promise<CTFdResponse<CTFdUser>> {

  const url = `${BASE}/api/v1/users`
  const customFields: Array<{ field_id: number; value: string }> = []

  if (typeof payload.isTecCampus === 'boolean') {
    if (!Number.isFinite(TEC_CAMPUS_FIELD_ID)) {
      throw new Error('CTFD_TEC_CAMPUS_FIELD_ID no está definido o no es numérico')
    }
    customFields.push({
      field_id: TEC_CAMPUS_FIELD_ID,
      value: payload.isTecCampus ? 'true' : 'false',
    })
  }

  if (payload.profile) {
    addCustomField(customFields, FIRST_NAME_FIELD_ID, payload.profile.firstName)
    addCustomField(customFields, LAST_NAME_FIELD_ID, payload.profile.lastName)
    addCustomField(customFields, AGE_FIELD_ID, payload.profile.age)
    addCustomField(customFields, PHONE_FIELD_ID, payload.profile.phone)
    addCustomField(customFields, MATRICULA_FIELD_ID, payload.profile.matricula)
    addCustomField(customFields, COUNTRY_FIELD_ID, payload.profile.country)
    addCustomField(customFields, CAREER_FIELD_ID, payload.profile.career)
    addCustomField(customFields, STUDY_LEVEL_FIELD_ID, payload.profile.studyLevel)
    addCustomField(customFields, CTFS_ATTENDED_FIELD_ID, payload.profile.ctfsAttended)
    addCustomField(customFields, SHIRT_SIZE_FIELD_ID, payload.profile.shirtSize)
    addCustomField(customFields, HEARD_FROM_FIELD_ID, payload.profile.heardFrom)
    addCustomField(customFields, EMERGENCY_NAME_FIELD_ID, payload.profile.emergencyName)
    addCustomField(customFields, EMERGENCY_RELATION_FIELD_ID, payload.profile.emergencyRelation)
    addCustomField(customFields, EMERGENCY_PHONE_FIELD_ID, payload.profile.emergencyPhone)
    addCustomField(customFields, EMERGENCY_EMAIL_FIELD_ID, payload.profile.emergencyEmail)
  }

  const affiliation = payload.profile?.career || (payload.isTecCampus ? 'ITESM' : undefined)

  const res = await fetch(url, {
    method: 'POST',
    headers: ctfdHeaders(),
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      ...(affiliation ? { affiliation } : {}),
      type: 'user',
      verified: true,
      hidden: false,
      banned: false,
      fields: customFields,
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
// ── lib/ctfd.ts ──
export async function ctfdVerifyCredentials(
  username: string,
  password: string,
): Promise<{ user: CTFdUser; sessionCookie: string; csrfToken: string } | null> {

  // ── Paso 1: GET /login (Obtener nonce pre-login) ──
  const loginPageRes = await fetch(`${BASE}/login`, {
    headers: { 'x-internal-key': NGINX_SECRET },
    cache: 'no-store',
  })
  if (!loginPageRes.ok) return null

  const html = await loginPageRes.text()
  
  // ¡AQUÍ ESTABA EL ERROR! Restauramos tu regex original que sí funcionaba
  const nonceMatch =
    html.match(/name="nonce"\s+value="([^"]+)"/) ||
    html.match(/id="nonce"[^>]+value="([^"]+)"/) ||
    html.match(/value="([^"]+)"\s+name="nonce"/)

  if (!nonceMatch?.[1]) {
    console.error('[verify] P1 FALLO - nonce no encontrado en HTML')
    return null
  }

  const preLoginNonce = nonceMatch[1]
  const initialCookie = loginPageRes.headers.get('set-cookie')?.split(';')[0] ?? ''

  // ── Paso 2: POST /login ──
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
      nonce: preLoginNonce,
      _submit: 'Submit',
    }).toString(),
    redirect: 'manual',
    cache: 'no-store',
  })

  if (loginRes.status !== 302) {
    console.error('[verify] P2 FALLO - status:', loginRes.status)
    return null
  }

  // ── Paso 3: Extraer session cookie AUTENTICADA ──
  const setCookieHeader = loginRes.headers.get('set-cookie') ?? ''
  const sessionCookie = setCookieHeader.split(';')[0]
  if (!sessionCookie.startsWith('session=')) {
    console.error('[verify] P3 FALLO - cookie no extraída')
    return null
  }

  // ── Paso 4: Obtener el CSRF Token válido para la sesión autenticada ──
  // Al iniciar sesión, CTFd rota la cookie y el CSRF token cambia por seguridad
  const authPageRes = await fetch(`${BASE}/challenges`, {
    headers: { 'Cookie': sessionCookie, 'x-internal-key': NGINX_SECRET },
    cache: 'no-store'
  })
  const authHtml = await authPageRes.text()
  
  // CTFd inyecta el nuevo CSRF token en el objeto JS window.init
  const authNonceMatch = authHtml.match(/'csrfNonce':\s*"([^"]+)"/) || authHtml.match(/"csrfNonce":\s*"([^"]+)"/)
  const finalCsrfToken = authNonceMatch ? authNonceMatch[1] : preLoginNonce

  // ── Paso 5: Confirmar Identidad con la API ──
  const meRes = await fetch(`${BASE}/api/v1/users/me`, {
    headers: {
      'Cookie': sessionCookie,
      'Content-Type': 'application/json',
      'x-internal-key': NGINX_SECRET,
    },
    cache: 'no-store',
  })

  if (!meRes.ok) return null
  const body: CTFdResponse<CTFdUser> = await meRes.json()

  if (body.success && body.data) {
    return { user: body.data, sessionCookie, csrfToken: finalCsrfToken }
  }

  return null
}

// Fecha de expiración del token: fin del evento + 7 días de margen
function tokenExpiration(): string {
  const end = process.env.EVENT_END
    ? new Date(process.env.EVENT_END)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // fallback: 30 días
  end.setDate(end.getDate() + 7) // margen de seguridad
  return end.toISOString().split('T')[0] // "YYYY-MM-DD"
}

/**
 * Crea un nuevo token personal para el usuario.
 * Devuelve el valor del token (solo visible en el momento de creación).
 */
async function ctfdCreateUserToken(sessionCookie: string, csrfToken: string): Promise<string | null> {
  const res = await fetch(`${BASE}/api/v1/tokens`, {
    method: 'POST',
    headers: {
      'Cookie': sessionCookie,
      'CSRF-Token': csrfToken,
      'Content-Type': 'application/json',
      'x-internal-key': NGINX_SECRET,
    },
    body: JSON.stringify({
      expiration: tokenExpiration(),
      description: 'H4ck2D4wn Platform Token',
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    console.error('[ctfdCreateUserToken] Error:', res.status)
    return null
  }

  const body = await res.json() as CTFdResponse<{ id: number; value: string }>
  return body.success ? body.data?.value ?? null : null
}

/**
 * ctfdGetOrCreateUserToken
 *
 * Punto de entrada principal. Llama a esta función desde login y register.
 *
 * Estrategia:
 * - Si el usuario ya tiene un token de plataforma → lo borra y crea uno fresco
 *   (porque la API de listado no devuelve el valor real del token, solo el ID)
 * - Si no tiene → crea uno nuevo
 *
 * Esto garantiza que SIEMPRE tengamos el valor del token en mano para
 * guardarlo en la sesión de iron-session.
 */
export async function ctfdGetOrCreateUserToken(sessionCookie: string, csrfToken: string): Promise<string | null> {
  try {
    const token = await ctfdCreateUserToken(sessionCookie, csrfToken)
    if (!token) {
      console.error('[ctfdGetOrCreateUserToken] No se pudo crear token para sessionCookie:', sessionCookie)
    }
    return token
  } catch (err) {
    console.error('[ctfdGetOrCreateUserToken] Error inesperado:', err)
    return null
  }
}

{/* ENDPOINTS DE USUARIO */}

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

/**
 * Obtiene los IDs de challenges resueltos por el equipo.
 * GET /api/v1/teams/:teamId/solves  →  array de solves del equipo.
 * Usa Admin Token para poder leer cualquier equipo.
 *
 * Devuelve un Set<number> con los challenge_id resueltos, listo para
 * un O(1) lookup en ctfdGetChallengeList.
 */
export async function ctfdGetTeamSolvedIds(teamId: number): Promise<Set<number>> {
  try {
    const res = await fetch(`${BASE}/api/v1/teams/${teamId}/solves`, {
      headers: ctfdHeaders(),  // Admin Token — puede leer cualquier equipo
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('[ctfdGetTeamSolvedIds] CTFd respondió', res.status)
      return new Set()
    }

    const body = await res.json() as CTFdResponse<Array<{ challenge_id: number }>>
    if (!body.success || !body.data) return new Set()

    return new Set(body.data.map(s => s.challenge_id))
  } catch (err) {
    console.error('[ctfdGetTeamSolvedIds] Error:', err)
    return new Set()
  }
}

/**
 * Obtiene el score y rank actuales del equipo desde el scoreboard.
 * GET /api/v1/teams/:teamId  →  score campo en el objeto del equipo.
 *
 * Nota: CTFd expone el score oficial directamente en el objeto del equipo.
 */
export async function ctfdGetTeamStats(
  teamId: number
): Promise<{ score: number; rank: number | null }> {
  try {
    // Rank: buscamos en el scoreboard
    const scoreboardRes = await fetch(`${BASE}/api/v1/scoreboard`, {
      headers: ctfdHeaders(),
      cache: 'no-store',
    })

    if (!scoreboardRes.ok) return { score: 0, rank: null }

    const body = await scoreboardRes.json() as CTFdResponse<CTFdStanding[]>
    if (!body.success || !body.data) return { score: 0, rank: null }

    const standing = body.data.find(s => s.account_id === teamId)
    return {
      score: standing?.score  ?? 0,
      rank:  standing?.pos    ?? null,
    }
  } catch (err) {
    console.error('[ctfdGetTeamStats] Error:', err)
    return { score: 0, rank: null }
  }
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

export async function ctfdGetChallengeDetail(
  challengeId: number,
  userAuth?: string | null,
): Promise<ChallengeSummary | null> {
  // Headers: si hay token de usuario, usarlo para que solved_by_me sea correcto
  let headers: HeadersInit
  if (userAuth?.startsWith('Token ')) {
    headers = {
      Authorization: userAuth,
      'Content-Type': 'application/json',
      'x-internal-key': NGINX_SECRET,
    }
  } else {
    headers = ctfdHeaders()  // Admin token como fallback
  }

  const res = await fetch(`${BASE}/api/v1/challenges/${challengeId}`, {
    headers,
    cache: 'no-store',
  })

  if (!res.ok) return null

  const body = await res.json() as { success: boolean; data?: CTFdChallengeRaw }
  if (!body.success || !body.data) return null

  const chall = body.data
  const points  = chall.value ?? chall.initial ?? 0
  const solved  = chall.solved_by_me ?? false
  const continent = parseContinentTag(chall.tags)
  const machineId = parseMachineTag(chall.tags) // Ejemplo de tag: "machine:docker, o como esta en el docs de sammy"
  const step      = parseStepTag(chall.tags) // ← 1, 2, 3, 4 ,etc... n flags

  return {
    id:            chall.id,
    slug:          toSlug(chall.name),
    name:          chall.name,
    category:      chall.category ?? 'General',
    machineId,
    step,
    continent,
    type:          chall.type ?? chall.category ?? 'General',
    difficulty:    mapDifficulty(points),
    points,
    description:   chall.description ?? 'Sin descripción disponible.',
    lore:          'Briefing no disponible. Revisa la descripción técnica del reto.',
    totalFlags:    1,
    capturedFlags: solved ? 1 : 0,
    status:        solved ? 'COMPLETED' : 'AVAILABLE',
    completedAt:   null,
    firstBlood:    null,
    solves:        chall.solves ?? 0,
    connectionInfo: chall.connection_info ?? null,
    solvedByTeam:  false,  // El detalle individual no tiene info del equipo; se enriquece si se necesita
  }
}

/**
 * ctfdGetChallengeList
 * GET /api/v1/challenges
 *
 * Si pasas `userSessionCookie` (la cookie de sesión de CTFd del usuario),
 * CTFd devolverá `solved_by_me: true` para los retos que ese usuario ya resolvió.
 * Sin ella se usa el admin token y todos los retos llegan como AVAILABLE.
 */
export async function ctfdGetChallengeList(
  userAuth?: string,
): Promise<CTFdChallengeSummary[]> {

  let headers: HeadersInit

  if (!userAuth) {
    // Sin autenticación de usuario → usa Admin Token (todos AVAILABLE)
    headers = ctfdHeaders()
  } else if (userAuth.startsWith('Token ')) {
    // Personal Access Token del usuario (el caso correcto en producción)
    headers = {
      'Authorization':  userAuth,
      'Content-Type':   'application/json',
      'x-internal-key': NGINX_SECRET,
    }
  } else {
    // Cookie de sesión (legacy / fallback)
    headers = {
      'Cookie':         userAuth,
      'Content-Type':   'application/json',
      'x-internal-key': NGINX_SECRET,
    }
  }

  const res = await fetch(`${BASE}/api/v1/challenges`, {
    headers,
    cache: 'no-store',
  })

  if (!res.ok) {
    console.error('[ctfdGetChallengeList] CTFd respondió', res.status)
    return []
  }

  const body = await res.json() as CTFdResponse<CTFdChallengeRaw[]>
  if (!body.success || !body.data) return []

  return body.data.map((chall) => {
    const points = chall.value ?? chall.initial ?? 0
    const solved = chall.solved_by_me ?? false
    const continent = parseContinentTag(chall.tags)
    const machineId = parseMachineTag(chall.tags) // Ejemplo de tag: "machine:docker, o como esta en el docs de sammy"
    const step      = parseStepTag(chall.tags) // ← 1, 2, 3, 4 ,etc... n flags

    return {
      id:             chall.id,
      slug:           toSlug(chall.name),
      machineId,
      step,
      name:           chall.name,
      category:       chall.category      ?? 'General',
      continent,
      type:           chall.type          ?? chall.category ?? 'General',
      difficulty:     mapDifficulty(points),
      points,
      description:    chall.description   ?? 'Sin descripción disponible.',
      lore:           'Briefing no disponible. Revisa la descripción técnica del reto.',
      totalFlags:     1,
      capturedFlags:  solved ? 1 : 0,
      status:         solved ? 'COMPLETED' : 'AVAILABLE',
      completedAt:    null,
      firstBlood:     null,
      solves:         chall.solves        ?? 0,
      connectionInfo: chall.connection_info ?? null,
    }
  })
}

/**
 * Obtiene la lista maestra con Admin Token (ve TODO incluyendo retos Hidden/Anonymized),
 * luego cruza con los solves del usuario para enriquecer el status de cada reto.
 * Esto garantiza que machineId y step siempre lleguen al frontend.
 */
export async function ctfdGetChallengeListDual(
  userAuth?: string | null,
  teamId?: number | null,
  userId?: number | null,
): Promise<CTFdChallengeSummary[]> {
  if (!BASE || !ADMIN_TOKEN || !NGINX_SECRET) {
    console.error('[ctfdGetChallengeListDual] missing env', {
      hasBase: Boolean(BASE),
      hasAdminToken: Boolean(ADMIN_TOKEN),
      hasNginxSecret: Boolean(NGINX_SECRET),
    })
  }

  // ── 1. Lista maestra con Admin Token (tags siempre visibles) ──
  const adminRes = await fetch(`${BASE}/api/v1/challenges`, {
    headers: ctfdHeaders(),
    cache: 'no-store',
  })
  if (!adminRes.ok) {
    const bodyText = await adminRes.text().catch(() => '')
    console.error('ctfdGetChallengeListDual: Admin fetch falló', adminRes.status, bodyText.slice(0, 200))
    return []
  }
  const adminBody = await adminRes.json() as CTFdResponse<CTFdChallengeRaw[]>
  if (!adminBody.success || !adminBody.data) {
    console.error('ctfdGetChallengeListDual: Admin body invalid', {
      success: adminBody.success,
      hasData: Boolean(adminBody.data),
    })
    return []
  }
  console.log('ctfdGetChallengeListDual: Admin challenges', adminBody.data.length)

  // ── 2. Solves del usuario (solvedbyme) ──
  const userSolvedIds = new Set<number>()
  if (userAuth?.startsWith('Token ')) {
    try {
      const solveRes = await fetch(`${BASE}/api/v1/users/me/solves`, {
        headers: {
          'Authorization': userAuth,
          'Content-Type': 'application/json',
          'x-internal-key': NGINX_SECRET,
        },
        cache: 'no-store',
      })
      if (solveRes.ok) {
        const solveBody = await solveRes.json() as CTFdResponse<{ challenge_id: number }[]>
        solveBody.data?.forEach(s => userSolvedIds.add(s.challenge_id))
      }
    } catch { /* no bloquear si falla */ }
  }

  // ── 3. Solves del equipo ──
  const teamSolvedIds = teamId ? await ctfdGetTeamSolvedIds(teamId) : new Set<number>()

  // ── 4. Merge: estructura del Admin + status del usuario ──
  return adminBody.data.map(chall => {
    const points   = chall.value ?? chall.initial ?? 0
    const solved   = userSolvedIds.has(chall.id)
    const continent = parseContinentTag(chall.tags)
    const machineId = parseMachineTag(chall.tags)
    const step      = parseStepTag(chall.tags)

    return {
      id:             chall.id,
      slug:           toSlug(chall.name),
      machineId,
      step,
      name:           chall.name,
      category:       chall.category ?? 'General',
      continent,
      type:           chall.type ?? chall.category ?? 'General',
      difficulty:     mapDifficulty(points),
      points,
      description:    chall.description ?? 'Sin descripción disponible.',
      lore:           'Briefing no disponible. Revisa la descripción técnica del reto.',
      totalFlags:     1,
      capturedFlags:  solved ? 1 : 0,
      status:         solved ? 'COMPLETED' : 'AVAILABLE',
      completedAt:    null,
      firstBlood:     null,
      solves:         chall.solves ?? 0,
      connectionInfo: chall.connection_info ?? null,
      solvedByTeam:   teamSolvedIds.has(chall.id),
    }
  })
}

const VALID_CONTINENTS = new Set<ChallengeContinent>([
  'North America',
  'South America',
  'Europe',
  'Africa',
  'Asia',
  'Oceania',
  'Antartida Sur',
])

/**
 * Busca en el array de tags de CTFd un tag con el prefijo "continent:"
 * y devuelve el continente si es válido, o null si no se encontró o es inválido.
 *
 * Ejemplo de tag en CTFd: "continent:Asia"  →  devuelve "Asia"
 * Ejemplo de tag en CTFd: "continent:North America"  →  devuelve "North America"
 */
type CTFdTag = string | { value?: string | null } | null | undefined

function parseContinentTag(
  tags: CTFdTag[] | undefined | null,
): ChallengeContinent | null {
  if (!tags || tags.length === 0) return null

  // Normalizar a string sin importar el formato del endpoint
  const values = tags
    .map(t => (typeof t === 'string' ? t : t?.value))
    .filter((v): v is string => typeof v === 'string' && v.length > 0)

  const raw = values
    .find(v => v.toLowerCase().startsWith('continent:'))
    ?.slice('continent:'.length)
    .trim()

  if (!raw) return null

  return VALID_CONTINENTS.has(raw as ChallengeContinent)
    ? (raw as ChallengeContinent)
    : null
}

function parseMachineTag(tags: CTFdTag[] | undefined | null): string | null {
  if (!tags || tags.length === 0) return null
  const values = tags
    .map(t => (typeof t === 'string' ? t : t?.value))
    .filter((v): v is string => typeof v === 'string' && v.length > 0)
    
  return values.find(v => v.toLowerCase().startsWith('machine:'))
    ?.slice('machine:'.length).trim() ?? null
}

function parseStepTag(tags: CTFdTag[] | undefined | null): number | null {
  if (!tags || tags.length === 0) return null
  const values = tags
    .map(t => (typeof t === 'string' ? t : t?.value))
    .filter((v): v is string => typeof v === 'string' && v.length > 0)
    
  const raw = values.find(v => v.toLowerCase().startsWith('step:'))
    ?.slice('step:'.length).trim()
    
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

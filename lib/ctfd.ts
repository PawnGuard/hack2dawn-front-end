import { CTFdResponse, CTFdUser } from "./types/ctfd"

const BASE = process.env.CTFD_BASE_URL!
const ADMIN_TOKEN = process.env.CTFD_ADMIN_TOKEN!
const NGINX_SECRET = process.env.NGINX_INTERNAL_SECRET!

function ctfdHeaders(): HeadersInit {
  return {
    'Authorization': `Token ${ADMIN_TOKEN}`,
    'Content-Type': 'application/json',
    'X-Internal-Token': NGINX_SECRET,
  }
}

// ─── Crear usuario en CTFd ──────────────────────────────────────
export async function ctfdCreateUser(payload: {
  name: string
  email: string
  password: string
}): Promise<CTFdResponse<CTFdUser>> {
  const res = await fetch(`${BASE}/api/v1/users`, {
    method: 'POST',
    headers: ctfdHeaders(),
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      type: 'user',
      verified: false,
      hidden: false,
      banned: false,
      fields: [],
    }),
    cache: 'no-store', // Mutación → nunca cachear
  })
  return res.json()
}

// ─── Verificar credenciales de un usuario via Basic Auth ─────────
export async function ctfdVerifyCredentials(
  name: string,
  password: string,
): Promise<CTFdUser | null> {
  const credentials = Buffer.from(`${name}:${password}`).toString('base64')

  const res = await fetch(`${BASE}/api/v1/users/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${credentials}`, // Basic Auth → CTFd verifica contra su DB
      'Content-Type': 'application/json',
      'X-Internal-Token': NGINX_SECRET,
    },
    cache: 'no-store',
  })

  if (!res.ok) return null

  const body: CTFdResponse<CTFdUser> = await res.json()
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
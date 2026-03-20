// ─── Wrapper genérico (sirve para todos los endpoints) ───────────
export interface CTFdResponse<T> {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
}

// ─── Respuesta de POST /api/v1/users y GET /api/v1/users/:id ─────
export interface CTFdUser {
  id: number
  oauth_id: number | null
  name: string
  password: string | null
  email: string
  type: 'user' | 'admin'
  secret: string | null
  website: string | null
  affiliation: string | null
  country: string | null
  bracket_id: number | null
  hidden: boolean
  banned: boolean
  verified: boolean
  language: string | null
  change_password: boolean
  team_id: number | null
  created: string             // ISO8601: "2019-08-24T14:15:22Z"
  // Campos que aparecen en algunos contextos (no siempre presentes)
  score?: number
  place?: string
}
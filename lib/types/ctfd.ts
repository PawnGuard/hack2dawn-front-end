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

export interface CTFdFieldEntry {
  id: number          // ID del field definition
  name: string        // "invite_code"
  value: string       // el valor guardado
  field_id: number    // mismo que id
  type: string        // "text"
  description: string
}

export interface CTFdTeam {
  id: number
  name: string
  email: string | null
  password: string | null
  secret: string | null
  website: string | null
  affiliation: string | null
  country: string | null
  hidden: boolean
  banned: boolean
  captain_id: number | null
  score: number;
  rank?: number;
  created: string
  fields: CTFdFieldEntry[]
}

export interface TeamMemberData {
  id: number
  username: string
  score: number
  isCaptain: boolean
  isMe: boolean
}

export interface TeamDashboardData {
  teamId: number
  teamName: string
  teamScore: number
  teamRank: number | null
  inviteCode: string | null
  captainId: number | null
  isCaptain: boolean
  members: TeamMemberData[]
}

export interface CTFdStanding {
  pos: number
  account_id: number
  name: string
  score: number
}

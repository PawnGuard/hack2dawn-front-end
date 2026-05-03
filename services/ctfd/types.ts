/**
 * Wrapper genérico para las respuestas de la API REST de CTFd (v1).
 */
export interface CTFdResponse<T> {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
}

export interface CTFdHint {
  id: number
  challenge_id: number
  /** Solo presente si el hint ya fue desbloqueado por el usuario/equipo */
  content?: string | null
  cost: number
  requirements?: { prerequisites: number[] } | null
}

export interface HintUnlockResult {
  success: boolean
  error?: string
  /** Contenido del hint, disponible si el desbloqueo fue exitoso */
  content?: string
}

export interface CTFdHintRaw {
  id: number
  challenge_id: number
  cost: number
  content?: string | null
  requirements?: { prerequisites: number[] } | null
}
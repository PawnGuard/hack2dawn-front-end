/**
 * Wrapper genérico para las respuestas de la API REST de CTFd (v1).
 */
export interface CTFdResponse<T> {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
}
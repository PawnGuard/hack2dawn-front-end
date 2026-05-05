import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ctfdAdminGetScoreboardTop } from '@/services/ctfd/scoreboard'
import { getEventWindow, getEventWindowKey, isEventOver, eventDurationMs } from '@/lib/event-window'
import type { ProgressChartResponse, ScoreDataPoint } from '@/types/scoreboard'

type ProgressState = {
  history: ScoreDataPoint[]
  lastTeamNames: string[]
  lastPointAtMs: number
  initialized: boolean
  windowKey: string
}

const state: ProgressState = {
  history: [],
  lastTeamNames: [],
  lastPointAtMs: 0,
  initialized: false,
  windowKey: '',
}

const MIN_POINT_INTERVAL_MS = 3_000

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { start, end } = getEventWindow()
    const windowKey = getEventWindowKey()
    const nowMs = Date.now()

    // Si cambiaron las fechas por env, reiniciar historia/cache en caliente.
    if (state.windowKey && state.windowKey !== windowKey) {
      state.history = []
      state.lastTeamNames = []
      state.lastPointAtMs = 0
      state.initialized = false
    }
    state.windowKey = windowKey

    // Antes de iniciar el evento: no consultar CTFd, no generar puntos.
    if (nowMs < start.getTime()) {
      const payload: ProgressChartResponse = {
        dataPoints: [],
        teamNames: [],
        updatedAt: new Date().toISOString(),
      }
      return NextResponse.json(payload, { status: 200 })
    }

    // Inicializar historia desde el inicio del evento con ceros.
    if (!state.initialized) {
      state.initialized = true
      state.lastPointAtMs = 0
      state.history = [{ timestamp: start.getTime() }]
      state.lastTeamNames = []
    }

    // Al terminar el evento, congelamos la historia.
    if (isEventOver()) {
      const frozen: ProgressChartResponse = {
        dataPoints: state.history,
        teamNames: state.lastTeamNames,
        updatedAt: new Date().toISOString(),
      }
      return NextResponse.json(frozen, { status: 200 })
    }

    // Throttle: no generar punto nuevo si se pide muy seguido.
    if (state.lastPointAtMs && nowMs - state.lastPointAtMs < MIN_POINT_INTERVAL_MS) {
      const payload: ProgressChartResponse = {
        dataPoints: state.history,
        teamNames: state.lastTeamNames,
        updatedAt: new Date().toISOString(),
      }
      return NextResponse.json(payload, { status: 200 })
    }

    // Evitar generar puntos después del final por desincronización.
    if (nowMs > end.getTime()) {
      const payload: ProgressChartResponse = {
        dataPoints: state.history,
        teamNames: state.lastTeamNames,
        updatedAt: new Date().toISOString(),
      }
      return NextResponse.json(payload, { status: 200 })
    }

    // ctfdAdminGetScoreboardTop usa next: { revalidate: 15 } internamente
    const rows = await ctfdAdminGetScoreboardTop(10)
    const teamNames = rows.map(r => r.name)

    // Backfill: si entra un equipo nuevo al top, su línea debe empezar en 0 desde el inicio.
    const newNames = teamNames.filter(n => !state.lastTeamNames.includes(n))
    if (newNames.length) {
      for (const p of state.history) {
        for (const name of newNames) {
          if (typeof (p as any)[name] !== 'number') {
            ;(p as any)[name] = 0
          }
        }
      }
    }

    const prev = state.history.length ? state.history[state.history.length - 1] : undefined
    const point: ScoreDataPoint = { timestamp: nowMs }

    // Garantizar que todos los equipos dibujados existan en el punto (continuidad)
    for (const name of teamNames) {
      const previousValue = prev && typeof (prev as any)[name] === 'number' ? (prev as any)[name] : 0
      ;(point as any)[name] = previousValue
    }

    for (const r of rows) {
      ;(point as any)[r.name] = r.score ?? 0
    }

    state.history.push(point)
    state.lastPointAtMs = nowMs

    // Mantener history completa del evento (sin recorte por defecto).
    // Si por alguna razón dura demasiado, cap por duración del evento.
    const durationMs = eventDurationMs()
    if (durationMs > 0) {
      const maxPoints = Math.ceil(durationMs / MIN_POINT_INTERVAL_MS) + 5
      if (state.history.length > maxPoints) {
        state.history.splice(0, state.history.length - maxPoints)
      }
    }

    state.lastTeamNames = teamNames

    const payload: ProgressChartResponse = {
      dataPoints: state.history,
      teamNames: state.lastTeamNames,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    console.error('[API /scoreboard/progress] Error:', error)
    return NextResponse.json({ error: 'Error al obtener el progreso del scoreboard' }, { status: 500 })
  }
}

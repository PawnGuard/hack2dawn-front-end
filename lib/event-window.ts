type EventWindow = {
  start: Date
  end: Date
}

function parseDate(value: string | undefined | null): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function computeDefaultWindow(now = new Date()): EventWindow {
  // Ventana default para pruebas: hoy 23:00 → mañana 01:00 (hora local)
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 1, 0, 0, 0)

  // Si ya pasó el fin, usar la siguiente noche
  if (now.getTime() > end.getTime()) {
    const nextStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 0, 0, 0)
    const nextEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 1, 0, 0, 0)
    return { start: nextStart, end: nextEnd }
  }

  return { start, end }
}

export function getEventWindow(): EventWindow {
  const fallback = computeDefaultWindow()

  const start =
    parseDate(process.env.EVENT_START) ??
    parseDate(process.env.NEXT_PUBLIC_EVENT_START) ??
    fallback.start

  const end =
    parseDate(process.env.EVENT_END) ??
    parseDate(process.env.NEXT_PUBLIC_EVENT_END) ??
    fallback.end

  return { start, end }
}

export function isEventOver(now = new Date()): boolean {
  const { end } = getEventWindow()
  return now.getTime() > end.getTime()
}

export function getEventWindowKey(): string {
  const { start, end } = getEventWindow()
  return `${start.getTime()}-${end.getTime()}`
}

export function eventDurationMs(): number {
  const { start, end } = getEventWindow()
  return Math.max(0, end.getTime() - start.getTime())
}

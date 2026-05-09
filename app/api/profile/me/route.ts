import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ctfdGetMyProfile, ctfdGetMySolves, ctfdGetMyFails } from '@/services/ctfd/users'
import { ctfdGetMyTeamDetailed } from '@/services/ctfd/teams'
import { ProfileDashboardData } from '@/lib/types/ctfd'

export async function GET() {
  const session = await getSession()

  if (!session?.userId || !session?.ctfdSessionCookie) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // 1. Obtener perfil, solves y fails del usuario simultáneamente (usando credenciales de usuario)
  const [user, rawSolves, rawFails] = await Promise.all([
    ctfdGetMyProfile(session.ctfdSessionCookie),
    ctfdGetMySolves(session.ctfdSessionCookie),
    ctfdGetMyFails(session.ctfdSessionCookie)
  ])

  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  // 2. Obtener nombre del equipo (si aplica)
  let teamName: string | null = null
  if (session.teamId) {
    const team = await ctfdGetMyTeamDetailed(session.ctfdSessionCookie)
    if (team) teamName = team.name
  }

  // 3. Ordenar solves del más reciente al más antiguo
  const enrichedSolves = rawSolves.sort((a: any, b: any) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // ── Cálculo de la Precisión (Accuracy) ──
  const totalSolves = rawSolves.length
  const totalFails = rawFails.length
  const totalAttempts = totalSolves + totalFails

  let accuracy = 0
  if (totalAttempts > 0) {
    // Math.round para evitar decimales infinitos (ej. 83.333% -> 83)
    accuracy = Math.round((totalSolves / totalAttempts) * 100)
  }

  // 4. Construir la respuesta final
  const payload: ProfileDashboardData = {
    id: user.id,
    username: user.name,
    email: user.email,
    affiliation: user.affiliation,
    website: user.website,
    country: user.country,
    teamId: user.team_id ?? session.teamId,
    teamName: teamName,
    score: user.score ?? 0,
    place: user.place ?? null,
    solves: enrichedSolves,
    accuracy: accuracy
  }

  return NextResponse.json(payload, { status: 200 })
}
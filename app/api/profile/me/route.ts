import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { ctfdGetUser, ctfdGetTeam, ctfdGetUserSolves, ctfdGetChallenge } from '@/lib/ctfd'
import { ProfileDashboardData } from '@/lib/types/ctfd'

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // 1. Obtener perfil del usuario
  const user = await ctfdGetUser(session.userId)
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  // 2. Obtener nombre del equipo (si pertenece a uno)
  let teamName: string | null = null
  if (user.team_id) {
    const team = await ctfdGetTeam(user.team_id)
    if (team) teamName = team.name
  }

  // 3. Obtener solves del usuario
  const rawSolves = await ctfdGetUserSolves(session.userId)

  // 4. Enriquecer los solves con el nombre y valor (puntos) del reto
  // Usamos Promise.all para hacer los fetches en paralelo
  const enrichedSolves = await Promise.all(
    rawSolves.map(async (solve) => {
      const challengeInfo = await ctfdGetChallenge(solve.challenge_id)
      return {
        id: solve.id,
        challenge_id: solve.challenge_id,
        challenge_name: challengeInfo?.name ?? solve.challenge_name ?? `Challenge #${solve.challenge_id}`,
        date: solve.date,
        value: challengeInfo?.value ?? 0, // Puntos
      }
    })
  )

  // Ordenar solves del más reciente al más antiguo
  enrichedSolves.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Construir la respuesta final
  const payload: ProfileDashboardData = {
    id: user.id,
    username: user.name,
    email: user.email,
    affiliation: user.affiliation,
    website: user.website,
    country: user.country,
    teamId: user.team_id,
    teamName: teamName,
    score: user.score ?? 0,
    place: user.place ?? null,
    solves: enrichedSolves,
  }

  return NextResponse.json(payload, { status: 200 })
}
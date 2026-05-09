import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ctfdGetChallengeDetail } from '@/lib/ctfd'
import { ctfdGetTeamFailsAdmin } from '@/services/ctfd/teams'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  const { id } = await params
  
  const challengeId = parseInt(id, 10)
  if (isNaN(challengeId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const userAuth = session?.ctfdSessionCookie
  
  // Llama a ctfdGetChallengeDetail
  const challenge = await ctfdGetChallengeDetail(challengeId, userAuth)
  
  if (!challenge) {
    return NextResponse.json({ error: 'Challenge no encontrado' }, { status: 404 })
  }

  if (session?.teamId) {
    const failsCount = await ctfdGetTeamFailsAdmin(session.teamId)
    challenge.attempts = failsCount[challengeId] || 0
  } else {
    challenge.attempts = 0
  }

  // 2. Nos aseguramos de devolver el max_attempts real
  challenge.maxAttempts = challenge.maxAttempts ?? 0

  return NextResponse.json({ challenge })
}
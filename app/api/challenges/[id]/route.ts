import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ctfdGetChallengeDetail } from '@/lib/ctfd'
import type { ChallengeDetailResponse } from '@/types/challenges'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const challengeId = Number(id)

  if (!Number.isFinite(challengeId)) {
    return NextResponse.json({ message: 'challengeId inválido' }, { status: 400 })
  }

  const session = await getSession()
  const userAuth = session.ctfdToken  // "Token abc123..."

  const challenge = await ctfdGetChallengeDetail(challengeId, userAuth)

  if (!challenge) {
    return NextResponse.json({ message: 'Challenge no encontrado' }, { status: 404 })
  }

  const result: ChallengeDetailResponse = { challenge }
  return NextResponse.json(result)
}
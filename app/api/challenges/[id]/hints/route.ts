// app/api/challenges/[id]/hints/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ctfdGetChallengeHints } from '@/services/ctfd/hints'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },  // ← tipo es Promise<>
) {
  const session = await getSession()
  if (!session?.ctfdSessionCookie) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params  // ← await antes de desestructurar

  const challengeId = parseInt(id, 10)
  if (isNaN(challengeId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const hints = await ctfdGetChallengeHints(challengeId, session.ctfdSessionCookie)
  return NextResponse.json({ hints })
}
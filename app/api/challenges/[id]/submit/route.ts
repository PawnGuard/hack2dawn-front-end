import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

const BASE = process.env.CTFD_BASE_URL!
const NGINX_SECRET = process.env.NGINX_INTERNAL_SECRET!

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session?.userId || !session?.ctfdToken) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await context.params
  const challengeId = Number(id)
  if (!Number.isFinite(challengeId)) {
    return NextResponse.json({ error: 'challengeId inválido' }, { status: 400 })
  }

  const body = await request.json() as { submission?: string }
  const submission = body.submission?.trim()
  if (!submission) {
    return NextResponse.json({ error: 'Submission vacía' }, { status: 400 })
  }

  const ctfdRes = await fetch(`${BASE}/api/v1/challenges/attempt`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${session.ctfdToken}`,
      'Content-Type': 'application/json',
      'x-internal-key': NGINX_SECRET,
    },
    body: JSON.stringify({ challenge_id: challengeId, submission }),
    cache: 'no-store',
  })

  if (!ctfdRes.ok) {
    const text = await ctfdRes.text()
    console.error('ctfd attempt error', ctfdRes.status, text.slice(0, 200))
    return NextResponse.json({ error: 'CTFd no respondió correctamente' }, { status: 502 })
  }

  // { success: true, data: { status: "correct" | "incorrect" | "already_solved", message: string } }
  const data = await ctfdRes.json() as {
    success: boolean
    data?: { status: string; message: string }
  }

  return NextResponse.json(data)
}
// ── app/api/challenges/[id]/submit/route.ts ──
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

const BASE = process.env.CTFD_BASE_URL!
const NGINX_SECRET = process.env.NGINX_INTERNAL_SECRET!

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  
  // Validamos que tengamos la cookie de sesión y el CSRF
  if (!session?.userId || !session?.ctfdSessionCookie || !session?.ctfdCsrfToken) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await context.params
  const challengeId = Number(id)
  if (!Number.isFinite(challengeId)) return NextResponse.json({ error: 'challengeId inválido' }, { status: 400 })

  const body = await request.json() as { submission?: string }
  const submission = body.submission?.trim()
  if (!submission) return NextResponse.json({ error: 'Submission vacía' }, { status: 400 })

  const ctfdRes = await fetch(`${BASE}/api/v1/challenges/attempt`, {
    method: 'POST',
    headers: {
      'Cookie': session.ctfdSessionCookie,
      'CSRF-Token': session.ctfdCsrfToken,
      'Content-Type': 'application/json',
      'x-internal-key': NGINX_SECRET,
    },
    body: JSON.stringify({ challenge_id: challengeId, submission }),
    cache: 'no-store',
  })

  const rawText = await ctfdRes.text()

  let data
  try {
    data = JSON.parse(rawText)
  } catch {
    return NextResponse.json(
      { success: false, error: 'CTFd devolvió una respuesta no válida' }, 
      { status: 500 }
    )
  }

  return NextResponse.json(data, { status: 200 })
}

/* /// TODO: Verifica también tus otros routes con [id] dinámico (/api/challenges/[id]/submit/route.ts, /api/hints/[id]/unlock/route.ts) y aplica el mismo patrón en todos:

typescript
// Patrón correcto para TODOS tus routes con params en Next.js 15
{ params }: { params: Promise<{ id: string }> }
const { id } = await params
 */
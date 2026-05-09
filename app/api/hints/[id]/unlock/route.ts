// app/api/hints/[id]/unlock/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ctfdGetHint, ctfdUnlockHint } from '@/services/ctfd/hints'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()

  if (!session?.ctfdSessionCookie) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (!session?.ctfdCsrfToken) {
    return NextResponse.json(
      { error: 'CSRF token no disponible. Vuelve a iniciar sesión.' },
      { status: 403 },
    )
  }

  const { id } = await params
  const hintId = parseInt(id, 10)

  if (isNaN(hintId)) {
    return NextResponse.json({ error: 'ID de hint inválido' }, { status: 400 })
  }

  // 1. Intentamos desbloquear la pista
  const unlockRes = await ctfdUnlockHint(
    hintId,
    session.ctfdSessionCookie,
    session.ctfdCsrfToken,
  )

  // 2. Si falla PORQUE YA ESTABA DESBLOQUEADA, lo tratamos como un "éxito" implícito
  if (!unlockRes.success) {
    const isAlreadyUnlocked = unlockRes.error?.includes('ya fue desbloqueada') || 
                              unlockRes.error?.includes('already unlocked')
    
    if (!isAlreadyUnlocked) {
      // Si el error es falta de puntos u otra cosa, sí rechazamos la petición
      return NextResponse.json({ error: unlockRes.error }, { status: 400 })
    }
  }

  // 3. Si se desbloqueó ahorita, o si ya estaba desbloqueada desde antes,
  // procedemos a obtener el contenido.
  const hint = await ctfdGetHint(hintId, session.ctfdSessionCookie)

  if (!hint?.content) {
    return NextResponse.json(
      { error: 'Hint procesado pero el contenido no está disponible.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, content: hint.content })
}
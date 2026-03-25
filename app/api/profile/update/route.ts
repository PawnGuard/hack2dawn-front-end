import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { ctfdUpdateUser } from '@/lib/ctfd'

export async function PATCH(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { username, affiliation, website } = await req.json()

  const payload: { name?: string; affiliation?: string; website?: string } = {}

  if (username?.trim()) {
    if (username.trim().length < 3) {
      return NextResponse.json({ field: 'username', error: 'Mínimo 3 caracteres' }, { status: 400 })
    }
    payload.name = username.trim()
  }

  if (affiliation !== undefined) payload.affiliation = affiliation.trim()
  if (website !== undefined) payload.website = website.trim()

  const result = await ctfdUpdateUser(session.userId, payload)

  if (!result.success) {
    if (result.errors?.name) {
      return NextResponse.json({ field: 'username', error: 'Este nombre de usuario ya está en uso' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al actualizar el perfil' }, { status: 500 })
  }

  // Si el nombre cambió exitosamente, actualizar la sesión
  if (payload.name) {
    session.username = payload.name
    await session.save()
  }

  return NextResponse.json({ ok: true, user: result.data }, { status: 200 })
}
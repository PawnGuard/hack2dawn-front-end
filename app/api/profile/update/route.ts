// app/api/profile/update/route.ts
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ctfdUpdateUser } from '@/lib/ctfd'

export async function PATCH(req: Request) {
  const session = await getSession()

  if (!session?.userId) {
    return NextResponse.json({ error: 'No autenticado o sesión expirada' }, { status: 401 })
  }

  const { username, affiliation, website } = await req.json()
  const payload: { name?: string; affiliation?: string; website?: string } = {}

  if (username?.trim()) {
    if (username.trim().length < 3) {
      return NextResponse.json({ field: 'username', error: 'Mínimo 3 caracteres' }, { status: 400 })
    }
    payload.name = username.trim()
  }

  if (affiliation !== undefined) {
    payload.affiliation = affiliation.trim()
  }

  // Saneamiento mágico para el campo website
  if (website !== undefined) {
    let cleanWebsite = website.trim()
    
    // Si el usuario escribió algo y se le olvidó el http/https, se lo inyectamos
    if (cleanWebsite.length > 0 && !/^https?:\/\//i.test(cleanWebsite)) {
      cleanWebsite = `https://${cleanWebsite}`
    }
    
    payload.website = cleanWebsite
  }

  try {
    const result = await ctfdUpdateUser(session.userId, payload)

    if (!result.success) {
      // Manejar el caso en el que el nombre ya esté tomado
      if (result.errors?.name) {
        return NextResponse.json({ field: 'username', error: 'Este nombre de usuario ya está en uso' }, { status: 400 })
      }
      
      // Si CTFd nos responde 400 con un error de website (URL inválida)
      if (result.errors?.website) {
         return NextResponse.json({ field: 'website', error: 'Ingresa una URL válida (ej: https://github.com/tec)' }, { status: 400 })
      }
      
      return NextResponse.json({ error: 'Error al actualizar el perfil' }, { status: 500 })
    }

    if (payload.name) {
      session.username = payload.name
      await session.save()
    }

    return NextResponse.json({ ok: true, user: result.data }, { status: 200 })

  } catch (error) {
    return NextResponse.json({ error: 'Falla de comunicación con el servidor CTFd' }, { status: 500 })
  }
}
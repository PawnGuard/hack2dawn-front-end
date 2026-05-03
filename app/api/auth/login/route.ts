import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ctfdGetUserTeam, ctfdVerifyCredentials, ctfdGetUser, ctfdGetOrCreateUserToken } from '@/lib/ctfd'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { identifier, password } = body as {
      identifier: string   // username o email
      password: string
    }

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Credenciales requeridas' },
        { status: 400 },
      )
    }

    // ── Verificar credenciales contra CTFd via Basic Auth ───────
    const verifyResult = await ctfdVerifyCredentials(identifier, password)

    if (!verifyResult) {
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 },
      )
    }

    // Extraemos el user real y su cookie de sesión exclusiva
    const { user, sessionCookie, csrfToken } = verifyResult

    if (user.banned) {
      return NextResponse.json(
        { error: 'Esta cuenta ha sido suspendida' },
        { status: 403 },
      )
    }
    
    // 2. Obtener datos extra (admin status, teamId)
    const fullUser = await ctfdGetUser(user.id);
    const isAdmin = fullUser ? fullUser.type === 'admin' : false;
    const teamId = await ctfdGetUserTeam(user.id)
    
    // 3. Crear el Personal Token del usuario usando SU cookie, no la del Admin
    const ctfdToken = await ctfdGetOrCreateUserToken(sessionCookie, csrfToken)

    // ── Crear sesión ────────────────────────────────────────────
    const session = await getSession()
    session.userId    = user.id
    session.username  = user.name
    session.email     = user.email
    session.isAdmin   = isAdmin
    session.teamId    = teamId
    session.ctfdToken = ctfdToken ?? undefined // YA NO SE USA
    session.ctfdSessionCookie = sessionCookie
    session.ctfdCsrfToken = csrfToken

    if (process.env.DEBUG_SESSION_COOKIE === 'true') {
      console.log('[login][session-before-save]', {
        userId:    session.userId,
        username:  session.username,
        isAdmin:   session.isAdmin,
        hasToken:  !!session.ctfdToken, // No imprimas el token en consola por seguridad
      })
    }

    await session.save()

    return NextResponse.json({
      success: true,
      user: {
        id:      user.id,
        name:    user.name,
        email:   user.email,
        isAdmin: session.isAdmin,
        teamId:  teamId,
      },
    })
  } catch (err) {
    console.error('[login]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/* La integración con CTFd no utiliza Personal Access Tokens para los usuarios finales. En su lugar, el backend de Next.js actúa como un proxy inverso inteligente:

Al hacer login, el servidor realiza un web-scraping ligero al portal de CTFd para realizar un inicio de sesión nativo.

Se extrae la cookie de sesión (session=...) y el Token CSRF rotado tras la autenticación.

Estos credenciales se encriptan y guardan en la sesión del usuario (Iron Session).

Cualquier interacción protegida (como enviar una flag o comprar un hint) se envía firmada con la Cookie y el CSRF del usuario, garantizando que el scoreboard y los logs de CTFd reflejen la identidad real del jugador y su equipo.

 */
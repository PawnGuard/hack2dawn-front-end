# Hack2Dawn CTF 2026 — Autenticación e Integración con CTFd

> Documentación técnica de la capa de autenticación del frontend Next.js integrado con CTFd via REST API.

---

## Índice

1. [Arquitectura General](#arquitectura-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Variables de Entorno](#variables-de-entorno)
4. [Estructura de Archivos](#estructura-de-archivos)
5. [lib/ctfd.ts — Cliente HTTP de CTFd](#libctfdts--cliente-http-de-ctfd)
6. [lib/session.ts — Gestión de Sesiones](#libsessionts--gestión-de-sesiones)
7. [Flujo de Registro (SignUp)](#flujo-de-registro-signup)
8. [Flujo de Login (SignIn)](#flujo-de-login-signin)
9. [Flujo de Creación de Equipo](#flujo-de-creación-de-equipo)
10. [Middleware — Protección de Rutas](#middleware--protección-de-rutas)
11. [UserContext — Estado del Usuario en React](#usercontext--estado-del-usuario-en-react)
12. [Decisiones de Arquitectura](#decisiones-de-arquitectura)
13. [Problemas Resueltos Durante el Desarrollo](#problemas-resueltos-durante-el-desarrollo)

---

## Arquitectura General

```
BROWSER                      VERCEL (Servidor)                    VPS (CTFd)
───────────────────────      ─────────────────────────────────    ──────────────────────
SignUp.tsx / SignIn.tsx       app/api/auth/register/route.ts
  fetch('/api/auth/...')  →   app/api/auth/login/route.ts      →  CTFd API
                              app/api/teams/create/route.ts        api.hack.pawnguard.org
                                    ↓
                              lib/ctfd.ts (cliente HTTP)
                                    ↓
                              lib/session.ts (iron-session)
                                    ↓ Set-Cookie httpOnly
Cookie httpOnly ←────────────── hack2dawn_session=Fe26.2**...

Cada request siguiente:
  Browser envía cookie → middleware.ts → descifra → decide redirección
                       → app/layout.tsx → getSessionUser() → UserProvider
                       → useUser() disponible en toda la app sin fetch extra
```

**Por qué esta arquitectura**: El browser nunca habla directamente con CTFd. Todos los tokens de administrador y secrets viven exclusivamente en Vercel (servidor), nunca en el bundle del cliente. El browser solo conoce la respuesta JSON y la cookie httpOnly cifrada.

---

## Stack Tecnológico

| Tecnología | Rol |
|---|---|
| Next.js 14+ App Router | Framework frontend + backend (Route Handlers) |
| iron-session | Gestión de sesiones cifradas en cookies httpOnly |
| CTFd REST API | Backend de CTF (usuarios, equipos, retos, scoring) |
| Nginx (VPS) | Proxy reverso con autenticación por header `x-internal-key` |
| TypeScript | Tipado estático en toda la capa de integración |

---

## Variables de Entorno

```bash
# .env.local — NUNCA commitear al repositorio
CTFD_BASE_URL=https://api.hack.pawnguard.org    # Sin / al final
CTFD_ADMIN_TOKEN=tu_token_admin_aqui             # Sin prefijo "Token ", solo el valor
NGINX_INTERNAL_SECRET=tu_secreto_nginx_aqui      # Valor exacto configurado en el VPS
SESSION_SECRET=minimo_32_caracteres_aleatorios   # Para iron-session AES-256
```

**Regla de naming de Next.js**: cualquier variable sin prefijo `NEXT_PUBLIC_` nunca llega al bundle del browser. `process.env.CTFD_ADMIN_TOKEN` en un Route Handler = seguro. En un Client Component = `undefined`.

---

## Estructura de Archivos

```
app/
├── api/
│   ├── auth/
│   │   ├── register/route.ts    # POST — crea usuario en CTFd + crea sesión
│   │   └── login/route.ts       # POST — verifica credenciales + crea sesión
│   └── teams/
│       └── create/route.ts      # POST — crea equipo + agrega miembro + capitán
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
└── layout.tsx                   # Lee sesión en servidor → pasa a UserProvider

lib/
├── ctfd.ts                      # Cliente HTTP: todas las llamadas a CTFd API
├── session.ts                   # Config de iron-session + helper getSessionUser()
└── types/
    └── ctfd.ts                  # Interfaces TypeScript: CTFdUser, CTFdTeam, CTFdResponse<T>

context/
└── UserContext.tsx              # useState + useContext para datos del usuario en cliente

middleware.ts                    # Protección de rutas — corre antes de cada render

components/auth/
├── SignIn.tsx                   # Formulario de login (Client Component)
├── SignUp.tsx                   # Formulario de registro (Client Component)
├── auth-background.tsx          # Fondo compartido
└── auth-ui.tsx                  # Componentes visuales reutilizables
```

---

## lib/ctfd.ts — Cliente HTTP de CTFd

Centraliza toda comunicación con la API de CTFd. Ningún Route Handler importa `fetch` directamente — todo pasa por este módulo.

### Headers comunes

```ts
function ctfdHeaders(): HeadersInit {
  return {
    'Authorization': `Token ${ADMIN_TOKEN}`,  // Token con T mayúscula, exacto
    'Content-Type': 'application/json',
    'x-internal-key': NGINX_SECRET,            // Header requerido por Nginx en el VPS
  }
}
```

**Por qué `x-internal-key`**: El VPS tiene Nginx configurado para rechazar con 403 cualquier request que no incluya este header con el valor correcto. Es una capa de seguridad de red que evita que CTFd sea accesible directamente desde internet sin pasar por el proxy.

### Funciones implementadas

```ts
ctfdCreateUser(payload)          // POST /api/v1/users — requiere admin token
ctfdVerifyCredentials(u, p)      // Flujo de login via formulario HTML de CTFd
ctfdGetUser(userId)              // GET /api/v1/users/{id}
ctfdGetUserTeam(userId)          // GET /api/v1/users/{id} → extrae team_id
ctfdCreateTeam(payload)          // POST /api/v1/teams
ctfdAddTeamMember(teamId, userId) // POST /api/v1/teams/{id}/members
ctfdSetTeamCaptain(teamId, userId) // PATCH /api/v1/teams/{id}
generateUniqueTeamCode()         // Genera código alfanumérico de 6 chars con crypto.getRandomValues
```

### Por qué no hay endpoint de login en CTFd

CTFd no tiene un endpoint `POST /api/v1/login`. El sistema fue diseñado para su propia UI web. Basic Auth tampoco funciona en sus endpoints (devuelve 401 consistentemente). La solución implementada usa el formulario HTML de CTFd como verificador de credenciales:

```
GET  /login          → extrae el nonce CSRF del HTML
POST /login (form)   → CTFd verifica username:password internamente
                       → si son válidos: redirect 302 a /challenges
                       → si son inválidos: redirect 302 a /login
GET  /api/v1/users/me con la session cookie del redirect exitoso
                       → devuelve datos del usuario (confirmado: CTFd issue #2020)
```

Fuente: [CTFd issue #2020](https://github.com/CTFd/CTFd/issues/2020) y [CTFd issue #2575](https://github.com/CTFd/CTFd/issues/2575).

---

## lib/session.ts — Gestión de Sesiones

Usa **iron-session** para crear cookies httpOnly cifradas con AES-256.

```ts
export interface SessionData {
  userId: number
  username: string
  email: string
  isAdmin: boolean
  teamId: number | null
}

export const sessionOptions: SessionOptions = {
  password: SESSION_PASSWORD,        // Mínimo 32 caracteres
  cookieName: 'hack2dawn_session',
  cookieOptions: {
    httpOnly: true,    // JS del browser no puede leerla (inmune a XSS)
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',   // Protección anti-CSRF
  },
}
```

**Por qué iron-session y no JWT en localStorage**:

| Aspecto | JWT en localStorage | iron-session (httpOnly) |
|---|---|---|
| Legible por JS | ✅ Sí (riesgo XSS) | ❌ No (inmune a XSS) |
| Modificable por usuario | ✅ Sí (riesgo isAdmin) | ❌ No (AES-256 + HMAC) |
| Disponible en Middleware | ❌ No | ✅ Sí |
| Flash visual al recargar | ❌ Sí | ✅ No (SSR) |

`isAdmin: false` modificado a `true` en localStorage permitiría acceder al panel admin desde React. La cookie cifrada previene esto porque el servidor verifica la firma HMAC en cada request.

---

## Flujo de Registro (SignUp)

```
1. SignUp.tsx valida en cliente:
   - username: 3-20 chars, sin espacios (regex /\s/)
   - email: formato válido (regex)
   - password: mínimo 8 chars
   - confirm: coincide con password

2. fetch POST /api/auth/register

3. Route Handler valida en servidor (nunca confiar solo en cliente):
   - mismas validaciones que el cliente

4. ctfdCreateUser() → POST /api/v1/users con admin token
   Body: { name, email, password, type: "user", verified: true, ... }
   ↑ verified: true es crítico — usuarios con verified: false
     no pueden autenticarse después

5. CTFd devuelve el usuario creado con su id

6. iron-session.save():
   { userId, username, email, isAdmin: false, teamId: null }
   → cookie httpOnly cifrada en el browser

7. router.push('/dashboard') → Middleware intercepta
   → teamId = null → redirect a /dashboard/team/select
```

**Manejo de errores del servidor**:
CTFd devuelve `errors.name` si el username existe y `errors.email` si el email existe. El Route Handler traduce esto a `{ field: 'name' | 'email', error: string }` para que el frontend muestre el error en el input correcto.

---

## Flujo de Login (SignIn)

```
1. SignIn.tsx valida en cliente:
   - campos no vacíos

2. fetch POST /api/auth/login

3. Route Handler llama ctfdVerifyCredentials(identifier, password):

   Paso 1 — GET /login (de CTFd):
     → Extrae nonce CSRF del HTML con regex:
       html.match(/name="nonce"\s+value="([^"]+)"/) ||
       html.match(/id="nonce"[^>]+value="([^"]+)"/) ||
       html.match(/value="([^"]+)"\s+name="nonce"/)
     ↑ Tres patrones porque CTFd puede variar el orden de atributos
       según la versión del servidor

   Paso 2 — POST /login (formulario):
     Body: name=username&password=pass&nonce=XXXX&_submit=Submit
     redirect: 'manual' (no seguir el redirect automáticamente)
     → 302 + Location: /challenges = credenciales válidas ✅
     → 302 + Location: /login = credenciales inválidas ❌

   Paso 3 — Extraer session cookie de CTFd del header Set-Cookie

   Paso 4 — GET /api/v1/users/me con esa session cookie:
     → CTFd acepta su propia session cookie de Flask en la API
     → Devuelve datos completos del usuario
     → La session cookie de CTFd se descarta después de este paso

4. ctfdGetUserTeam(user.id) → obtiene teamId actual

5. iron-session.save():
   { userId, username, email, isAdmin, teamId }

6. router.push('/dashboard') → Middleware decide destino final
```

---

## Flujo de Creación de Equipo

CTFd requiere **3 llamadas en orden** — no hay un solo endpoint que cree equipo + asigne miembro + asigne capitán:

```
1. POST /api/v1/teams
   Body: { name, password: teamCode, hidden: false, banned: false }
   → Devuelve team.id (sin miembros aún, captain_id = null)

2. POST /api/v1/teams/{id}/members
   Body: { user_id: session.userId }
   → CTFd actualiza user.team_id = team.id en su DB

3. PATCH /api/v1/teams/{id}
   Body: { captain_id: session.userId }
   → CTFd actualiza team.captain_id

4. session.teamId = team.id → session.save()
   → Middleware ya no redirigirá a /team/select en futuros requests
```

### Generación automática del código de equipo

El usuario solo escribe el nombre del equipo. La contraseña se genera automáticamente con `crypto.getRandomValues` (criptográficamente seguro, built-in de Node.js):

```ts
const CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
// 36^6 = 2,176,782,336 combinaciones posibles
// Con ~100 equipos la probabilidad de colisión es prácticamente cero
```

El código generado se devuelve al frontend para que el capitán lo comparta con sus compañeros.

---

## Middleware — Protección de Rutas

Corre en el **Edge de Vercel** antes de cada request, antes de que React renderice.

```ts
// Descifra la cookie con unsealData (solo lectura — sin escribir)
session = await unsealData(cookieValue, { password: SESSION_PASSWORD })

const isLoggedIn = Boolean(session.userId)
const hasTeam    = session.teamId !== null && session.teamId !== undefined
const isAdmin    = session.isAdmin === true
```

### Reglas de redirección

| Situación | Resultado |
|---|---|
| En `/login` o `/register` + logueado + sin equipo | → `/dashboard/team/select` |
| En `/login` o `/register` + logueado + con equipo | → `/home` |
| Ruta protegida + no logueado | → `/login?next=<ruta>` |
| `/home` o `/challenges` + logueado + sin equipo | → `/dashboard/team/select` |
| `/dashboard` + logueado + sin equipo | → `/dashboard/team/select` |
| Ruta `/admin` + no admin | → `/home` |

**Por qué en Middleware y no en cada página**: Single source of truth para redirecciones. Si la lógica viviera en cada componente, un cambio de regla requeriría tocar múltiples archivos. El Middleware garantiza que ninguna ruta protegida sea accesible sin importar cómo el usuario llegue a ella.

---

## UserContext — Estado del Usuario en React

### El problema que resuelve

Client Components no pueden leer cookies httpOnly (por diseño — JS no tiene acceso). Sin UserContext, cada componente que necesite saber quién está logueado tendría que hacer un fetch a `/api/auth/me`, creando:

- Flash visual (UI vacía → datos → re-render)
- Múltiples fetches en cada carga de página
- Latencia acumulada en cascada

### La solución

```
app/layout.tsx (Server Component)
  → getSessionUser() descifra la cookie en el servidor
  → pasa datos como prop initialUser al UserProvider
  → useState(initialUser) — empieza con datos, sin fetch

Client Components:
  const { user } = useUser()  → datos disponibles desde el frame 0
```

**Por qué no se pierden los datos al recargar**: En cada recarga, `app/layout.tsx` se re-ejecuta en el servidor, descifra la cookie, y reinicializa el contexto con `initialUser`. El contexto no empieza vacío — empieza con los datos del servidor.

**El único caso que requiere atención**: navegación client-side sin `router.refresh()`. Después de login/register siempre se llama `router.refresh()` para forzar la re-ejecución de los Server Components y que `UserProvider` reciba los datos frescos de la nueva sesión.

---

## Decisiones de Arquitectura

### Admin token solo en el servidor

El `CTFD_ADMIN_TOKEN` vive en `.env.local` (sin prefijo `NEXT_PUBLIC_`). Next.js garantiza que nunca entre al bundle del cliente. El browser solo habla con los Route Handlers de Vercel — nunca con CTFd directamente.

### Proxy pattern en Route Handlers

```
Browser → /api/auth/login (Vercel) → CTFd
```

Ventajas: oculta tokens, resuelve CORS, permite validación adicional antes de llegar a CTFd, y centraliza el manejo de errores.

### verified: true al crear usuarios

CTFd bloquea la autenticación de usuarios con `verified: false` cuando la instancia tiene verificación de email activa. Como Hack2Dawn no usa verificación por email (registro controlado), todos los usuarios se crean con `verified: true` directamente.

### Session cookie de CTFd como verificador de login

CTFd no tiene `POST /api/v1/login` ni acepta Basic Auth. El workaround documentado en el repositorio oficial (issue #2020) es usar la session cookie de Flask que CTFd devuelve en el redirect de login exitoso para llamar a `GET /api/v1/users/me`. Esta session cookie se usa una sola vez para obtener los datos del usuario y se descarta — iron-session toma el control a partir de ahí.

---

## Problemas Resueltos Durante el Desarrollo

| Problema | Causa | Solución |
|---|---|---|
| 403 en todas las llamadas | Header `x-internal-key` incorrecto (se usaba `x-internal-token`) | Corregir nombre del header en `ctfdHeaders()` |
| 403 con JSON de CTFd | `TOKEN` en mayúsculas en `Authorization` | Cambiar a `Token` (case-sensitive) |
| 401 al loguearse | Usuario creado con `verified: false` | Crear usuarios con `verified: true` |
| 401 en Basic Auth | CTFd no implementa Basic Auth en ningún endpoint de la API | Usar flujo de formulario HTML con nonce CSRF |
| Regex del nonce falla | CTFd varía el orden de atributos del input según la versión | Tres patrones de regex en paralelo con `||` |
| `/dashboard` da 404 sin equipo | Ruta no estaba en `requiresTeam` del Middleware | Agregar `/dashboard` a las rutas que requieren equipo |
| Contexto vacío en navegación client-side | `router.push` sin `router.refresh()` | Siempre llamar `router.refresh()` después de login/register |

---

*Generado el 22 de marzo de 2026 — Hack2Dawn CTF 2026*

# Scoreboard — Cambios implementados (resumen)

Este documento resume los cambios implementados durante esta conversación para:
- Obtener el scoreboard desde CTFd vía rutas internas de Next.js.
- Renderizar Top10 + gráfica en `Home`.
- Habilitar resultados finales con todos los equipos en `/scoreboard`.
- Hacer colores consistentes y dinámicos.
- Mejorar “casi real‑time” sin saturar CTFd.

> Nota: este repo usa **Next.js App Router**. Las rutas internas viven en `app/api/**/route.ts`.

---

## 1) Endpoints internos añadidos/actualizados

### Top 10 (autenticado)
- Endpoint: `GET /api/scoreboard/top?count=10`
- Archivo: `app/api/scoreboard/top/route.ts`
- Requiere sesión (`iron-session`): si no hay `session.userId` o `session.ctfdSessionCookie` responde `401`.
- Antes del inicio del evento: responde vacío sin consultar CTFd.
- Durante el evento: consulta CTFd y devuelve un formato “custom” (`ScoreboardResponse`).
- Después del fin del evento: congela (sirve el último snapshot).

### Progreso (gráfica Top10 — autenticado)
- Endpoint: `GET /api/scoreboard/progress`
- Archivo: `app/api/scoreboard/progress/route.ts`
- Requiere sesión igual que Top10.
- Genera una serie temporal (timeline) en memoria.
- Throttle de puntos: 1 punto cada ~3s.
- El eje X de la gráfica se visualiza con rango fijo: **inicio → fin** del evento (no “auto-zoom” por los puntos disponibles).
- Seed + backfill:
  - Crea un punto inicial en el inicio del evento con 0.
  - Si aparece un equipo nuevo en el top, se “rellena” hacia atrás con 0 para que su línea inicie desde el principio.
- Después del fin del evento: congela (no agrega más puntos).

### Scoreboard público (todos los equipos)
- Endpoint: `GET /api/scoreboard/public`
- Archivo: `app/api/scoreboard/public/route.ts`
- **No requiere sesión**.
- Implementado como endpoint “server-to-server” usando CTFd admin (token en `.env`), para poder listar a todos los equipos.
- Antes del inicio: responde vacío.
- Durante: cachea en intervalos cortos.
- Después: congela y cachea más tiempo.

---

## 2) Servicio de CTFd (scoreboard)

- Archivo: `services/ctfd/scoreboard.ts`
- Responsabilidades:
  - Normaliza respuestas de CTFd (soporta `[{...}]` y `{ success: true, data: [...] }`).
  - Fallbacks de endpoint:
    - Top: intenta `/api/v1/scoreboard/top/:n` y luego `/scoreboard/top/:n`.
    - Full: intenta `/api/v1/scoreboard` y luego `/scoreboard`.
- Funciones relevantes:
  - `ctfdGetScoreboardTop(sessionCookie, count)` (usuario autenticado)
  - `ctfdGetTeamSolvesCount(sessionCookie, teamId)` (para “Flags” en Top10)
  - `ctfdAdminGetScoreboardAll()` (para scoreboard público final)

---

## 3) UI: Top10, gráfica y resultados finales

### Home
- `Home` ya renderiza:
  - `components/shared/ProgressChart.tsx`
  - `components/shared/ScoreboardTop10.tsx`

### `/scoreboard` (resultados finales)
- Página pública con scoreboard completo:
  - Archivo: `app/(public)/scoreboard/page.tsx`
  - Renderiza: `ScoreboardTop10 variant="all"`

### `ScoreboardTop10` ahora soporta variantes
- Archivo: `components/shared/ScoreboardTop10.tsx`
- `variant="top10"` (default): usa `GET /api/scoreboard/top`.
- `variant="all"`: usa `GET /api/scoreboard/public`.
  - En `all` se oculta la columna “Flags” (no se calcula solves por equipo para todos).

### Polling (casi real-time)
- `ScoreboardTop10` (top10) y `ProgressChart` hacen polling cada ~3s durante el evento.
- Fuera del evento:
  - Antes: no poll (muestra placeholder de “aún no inicia”).
  - Después: hace 1 fetch (intervalo desactivado) y queda congelado.

---

## 4) Colores de equipos (dinámicos y consistentes)

- Archivo: `lib/team-color.ts`
- `getTeamColor(teamName)` genera un color **HSL determinístico** a partir del nombre.
- Propiedad clave: escala a N equipos (50+), no depende de una paleta fija de 10.
- Se usa tanto en:
  - `ScoreboardTop10` (punto + barra lateral)
  - `ProgressChart` (líneas)

---

## 5) Ventana del evento (fechas) y congelamiento

- Archivo: `lib/event-window.ts`
- Las fechas se leen en este orden:
  1) `EVENT_START` / `EVENT_END`
  2) `NEXT_PUBLIC_EVENT_START` / `NEXT_PUBLIC_EVENT_END`
  3) Fallback: ventana de prueba local (23:00 → 01:00)

Efectos de las fechas:
- Los endpoints de scoreboard usan esa ventana para:
  - No consultar CTFd antes de iniciar.
  - Congelar después de terminar.
- Para permitir “reset” al cambiar fechas desde env, hay un `getEventWindowKey()` que resetea caches en caliente.

---

## 6) ¿Dónde se guarda el cache / último snapshot del score?

Está guardado **en memoria (RAM) del runtime de Next.js**, como variables module‑scope.

### Top10
- Archivo: `app/api/scoreboard/top/route.ts`
- Estado en memoria:
  - `state.lastPayload`: **último snapshot** del Top10 (lo que se devuelve al cliente)
  - `state.cacheUntilMs`: TTL corto (~2s)
  - `state.flagsCache`: cache de solves/flags por equipo (~60s)
  - `state.lastPositions`: para flechas de subida/bajada

### Gráfica
- Archivo: `app/api/scoreboard/progress/route.ts`
- Estado en memoria:
  - `state.history`: **historia completa** de puntos de la gráfica
  - `state.lastPointAtMs`: throttle
  - `state.lastTeamNames`: series dibujadas

### Público (todos)
- Archivo: `app/api/scoreboard/public/route.ts`
- Estado en memoria:
  - `state.lastPayload`: snapshot del scoreboard público
  - `state.cacheUntilMs`: TTL durante/after

Implicaciones:
- No es persistente: si reinicias el proceso, se pierde.
- En serverless/multi-instancia puede haber caches distintos por instancia.

---

## 7) Limpieza realizada

- Se removieron mocks/exports estáticos de scoreboard del cliente (para no mezclar datos falsos con datos reales): `lib/api/scoreboard.ts`.
- Se eliminó `isEventStarted()` (no se usaba) en `lib/event-window.ts`.

---

## 8) Nota sobre `proxy.ts` (middleware)

- Existe `proxy.ts` con lógica tipo middleware.
- **Pero Next.js solo ejecuta middleware si existe `middleware.ts` en la raíz**.
- En el estado actual, no hay `middleware.ts`, así que `proxy.ts` **no se ejecuta automáticamente**.
- Además, `proxy.ts` usa `EVENT_START/END` directamente (no `lib/event-window.ts`), por lo que puede divergir si no mantienes esas env vars.

# Modulo Challenges - Implementacion

Este modulo implementa la pagina de retos en `app/(app)/challenges` y su vista por slug en `app/(app)/challenges/[slug]`, con estilo cyber/synth alineado al proyecto.

## Archivos creados/actualizados

- `app/(app)/challenges/page.tsx`
- `app/(app)/challenges/[slug]/page.tsx`
- `app/api/ctfd/challenges/route.ts`
- `app/api/v1/challenges/[challengeId]/route.ts`
- `types/challenges.ts`
- `lib/challenges-mock.ts`
- `middleware.ts`
- `.env.example`

## Cobertura de requerimientos

### RF-CHAL-01 Historia

- Seccion superior de briefing con narrativa tipo "transmision interceptada".
- Animacion typewriter al primer acceso.
- Al volver a la ruta en la misma sesion, se muestra lore completo sin repetir animacion.
- Persistencia con `sessionStorage` usando la llave `challenges:lore-played`.
- Icono tematico con `TerminalSquare`.

### RF-CHAL-02 Path challenges

- Render de retos en mapa visual progresivo (trayectoria en zig-zag).
- Cada tarjeta muestra:
  - Nombre
  - Categoria con badge por color
  - Dificultad Easy/Medium/Hard/Insane con codificacion visual
  - Estado (AVAILABLE / IN PROGRESS / COMPLETADO)
  - Timestamp cuando esta completado
- Click en tarjeta abre modal con detalle del reto.
- Datos vienen de `GET /api/ctfd/challenges`.

### RF-CHAL-03 Panel de progreso personal (equipo)

- Widget sticky superior:
  - "X de Y retos completados"
  - Barra de progreso
  - Puntaje total del equipo
  - Posicion actual del equipo con enlace a `/home`
- Polling periodico para actualizacion.
- Animacion `+X pts` cuando sube el puntaje.

### RF-CHAL-04 First Blood

- Indicador visual de First Blood en tarjetas y modal.
- Muestra equipo y timestamp cuando existe.
- Si no existe, se muestra estado pendiente.

### RF-CHAL-05 Modal / Vista del reto

- Modal overlay estilo "expediente clasificado".
- Incluye:
  - Nombre, categoria y dificultad
  - Mini historia/lore
  - Tipo de lab
  - Puntos
  - Flags: `captured / total`
  - Indicador visual de dificultad
  - First Blood (si aplica)
  - Estado completado por equipo
  - Boton principal:
    - `IR AL LAB`
    - `VER SOLUCION` cuando esta completado
- Cierre por:
  - Boton X
  - Tecla Escape
  - Click fuera del modal

## Endpoints implementados

### `GET /api/ctfd/challenges`

- Proxy parcial para CTFd cuando hay variables:
  - `CTFD_API_URL`
  - `CTFD_API_TOKEN`
- Si no existen variables o falla CTFd, usa fallback mock de `lib/challenges-mock.ts`.
- Retorna retos + progreso de equipo.

### `GET /api/v1/challenges/[challengeId]`

- Trae detalle de un reto por id desde CTFd.
- Si falla o no hay config, usa fallback mock.

## Reglas de negocio implementadas

- Challenges visibles solo despues de iniciar CTF:
  - `middleware.ts` redirige `/challenges` a `/home` si `now < NEXT_PUBLIC_CTF_START`.
- Lore se reproduce una sola vez por sesion de navegacion.
- El progreso mostrado corresponde a equipo (no usuario individual) dentro del modelo actual.

## Nota de integracion real CTFd

Para datos reales, definir en `.env`:

- `CTFD_API_URL`
- `CTFD_API_TOKEN`

Sin esos valores, el modulo se mantiene funcional con datos mock para desarrollo.

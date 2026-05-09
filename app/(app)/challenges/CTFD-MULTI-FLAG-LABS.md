# CTFd Multi-Flag (Virtual Labs) Implementation Guide

## Resumen

CTFd por defecto trata cada flag como un "Challenge" independiente. Para emular la experiencia de plataformas como HackTheBox o TryHackMe —donde un "Laboratorio" o "Máquina" agrupa múltiples flags con progreso visual (ej. 0/4 flags)— se implementó un motor de agrupación en el frontend de Next.js y el backend (`ctfd.ts`).

Esta implementación agrupa los sub-retos basándose en **Tags** específicos y genera una vista de "Máquina Virtual" donde el Lab resume todos los puntos y oculta que son retos independientes hasta que el usuario entra al laboratorio.

---

## 1. Configuración en CTFd (Admin Panel)

Para crear una máquina virtual con múltiples banderas, debes crear **un Challenge individual por cada bandera** y agregar tres (3) tags obligatorias a cada uno:

| Challenge | Tag 1 (Continente) | Tag 2 (Máquina) | Tag 3 (Step) |
|---|---|---|---|
| Lab Alpha - User | `continent:Asia` | `machine:alpha` | `step:1` |
| Lab Alpha - Root | `continent:Asia` | `machine:alpha` | `step:2` |

**Reglas de CTFd:**
1. Las etiquetas deben escribirse exactamente con los dos puntos (`:`).
2. **NO usar los "Requirements" de CTFd.** Si la Flag 2 "requiere" la Flag 1, CTFd ocultará la Flag 2 de la API pública y el frontend no podrá sumar los totales ni ver el número real de flags ("Flags: 0/2"). Las flags deben estar todas Visibles.

---

## 2. Parsing en `ctfd.ts`

Se crearon parsers especializados para capturar estas métricas durante el listado maestro de retos:

```typescript
function parseMachineTag(tags: CTFdTag[] | undefined | null): string | null {
  if (!tags || tags.length === 0) return null
  const values = tags
    .map(t => (typeof t === 'string' ? t : t?.value))
    .filter((v): v is string => typeof v === 'string' && v.length > 0)

  return values.find(v => v.toLowerCase().startsWith('machine:'))
    ?.slice('machine:'.length).trim() ?? null
}

function parseStepTag(tags: CTFdTag[] | undefined | null): number | null {
  if (!tags || tags.length === 0) return null
  const values = tags
    .map(t => (typeof t === 'string' ? t : t?.value))
    .filter((v): v is string => typeof v === 'string' && v.length > 0)

  const raw = values.find(v => v.toLowerCase().startsWith('step:'))
    ?.slice('step:'.length).trim()

  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}
```

La función `ctfdGetChallengeListDual` inyecta `machineId` y `step` en cada `ChallengeSummary`.

---

## 3. Agrupación y Mapeo (`page.tsx`)

### `machineGroups`
Todos los retos del continente seleccionado se agrupan en memoria mediante la clave `${continent}::${machineId}` usando `useMemo()`. Se ordenan descendentemente según su propiedad `step`.

### Interceptor del Panel de Detalle (`displayChallenge`)
Al hacer clic en una tarjeta agrupada de la máquina, el Frontend selecciona obligatoriamente el `id` perteneciente al `step:1`. 

Cuando `displayChallenge` detecta que el reto seleccionado contiene un `machineId`, en lugar de renderizar la información de la primera flag, **construye un objeto virtual** que fusiona todo el grupo:

1. **Nombre y Descripción:** Hereda el título (recortado, sin el " - Flag 1"), la descripción y el lore del `step:1`.
2. **Puntos y Estado:** Suma el `points` de todas las flags del grupo y evalúa cuántas están completas (`capturedFlags`).
3. **El Botón de Acción:** El slug (el hipervínculo) ignora al `step:1` y se calcula al vuelo apuntando a **la primera flag no resuelta** (`firstAvail.slug`). Así, si resolvió la Flag 1, al darle a "Ir al Lab" el sistema redirige automáticamente al portal de la Flag 2.

```typescript
const firstAvail = steps.find(s => s.status !== 'COMPLETED' && !s.solvedByTeam) ?? steps[0]
// ...
slug: firstAvail.slug
```

---

## 4. Conteo Correcto en `route.ts` (API)

Para que el Progress Bar global ("X de Y retos completados") no cuente los sub-retos como instancias individuales, el endpoint agrupa las unidades usando `Set` antes de retornar el conteo:

```typescript
function countUnits(challenges: ChallengeSummary[]) {
  const machines = new Set<string>()
  let standalones = 0

  for (const ch of challenges) {
    if (ch.machineId && ch.continent) {
      machines.add(`${ch.continent}::${ch.machineId}`)
    } else {
      standalones += 1
    }
  }
  return machines.size + standalones
}
```

Una máquina multi-flag se considera "Completa" para esta barra de progreso únicamente cuando **todos** sus steps correspondientes están marcados como `COMPLETED`.

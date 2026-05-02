# Guía de Creación de Laboratorios (Multi-Flag) en CTFd

Si subirás un laboratorio (Lab) a la plataforma, es importante seguir los siguientes pasos para que el frontend de Next.js (Pawnguard) agrupe y renderice correctamente la experiencia al estilo HackTheBox.

**Portal de Administración:** `https://api.hack.pawnguard.org`

---

## 1. Identifica las Flags de tu Laboratorio
Cada **Flag** de tu laboratorio será **un Challenge individual** registrado en CTFd.
Si tu laboratorio tiene 4 flags (Recon, User, Escalada, Root), deberás crear **4 Challenges separados**.

---

## 2. Creación del Challenge (Paso a Paso)

Ve al panel de administrador en CTFd -> **Challenges** -> Haz clic en el botón **`+`**.

### Datos Principales (General)
Deberás llenar los datos de acuerdo a si es la **Primera Flag** (Step 1) o una **Flag Subsecuente** (Step 2+).

| Campo | Para la Flag 1 (Step 1) | Para las Flags 2, 3, 4... |
|---|---|---|
| **Name** | `{Nombre del Lab} - Flag 1` <br>*(Ej: Servidor Fantasma - Flag 1)* | `{Nombre del Lab} - Flag {X}` <br>*(Ej: Servidor Fantasma - Flag 2)* |
| **Category** | `{Categoría}` (Ej: Web, Pwn, OSINT) | Mismo que el Step 1 |
| **Message** | `{Lore del Laboratorio}` <br>`---` <br>`{Instrucciones específicas de la Flag 1}` | `{Instrucciones específicas de la Flag X}` <br>*(No lleva lore ni `---`)* |
| **Value** | Puntos que vale esta Flag (Ej: 100) | Puntos que vale esta Flag (Ej: 150) |

> **⚠️ Importante sobre el Message de la Flag 1:** 
> El frontend usa los tres guiones `---` para separar la historia general del laboratorio (Lore) de la pregunta específica de la Flag 1. **Debe ir exactamente así:**
> ```text
> Se detectó actividad inusual en los servidores de De4thPawn. Tu misión es infiltrarte y recuperar los datos.
> ---
> Escanea los puertos abiertos y encuentra la versión del servicio HTTP.
> ```

---

## 3. Configuración Post-Creación

Una vez le des a **Create**, CTFd te pedirá los siguientes datos en el wizard:

1. **Flag:** Ingresa el formato exacto de la flag (Ej: `CTF{w3lcom3_t0_pwn}`). Marca la casilla **Case Sensitive**.
2. **Files (Si aplica):** Sube el ZIP del laboratorio asegurándote de que incluya el `Dockerfile` y todo lo necesario para crear la imagen.
3. **State:** Asegúrate de marcarlo como **Visible**. 
   *(❌ NUNCA uses los "Requirements" de CTFd para ocultar flags, el frontend maneja el bloqueo visual automáticamente. Todas deben estar en Visible).*

---

## 4. Agrupación y Renderizado (Sección Tags)

Ve a la pestaña **Tags** del challenge. Aquí es donde ocurre la magia para que el globo 3D y el laboratorio funcionen. Debes agregar **3 Tags exactas** presionando Enter después de cada una:

1. **`continent:{Nombre}`**
   Determina en qué continente del globo 3D aparecerá el laboratorio.
   *(Ojo: Unicamente se soporta 1 Lab activo por continente en la vista actual).*
   Opciones disponibles: 
   - `North America`
   - `South America`
   - `Europe`
   - `Africa`
   - `Asia`
   - `Oceania`
   - `Antartida Sur`

2. **`machine:{ID_del_Lab}`**
   Es el identificador interno que agrupará todas las flags. **Debe ser exactamente el mismo** para las 4 flags del laboratorio (Ej: `machine:servidor_fantasma`). No uses espacios, usa guiones bajos o camelCase.

3. **`step:{Número}`**
   Es el orden lógico de la flag. 
   - Para la primera flag pon: `step:1`
   - Para la segunda pon: `step:2`
   - Y así sucesivamente.

---

## 5. Pistas (Sección Hints)

Ve a la pestaña **Hints** en la parte inferior del Challenge.

1. Haz clic en el botón de **+** para crear un nuevo Hint.
2. Agrega la pista correspondiente a la bandera actual.
3. **Costo:** Asigna el costo en puntos que el encargado de Labs te haya indicado para esa pista.
4. El frontend renderizará este hint en el botón "Hint" al lado del input de la flag.

---

## 6. Actualizar (Update)

Ve a la parte inferior de la pantalla del Challenge y haz clic en **Update** para guardar todos los cambios.

---

### ✅ Checklist Final para el Lab "Servidor Fantasma" (Ejemplo)

- [ ] **Challenge 1:** `Servidor Fantasma - Flag 1` | Tags: `continent:Asia`, `machine:fantasma`, `step:1` | Tiene Lore + `---` + Mensaje.
- [ ] **Challenge 2:** `Servidor Fantasma - Flag 2` | Tags: `continent:Asia`, `machine:fantasma`, `step:2` | Solo tiene Mensaje.
- [ ] **Challenge 3:** `Servidor Fantasma - Flag 3` | Tags: `continent:Asia`, `machine:fantasma`, `step:3` | Solo tiene Mensaje.
- [ ] Todas las flags están en estado **Visible**.
- [ ] Todas las flags tienen su costo en puntos (**Value**) individual correctamente asignado.
# Guía de Contribución 🚀

¡Bienvenido al equipo! Estamos felices de que quieras contribuir.
Para mantener la calidad de nuestro código y la salud mental del equipo, por favor lee y sigue estas directrices.

## 🛠 Stack de Tecnología
Asegúrate de tener tu entorno alineado con nuestras herramientas:
- **Framework:** Next.js 14+ (App Router)
- **Estilos:** Tailwind CSS
- **Lenguaje:** TypeScript (Estricto)
- **Paquetería:** npm (Usa `npm ci` para instalar, no `yarn` ni `pnpm`)

---

##  Workflow de Desarrollo (Gitflow)

### 1. Ramas
- **`main`**: Producción. Intocable sin Pull Request. Necesita revisión por parte del owner.
- **`develop`**: Rama base para desarrollo antes de mergear a main.
- **`feat/nombre-feature`**: Para nuevas funcionalidades donde cada integrante deerá crear.
- **`fix/nombre-bug`**: Para corrección de errores.
- **`hotfix/nombre-urgente`**: Para errores críticos en producción.

### 2. Estándar de Commits (Conventional Commits)
Usamos [Conventional Commits](https://www.conventionalcommits.org/). Tu commit debe verse así:

- **`feat`**: Una nueva funcionalidad (Ej: feat(auth): add google login).
- **`fix`**: Arreglo de un bug (Ej: fix(navbar): resolve mobile menu crash).
- **`chore`**: Tareas de mantenimiento (Ej: chore: update dependencies).
- **`docs`**: Cambios en documentación.
- **`refactor`**: Cambio de código que no altera la funcionalidad (limpieza).
- **`style`**: Espacios, comas, formato (sin cambios de lógica).

> ❌ **Mal:** "arreglando cosas", "cambios finales", "wip"



<h1 align="center">Hack2Dawn Front-end</h1>

<p align="center">
    <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Tailwind-3.0-blue?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/DEDSEC-CERTIFIED-000000?style=for-the-badge&logo=hack-the-box&logoColor=white" alt="DedSec Certified" />
</p>

> Frontend for Hack2Dawn CTF web app. By PawnGuard of Guadalajara

---

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🛠 Tech Stack](#-tech-stack)
- [📂 Project Structure](#-project-structure)
- [📐 Convenciones del Proyecto](#-convenciones-del-proyecto)

---

## 🚀 Quick Start

Follow these steps to get the project running in under 5 minutes.

### Prerequisites
- Node.js 20+ (Recommended: use `nvm`)
- npm 10+

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/PawnGuard/hack2dawn-front-end.git
    cd hack2dawn-front-end
    ```

2. **Set up environment variables:**
    ```bash
    cp .env.example .env
    # Open the .env file and fill in the required keys
    ```

3. **Install dependencies:**
    ```bash
    npm install
    ```

4. **Start the development server:**
    ```bash
    npm run dev # To local
    npm run dev --host # To access in your network, if you want to see it in a cellphone or pc
    ```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🛠 Tech Stack

This project uses a modern, component-based architecture.

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Core** | Next.js 14 (App Router) | Fullstack React framework |
| **Styling** | Tailwind CSS | Utility-first design system |
| **Language** | TypeScript | Strict static typing |

---

## 📂 Project Structure

### Estructura General
```text
├── app                 → Todas las páginas del proyecto (Next.js App Router)
│   ├── (app)           → Páginas privadas (requieren autenticación)
│   ├── (public)        → Páginas públicas (landing page, login, registro, etc.)
│   ├── globals.css     → Estilos globales de la aplicación
│   ├── layout.tsx      → Layout raíz de la aplicación
│   └── not-found.tsx   → Página 404 personalizada
│
├── components          → Todos los componentes reutilizables de React
│   ├── icons           → Iconos en formato de componente React (convertir SVGs aquí y exportarlos en index.ts)
│   ├── shared          → Componentes usados en más de una página (Footer, Banner, Navbar, etc.)
│   └── ui              → Componentes genéricos de interfaz (botones, pills, inputs, modals, etc.)
│
├── data                → Archivos de datos estáticos o configuración de contenido.
│   └── footer.ts       → Si necesitas editar el contenido del footer, hazlo aquí, NO en el componente.
│
├── lib                 → Utilidades, helpers y configuraciones del lado del cliente/servidor
│   ├── auth.ts         → Configuración y helpers de autenticación
│   ├── ctf-state.ts    → Estado global relacionado al CTF
│   └── utils.ts        → Funciones de utilidad general
│
├── public              → Archivos estáticos públicos (imágenes, fuentes, etc.)
│   ├── fonts           → Fuentes tipográficas del proyecto
│   └── lol             → (descripción pendiente)
│
└── types               → Definiciones de tipos TypeScript compartidos en todo el proyecto
    ├── team.ts         → Tipos relacionados a equipos
    └── user.ts         → Tipos relacionados a usuarios

```

### Estructura de Páginas (app/)
```text
app/
├── (app)/                          → Páginas privadas (requieren sesión activa)
│   ├── api/                        → API Routes del proyecto
│   ├── challenges/
│   │   ├── page.tsx                → Página principal de Challenges
│   │   └── [slug]/
│   │       └── page.tsx            → Página de detalle del Lab / Challenge (plantilla dinámica)
│   ├── dashboard/
│   │   ├── layout.tsx              → Layout compartido del dashboard
│   │   ├── profile/
│   │   │   └── page.tsx            → Página de perfil del usuario
│   │   └── team/
│   │       ├── page.tsx            → Página de dashboard del equipo
│   │       └── select/
│   │           └── page.tsx        → Página para unirse o seleccionar equipo (TeamUp)
│   ├── home/
│   │   └── page.tsx                → Página principal post-login (Home)
│   └── layout.tsx                  → Layout de las páginas privadas
│
└── (public)/                       → Páginas públicas (sin autenticación requerida)
    ├── page.tsx                    → Landing page principal
    ├── login/
    │   └── page.tsx                → Página de inicio de sesión
    ├── register/
    │   └── page.tsx                → Página de registro de usuario
    ├── credits/
    │   └── page.tsx                → Página de créditos
    ├── faq/
    │   └── page.tsx                → Página de preguntas frecuentes
    ├── rules/
    │   └── page.tsx                → Página de reglas del CTF
    ├── scoreboard/
    │   └── page.tsx                → Página del scoreboard público
    └── layout.tsx                  → Layout de las páginas públicas
```

---

## 📐 Convenciones del Proyecto

### Organización de Componentes
La regla más importante es dónde vive un componente según su alcance:

Componente usado en una sola página → créalo dentro de la carpeta de esa página, en una subcarpeta _components/

Componente usado en 2+ páginas → muévelo a components/shared/

Componente genérico de UI sin lógica de negocio (botón, badge, input) → va en components/ui/

Ejemplo de estructura para una página:

```text
app/(app)/challenges/
├── page.tsx
└── _components/
    ├── ChallengeCard.tsx       → solo se usa en esta página
    └── ChallengeFilter.tsx     → solo se usa en esta página
```

### Manejo de Datos
Si un componente necesita texto, links, listas u otro contenido configurable, no lo escribas hardcodeado dentro del componente. Agrégalo en un archivo dentro de data/ y lo importas desde ahí. Esto facilita cambios sin tocar la lógica del componente. Busca más acerca de 

### Iconos
Cuando agregues un ícono SVG al proyecto:

Conviértelo a un componente de React en components/icons/

Expórtalo desde components/icons/index.ts

Nunca importes un SVG directamente como archivo en un componente — siempre usa el componente generado

### Reglas Generales
No metas lógica de negocio en los componentes de components/ui/ — esos son solo presentacionales

No importes desde app/ hacia components/ — el flujo de dependencias va en una sola dirección

Si necesitas compartir estado entre páginas, usa lib/ para centralizar esa lógica

Antes de crear un componente nuevo, revisa si ya existe algo similar en components/ui/ o components/shared/

ready v1.0.0
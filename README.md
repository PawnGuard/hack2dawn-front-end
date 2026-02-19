<h1 align="center">Hack2Dawn Front-end</h1>

<p align="center">
    <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Tailwind-3.0-blue?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/DEDSEC-CERTIFIED-000000?style=for-the-badge&logo=hack-the-box&logoColor=white" alt="DedSec Certified" />
</p>


> Frontend for Hack2Dawn CTF web app. By PawnGuard of Guadalajara

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
    npm ci
    # We use 'ci' to ensure exact versions from the lockfile
    ```

4. **Start the development server:**
    ```bash
    npm run dev
    ```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## 🛠 Tech Stack

This project uses a modern, component-based architecture.

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Core** | Next.js 14 (App Router) | Fullstack React framework |
| **Styling** | Tailwind CSS | Utility-first design system |
| **Language** | TypeScript | Strict static typing |

## 📂 Project Structure
...................................
```text
/src
  /app          # Next.js App Router (Pages and Layouts)
  /components   # Reusable components (Atoms, Molecules)
  /features     # Business modules (Auth, Dashboard)
  /lib          # Utilities and library configuration
  /styles       # Global styling configuration

// app/(auth)/layout.tsx
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#090013]">

      {/* Nav superior izquierda */}
      <div className="absolute top-5 left-6 z-50 flex items-center gap-4">

        {/* Logo PNG → lleva a / */}
        <Link href="/" aria-label="Volver al inicio">
          <Image
            src="/images/hack2dawn-logo.webp"
            alt="Hack2Dawn logo"
            width={36}
            height={36}
            className="opacity-80 hover:opacity-100 transition-opacity duration-200"
          />
        </Link>

        {/* Separador vertical */}
        <span className="w-px h-5 bg-white/10" aria-hidden="true" />

        {/* Botón regresar — mismo estilo que "ABORTAR" en los forms */}
        <Link
          href="/"
          className="font-mono text-xs text-white/40 hover:text-white
                     transition-colors duration-200 tracking-widest
                     flex items-center gap-2"
        >
          {/* Flecha izquierda — misma que AngleLeftSolidIcon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          REGRESAR
        </Link>

      </div>

      <main className="flex-grow">
        {children}
      </main>

    </div>
  );
}
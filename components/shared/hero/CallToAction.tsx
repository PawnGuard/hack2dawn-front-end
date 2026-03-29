// components/shared/hero/CallToAction.tsx
"use client";

import Link from "next/link";

export default function CallToAction() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-2">

      {/* ── Registrarse — magenta ────────────────────────── */}
      <Link
        href="/register"
        className="group relative px-8 py-3 overflow-hidden
                   font-heading tracking-[0.25em] uppercase text-sm
                   border border-sw-magenta
                   text-sw-magenta
                   transition-colors duration-300
                   hover:text-sw-void"
        style={{
          background: "rgba(239,1,186,0.08)",
          boxShadow: "0 0 18px rgba(239,1,186,0.25), inset 0 0 18px rgba(239,1,186,0.05)",
        }}
      >
        {/* Glow border top */}
        <span
          className="absolute top-0 left-0 right-0 h-px bg-sw-magenta opacity-60"
          aria-hidden="true"
        />
        {/* Fill slide */}
        <span
          className="absolute inset-0 bg-sw-magenta
                     translate-y-[101%] group-hover:translate-y-0
                     transition-transform duration-300 ease-in-out"
          aria-hidden="true"
        />
        {/* Scanline overlay */}
        <span
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)",
          }}
          aria-hidden="true"
        />
        <span className="relative z-10">[ REGISTRARSE ]</span>
      </Link>

      {/* ── Iniciar sesión — cyan ────────────────────────── */}
      <Link
        href="/login"
        className="group relative px-8 py-3 overflow-hidden
                   font-heading tracking-[0.25em] uppercase text-sm
                   border border-sw-cyan
                   text-sw-cyan
                   transition-colors duration-300
                   hover:text-sw-void"
        style={{
          background: "rgba(0,240,255,0.05)",
          boxShadow: "0 0 18px rgba(0,240,255,0.18), inset 0 0 18px rgba(0,240,255,0.04)",
        }}
      >
        {/* Glow border top */}
        <span
          className="absolute top-0 left-0 right-0 h-px bg-sw-cyan opacity-60"
          aria-hidden="true"
        />
        {/* Fill slide */}
        <span
          className="absolute inset-0 bg-sw-cyan
                     translate-y-[101%] group-hover:translate-y-0
                     transition-transform duration-300 ease-in-out"
          aria-hidden="true"
        />
        {/* Scanline overlay */}
        <span
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)",
          }}
          aria-hidden="true"
        />
        <span className="relative z-10">[ INICIAR SESIÓN ]</span>
      </Link>

    </div>
  );
}
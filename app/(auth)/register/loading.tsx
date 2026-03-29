// loading.tsx — Skeleton for the signup page (Next.js App Router)
// Mirrors the exact structure of SignupForm while data/components load
// Place this file at: app/auth/register/loading.tsx (or wherever your signup page.tsx lives)

export default function Loading() {
  return (
    <>
      <style>{`
        @keyframes shimmer-pink {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .sk {
          background: linear-gradient(
            90deg,
            rgba(239, 1, 186, 0.07) 25%,
            rgba(239, 1, 186, 0.22) 50%,
            rgba(239, 1, 186, 0.07) 75%
          );
          background-size: 200% 100%;
          animation: shimmer-pink 1.8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .sk { animation: none; background: rgba(239, 1, 186, 0.10); }
        }
      `}</style>

      {/* Full-screen dark background (replaces <AuthBackground />) */}
      <div className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">

        {/* Subtle perspective grid — matches AuthBackground feel */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(239,1,186,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(239,1,186,1) 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px",
          }}
        />

        {/* Glow blob — mirrors ambient light from background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #EF01BA 0%, transparent 70%)" }}
        />

        {/* Card */}
        <div className="relative w-full max-w-md mx-4">

          {/* Tab label: ~/auth/register/new_agent_ */}
          <div className="flex items-center gap-2 mb-0 px-1 pb-1">
            <div className="sk h-4 w-56 rounded-sm" />
          </div>

          {/* Card body */}
          <div
            className="relative border border-white/10 bg-black/80 px-8 py-8"
            style={{ backdropFilter: "blur(12px)" }}
          >
            {/* HUD corner pieces — pure CSS decoration, no skeleton */}
            <span aria-hidden="true" className="absolute top-0 left-0  w-4 h-4 border-t-2 border-l-2 border-[#EF01BA]" />
            <span aria-hidden="true" className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#EF01BA]" />
            <span aria-hidden="true" className="absolute bottom-0 left-0  w-4 h-4 border-b-2 border-l-2 border-[#EF01BA]" />
            <span aria-hidden="true" className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#EF01BA]" />

            {/* Header */}
            <div className="mb-8 space-y-3">
              {/* // HACK2DAWN CTF 2026 */}
              <div className="sk h-3 w-40 rounded-sm opacity-60" />
              {/* CREAR IDENTIDAD */}
              <div className="sk h-6 w-44 rounded-sm" />
              {/* Regístrate como agente para competir en el CTF. */}
              <div className="sk h-3 w-72 rounded-sm opacity-50" />
            </div>

            {/* Form fields — 4 fields for signup */}
            <div className="space-y-7">

              {/* Name field */}
              <div className="space-y-2">
                <div className="sk h-3 w-20 rounded-sm opacity-60" />
                <div
                  className="sk w-full h-10"
                  style={{ borderRadius: 0, borderBottom: "2px solid rgba(239,1,186,0.15)" }}
                />
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <div className="sk h-3 w-16 rounded-sm opacity-60" />
                <div
                  className="sk w-full h-10"
                  style={{ borderRadius: 0, borderBottom: "2px solid rgba(239,1,186,0.15)" }}
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <div className="sk h-3 w-20 rounded-sm opacity-60" />
                <div
                  className="sk w-full h-10"
                  style={{ borderRadius: 0, borderBottom: "2px solid rgba(239,1,186,0.15)" }}
                />
              </div>

              {/* Confirm password field */}
              <div className="space-y-2">
                <div className="sk h-3 w-28 rounded-sm opacity-60" />
                <div
                  className="sk w-full h-10"
                  style={{ borderRadius: 0, borderBottom: "2px solid rgba(239,1,186,0.15)" }}
                />
              </div>

              {/* Submit button — CREAR IDENTIDAD */}
              <div className="sk w-full h-11 rounded-sm" style={{ opacity: 0.85 }} />

              {/* ¿Ya tienes acceso? INICIAR SESIÓN */}
              <div className="flex justify-center">
                <div className="sk h-3 w-48 rounded-sm opacity-40" />
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
// loading.tsx — Skeleton for the login page (Next.js App Router)
// Mirrors the exact structure of LoginForm while data/components load

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

          {/* Tab label: ~/auth/login/access_ */}
          <div className="flex items-center gap-2 mb-0 px-1 pb-1">
            <div className="sk h-4 w-44 rounded-sm" />
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
              {/* ACCESO AL SISTEMA */}
              <div className="sk h-6 w-52 rounded-sm" />
              {/* Ingresa tus credenciales para continuar. */}
              <div className="sk h-3 w-64 rounded-sm opacity-50" />
            </div>

            {/* Form fields */}
            <div className="space-y-7">

              {/* Identifier field */}
              <div className="space-y-2">
                <div className="sk h-3 w-24 rounded-sm opacity-60" />
                <div
                  className="sk w-full h-10"
                  style={{ borderRadius: 0, borderBottom: "2px solid rgba(239,1,186,0.15)" }}
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <div className="sk h-3 w-16 rounded-sm opacity-60" />
                <div className="relative">
                  <div
                    className="sk w-full h-10"
                    style={{ borderRadius: 0, borderBottom: "2px solid rgba(239,1,186,0.15)" }}
                  />
                  {/* Eye-toggle ghost */}
                  <div className="sk absolute right-0 bottom-2 w-5 h-5 rounded-sm opacity-40" />
                </div>
              </div>

              {/* Submit button — ACCEDER AL SISTEMA */}
              <div className="sk w-full h-11 rounded-sm" style={{ opacity: 0.85 }} />

              {/* ¿Sin cuenta? CREAR IDENTIDAD */}
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
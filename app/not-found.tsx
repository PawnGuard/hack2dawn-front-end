import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050008] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(239,1,186,0.22),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(0,240,255,0.18),transparent_45%),linear-gradient(180deg,rgba(5,0,8,0.9)_0%,rgba(5,0,8,1)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background:repeating-linear-gradient(to_bottom,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_1px,transparent_2px,transparent_6px)]" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-14 sm:px-6 lg:px-10">
        <div className="w-full border border-[#EF01BA]/30 bg-black/60 p-6 backdrop-blur-md sm:p-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00F0FF]/70 sm:text-xs">
            // RESPONSE STATUS
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-3 sm:gap-4">
            <span className="font-heading text-[4.7rem] leading-none text-[#EF01BA] drop-shadow-[0_0_18px_rgba(239,1,186,0.55)] sm:text-[7.5rem] lg:text-[10rem]">
              404
            </span>
            <span className="mb-2 border border-[#00F0FF]/30 bg-[#00F0FF]/10 px-3 py-1 font-mono text-[10px] tracking-[0.28em] text-[#00F0FF] sm:text-xs">
              NOT_FOUND
            </span>
          </div>

          <h1 className="mt-6 max-w-3xl font-heading text-2xl uppercase tracking-wide text-white sm:text-4xl lg:text-5xl">
            La ruta solicitada no existe en esta dimensión.
          </h1>

          <p className="mt-4 max-w-2xl font-mono text-xs leading-relaxed text-white/65 sm:text-sm">
            El recurso pudo ser movido, eliminado o nunca fue desplegado. Regresa a una zona segura y vuelve a intentar con una URL válida.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center border border-[#EF01BA]/70 bg-[#EF01BA] px-5 py-2 font-mono text-xs tracking-[0.18em] text-black transition-colors hover:bg-[#ff35cf]"
            >
              [ VOLVER AL INICIO ]
            </Link>
            <Link
              href="/home"
              className="inline-flex items-center border border-white/20 bg-black/40 px-5 py-2 font-mono text-xs tracking-[0.18em] text-white/80 transition-colors hover:border-[#00F0FF]/50 hover:text-[#00F0FF]"
            >
              [ IR A HOME ]
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

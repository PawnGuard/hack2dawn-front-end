// components/shared/hero/HeroContent.tsx
export default function HeroContent() {
  return (
    <div className="flex flex-col items-center gap-4 max-w-3xl">
      <span className="font-cyber text-xs tracking-[0.3em] text-sw-cyan uppercase
                       border border-sw-cyan px-4 py-1 shadow-neon-cyan">
        CTF · 2025
      </span>

      <h1 className="font-display text-4xl md:text-6xl text-sw-text leading-tight
                     drop-shadow-[0_0_30px_#FF1F8C]">
        HACK2DAWN
      </h1>

      <p className="font-heading text-sw-muted text-base md:text-lg max-w-lg">
        Demuestra tus habilidades. Captura las flags. Domina el scoreboard.
      </p>
    </div>
  );
}
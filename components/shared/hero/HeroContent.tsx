// components/shared/hero/HeroContent.tsx
import { EncryptedText } from "@/components/ui/encrypted-text";
import { EVENT_DATE } from "@/data/event";

const formattedDateMX = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Mexico_City",
  hour12: false,
}).format(EVENT_DATE).toUpperCase().replace(",", " ·");

export default function HeroContent() {
  return (
    <div className="flex flex-col items-center gap-4 max-w-3xl">

      {/* Event date badge */}
      <span className="font-mono text-xs tracking-[0.3em] text-sw-cyan uppercase
                       border border-sw-cyan/60 px-4 py-1.5
                       shadow-[0_0_10px_rgba(0,255,255,0.3)]
                       backdrop-blur-sm bg-sw-cyan/5">
        CTF · {formattedDateMX} MX
      </span>

      <h1 className="font-display text-4xl md:text-8xl text-sw-text leading-tight
                     drop-shadow-[0_0_30px_#FF1F8C]">
        <EncryptedText
          text="HACK2DAWN"
          revealDelayMs={70}
          flipDelayMs={50}
          encryptedClassName="text-pink-500/50"
          revealedClassName=""
        />
      </h1>
      <p className="font-heading text-sw-muted text-base md:text-lg max-w-lg">
        Demuestra tus habilidades. Captura las flags. Domina el scoreboard.
      </p>
    </div>
  );
}
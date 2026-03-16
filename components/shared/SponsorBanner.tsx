import { SPONSORS, type Sponsor } from "@/data/sponsors";

// SponsorBanner.tsx
export default function SponsorBanner() {
  return (
    <section aria-label="Sponsors" className="overflow-hidden py-16 bg-background">
      <div className="flex w-full">

        {/* Div 1 */}
        <div
          aria-hidden="false"
          className="animate-marquee flex shrink-0 w-full items-center justify-around will-change-transform"
        >
          {SPONSORS.map((sponsor) => (
            <SponsorItem key={sponsor.name} sponsor={sponsor} />
          ))}
        </div>

        {/* Div 2 — idéntico, aria-hidden para no duplicar en lectores de pantalla */}
        <div
          aria-hidden="true"
          className="animate-marquee flex shrink-0 w-full items-center justify-around"
        >
          {SPONSORS.map((sponsor) => (
            <SponsorItem key={`dup-${sponsor.name}`} sponsor={sponsor} />
          ))}
        </div>

      </div>
    </section>
  );
}

function SponsorItem({ sponsor }: { sponsor: Sponsor }) {
  return (
    <a
      href={sponsor.website ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visitar sitio de ${sponsor.name}`}
      title={sponsor.name}
      className="flex items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16
                 grayscale opacity-40
                 transition-[filter,opacity,transform] duration-300
                 hover:grayscale-0 hover:opacity-100 hover:scale-105"
    >
      {sponsor.logo}
    </a>
  );
}

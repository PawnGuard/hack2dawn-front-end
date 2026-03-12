import { contributors } from "@/data/contributors";
import { Contributor, SocialLink, SocialPlatform } from "@/types/credits";
import { LinkedinIcon, GithubIcon, WebPageIcon } from "@/components/icons";

const LEADERS_COUNT = 3;

// ─── Social Config ─────────────────────────────────────────────────────────────
// Colores mapeados a tu paleta CTF
const socialConfig: Record<SocialPlatform, { color: string; icon: React.ReactNode }> = {
  linkedin: {
    // Shocking pink como acento principal
    color: "text-[#EF01BA] hover:text-[#F4EDF2] transition-colors",
    icon: <LinkedinIcon className="w-6 h-6" />,
  },
  github: {
    // Lavender mint (foreground) para GitHub
    color: "text-[#F4EDF2] hover:text-[#EF01BA] transition-colors",
    icon: <GithubIcon className="w-6 h-6" />,
  },
  "web-page": {
    // Harvest orange para links externos
    color: "text-[#F77200] hover:text-[#F4EDF2] transition-colors",
    icon: <WebPageIcon className="w-6 h-6" />,
  },
};

// ─── Sub-componentes ───────────────────────────────────────────────────────────

function SocialLinks({ socials }: { socials: SocialLink[] }) {
  return (
    <ul className="flex justify-center mt-4 space-x-4">
      {socials.map(({ platform, url }) => {
        const { color, icon } = socialConfig[platform];
        return (
          <li key={platform}>
            <a
              href={url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={color}
              aria-label={platform}
            >
              {icon}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function ContributorCard({ contributor }: { contributor: Contributor }) {
  const { name, role, contribution, avatar, profileUrl, socials } = contributor;
  return (
    <div className="text-center text-[#F4EDF2]/70">
      <img
        className="mx-auto mb-4 w-36 h-36 rounded-full object-cover
                   ring-2 ring-[#430464] hover:ring-[#940992] transition-all"
        src={avatar}
        alt={`${name} avatar`}
      />
      <h3 className="mb-1 text-2xl font-bold tracking-tight text-[#F4EDF2]">
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#EF01BA] transition-colors"
        >
          {name}
        </a>
      </h3>
      {/* Rol con acento magenta */}
      <p className="font-medium text-[#940992]">{role}</p>
      {/* Contribución en tono más suave */}
      <p className="mt-1 text-sm text-[#F4EDF2]/50 italic">{contribution}</p>
      <SocialLinks socials={socials} />
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function CreditsSection() {
  const leaders = contributors.slice(0, LEADERS_COUNT);
  const rest = contributors.slice(LEADERS_COUNT);

  return (
    <section className="bg-[#0a0006]">
      <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-6">

        {/* Header */}
        <div className="mx-auto mb-8 max-w-screen-sm lg:mb-16">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-[#F4EDF2]">
            Credits
          </h2>
          <p className="font-light text-[#F4EDF2]/60 sm:text-xl">
            These are the people who made this project possible. Thank you for your time and dedication!
          </p>
        </div>

        {/* Fila superior — líderes (3 fijos, centrados) */}
        <div className="grid gap-8 lg:gap-16 grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto mb-12">
          {leaders.map((contributor) => (
            <ContributorCard key={contributor.id} contributor={contributor} />
          ))}
        </div>

        {/* Separador con color indigo */}
        {rest.length > 0 && (
          <hr className="border-[#430464] mb-12" />
        )}

        {/* Fila inferior — resto del equipo */}
        {rest.length > 0 && (
          <div className="grid gap-8 lg:gap-16 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {rest.map((contributor) => (
              <ContributorCard key={contributor.id} contributor={contributor} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

import Link from "next/link";
import { Boxes } from "@/components/ui/background-boxes";
import CtfStatusBanner from "@/components/home/CtfStatusBanner";
import HomeCountdown from "@/components/home/HomeCountdown";
import HowItWorks from "@/components/home/HowItWorks";
import RecommendedTools from "@/components/home/RecommendedTools";
import ImportantNotes from "@/components/home/ImportantNotes";
import ProgressChart from "@/components/shared/ProgressChart";
import ScoreboardTop10 from "@/components/shared/ScoreboardTop10";
import "@hackernoon/pixel-icon-library/fonts/iconfont.css";

const quickActions = [
  {
    title: "Perfil",
    description: "Edita tu identidad de jugador",
    href: "/dashboard/profile",
    iconClass: "hn hn-user-solid",
    colorClass: "text-pink",
  },
  {
    title: "Equipo",
    description: "Gestiona miembros y capitania",
    href: "/dashboard/team",
    iconClass: "hn hn-users-solid",
    colorClass: "text-cyan-300",
  },
  {
    title: "Retos",
    description: "Encuentra y envia flags",
    href: "/challenges",
    iconClass: "hn hn-flag-solid",
    colorClass: "text-yellow",
  },
  {
    title: "Calendario",
    description: "Sigue los tiempos del evento",
    href: "/home",
    iconClass: "hn hn-calender-solid",
    colorClass: "text-orange",
  },
  {
    title: "Scoreboard",
    description: "Revisa ranking y progreso",
    href: "/scoreboard",
    iconClass: "hn hn-trophy-solid",
    colorClass: "text-purple",
  },
] as const;

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">

      {/* ── Fixed 2D grid background ── */}
      {/* No pointer-events-none here — cells receive hover events */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <Boxes />
        {/* Vignette: fades the four edges toward the background colour */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_85%_70%_at_50%_40%,transparent_30%,#0a0006_100%)]" />
        {/* Solid top/bottom fades */}
        <div className="absolute inset-x-0 top-0 h-24 z-10 pointer-events-none bg-gradient-to-b from-[#0a0006] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 z-10 pointer-events-none bg-gradient-to-t from-[#0a0006] to-transparent" />
      </div>

      {/* ── Scrollable content ──
          pointer-events-none on the wrapper so mouse events reach
          the grid cells behind it.
          Each section re-enables pointer-events-auto for real interactivity. -->
      */}
      <div className="relative z-10 pointer-events-none">

        <div className="pointer-events-auto">
          <CtfStatusBanner />
        </div>

        {/* Hero countdown */}
        <section className="flex items-center justify-center min-h-[70svh] md:min-h-[60vh] px-4 py-16 md:py-24 pointer-events-none">
          <div className="pointer-events-auto">
            <HomeCountdown />
          </div>
        </section>

        <section className="pointer-events-auto mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group border border-white/10 bg-black/40 backdrop-blur-sm px-4 py-4 transition-colors hover:bg-black/55"
              >
                <div className="flex items-center gap-2 mb-2">
                  <i
                    className={`${action.iconClass} ${action.colorClass} text-lg`}
                    aria-hidden="true"
                  />
                  <p className="font-mono text-[11px] tracking-widest uppercase text-white/70">{action.title}</p>
                </div>
                <p className="text-xs text-white/55 group-hover:text-white/75 transition-colors">{action.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Content sections */}
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20 pb-24">
          <section className="pointer-events-auto">
            <HowItWorks />
          </section>
          <section className="pointer-events-auto">
            <RecommendedTools />
          </section>
          <section className="pointer-events-auto">
            <ImportantNotes />
          </section>
          <section className="pointer-events-auto">
            <ProgressChart />
          </section>
          <section className="pointer-events-auto pb-4">
            <ScoreboardTop10 />
          </section>
        </div>
      </div>
    </div>
  );
}

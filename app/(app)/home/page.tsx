import { Boxes } from "@/components/ui/background-boxes";
import CtfStatusBanner from "@/components/home/CtfStatusBanner";
import HomeCountdown from "@/components/home/HomeCountdown";
import HowItWorks from "@/components/home/HowItWorks";
import RecommendedTools from "@/components/home/RecommendedTools";
import ImportantNotes from "@/components/home/ImportantNotes";
import ProgressChart from "@/components/shared/ProgressChart";
import ScoreboardTop10 from "@/components/shared/ScoreboardTop10";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">

      {/* ── Fixed 2D grid background ── */}
      {/* No pointer-events-none here — cells receive hover events */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <Boxes />
        {/* Vignette: fades the four edges toward the background colour */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 85% 70% at 50% 40%, transparent 30%, #0a0006 100%)",
          }}
        />
        {/* Solid top/bottom fades */}
        <div
          className="absolute inset-x-0 top-0 h-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, #0a0006, transparent)" }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to top, #0a0006, transparent)" }}
        />
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

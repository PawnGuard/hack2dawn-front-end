import ProgressChart from "@/components/shared/ProgressChart"
import ScoreboardTop10 from "@/components/shared/ScoreboardTop10"

export default function scoreboardPage() {
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
            <section className="pointer-events-auto overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_0_40px_-18px_rgba(0,0,0,0.6)] backdrop-blur sm:p-6">
                <ProgressChart />
            </section>

            <section className="pointer-events-auto overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_0_40px_-18px_rgba(0,0,0,0.6)] backdrop-blur sm:p-6">
                <ScoreboardTop10 />
            </section>
        </div>
    )
}
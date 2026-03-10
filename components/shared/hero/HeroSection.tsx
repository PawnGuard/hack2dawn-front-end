// Orquestador principal (solo ensambla)
import CallToAction from "./CallToAction";
import HeroBackground from "./HeroBackground";
import HeroContent from "./HeroContent";
import HeroCountdown from "./HeroCountdown";
import { EVENT_DATE } from "@/data/event";

export default function HeroSection() {
    return (
        <section className="relative min-h-screen w-full overflow-hidden flex flex-col
                        items-center justify-center">
            <HeroBackground />
            <div className="relative z-20 flex flex-col items-center gap-8 px-6 text-center">
                <HeroContent />
                <HeroCountdown targetDate={EVENT_DATE}/>
                <CallToAction />
            </div>
        </section>
    );
}
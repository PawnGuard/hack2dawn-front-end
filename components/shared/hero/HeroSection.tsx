// Orquestador principal (solo ensambla)
import CallToAction from "./CallToAction";
import HeroBackground from "./HeroBackground";
import HeroContent from "./HeroContent";
import HeroCountdown from "./HeroCountdown";

export default function HeroSection() {
    const eventDate = new Date("2026-05-09T09:00:00Z"); // Fecha del evento dummie se remplazara con CTFd

    return (
        <section className="relative min-h-screen w-full overflow-hidden flex flex-col
                        items-center justify-center">
            <HeroBackground />
            <div className="relative z-20 flex flex-col items-center gap-8 px-6 text-center">
                <HeroContent />
                <HeroCountdown targetDate={eventDate}/>
                <CallToAction />
            </div>
        </section>
    );
}
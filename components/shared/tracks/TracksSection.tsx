import TracksBackground from "./TracksBackground";

export default function TracksSection() {
    return (
        <section className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center">
            <TracksBackground />
            <div className="relative z-20 flex flex-col items-center gap-8 px-6 text-center">
                <h2 className="text-4xl md:text-6xl font-bold text-white">
                    Features & Tracks
                </h2>
                <p className="text-lg md:text-xl text-gray-200 max-w-2xl">
                    Explora las diferentes categorías y tracks del CTF
                </p>
            </div>
        </section>
    );
}

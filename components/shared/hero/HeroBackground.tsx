// Video / GIF de fondo
export default function HeroBackground() {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source src="/background/background.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/50" />
        </div>
    );
}
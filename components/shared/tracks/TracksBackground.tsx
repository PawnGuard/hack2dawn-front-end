import Image from "next/image";

// Background SVG para la sección Features & Tracks
export default function TracksBackground() {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div className="absolute inset-0 w-full h-full">
                <Image
                    src="/background/Features&Tracks.svg"
                    alt="Features & Tracks Background"
                    draggable={false}
                    fill
                    unoptimized
                    style={{ objectFit: 'cover' }}
                />
            </div>
            <div className="absolute inset-0 bg-black/40" />
        </div>
    );
}

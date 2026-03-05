import Image from "next/image";

// Background SVG para la sección About
export default function AboutBackground() {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div className="absolute inset-0 w-full h-full">
                <Image
                    src="/background/About.svg"
                    alt="About Background"
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

import Image from "next/image";

// Background para la sección QA & Support
export default function QABackground() {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div className="absolute inset-0 w-full h-full">
                <Image
                    src="/background/QAbackground.gif"
                    alt="QA Background"
                    fill
                    unoptimized
                    style={{ objectFit: 'cover' }}
                />
            </div>
            <div className="absolute inset-0 bg-black/50" />
        </div>
    );
}
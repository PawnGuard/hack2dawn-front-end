// Background para la sección QA & Support con efecto 3D
export default function QABackground() {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            {/* Dark background - similar al original */}
            <div className="absolute inset-0 bg-[hsl(0,0%,20%)]" />
        </div>
    );
}
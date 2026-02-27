// Background para la sección QA & Support
export default function QABackground() {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <img
                src="/background/QAbackground.gif"
                alt="QA Background"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
        </div>
    );
}
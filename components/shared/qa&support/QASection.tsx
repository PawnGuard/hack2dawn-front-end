// Sección principal de QA & Support
import QABackground from "./QABackground";
import { qaData } from "@/data/qa";
import { AngleDownIcon } from "@/components/icons";

export default function QASection() {
    return (
        <section className="relative min-h-screen w-full overflow-hidden flex flex-col
                        items-start justify-end py-20">
            <QABackground />
            <div className="relative z-20 flex flex-col items-start gap-12 px-6 pb-12 w-full max-w-4xl">
                {/* Header */}
                <div className="text-left">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        QA & Support
                    </h2>
                    <p className="text-lg md:text-xl text-gray-200">
                        Preguntas Frecuentes - Todo lo que necesitas saber sobre Hack2Dawn
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4 w-full">
                    {qaData.map((item) => (
                        <details 
                            key={item.id}
                            className="group border-s-4 border-orange bg-background backdrop-blur-sm p-6 [&_summary::-webkit-details-marker]:hidden rounded-r-lg hover:bg-background/90 transition-all" 
                            open={item.isOpen}
                        >
                            <summary className="flex items-center justify-between gap-4 cursor-pointer text-white">
                                <h3 className="text-lg font-medium">{item.question}</h3>

                                <AngleDownIcon 
                                    className="size-5 shrink-0 transition-transform duration-300 group-open:-rotate-180 text-orange" 
                                />
                            </summary>

                            <p className="pt-4 text-gray-300 leading-relaxed">
                                {item.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
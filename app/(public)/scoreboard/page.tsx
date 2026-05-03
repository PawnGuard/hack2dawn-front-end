import Link from "next/link";

import ScoreboardTop10 from "@/components/shared/ScoreboardTop10";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-10">
            <div className="max-w-7xl mx-auto space-y-12">
                <section className="flex items-center justify-start">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/home">Regresar al menú principal</Link>
                    </Button>
                </section>
                <section>
                    <ScoreboardTop10 variant="all" />
                </section>
            </div>
        </main>
    );
}
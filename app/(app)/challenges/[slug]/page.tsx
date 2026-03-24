"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lock, ShieldAlert, TerminalSquare, Unlock } from "lucide-react";
import { Boxes } from "@/components/ui/background-boxes";
import type { ChallengeSummary, ChallengesResponse } from "@/types/challenges";

interface LabFlag {
    id: number;
    title: string;
    initialHint: string;
    penaltyHint?: string;
    notes?: string;
}

interface LabDossier {
    owners: string;
    focus: string;
    story: string;
    finalMessage?: string;
    flags: LabFlag[];
}

const LAB_DOSSIERS: Record<string, LabDossier> = {
    "linux-basics-terminal-trace": {
        owners: "Sergio, Sammy",
        focus: "Aprovechamiento del conocimiento basico de navegacion en Linux.",
        story:
            "Un informante de la NSA en de4thPawn fue descubierto. Antes de ser capturado dejo una terminal activa con rastros de evidencia. Tu mision es recuperar esos fragmentos para apoyar una accion legal contra la organizacion.",
        finalMessage:
            "Bien hecho. Con esta informacion podremos planificar como atacar una parte de esta organizacion. Gracias a ti el mundo podra ser mejor, pequeno hacker de sombrero blanco.",
        flags: [
            {
                id: 1,
                title: "Archivo oculto en HOME",
                initialHint: "El informante dejo una nota: Busca donde nadie mira.",
                penaltyHint: "En Linux, los archivos que empiezan con punto no aparecen con ls normal. Usa ls -a.",
                notes: "La flag debe vivir en un archivo oculto del directorio inicial del contenedor.",
            },
            {
                id: 2,
                title: "Rastro en historial de comandos",
                initialHint: "Se movieron archivos y quedaron rastros de los comandos ejecutados.",
                penaltyHint: "Bash guarda historial en un archivo oculto del HOME.",
                notes: "Usar .bash_history como fuente de evidencia.",
            },
            {
                id: 3,
                title: "Filtrado de system.log",
                initialHint:
                    "Existe un archivo de logs masivo llamado system.log y la pista aparece junto a PRIORITY_ALPHA.",
                penaltyHint: "No leas todo el archivo. Filtra por palabra clave con grep.",
            },
            {
                id: 4,
                title: "Mensaje en banner del sistema",
                initialHint: "Un mensaje obvio se muestra al iniciar sesion en el sistema.",
                penaltyHint: "Busca el Message of the Day en /etc/motd.",
            },
            {
                id: 5,
                title: "Archivo disfrazado plano_escape.jpg",
                initialHint:
                    "Hay una imagen que no se puede visualizar. Encuentrala y valida si realmente es una imagen.",
                penaltyHint: "Las extensiones no definen el tipo real. Revisa la firma del archivo con file.",
                notes: "Si el contenido es texto, puede leerse directamente.",
            },
        ],
    },
    "linux-advanced-agent-shadow": {
        owners: "C4rnage, Shadow",
        focus: "Linux avanzado y administracion.",
        story:
            "Se obtuvo acceso de bajo nivel al servidor de archivos de de4thPawn como agente_shadow. Debes escalar capacidad usando pistas internas para llegar a informacion critica protegida.",
        flags: [
            {
                id: 1,
                title: "Variable de entorno con secreto inicial",
                initialHint: "La clave de sesion actual esta en memoria volatil del sistema.",
                penaltyHint: "Lista variables de entorno con env o printenv.",
            },
            {
                id: 2,
                title: "Backup secreto >20MB",
                initialHint: "Nuestro agente guardo un backup grande en algun punto del disco.",
                penaltyHint: "Busca archivos por tamano y ruta con find.",
            },
            {
                id: 3,
                title: "Proceso sospechoso cada 10 segundos",
                initialHint: "Hay un script de mantenimiento corriendo con nombre sospechoso.",
                penaltyHint: "Inspecciona procesos activos con ps aux o top.",
                notes: "La flag es el nombre del proceso con formato PWG{YOUR_FLAG}.",
            },
            {
                id: 4,
                title: "Lectura de secreto_admin.txt con SUID",
                initialHint: "Solo el grupo classified puede leer ese archivo. Hay un binario SUID util en el sistema.",
                penaltyHint: "Busca binarios con permiso SUID para ejecutar acciones como otro usuario.",
            },
            {
                id: 5,
                title: "Tarea cron que imprime flag en ruta oculta",
                initialHint: "Existe una tarea automatizada que deja la flag en una ruta no obvia.",
                penaltyHint: "Revisa /etc/cron.d y las tareas programadas.",
            },
        ],
    },
    "osint-la-huella-digital": {
        owners: "Najera, Erick (uno21)",
        focus: "Investigacion en fuentes abiertas.",
        story:
            "de4thPawn desconecto sus servidores. El rastro actual esta en la web publica: metadatos, historiales, repositorios y archivos indexados. Deben reconstruir identidad y movimientos.",
        flags: [
            {
                id: 1,
                title: "Metadatos de imagen repetida",
                initialHint: "El lider de la organizacion adoraba a una persona y dejo el mismo archivo publicado varias veces.",
                penaltyHint: "Usa exiftool para extraer metadatos de imagen.",
                notes: "La palabra de4thPawn debe dirigir a publicaciones con la misma imagen.",
            },
            {
                id: 2,
                title: "Codigo historico en blog caido",
                initialHint: "de4thpawn-log.com esta caido, pero publico un codigo de acceso hace un mes.",
                penaltyHint: "Consulta snapshots con Wayback Machine o cache de buscadores.",
            },
            {
                id: 3,
                title: "API key en historial de GitHub",
                initialHint: "Hay un repositorio simulado con una herramienta de hacking donde se filtro informacion.",
                penaltyHint: "Revisa historial de cambios y commits en GitHub.",
            },
            {
                id: 4,
                title: "PDF confidencial indexado por Google",
                initialHint: "Existe un PDF publico no enlazado en navegacion pero indexado por buscador.",
                penaltyHint: "Usa Google Dorks como site:dominio filetype:pdf.",
                notes:
                    "Asegurar ruta publica accesible, referencia indexable (enlace o sitemap), robots.txt sin bloqueo y metadatos coherentes.",
            },
        ],
    },
    "vulnerable-system-final-attack": {
        owners: "Sammy (+ colaboradores)",
        focus: "Vulnerar un sistema hasta obtener ejecucion root.",
        story:
            "La IP objetivo pertenece a una infraestructura C2 protegida. Un error puede cerrar la ventana de ataque. Debes encadenar reconocimiento, explotacion y escalada.",
        flags: [
            {
                id: 1,
                title: "Reconocimiento sigiloso",
                initialHint:
                    "Un puerto solo se revela con escaneo sigiloso o completo. Al encontrarlo, usa netcat o curl para obtener el banner con la flag.",
            },
            {
                id: 2,
                title: "Manipulacion de sesion y parametros",
                initialHint:
                    "Con RCE en cmd se obtiene users.txt. Luego hay que ajustar sesion para acceder con id=10 y recuperar una flag en comentarios del codigo.",
                notes: "Puede resolverse con Burp Suite o curl modificando nombre de sesion y parametros.",
            },
            {
                id: 3,
                title: "Explotacion SQLi",
                initialHint: "Flag pendiente de definicion final para este bloque de laboratorio.",
                penaltyHint: "Pendiente.",
            },
            {
                id: 4,
                title: "SSH + esteganografia con strings",
                initialHint:
                    "Existe una imagen con texto embebido. Extrae texto legible y filtra por el prefijo de la flag.",
                penaltyHint: "El comando strings permite visualizar texto en binarios.",
            },
            {
                id: 5,
                title: "Escalada de privilegios via cronjob",
                initialHint:
                    "Un cronjob de root ejecuta un script con permisos mal configurados que puede editarse para lograr elevacion.",
                penaltyHint: "Revisa tareas programadas y debilidades en scripts ejecutados automaticamente.",
                notes: "Flag final en /root/FINAL_FLAG.txt.",
            },
        ],
    },
};

function prettyDate(value: string | null): string {
    if (!value) return "--";
    return new Date(value).toLocaleString("es-MX", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

export default function ChallengeDetailPage() {
    const params = useParams<{ slug: string }>();
    const slug = params.slug;
    const storageKey = `challenge-progress:${slug}`;

    const [challenge, setChallenge] = useState<ChallengeSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [solvedFlags, setSolvedFlags] = useState<number[]>([]);
    const [flagInputs, setFlagInputs] = useState<Record<number, string>>({});
    const [flagErrors, setFlagErrors] = useState<Record<number, string>>({});
    const [activeHintFlag, setActiveHintFlag] = useState<LabFlag | null>(null);

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            setIsLoading(true);
            try {
                const response = await fetch("/api/ctfd/challenges", { cache: "no-store" });
                if (!response.ok) throw new Error("No se pudo cargar el challenge");

                const payload = (await response.json()) as ChallengesResponse;
                const match = payload.challenges.find((item) => item.slug === slug);

                if (!isMounted) return;

                if (!match) {
                    setError("Challenge no encontrado");
                    setChallenge(null);
                    return;
                }

                setChallenge(match);
                setError(null);
            } catch {
                if (!isMounted) return;
                setError("Error cargando datos del challenge");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        void load();

        return () => {
            isMounted = false;
        };
    }, [slug]);

    const dossier = useMemo(() => LAB_DOSSIERS[slug] ?? null, [slug]);

    useEffect(() => {
        if (!dossier) {
            setSolvedFlags([]);
            return;
        }

        const raw = window.localStorage.getItem(storageKey);
        if (!raw) {
            setSolvedFlags([]);
            return;
        }

        try {
            const parsed = JSON.parse(raw) as unknown;
            if (!Array.isArray(parsed)) {
                setSolvedFlags([]);
                return;
            }

            const normalized = parsed
                .filter((value): value is number => typeof value === "number")
                .filter((value) => value >= 1 && value <= dossier.flags.length)
                .sort((a, b) => a - b)
                .filter((value, index, list) => list.indexOf(value) === index);

            setSolvedFlags(normalized);
        } catch {
            setSolvedFlags([]);
        }
    }, [dossier, storageKey]);

    const solveFlag = (flagId: number) => {
        const previousFlag = flagId - 1;
        const canUnlock = flagId === 1 || solvedFlags.includes(previousFlag);
        if (!canUnlock) return;

        if (solvedFlags.includes(flagId)) return;

        const updated = [...solvedFlags, flagId].sort((a, b) => a - b);
        setSolvedFlags(updated);
        window.localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    const updateFlagInput = (flagId: number, value: string) => {
        setFlagInputs((previous) => ({
            ...previous,
            [flagId]: value,
        }));

        setFlagErrors((previous) => {
            if (!previous[flagId]) return previous;
            const copy = { ...previous };
            delete copy[flagId];
            return copy;
        });
    };

    const submitFlag = (flagId: number) => {
        const previousFlag = flagId - 1;
        const canUnlock = flagId === 1 || solvedFlags.includes(previousFlag);
        if (!canUnlock || solvedFlags.includes(flagId)) return;

        const candidate = (flagInputs[flagId] ?? "").trim();
        if (!candidate) {
            setFlagErrors((previous) => ({
                ...previous,
                [flagId]: "Debes ingresar una flag antes de enviarla.",
            }));
            return;
        }

        solveFlag(flagId);
        setFlagInputs((previous) => ({
            ...previous,
            [flagId]: "",
        }));
    };

    const resetProgress = () => {
        setSolvedFlags([]);
        window.localStorage.removeItem(storageKey);
    };

    const completedCount = solvedFlags.length;
    const totalFlagCount = dossier?.flags.length ?? challenge?.totalFlags ?? 0;
    const completionPercent = totalFlagCount > 0 ? Math.round((completedCount / totalFlagCount) * 100) : 0;

    return (
        <main className="relative min-h-screen bg-[#090013] text-white overflow-hidden">
            <div className="fixed inset-0 z-0 overflow-hidden">
                <Boxes />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(239,1,186,0.18),transparent_45%),linear-gradient(180deg,rgba(9,0,19,0.85),rgba(9,0,19,1))]" />
            </div>

            <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <Link
                    href="/challenges"
                    className="inline-flex items-center gap-2 font-mono text-xs text-[#00F0FF] hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al mapa de challenges
                </Link>

                {isLoading ? (
                    <section className="mt-6 border border-white/15 bg-black/55 p-8 flex items-center justify-center">
                        <div className="w-7 h-7 border-2 border-[#EF01BA] border-t-transparent rounded-full animate-spin" />
                    </section>
                ) : error || !challenge ? (
                    <section className="mt-6 border border-[#ff5f5f]/30 bg-[#ff5f5f]/10 p-6">
                        <p className="font-mono text-sm text-[#ff9a9a]">{error ?? "Challenge no disponible"}</p>
                    </section>
                ) : (
                    <section className="mt-6 border border-white/15 bg-black/60 p-6 sm:p-8">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#00F0FF] inline-flex items-center gap-1.5">
                                    <TerminalSquare className="w-3.5 h-3.5" />
                                    expediente de mission
                                </p>
                                <h1 className="font-heading text-3xl sm:text-4xl text-[#EF01BA] font-bold mt-1">{challenge.name}</h1>
                                <p className="font-mono text-sm text-white/55 mt-1">{challenge.type}</p>
                            </div>
                            <span className="font-mono text-xs text-[#FEF759] border border-[#FEF759]/40 bg-[#FEF759]/10 px-3 py-1">
                                {challenge.points} PTS
                            </span>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            <div className="border border-white/10 bg-black/40 p-3">
                                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Categoria</p>
                                <p className="text-white/85 text-sm">{challenge.category}</p>
                            </div>
                            <div className="border border-white/10 bg-black/40 p-3">
                                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Dificultad</p>
                                <p className="text-white/85 text-sm">{challenge.difficulty}</p>
                            </div>
                            <div className="border border-white/10 bg-black/40 p-3">
                                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Flags</p>
                                <p className="text-white/85 text-sm">
                                    {completedCount} / {totalFlagCount} desbloqueadas
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 border border-white/10 bg-black/35 p-4">
                            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#00F0FF]">Lore del laboratorio</p>
                            <p className="text-white/80 text-sm leading-relaxed mt-2">{challenge.lore}</p>
                            <p className="text-white/65 text-sm leading-relaxed mt-3">{challenge.description}</p>
                        </div>

                        <div className="mt-6 font-mono text-xs text-white/70 space-y-1">
                            <p>Estado: {challenge.status}</p>
                            <p>Completado por equipo: {prettyDate(challenge.completedAt)}</p>
                            <p>
                                First Blood: {challenge.firstBlood ? `${challenge.firstBlood.teamName} · ${prettyDate(challenge.firstBlood.timestamp)}` : "pendiente"}
                            </p>
                        </div>

                        <div className="mt-7 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                            <section className="border border-white/10 bg-black/40 p-4">
                                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">Progreso del laboratorio</p>
                                <p className="font-heading text-2xl text-[#EF01BA] mt-1">{completionPercent}%</p>
                                <p className="text-sm text-white/75 mt-1">{completedCount} de {totalFlagCount} flags completadas</p>

                                <div className="mt-3 grid grid-cols-5 gap-1">
                                    {Array.from({ length: Math.max(5, totalFlagCount || 0) }, (_, index) => (
                                        <span
                                            key={`progress-segment-${index + 1}`}
                                            className={`h-2 ${index < completedCount ? "bg-[#EF01BA]" : "bg-white/15"}`}
                                        />
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={resetProgress}
                                    className="mt-4 w-full border border-white/30 hover:bg-white/10 px-3 py-2 font-mono text-xs text-white/80 transition-colors"
                                >
                                    Reiniciar progreso local
                                </button>
                            </section>
                        </div>

                        {dossier ? (
                            <section className="mt-6 border border-[#EF01BA]/30 bg-[#13051e]/80 p-4 sm:p-5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#FEF759]">Dossier del laboratorio</p>
                                </div>

                                <p className="text-sm text-white/80 mt-3"><span className="text-[#00F0FF]">Enfoque:</span> {dossier.focus}</p>
                                <p className="text-sm text-white/75 mt-2 leading-relaxed">{dossier.story}</p>

                                <div className="mt-5 space-y-3">
                                    {dossier.flags.map((flag, index) => {
                                        const isCompleted = solvedFlags.includes(flag.id);
                                        const isUnlocked = flag.id === 1 || solvedFlags.includes(flag.id - 1);

                                        return (
                                            <article key={flag.id} className="border border-white/10 bg-black/35 p-4">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <p className="font-mono text-sm text-white/90">
                                                        FLAG {flag.id}: {flag.title}
                                                    </p>

                                                    {isCompleted ? (
                                                        <span className="inline-flex items-center gap-1 border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 px-2 py-1 text-[11px] font-mono">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            COMPLETADA
                                                        </span>
                                                    ) : isUnlocked ? (
                                                        <span className="inline-flex items-center gap-1 border border-[#00F0FF]/35 bg-[#00F0FF]/10 text-[#00F0FF] px-2 py-1 text-[11px] font-mono">
                                                            <Unlock className="w-3.5 h-3.5" />
                                                            DESBLOQUEADA
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 border border-white/20 bg-white/5 text-white/55 px-2 py-1 text-[11px] font-mono">
                                                            <Lock className="w-3.5 h-3.5" />
                                                            BLOQUEADA
                                                        </span>
                                                    )}
                                                </div>

                                                {isUnlocked ? (
                                                    <div className="mt-3 space-y-2 text-sm text-white/80">
                                                        {!isCompleted ? (
                                                            <>
                                                                <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                                                                    <input
                                                                        type="text"
                                                                        value={flagInputs[flag.id] ?? ""}
                                                                        onChange={(event) => updateFlagInput(flag.id, event.target.value)}
                                                                        placeholder="Ingresa la flag"
                                                                        className="w-full border border-white/25 bg-black/35 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-[#00F0FF] focus:outline-none"
                                                                    />

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => submitFlag(flag.id)}
                                                                        className="inline-flex items-center justify-center border border-[#EF01BA]/40 bg-[#EF01BA]/15 hover:bg-[#EF01BA]/25 text-white px-3 py-2 font-mono text-xs transition-colors"
                                                                    >
                                                                        Enviar flag
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setActiveHintFlag(flag)}
                                                                        className="inline-flex items-center justify-center border border-[#00F0FF]/40 bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] px-3 py-2 font-mono text-xs transition-colors"
                                                                    >
                                                                        Hint
                                                                    </button>
                                                                </div>

                                                                {flagErrors[flag.id] ? (
                                                                    <p className="text-xs text-[#ff9a9a]">{flagErrors[flag.id]}</p>
                                                                ) : null}
                                                            </>
                                                        ) : null}
                                                    </div>
                                                ) : (
                                                    <p className="mt-3 text-sm text-white/55">
                                                        Completa la FLAG {index} para desbloquear esta seccion.
                                                    </p>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>

                                {dossier.finalMessage ? (
                                    <div className="mt-5 border border-[#00F0FF]/25 bg-[#00161b]/60 p-3 text-sm text-white/85">
                                        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#00F0FF]">Mensaje final del caso</p>
                                        <p className="mt-2">{dossier.finalMessage}</p>
                                    </div>
                                ) : null}
                            </section>
                        ) : (
                            <section className="mt-6 border border-[#ffae5f]/30 bg-[#ffae5f]/10 p-4">
                                <p className="font-mono text-sm text-[#ffd5a8] inline-flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4" />
                                    Este challenge no tiene dossier extendido de flags en esta version.
                                </p>
                            </section>
                        )}

                        <div className="mt-7">
                            <Link
                                href="/challenges"
                                className="inline-flex items-center justify-center border border-white/30 hover:bg-white/10 px-4 py-3 font-mono text-sm text-white/80 transition-colors"
                            >
                                Volver al Path
                            </Link>
                        </div>
                    </section>
                )}
            </div>

            {activeHintFlag ? (
                <div className="fixed inset-0 z-30 flex items-center justify-center px-4" role="dialog" aria-modal="true">
                    <button
                        type="button"
                        aria-label="Cerrar modal de hint"
                        className="absolute inset-0 bg-black/70"
                        onClick={() => setActiveHintFlag(null)}
                    />

                    <div className="relative z-10 w-full max-w-lg border border-[#00F0FF]/35 bg-[#0b0514] p-5">
                        <div className="flex items-start justify-between gap-3">
                            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#00F0FF]">Hint de FLAG {activeHintFlag.id}</p>
                            <button
                                type="button"
                                onClick={() => setActiveHintFlag(null)}
                                className="border border-white/25 px-2 py-1 font-mono text-[11px] text-white/80 hover:bg-white/10 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>

                        <p className="mt-3 text-sm text-white/90">
                            <span className="text-[#00F0FF]">Pista inicial:</span> {activeHintFlag.initialHint}
                        </p>

                        {activeHintFlag.penaltyHint ? (
                            <p className="mt-2 text-sm text-white/85">
                                <span className="text-[#FEF759]">Pista con penalizacion:</span> {activeHintFlag.penaltyHint}
                            </p>
                        ) : null}

                        {activeHintFlag.notes ? (
                            <p className="mt-2 text-sm text-white/70">Nota: {activeHintFlag.notes}</p>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </main>
    );
}
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	ExternalLink,
	Flag,
	ShieldAlert,
	TerminalSquare,
	Trophy,
} from "lucide-react";
import { Boxes } from "@/components/ui/background-boxes";
import { ChallengeDossierTerminal } from "@/components/shared/ChallengeDossierTerminal";
import ChallengesGlobe, { type GlobeContinent } from "./ChallengesGlobe";
import type { ChallengeSummary, ChallengeDetailResponse, ChallengesResponse } from "@/types/challenges";
import type { ScoreboardResponse } from "@/types/scoreboard";
import { ctfdGetMyTeamStats, ctfdGetMyTeamSolves } from "@/services/ctfd/teams";

const LORE_ONCE_KEY = "challenges:lore-played:v2";
const LORE_TEXT =
	"[TRANSMISION INTERCEPTADA] Operador, una red hostil activo nodos durmientes en la malla global. Cada lab contiene evidencia cifrada, rutas de acceso y artefactos comprometidos. Tu escuadron debe capturar flags, cortar la cadena de ataque y recuperar control antes de que la ventana tactica se cierre.";

const CATEGORY_FALLBACK: Record<string, GlobeContinent> = {
  'Web':       'Asia',
  'Pwn':       'South America',
  'Crypto':    'Oceania',
  'Forensics': 'Europe',
  'Reverse':   'Africa',
  'OSINT':     'Europe',
  'General':   'North America',
  'Misc':      'North America',
}

function difficultyTone(difficulty: ChallengeSummary["difficulty"]) {
	switch (difficulty) {
		case "Easy":
			return { label: "Easy", className: "text-emerald-300 border-emerald-400/35 bg-emerald-500/10", bar: "bg-emerald-400", level: 1 };
		case "Medium":
			return { label: "Medium", className: "text-yellow-300 border-yellow-400/35 bg-yellow-500/10", bar: "bg-yellow-400", level: 2 };
		case "Hard":
			return { label: "Hard", className: "text-orange-300 border-orange-400/35 bg-orange-500/10", bar: "bg-orange-400", level: 3 };
		default:
			return { label: "Insane", className: "text-red-300 border-red-400/35 bg-red-500/10", bar: "bg-red-500", level: 4 };
	}
}

function categoryTone(category: string) {
	const lookup: Record<string, string> = {
		Test: "text-sky-200 border-sky-400/35 bg-sky-500/10",
		Web: "text-cyan-200 border-cyan-400/35 bg-cyan-500/10",
		Forensics: "text-violet-200 border-violet-400/35 bg-violet-500/10",
		Pwn: "text-pink-200 border-pink-400/35 bg-pink-500/10",
		Crypto: "text-indigo-200 border-indigo-400/35 bg-indigo-500/10",
		Reverse: "text-orange-200 border-orange-400/35 bg-orange-500/10",
		OSINT: "text-lime-200 border-lime-400/35 bg-lime-500/10",
		General: "text-slate-200 border-slate-400/35 bg-slate-500/10",
	};

	return lookup[category] ?? "text-white/80 border-white/30 bg-white/10";
}

function statusTone(status: ChallengeSummary["status"]) {
	if (status === "COMPLETED") {
		return "text-emerald-300 border-emerald-400/40 bg-emerald-500/10";
	}

	if (status === "IN_PROGRESS") {
		return "text-yellow-300 border-yellow-400/35 bg-yellow-500/10";
	}

	return "text-cyan-300 border-cyan-400/35 bg-cyan-500/10";
}

function operationalStatus(challenge: ChallengeSummary) {
	if (challenge.solvedByTeam) {
		return {
			label: "RESUELTO POR EL EQUIPO",
			className: "text-emerald-300 border-emerald-400/35 bg-emerald-500/10",
		};
	}

	if (challenge.status === "COMPLETED") {
		return {
			label: "COMPLETADO POR MI",
			className: "text-cyan-300 border-cyan-400/35 bg-cyan-500/10",
		};
	}

	if (challenge.status === "IN_PROGRESS") {
		return {
			label: "EN PROGRESO",
			className: "text-yellow-300 border-yellow-400/35 bg-yellow-500/10",
		};
	}

	return {
		label: "DISPONIBLE",
		className: "text-white/80 border-white/25 bg-white/5",
	};
}

function prettyDate(value: string | null): string {
	if (!value) return "--";
	return new Date(value).toLocaleString("es-MX", {
		dateStyle: "short",
		timeStyle: "short",
	});
}

function parseLoreFromDescription(rawDesc: string): string {
	if (!rawDesc || !rawDesc.includes('---')) return rawDesc
	const parts = rawDesc.split('---')
	return parts[0].trim()
}

export default function ChallengesPage() {
	const [payload, setPayload] = useState<ChallengesResponse | null>(null);
	const [scoreboard, setScoreboard] = useState<ScoreboardResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null);
	const [detail, setDetail] = useState<ChallengeSummary | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);

	const [loreText, setLoreText] = useState("");
	const [loreAnimated, setLoreAnimated] = useState(false);

	const [deltaScore, setDeltaScore] = useState<number | null>(null);
	const [selectedContinent, setSelectedContinent] = useState<GlobeContinent | null>(null);
	const [hoveredChallengeId, setHoveredChallengeId] = useState<number | null>(null);
	const [isGlobeHovered, setIsGlobeHovered] = useState(false);
	const [isGlobeDragging, setIsGlobeDragging] = useState(false);
	const previousScoreRef = useRef<number | null>(null);
	const deltaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const selectedSummary = useMemo(
		() => payload?.challenges.find((challenge) => challenge.id === selectedChallengeId) ?? null,
		[payload?.challenges, selectedChallengeId]
	);

	const selectedChallenge = detail ?? selectedSummary;

	const challengeContinent = useCallback((challenge: ChallengeSummary): GlobeContinent => {
		if (challenge.continent) return challenge.continent as GlobeContinent

		return CATEGORY_FALLBACK[challenge.category] ?? 'North America'

	}, []);

	const challengesByContinent = useMemo(() => {
		const result: Record<GlobeContinent, ChallengeSummary[]> = {
			"Antartida Sur": [],
			"North America": [],
			"South America": [],
			Europe: [],
			Africa: [],
			Asia: [],
			Oceania: [],
		};

		for (const challenge of payload?.challenges ?? []) {
			result[challengeContinent(challenge)].push(challenge);
		}

		return result;
	}, [challengeContinent, payload?.challenges]);

	const machineGroups = useMemo(() => {
		const map = new Map<string, ChallengeSummary[]>()
		for (const chs of Object.values(challengesByContinent)) {
			for (const ch of chs) {
			if (!ch.machineId) continue
			const key = `${ch.continent}::${ch.machineId}`
			const group = map.get(key) ?? []
			group.push(ch)
			map.set(key, group)
			}
		}
		// Ordena cada grupo por step ascendente
		for (const [k, g] of map.entries()) {
			map.set(k, [...g].sort((a, b) => (a.step ?? 0) - (b.step ?? 0)))
		}
		return map
	}, [challengesByContinent])

	const displayChallenge = useMemo(() => {
		if (!selectedChallenge) return null

		// Si tiene machineId, fusionamos los datos visuales
		if (selectedChallenge.machineId) {
		const key = `${selectedChallenge.continent}::${selectedChallenge.machineId}`
		const steps = machineGroups.get(key) || [selectedChallenge]
		
		const step1 = steps.find(s => s.step === 1) || steps[0]
		const totalPts = steps.reduce((sum, s) => sum + s.points, 0)
		const captured = steps.filter(s => s.status === 'COMPLETED' || s.solvedByTeam).length
		const allSolved = captured === steps.length
		const firstAvail = steps.find(s => s.status !== 'COMPLETED' && !s.solvedByTeam) ?? steps[0]

		const baseName = step1.name.includes('-') 
			? step1.name.split('-')[0].trim() 
			: (step1.machineId?.toUpperCase() || step1.name)

		return {
			...selectedChallenge,
			name: baseName,
			points: totalPts,
			totalFlags: steps.length,
			capturedFlags: captured,
			status: (allSolved ? 'COMPLETED' : (captured > 0 ? 'IN_PROGRESS' : 'AVAILABLE')) as ChallengeSummary['status'],
			slug: firstAvail.slug, // <-- El botón "Ir al lab" llevará a la flag no resuelta
			solvedByTeam: allSolved
		}
		}

		// Si es un reto normal, se muestra tal cual
		return selectedChallenge
	}, [selectedChallenge, machineGroups])

	// Centro geográfico de cada continente — un único punto de objetivo
	const CONTINENT_CENTER: Record<GlobeContinent, [number, number]> = {
	'North America':  [40.0, -100.0],
	'South America':  [-15.0, -60.0],
	'Europe':         [54.0,   15.0],
	'Africa':         [  5.0,   20.0],
	'Asia':           [40.0,   90.0],
	'Oceania':        [-25.0,  135.0],
	'Antartida Sur':  [-80.0,    0.0],
	}

	const countryPoints = useMemo(() => {
	// Solo emitir un punto por continente que tenga al menos 1 challenge
	return (Object.entries(challengesByContinent) as Array<[GlobeContinent, ChallengeSummary[]]>)
		.filter(([continent, items]) => 
			items.length > 0 && continent !== 'Antartida Sur'
		)
		.map(([continent, items]) => {
		const isSelected = selectedContinent === continent
		// Primer challenge del continente como representante del hotspot
		const representative = [...items].sort((a, b) => (a.step ?? 0) - (b.step ?? 0))[0]
		return {
			id:          `${continent}-center`,
			challengeId: representative.id,
			continent,
			location:    CONTINENT_CENTER[continent] as [number, number],
			size:        isSelected ? 0.032 : 0.026,
			color:       isSelected
			? [1, 0.85, 0] as [number, number, number]   // dorado cuando está seleccionado
  			: [1, 0.08, 0.08] as [number, number, number] // rojo por default
		}
		})
	}, [challengesByContinent, selectedContinent])

	const hotspotPoints = useMemo(() => {
		return countryPoints.map((point) => ({
			id: point.id,
			location: point.location,
			size: point.size,
			color: point.color,
		}));
	}, [countryPoints]);

	const hotspotIndex = useMemo(() => {
		return new Map(countryPoints.map((point) => [point.id, point]));
	}, [countryPoints]);

	const hoveredChallenge = useMemo(
		() => payload?.challenges.find((challenge) => challenge.id === hoveredChallengeId) ?? null,
		[hoveredChallengeId, payload?.challenges]
	);

	const continentChallenges = selectedContinent ? (challengesByContinent[selectedContinent] ?? []) : [];
	const selectedContinentSolved = useMemo(
		() => continentChallenges.filter((challenge) => challenge.solvedByTeam || challenge.status === "COMPLETED").length,
		[continentChallenges]
	);

	const selectedContinentCategorySummary = useMemo(() => {
		const counters = new Map<string, number>();
		for (const challenge of continentChallenges) {
			counters.set(challenge.category, (counters.get(challenge.category) ?? 0) + 1);
		}

		return [...counters.entries()]
			.sort((a, b) => b[1] - a[1])
			.map(([category, count]) => `${category}: ${count}`);
	}, [continentChallenges]);

	const shouldShowOnboardingOverlay = !selectedContinent && !isGlobeHovered && !isGlobeDragging;
	const shouldShowGlobeHudHint = !selectedContinent && (isGlobeHovered || isGlobeDragging);

	const quickAccessChallenges = useMemo(() => {
		if (!payload?.challenges) return []

		const items: typeof payload.challenges = []
		const seenMachines = new Set<string>()

		for (const ch of payload.challenges) {
		if (ch.continent === 'Antartida Sur') continue

		if (ch.machineId) {
			const key = `${ch.continent}::${ch.machineId}`
			if (!seenMachines.has(key)) {
			seenMachines.add(key)
			// Obtener todos los steps de esta máquina
			const steps = payload.challenges.filter(
				c => c.machineId === ch.machineId && c.continent === ch.continent
			)
			const totalPts = steps.reduce((sum, s) => sum + s.points, 0)
			const captured = steps.filter(s => s.status === 'COMPLETED' || s.solvedByTeam).length
			const allSolved = captured === steps.length
			const step1 = steps.find(s => s.step === 1) ?? steps[0]

			// Extraer nombre base (ej. "Intro - Flag 1" -> "Intro")
			const baseName = step1.name.includes('-') 
				? step1.name.split('-')[0].trim() 
				: (step1.machineId?.toUpperCase() || step1.name)

			// Insertar máquina virtual
				items.push({
					...step1,
					name: baseName,
					points: totalPts,
					status: (allSolved ? 'COMPLETED' : (captured > 0 ? 'IN_PROGRESS' : 'AVAILABLE')) as ChallengeSummary['status'],
					solvedByTeam: allSolved,
				})
			}
		} else {
			// Reto normal
			items.push(ch)
		}
		}

		return items
		.sort((a, b) => {
			if (a.category === 'Test' && b.category !== 'Test') return -1
			if (a.category !== 'Test' && b.category === 'Test') return 1
			if (a.solvedByTeam && !b.solvedByTeam) return -1
			if (!a.solvedByTeam && b.solvedByTeam) return 1
			if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return -1
			if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return 1
			if (a.status === 'AVAILABLE' && b.status === 'COMPLETED') return -1
			if (a.status === 'COMPLETED' && b.status === 'AVAILABLE') return 1
			return b.points - a.points
		})
		.slice(0, 8)
	}, [payload?.challenges])

	const handleHotspotHover = useCallback((hotspotId: string | null) => {
		if (!hotspotId) {
			setHoveredChallengeId(null);
			return;
		}

		const point = hotspotIndex.get(hotspotId);
		setHoveredChallengeId(point?.challengeId ?? null);
	}, [hotspotIndex]);

	const handleHotspotSelect = useCallback((hotspotId: string) => {
		const point = hotspotIndex.get(hotspotId);
		if (!point) return;

		setSelectedContinent(point.continent);
		setHoveredChallengeId(point.challengeId);
		setSelectedChallengeId(point.challengeId);
	}, [hotspotIndex]);

	const handleContinentSelect = useCallback((continent: GlobeContinent) => {
		setSelectedContinent(continent);
		setHoveredChallengeId(null);
	}, []);

	const handleQuickAccess = useCallback((challenge: ChallengeSummary) => {
		handleContinentSelect(challengeContinent(challenge));
		setHoveredChallengeId(challenge.id);
		setSelectedChallengeId(challenge.id);
		setIsGlobeDragging(false);
	}, [challengeContinent, handleContinentSelect]);

	const clearContinentSelection = useCallback(() => {
		setSelectedContinent(null)
		setSelectedChallengeId(null)
		setHoveredChallengeId(null)
	}, []);

	// Panel de progreso de equipo (Lógica)
	// TODO: Esta logica debe renderizarsa cada cierto tiempo o calcular cuando el usuario haya hecho submit
	const [progressStats, setProgressStats] = useState<{
		completedLabs: number;
		totalLabs: number;
		score: number;
		rank: number | null;
	} | null>(null);

	const [isProgressLoading, setIsProgressLoading] = useState(true);

	const fetchTeamProgress = useCallback(async () => {
	setIsProgressLoading(true); // Opcional: mostrar UI de carga al actualizar
		try {
			const res = await fetch('/api/teams/progress');
			if (res.ok) {
				const json = await res.json();
				if (json.success) {
					setProgressStats(json.data);
				}
			}
		} catch (error) {
			console.error('Error fetching team progress:', error);
		} finally {
			setIsProgressLoading(false);
		}
	}, []);

	// El useEffect inicial para cuando carga la página
	useEffect(() => {
		fetchTeamProgress();
	}, [fetchTeamProgress]);



	useEffect(() => {
		if (!selectedContinent) {
			setSelectedChallengeId(null);
			return;
		}

		const list = challengesByContinent[selectedContinent] ?? [];
		if (!list.length) {
			setSelectedChallengeId(null);
			return;
		}

		const existsInSector = list.some((challenge) => challenge.id === selectedChallengeId);
		if (!existsInSector) {
			setSelectedChallengeId(list[0].id);
		}
	}, [challengesByContinent, selectedChallengeId, selectedContinent]);

	const activeGlobeLocation = useMemo<[number, number] | undefined>(() => {
		if (selectedContinent) {
			const locationByContinent: Record<GlobeContinent, [number, number]> = {
				"Antartida Sur": [-68.0, 5.0],
				"North America": [41.5, -100.0],
				"South America": [-17.0, -60.0],
				Europe: [52.0, 14.0],
				Africa: [5.0, 20.0],
				Asia: [35.0, 95.0],
				Oceania: [-25.0, 134.0],
			};

			return locationByContinent[selectedContinent];
		}

		if (!selectedChallenge) return undefined;
		const locationMap: Record<string, [number, number]> = {
			Web: [40.7128, -74.006],
			Forensics: [51.5074, -0.1278],
			Pwn: [35.6762, 139.6503],
			Crypto: [48.8566, 2.3522],
			Reverse: [19.4326, -99.1332],
			OSINT: [52.52, 13.405],
			General: [34.0522, -118.2437],
		};
		return locationMap[selectedChallenge.category] ?? locationMap.General;
	}, [selectedChallenge, selectedContinent]);

	const loadChallenges = useCallback(async () => {
			const response = await fetch("/api/challenges", { cache: "no-store" });
		if (!response.ok) {
			throw new Error("No se pudo obtener la lista de retos");
		}
		const data = (await response.json()) as ChallengesResponse;
		return data;
	}, []);

	const isRefreshingRef = useRef(false)

	const refreshAll = useCallback(async () => {
		if (isRefreshingRef.current) return  // ← evitar concurrencia
		isRefreshingRef.current = true
		try {
			const challengeData = await loadChallenges()
			setPayload(challengeData)
			setError(null)
		} catch {
			setPayload(prev => {
			if (prev === null) setError('No fue posible cargar challenges en este momento.')
			return prev
			})
		} finally {
			setLoading(false)
			isRefreshingRef.current = false
		}
		}, [loadChallenges])

	useEffect(() => {
		void refreshAll();

		const interval = window.setInterval(() => {
			void refreshAll();
		}, 12_000);

		const visibilityHandler = () => {
			if (document.visibilityState === "visible") {
				void refreshAll();
			}
		};

		document.addEventListener("visibilitychange", visibilityHandler);

		return () => {
			window.clearInterval(interval);
			document.removeEventListener("visibilitychange", visibilityHandler);
			if (deltaTimeoutRef.current) {
				window.clearTimeout(deltaTimeoutRef.current);
			}
		};
	}, [refreshAll]);

	useEffect(() => {
		const score = payload?.progress.teamScore;
		if (typeof score !== "number") return;

		if (previousScoreRef.current === null) {
			previousScoreRef.current = score;
			return;
		}

		if (score > previousScoreRef.current) {
			const delta = score - previousScoreRef.current;
			setDeltaScore(delta);
			if (deltaTimeoutRef.current) {
				clearTimeout(deltaTimeoutRef.current);
			}
			deltaTimeoutRef.current = setTimeout(() => {
				setDeltaScore(null);
			}, 1900);
		}

		previousScoreRef.current = score;
	}, [payload?.progress.teamScore]);

	useEffect(() => {
		let timerId: ReturnType<typeof setInterval> | null = null;

		try {
			const alreadyPlayed = window.localStorage.getItem(LORE_ONCE_KEY) === "1";
			if (alreadyPlayed) {
				setLoreText(LORE_TEXT);
				setLoreAnimated(true);
				return;
			}
		} catch {
			setLoreText(LORE_TEXT);
			setLoreAnimated(true);
			return;
		}

		let index = 0;
		timerId = setInterval(() => {
			index += 1;
			setLoreText(LORE_TEXT.slice(0, index));

			if (index >= LORE_TEXT.length) {
				if (timerId) {
					clearInterval(timerId);
				}
				setLoreAnimated(true);
				try {
					window.localStorage.setItem(LORE_ONCE_KEY, "1");
				} catch {
					// ignore storage errors
				}
			}
		}, 8);

		return () => {
			if (timerId) clearInterval(timerId);
		};
	}, []);

	useEffect(() => {
		const id = selectedChallengeId;
		if (!id) {
			setDetail(null);
			setDetailLoading(false);
			return;
		}

		let active = true;
		setDetail(null);

		const loadDetail = async () => {
			setDetailLoading(true);
			try {
				const response = await fetch(`/api/challenges/${id}`, { cache: "no-store" });
				if (!response.ok) throw new Error("Detail not found");
				const payload = (await response.json()) as ChallengeDetailResponse;
				if (!active) return;
				
				// Parsear descripción para mostrar solo la primera parte (antes de ---)
				const parsedChallenge = {
					...payload.challenge,
					description: parseLoreFromDescription(payload.challenge.description ?? '')
				}
				setDetail(parsedChallenge);
			} catch {
				if (!active) return;
				setDetail(null);
			} finally {
				if (active) {
					setDetailLoading(false);
				}
			}
		};

		void loadDetail();

		return () => {
			active = false;
		};
	}, [selectedChallengeId]);

	return (
		<main className="relative min-h-screen overflow-hidden bg-[#090013] text-white">
			<div className="fixed inset-0 z-0 overflow-hidden">
				<Boxes />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(239,1,186,0.18),transparent_42%),radial-gradient(circle_at_82%_84%,rgba(0,240,255,0.12),transparent_35%),linear-gradient(180deg,rgba(9,0,19,0.84),rgba(9,0,19,1))]" />
			</div>

			<div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
				<section className="sticky top-4 z-20 mb-8 border border-white/15 bg-black/55 px-4 py-4 backdrop-blur-md sm:px-6">
					<div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
						<div>
							<p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00F0FF]">Panel de Progreso de Equipo</p>
							<div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
								<span className="font-mono text-white/80">
									{progressStats?.completedLabs ?? 0} de {progressStats?.totalLabs ?? 0} laboratorios completados
								</span>
								<span className="font-mono text-[#FEF759]">{progressStats?.score ?? 0} pts</span>
								<Link
									href="/home"
									className="inline-flex items-center gap-1.5 border border-white/25 px-2 py-1 font-mono text-[11px] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
								>
									<Trophy className="h-3.5 w-3.5" />
									Rank: {progressStats?.rank ? `#${progressStats?.rank}` : "--"}
								</Link>
								{deltaScore ? (
									<span className="animate-pulse font-mono text-[11px] text-emerald-300">+{deltaScore} pts</span>
								) : null}
							</div>

							<progress
								value={progressStats?.completedLabs ?? 0}
								max={progressStats?.totalLabs ?? 1}
								className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10 [&::-webkit-progress-bar]:bg-white/10 [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-[#00F0FF] [&::-webkit-progress-value]:via-[#EF01BA] [&::-webkit-progress-value]:to-[#F77200] [&::-moz-progress-bar]:bg-[#EF01BA]"
							/>
						</div>

						<div className="justify-self-start border border-[#FEF759]/35 bg-[#FEF759]/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[#FEF759] md:justify-self-end">
							{loading ? "sincronizando" : "synced"}
						</div>
					</div>
				</section>

				<section className="relative overflow-hidden border border-white/15 bg-black/45 p-5 sm:p-7">
					<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(0,240,255,0.14),transparent_40%),radial-gradient(circle_at_85%_85%,rgba(247,114,0,0.12),transparent_35%)]" />
					<div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
						<div>
							<p className="inline-flex items-center gap-2 border border-[#00F0FF]/35 bg-[#00F0FF]/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#00F0FF]">
								<TerminalSquare className="h-4 w-4" />
								Briefing de Mision
							</p>
							<h1 className="mt-4 text-balance font-heading text-3xl font-bold leading-tight text-[#EF01BA] sm:text-4xl">
								Operacion: {payload?.lore.operationName}
							</h1>

							<div className="mt-5 border border-white/15 bg-[#0b0214]/80 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] sm:p-5">
								<p className="font-mono text-sm leading-relaxed text-white/85 sm:text-[15px]">
									{payload?.lore.transmissionText}
									{!loreAnimated ? <span className="animate-pulse text-[#00F0FF]">|</span> : null}
								</p>
							</div>
						</div>

						<div className="grid gap-3 self-start">
							<div className="border border-[#FEF759]/30 bg-[#FEF759]/10 p-3">
								<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FEF759]">Estado de alerta</p>
								<p className="mt-1 font-heading text-lg text-white">{payload?.lore.alertLevel}</p>
							</div>
							<div className="border border-white/15 bg-black/55 p-3">
								<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">Ventana tactica</p>
								<p className="mt-1 font-mono text-sm text-white/80">{payload?.lore.tacticalWindow}</p>
							</div>
							<div className="border border-[#00F0FF]/25 bg-[#00F0FF]/5 p-3">
								<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#00F0FF]">Objetivo primario</p>
								<p className="mt-1 font-mono text-sm text-white/85">{payload?.lore.primaryObjective}</p>
							</div>
						</div>
					</div>
				</section>

				<section className="mt-9">
					<div className="flex items-center justify-between gap-4">
						<h2 className="font-heading text-2xl text-[#FEF759] sm:text-3xl">Globo de Operaciones</h2>
					</div>

					{quickAccessChallenges.length ? (
						<div className="mt-4 border border-white/15 bg-black/40 p-3 sm:p-4">
							<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#00F0FF]">Acceso Rapido</p>
							<div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
								{quickAccessChallenges.map((challenge) => {
									const isFocused = hoveredChallengeId === challenge.id || selectedChallengeId === challenge.id;
									return (
										<button
											key={challenge.id}
											type="button"
											onClick={() => handleQuickAccess(challenge)}
											className={`border px-3 py-2 text-left transition-colors ${isFocused ? "border-[#FEF759]/70 bg-[#FEF759]/10" : "border-white/15 bg-black/55 hover:border-white/35"}`}
										>
											<p className="truncate font-heading text-sm text-white">{challenge.name}</p>
											<p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/65">
												{challengeContinent(challenge)} - {challenge.category}
											</p>
										</button>
									);
								})}
							</div>
						</div>
					) : null}

					{error ? (
						<div className="mt-4 border border-red-500/35 bg-red-500/10 p-4 font-mono text-sm text-red-200">{error}</div>
					) : null}

					{!payload?.challenges?.length && loading ? (
						<div className="mt-6 flex h-32 items-center justify-center border border-white/15 bg-black/45">
							<div className="h-7 w-7 animate-spin rounded-full border-2 border-[#EF01BA] border-t-transparent" />
						</div>
					) : (
						<div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_420px]">
							<div className="relative border border-white/15 bg-black/45 p-4 sm:p-6">
								<p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[#00F0FF]">
									Mission Globe
								</p>
								<div
									onMouseEnter={() => setIsGlobeHovered(true)}
									onMouseLeave={() => setIsGlobeHovered(false)}
									className="relative"
								>
									<ChallengesGlobe
										activeLocation={activeGlobeLocation}
										hotspots={hotspotPoints}
										highlightedContinent={selectedContinent}
										size="lg"
										onContinentSelect={handleContinentSelect}
										onHotspotHover={handleHotspotHover}
										onHotspotSelect={handleHotspotSelect}
										onGlobeDragChange={setIsGlobeDragging}
									/>

									{selectedContinent ? (
										<button
											type="button"
											onClick={clearContinentSelection}
											className="absolute right-3 top-3 z-30 border border-white/25 bg-black/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/90 transition-colors hover:bg-white/10"
										>
											Quitar seleccion de continente
										</button>
									) : null}
								</div>

								{shouldShowOnboardingOverlay ? (
									<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4 transition-opacity duration-300">
										<div className="max-w-md border border-white/25 bg-black/55 px-5 py-4 text-center backdrop-blur-md">
											<p className="font-heading text-xl text-[#FEF759]">Explora el mapa operativo</p>
											<p className="mt-2 font-mono text-xs text-white/75">
												Selecciona un continente para desplegar sus laboratorios que lo contienen...
											</p>
											<div className="mt-3 flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em]">
												<span className="border border-[#00F0FF]/40 bg-[#00F0FF]/10 px-2 py-1 text-[#00F0FF]">Arrastrar = rotar</span>
												<span className="border border-[#EF01BA]/40 bg-[#EF01BA]/10 px-2 py-1 text-[#EF01BA]">Clic = fijar sector</span>
											</div>
										</div>
									</div>
								) : null}

								{shouldShowGlobeHudHint ? (
									<div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 border border-white/20 bg-black/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-white/80 backdrop-blur-sm">
										Arrastra para rotar · clic para fijar continente
									</div>
								) : null}

								{hoveredChallenge && !selectedContinent ? (
									<div className="absolute left-4 top-14 z-20 max-w-sm border border-[#00F0FF]/35 bg-black/75 p-3 backdrop-blur-md sm:p-4">
										<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#00F0FF]">Punto Interactivo</p>
										<p className="mt-1 font-heading text-lg text-white">{hoveredChallenge.name}</p>
										<p className="mt-2 font-mono text-[11px] text-white/65">Haz clic para fijar su sector</p>
									</div>
								) : null}
							</div>

							<aside className="border border-white/15 bg-black/45 p-4 sm:p-5">
								{selectedContinent ? (
									<>
										<div className="flex items-start justify-between gap-3">
											<div>
												<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#00F0FF]">Sector bloqueado</p>
												<h3 className="mt-1 font-heading text-2xl text-[#EF01BA]">{selectedContinent}</h3>
												<p className="mt-1 font-mono text-[11px] text-white/70">
													{continentChallenges.length} flags · {selectedContinentSolved}/{continentChallenges.length || 1} resueltos por el equipo
												</p>
											</div>
											<button
												type="button"
												onClick={clearContinentSelection}
												className="border border-white/25 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/80 transition-colors hover:bg-white/10"
											>
												Quitar selección de continente
											</button>
										</div>

										{selectedContinentCategorySummary.length ? (
											<div className="mt-3 flex flex-wrap gap-1.5">
												{selectedContinentCategorySummary.slice(0, 5).map((item) => (
													<span
														key={item}
														className="border border-white/20 bg-white/5 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/70"
													>
														{item}
													</span>
												))}
											</div>
										) : null}

										{/* {continentChallenges.length > 1 && (
											<>
												<p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[#00F0FF]">
													Challenges disponibles:
												</p>
												<div className="mt-2 max-h-56 space-y-2 overflow-y-auto pr-1">
													{continentChallenges
														.filter((challenge) => !challenge.machineId)
														.map((challenge) => {
															const difficulty = difficultyTone(challenge.difficulty)
															const operation = operationalStatus(challenge)
															const isActive = selectedChallengeId === challenge.id

															return (
																<button
																	key={challenge.id}
																	type="button"
																	onClick={() => setSelectedChallengeId(challenge.id)}
																	className={`w-full border p-2.5 text-left transition-colors ${
																		isActive
																			? "border-[#00F0FF]/55 bg-[#00F0FF]/10"
																			: "border-white/15 bg-black/55 hover:border-white/35"
																	}`}
																>
																	<div className="flex items-start justify-between gap-2">
																		<p className="font-heading text-base text-white">{challenge.name}</p>
																		<p className="font-mono text-xs text-[#FEF759]">{challenge.points} pts</p>
																	</div>
																	<div className="mt-2 flex flex-wrap gap-1.5">
																		<span className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase ${categoryTone(challenge.category)}`}>
																			{challenge.category}
																		</span>
																		<span className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase ${difficulty.className}`}>
																			{difficulty.label}
																		</span>
																		<span className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase ${operation.className}`}>
																			{operation.label}
																		</span>
																	</div>
																</button>
															)
														})}

													{Array.from(
														new Set(
															continentChallenges
																.filter((challenge) => challenge.machineId)
																.map((challenge) => `${challenge.continent}::${challenge.machineId}`)
														)
													).map((key) => {
														const steps = machineGroups.get(key) ?? []
														if (!steps.length) return null

														const step1 = steps.find((step) => step.step === 1) ?? steps[0]
														const totalPts = steps.reduce((acc, step) => acc + step.points, 0)
														const captured = steps.filter((step) => step.status === 'COMPLETED' || step.solvedByTeam).length
														const machineName = step1.name.includes('-')
															? step1.name.split('-')[0].trim()
															: (step1.machineId?.toUpperCase() || key)
														const isActive = steps.some((step) => step.id === selectedChallengeId)

														return (
															<button
																key={key}
																type="button"
																onClick={() => setSelectedChallengeId(step1.id)}
																className={`w-full border p-2.5 text-left transition-colors ${
																	isActive
																		? "border-[#00F0FF55] bg-[#00F0FF10]"
																		: "border-white/15 bg-black/55 hover:border-white/35"
																}`}
															>
																<div className="flex items-start justify-between gap-2">
																	<p className="font-heading text-base text-white">{machineName}</p>
																	<p className="font-mono text-xs text-[#FEF759]">{totalPts} pts</p>
																</div>
																<div className="mt-2 flex items-center gap-1.5">
																	{steps.map((step, index) => (
																		<span
																			key={step.id}
																			className={`h-2 w-2 rounded-full border transition-colors ${
																				step.solvedByTeam || step.status === 'COMPLETED'
																					? 'border-emerald-400 bg-emerald-400'
																					: selectedChallengeId === step.id
																					? 'border-[#00F0FF] bg-[#00F0FF40]'
																					: 'border-white/30 bg-transparent'
																			}`}
																			title={`Flag ${index + 1}${step.status === 'COMPLETED' ? ' ✓' : ''}`}
																		/>
																	))}
																	<span className="ml-1 font-mono text-[10px] text-white/60">
																		{captured}/{steps.length} flags
																	</span>
																</div>
															</button>
														)
													})}
												</div>
											</>
										)} */}

										{/* Detail Panel */}
										{detailLoading || !displayChallenge ? (
											<div className="mt-6 flex h-20 items-center justify-center">
											<div className="h-6 w-6 animate-spin rounded-full border-2 border-[#EF01BA] border-t-transparent"></div>
											</div>
										) : displayChallenge ? (
											<div className="mt-5 border border-white/15 bg-black/55 p-3 sm:p-4">
											<div className="flex flex-wrap items-start justify-between gap-2">
												<p className="font-heading text-xl text-white">{displayChallenge.name}</p>
												<p className="font-mono text-xs text-[#FEF759]">{displayChallenge.points} pts</p>
											</div>

											<div className="mt-2 flex flex-wrap gap-1.5">
												<span className="border px-2 py-1 font-mono text-[10px] uppercase ...">
												{displayChallenge.category}
												</span>
												<span className={`border px-2 py-1 font-mono text-[10px] uppercase ${difficultyTone(displayChallenge.difficulty).className}`}>
												{difficultyTone(displayChallenge.difficulty).label}
												</span>
												<span className={`border px-2 py-1 font-mono text-[10px] uppercase ${operationalStatus(displayChallenge).className}`}>
												{operationalStatus(displayChallenge).label}
												</span>
											</div>

											<p className="mt-2 border border-white/10 bg-black/35 p-2 font-mono text-[11px] text-white/70">
												{displayChallenge.description}
											</p>

											<div className="mt-3 grid gap-2 sm:grid-cols-2">
												{/* Ocultamos "Tipo" si es una máquina agrupada */}
												{!displayChallenge.machineId && (
												<div className="border border-white/10 bg-black/35 p-2.5 font-mono text-xs text-white/75">
													Tipo: {displayChallenge.type}
												</div>
												)}
												
												{/* "Flags" siempre se muestra, pero en máquinas dirá "0/4" */}
												<div className="border border-white/10 bg-black/35 p-2.5 font-mono text-xs text-white/75">
												Flags: {displayChallenge.capturedFlags}/{displayChallenge.totalFlags}
												</div>

												{/* Ocultamos el resto si es máquina agrupada */}
												{!displayChallenge.machineId && (
												<>
													<div className="border border-white/10 bg-black/35 p-2.5 font-mono text-xs text-white/75">
													{displayChallenge.firstBlood 
														? `First Blood: ${displayChallenge.firstBlood.teamName}`
														: 'First Blood pendiente'}
													</div>
													<div className="border border-white/10 bg-black/35 p-2.5 font-mono text-xs text-white/75">
													{displayChallenge.solvedByTeam
														? 'Resuelto por el equipo'
														: displayChallenge.status === 'COMPLETED'
														? 'Completado por mi'
														: 'Reto activo para tu equipo'}
													</div>
												</>
												)}
											</div>

											<div className="mt-4">
												{/* El slug ha sido inyectado inteligentemente para llevarte directo al Flag que te toca resolver */}
												<Link
												href={`/challenges/${displayChallenge.slug}`}
												className="inline-flex w-full items-center justify-center gap-2 border border-[#EF01BA]/45 bg-[#EF01BA]/15 px-4 py-3 font-mono text-sm text-white transition-colors hover:bg-[#EF01BA]/30"
												>
												Ir al lab
												<ExternalLink className="h-4 w-4" />
												</Link>
											</div>
											</div>
										) : (
											<div className="mt-5 border border-white/15 bg-black/35 p-4">
												<p className="font-heading text-lg text-white">Resumen del sector</p>
												<p className="mt-2 text-sm text-white/75">
													Elige un laboratorio de la lista para inspeccionar su expediente tecnico sin cambiar de contexto.
												</p>
											</div>
										)}
									</>
								) : (
									<div className="border border-white/15 bg-black/35 p-4 sm:p-5">
										<p className="font-heading text-xl text-[#FEF759]">Ningun sector seleccionado</p>
										<p className="mt-2 text-sm text-white/75">
											Selecciona un continente para ver retos, dificultad y briefing tecnico en este panel lateral.
										</p>
										<div className="mt-4 border border-[#00F0FF]/25 bg-[#00F0FF]/5 p-3 font-mono text-[11px] text-white/70">
											Flujo recomendado: explora el globo, fija sector y abre el lab desde este mismo panel.
										</div>
									</div>
								)}
							</aside>
						</div>
					)}
				</section>
			</div>
		</main>
	);
}

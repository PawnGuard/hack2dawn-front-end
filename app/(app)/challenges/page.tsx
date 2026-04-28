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

	const countryPoints = useMemo(() => {
		const markerPatternByContinent: Record<GlobeContinent, Array<[number, number]>> = {
			"Antartida Sur": [
				[-68, -22], [-69, -6], [-68, 8], [-67, 24],
			],
			"North America": [
				[57, -141], [54, -130], [52, -120], [50, -109], [48, -98], [45, -86], [42, -75], [39, -123], [36, -111], [33, -99], [30, -88],
			],
			"South America": [
				[9, -79], [4, -73], [-2, -68], [-9, -64], [-16, -62], [-23, -60], [-30, -62], [-37, -66], [-46, -71],
			],
			Europe: [
				[62, -8], [59, 0], [56, 8], [54, 16], [52, 24], [49, 30], [47, 5], [45, 13], [43, 22],
			],
			Africa: [
				[33, -13], [28, -5], [23, 3], [18, 12], [12, 20], [5, 28], [-3, 31], [-12, 27], [-20, 22], [-28, 17], [-33, 11],
			],
			Asia: [
				[62, 68], [58, 82], [54, 96], [50, 110], [46, 124], [42, 138], [36, 78], [32, 92], [28, 106], [24, 120], [20, 134], [16, 148],
			],
			Oceania: [
				[-11, 114], [-16, 123], [-21, 132], [-26, 141], [-31, 151], [-36, 159], [-40, 147],
			],
		};

		return (Object.entries(challengesByContinent) as Array<[GlobeContinent, ChallengeSummary[]]>)
			.filter(([, items]) => items.length > 0)
			.map(([continent, items]) => {
				const pattern = markerPatternByContinent[continent] ?? [];
				const isSelected = selectedContinent === continent;
				return pattern.map((location, index) => {
					const challenge = items[index % items.length];
					const isAlternate = index % 2 === 0;
					return {
						id: `${continent}:${challenge.id}:${index}`,
						challengeId: challenge.id,
						continent,
						location,
						size: isSelected ? 0.0238 : 0.0215,
						color: (isSelected
							? [0.94, 0.01, 0.73]
							: isAlternate
								? [0, 0.94, 1]
								: [0.94, 0.01, 0.73]) as [number, number, number],
					};
				});
			})
			.flat();
	}, [challengesByContinent, selectedContinent]);

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
	return [...(payload?.challenges ?? [])]
		.filter(challenge => {
		const continent = challengeContinent(challenge)
		return continent !== 'Oceania' && continent !== 'Antartida Sur'
		})
		.sort((a, b) => {
		// 1. Primero los de categoría Test (retos de prueba)
		if (a.category === 'Test' && b.category !== 'Test') return -1
		if (a.category !== 'Test' && b.category === 'Test') return 1
		// 2. Resueltos por el EQUIPO al frente (nuevo)
		if (a.solvedByTeam && !b.solvedByTeam) return -1
		if (!a.solvedByTeam && b.solvedByTeam) return 1
		// 3. Resueltos por mí al frente (solved_by_me via status)
		if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return -1
		if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return 1
		// 4. Disponibles antes que los que aún no se pueden resolver
		if (a.status === 'AVAILABLE' && b.status === 'COMPLETED') return -1
		if (a.status === 'COMPLETED' && b.status === 'AVAILABLE') return 1
		// 5. Mayor puntuación primero
		return b.points - a.points
		})
		.slice(0, 8)
	}, [challengeContinent, payload?.challenges])

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

	const teamPosition = payload?.progress.teamRank ?? null

	const progressValue = payload?.progress.completedChallenges ?? 0;
	const progressMax = payload?.progress.totalChallenges || 1;

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

	const refreshAll = useCallback(async () => {
		try {
			const [challengeData] = await Promise.all([
				loadChallenges(),
			]);

			setPayload(challengeData);

			setError(null);
		} catch {
			setError("No fue posible cargar challenges en este momento.");
		} finally {
			setLoading(false);
		}
	}, [loadChallenges]);

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
				setDetail(payload.challenge);
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
									{payload?.progress.completedChallenges ?? 0} de {payload?.progress.totalChallenges ?? 0} retos completados
								</span>
								<span className="font-mono text-[#FEF759]">{payload?.progress.teamScore ?? 0} pts</span>
								<Link
									href="/home"
									className="inline-flex items-center gap-1.5 border border-white/25 px-2 py-1 font-mono text-[11px] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
								>
									<Trophy className="h-3.5 w-3.5" />
									Rank: {teamPosition ? `#${teamPosition}` : "--"}
								</Link>
								{deltaScore ? (
									<span className="animate-pulse font-mono text-[11px] text-emerald-300">+{deltaScore} pts</span>
								) : null}
							</div>

							<progress
								value={progressValue}
								max={progressMax}
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
													{continentChallenges.length} retos · {selectedContinentSolved}/{continentChallenges.length || 1} resueltos por el equipo
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

										<div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
											{continentChallenges.map((challenge) => {
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
										</div>

										{detailLoading && !selectedChallenge ? (
											<div className="mt-6 flex h-20 items-center justify-center">
												<div className="h-6 w-6 animate-spin rounded-full border-2 border-[#EF01BA] border-t-transparent" />
											</div>
										) : selectedChallenge ? (
											<div className="mt-5 border border-white/15 bg-black/55 p-3 sm:p-4">
												<div className="flex flex-wrap items-start justify-between gap-2">
													<p className="font-heading text-xl text-white">{selectedChallenge.name}</p>
													<p className="font-mono text-xs text-[#FEF759]">{selectedChallenge.points} pts</p>
												</div>

												<div className="mt-2 flex flex-wrap gap-1.5">
													<span className={`border px-2 py-1 font-mono text-[10px] uppercase ${categoryTone(selectedChallenge.category)}`}>
														{selectedChallenge.category}
													</span>
													<span className={`border px-2 py-1 font-mono text-[10px] uppercase ${difficultyTone(selectedChallenge.difficulty).className}`}>
														{selectedChallenge.difficulty}
													</span>
													<span className={`border px-2 py-1 font-mono text-[10px] uppercase ${operationalStatus(selectedChallenge).className}`}>
														{operationalStatus(selectedChallenge).label}
													</span>
												</div>

												<p className="mt-3 text-sm text-white/80">{selectedChallenge.description}</p>
												<p className="mt-2 border border-white/10 bg-black/35 p-2 font-mono text-[11px] text-white/70">{selectedChallenge.lore}</p>

												<div className="mt-3 grid gap-2 sm:grid-cols-2">
													<div className="border border-white/10 bg-black/35 p-2.5 font-mono text-xs text-white/75">
														Tipo: {selectedChallenge.type}
													</div>
													<div className="border border-white/10 bg-black/35 p-2.5 font-mono text-xs text-white/75">
														Flags: {selectedChallenge.capturedFlags}/{selectedChallenge.totalFlags}
													</div>
													<div className="border border-white/10 bg-black/35 p-2.5 font-mono text-xs text-white/75">
														{selectedChallenge.firstBlood
															? `First Blood: ${selectedChallenge.firstBlood.teamName} - ${prettyDate(selectedChallenge.firstBlood.timestamp)}`
															: "First Blood pendiente"}
													</div>
													<div className="border border-white/10 bg-black/35 p-2.5 font-mono text-xs text-white/75">
														{selectedChallenge.solvedByTeam
															? `Resuelto por el equipo: ${prettyDate(selectedChallenge.completedAt)}`
															: selectedChallenge.status === "COMPLETED"
																? `Completado por mi equipo: ${prettyDate(selectedChallenge.completedAt)}`
																: "Reto activo para tu equipo"}
													</div>
												</div>

												<ChallengeDossierTerminal challenge={selectedChallenge} />

												<div className="mt-4">
													<Link
														href={`/challenges/${selectedChallenge.slug}`}
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

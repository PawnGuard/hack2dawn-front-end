import type {
  ChallengeDetailResponse,
  ChallengeDifficulty,
  ChallengesResponse,
  ChallengeSummary,
  ChallengeStatus,
} from "@/types/challenges";

const CHALLENGE_BASE: Array<Omit<ChallengeSummary, "status" | "capturedFlags" | "completedAt">> = [
  {
    id: 200,
    slug: "ctf-mission-briefing-test",
    name: "Mission Briefing Test",
    category: "Test",
    type: "Platform Validation",
    difficulty: "Easy",
    points: 50,
    description: "Lab de prueba previo al inicio oficial para validar entorno local, formato de flags y flujo de plataforma.",
    lore: "Antes de abrir los casos criticos de la NSA, completa esta validacion para comprobar Docker local, navegacion y envio de flags.",
    totalFlags: 1,
    firstBlood: null,
  },
  {
    id: 201,
    slug: "linux-basics-terminal-trace",
    name: "Linux Basics",
    category: "General",
    type: "Linux Fundamentals",
    difficulty: "Easy",
    points: 120,
    description: "Navegacion basica en Linux: archivos ocultos, historial de comandos, filtrado de logs, motd y reconocimiento de tipos de archivo.",
    lore: "Un informante de la NSA fue descubierto por de4thPawn. Antes de caer, dejo una terminal activa y rastros clave. Debes recuperar 5 flags para reconstruir evidencia legal.",
    totalFlags: 5,
    firstBlood: null,
  },
  {
    id: 202,
    slug: "linux-advanced-agent-shadow",
    name: "Linux Advanced",
    category: "Pwn",
    type: "Linux Administration",
    difficulty: "Medium",
    points: 240,
    description: "Linux avanzado: variables de entorno, busqueda de backups, procesos sospechosos, binarios SUID y tareas cron.",
    lore: "Lograste entrar al servidor privado de de4thPawn como agente_shadow. Debes escalar capacidad operativa usando pistas que dejaron para usuarios de confianza.",
    totalFlags: 5,
    firstBlood: null,
  },
  {
    id: 203,
    slug: "osint-la-huella-digital",
    name: "OSINT: La Huella Digital",
    category: "OSINT",
    type: "Open Source Intelligence",
    difficulty: "Medium",
    points: 280,
    description: "Investigacion en fuentes abiertas: metadatos EXIF, Wayback Machine, historial de GitHub y Google Dorks para documentos indexados.",
    lore: "de4thPawn apago su infraestructura. Solo queda su rastro publico: perfiles, snapshots web, commits y archivos olvidados en internet.",
    totalFlags: 4,
    firstBlood: null,
  },
  {
    id: 204,
    slug: "vulnerable-system-final-attack",
    name: "Vulnerable System: Final Attack",
    category: "Web",
    type: "System Exploitation",
    difficulty: "Hard",
    points: 360,
    description: "Laboratorio final de vulnerabilidades: reconocimiento, abuso de parametros/sesion, esteganografia y escalada de privilegios.",
    lore: "La NSA asigno un sistema C2 protegido. Si fallas, se cierra la ventana de ataque. Objetivo final: obtener capacidad root y recuperar /root/FINAL_FLAG.txt.",
    totalFlags: 5,
    firstBlood: null,
  },
];

const STATUS_ROTATION: ChallengeStatus[] = ["AVAILABLE", "IN_PROGRESS", "AVAILABLE", "AVAILABLE", "COMPLETED"];
const FLAG_ROTATION = [0, 2, 1, 0, 3];
const COMPLETION_TIMESTAMPS = [
  null,
  "2026-04-20T19:45:00Z",
  null,
  null,
  "2026-04-21T01:10:00Z",
] as const;

function clampDifficulty(points: number): ChallengeDifficulty {
  if (points <= 125) return "Easy";
  if (points <= 275) return "Medium";
  if (points <= 400) return "Hard";
  return "Insane";
}

export function buildMockChallengesResponse(teamId = "team-unknown", teamName = "Tu equipo"): ChallengesResponse {
  const challenges = CHALLENGE_BASE.map((challenge, index) => {
    const status = STATUS_ROTATION[index % STATUS_ROTATION.length];
    const capturedFlags = Math.min(FLAG_ROTATION[index % FLAG_ROTATION.length], challenge.totalFlags);

    return {
      ...challenge,
      difficulty: challenge.difficulty ?? clampDifficulty(challenge.points),
      status,
      capturedFlags,
      completedAt: status === "COMPLETED" ? COMPLETION_TIMESTAMPS[index % COMPLETION_TIMESTAMPS.length] : null,
    } satisfies ChallengeSummary;
  });

  const completed = challenges.filter((challenge) => challenge.status === "COMPLETED");
  const teamScore = completed.reduce((sum, challenge) => sum + challenge.points, 0);

  return {
    challenges,
    progress: {
      teamId,
      teamName,
      completedChallenges: completed.length,
      totalChallenges: challenges.length,
      teamScore,
      updatedAt: new Date().toISOString(),
    },
  };
}

export function buildMockChallengeDetail(challengeId: number, teamId?: string, teamName?: string): ChallengeDetailResponse | null {
  const data = buildMockChallengesResponse(teamId, teamName);
  const challenge = data.challenges.find((item) => item.id === challengeId);
  if (!challenge) return null;
  return { challenge };
}

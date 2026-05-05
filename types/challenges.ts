export type ChallengeStatus = "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";
export type ChallengeDifficulty = "Easy" | "Medium" | "Hard" | "Insane";

export type ChallengeContinent =
  | 'North America'
  | 'South America'
  | 'Europe'
  | 'Africa'
  | 'Asia'
  | 'Oceania'
  | 'Antartida Sur'

export interface ChallengeFirstBlood {
  teamName: string;
  timestamp: string;
}

export interface EventLore {
  operationName:     string
  transmissionText:  string
  alertLevel:        string
  tacticalWindow:    string
  primaryObjective:  string
  software: string
}

export interface ChallengeSummary {
  id: number;
  slug: string;
  name: string;
  machineId: string | null; // Ejemplo de tag: "machine:docker, o como esta en el docs de sammy"
  step: number | null;      // ← 1, 2, 3, 4 ,etc... n flags
  category: string;
  continent: ChallengeContinent | null
  type: string;
  difficulty: ChallengeDifficulty;
  status: ChallengeStatus;
  solvedByTeam: boolean;
  points: number;
  description: string;
  files?: string[];
  lore: string;
  totalFlags: number;
  capturedFlags: number;
  completedAt: string | null;
  firstBlood: ChallengeFirstBlood | null;
  solves: number
  connectionInfo: string | null;
  hints?: Array<{
    id: number
    cost: number
    content?: string | null
  }>
  maxAttempts?: number
  attempts?: number
}

export interface TeamChallengeProgress {
  teamId: string;
  teamName: string;
  completedChallenges: number;
  totalChallenges: number;
  teamScore: number;
  teamRank: number | null;
  updatedAt: string;
}

export interface ChallengesResponse {
  challenges: ChallengeSummary[];
  progress: TeamChallengeProgress;
  lore: EventLore;
}

export interface ChallengeDetailResponse {
  challenge: ChallengeSummary;
}

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
}

export interface ChallengeSummary {
  id: number;
  slug: string;
  name: string;
  category: string;
  continent: ChallengeContinent | null
  type: string;
  difficulty: ChallengeDifficulty;
  status: ChallengeStatus;
  solvedByTeam: boolean;
  points: number;
  description: string;
  lore: string;
  totalFlags: number;
  capturedFlags: number;
  completedAt: string | null;
  firstBlood: ChallengeFirstBlood | null;
  solves: number
  connectionInfo: string | null;
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

export type ChallengeStatus = "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";
export type ChallengeDifficulty = "Easy" | "Medium" | "Hard" | "Insane";

export interface ChallengeFirstBlood {
  teamName: string;
  timestamp: string;
}

export interface ChallengeSummary {
  id: number;
  slug: string;
  name: string;
  category: string;
  type: string;
  difficulty: ChallengeDifficulty;
  status: ChallengeStatus;
  points: number;
  description: string;
  lore: string;
  totalFlags: number;
  capturedFlags: number;
  completedAt: string | null;
  firstBlood: ChallengeFirstBlood | null;
}

export interface TeamChallengeProgress {
  teamId: string;
  teamName: string;
  completedChallenges: number;
  totalChallenges: number;
  teamScore: number;
  updatedAt: string;
}

export interface ChallengesResponse {
  challenges: ChallengeSummary[];
  progress: TeamChallengeProgress;
}

export interface ChallengeDetailResponse {
  challenge: ChallengeSummary;
}

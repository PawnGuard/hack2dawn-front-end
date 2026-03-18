export interface TeamScore {
  teamId: string;
  teamName: string;
  score: number;
  flagsCaptured: number;
  position: number;
  previousPosition: number;
}

export interface ScoreDataPoint {
  timestamp: number;
  [teamName: string]: number;
}

export interface ScoreboardResponse {
  teams: TeamScore[];
  updatedAt: string;
}

export interface ProgressChartResponse {
  dataPoints: ScoreDataPoint[];
  teamNames: string[];
  updatedAt: string;
}

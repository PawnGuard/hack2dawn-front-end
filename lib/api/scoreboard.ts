import type {
  TeamScore,
  ScoreboardResponse,
  ProgressChartResponse,
  ScoreDataPoint,
} from "@/types/scoreboard";

const TEAM_NAMES = [
  "ByteBusters",
  "NullPointers",
  "StackOverflow",
  "DarkByte",
  "CipherPunks",
  "ZeroDay",
  "RootAccess",
  "ShellShock",
  "PhantomHex",
  "BinaryStorm",
];

const TEAM_COLORS = [
  "#EF01BA",
  "#F77200",
  "#FEF759",
  "#940992",
  "#00FFD5",
  "#FF4444",
  "#7B68EE",
  "#00FF88",
  "#FF6B9D",
  "#4ECDC4",
];

function generateMockTeams(): TeamScore[] {
  const scores = [2450, 2100, 1850, 1600, 1400, 1200, 950, 800, 650, 400];
  const flags = [12, 10, 9, 8, 7, 6, 5, 4, 3, 2];

  return TEAM_NAMES.map((name, i) => ({
    teamId: String(i + 1),
    teamName: name,
    score: scores[i] + Math.floor(Math.random() * 100),
    flagsCaptured: flags[i],
    position: i + 1,
    previousPosition: i === 0 ? 1 : i + (Math.random() > 0.7 ? -1 : Math.random() > 0.5 ? 1 : 0),
  }));
}

function generateMockChartData(): ProgressChartResponse {
  const now = Date.now();
  const HOUR = 3_600_000;
  const startTime = now - 6 * HOUR;
  const points: ScoreDataPoint[] = [];

  for (let t = startTime; t <= now; t += HOUR / 4) {
    const elapsed = (t - startTime) / HOUR;
    const point: ScoreDataPoint = { timestamp: t };
    TEAM_NAMES.slice(0, 5).forEach((name, i) => {
      const base = (5 - i) * 200;
      const growth = base * (elapsed / 6);
      point[name] = Math.floor(growth + Math.random() * 100);
    });
    points.push(point);
  }

  return {
    dataPoints: points,
    teamNames: TEAM_NAMES.slice(0, 5),
    updatedAt: new Date().toISOString(),
  };
}

// TODO: Replace with real CTFd API call
// return fetch(`${process.env.NEXT_PUBLIC_CTFD_API_URL}/scoreboard`).then(r => r.json());
export async function fetchScoreboard(): Promise<ScoreboardResponse> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    teams: generateMockTeams(),
    updatedAt: new Date().toISOString(),
  };
}

// TODO: Replace with real CTFd API call
// return fetch(`${process.env.NEXT_PUBLIC_CTFD_API_URL}/scoreboard/top/10`).then(r => r.json());
export async function fetchProgressChart(): Promise<ProgressChartResponse> {
  await new Promise((r) => setTimeout(r, 300));
  return generateMockChartData();
}

export { TEAM_NAMES, TEAM_COLORS };

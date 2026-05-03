import type {
  ScoreboardResponse,
  ProgressChartResponse,
} from "@/types/scoreboard";

export async function fetchScoreboard(): Promise<ScoreboardResponse> {
  try {
    const res = await fetch(`/api/scoreboard/top?count=10`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Scoreboard fetch failed: ${res.status}`);
    return (await res.json()) as ScoreboardResponse;
  } catch {
    return { teams: [], updatedAt: new Date().toISOString() };
  }
}

export async function fetchPublicScoreboardAll(): Promise<ScoreboardResponse> {
  try {
    const res = await fetch(`/api/scoreboard/public`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Public scoreboard fetch failed: ${res.status}`);
    return (await res.json()) as ScoreboardResponse;
  } catch {
    return { teams: [], updatedAt: new Date().toISOString() };
  }
}

export async function fetchProgressChart(): Promise<ProgressChartResponse> {
  try {
    const res = await fetch(`/api/scoreboard/progress`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Progress chart fetch failed: ${res.status}`);
    return (await res.json()) as ProgressChartResponse;
  } catch {
    return { dataPoints: [], teamNames: [], updatedAt: new Date().toISOString() };
  }
}


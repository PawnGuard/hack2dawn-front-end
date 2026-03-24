import { NextRequest, NextResponse } from "next/server";
import { buildMockChallengesResponse } from "@/lib/challenges-mock";
import type { ChallengeSummary, ChallengesResponse } from "@/types/challenges";

const CTFD_BASE_URL = process.env.CTFD_API_URL;
const CTFD_TOKEN = process.env.CTFD_API_TOKEN;

function mapDifficulty(points: number): ChallengeSummary["difficulty"] {
  if (points <= 125) return "Easy";
  if (points <= 275) return "Medium";
  if (points <= 400) return "Hard";
  return "Insane";
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function GET(request: NextRequest) {
  const teamId = request.cookies.get("teamId")?.value ?? "team-unknown";
  const teamName = request.cookies.get("teamName")?.value ?? "Tu equipo";

  if (!CTFD_BASE_URL || !CTFD_TOKEN) {
    return NextResponse.json(buildMockChallengesResponse(teamId, teamName));
  }

  try {
    const response = await fetch(`${CTFD_BASE_URL}/api/v1/challenges`, {
      headers: {
        Authorization: `Token ${CTFD_TOKEN}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`CTFd request failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      data?: Array<{
        id: number;
        name: string;
        category?: string;
        type?: string;
        value?: number;
        description?: string;
      }>;
    };

    const challenges: ChallengeSummary[] = (payload.data ?? []).map((challenge) => ({
      id: challenge.id,
      slug: toSlug(challenge.name),
      name: challenge.name,
      category: challenge.category ?? "General",
      type: challenge.type ?? challenge.category ?? "General",
      difficulty: mapDifficulty(challenge.value ?? 0),
      status: "AVAILABLE",
      points: challenge.value ?? 0,
      description: challenge.description ?? "Sin descripcion disponible.",
      lore: "Briefing no disponible en CTFd. Revisa la descripcion tecnica del reto.",
      totalFlags: 1,
      capturedFlags: 0,
      completedAt: null,
      firstBlood: null,
    }));

    const result: ChallengesResponse = {
      challenges,
      progress: {
        teamId,
        teamName,
        completedChallenges: 0,
        totalChallenges: challenges.length,
        teamScore: 0,
        updatedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(buildMockChallengesResponse(teamId, teamName));
  }
}

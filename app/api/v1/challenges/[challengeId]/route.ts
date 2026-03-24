import { NextRequest, NextResponse } from "next/server";
import { buildMockChallengeDetail } from "@/lib/challenges-mock";
import type { ChallengeDetailResponse, ChallengeSummary } from "@/types/challenges";

const CTFD_BASE_URL = process.env.CTFD_API_URL;
const CTFD_TOKEN = process.env.CTFD_API_TOKEN;

function mapDifficulty(points: number): ChallengeSummary["difficulty"] {
  if (points <= 125) return "Easy";
  if (points <= 275) return "Medium";
  if (points <= 400) return "Hard";
  return "Insane";
}

function mapToChallengeSummary(source: {
  id: number;
  name: string;
  category?: string;
  type?: string;
  value?: number;
  description?: string;
}): ChallengeSummary {
  return {
    id: source.id,
    slug: source.name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-"),
    name: source.name,
    category: source.category ?? "General",
    type: source.type ?? source.category ?? "General",
    difficulty: mapDifficulty(source.value ?? 0),
    status: "AVAILABLE",
    points: source.value ?? 0,
    description: source.description ?? "Sin descripcion disponible.",
    lore: "Briefing no disponible en CTFd. Revisa la descripcion tecnica del reto.",
    totalFlags: 1,
    capturedFlags: 0,
    completedAt: null,
    firstBlood: null,
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ challengeId: string }> }
) {
  const params = await context.params;
  const challengeId = Number(params.challengeId);
  const teamId = request.cookies.get("teamId")?.value;
  const teamName = request.cookies.get("teamName")?.value;

  if (!Number.isFinite(challengeId)) {
    return NextResponse.json({ message: "challengeId invalido" }, { status: 400 });
  }

  if (!CTFD_BASE_URL || !CTFD_TOKEN) {
    const mockDetail = buildMockChallengeDetail(challengeId, teamId, teamName);
    if (!mockDetail) {
      return NextResponse.json({ message: "Challenge no encontrado" }, { status: 404 });
    }
    return NextResponse.json(mockDetail);
  }

  try {
    const response = await fetch(`${CTFD_BASE_URL}/api/v1/challenges/${challengeId}`, {
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
      data?: {
        id: number;
        name: string;
        category?: string;
        type?: string;
        value?: number;
        description?: string;
      };
    };

    if (!payload.data) {
      return NextResponse.json({ message: "Challenge no encontrado" }, { status: 404 });
    }

    const result: ChallengeDetailResponse = {
      challenge: mapToChallengeSummary(payload.data),
    };

    return NextResponse.json(result);
  } catch {
    const mockDetail = buildMockChallengeDetail(challengeId, teamId, teamName);
    if (!mockDetail) {
      return NextResponse.json({ message: "Challenge no encontrado" }, { status: 404 });
    }
    return NextResponse.json(mockDetail);
  }
}

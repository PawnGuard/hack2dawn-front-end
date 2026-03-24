"use client";

import { useMemo } from "react";
import { Terminal } from "@/components/ui/terminal";
import type { ChallengeSummary } from "@/types/challenges";

interface ChallengeDossierTerminalProps {
  challenge: ChallengeSummary;
}

function formatDate(value: string | null) {
  if (!value) return "pending";
  return new Date(value).toLocaleString("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function ChallengeDossierTerminal({ challenge }: ChallengeDossierTerminalProps) {
  const commands = useMemo(
    () => [
      `open dossier --slug ${challenge.slug}`,
      `scan metadata --category ${challenge.category.toLowerCase()}`,
      `cat mission.log --id ${challenge.id}`,
    ],
    [challenge.category, challenge.id, challenge.slug]
  );

  const outputs = useMemo<Record<number, string[]>>(
    () => ({
      0: [
        `name: ${challenge.name}`,
        `type: ${challenge.type}`,
        `difficulty: ${challenge.difficulty}`,
        `points: ${challenge.points}`,
      ],
      1: [
        `status: ${challenge.status}`,
        `flags: ${challenge.capturedFlags}/${challenge.totalFlags}`,
        `completed_at: ${formatDate(challenge.completedAt)}`,
      ],
      2: [challenge.lore, challenge.description],
    }),
    [
      challenge.capturedFlags,
      challenge.completedAt,
      challenge.description,
      challenge.difficulty,
      challenge.lore,
      challenge.name,
      challenge.points,
      challenge.status,
      challenge.totalFlags,
      challenge.type,
    ]
  );

  return (
    <section className="mt-4">
      <Terminal
        commands={commands}
        outputs={outputs}
        typingSpeed={14}
        delayBetweenCommands={260}
      />
    </section>
  );
}

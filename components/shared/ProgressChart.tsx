"use client";

import { useCallback, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useCtfState } from "@/hooks/useCtfState";
import { usePollingData } from "@/hooks/usePollingData";
import { fetchProgressChart, TEAM_COLORS } from "@/lib/api/scoreboard";
import SectionHeader from "./SectionHeader";
import type { ProgressChartResponse } from "@/types/scoreboard";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-black/85 backdrop-blur-md border border-white/[0.1] rounded-lg px-4 py-3 shadow-xl">
      <p className="font-mono text-[10px] text-white/50 mb-2">
        {new Date(label).toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-white/70 font-body">{entry.name}</span>
          <span className="text-white font-mono ml-auto">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProgressChart() {
  const ctf = useCtfState();
  const fetcher = useCallback(() => fetchProgressChart(), []);
  const { data, isLoading } = usePollingData<ProgressChartResponse>(
    fetcher,
    30_000,
    ctf?.phase !== "before"
  );

  const chartData = useMemo(() => data?.dataPoints ?? [], [data]);
  const teamNames = useMemo(() => data?.teamNames ?? [], [data]);

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        label="// progreso global"
        title="Score Timeline"
        accentColor="#940992"
      />

      {ctf?.phase === "before" ? (
        <div className="flex items-center justify-center h-64 rounded-xl border border-white/[0.06] bg-black/30">
          <p className="font-body text-white/40 text-sm">
            La gr&aacute;fica estar&aacute; disponible cuando inicie el CTF
          </p>
        </div>
      ) : isLoading && !chartData.length ? (
        <div className="flex items-center justify-center h-64 rounded-xl border border-white/[0.06] bg-black/30">
          <div className="w-5 h-5 border-2 border-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4 pt-6">
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="rgba(148, 9, 146, 0.12)" strokeDasharray="4 4" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(ts: number) =>
                  new Date(ts).toLocaleTimeString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
                stroke="rgba(244, 237, 242, 0.25)"
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
                axisLine={{ stroke: "rgba(244, 237, 242, 0.1)" }}
              />
              <YAxis
                stroke="rgba(244, 237, 242, 0.25)"
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
                axisLine={{ stroke: "rgba(244, 237, 242, 0.1)" }}
              />
              <Tooltip content={<ChartTooltip />} />
              {teamNames.map((name, i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={TEAM_COLORS[i % TEAM_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

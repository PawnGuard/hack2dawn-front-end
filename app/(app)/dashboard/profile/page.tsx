"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Boxes } from "@/components/ui/background-boxes";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { getIdenticonUrl } from "@/lib/utils";
import { ProfileDashboardData } from "@/lib/types/ctfd";

const MAX_USERNAME_CHANGES: number = 2;

function getWebsiteIconClass(website: string): string {
  const fallbackIcon = "hn hn-web3";

  try {
    const normalizedUrl = website.startsWith("http") ? website : `https://${website}`;
    const hostname = new URL(normalizedUrl).hostname.replace(/^www\./, "").toLowerCase();

    if (hostname === "github.com" || hostname.endsWith(".github.com")) {
      return "hn hn-github";
    }

    if (hostname === "linkedin.com" || hostname.endsWith(".linkedin.com")) {
      return "hn hn-linkedin";
    }

    return fallbackIcon;
  } catch {
    const websiteLower = website.toLowerCase();

    if (websiteLower.includes("github.com")) {
      return "hn hn-github";
    }

    if (websiteLower.includes("linkedin.com")) {
      return "hn hn-linkedin";
    }

    return fallbackIcon;
  }
}

// ── Componentes reutilizables ────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="border border-white/10 bg-black/40 p-4 flex flex-col gap-1">
      <p className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color }}>
        {label}
      </p>
      <p className="font-heading text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function SolveRow({ name, value, date }: { name: string; value: number; date: string }) {
  const relativeTime = (() => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `Hace ${days}d`;
    if (hrs > 0) return `Hace ${hrs}h`;
    return `Hace ${mins}m`;
  })();

  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-2 px-3 border-b border-white/5 hover:bg-white/5 transition-colors font-mono text-sm">
      <span className="text-white/80 truncate">{name}</span>
      <span className="text-[#00F0FF] font-bold whitespace-nowrap">+{value} pts</span>
      <span className="text-white/30 text-xs whitespace-nowrap">{relativeTime}</span>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────

export default function ProfileDashboardPage() {
  const router = useRouter();

  // ── Estado del perfil ──────────────────────────────────────────
  const [profile, setProfile] = useState<ProfileDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Estado de edición ──────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [draftUsername, setDraftUsername] = useState("");
  const [draftAffiliation, setDraftAffiliation] = useState("");
  const [draftWebsite, setDraftWebsite] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ── Cargar perfil ──────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    const res = await fetch("/api/profile/me");
    if (!res.ok) { router.push("/dashboard"); return; }
    const data: ProfileDashboardData = await res.json();
    setProfile(data);
    setDraftUsername(data.username);
    setDraftAffiliation(data.affiliation ?? "");
    setDraftWebsite(data.website ?? "");
    setIsLoading(false);
  }, [router]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ── Guardar cambios ────────────────────────────────────────────
  const handleSave = async () => {
    if (!profile) return;
    setSaveError("");
    setIsSaving(true);

    const res = await fetch("/api/profile/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: draftUsername !== profile.username ? draftUsername : undefined,
        affiliation: draftAffiliation,
        website: draftWebsite,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      setSaveError(json.error ?? "Error al guardar cambios");
      setIsSaving(false);
      return;
    }

    setIsEditing(false);
    setIsSaving(false);
    fetchProfile(); // Recargar datos frescos
  };

  const handleCancel = () => {
    if (!profile) return;
    setDraftUsername(profile.username);
    setDraftAffiliation(profile.affiliation ?? "");
    setDraftWebsite(profile.website ?? "");
    setSaveError("");
    setIsEditing(false);
  };

  // ── Loading ────────────────────────────────────────────────────
  if (isLoading || !profile) {
    return (
      <main className="min-h-screen relative overflow-hidden bg-[#090013] text-white px-4 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,1,186,0.25),transparent_55%)] pointer-events-none" />
        <div className="relative z-20 mx-auto w-full max-w-5xl space-y-6 animate-pulse">

          {/* Header skeleton */}
          <section className="border border-white/10 bg-black/55 backdrop-blur-md p-6 md:p-8">
            <div className="h-3 w-40 bg-white/10 rounded mb-6" />
            <div className="flex gap-6 items-start">
              {/* Avatar */}
              <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-white/10 border border-[#EF01BA]/20" />
              {/* Texto */}
              <div className="flex-1 space-y-3 pt-1">
                <div className="h-8 w-48 bg-white/10 rounded" />
                <div className="h-3 w-64 bg-white/5 rounded" />
                <div className="h-3 w-32 bg-white/5 rounded" />
                <div className="h-7 w-32 bg-white/10 rounded mt-4" />
              </div>
            </div>
          </section>

          {/* Stats skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="h-2 w-16 bg-white/10 rounded" />
                <div className="h-7 w-12 bg-white/10 rounded" />
              </div>
            ))}
          </div>

          {/* Activity log skeleton */}
          <section className="border border-white/10 bg-black/55 backdrop-blur-md">
            <div className="px-6 py-4 border-b border-white/10">
              <div className="h-3 w-48 bg-white/10 rounded" />
            </div>
            <div className="divide-y divide-white/5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-4 px-3 py-3 items-center">
                  <div className="h-3 bg-white/10 rounded" style={{ width: `${55 + i * 7}%` }} />
                  <div className="h-3 w-14 bg-[#00F0FF]/10 rounded" />
                  <div className="h-3 w-12 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    );
  }

  const usernameChangesLeft = MAX_USERNAME_CHANGES;
  const canChangeUsername = usernameChangesLeft > 0;
  const totalSolves = profile.solves.length;
  const accuracy: number | null = null; // sin calcular hasta tener fails
  const websiteIconClass = profile.website ? getWebsiteIconClass(profile.website) : "hn hn-web3";

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#090013] text-white px-4 py-12">
      {/* Fondo */}
      <div className="absolute inset-0 z-0 hidden md:block"><Boxes /></div>
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(239,1,186,0.25),transparent_55%),linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.75)_100%)] pointer-events-none" />

      <div className="relative z-20 mx-auto w-full max-w-5xl space-y-6">

        {/* ── Header: Identidad ──────────────────────────────────── */}
        <section className="border border-white/10 bg-black/55 backdrop-blur-md p-6 md:p-8">
          <p className="font-mono text-white/50 text-xs tracking-[0.35em] uppercase mb-6">
            <EncryptedText text="// Operator Profile" revealDelayMs={60} flipDelayMs={30} />
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-start">

            {/* Avatar DiceBear */}
            <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-black/40 overflow-hidden">
              <Image
                src={getIdenticonUrl(profile.username, 112)}
                alt={`Avatar de ${profile.username}`}
                fill
                className="object-cover opacity-80"
                unoptimized // SVG externo → sin optimización de Next
              />
              <div className="absolute inset-0 bg-[#EF01BA]/10 pointer-events-none mix-blend-screen" />
            </div>

            {/* Datos de identidad */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                // ── Modo edición ─────────────────────────────────
                <div className="space-y-4">
                  <div>
                    <label className="font-mono text-[10px] text-white/40 tracking-widest uppercase">
                      Username {canChangeUsername
                        ? `(${usernameChangesLeft} cambio${usernameChangesLeft === 1 ? "" : "s"} restante${usernameChangesLeft === 1 ? "" : "s"})`
                        : "(límite alcanzado)"}
                    </label>
                    <Input
                      value={draftUsername}
                      onChange={e => setDraftUsername(e.target.value)}
                      disabled={!canChangeUsername}
                      className="mt-1 bg-black/60 border-white/20 rounded-none font-mono text-white disabled:opacity-40"
                      placeholder="Nuevo username"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-white/40 tracking-widest uppercase">Afiliación</label>
                    <Input
                      value={draftAffiliation}
                      onChange={e => setDraftAffiliation(e.target.value)}
                      className="mt-1 bg-black/60 border-white/20 rounded-none font-mono text-white"
                      placeholder="Universidad / Empresa"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-white/40 tracking-widest uppercase">Website / GitHub</label>
                    <Input
                      value={draftWebsite}
                      onChange={e => setDraftWebsite(e.target.value)}
                      className="mt-1 bg-black/60 border-white/20 rounded-none font-mono text-white"
                      placeholder="https://github.com/usuario"
                    />
                  </div>
                  {saveError && (
                    <p className="font-mono text-xs text-red-400">[!] {saveError}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="font-mono text-xs text-black rounded-none px-6"
                      style={{ backgroundColor: "#EF01BA" }}
                    >
                      {isSaving ? "GUARDANDO..." : "[ GUARDAR ]"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="font-mono text-xs text-white/50 hover:text-white rounded-none"
                    >
                      [ CANCELAR ]
                    </Button>
                  </div>
                </div>
              ) : (
                // ── Modo vista ───────────────────────────────────
                <div className="space-y-2">
                  <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#EF01BA] tracking-wider drop-shadow-[0_0_12px_rgba(239,1,186,0.45)] truncate">
                    {profile.username}
                  </h1>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-white/40">
                    <span>{profile.email}</span>
                    {profile.affiliation && <span>// {profile.affiliation}</span>}
                    {profile.teamName && (
                      <span className="inline-flex items-center gap-1 text-[#00F0FF]/60">
                        <i className="hn hn-users-solid text-[11px]" aria-hidden="true" />
                        <a
                          href={`/dashboard/team`}
                          className="hover:text-[#00F0FF] transition-colors"
                        >
                          {profile.teamName}
                        </a>
                      </span>
                    )}
                  </div>
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-mono text-xs text-[#EF01BA]/60 hover:text-[#EF01BA] transition-colors mt-1"
                    >
                      <i className={`${websiteIconClass} text-[11px]`} aria-hidden="true" />
                      <span>{profile.website}</span>
                      <i className="hn hn-external-link text-[10px]" aria-hidden="true" />
                    </a>
                  )}
                  <div className="pt-3">
                    <Button
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                      className="font-mono text-xs text-[#EF01BA] hover:text-black hover:bg-[#EF01BA] rounded-none px-4 border border-[#EF01BA]/30"
                    >
                      [ EDITAR PERFIL ]
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Stats del operador ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Puntos"
            value={profile.score.toLocaleString()}
            color="#EF01BA"
          />
          <StatCard
            label="Posición"
            value={profile.place ? `#${profile.place}` : "—"}
            color="#00F0FF"
          />
          <StatCard
            label="Retos Resueltos"
            value={String(totalSolves)}
            color="#EF01BA"
          />
          <StatCard
            label="Precisión"
            value={accuracy !== null ? `${accuracy}%` : "—"}
            color="#00F0FF"
          />
        </div>

        {/* ── Log de Actividad (Solves) ──────────────────────────── */}
        <section className="border border-white/10 bg-black/55 backdrop-blur-md">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-mono text-xs tracking-[0.25em] uppercase text-[#00F0FF]">
              // Activity Log — {totalSolves} solve{totalSolves !== 1 ? "s" : ""}
            </h2>
          </div>

          {profile.solves.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-mono text-white/20 text-sm">
                Sin actividad registrada. Ve a{" "}
                <button
                  onClick={() => router.push("/challenges")}
                  className="text-[#EF01BA]/60 hover:text-[#EF01BA] transition-colors underline"
                >
                  Challenges
                </button>
                .
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/0">
              {/* Header de columnas */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-3 py-2 font-mono text-[10px] text-white/20 tracking-widest uppercase border-b border-white/5">
                <span>Reto</span>
                <span>Puntos</span>
                <span>Tiempo</span>
              </div>
              {profile.solves.map(solve => (
                <SolveRow
                  key={solve.id}
                  name={solve.challenge_name}
                  value={solve.value}
                  date={solve.date}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
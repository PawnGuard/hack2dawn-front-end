"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TeamTable, TeamMember } from "@/components/shared/dashboardTeams/TeamTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Boxes } from "@/components/ui/background-boxes";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { TeamDashboardData } from "@/lib/types/ctfd";

export default function TeamDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<TeamDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [error, setError] = useState("");

  const fetchTeam = useCallback(async () => {
    const res = await fetch("/api/teams/me")
    if (!res.ok) { router.push("/dashboard/team/select"); return; }
    const json: TeamDashboardData = await res.json()
    setData(json)
    setDraftName(json.teamName)
    setIsLoading(false)
  }, [router])

  useEffect(() => { fetchTeam() }, [fetchTeam])

  const handleSaveName = async () => {
    if (!draftName.trim()) return
    const res = await fetch("/api/teams/me/name", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: draftName.trim() }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? "Error al cambiar nombre"); return; }
    setIsEditingName(false)
    fetchTeam()
  }

  const handlePromote = async (memberId: string) => {
    if (!window.confirm(`¿Asignar capitanía a este miembro?`)) return
    const res = await fetch("/api/teams/me/captain", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: Number(memberId) }),
    })
    if (res.ok) fetchTeam()
  }

  const handleKick = async (memberId: string) => {
    if (!window.confirm("¿Expulsar a este miembro?")) return
    const res = await fetch("/api/teams/me/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: Number(memberId) }),
    })
    if (res.ok) fetchTeam()
  }

  const handleLeave = async () => {
    if (!window.confirm("¿Abandonar el equipo?")) return
    const res = await fetch("/api/teams/me/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),   // sin userId = leave propio
    })
    if (res.ok) { router.push("/dashboard/team/select"); return; }
    const json = await res.json()
    setError(json.error ?? "No se pudo abandonar el equipo")
  }

  const handleCopyToken = async () => {
    if (!data?.inviteCode) return
    try {
      await navigator.clipboard.writeText(data.inviteCode)
      window.alert("Token copiado al portapapeles.")
    } catch {
      window.alert("No se pudo copiar el token.")
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#090013] text-white flex items-center justify-center">
        <p className="font-mono text-white/40 animate-pulse">Cargando equipo...</p>
      </main>
    )
  }

  if (!data) return null

  // Adaptar a la interfaz que espera TeamTable
  const members: TeamMember[] = data.members.map(m => ({
    id: String(m.id),
    username: m.username,
    score: m.score,
    role: m.isCaptain ? "captain" : "member",
    isMe: m.isMe,
  }))

  const isCaptain = data.isCaptain

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#090013] text-white px-4 py-12">
      <div className="absolute inset-0 z-0 hidden md:block"><Boxes /></div>
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(239,1,186,0.25),transparent_55%),linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.75)_100%)] pointer-events-none" />

      <div className="relative z-20 mx-auto w-full max-w-6xl space-y-6">
        <section className="border border-white/10 bg-black/55 backdrop-blur-md p-6 md:p-8">
          <p className="font-mono text-white/50 text-xs tracking-[0.35em] uppercase mb-2">
            <EncryptedText text="// Team Dashboard" revealDelayMs={60} flipDelayMs={30} />
          </p>
          <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-wider text-[#EF01BA] drop-shadow-[0_0_12px_rgba(239,1,186,0.45)]">
            {data.teamName}
          </h1>

          {error && (
            <p className="font-mono text-xs text-red-400 mt-3">[!] {error}</p>
          )}

          {isCaptain && (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {/* Control del nombre */}
              <div className="border border-white/10 bg-black/40 p-4">
                <h2 className="font-mono text-xs tracking-[0.25em] text-[#00F0FF] uppercase mb-3">Control del equipo</h2>
                {!isEditingName ? (
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditingName(true)}
                    className="font-mono text-xs text-[#00F0FF] hover:text-black hover:bg-[#00F0FF] rounded-none"
                  >
                    [ CAMBIAR NOMBRE DEL EQUIPO ]
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={draftName}
                      onChange={e => { setDraftName(e.target.value); setError(""); }}
                      className="bg-black/60 border-white/20 rounded-none"
                      placeholder="Nuevo nombre"
                    />
                    <Button variant="ghost" onClick={handleSaveName}
                      className="font-mono text-xs text-[#00F0FF] hover:text-black hover:bg-[#00F0FF] rounded-none">
                      [ GUARDAR ]
                    </Button>
                    <Button variant="ghost" onClick={() => { setDraftName(data.teamName); setIsEditingName(false); setError(""); }}
                      className="font-mono text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-none">
                      [ CANCELAR ]
                    </Button>
                  </div>
                )}
              </div>

              {/* Token de invitación */}
              <div className="border border-white/10 bg-black/40 p-4">
                <h2 className="font-mono text-xs tracking-[0.25em] text-[#00F0FF] uppercase mb-3">Token de invitación</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input value={data.inviteCode ?? "—"} readOnly className="bg-black/60 border-white/20 rounded-none" />
                  <Button variant="ghost" onClick={handleCopyToken}
                    className="font-mono text-xs text-[#00F0FF] hover:text-black hover:bg-[#00F0FF] rounded-none">
                    [ COPIAR ]
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>

        <TeamTable
          members={members}
          currentUserRole={isCaptain ? "captain" : "member"}
          onLeave={() => handleLeave()}
          onKick={handleKick}
          onPromote={handlePromote}
          canLeaveSelf={!isCaptain}
        />
      </div>
    </main>
  )
}
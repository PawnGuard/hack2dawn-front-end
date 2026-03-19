"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TeamTable, TeamMember } from "@/components/shared/dashboardTeams/TeamTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Boxes } from "@/components/ui/background-boxes";
import { EncryptedText } from "@/components/ui/encrypted-text";

const initialMembers: TeamMember[] = [
    { id: "1", username: "C4rnage", score: 1500, role: "captain", isMe: true },
    { id: "2", username: "Shadow", score: 1200, role: "member", isMe: false },
    { id: "3", username: "Sammy", score: 850, role: "member", isMe: false },
];

export default function TeamDashboardPage() {
    const router = useRouter();
    const [teamName, setTeamName] = useState("PawnGuard");
    const [inviteToken] = useState("PG-H2D-F6Q9-9K21");
    const [draftName, setDraftName] = useState(teamName);
    const [isEditingName, setIsEditingName] = useState(false);
    const [members, setMembers] = useState<TeamMember[]>(initialMembers);

    const me = useMemo(() => members.find((member) => member.isMe), [members]);
    const isCaptain = me?.role === "captain";
    const canLeaveTeam = !isCaptain;

    const handleLeave = (memberId: string) => {
        const target = members.find((member) => member.id === memberId);
        if (!target || !target.isMe) {
            return;
        }

        if (target.role === "captain") {
            window.alert("Debes transferir la capitania antes de abandonar el equipo.");
            return;
        }

        const shouldLeave = window.confirm("Estas seguro de que quieres abandonar el equipo?");
        if (!shouldLeave) {
            return;
        }

        setMembers((prev) => prev.filter((member) => member.id !== memberId));
        router.push("/dashboard/team/select");
    };

    const handleKick = (memberId: string) => {
        if (!isCaptain || memberId === me?.id) {
            return;
        }

        const target = members.find((member) => member.id === memberId);
        if (!target) {
            return;
        }

        const shouldKick = window.confirm(`Seguro que quieres eliminar a ${target.username} del equipo?`);
        if (!shouldKick) {
            return;
        }

        setMembers((prev) => prev.filter((member) => member.id !== memberId));
    };

    const handlePromote = (memberId: string) => {
        if (!isCaptain || memberId === me?.id) {
            return;
        }

        const target = members.find((member) => member.id === memberId);
        if (!target) {
            return;
        }

        const shouldPromote = window.confirm(`Asignar a ${target.username} como nuevo capitan?`);
        if (!shouldPromote) {
            return;
        }

        setMembers((prev) =>
            prev.map((member) => {
                if (member.id === memberId) {
                    return { ...member, role: "captain" };
                }

                if (member.role === "captain") {
                    return { ...member, role: "member" };
                }

                return member;
            }),
        );
    };

    const handleSaveName = () => {
        const cleanName = draftName.trim();
        if (!cleanName) {
            return;
        }

        setTeamName(cleanName);
        setIsEditingName(false);
    };

    const handleCopyToken = async () => {
        try {
            await navigator.clipboard.writeText(inviteToken);
            window.alert("Token copiado al portapapeles.");
        } catch {
            window.alert("No se pudo copiar el token.");
        }
    };

    return (
        <main className="min-h-screen relative overflow-hidden bg-[#090013] text-white px-4 py-12">
            <div className="absolute inset-0 z-0 hidden md:block">
                <Boxes />
            </div>
            <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(239,1,186,0.25),transparent_55%),linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.75)_100%)] pointer-events-none" />

            <div className="relative z-20 mx-auto w-full max-w-6xl space-y-6">
                <section className="border border-white/10 bg-black/55 backdrop-blur-md p-6 md:p-8">
                    <p className="font-mono text-white/50 text-xs tracking-[0.35em] uppercase mb-2">
                        <EncryptedText text="// Team Dashboard" revealDelayMs={60} flipDelayMs={30} />
                    </p>
                    <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-wider text-[#EF01BA] drop-shadow-[0_0_12px_rgba(239,1,186,0.45)]">
                        {teamName}
                    </h1>

                    {isCaptain && (
                        <div className="mt-6 grid gap-4 lg:grid-cols-2">
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
                                            onChange={(event) => setDraftName(event.target.value)}
                                            className="bg-black/60 border-white/20 rounded-none"
                                            placeholder="Nuevo nombre"
                                        />
                                        <Button
                                            variant="ghost"
                                            onClick={handleSaveName}
                                            className="font-mono text-xs text-[#00F0FF] hover:text-black hover:bg-[#00F0FF] rounded-none"
                                        >
                                            [ GUARDAR ]
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setDraftName(teamName);
                                                setIsEditingName(false);
                                            }}
                                            className="font-mono text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-none"
                                        >
                                            [ CANCELAR ]
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="border border-white/10 bg-black/40 p-4">
                                <h2 className="font-mono text-xs tracking-[0.25em] text-[#00F0FF] uppercase mb-3">Token de invitacion</h2>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Input value={inviteToken} readOnly className="bg-black/60 border-white/20 rounded-none" />
                                    <Button
                                        variant="ghost"
                                        onClick={handleCopyToken}
                                        className="font-mono text-xs text-[#00F0FF] hover:text-black hover:bg-[#00F0FF] rounded-none"
                                    >
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
                    onLeave={handleLeave}
                    onKick={handleKick}
                    onPromote={handlePromote}
                    canLeaveSelf={canLeaveTeam}
                />
            </div>
        </main>
    );
}
"use client";

import { TeamTable, TeamMember } from "@/components/shared/dashboardTeams/TeamTable";

const mockMembers: TeamMember[] = [
    { id: "1", username: "C4rnage", score: 1500, role: "captain", isMe: true },
    { id: "2", username: "Shadow", score: 1200, role: "member", isMe: false },
    { id: "3", username: "Sammy", score: 850, role: "member", isMe: false },
];

export default function LandingPage(){
    return (
        <TeamTable 
            members={mockMembers} 
            currentUserRole="captain" 
            onLeave={(id) => console.log("Saliendo...", id)}
            onKick={(id) => console.log("Expulsando...", id)}
            onPromote={(id) => console.log("Ascendiendo a capitán...", id)}
        />
    )
}
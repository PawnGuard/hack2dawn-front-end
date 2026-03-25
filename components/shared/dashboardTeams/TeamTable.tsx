"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Interfaces basadas en tu SRS
export interface TeamMember {
  id: string;
  username: string;
  score: number;
  role: "captain" | "member";
  isMe: boolean; // Para saber qué fila es la del usuario actual
}

interface TeamTableProps {
  members: TeamMember[];
  currentUserRole: "captain" | "member";
  onLeave: (memberId: string) => void;
  onKick?: (memberId: string) => void;
  onPromote?: (memberId: string) => void;
  canLeaveSelf?: boolean;
}

export function TeamTable({
  members,
  currentUserRole,
  onLeave,
  onKick,
  onPromote,
  canLeaveSelf = true,
}: TeamTableProps) {
  return (
    <div className="w-full border border-white/10 bg-black/60 backdrop-blur-md relative">
      {/* Esquinas decorativas tipo HUD */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-[#00F0FF]" />
      <div className="absolute top-0 right-0 w-2 h-2 bg-[#00F0FF]" />
      
      <div className="p-4 border-b border-white/10">
        <h3 className="font-mono text-sm tracking-widest text-[#00F0FF] uppercase">
          {">_ sys.members.list"}
        </h3>
      </div>

      <Table>
        <TableHeader className="bg-white/5 border-b border-white/10 hover:bg-transparent">
          <TableRow className="border-none">
            <TableHead className="font-mono text-xs text-white/50 tracking-wider">NOMBRE DE USUARIO</TableHead>
            <TableHead className="font-mono text-xs text-white/50 tracking-wider text-center">PUNTAJE (FLAGS RESUELTOS)</TableHead>
            <TableHead className="font-mono text-xs text-white/50 tracking-wider text-right">ACCION</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow 
              key={member.id}
              className={`border-b border-white/5 hover:bg-white/5 transition-colors ${member.isMe ? "bg-[#00F0FF]/5" : ""}`}
            >
              <TableCell className="font-mono py-4">
                <div className="flex items-center gap-2">
                  <span className={`text-base ${member.isMe ? "text-[#00F0FF] font-bold" : "text-white/80"}`}>
                    {member.username}
                  </span>
                  {member.role === "captain" && (
                    <i
                      className="hn hn-crown-solid text-[#EF01BA] text-sm"
                      style={{ filter: "drop-shadow(0 0 4px #EF01BA)" }}
                      aria-label="Capitán"
                      title="Capitán"
                    />
                  )}
                  {member.isMe && (
                    <span className="text-[10px] text-white/40 ml-2">(Tú)</span>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="font-mono text-center text-white/70">
                {member.score}
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  
                  {/* ACCIÓN: Abandonar Equipo (Solo visible en tu propia fila) */}
                  {member.isMe && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onLeave(member.id)}
                      disabled={!canLeaveSelf}
                      className="font-mono text-xs text-[#FF003C] hover:text-white hover:bg-[#FF003C] transition-colors rounded-none h-8 disabled:text-white/30 disabled:hover:bg-transparent"
                    >
                      [ ABANDONAR ]
                    </Button>
                  )}

                  {/* ACCIONES DE CAPITÁN: Promover y Expulsar (Visible en filas de otros) */}
                  {currentUserRole === "captain" && !member.isMe && (
                    <>
                      <Button
  variant="ghost"
  size="sm"
  onClick={() => onPromote && onPromote(member.id)}
  className="font-mono text-xs text-[#00F0FF] hover:text-black hover:bg-[#00F0FF] transition-colors rounded-none h-8"
>
  <i className="hn hn-crown-solid text-sm" aria-hidden="true" />
  [ ASIGNAR CAPITÁN ]
</Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onKick && onKick(member.id)}
                        className="font-mono text-xs text-[#FF003C] hover:text-white hover:bg-[#FF003C] transition-colors rounded-none h-8"
                      >
                        [ ELIMINAR ]
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
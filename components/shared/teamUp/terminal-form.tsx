"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation'
import { AngleLeftSolidIcon } from "@/components/icons/AngleLeftSolid";
import { generateTeamCode } from "@/lib/team-utils"

interface TerminalFormProps {
  mode: "join" | "create";
  onBack: () => void;
  colorBlue: string;
  colorRed: string;
}

export function TerminalForm({ mode, onBack, colorBlue, colorRed }: TerminalFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");      // nombre del equipo (join) o nombre del equipo (create)
  const [tokenValue, setTokenValue] = useState("");      // token de invitación (solo join)
  const [error, setError] = useState("");

  const isJoin = mode === "join";
  const activeColor = isJoin ? colorBlue : colorRed;
  const terminalPath = isJoin ? "~/team/join/" : "~/team/create/name_";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // ── Modo JOIN ─────────────────────────────────────────────────
    if (isJoin) {
      try {
        const res = await fetch("/api/teams/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: inputValue.trim(), token: tokenValue.trim() }),
        });

        const data = await res.json();

        if (!res.ok) {
          // El backend devuelve field: 'name' o field: 'token' para errores específicos
          setError(data.error ?? "Token o nombre de equipo incorrecto.");
          setIsLoading(false);
          return;
        }

        // Join exitoso → redirigir al dashboard
        router.refresh();
        router.push("/dashboard/team");
      } catch {
        setError("No se pudo conectar con el servidor.");
        setIsLoading(false);
      }
      return;
    }

    // ── Modo CREATE ───────────────────────────────────────────────
    const generatedCode = generateTeamCode();

    try {
      const res = await fetch("/api/teams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inputValue.trim(), password: generatedCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Algo salió mal, intenta de nuevo.");
        setIsLoading(false);
        return;
      }

      router.refresh();
      router.push("/dashboard/team");
    } catch {
      setError("No se pudo conectar con el servidor.");
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <div className="flex items-end mb-[-1px] ml-4 relative z-10">
        <div
          className="px-4 py-1.5 font-mono text-[10px] sm:text-xs tracking-widest text-black font-bold uppercase relative"
          style={{ backgroundColor: activeColor }}
        >
          {terminalPath}
          <div
            className="absolute top-0 -right-[12px] w-[12px] h-full"
            style={{ backgroundColor: activeColor, clipPath: 'polygon(0 0, 0% 100%, 100% 100%)' }}
          />
        </div>
      </div>

      <div
        className="bg-black/80 backdrop-blur-md p-8 relative flex flex-col gap-6 shadow-2xl"
        style={{ borderTop: `2px solid ${activeColor}` }}
      >
        <div className="absolute top-0 right-0 w-3 h-3" style={{ backgroundColor: activeColor }} />

        <div className="flex items-center gap-3">
          <i className={`hn ${isJoin ? "hn-key" : "hn-plus"} text-2xl`} style={{ color: activeColor }} />
          <div>
            <h2 className="font-heading text-xl font-bold text-white tracking-wider">
              {isJoin ? "UNIRSE A ESCUADRÓN" : "INICIALIZAR EQUIPO"}
            </h2>
            <p className="font-mono text-xs text-white/40 mt-1">
              {isJoin ? "Requiere nombre del equipo y token de tu capitán." : "Elige el alias de equipo."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 mt-2">
          <div className="space-y-4">

            {/* Input nombre del equipo — siempre visible */}
            <div className="relative">
              <label className="font-mono text-xs text-white/40 tracking-widest uppercase">
                {isJoin ? "Nombre del equipo" : "Nombre del equipo"}
              </label>
              <Input
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); setError(""); }}
                placeholder={isJoin ? "<NullByte>" : "<Grupo Chronus>"}
                className="font-mono bg-transparent border-0 border-b-2 rounded-none text-xl text-white placeholder:text-white/20 px-0 py-2 focus-visible:ring-0 shadow-none"
                style={{ borderBottomColor: activeColor }}
                required
                autoFocus
              />
            </div>

            {/* Input token — solo en modo join */}
            {isJoin && (
              <div className="relative">
                <label className="font-mono text-xs text-white/40 tracking-widest uppercase">
                  Token de invitación
                </label>
                <Input
                  value={tokenValue}
                  onChange={(e) => { setTokenValue(e.target.value); setError(""); }}
                  placeholder="<aB3xK9>"
                  className="font-mono bg-transparent border-0 border-b-2 rounded-none text-xl text-white placeholder:text-white/20 px-0 py-2 focus-visible:ring-0 shadow-none"
                  style={{ borderBottomColor: activeColor }}
                  required
                />
              </div>
            )}

            {error && (
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="font-mono text-xs text-red-400 mt-2">
                [!] {error}
              </motion.p>
            )}
          </div>

          <div className="flex justify-between items-center pt-4">
            <button type="button" onClick={onBack} className="font-mono text-xs text-white/40 hover:text-white transition-colors tracking-widest flex items-center gap-2">
              <span className="text-lg leading-none"><AngleLeftSolidIcon width={18} height={18} /></span> ABORTAR
            </button>
            <Button
              type="submit"
              disabled={isLoading || inputValue.trim() === "" || (isJoin && tokenValue.trim() === "")}
              className="font-mono font-bold tracking-widest rounded-none text-black transition-all px-8"
              style={{ backgroundColor: activeColor, boxShadow: `0 0 15px ${activeColor}40` }}
            >
              {isLoading ? "PROCESANDO..." : "EJECUTAR"}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
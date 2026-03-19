"use client";

import { useState } from "react";
import { Boxes } from "@/components/ui/background-boxes";
import { AnimatePresence } from "framer-motion";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { SelectionCards } from "@/components/shared/teamUp/selection-cards";
import { TerminalForm } from "@/components/shared/teamUp/terminal-form";

const MATRIX_BLUE = "#00F0FF";
const MATRIX_RED  = "#FF003C";

type TeamMode = "selection" | "join" | "create";

export default function TeamUpPage() {
  const [mode, setMode] = useState<TeamMode>("selection");

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#0a0006] px-4 py-20">

      {/* ── CAPA 1: Degradado de profundidad espacial Synthwave ── */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a0006] via-[#1a0533] to-[#430464] opacity-90" />

      {/* ── CAPA 2: Sol Synthwave al centro-horizonte ── */}
      <div
        className="absolute z-0 w-[500px] h-[500px] rounded-full left-1/2 -translate-x-1/2"
        style={{
          bottom: "20%",
          background: "linear-gradient(180deg, #FEF759 0%, #F77200 35%, #EF01BA 65%, transparent 100%)",
          filter: "blur(2px)",
          opacity: 0.35,
        }}
      />

      {/* ── CAPA 3: Grid de perspectiva (horizonte retro) ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%] overflow-hidden z-0 opacity-30">
        {/* Líneas horizontales */}
        {[...Array(10)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute w-full border-t"
            style={{
              bottom: `${i * 10}%`,
              borderColor: "#EF01BA",
              opacity: 1 - i * 0.08,
              boxShadow: `0 0 6px #EF01BA`,
            }}
          />
        ))}
        {/* Líneas verticales de fuga */}
        {[...Array(11)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute bottom-0 h-full border-l"
            style={{
              left: `${i * 10}%`,
              borderColor: "#EF01BA",
              opacity: 0.25,
            }}
          />
        ))}
      </div>

      {/* ── CAPA 4: Scanlines CRT (textura retro) ── */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)",
        }}
      />

      {/* ── CAPA 5: Boxes de Aceternity (sutil encima del fondo) ── */}
      <div className="absolute inset-0 z-[2] hidden md:block opacity-10">
        <Boxes />
      </div>

      {/* ── CAPA 6: Máscara radial para enfocar el centro ── */}
      <div className="absolute inset-0 z-[3] bg-[#0a0006] [mask-image:radial-gradient(65%_55%_at_50%_50%,transparent_60%,white_100%)] pointer-events-none" />

      {/* ── CONTENIDO ── */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">

        {/* Encabezado */}
        <div className="text-center mb-12">
          <p className="font-mono text-white/50 text-xs tracking-[0.4em] uppercase mb-3">
            // Hack2Dawn CTF
          </p>
          <h1
            className="font-heading text-white text-4xl md:text-5xl font-bold tracking-wider"
            style={{ textShadow: "0 0 30px #EF01BA60, 0 0 60px #F7720030" }}
          >
            <EncryptedText
              text="CONFIGURACIÓN DE ESCUADRÓN"
              revealDelayMs={70}
              flipDelayMs={50}
              encryptedClassName="text-[#EF01BA]/50"
              revealedClassName=""
            />
          </h1>
        </div>

        {/* Orquestación de vistas */}
        <AnimatePresence mode="wait">
          {mode === "selection" ? (
            <SelectionCards
              key="selection"
              onSelect={setMode}
              colorBlue={MATRIX_BLUE}
              colorRed={MATRIX_RED}
            />
          ) : (
            <TerminalForm
              key="form"
              mode={mode}
              onBack={() => setMode("selection")}
              colorBlue={MATRIX_BLUE}
              colorRed={MATRIX_RED}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Boxes } from "@/components/ui/background-boxes";
import { AnimatePresence } from "framer-motion";
import { EncryptedText } from "@/components/ui/encrypted-text";

// Importa los componentes recién creados
import { SelectionCards } from "@/components/shared/teamUp/selection-cards";
import { TerminalForm } from "@/components/shared/teamUp/terminal-form";

const MATRIX_BLUE = "#00F0FF";
const MATRIX_RED  = "#FF003C";

type TeamMode = "selection" | "join" | "create";

export default function TeamUpPage() {
  const [mode, setMode] = useState<TeamMode>("selection");

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-[#0a0006] flex flex-col items-center justify-center px-4 py-20">
      
      <div className="absolute inset-0 z-0 hidden md:block">
        <Boxes />
      </div>
      <div className="absolute inset-0 z-10 bg-[#0a0006] [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

      <div className="relative z-20 w-full max-w-4xl flex flex-col items-center">
        
        {/* Encabezado */}
        <div className="text-center mb-12">
          <p className="font-mono text-white/50 text-xs tracking-[0.4em] uppercase mb-3">
            <EncryptedText 
              text="// Team Up" 
              revealDelayMs={70} 
              flipDelayMs={50} 
              encryptedClassName="text-[#EF01BA]/50" 
              revealedClassName=""
            />
          </p>
          <h1 className="font-heading text-white text-4xl md:text-5xl font-bold tracking-wider drop-shadow-[0_0_15px_rgba(239,1,186,0.5)]">
            <EncryptedText 
              text="CONFIGURACIÓN DE ESCUADRÓN" 
              revealDelayMs={50} 
              flipDelayMs={30} 
              encryptedClassName="text-[#EF01BA]/50" 
              revealedClassName=""
            />
          </h1>
        </div>

        {/* Orquestación de vistas */}
        <AnimatePresence mode="wait">
          {mode === "selection" ? (
            <SelectionCards 
              onSelect={setMode} 
              colorBlue={MATRIX_BLUE} 
              colorRed={MATRIX_RED} 
            />
          ) : (
            <TerminalForm 
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

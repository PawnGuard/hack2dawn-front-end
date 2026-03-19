"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AuthBackground } from "./auth-background";
import {
  SynthwaveField,
  SunsetButton,
  SunsetDivider,
} from "./auth-ui";

export function SignupForm() {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: conectar con /api/auth/register (iron-session)
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0006]">

      {/* Fondo compartido */}
      <AuthBackground />

      {/* Tarjeta */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4 py-10"
      >
        {/* Label Tab */}
        <div className="flex items-end mb-[-1px] ml-4">
          <div
            className="relative px-4 py-1.5 font-mono text-[10px] tracking-widest text-black font-bold uppercase"
            style={{ background: "linear-gradient(90deg, #EF01BA, #F77200)" }}
          >
            ~/auth/register/new_agent_
            <div
              className="absolute top-0 -right-[12px] w-[12px] h-full"
              style={{
                background: "linear-gradient(90deg, #EF01BA, #F77200)",
                clipPath: "polygon(0 0, 0% 100%, 100% 100%)",
              }}
            />
          </div>
        </div>

        {/* Contenedor */}
        <div
          className="relative bg-black/70 backdrop-blur-xl p-8"
          style={{ borderTop: "2px solid #EF01BA" }}
        >
          {/* Esquinas HUD */}
          <div className="absolute top-0 right-0 w-3 h-3" style={{ backgroundColor: "#F77200" }} />
          <div className="absolute bottom-0 left-0 w-3 h-3" style={{ backgroundColor: "#940992" }} />
          <div
            className="absolute top-0 left-0 w-[2px] h-full opacity-60"
            style={{ background: "linear-gradient(180deg, #EF01BA, #430464, transparent)" }}
          />

          {/* Header */}
          <div className="mb-8">
            <p className="font-mono text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: "#00F0FF" }}>
              // HACK2DAWN CTF 2026
            </p>
            <h2 className="font-heading text-2xl font-bold text-white tracking-wider"
              style={{ textShadow: "0 0 20px #EF01BA80" }}>
              CREAR IDENTIDAD
            </h2>
            <p className="font-mono text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              Regístrate como agente para competir en el CTF.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <SynthwaveField id="firstname" label="Nombre" placeholder="John Doe"
                focusedField={focusedField} setFocusedField={setFocusedField} />
            <SynthwaveField id="email" label="Email" placeholder="JohnDoe@whatfck.com"
              type="email" focusedField={focusedField} setFocusedField={setFocusedField} />
            <SynthwaveField id="password" label="Contraseña" placeholder="••••••••"
              type="password" focusedField={focusedField} setFocusedField={setFocusedField} />
            <SynthwaveField id="confirm" label="Confirmar Contraseña" placeholder="••••••••"
              type="password" focusedField={focusedField} setFocusedField={setFocusedField} />

            <SunsetDivider />
            <SunsetButton label="REGISTRAR AGENTE →" />

            <p className="font-mono text-xs text-center mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
              ¿Ya tienes acceso?{" "}
              <a href="/login" className="transition-colors hover:text-white" style={{ color: "#EF01BA" }}>
                INICIAR SESIÓN
              </a>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AuthBackground } from "./auth-background";
import {
  SynthwaveField,
  SunsetButton,
  SunsetDivider,
  SunsetBottomGradient,
  LabelInputContainer,
} from "./auth-ui";

export function LoginForm() {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: conectar con /api/auth/login (iron-session)
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
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Label Tab */}
        <div className="flex items-end mb-[-1px] ml-4">
          <div
            className="relative px-4 py-1.5 font-mono text-[10px] tracking-widest text-black font-bold uppercase"
            style={{ background: "linear-gradient(90deg, #EF01BA, #F77200)" }}
          >
            ~/auth/login/access_
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
              ACCESO AL SISTEMA
            </h2>
            <p className="font-mono text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              Ingresa tus credenciales para continuar.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            <SynthwaveField
              id="identifier"
              label="Usuario"
              placeholder="anonymous_agent"
              focusedField={focusedField}
              setFocusedField={setFocusedField}
            />

            {/* Password con toggle */}
            <LabelInputContainer>
              <Label
                htmlFor="password"
                className="font-mono text-xs tracking-widest transition-colors duration-300"
                style={{ color: focusedField === "password" ? "#EF01BA" : "rgba(255,255,255,0.45)" }}
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="font-mono bg-transparent border-0 border-b-2 rounded-none text-white placeholder:text-white/20 px-0 pr-8 py-2 h-10 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none transition-all duration-300 text-sm"
                  style={{
                    borderBottomColor: focusedField === "password" ? "#EF01BA" : "rgba(255,255,255,0.15)",
                    boxShadow: focusedField === "password" ? "0 4px 12px -4px #EF01BA60" : "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-2 text-white/30 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <SunsetBottomGradient active={focusedField === "password"} />
              </div>
            </LabelInputContainer>

            {/* Recuérdame */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className="w-4 h-4 border flex items-center justify-center transition-colors duration-200 cursor-pointer"
                  style={{
                    borderColor: rememberMe ? "#EF01BA" : "rgba(255,255,255,0.2)",
                    backgroundColor: rememberMe ? "#EF01BA15" : "transparent",
                  }}
                >
                  {rememberMe && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2"
                      style={{ backgroundColor: "#EF01BA" }}
                    />
                  )}
                </div>
                <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Recuérdame
                </span>
              </label>
              <a href="/forgot-password" className="font-mono text-xs transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.3)" }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <SunsetDivider />
            <SunsetButton label="INICIAR SESIÓN →" />

            <p className="font-mono text-xs text-center mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
              ¿Sin cuenta?{" "}
              <a href="/register" className="transition-colors hover:text-white" style={{ color: "#EF01BA" }}>
                CREAR IDENTIDAD
              </a>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

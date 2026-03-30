"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AuthBackground } from "./auth-background";
import {
  SynthwaveField,
  SunsetButton,
  SunsetDivider,
} from "./auth-ui";

export function SignupForm() {

  const router = useRouter();
  const submitLockRef = useRef(false);

  // ─── States originales del UI ────────────────────────────────
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // ─── States de lógica de auth ─────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
    isTecCampus?: string;
    server?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submitLockRef.current) return;
    submitLockRef.current = true;

    setErrors({});

    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string)?.trim();
    const email = (form.get("email") as string)?.trim();
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;
    const isTecCampus = form.get("isTecCampus") === "on";

    // ── Validaciones en cliente ───────────────────────────────
    const clientErrors: typeof errors = {};

    if (!name || name.length < 3 || name.length > 20 || /\s/.test(name)) {
      clientErrors.name = "3-20 caracteres, sin espacios";
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      clientErrors.email = "Email inválido";
    }
    if (!password || password.length < 8) {
      clientErrors.password = "Mínimo 8 caracteres";
    }
    if (password !== confirm) {
      clientErrors.confirm = "Las contraseñas no coinciden";
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      submitLockRef.current = false;
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, isTecCampus }),
      });

      const data = await res.json();

      if (!res.ok) {
        // El Route Handler nos dice qué campo falló (duplicado de username o email)
        if (data.field === "name") {
          setErrors({ name: data.error });
        } else if (data.field === "email") {
          setErrors({ email: data.error });
        } else {
          setErrors({ server: data.error || "Error al crear la cuenta" });
        }
        return;
      }

      router.push("/dashboard/team/select");
      router.refresh();
    } catch {
      setErrors({ server: "No se pudo conectar al servidor. Intenta de nuevo." });
    } finally {
      submitLockRef.current = false;
      setLoading(false);
    }
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
            <div>
              <SynthwaveField
                id="name"
                name="name"
                label="Username"
                placeholder="Username"
                focusedField={focusedField}
                setFocusedField={setFocusedField}
              />
              {errors.name && (
                <span className="font-mono text-xs text-red-400 mt-1 block">⚠ {errors.name}</span>
              )}
            </div>

            <div>
              <SynthwaveField
                id="email"
                name="email"
                label="Email"
                placeholder="Email"
                type="email"
                focusedField={focusedField}
                setFocusedField={setFocusedField}
              />
              {errors.email && (
                <span className="font-mono text-xs text-red-400 mt-1 block">⚠ {errors.email}</span>
              )}
            </div>

            <div>
              <SynthwaveField
                id="password"
                name="password"
                label="Contraseña"
                placeholder="Password"
                type="password"
                focusedField={focusedField}
                setFocusedField={setFocusedField}
              />
              {errors.password && (
                <span className="font-mono text-xs text-red-400 mt-1 block">⚠ {errors.password}</span>
              )}
              <p className="font-mono text-[10px] tracking-[0.08em] mt-2 text-white/40">
                Mínimo 8 caracteres. Recomendado: mayúscula, minúscula y número.
              </p>
            </div>

            <div>
              <SynthwaveField
                id="confirm"
                name="confirm"
                label="Confirmar Contraseña"
                placeholder="Confirmar Password"
                type="password"
                focusedField={focusedField}
                setFocusedField={setFocusedField}
              />
              {errors.confirm && (
                <span className="font-mono text-xs text-red-400 mt-1 block">⚠ {errors.confirm}</span>
              )}
            </div>

            <div className="rounded-md border border-white/20 bg-black/30 px-3 py-2">
              <label htmlFor="isTecCampus" className="flex items-start gap-3 cursor-pointer">
                <input
                  id="isTecCampus"
                  name="isTecCampus"
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-white/30 bg-black text-[#EF01BA]"
                />
                <span className="font-mono text-xs tracking-wider text-white/85">
                  Soy parte del campus TEC
                </span>
              </label>
              {errors.isTecCampus && (
                <span className="font-mono text-xs text-red-400 mt-1 block">⚠ {errors.isTecCampus}</span>
              )}
            </div>

            <SunsetDivider />
            {errors.server && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-mono text-xs text-red-400 text-center tracking-wider"
              >
                ⚠ {errors.server}
              </motion.p>
            )}

            <SunsetButton type="submit" disabled={loading}>
              {loading ? "REGISTRANDO AGENTE..." : "CREAR IDENTIDAD"}
            </SunsetButton>

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
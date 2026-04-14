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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGITS_REGEX = /^\d+$/;
const STUDY_LEVEL_OPTIONS = ["Preparatoria", "Licenciatura", "Maestria", "Doctorado"];
const SHIRT_SIZE_OPTIONS = ["CH", "M", "G", "XG", "XXG"];

interface SynthwaveSelectFieldProps {
  id: string;
  name?: string;
  label: React.ReactNode;
  options: string[];
  focusedField: string | null;
  setFocusedField: (id: string | null) => void;
  required?: boolean;
}

function requiredLabel(text: string) {
  return (
    <>
      {text} <span style={{ color: "#00F0FF" }}>*</span>
    </>
  );
}

function SynthwaveSelectField({
  id,
  name,
  label,
  options,
  focusedField,
  setFocusedField,
  required = false,
}: SynthwaveSelectFieldProps) {
  const isFocused = focusedField === id;

  return (
    <div className="flex w-full flex-col space-y-2">
      <label
        htmlFor={id}
        className="font-mono text-xs tracking-widest transition-colors duration-300"
        style={{ color: isFocused ? "#EF01BA" : "rgba(255,255,255,0.58)" }}
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name ?? id}
          required={required}
          onFocus={() => setFocusedField(id)}
          onBlur={() => setFocusedField(null)}
          defaultValue=""
          className="font-mono bg-transparent border-0 border-b-2 rounded-none text-white px-0 py-2 h-10 w-full focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none transition-all duration-300 text-sm appearance-none"
          style={{
            borderBottomColor: isFocused ? "#EF01BA" : "rgba(255,255,255,0.15)",
            boxShadow: isFocused ? "0 4px 12px -4px #EF01BA60" : "none",
          }}
        >
          <option value="" className="bg-[#140010] text-white/50">
            Selecciona una opción
          </option>
          {options.map((option) => (
            <option key={option} value={option} className="bg-[#140010] text-white">
              {option}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-0 bottom-2 text-xs text-white/60">▾</span>
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="font-mono text-xs text-red-400 mt-1 block">⚠ {message}</span>;
}

export function SignupForm() {
  const router = useRouter();
  const submitLockRef = useRef(false);

  // ─── States originales del UI ────────────────────────────────
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // ─── States de lógica de auth ─────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    name?: string;
    age?: string;
    email?: string;
    phone?: string;
    matricula?: string;
    country?: string;
    career?: string;
    studyLevel?: string;
    ctfsAttended?: string;
    shirtSize?: string;
    heardFrom?: string;
    emergencyName?: string;
    emergencyRelation?: string;
    emergencyPhone?: string;
    emergencyEmail?: string;
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
    const getString = (key: string) => ((form.get(key) as string) ?? "").trim();

    const firstName = getString("firstName");
    const lastName = getString("lastName");
    const name = (form.get("name") as string)?.trim();
    const ageRaw = getString("age");
    const email = (form.get("email") as string)?.trim();
    const phone = getString("phone");
    const matriculaRaw = getString("matricula");
    const country = getString("country");
    const career = getString("career");
    const studyLevel = getString("studyLevel");
    const ctfsAttendedRaw = getString("ctfsAttended");
    const shirtSize = getString("shirtSize");
    const heardFrom = getString("heardFrom");
    const emergencyName = getString("emergencyName");
    const emergencyRelation = getString("emergencyRelation");
    const emergencyPhone = getString("emergencyPhone");
    const emergencyEmail = getString("emergencyEmail");
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;
    const isTecCampus = form.get("isTecCampus") === "on";
    const age = Number(ageRaw);
    const matricula = matriculaRaw ? Number(matriculaRaw) : null;
    const ctfsAttended = ctfsAttendedRaw ? Number(ctfsAttendedRaw) : null;

    // ── Validaciones en cliente ───────────────────────────────
    const clientErrors: typeof errors = {};

    if (!firstName || firstName.length < 2) {
      clientErrors.firstName = "Ingresa al menos 2 caracteres";
    }
    if (!lastName || lastName.length < 2) {
      clientErrors.lastName = "Ingresa al menos 2 caracteres";
    }
    if (!name || name.length < 3 || name.length > 20 || /\s/.test(name)) {
      clientErrors.name = "3-20 caracteres, sin espacios";
    }
    if (!ageRaw || !DIGITS_REGEX.test(ageRaw) || !Number.isInteger(age) || age < 12 || age > 99) {
      clientErrors.age = "Edad inválida (12-99)";
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      clientErrors.email = "Email inválido";
    }
    if (!phone || !DIGITS_REGEX.test(phone) || phone.length < 8 || phone.length > 15) {
      clientErrors.phone = "Teléfono inválido (8-15 dígitos)";
    }
    if (!country) {
      clientErrors.country = "Campo obligatorio";
    }
    if (studyLevel && !STUDY_LEVEL_OPTIONS.includes(studyLevel)) {
      clientErrors.studyLevel = "Nivel de estudios inválido";
    }
    if (
      ctfsAttendedRaw &&
      (!DIGITS_REGEX.test(ctfsAttendedRaw) || ctfsAttended === null || !Number.isInteger(ctfsAttended) || ctfsAttended < 0)
    ) {
      clientErrors.ctfsAttended = "Solo números enteros positivos";
    }
    if (!shirtSize || !SHIRT_SIZE_OPTIONS.includes(shirtSize)) {
      clientErrors.shirtSize = "Selecciona una talla válida";
    }
    if (!heardFrom || heardFrom.length < 3) {
      clientErrors.heardFrom = "Cuéntanos cómo te enteraste";
    }
    if (!emergencyName || emergencyName.length < 2) {
      clientErrors.emergencyName = "Campo obligatorio";
    }
    if (!emergencyRelation || emergencyRelation.length < 2) {
      clientErrors.emergencyRelation = "Campo obligatorio";
    }
    if (
      !emergencyPhone ||
      !DIGITS_REGEX.test(emergencyPhone) ||
      emergencyPhone.length < 8 ||
      emergencyPhone.length > 15
    ) {
      clientErrors.emergencyPhone = "Teléfono inválido (8-15 dígitos)";
    }
    if (!emergencyEmail || !EMAIL_REGEX.test(emergencyEmail)) {
      clientErrors.emergencyEmail = "Email inválido";
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
        body: JSON.stringify({
          name,
          email,
          password,
          isTecCampus,
          profile: {
            firstName,
            lastName,
            age,
            phone,
            matricula,
            country,
            career,
            studyLevel,
            ctfsAttended,
            shirtSize,
            heardFrom,
            emergencyName,
            emergencyRelation,
            emergencyPhone,
            emergencyEmail,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // El Route Handler puede regresar un campo específico para mostrar el error inline.
        if (typeof data.field === "string" && data.field.length > 0) {
          setErrors({ [data.field]: data.error || "Campo inválido" } as typeof errors);
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
        className="relative z-10 w-full max-w-5xl mx-4 py-10"
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="font-mono text-[10px] tracking-[0.08em] text-white/45">* Campos obligatorios</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <SynthwaveField
                  id="firstName"
                  name="firstName"
                  label={requiredLabel("Nombre")}
                  placeholder="Nombre"
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
                <FieldError message={errors.firstName} />
              </div>

              <div>
                <SynthwaveField
                  id="lastName"
                  name="lastName"
                  label={requiredLabel("Apellido")}
                  placeholder="Apellido"
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
                <FieldError message={errors.lastName} />
              </div>

              <div>
                <SynthwaveField
                  id="name"
                  name="name"
                  label={requiredLabel("Username")}
                  placeholder="Username"
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
                <FieldError message={errors.name} />
              </div>

              <div>
                <SynthwaveField
                  id="email"
                  name="email"
                  label={requiredLabel("Correo Electrónico")}
                  placeholder="Email"
                  type="email"
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
                <FieldError message={errors.email} />
              </div>

              <div>
                <SynthwaveField
                  id="age"
                  name="age"
                  label={requiredLabel("Edad")}
                  placeholder="Ej. 21"
                  type="text"
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
                <FieldError message={errors.age} />
              </div>

              <div>
                <SynthwaveField
                  id="phone"
                  name="phone"
                  label={requiredLabel("Número Telefónico")}
                  placeholder="Ej. 5512345678"
                  type="text"
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
                <FieldError message={errors.phone} />
              </div>

              <div>
                <SynthwaveField
                  id="matricula"
                  name="matricula"
                  label="Matrícula"
                  placeholder="Opcional"
                  type="text"
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
                <FieldError message={errors.matricula} />
              </div>

              <div>
                <SynthwaveField
                  id="country"
                  name="country"
                  label={requiredLabel("País de Residencia")}
                  placeholder="México"
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
                <FieldError message={errors.country} />
              </div>

              <div>
                <SynthwaveField
                  id="career"
                  name="career"
                  label="Carrera"
                  placeholder="Ej. ITC"
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
                <FieldError message={errors.career} />
              </div>

              <div>
                <SynthwaveSelectField
                  id="studyLevel"
                  name="studyLevel"
                  label="Nivel Actual de Estudios"
                  options={STUDY_LEVEL_OPTIONS}
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
                <FieldError message={errors.studyLevel} />
              </div>

              <div>
                <SynthwaveField
                  id="ctfsAttended"
                  name="ctfsAttended"
                  label="CTF's Asistidos"
                  placeholder="Ej. 3"
                  type="text"
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
                <FieldError message={errors.ctfsAttended} />
              </div>

              <div>
                <SynthwaveSelectField
                  id="shirtSize"
                  name="shirtSize"
                  label={
                    <>
                      Talla de Camisa <span style={{ color: "#00F0FF" }}>*</span> (No sabemos si tendremos lol)
                    </>
                  }
                  options={SHIRT_SIZE_OPTIONS}
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                  required
                />
                <FieldError message={errors.shirtSize} />
              </div>

              <div className="md:col-span-2">
                <SynthwaveField
                  id="heardFrom"
                  name="heardFrom"
                  label={requiredLabel("¿Cómo te enteraste del evento?")}
                  placeholder="Cuéntanos en una línea"
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
                <FieldError message={errors.heardFrom} />
              </div>

              <div>
                <SynthwaveField
                  id="password"
                  name="password"
                  label={requiredLabel("Contraseña")}
                  placeholder="Password"
                  type="password"
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
                <FieldError message={errors.password} />
              </div>

              <div>
                <SynthwaveField
                  id="confirm"
                  name="confirm"
                  label={requiredLabel("Confirmar Contraseña")}
                  placeholder="Confirmar Password"
                  type="password"
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
                <FieldError message={errors.confirm} />
              </div>

              <div className="md:col-span-2">
                <p className="font-mono text-[10px] tracking-[0.08em] mt-1 text-white/40">
                  Mínimo 8 caracteres. Recomendado: mayúscula, minúscula y número.
                </p>
              </div>
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
              <FieldError message={errors.isTecCampus} />
            </div>

            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: "#00F0FF" }}>
                // CONTACTO DE EMERGENCIA *
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <SynthwaveField
                    id="emergencyName"
                    name="emergencyName"
                    label={requiredLabel("Nombre")}
                    placeholder="Nombre completo"
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                  />
                  <FieldError message={errors.emergencyName} />
                </div>

                <div>
                  <SynthwaveField
                    id="emergencyRelation"
                    name="emergencyRelation"
                    label={requiredLabel("Relación")}
                    placeholder="Ej. Madre, Padre, Tutor"
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                  />
                  <FieldError message={errors.emergencyRelation} />
                </div>

                <div>
                  <SynthwaveField
                    id="emergencyPhone"
                    name="emergencyPhone"
                    label={requiredLabel("Teléfono")}
                    placeholder="Ej. 5512345678"
                    type="text"
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                  />
                  <FieldError message={errors.emergencyPhone} />
                </div>

                <div>
                  <SynthwaveField
                    id="emergencyEmail"
                    name="emergencyEmail"
                    label={requiredLabel("Correo Electrónico")}
                    placeholder="correo@ejemplo.com"
                    type="email"
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                  />
                  <FieldError message={errors.emergencyEmail} />
                </div>
              </div>
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
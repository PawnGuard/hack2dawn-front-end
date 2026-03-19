"use client";

import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Tipos compartidos ─────────────────────────────────────────────
export interface SynthwaveFieldProps {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  focusedField: string | null;
  setFocusedField: (id: string | null) => void;
}

// ─── Input con estilo Synthwave terminal ──────────────────────────
export function SynthwaveField({
  id,
  label,
  placeholder,
  type = "text",
  focusedField,
  setFocusedField,
}: SynthwaveFieldProps) {
  const isFocused = focusedField === id;

  return (
    <LabelInputContainer>
      <Label
        htmlFor={id}
        className="font-mono text-xs tracking-widest transition-colors duration-300"
        style={{ color: isFocused ? "#EF01BA" : "rgba(255,255,255,0.45)" }}
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          placeholder={placeholder}
          type={type}
          onFocus={() => setFocusedField(id)}
          onBlur={() => setFocusedField(null)}
          className="font-mono bg-transparent border-0 border-b-2 rounded-none text-white placeholder:text-white/20 px-0 py-2 h-10 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none transition-all duration-300 text-sm"
          style={{
            borderBottomColor: isFocused ? "#EF01BA" : "rgba(255,255,255,0.15)",
            boxShadow: isFocused ? "0 4px 12px -4px #EF01BA60" : "none",
          }}
        />
        {/* Cursor parpadeante */}
        {isFocused && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute bottom-2 right-0 w-2 h-[2px]"
            style={{ backgroundColor: "#EF01BA" }}
          />
        )}
        <SunsetBottomGradient active={isFocused} />
      </div>
    </LabelInputContainer>
  );
}

// ─── Línea gradiente inferior (hover/focus) ────────────────────────
export function SunsetBottomGradient({ active }: { active: boolean }) {
  return (
    <>
      <span
        className="absolute inset-x-0 -bottom-px block h-px w-full transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(90deg, transparent, #EF01BA, #F77200, transparent)",
          opacity: active ? 1 : 0,
        }}
      />
      <span
        className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 blur-sm transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(90deg, transparent, #940992, #EF01BA, transparent)",
          opacity: active ? 0.8 : 0,
        }}
      />
    </>
  );
}

// ─── Botón con gradiente Sunset ────────────────────────────────────
export function SunsetButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="group/btn relative w-full h-11 font-mono font-bold tracking-widest text-black text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: "linear-gradient(90deg, #EF01BA, #F77200, #FEF759)",
        boxShadow: "0 0 20px #EF01BA50, 0 0 40px #F7720020",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 0 30px #EF01BA80, 0 0 60px #F7720040";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 0 20px #EF01BA50, 0 0 40px #F7720020";
      }}
    >
      {label}
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-30" />
    </button>
  );
}

// ─── Divider con glow Sunset ───────────────────────────────────────
export function SunsetDivider() {
  return (
    <div className="relative h-px w-full my-2">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, #EF01BA, #F77200, transparent)",
        }}
      />
      <div
        className="absolute inset-0 blur-sm"
        style={{
          background:
            "linear-gradient(90deg, transparent, #EF01BA, #F77200, transparent)",
        }}
      />
    </div>
  );
}

// ─── Wrapper de Label + Input ──────────────────────────────────────
export const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex w-full flex-col space-y-2", className)}>
    {children}
  </div>
);
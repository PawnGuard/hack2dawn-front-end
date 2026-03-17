"use client";

import { motion } from "framer-motion";
import { CtfCard } from "@/components/shared/CtfCard";
// Asegúrate de que las rutas a los iconos coincidan con tu proyecto
// Si no tienes estos iconos, usa los de <i className="hn ..."/> que usabas antes
import { UsersSolidIcon } from "@/components/icons/UsersSolid";
import { UsersCrownSolidIcon } from "@/components/icons/UsersCrownSolid";

interface SelectionCardsProps {
  onSelect: (mode: "join" | "create") => void;
  colorBlue: string;
  colorRed: string;
}

export function SelectionCards({ onSelect, colorBlue, colorRed }: SelectionCardsProps) {
  return (
    <motion.div 
      key="selection"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full"
    >
      {/* Tarjeta Unirse */}
      <CtfCard
        label="opción 01"
        title="UNIRSE A ESCUADRÓN"
        description="Ya tengo un token de invitación de mi capitán."
        accentColor={colorBlue}
        badge="01"
        icon={<UsersSolidIcon style={{ color: colorBlue }} />}
        className="cursor-pointer hover:-translate-y-2 transition-transform duration-300"
        onClick={() => onSelect("join")}
      />

      {/* Tarjeta Crear */}
      <CtfCard
        label="opción 02"
        title="CREAR ESCUADRÓN"
        description="Seré el capitán y crearé mi propio equipo."
        accentColor={colorRed}
        badge="02"
        icon={<UsersCrownSolidIcon style={{ color: colorRed }} />}
        className="cursor-pointer hover:-translate-y-2 transition-transform duration-300"
        onClick={() => onSelect("create")}
      />
    </motion.div>
  );
}

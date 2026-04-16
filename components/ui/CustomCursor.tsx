"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    const updatePointer = () => setIsFinePointer(mediaQuery.matches);

    updatePointer();
    mediaQuery.addEventListener("change", updatePointer);

    return () => {
      mediaQuery.removeEventListener("change", updatePointer);
    };
  }, []);

  useEffect(() => {
    if (!isFinePointer) {
      return;
    }

    // Actualiza la posición del mouse
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    // Detecta si el mouse sale de la ventana
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Detecta si el mouse está sobre un elemento clickeable
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Revisa si el elemento o sus padres son interactivos
      const isClickable = target.closest('a, button, [role="button"], input, select, textarea, .cursor-pointer');
      setIsHovering(!!isClickable);
    };

    window.addEventListener("mousemove", updatePosition);
    window.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible, isFinePointer]);

  if (!isFinePointer) return null;

  // Si el mouse no está en la ventana, no mostramos nada
  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference" // mix-blend-difference es opcional, le da un toque cyberpunk
      animate={{
        x: position.x - 2, // Ajuste para que la punta del cursor sea el centro del clic
        y: position.y - 2,
      }}
      transition={{
        type: "spring",
        stiffness: 1000,
        damping: 40,
        mass: 0.1 // masa muy baja para que siga al mouse sin "lag"
      }}
    >
      <svg 
        width="24" // Lo hice un poco más grande para que se aprecie el detalle
        height="24" 
        viewBox="0 0 17 16" 
        xmlns="http://www.w3.org/2000/svg"
        className="transition-colors duration-200" // Transición suave entre estados
      >
        <path 
          d="M0.783691 0.345703H5.22658L5.22663 2.56711H9.66952V4.78856L16.3339 4.78854L16.3339 9.23144L11.8909 9.23148L11.891 11.4529L9.66951 11.4529L9.66947 15.8958L5.22652 15.8959L5.22659 9.23148H3.00514V4.7886L0.783735 4.78855L0.783691 0.345703Z" 
          // LA MAGIA OCURRE AQUÍ:
          fill={isHovering ? "#72C3C7" : "transparent"} // Relleno color vs transparente
          stroke="#72C3C7" // Borde siempre del mismo color
          strokeWidth="1.5" // Grosor del borde cuando es transparente
        />
      </svg>
    </motion.div>
  );
}
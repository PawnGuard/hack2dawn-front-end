// Fondo Synthwave compartido para todas las páginas de Auth

export function AuthBackground() {
  return (
    <div className="absolute inset-0 z-0">
      {/* Degradado de profundidad espacial */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0006] via-[#1a0533] to-[#430464] opacity-90" />

      {/* Sol Synthwave */}
      <div
        className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full"
        style={{
          background: "linear-gradient(180deg, #FEF759 0%, #F77200 40%, #EF01BA 70%, transparent 100%)",
          filter: "blur(1px)",
          opacity: 0.6,
        }}
      />

      {/* Grid de perspectiva */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 overflow-hidden opacity-40">
        {/* Líneas horizontales */}
        {[...Array(10)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute w-full border-t"
            style={{
              bottom: `${i * 10}%`,
              borderColor: "#EF01BA",
              opacity: 1 - i * 0.08,
              boxShadow: "0 0 6px #EF01BA",
            }}
          />
        ))}
        {/* Líneas verticales de fuga */}
        {[...Array(9)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute bottom-0 h-full border-l"
            style={{
              left: `${(i + 1) * 10}%`,
              borderColor: "#EF01BA",
              opacity: 0.3,
              transformOrigin: "bottom center",
              transform: "perspective(200px) rotateX(60deg)",
            }}
          />
        ))}
      </div>

      {/* Scanlines CRT */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
        }}
      />
    </div>
  );
}
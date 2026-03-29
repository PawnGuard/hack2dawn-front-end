export default function TeamSelectLoading() {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: '#0a0006',
        padding: '5rem 1rem',
      }}
    >
      <style>{`
        @keyframes shimmer-synth {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .sk {
          background: linear-gradient(
            90deg,
            rgba(239,1,186,0.05) 25%,
            rgba(239,1,186,0.16) 50%,
            rgba(239,1,186,0.05) 75%
          );
          background-size: 200% 100%;
          animation: shimmer-synth 1.8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .sk { animation: none; background: rgba(239,1,186,0.07); }
        }
      `}</style>

      {/* Capa 1 — Gradiente espacial */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'linear-gradient(180deg, #0a0006 0%, #1a0533 55%, #430464 100%)',
        opacity: 0.9,
      }} />

      {/* Capa 2 — Sol synthwave */}
      <div style={{
        position: 'absolute', zIndex: 0,
        width: '500px', height: '500px',
        borderRadius: '50%',
        left: '50%', transform: 'translateX(-50%)',
        bottom: '-80px',
        background: 'linear-gradient(180deg, #FEF759 0%, #F77200 35%, #EF01BA 65%, transparent 100%)',
        filter: 'blur(2px)',
        opacity: 0.28,
      }} />

      {/* Capa 3 — Grid perspectiva horizonte */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '35%', overflow: 'hidden', zIndex: 0, opacity: 0.28,
      }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={`h-${i}`} style={{
            position: 'absolute', width: '100%',
            borderTop: '1px solid #EF01BA',
            bottom: `${i * 10}%`,
            opacity: 1 - i * 0.08,
            boxShadow: '0 0 6px #EF01BA',
          }} />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={`v-${i}`} style={{
            position: 'absolute', bottom: 0, height: '100%',
            borderLeft: '1px solid #EF01BA',
            left: `${i * 10}%`,
            opacity: 0.22,
          }} />
        ))}
      </div>

      {/* Capa 4 — Scanlines CRT */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)',
      }} />

      {/* Capa 5 — Máscara radial */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
        background: '#0a0006',
        WebkitMaskImage: 'radial-gradient(65% 55% at 50% 50%, transparent 60%, white 100%)',
        maskImage:         'radial-gradient(65% 55% at 50% 50%, transparent 60%, white 100%)',
      }} />

      {/* Contenido */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '896px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>

        {/* Header skeleton */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '14px',
          marginBottom: '3rem', width: '100%',
        }}>
          {/* "Hack2Dawn CTF" label */}
          <div className="sk" style={{ height: '10px', width: '112px', borderRadius: '2px' }} />
          {/* h1 "CONFIGURACIÓN DE ESCUADRÓN" */}
          <div className="sk" style={{ height: '42px', width: '380px', maxWidth: '85%', borderRadius: '2px' }} />
        </div>

        {/* Grid 2 cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2rem',
          width: '100%',
        }}>
          <SkeletonCard accentColor="#00F0FF" />
          <SkeletonCard accentColor="#FF003C" />
        </div>
      </div>
    </div>
  )
}

function SkeletonCard({ accentColor }: { accentColor: string }) {
  return (
    <div style={{
      border: `1px solid ${accentColor}28`,
      borderRadius: '4px',
      padding: '2rem',
      position: 'relative',
      backgroundColor: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(8px)',
      minHeight: '220px',
    }}>
      {/* Esquinas HUD */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '12px', height: '12px',
        borderTop: `2px solid ${accentColor}`,
        borderRight: `2px solid ${accentColor}`,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        width: '12px', height: '12px',
        borderBottom: `2px solid ${accentColor}`,
        borderLeft: `2px solid ${accentColor}`,
      }} />

      {/* Badge "opción 0X" */}
      <div className="sk" style={{ height: '9px', width: '60px', borderRadius: '2px', marginBottom: '1.5rem' }} />

      {/* Ícono — círculo */}
      <div className="sk" style={{
        width: '38px', height: '38px',
        borderRadius: '50%', marginBottom: '1.25rem', flexShrink: 0,
      }} />

      {/* Título */}
      <div className="sk" style={{ height: '18px', width: '72%', borderRadius: '2px', marginBottom: '0.875rem' }} />

      {/* Descripción — 2 líneas */}
      <div className="sk" style={{ height: '11px', width: '95%', borderRadius: '2px', marginBottom: '0.4rem' }} />
      <div className="sk" style={{ height: '11px', width: '55%', borderRadius: '2px' }} />

      {/* Barra inferior de acento */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)`,
        borderRadius: '0 0 4px 4px',
      }} />
    </div>
  )
}
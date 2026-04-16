'use client';

import { useState } from 'react';
import CallToAction from './CallToAction';
import HeroBackground from './HeroBackground';
import HeroContent from './HeroContent';
import HeroCountdown from './HeroCountdown';
import ScrollCTA from './ScrollCTA';

const EVENT_DATE = process.env.NEXT_PUBLIC_EVENT_START!;

export default function HeroSection() {
  const [videoReady, setVideoReady] = useState(false);

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center">
      
      {/* Fondo negro sólido mientras el video no ha cargado */}
      <div className="absolute inset-0 bg-black z-0" />

      {/* Video — avisa cuando puede reproducirse */}
      <HeroBackground onReady={() => setVideoReady(true)} />

      {/* Contenido: aparece con fade + slide-up cuando el video está listo */}
      <div
        className="relative z-20 flex flex-col items-center gap-8 px-6 text-center"
        style={{
          opacity: videoReady ? 1 : 0,
          transform: videoReady ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.9s ease, transform 0.9s ease',
        }}
      >
        <HeroContent />
        <HeroCountdown targetDate={new Date(EVENT_DATE)} />
        <CallToAction />
        <ScrollCTA />
      </div>

    </section>
  );
}
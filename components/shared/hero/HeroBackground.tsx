"use client";

import { useEffect, useRef } from "react";

interface HeroBackgroundProps {
  onReady?: () => void;
}

export default function HeroBackground({ onReady }: HeroBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Garantizar autoplay en browsers móviles que ignoran el atributo HTML
    // (frecuente en Android Chrome y navegadores embebidos como WeChat/Instagram).
    // El .play() debe llamarse en useEffect para ejecutarse sólo en el cliente.
    const tryPlay = () => {
      video.play().catch(() => {
        // Autoplay bloqueado — esperar la primera interacción del usuario
        // (toque o click) para reanudar la reproducción.
        const resume = () => {
          video.play().catch(() => undefined);
        };
        document.addEventListener("touchstart", resume, { once: true, capture: true });
        document.addEventListener("click", resume, { once: true, capture: true });
      });
    };

    if (video.readyState >= 2) {
      // HAVE_CURRENT_DATA o superior — ya tiene suficientes datos
      tryPlay();
    } else {
      video.addEventListener("canplay", tryPlay, { once: true });
    }

    return () => {
      video.removeEventListener("canplay", tryPlay);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        // webkit-playsinline: necesario para iOS Safari < 10
        {...({ "webkit-playsinline": "true" } as Record<string, string>)}
        preload="auto"
        disablePictureInPicture
        className="absolute inset-0 w-full h-full object-cover"
        onCanPlay={onReady}
      >
        <source src="/background/Herobackground.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/50" />
    </div>
  );
}
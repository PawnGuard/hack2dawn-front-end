"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./About.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const img = wrapper.querySelector<HTMLElement>(`.${styles.img}`);
        const hero = wrapper.querySelector<HTMLElement>(`.${styles.hero}`);
        const foreground = wrapper.querySelector<HTMLElement>(`.${styles.aboutForeground}`);
        const gradient = wrapper.querySelector<HTMLElement>(`.${styles.topGradient}`);
        const aboutTitle = wrapper.querySelector<HTMLElement>(`.${styles.aboutTitle}`);

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: wrapper,
                start: "top top",
                end: "+=500%",
                pin: true,
                scrub: true,
            },
        });

        tl.to(gradient, {
            opacity: 0,
            duration: 0.3,
            ease: "power1.inOut",
        }, 0)
        .to(img, {
            scale: 4,
            z: 350,
            transformOrigin: "center 80%",
            ease: "power1.inOut",
        }, 0).to(
            hero,
            {
                scale: 1.1,
                transformOrigin: "top top",
                ease: "power1.inOut",
            },
            "<"
        ).to(
            foreground,
            {
                yPercent: -10,
                scale: 1.05,
                ease: "power1.inOut",
            },
            "<"
        )

        /* ── Fase 2: el título aparece y luego scrollea hacia abajo
           detrás de About2.svg (z-index menor) ── */
        .fromTo(
            aboutTitle,
            { opacity: 0, yPercent: 0 },
            { opacity: 1, yPercent: 0, duration: 0.15, ease: "power1.inOut" },
            ">" // empieza al terminar el zoom
        )
        .to(
            aboutTitle,
            {
                yPercent: 400,
                ease: "none", // lineal = se siente como scroll natural
                duration: 1.5,
            },
            ">"
        );

        return () => {
            tl.kill();
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, []);

    return (
        <div ref={wrapperRef} className={styles.wrapper}>
            {/* Degradado para fundir con el banner (fuera del container con perspective) */}
            <div className={styles.topGradient} />

            {/* .content → .section.hero: BackgroundAbout.svg + About2.svg (about real) */}
            <div className={styles.content}>
                <section className={styles.hero}>
                    <div className={styles.aboutForeground}>
                        <Image
                            src="/background/About2.svg"
                            alt="About Detail"
                            draggable={false}
                            fill
                            unoptimized
                            style={{ objectFit: 'cover', objectPosition: 'center top' }}
                        />
                    </div>
                    <div className={`${styles.aboutTitle} flex flex-col-reverse md:flex-row items-start gap-4 md:gap-8 lg:gap-12 px-4 md:px-6 lg:px-12`}>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl leading-relaxed text-white/95 m-0 p-4 md:p-6 lg:p-8 bg-black/50 border-l-4 border-orange-500 rounded backdrop-blur-md flex-shrink md:flex-shrink-0">
                            Hack2Dawn es un evento de ciberseguridad tipo Capture The Flag (CTF)
                            donde equipos compiten resolviendo desafíos de seguridad informática
                            durante toda la noche hasta el amanecer.
                        </p>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-left flex-shrink-0 md:ml-auto lg:ml-96">
                            About
                        </h2>
                    </div>
                </section>
            </div>

            {/* .image-container → About.svg (capa encima, hace zoom al about real) */}
            <div className={styles.imageContainer}>
                <div className={styles.img}>
                    <Image
                        src="/background/About.svg"
                        alt="About"
                        draggable={false}
                        fill
                        unoptimized
                        style={{ objectFit: 'cover', objectPosition: 'center center' }}
                    />
                </div>
            </div>
        </div>
    );
}

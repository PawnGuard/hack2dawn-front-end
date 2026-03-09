"use client";

import { useEffect, useRef, useState, type RefCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { galleryItems, type GalleryItem } from "@/data/gallery";
import { aboutContent } from "@/data/about";
import styles from "./StorySection.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function StorySection() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const carRef = useRef<HTMLDivElement>(null);
    const roadGridRef = useRef<HTMLDivElement>(null);
    const galleryLayerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const heroRef = useRef<HTMLElement>(null);
    const roadRef = useRef<HTMLDivElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    const [imagesVisible, setImagesVisible] = useState(false);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        const track = trackRef.current;
        const car = carRef.current;
        const roadGrid = roadGridRef.current;
        const galleryLayer = galleryLayerRef.current;
        if (!wrapper || !track) return;

        const img = wrapper.querySelector<HTMLElement>(`.${styles.img}`);
        const hero = heroRef.current;
        const road = roadRef.current;
        const foreground = wrapper.querySelector<HTMLElement>(
            `.${styles.aboutForeground}`,
        );
        const gradient = wrapper.querySelector<HTMLElement>(
            `.${styles.topGradient}`,
        );
        const aboutTitle = wrapper.querySelector<HTMLElement>(
            `.${styles.aboutTitle}`,
        );

        /* ── Parallax constants ───────────────────────────── */
        const PARALLAX_FACTOR = 0.12;
        const BOUNCE_AMP = 3;
        const BOUNCE_FREQ = 0.015;

        /* ── Build the unified timeline ───────────────────── */
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: wrapper,
                start: "top top",
                end: () => {
                    const trackOverflow = track.scrollWidth - window.innerWidth;
                    const descentScroll = window.innerHeight * 1;
                    return `+=${window.innerHeight * 2 + descentScroll + Math.max(0, trackOverflow)}`;
                },
                pin: true,
                scrub: 0.5,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    /* ── Phase-4 per-frame work: parallax, road grid, car bounce ── */
                    if (!galleryLayer || galleryLayer.style.opacity === "0")
                        return;

                    const totalEnd =
                        typeof self.end === "number" ? self.end : 0;
                    const totalStart =
                        typeof self.start === "number" ? self.start : 0;
                    const scrollRange = totalEnd - totalStart;
                    if (scrollRange <= 0) return;

                    // About phases take ~3 viewport heights + 1 for descent
                    const aboutScrollPx = window.innerHeight * 4;
                    const galleryScrollRange = scrollRange - aboutScrollPx;
                    if (galleryScrollRange <= 0) return;

                    const scrolled = self.progress * scrollRange;
                    const galleryProgress = Math.min(
                        1,
                        Math.max(0, (scrolled - aboutScrollPx) / galleryScrollRange),
                    );

                    if (galleryProgress === 0) return;

                    const maxTranslate =
                        track.scrollWidth - window.innerWidth;
                    const translateX = galleryProgress * maxTranslate;

                    // Per-item parallax
                    itemRefs.current.forEach((el, i) => {
                        if (!el) return;
                        const speed = galleryItems[i]?.scrollSpeed ?? 1;
                        const parallax =
                            translateX * (speed - 1) * PARALLAX_FACTOR;
                        el.style.transform = `translateX(${-parallax}px)`;
                    });

                    // Road grid scroll
                    if (roadGrid) {
                        roadGrid.style.backgroundPosition = `${-translateX * 0.5}px 0`;
                    }

                    // Car vertical bounce
                    if (car) {
                        const bounceY =
                            Math.sin(translateX * BOUNCE_FREQ) * BOUNCE_AMP;
                        gsap.set(car, { y: bounceY });
                    }
                },
            },
        });

        /* ── Phase 1: About zoom ──────────────────────────── */
        tl.to(
            gradient,
            { opacity: 0, duration: 0.3, ease: "power1.inOut" },
            0,
        )
            .to(
                img,
                {
                    scale: 4,
                    z: 350,
                    transformOrigin: "center 80%",
                    ease: "power1.inOut",
                },
                0,
            )
            .to(
                hero,
                { scale: 1.1, transformOrigin: "top top", ease: "power1.inOut" },
                "<",
            )
            .to(
                foreground,
                { yPercent: -10, scale: 1.05, ease: "power1.inOut" },
                "<",
            );

        /* ── Phase 2: About title appears → scrolls down ─── */
        tl.fromTo(
            aboutTitle,
            { opacity: 0, yPercent: 0 },
            { opacity: 1, yPercent: 0, duration: 0.15, ease: "power1.inOut" },
            ">",
        ).to(aboutTitle, {
            yPercent: 400,
            ease: "none",
            duration: 1.5,
        }, ">");

        /* ── Phase 2.5: Descenso vertical de la montaña ───── */

        // Fade in galleryLayer so road is visible as it rises
        tl.to(galleryLayer, {
            opacity: 1,
            duration: 0.3,
            ease: "power1.inOut",
        }, ">")
        // Hide only the front SVG zoom layer
        .to(imageContainerRef.current, {
            opacity: 0,
            duration: 0.4,
            ease: "power1.inOut",
        }, "<")
        // Move the whole hero section (bg + foreground) upward, leaving 33% for the road
        .to(hero, {
            yPercent: -43,
            ease: "none",
            duration: 2,
        }, "<")
        .fromTo(road, {
            y: "100%",
            opacity: 0,
        }, {
            y: "0%",
            opacity: 1,
            duration: 1.2,
            ease: "power2.out",
        }, "<+=0.8")
        .fromTo(car, {
            opacity: 0,
            x: 0,
        }, {
            opacity: 1,
            duration: 0.3,
            ease: "power1.inOut",
        }, ">-=0.3");

        /* ── Phase 3: Gallery reveal ──────────────────────── */
        tl.to(
            galleryLayer,
            { opacity: 1, duration: 0.3, ease: "power1.inOut" },
            ">",
        )
            .add(() => setImagesVisible(true));

        /* ── Phase 4: Horizontal scroll ───────────────────── */
        tl.to(
            track,
            {
                x: () => -(track.scrollWidth - window.innerWidth),
                duration: 2,
                ease: "none",
            },
            ">",
        ).to(
            car,
            { x: () => window.innerWidth * 0.8, duration: 2, ease: "none" },
            "<",
        );

        /* ── Cleanup ──────────────────────────────────────── */
        return () => {
            tl.kill();
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, []);

    /* ── className helpers ─────────────────────────────────── */
    const getItemClassName = (item: GalleryItem) => {
        const classes = [styles.item, styles[item.size]];
        if (item.orientation === "horizontal") classes.push(styles.horizontal);
        return classes.join(" ");
    };

    const getImageClassName = () => {
        const classes = [styles.image];
        if (imagesVisible) classes.push(styles.active);
        return classes.join(" ");
    };

    const setItemRef: (index: number) => RefCallback<HTMLDivElement> =
        (index) => (el) => {
            itemRefs.current[index] = el;
        };

    /* ── Render ────────────────────────────────────────────── */
    return (
        <div ref={wrapperRef} className={styles.wrapper}>
            {/* Top gradient — blends with the section above */}
            <div className={styles.topGradient} />

            {/* About content: BackgroundAbout.svg hero + About2.svg foreground + title */}
            <div className={styles.content}>
                <section ref={heroRef} className={styles.hero}>
                    <div className={styles.aboutForeground}>
                        <Image
                            src="/background/About2.webp"
                            alt="About Detail"
                            draggable={false}
                            fill
                            unoptimized
                            style={{
                                objectFit: "cover",
                                objectPosition: "center top",
                            }}
                        />
                    </div>
                    <div
                        className={`${styles.aboutTitle} flex flex-col-reverse md:flex-row items-start gap-4 md:gap-8 lg:gap-12 px-4 md:px-6 lg:px-12`}
                    >
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl leading-relaxed text-white/95 m-0 p-4 md:p-6 lg:p-8 bg-black/50 border-l-4 border-orange-500 rounded backdrop-blur-md flex-shrink md:flex-shrink-0">
                            {aboutContent.description}
                        </p>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-left flex-shrink-0 md:ml-auto lg:ml-96">
                            {aboutContent.title}
                        </h2>
                    </div>
                </section>
            </div>

            {/* About.svg — front layer that zooms away to reveal the scene */}
            <div ref={imageContainerRef} className={styles.imageContainer}>
                <div className={styles.img}>
                    <Image
                        src="/background/About.svg"
                        alt="About"
                        draggable={false}
                        fill
                        unoptimized
                        style={{
                            objectFit: "cover",
                            objectPosition: "center center",
                        }}
                    />
                </div>
            </div>

            {/* Gallery layer — fades in over the shared mountain background */}
            <div
                ref={galleryLayerRef}
                className={`${styles.galleryLayer} ${imagesVisible ? styles.galleryLayerVisible : ""}`}
            >
                {/* Cyberpunk road grid */}
                <div ref={roadRef} className={styles.road}>
                    <div ref={roadGridRef} className={styles.roadGrid} />
                    <div className={styles.roadDim} />
                    <div className={styles.roadHorizon} />
                    <div className={styles.roadHorizonGlow} />
                </div>

                {/* Nissan car */}
                <div ref={carRef} className={styles.car}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/nissan.gif"
                        alt="Nissan driving through the gallery"
                        draggable={false}
                        className={styles.carImage}
                    />
                </div>

                {/* Horizontal gallery track */}
                <div ref={trackRef} className={styles.scrollSection}>
                    {galleryItems.map((item, index) => (
                        <div
                            key={item.id}
                            ref={setItemRef(index)}
                            className={getItemClassName(item)}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                className={getImageClassName()}
                                src={item.src}
                                alt={item.alt}
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

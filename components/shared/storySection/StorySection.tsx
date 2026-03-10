"use client";

import { useEffect, useRef, useState, type RefCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { galleryItems, type GalleryItem } from "@/data/gallery";
import { aboutContent } from "@/data/about";
import { EvervaultCard, Icon } from "@/components/ui/evervault-card";
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
    const scheduleTitleRef = useRef<HTMLDivElement>(null);

    const [imagesVisible, setImagesVisible] = useState(false);
    const imagesVisibleRef = useRef(false);
    const [carOverCardIndex, setCarOverCardIndex] = useState(-1);
    const carOverCardIndexRef = useRef(-1);

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
                    const totalEnd =
                        typeof self.end === "number" ? self.end : 0;
                    const totalStart =
                        typeof self.start === "number" ? self.start : 0;
                    const scrollRange = totalEnd - totalStart;

                    // About phases take ~3 viewport heights + 1 for descent
                    const aboutScrollPx = window.innerHeight * 4;
                    const galleryScrollRange = scrollRange - aboutScrollPx;

                    if (scrollRange > 0 && galleryScrollRange > 0) {
                        const scrolled = self.progress * scrollRange;
                        const gp = Math.min(
                            1,
                            Math.max(0, (scrolled - aboutScrollPx) / galleryScrollRange),
                        );
                        const shouldShow = gp > 0;
                        if (shouldShow !== imagesVisibleRef.current) {
                            imagesVisibleRef.current = shouldShow;
                            setImagesVisible(shouldShow);
                        }
                    }

                    /* ── Phase-4 per-frame work: parallax, road grid, car bounce ── */
                    if (!galleryLayer || galleryLayer.style.opacity === "0")
                        return;

                    if (scrollRange <= 0) return;
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

                    // Detect which card (if any) the car is horizontally under
                    if (car) {
                        const carRect = car.getBoundingClientRect();
                        const carCenterX = carRect.left + carRect.width / 2;
                        let newIndex = -1;
                        itemRefs.current.forEach((el, i) => {
                            if (!el || galleryItems[i]?.type !== "card") return;
                            const itemRect = el.getBoundingClientRect();
                            if (carCenterX >= itemRect.left && carCenterX <= itemRect.right) {
                                newIndex = i;
                            }
                        });
                        if (newIndex !== carOverCardIndexRef.current) {
                            carOverCardIndexRef.current = newIndex;
                            setCarOverCardIndex(newIndex);
                        }
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
        ).fromTo(
            scheduleTitleRef.current,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
            "<",
        );

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
        if (item.type === "card") classes.push(styles.cardWrapper);
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
                        className={`${styles.aboutTitle} flex flex-col-reverse md:flex-row items-start gap-6 md:gap-10 lg:gap-16 px-4 md:px-6 lg:px-12`}
                    >
                        {/* Description as EvervaultCard */}
                        <div className="relative flex-shrink-0 w-full max-w-xs sm:max-w-sm md:max-w-md h-52 sm:h-56 md:h-64">
                            <div className="border border-white/[0.15] flex items-stretch p-0 relative h-full w-full bg-black/60 backdrop-blur-sm rounded-lg">
                                <Icon className="absolute h-5 w-5 -top-2.5 -left-2.5 text-orange-500 z-20" />
                                <Icon className="absolute h-5 w-5 -bottom-2.5 -left-2.5 text-orange-500 z-20" />
                                <Icon className="absolute h-5 w-5 -top-2.5 -right-2.5 text-orange-500 z-20" />
                                <Icon className="absolute h-5 w-5 -bottom-2.5 -right-2.5 text-orange-500 z-20" />
                                <EvervaultCard
                                    body={aboutContent.description}
                                    charColor="#f97316"
                                />
                            </div>
                        </div>

                        {/* Title styled like Schedule */}
                        <div className={`${styles.aboutTitleHeading} flex-shrink-0 md:ml-auto lg:ml-96`}>
                            <span className={styles.aboutTitleLabel}>// sobre nosotros</span>
                            <span className={styles.aboutTitleText}>{aboutContent.title}</span>
                        </div>
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

                {/* Schedule corner label */}
                <div ref={scheduleTitleRef} className={styles.scheduleTitle}>
                    <span className={styles.scheduleTitleLabel}>// agenda</span>
                    <span className={styles.scheduleTitleText}>Schedule</span>
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
                            {item.type === "card" ? (
                                <div className={`${getImageClassName()} ${styles.cardItem}`}>
                                    <div
                                        className="border flex items-stretch p-0 relative h-full w-full bg-black/60 backdrop-blur-sm rounded-lg transition-all duration-300"
                                        style={carOverCardIndex === index ? {
                                            borderColor: item.charColor ?? "rgba(255,255,255,0.2)",
                                            boxShadow: `0 0 16px ${item.charColor ?? "#fff"}55, 0 0 32px ${item.charColor ?? "#fff"}22`,
                                        } : { borderColor: "rgba(255,255,255,0.2)" }}
                                    >
                                        <Icon className="absolute h-6 w-6 -top-3 -left-3 text-white z-20" />
                                        <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-white z-20" />
                                        <Icon className="absolute h-6 w-6 -top-3 -right-3 text-white z-20" />
                                        <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-white z-20" />
                                        <EvervaultCard text={item.text} time={item.time} description={item.description} charColor={item.charColor} textColor={item.textColor} forceHover={carOverCardIndex === index} />
                                    </div>
                                </div>
                            ) : (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    className={getImageClassName()}
                                    src={item.src}
                                    alt={item.alt}
                                    draggable={false}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

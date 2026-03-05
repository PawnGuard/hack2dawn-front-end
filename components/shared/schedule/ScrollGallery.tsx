"use client";

import {
    useRef,
    useState,
    useEffect,
    useCallback,
    type RefCallback,
} from "react";
import { galleryItems, type GalleryItem } from "@/data/gallery";
import styles from "./ScrollGallery.module.css";

/**
 * Horizontal Scroll Gallery – Scroll Hijacking / Storytelling
 *
 * Usa el patrón **sticky + spacer**:
 *  1. Un wrapper alto (spacerHeight) crea espacio vertical de scroll.
 *  2. Un contenedor sticky (100 vh) se queda fijo mientras el spacer pasa.
 *  3. El progreso vertical (0→1) se mapea a translateX horizontal.
 *  4. Parallax por item según scrollSpeed.
 *
 * Al terminar la sección, el sticky se despega y el scroll vertical
 * continúa normalmente → transición suave al resto de la página.
 */
export default function ScrollGallery() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const carRef = useRef<HTMLDivElement>(null);
    const roadGridRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    const [spacerHeight, setSpacerHeight] = useState("300vh");
    const [imagesVisible, setImagesVisible] = useState(false);

    /* ── Calcular spacerHeight = ancho del track − viewport ── */
    useEffect(() => {
        const recalc = () => {
            const track = trackRef.current;
            if (!track) return;
            const overflow = track.scrollWidth - window.innerWidth;
            // Altura del spacer = 100vh (lo que se ve) + el overflow horizontal
            // convertido a px para que el sticky recorra toda la pista
            setSpacerHeight(`${window.innerHeight + Math.max(0, overflow)}px`);
        };

        recalc();
        window.addEventListener("resize", recalc);
        return () => window.removeEventListener("resize", recalc);
    }, []);

    /* ── Scroll-driven horizontal translation + parallax + car ── */
    useEffect(() => {
        const wrapper = wrapperRef.current;
        const track = trackRef.current;
        const car = carRef.current;
        const roadGrid = roadGridRef.current;
        if (!wrapper || !track) return;

        const PARALLAX_FACTOR = 0.12;
        // Rebote en Y del carro (simulación de carretera)
        const BOUNCE_AMP = 3;      // px de amplitud
        const BOUNCE_FREQ = 0.015; // frecuencia del rebote (más alto = más rápido)
        let rafId: number;

        const onScroll = () => {
            rafId = requestAnimationFrame(() => {
                const rect = wrapper.getBoundingClientRect();
                const totalTravel = wrapper.clientHeight - window.innerHeight;

                // progress: 0 cuando el wrapper llega al top,
                //           1 cuando el wrapper ha terminado de pasar
                const progress = Math.min(
                    1,
                    Math.max(0, -rect.top / totalTravel),
                );

                const maxTranslate = track.scrollWidth - window.innerWidth;
                const translateX = progress * maxTranslate;

                // Trasladar pista horizontal
                track.style.transform = `translateX(${-translateX}px)`;

                // Parallax por item
                itemRefs.current.forEach((el, i) => {
                    if (!el) return;
                    const speed = galleryItems[i]?.scrollSpeed ?? 1;
                    const parallax =
                        translateX * (speed - 1) * PARALLAX_FACTOR;
                    el.style.transform = `translateX(${-parallax}px)`;
                });

                // ── Mover el carro con el scroll ──────────────
                if (car) {
                    // El carro viaja de 5% a 85% del viewport en X
                    const carX = 5 + progress * 80; // vw
                    // Rebote vertical suave (sin wave)
                    const bounceY = Math.sin(translateX * BOUNCE_FREQ) * BOUNCE_AMP;
                    car.style.transform = `translateX(${carX}vw) translateY(${bounceY}px)`;
                    // Fade in al inicio, fade out al final
                    const opacity = progress < 0.02
                        ? progress / 0.02
                        : progress > 0.95
                            ? (1 - progress) / 0.05
                            : 1;
                    car.style.opacity = `${opacity}`;
                }

                // ── Mover el grid del suelo con el scroll ─────
                if (roadGrid) {
                    roadGrid.style.backgroundPosition = `${-translateX * 0.5}px 0`;
                }
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll(); // posición inicial

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    /* ── Mostrar imágenes cuando la sección entra al viewport ── */
    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !imagesVisible) {
                    // Pequeño delay para el reveal dramático
                    setTimeout(() => setImagesVisible(true), 400);
                }
            },
            { threshold: 0.05 },
        );

        observer.observe(wrapper);
        return () => observer.disconnect();
    }, [imagesVisible]);

    /* ── Helpers de className ──────────────────────────────── */
    const getItemClassName = (item: GalleryItem) => {
        const classes = [styles.item, styles[item.size]];
        if (item.orientation === "horizontal") classes.push(styles.horizontal);
        return classes.join(" ");
    };

    const getImageClassName = (item: GalleryItem) => {
        const classes = [styles.image];
        if (imagesVisible) {
            classes.push(styles.active);
        }
        return classes.join(" ");
    };

    const setItemRef: (index: number) => RefCallback<HTMLDivElement> =
        (index) => (el) => {
            itemRefs.current[index] = el;
        };

    /* ── Render ────────────────────────────────────────────── */
    return (
        <div
            ref={wrapperRef}
            className={styles.scrollWrapper}
            style={{ height: spacerHeight }}
        >
            <div ref={stickyRef} className={styles.stickyContainer}>
                {/* ── Cyberpunk road grid (suelo 3D) ── */}
                <div className={styles.road}>
                    <div ref={roadGridRef} className={styles.roadGrid} />
                    <div className={styles.roadDim} />
                    <div className={styles.roadHorizon} />
                    <div className={styles.roadHorizonGlow} />
                </div>

                {/* ── Nissan car que acompaña el scroll ── */}
                <div ref={carRef} className={styles.car}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/nissan.gif"
                        alt="Nissan driving through the gallery"
                        draggable={false}
                        className={styles.carImage}
                    />
                </div>

                <div ref={trackRef} className={styles.scrollSection}>
                    {galleryItems.map((item, index) => (
                        <div
                            key={item.id}
                            ref={setItemRef(index)}
                            className={getItemClassName(item)}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                className={getImageClassName(item)}
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

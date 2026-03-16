'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import QABackground from './QABackground';
import { qaData } from '@/data/qa';
import styles from './QACards.module.css';
import { EncryptedText } from '@/components/ui/encrypted-text';

export default function QASection() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [closingCard, setClosingCard] = useState<number | null>(null);

  // Helper: font size dinámico según longitud del texto
  const getDynamicFontSize = (text: string, base: number = 2): string => {
    const len = text?.length ?? 0;
    if (len > 160) return `${base * 0.62}em`;
    if (len > 120) return `${base * 0.72}em`;
    if (len > 80)  return `${base * 0.84}em`;
    if (len > 50)  return `${base * 0.94}em`;
    return `${base}em`;
  };

  useEffect(() => {
    const scrollGrid = () => {
      if (!cardsRef.current || !mainRef.current || !sectionRef.current) return;

      const sectionRect = sectionRef.current.getBoundingClientRect();
      const mainHeight = mainRef.current.offsetHeight;
      const sectionHeight = sectionRef.current.offsetHeight;

      // Calcular progreso del scroll dentro de la sección
      const scrollStart = Math.max(0, -sectionRect.top);
      const scrollEnd = Math.max(0, mainHeight - sectionHeight);
      const scrollProgress = scrollEnd > 0 ? scrollStart / scrollEnd : 0;

      const transY = scrollProgress * 100;
      cardsRef.current.style.setProperty('--scroll', `${transY}%`);
    };

    window.addEventListener('scroll', scrollGrid, { passive: true });
    window.addEventListener('resize', scrollGrid);
    scrollGrid();

    return () => {
      window.removeEventListener('scroll', scrollGrid);
      window.removeEventListener('resize', scrollGrid);
    };
  }, []);

  const handleCloseCard = () => {
    if (expandedCard !== null) {
      setClosingCard(expandedCard);
      setExpandedCard(null);
      setTimeout(() => {
        setClosingCard(null);
      }, 400); // Duración de la animación popOut
    }
  };

  return (
    <section ref={sectionRef} className={styles.qaContainer}>
      <QABackground />

      {/* Gradiente superior - Transición desde la sección anterior */}
      <div className="absolute top-0 left-0 right-0 h-[150px] qa-gradient-top z-[100] pointer-events-none" />

      {/* Gradiente inferior - Transición hacia la sección siguiente */}
      <div className="absolute bottom-0 left-0 right-0 h-[180px] sm:h-[400px] qa-gradient-bottom z-[100] pointer-events-none" />

      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerLabel}>
          <EncryptedText
            text="// preguntas frecuentes"
            encryptedClassName={styles.headerLabelEncrypted}
            revealedClassName=""
            revealDelayMs={40}
            flipDelayMs={35}
          />
        </span>
        <h2>
          <EncryptedText
            text="Q&A Support"
            encryptedClassName={styles.headerTitleEncrypted}
            revealedClassName=""
            revealDelayMs={80}
            flipDelayMs={50}
          />
        </h2>
      </div>

      {/* 3D Cards Grid */}
      <main
        ref={mainRef}
        className={styles.main}
      >
        <div
          ref={cardsRef}
          className={styles.cards}
        >
          {qaData.map((item) => {
            const isExpanded = expandedCard === item.id;
            const isClosing = closingCard === item.id;
            const isDecorative = !item.question;
            return (
              <div
                key={item.id}
                className={`${styles.stack} ${isDecorative ? styles.decorative : ''}`}
                onClick={() => {
                  if (item.answer && !isExpanded && !isClosing) {
                    setExpandedCard(item.id);
                  }
                }}
                onMouseLeave={() => {
                  if (isExpanded) {
                    handleCloseCard();
                  }
                }}
                style={{ cursor: item.answer ? 'pointer' : 'default' }}
              >
                {/* 4ta capa - Solo respuesta (aparece al hacer click) */}
                {(isExpanded || isClosing) && item.answer && (
                  <div
                    className={`${styles.card} ${styles.answer} ${isClosing ? styles.answerClosing : ''}`}
                    style={{ background: item.color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseCard();
                    }}
                  >
                    <div className={styles.answerContent}>
                      <p style={{ fontSize: getDynamicFontSize(item.answer) }}>
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )}

                {/* Top card - Solo pregunta o imagen */}
                <div
                  className={`${styles.card} ${styles.top}`}
                  style={{ background: item.color }}
                >
                  {item.image ? (
                    <div className={styles.imageContainer}>
                      <Image
                        src={item.image}
                        alt="Beach decoration"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div className={styles.contents}>
                      {item.question && (
                        <div
                          className={styles.questionOnly}
                          style={{ fontSize: getDynamicFontSize(item.question) }}
                        >
                          <span className={styles.questionText}>{item.question}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Mid card - Solo pregunta o imagen */}
                <div
                  className={`${styles.card} ${styles.mid}`}
                  style={{ background: item.color }}
                >
                  {item.image ? (
                    <div className={styles.imageContainer}>
                      <Image
                        src={item.image}
                        alt="Beach decoration"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div className={styles.contents}>
                      {item.question && (
                        <div className={styles.questionOnly}>
                          {item.question}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom card - Solo pregunta o imagen */}
                <div
                  className={`${styles.card} ${styles.bottom}`}
                  style={{ background: item.color }}
                >
                  {item.image ? (
                    <div className={styles.imageContainer}>
                      <Image
                        src={item.image}
                        alt="Beach decoration"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div className={styles.contents}>
                      {item.question && (
                        <div className={styles.questionOnly}>
                          {item.question}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Shadow */}
                <div className={`${styles.card} ${styles.shadow}`} />
              </div>
            );
          })}
        </div>
      </main>
    </section>
  );
}

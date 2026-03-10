'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import QABackground from './QABackground';
import { qaData } from '@/data/qa';
import styles from './QACards.module.css';

export default function QASection() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [closingCard, setClosingCard] = useState<number | null>(null);

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
      <div className="absolute bottom-0 left-0 right-0 h-[400px] qa-gradient-bottom z-[100] pointer-events-none" />
      
      {/* Header */}
      <div className={styles.header}>
        <h2>QA & Support</h2>
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
            return (
            <div 
              key={item.id} 
              className={styles.stack}
              onClick={() => {
                // Si tiene respuesta y no está expandida, expandir
                if (item.answer && !isExpanded && !isClosing) {
                  setExpandedCard(item.id);
                }
              }}
              onMouseLeave={() => {
                // Cerrar la 4ta capa cuando el mouse sale del stack
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
                    <p>{item.answer}</p>
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
                      <div className={styles.questionOnly}>
                        {item.question}
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
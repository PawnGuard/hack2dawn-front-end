'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type ConfirmVariant = 'danger' | 'warning'

export interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  onConfirm: () => void
}

interface Props extends ConfirmOptions {
  open: boolean
  onCancel: () => void
  loading?: boolean
}

const ACCENT: Record<ConfirmVariant, string> = {
  danger:  '#FF003C',
  warning: '#EF01BA',
}

export default function ConfirmDialog({
  open, onCancel, onConfirm, loading,
  title, message,
  confirmLabel = 'CONFIRMAR',
  cancelLabel  = 'CANCELAR',
  variant = 'danger',
}: Props) {
  const accent = ACCENT[variant]

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onCancel}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(10,0,6,0.75)',
            backdropFilter: 'blur(6px)',
            // Scanlines CRT
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.10) 2px, rgba(0,0,0,0.10) 4px)',
          }}
        >
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            style={{
              position: 'relative',
              width: '100%', maxWidth: '400px',
              margin: '1rem',
              backgroundColor: 'rgba(10,0,6,0.95)',
              border: `1px solid ${accent}40`,
              padding: '2rem',
            }}
          >
            {/* Esquinas HUD */}
            <HudCorner pos="top-right"    accent={accent} />
            <HudCorner pos="bottom-left"  accent={accent} />

            {/* Línea superior de acento */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
              background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`,
            }} />

            {/* Badge de alerta */}
            <p style={{
              fontFamily: 'monospace', fontSize: '9px',
              letterSpacing: '0.15em', color: `${accent}`,
              textTransform: 'uppercase', marginBottom: '0.75rem',
              opacity: 0.7,
            }}>
              ⚠ ACCIÓN REQUERIDA
            </p>

            {/* Título */}
            <h2
              id="confirm-title"
              style={{
                fontFamily: 'monospace', fontWeight: 700,
                fontSize: '1rem', letterSpacing: '0.08em',
                color: '#fff', marginBottom: '0.75rem',
                textTransform: 'uppercase',
                textShadow: `0 0 12px ${accent}60`,
              }}
            >
              {title}
            </h2>

            {/* Mensaje */}
            <p
              id="confirm-message"
              style={{
                fontSize: '0.875rem', lineHeight: 1.6,
                color: 'rgba(255,255,255,0.65)',
                marginBottom: '2rem',
              }}
            >
              {message}
            </p>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={onCancel}
                disabled={loading}
                style={{
                  padding: '0.5rem 1.25rem',
                  fontFamily: 'monospace', fontSize: '0.75rem',
                  letterSpacing: '0.1em', fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.55)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'color 180ms, border-color 180ms',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#fff'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                }}
              >
                {cancelLabel}
              </button>

              <button
                onClick={onConfirm}
                disabled={loading}
                style={{
                  padding: '0.5rem 1.25rem',
                  fontFamily: 'monospace', fontSize: '0.75rem',
                  letterSpacing: '0.1em', fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#fff',
                  border: `1px solid ${accent}`,
                  background: `${accent}18`,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'background 180ms, box-shadow 180ms',
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.background = `${accent}30`
                    e.currentTarget.style.boxShadow = `0 0 12px ${accent}40`
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = `${accent}18`
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {loading ? 'PROCESANDO...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function HudCorner({ pos, accent }: { pos: string, accent: string }) {
  const isTop    = pos.includes('top')
  const isRight  = pos.includes('right')
  return (
    <div style={{
      position: 'absolute',
      top:    isTop   ? 0 : 'auto',
      bottom: !isTop  ? 0 : 'auto',
      left:   !isRight ? 0 : 'auto',
      right:  isRight  ? 0 : 'auto',
      width: 10, height: 10,
      borderTop:    isTop   ? `2px solid ${accent}` : 'none',
      borderBottom: !isTop  ? `2px solid ${accent}` : 'none',
      borderLeft:   !isRight ? `2px solid ${accent}` : 'none',
      borderRight:  isRight  ? `2px solid ${accent}` : 'none',
    }} />
  )
}
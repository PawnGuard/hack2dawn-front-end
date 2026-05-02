'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  ShieldAlert,
  TerminalSquare,
  Unlock,
  Wifi,
} from 'lucide-react'
import { Boxes } from '@/components/ui/background-boxes'
import type { ChallengeSummary, ChallengesResponse } from '@/types/challenges'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type SubmitStatus = 'idle' | 'loading' | 'correct' | 'incorrect' | 'already_solved' | 'error'

interface FlagState {
  input: string
  status: SubmitStatus
  message: string
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function prettyDate(value: string | null): string {
  if (!value) return '--'
  return new Date(value).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
}

function getMachineName(steps: ChallengeSummary[]): string {
  const step1 = steps.find(s => s.step === 1) ?? steps[0]
  if (!step1) return 'Lab'
  const name = step1.name
  return name.includes('-') ? name.split('-')[0].trim() : (step1.machineId?.toUpperCase() ?? name)
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function ChallengeDetailPage() {
  const params = useParams() as { slug: string }
  const { slug } = params

  // ── Raw challenge data ──
  const [allChallenges, setAllChallenges] = useState<ChallengeSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Per-flag submit state  key = ctfd challenge id ──
  const [flagStates, setFlagStates] = useState<Record<number, FlagState>>({})
  const [activeHintStep, setActiveHintStep] = useState<ChallengeSummary | null>(null)

  // Avoid duplicate in-flight submits
  const submittingRef = useRef<Set<number>>(new Set())

  // Descipcion del flag
  const [enrichedSteps, setEnrichedSteps] = useState<Record<number, { description: string; lore: string }>>({})

  // ── Load master challenge list ──
  useEffect(() => {
    let mounted = true
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/challenges', { cache: 'no-store' })
        if (!res.ok) throw new Error('No se pudo cargar la lista de retos')
        const payload = (await res.json()) as ChallengesResponse
        if (!mounted) return
        setAllChallenges(payload.challenges)
        setError(null)
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    void load()
    return () => { mounted = false }
  }, [slug])

  // ── Derive current challenge + machine steps ──
  const currentChallenge = useMemo(
    () => allChallenges.find(ch => ch.slug === slug) ?? null,
    [allChallenges, slug]
  )

  const machineSteps = useMemo(() => {
    if (!currentChallenge) return []
    if (!currentChallenge.machineId) return [currentChallenge]

    return allChallenges
      .filter(
        ch =>
          ch.machineId === currentChallenge.machineId &&
          ch.continent === currentChallenge.continent,
      )
      .sort((a, b) => (a.step ?? 0) - (b.step ?? 0))
  }, [allChallenges, currentChallenge])

  const step1 = machineSteps[0] ?? null
  const isMachine = (currentChallenge?.machineId ?? null) !== null

  useEffect(() => {
    if (!machineSteps.length) return
    let mounted = true

    const enrich = async () => {
      const results = await Promise.all(
        machineSteps.map(step =>
          fetch(`/api/challenges/${step.id}`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      )

      if (!mounted) return

      const map: Record<number, { description: string; lore: string }> = {}
    results.forEach((data, i) => {
    const step = machineSteps[i]
    if (data?.challenge) {
        let rawDescription = data.challenge.description ?? ''
        let lore = ''
        let description = rawDescription

        // Si es el Step 1 y encontramos el separador "---"
        if (step.step === 1 && rawDescription.includes('---')) {
        const parts = rawDescription.split('---')
        lore = parts[0].trim() // Lo de arriba es el Lore
        description = parts.slice(1).join('---').trim() // Lo de abajo es la misión de la Flag 1
        }

        map[step.id] = {
        description: description,
        lore: lore || (step.step === 1 ? 'Briefing no disponible.' : ''), // Solo la flag 1 debe tener lore por defecto
        }
    }
    })
    setEnrichedSteps(map)
    }

    void enrich()
    return () => { mounted = false }
  }, [machineSteps])

  // ── Derived stats ──
  const totalFlags = machineSteps.length
  const capturedFlags = useMemo(
    () =>
      machineSteps.filter(
        s => s.status === 'COMPLETED' || s.solvedByTeam,
      ).length,
    [machineSteps]
  )
  const totalPoints = useMemo(
    () => machineSteps.reduce((acc, s) => acc + s.points, 0),
    [machineSteps]
  )
  const completionPercent =
    totalFlags > 0 ? Math.round((capturedFlags / totalFlags) * 100) : 0

  // ── Init flagStates once steps are resolved ──
  useEffect(() => {
    if (!machineSteps.length) return
    setFlagStates(prev => {
      const next = { ...prev }
      for (const step of machineSteps) {
        if (!next[step.id]) {
          next[step.id] = { input: '', status: 'idle', message: '' }
        }
      }
      return next
    })
  }, [machineSteps])

  // ── Submit a flag to CTFd ──
  const submitFlag = useCallback(
    async (stepId: number) => {
      if (submittingRef.current.has(stepId)) return
      const input = flagStates[stepId]?.input.trim() ?? ''
      if (!input) {
        setFlagStates(prev => ({
          ...prev,
          [stepId]: { ...prev[stepId], status: 'error', message: 'Debes ingresar una flag.' },
        }))
        return
      }

      submittingRef.current.add(stepId)
      setFlagStates(prev => ({
        ...prev,
        [stepId]: { ...prev[stepId], status: 'loading', message: '' },
      }))

      try {
        const res = await fetch(`/api/challenges/${stepId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submission: input }),
        })

        const data = (await res.json()) as {
          success?: boolean
          data?: { status: string; message: string }
          error?: string
        }

        if (!res.ok || !data.success) {
          setFlagStates(prev => ({
            ...prev,
            [stepId]: {
              ...prev[stepId],
              status: 'error',
              message: data.error ?? 'Error al contactar CTFd.',
            },
          }))
          return
        }

        const ctfdStatus = data.data?.status ?? 'incorrect'
        const ctfdMessage = data.data?.message ?? ''

        setFlagStates(prev => ({
          ...prev,
          [stepId]: {
            input: ctfdStatus === 'correct' ? '' : prev[stepId].input,
            status: ctfdStatus as SubmitStatus,
            message: ctfdMessage,
          },
        }))

        // Refresh challenge list so status COMPLETED propagates
        if (ctfdStatus === 'correct') {
          const refreshed = await fetch('/api/challenges', { cache: 'no-store' })
          if (refreshed.ok) {
            const payload = (await refreshed.json()) as ChallengesResponse
            setAllChallenges(payload.challenges)
          }
        }
      } catch {
        setFlagStates(prev => ({
          ...prev,
          [stepId]: { ...prev[stepId], status: 'error', message: 'Error de red.' },
        }))
      } finally {
        submittingRef.current.delete(stepId)
      }
    },
    [flagStates]
  )

  const handleInputChange = useCallback((stepId: number, value: string) => {
    setFlagStates(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId], input: value, status: 'idle', message: '' },
    }))
  }, [])

  // ── Step unlock logic:
  //    Flag N is unlocked if flag N-1 is COMPLETED (or it is the first flag) ──
  const isStepUnlocked = useCallback(
    (index: number) => {
      if (index === 0) return true
      const prev = machineSteps[index - 1]
      return prev?.status === 'COMPLETED' || prev?.solvedByTeam === true
    },
    [machineSteps]
  )

  // ─────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────
  function statusBadge(step: ChallengeSummary) {
    if (step.status === 'COMPLETED' || step.solvedByTeam)
      return (
        <span className="inline-flex items-center gap-1 border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 px-2 py-1 text-[11px] font-mono">
          <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETADA
        </span>
      )
    return null
  }

  function submitFeedback(stepId: number) {
    const s = flagStates[stepId]
    if (!s || s.status === 'idle' || s.status === 'loading') return null
    const colors: Record<string, string> = {
      correct:       'text-emerald-300',
      incorrect:     'text-red-400',
      already_solved:'text-yellow-300',
      error:         'text-red-400',
    }
    return (
      <p className={`mt-1 font-mono text-xs ${colors[s.status] ?? 'text-white/60'}`}>
        {s.message || (s.status === 'incorrect' ? 'Flag incorrecta. Intenta de nuevo.' : s.status)}
      </p>
    )
  }

  // ─────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────
  const machineName = isMachine ? getMachineName(machineSteps) : (currentChallenge?.name ?? '')

  return (
    <main className="relative min-h-screen bg-[#090013] text-white overflow-hidden">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <Boxes />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(239,1,186,0.18),transparent_45%),linear-gradient(180deg,rgba(9,0,19,0.85),rgba(9,0,19,1))]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Back */}
        <Link
          href="/challenges"
          className="inline-flex items-center gap-2 font-mono text-xs text-[#00F0FF] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al mapa de challenges
        </Link>

        {/* ── Loading ── */}
        {isLoading && (
          <section className="mt-6 border border-white/15 bg-black/55 p-8 flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-[#EF01BA] border-t-transparent rounded-full animate-spin" />
          </section>
        )}

        {/* ── Error ── */}
        {!isLoading && error && (
          <section className="mt-6 border border-[#ff5f5f]/30 bg-[#ff5f5f]/10 p-6">
            <p className="font-mono text-sm text-[#ff9a9a]">{error}</p>
          </section>
        )}

        {/* ── Main content ── */}
        {!isLoading && !error && currentChallenge && (
          <>
            {/* Header */}
            <section className="mt-6 border border-white/15 bg-black/60 p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#00F0FF] inline-flex items-center gap-1.5">
                    <TerminalSquare className="w-3.5 h-3.5" /> expediente de misión
                  </p>
                  <h1 className="font-heading text-3xl sm:text-4xl text-[#EF01BA] font-bold mt-1">
                    {machineName}
                  </h1>
                  <p className="font-mono text-sm text-white/55 mt-1">{currentChallenge.category}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-mono text-xs text-[#FEF759] border border-[#FEF759]/40 bg-[#FEF759]/10 px-3 py-1">
                    {totalPoints} PTS
                  </span>
                  <span className="font-mono text-xs text-white/60 border border-white/15 bg-white/5 px-3 py-1">
                    {currentChallenge.difficulty}
                  </span>
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="border border-white/10 bg-black/40 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Categoría</p>
                  <p className="text-white/85 text-sm">{currentChallenge.category}</p>
                </div>
                <div className="border border-white/10 bg-black/40 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Dificultad</p>
                  <p className="text-white/85 text-sm">{currentChallenge.difficulty}</p>
                </div>
                <div className="border border-white/10 bg-black/40 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Flags</p>
                  <p className="text-white/85 text-sm">{capturedFlags} / {totalFlags} capturadas</p>
                </div>
              </div>

              {/* Connection info */}
              {step1?.connectionInfo && (
                <div className="mt-4 border border-[#00F0FF]/20 bg-[#00F0FF]/5 p-3 flex items-start gap-2">
                  <Wifi className="w-4 h-4 text-[#00F0FF] mt-0.5 shrink-0" />
                  <p className="font-mono text-xs text-white/80 break-all">{step1.connectionInfo}</p>
                </div>
              )}

              {/* Lore / description from step 1 */}
              <div className="mt-6 border border-white/10 bg-black/35 p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#00F0FF]">Lore del laboratorio</p>
                <p className="text-white/80 text-sm leading-relaxed mt-2">
                    {enrichedSteps[step1?.id ?? 0]?.lore || step1?.lore || currentChallenge.lore}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between font-mono text-xs text-white/60 mb-1">
                  <span>Progreso del laboratorio</span>
                  <span className="text-[#EF01BA]">{completionPercent}%</span>
                </div>
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(totalFlags, 1)}, 1fr)` }}>
                  {machineSteps.map((s, i) => (
                    <div
                      key={s.id}
                      className={`h-2 transition-colors ${
                        s.status === 'COMPLETED' || s.solvedByTeam
                          ? 'bg-[#EF01BA]'
                          : 'bg-white/15'
                      }`}
                      title={`Flag ${i + 1}`}
                    />
                  ))}
                </div>
                <p className="font-mono text-xs text-white/50 mt-1">
                  {capturedFlags} de {totalFlags} flags completadas
                </p>
              </div>
            </section>

            {/* ── Flags list ── */}
            <section className="mt-6 space-y-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">
                Misiones del laboratorio
              </p>

              {machineSteps.map((step, index) => {
                const unlocked = isStepUnlocked(index)
                const completed = step.status === 'COMPLETED' || step.solvedByTeam
                const fs = flagStates[step.id]
                const isSubmitting = fs?.status === 'loading'
                const desc = enrichedSteps[step.id]?.description ?? step.description
                const lore = enrichedSteps[step.id]?.lore ?? step.lore

                // Extract flag title: "Intro - Flag 2 - Foothold" → "Flag 2 - Foothold"
                const parts = step.name.split(' - ')
                const flagTitle = parts.length > 1 ? parts.slice(1).join(' - ') : step.name

                return (
                  <article
                    key={step.id}
                    className={`border p-4 transition-colors ${
                      completed
                        ? 'border-emerald-400/25 bg-emerald-500/5'
                        : unlocked
                        ? 'border-[#00F0FF]/25 bg-black/35'
                        : 'border-white/10 bg-black/20 opacity-60'
                    }`}
                  >
                    {/* Flag header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : unlocked ? (
                          <Unlock className="w-4 h-4 text-[#00F0FF] shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-white/30 shrink-0" />
                        )}
                        <p className="font-mono text-sm text-white/90">
                          FLAG {step.step ?? index + 1}: {flagTitle}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#FEF759]/80">{step.points} pts</span>
                        {statusBadge(step)}
                      </div>
                    </div>

                    {/* Description of this specific flag */}
                    {unlocked && !completed && desc && (
                      <p className="mt-3 text-sm text-white/65 leading-relaxed">{desc}</p>
                    )}

                    {/* Submit form */}
                    {unlocked && !completed && (
                      <div className="mt-3 space-y-2">
                        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                          <input
                            type="text"
                            value={fs?.input ?? ''}
                            onChange={e => handleInputChange(step.id, e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') void submitFlag(step.id) }}
                            placeholder="PWG{...}"
                            disabled={isSubmitting}
                            className="w-full border border-white/25 bg-black/35 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-[#00F0FF] focus:outline-none disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => void submitFlag(step.id)}
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center border border-[#EF01BA]/40 bg-[#EF01BA]/15 hover:bg-[#EF01BA]/25 text-white px-4 py-2 font-mono text-xs transition-colors disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              'Enviar'
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveHintStep(step)}
                            className="inline-flex items-center justify-center border border-[#00F0FF]/40 bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] px-3 py-2 font-mono text-xs transition-colors"
                          >
                            Hint
                          </button>
                        </div>
                        {submitFeedback(step.id)}
                      </div>
                    )}

                    {/* Locked message */}
                    {!unlocked && (
                      <p className="mt-3 text-sm text-white/45">
                        Completa la Flag {index} para desbloquear esta sección.
                      </p>
                    )}
                  </article>
                )
              })}
            </section>

            <div className="mt-7">
              <Link
                href="/challenges"
                className="inline-flex items-center justify-center border border-white/30 hover:bg-white/10 px-4 py-3 font-mono text-sm text-white/80 transition-colors"
              >
                Volver al Path
              </Link>
            </div>
          </>
        )}
      </div>

      {/* ── Hint modal ── */}
      {activeHintStep && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Cerrar modal de hint"
            className="absolute inset-0 bg-black/70"
            onClick={() => setActiveHintStep(null)}
          />
          <div className="relative z-10 w-full max-w-lg border border-[#00F0FF]/35 bg-[#0b0514] p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#00F0FF]">
                Hint · Flag {activeHintStep.step}
              </p>
              <button
                type="button"
                onClick={() => setActiveHintStep(null)}
                className="border border-white/25 px-2 py-1 font-mono text-[11px] text-white/80 hover:bg-white/10 transition-colors"
              >
                Cerrar
              </button>
            </div>
            <p className="mt-3 font-heading text-base text-white">{activeHintStep.name}</p>
            <p className="mt-3 text-sm text-white/90 leading-relaxed">
              {enrichedSteps[activeHintStep.id]?.description ?? activeHintStep.description}
            </p>
            {(enrichedSteps[activeHintStep.id]?.lore ?? activeHintStep.lore) &&
              (enrichedSteps[activeHintStep.id]?.lore ?? activeHintStep.lore) !== 'Briefing no disponible. Revisa la descripción técnica del reto.' && (
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                {enrichedSteps[activeHintStep.id]?.lore ?? activeHintStep.lore}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
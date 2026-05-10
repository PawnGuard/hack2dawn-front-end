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
import { EncryptedText } from "@/components/ui/encrypted-text";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type SubmitStatus = 'idle' | 'loading' | 'correct' | 'incorrect' | 'already_solved' | 'error' | 'ratelimited'

type HintState = {
  /** undefined = aún no consultado, null = ya desbloqueado (tenemos content) */
  isUnlocking: boolean
  content?: string       // se llena al desbloquear
  error?: string
}

interface FlagState {
  input: string
  status: SubmitStatus
  message: string
}

type ActiveHintModal = {
  stepId: number
  stepName: string
  stepNumber: number | null
  hints: Array<{ id: number; cost: number; title?: string; content?: string | null }>
} | null

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

  // Avoid duplicate in-flight submits
  const submittingRef = useRef<Set<number>>(new Set())

  // Record<hintId, HintState>
  const [hintStates, setHintStates] = useState<Record<number, HintState>>({})

  const [activeHintModal, setActiveHintModal] = useState<ActiveHintModal>(null)

  type EnrichedStep = {
    description: string
    lore: string
    files?: string[]
    hints?: Array<{ id: number; cost: number; content?: string | null }>
    maxAttempts?: number
    attempts?: number
  }

  // Descipcion del flag
  const [enrichedSteps, setEnrichedSteps] = useState<Record<number, EnrichedStep>>({})

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
  const completionPercent = totalFlags > 0 ? Math.round((capturedFlags / totalFlags) * 100) : 0

  const labFiles = useMemo<string[]>(() => {
    if (!step1) return []
    const step1Enriched = enrichedSteps[step1.id]
    return step1Enriched?.files ?? []
  }, [step1, enrichedSteps])


  // ── Init flagStates once steps are resolved ──
  useEffect(() => {
    if (!machineSteps.length) return
    let mounted = true

    const enrich = async () => {
        // 1 SOLO FETCH POR FLAG
        const results = await Promise.all(
        machineSteps.map(step =>
            fetch(`/api/challenges/${step.id}`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
        )

        if (!mounted) return

        const map: Record<number, EnrichedStep> = {}
        
        results.forEach((data, i) => {
        const step = machineSteps[i]
        if (data?.challenge) {
            let rawDescription = data.challenge.description ?? ''
            let lore = ''
            let description = rawDescription

            if (step.step === 1 && rawDescription.includes('---')) {
            const parts = rawDescription.split('---')
            lore = parts[0].trim()
            description = parts.slice(1).join('---').trim()
            }

            // AQUÍ ES LA MAGIA: tomamos los hints directamente de data.challenge
            const hints = data.challenge.hints ?? []

            console.log(`[Step ${step.id}] hints extraídos de detail:`, hints)

            map[step.id] = {
            description: description,
            lore: lore || (step.step === 1 ? 'Briefing no disponible.' : ''),
            files: Array.isArray(data?.challenge?.files) ? data.challenge.files : [],
            hints: hints, // Se guardan en EnrichedStep
            maxAttempts: data.challenge.maxAttempts ?? 0,
            attempts: data.challenge.attempts ?? 0,
            }
        }
        })
        setEnrichedSteps(map)
    }

    void enrich()
    return () => { mounted = false }
    }, [machineSteps]) // Dependencia original

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

        // ── 2. NUEVO: Actualizar el contador de intentos al fallar ──
        if (ctfdStatus === 'incorrect') {
        setEnrichedSteps(prev => {
            const current = prev[stepId]
            if (!current) return prev

            let newAttempts = (current.attempts ?? 0) + 1

            // Extraemos el número exacto del mensaje de CTFd usando Regex
            const match = ctfdMessage.match(/You have (\d+) tries remaining/)
            if (match && current.maxAttempts) {
            const remaining = parseInt(match[1], 10)
            newAttempts = current.maxAttempts - remaining // Si max es 5 y quedan 2, intentos = 3
            }

            return {
            ...prev,
            [stepId]: { ...current, attempts: newAttempts }
            }
        })
        }

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
    // La primera flag (índice 0) siempre está desbloqueada
      if (index === 0) return true

      const prevStep = machineSteps[index - 1]
      if (!prevStep) return false

      // Condición 1: Resuelta correctamente
      const isCompleted = prevStep.status === 'COMPLETED' || prevStep.solvedByTeam
      if (isCompleted) return true

      // Condición 2: Intentos agotados en sesión actual (Feedback instantáneo)
      const prevFs = flagStates[prevStep.id]
      const isRateLimitedLocal = prevFs?.status === 'ratelimited' || 
                               (prevFs?.message?.includes('0 tries remaining'))

      if (isRateLimitedLocal) return true

    // Condición 3: Intentos agotados cargados desde el servidor
    // Para que esto funcione, enrichedSteps debe tener attempts y maxAttempts
      const prevEnriched = enrichedSteps[prevStep.id]
      if (prevEnriched) {
        const maxAtt = prevEnriched.maxAttempts ?? 0
        const att = prevEnriched.attempts ?? 0

        if (maxAtt > 0 && att >= maxAtt) {
          return true // Quemaron el reto antes de recargar
        }
      }

      return false
    },
    [machineSteps, flagStates, enrichedSteps]
  )

  const handleUnlockHint = async (hintId: number) => {
    setHintStates(prev => ({
        ...prev,
        [hintId]: { isUnlocking: true, error: undefined },
    }))

    try {
        const res = await fetch(`/api/hints/${hintId}/unlock`, { method: 'POST' })
        const data = await res.json()

        if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Error al desbloquear la pista')
        }

        setHintStates(prev => ({
        ...prev,
        [hintId]: { isUnlocking: false, content: data.content },
        }))
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error desconocido'
        setHintStates(prev => ({
        ...prev,
        [hintId]: { isUnlocking: false, error: msg },
        }))
    }
    }

    const openHintModal = useCallback((step: ChallengeSummary) => {
        const hints = enrichedSteps[step.id]?.hints ?? []

        setActiveHintModal({
            stepId: step.id,
            stepName: step.name,
            stepNumber: step.step ?? null,
            hints,
        })
        }, [enrichedSteps])

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
    const maxAtt = enrichedSteps[stepId]?.maxAttempts ?? 0
    const attMade = enrichedSteps[stepId]?.attempts ?? 0

    if (maxAtt > 0 && attMade >= maxAtt) {
        return (
        <p className="mt-1 font-mono text-xs text-red-400">
            Límite de intentos alcanzado. Reto bloqueado. Ya no obtendras estos puntos
        </p>
        )
    }

    if (!s || s.status === 'idle' || s.status === 'loading') return null
    const colors: Record<string, string> = {
      correct:       'text-emerald-300',
      incorrect:     'text-red-400',
      already_solved:'text-yellow-300',
      error:         'text-red-400',
      ratelimited: 'text-red-400',
    }

    let friendlyMessage = s.message

    // Si CTFd nos dice que fue incorrecta pero no nos especifica intentos
    if (s.status === 'incorrect' && !s.message) {
        friendlyMessage = 'Flag incorrecta. Intenta de nuevo.'
    } 

    // Si CTFd nos responde que le quedan intentos (ej: "Incorrect. You have 2 tries remaining")
    if (s.message.includes('tries remaining')) {
        const match = s.message.match(/You have (\d+) tries remaining/)
        if (match) {
        friendlyMessage = `Flag incorrecta. Te quedan ${match[1]} intentos.`
        }
    }

    // Si CTFd nos responde que ya se quedó en 0 y lo rechaza (rate limit de intentos)
    if (s.message.includes('You have 0 tries remaining')) {
        friendlyMessage = 'Límite de intentos alcanzado. Reto bloqueado. Ya no obtendras estos puntos'
    }

    return (
    <p className={`mt-1 font-mono text-xs ${colors[s.status] ?? 'text-white/60'}`}>
        {friendlyMessage}
    </p>
    )
  }

  interface HintModalProps {
    modal: ActiveHintModal
    hintStates: Record<number, HintState>
    onClose: () => void
    onUnlock: (hintId: number) => void
    }

    function HintModal({ modal, hintStates, onClose, onUnlock }: HintModalProps) {
    if (!modal) return null

    const hasHints = modal.hints.length > 0

    return (
        <div
        className="fixed inset-0 z-30 flex items-center justify-center px-4"
        role="dialog"
        aria-modal="true"
        >
        <button
            type="button"
            aria-label="Cerrar modal de pistas"
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
        />

        <div className="relative z-10 w-full max-w-lg border border-[#00F0FF]/35 bg-[#0b0514] p-5">
            <div className="flex items-start justify-between gap-3">
            <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#00F0FF]">
                Hint · Flag {modal.stepNumber ?? '?'}
                </p>
                <p className="mt-2 font-heading text-base text-white">{modal.stepName}</p>
            </div>

            <button
                type="button"
                onClick={onClose}
                className="border border-white/25 px-2 py-1 font-mono text-[11px] text-white/80 hover:bg-white/10 transition-colors"
            >
                Cerrar
            </button>
            </div>

            {!hasHints && (
            <div className="mt-4 border border-white/10 bg-black/30 p-4">
                <p className="text-sm text-white/70">Esta flag no tiene pistas disponibles.</p>
            </div>
            )}

            {hasHints && (
            <div className="mt-4 space-y-3">
                {modal.hints.map((hint, index) => {
                const hs = hintStates[hint.id]
                const content = hs?.content ?? hint.content
                const isUnlocking = hs?.isUnlocking ?? false
                const error = hs?.error

                return (
                    <div
                    key={hint.id}
                    className="border border-white/10 bg-black/30 p-4"
                    >
                    <div className="flex items-center justify-between gap-3">
                        <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#FEF759]">
                        Pista {index + 1}{hint.title ? ` · ${hint.title}` : ''}
                        </p>
                    </div>

                    {content ? (
                        <div
                        className="prose prose-sm prose-invert mt-3 max-w-none text-white"
                        dangerouslySetInnerHTML={{ __html: content }}
                        />
                    ) : (
                        <>
                        <p className="mt-3 text-sm text-white/75">
                            {hint.cost > 0
                            ? `Cuesta ${hint.cost} puntos para desbloquear esta pista.`
                            : 'Esta pista es gratuita.'}
                        </p>

                        <div className="mt-3">
                            <button
                            type="button"
                            onClick={() => onUnlock(hint.id)}
                            disabled={isUnlocking}
                            className="inline-flex items-center justify-center border border-[#00F0FF]/40 bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] px-3 py-2 font-mono text-xs transition-colors disabled:opacity-50"
                            >
                            {isUnlocking ? 'Desbloqueando...' : 'Desbloquear pista'}
                            </button>
                        </div>
                        </>
                    )}

                    {error && (
                        <p className="mt-3 font-mono text-xs text-red-300">{error}</p>
                    )}
                    </div>
                )
                })}
            </div>
            )}
        </div>
        </div>
    )
    }

  // ─────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────
  const machineName = isMachine ? getMachineName(machineSteps) : (currentChallenge?.name ?? '')
  const displayDifficulty = currentChallenge?.difficultyTag ?? 'undefined'

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
                    {machineName ? (
                      <EncryptedText 
                        text={machineName} 
                        revealDelayMs={30} 
                        flipDelayMs={30}
                        encryptedClassName="text-[#EF01BA]/50" 
                        revealedClassName="text-[#EF01BA]" 
                      />
                    ) : null}
                  </h1>
                  <p className="font-mono text-sm text-white/55 mt-1">{currentChallenge.category}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-mono text-xs text-[#FEF759] border border-[#FEF759]/40 bg-[#FEF759]/10 px-3 py-1">
                    {totalPoints} PTS
                  </span>
                  <span className="font-mono text-xs text-white/60 border border-white/15 bg-white/5 px-3 py-1">
                    {displayDifficulty}
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
                  <p className="text-white/85 text-sm">{displayDifficulty}</p>
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

              {/* Lore description from step 1 */}
              <div className="mt-6 border border-white/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] bg-[#0b0214]/80 p-4 sm:p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#00F0FF] mb-3">
                  Briefing Interceptado
                </p>
                <p className="text-white/85 text-sm leading-relaxed sm:text-[15px]">
                  {(() => {
                    const loreText = enrichedSteps[step1?.id ?? 0]?.lore || step1?.lore || currentChallenge.lore;
                    return loreText ? (
                      <>
                        <EncryptedText 
                          text={loreText} 
                          revealDelayMs={15} // Rápido porque es texto largo
                          flipDelayMs={30}
                          encryptedClassName="text-[#00F0FF]/50"
                          revealedClassName="text-white/85"
                        />
                        <span className="animate-pulse text-[#00F0FF] ml-1">_</span>
                      </>
                    ) : (
                      <span className="animate-pulse text-[#00F0FF]">_</span>
                    );
                  })()}
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
                const maxAttempts = enrichedSteps[step.id]?.maxAttempts ?? 0
                const attemptsMade = enrichedSteps[step.id]?.attempts ?? 0
                const remaining = maxAttempts - attemptsMade
                const exhaustedFromServer = maxAttempts > 0 && attemptsMade >= maxAttempts
                const exhaustedLocalSession = fs?.status === 'ratelimited' || fs?.message?.includes('0 tries remaining')
                const isLockedByAttempts = exhaustedLocalSession || exhaustedFromServer


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
                            placeholder="PWG{tu_respuesta} o copia y pega la flag!"
                            disabled={isSubmitting || isLockedByAttempts}
                            className="w-full border border-white/25 bg-black/35 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-[#00F0FF] focus:outline-none disabled:opacity-50"
                          />

                          <button
                            type="button"
                            onClick={() => void submitFlag(step.id)}
                            disabled={isSubmitting || isLockedByAttempts}
                            className="inline-flex items-center justify-center border border-[#EF01BA]/40 bg-[#EF01BA]/15 hover:bg-[#EF01BA]/25 text-white px-4 py-2 font-mono text-xs transition-colors disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              'Enviar'
                            )}
                          </button>

                          {(enrichedSteps[step.id]?.hints?.length ?? 0) > 0 && (
                            <button
                            type="button"
                            onClick={() => openHintModal(step)}
                            className="inline-flex items-center justify-center border border-[#00F0FF]/40 bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] px-3 py-2 font-mono text-xs transition-colors"
                            >
                            Hint
                            </button>
                        )}
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

      {activeHintModal && (
        <HintModal
            modal={activeHintModal}
            hintStates={hintStates}
            onClose={() => setActiveHintModal(null)}
            onUnlock={handleUnlockHint}
        />
        )}
    </main>
  )
}
'use client'
import { useState, useRef, useEffect } from 'react'

type TonyCycleState = {
  cycle: number
  status: 'running' | 'complete'
  atsScore?: number
  verdict?: 'APPROVED' | 'FORCE_REWRITE'
  critique?: string
  fixesApplied?: string
  streamedText: string
}

type TonyState = 'idle' | 'running' | 'done'

export function TonyPanel({
  isVisible,
  resumeData,
  candidateProfile,
  jobDescription,
  targetRole,
  allDebateMessages,
  onApproved,
}: {
  isVisible: boolean
  resumeData: any
  candidateProfile: any
  jobDescription: string
  targetRole: string
  allDebateMessages: any[]
  onApproved: (resume: any, atsScore: number) => void
}) {
  const [tonyState, setTonyState] = useState<TonyState>('idle')
  const [cycles, setCycles] = useState<TonyCycleState[]>([])
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [totalCycles, setTotalCycles] = useState<number>(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [cycles])

  async function launchTony() {
    setTonyState('running')
    setCycles([])

    try {
      const response = await fetch('/api/agents/tony', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, candidateProfile, jobDescription, targetRole, allDebateMessages }),
      })

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          const data = line.replace('data: ', '')
          if (data === '[DONE]') break

          try {
            const event = JSON.parse(data)

            if (event.type === 'tony_cycle_start') {
              setCycles(prev => [...prev, {
                cycle: event.cycle,
                status: 'running',
                streamedText: ''
              }])
            }

            if (event.type === 'tony_token') {
              setCycles(prev => prev.map(c =>
                c.cycle === event.cycle
                  ? { ...c, streamedText: c.streamedText + event.token }
                  : c
              ))
            }

            if (event.type === 'tony_cycle_complete') {
              setCycles(prev => prev.map(c =>
                c.cycle === event.cycle
                  ? {
                      ...c,
                      status: 'complete',
                      atsScore: event.atsScore,
                      verdict: event.verdict,
                      critique: event.critique,
                      fixesApplied: event.fixesApplied,
                      streamedText: c.streamedText
                    }
                  : c
              ))
            }

            if (event.type === 'tony_done') {
              setFinalScore(event.finalAtsScore)
              setTotalCycles(event.totalCycles)
              setTonyState('done')
              onApproved(event.approvedResume, event.finalAtsScore)
            }
          } catch { /* partial JSON, skip */ }
        }
      }
    } catch (error) {
      console.error('[v0] Tony error:', error)
      setTonyState('done')
    }
  }

  if (!isVisible) return null

  return (
    <div className="border-t border-[#FF000030] mt-4 pt-4">
      {/* Tony Header */}
      <div className="flex items-center gap-3 mb-4 px-4">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-mono font-bold flex-shrink-0"
          style={{ background: '#FF000015', border: '1px solid #FF0000', color: '#FF0000' }}
        >
          T
        </div>
        <div className="flex-1">
          <div className="text-xs font-mono" style={{ color: '#FF0000' }}>TONY — THE ENFORCER</div>
          <div className="text-xs font-mono text-muted-foreground">ATS Target: 75% · Max 3 cycles · No mercy</div>
        </div>
        {tonyState === 'idle' && (
          <button
            onClick={launchTony}
            className="text-xs font-mono px-3 py-1.5 rounded-md transition-all"
            style={{
              background: '#FF000020',
              border: '1px solid #FF0000',
              color: '#FF0000',
            }}
          >
            ⚡ Deploy Tony
          </button>
        )}
        {tonyState === 'done' && finalScore !== null && (
          <div
            className="text-xs font-mono px-3 py-1.5 rounded-md"
            style={{
              background: finalScore >= 75 ? '#22C55E20' : '#FF990020',
              border: `1px solid ${finalScore >= 75 ? '#22C55E' : '#FF9900'}`,
              color: finalScore >= 75 ? '#22C55E' : '#FF9900',
            }}
          >
            {finalScore}% ATS · {totalCycles} cycle{totalCycles !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Cycle Cards */}
      <div className="space-y-3 px-4">
        {cycles.map((cycle) => (
          <div
            key={cycle.cycle}
            className="rounded-lg border overflow-hidden"
            style={{
              borderColor: cycle.status === 'complete'
                ? (cycle.verdict === 'APPROVED' ? '#22C55E40' : '#FF000040')
                : '#FF000020',
              background: '#FF000008'
            }}
          >
            {/* Cycle header */}
            <div
              className="flex items-center gap-3 px-3 py-2 border-b"
              style={{
                borderColor: cycle.status === 'complete'
                  ? (cycle.verdict === 'APPROVED' ? '#22C55E20' : '#FF000020')
                  : '#FF000015',
                background: '#FF000010'
              }}
            >
              <div className="text-xs font-mono" style={{ color: '#FF0000' }}>
                CYCLE {cycle.cycle} / 3
              </div>
              <div className="flex-1" />
              {cycle.status === 'running' && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-mono text-muted-foreground">enforcing...</span>
                </div>
              )}
              {cycle.status === 'complete' && (
                <div
                  className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{
                    color: cycle.verdict === 'APPROVED' ? '#22C55E' : '#FF9900',
                    background: cycle.verdict === 'APPROVED' ? '#22C55E15' : '#FF990015',
                  }}
                >
                  {cycle.verdict === 'APPROVED' ? `✓ APPROVED ${cycle.atsScore}%` : `✗ ${cycle.atsScore}% — FORCING REWRITE`}
                </div>
              )}
            </div>

            {/* Critique */}
            {cycle.critique && (
              <div className="px-3 py-2 border-b border-[#FF000015]">
                <div className="text-xs font-mono text-muted-foreground mb-1">CRITIQUE</div>
                <div className="text-xs font-mono" style={{ color: '#FF6666' }}>{cycle.critique}</div>
              </div>
            )}

            {/* Fixes */}
            {cycle.fixesApplied && (
              <div className="px-3 py-2">
                <div className="text-xs font-mono text-muted-foreground mb-1">FIXES APPLIED</div>
                <div className="text-xs font-mono text-foreground whitespace-pre-line">{cycle.fixesApplied}</div>
              </div>
            )}

            {/* Streaming text (while running) */}
            {cycle.status === 'running' && cycle.streamedText && (
              <div className="px-3 py-2">
                <div className="text-xs font-mono text-muted-foreground opacity-60 whitespace-pre-wrap leading-relaxed">
                  {cycle.streamedText.slice(-200)}
                  <span className="animate-pulse">▋</span>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Tony Done */}
      {tonyState === 'done' && (
        <div
          className="mx-4 mt-3 p-3 rounded-lg border text-center"
          style={{
            borderColor: (finalScore ?? 0) >= 75 ? '#22C55E40' : '#FF990040',
            background: (finalScore ?? 0) >= 75 ? '#22C55E08' : '#FF990008'
          }}
        >
          <div
            className="text-xs font-mono"
            style={{ color: (finalScore ?? 0) >= 75 ? '#22C55E' : '#FF9900' }}
          >
            {(finalScore ?? 0) >= 75
              ? `✓ Tony approved. ATS ${finalScore}% — handing off to Steve.`
              : `Tony gave it ${totalCycles} cycles. Best score: ${finalScore}%. Shipping anyway.`
            }
          </div>
        </div>
      )}
    </div>
  )
}

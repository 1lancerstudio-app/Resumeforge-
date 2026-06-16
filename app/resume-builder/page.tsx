'use client'

import { useState, useRef, useCallback } from 'react'
import { renderPdf } from '@/lib/pipeline/pdf-renderer'

// ── Agent display config ────────────────────────────────────────────────────
const AGENT_CONFIG: Record<string, { name: string; color: string; avatar: string; title: string }> = {
  zeus:        { name: 'Zeus',        color: '#EAB308', avatar: 'Z',  title: 'Strategic Director' },
  athena:      { name: 'Athena',      color: '#94A3B8', avatar: 'A',  title: 'Technical Analyst' },
  hermes:      { name: 'Hermes',      color: '#F97316', avatar: 'H',  title: 'Communication Expert' },
  apollo:      { name: 'Apollo',      color: '#FBBF24', avatar: 'AP', title: 'Creative Director' },
  hephaestus:  { name: 'Hephaestus', color: '#EF4444', avatar: 'HE', title: 'ATS Engineer' },
  prometheus:  { name: 'Prometheus',  color: '#A855F7', avatar: 'PR', title: 'Probability Analyst' },
  tony:        { name: 'Tony',        color: '#FF0000', avatar: 'T',  title: 'The Enforcer' },
  steve:       { name: 'Steve',       color: '#38BDF8', avatar: 'S',  title: 'PDF Architect' },
  system:      { name: 'System',      color: '#6B7280', avatar: '!',  title: 'Alert' },
}

interface ChatMessage {
  id: number
  agent: string
  content: string
  timestamp: number
}

interface TonyCycle {
  cycle: number
  max: number
  status: 'running' | 'complete'
  atsScore?: number
  verdict?: string
  critique?: string
  approved?: boolean
}

const DEFAULT_PROFILE = {
  name: 'User',
  email: '',
  phone: '',
  linkedIn: '',
  github: '',
  experience: [],
  skills: [],
  certifications: [],
  education: [],
}

export default function ResumeBuilder() {
  const [messages,         setMessages]         = useState<ChatMessage[]>([])
  const [streamingAgents,  setStreamingAgents]  = useState<Record<string, string>>({})
  const [currentPhase,     setCurrentPhase]     = useState('')
  const [pipelineRunning,  setPipelineRunning]  = useState(false)
  const [pipelineComplete, setPipelineComplete] = useState(false)
  const [probabilityData,  setProbabilityData]  = useState<any>(null)
  const [apolloDecision,   setApolloDecision]   = useState<any>(null)
  const [tonyCycles,       setTonyCycles]       = useState<TonyCycle[]>([])
  const [finalScore,       setFinalScore]       = useState<number | null>(null)
  const [resumeData,       setResumeData]       = useState<any>(null)
  const [pdfStatus,        setPdfStatus]        = useState('')
  const [userInput,        setUserInput]        = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  async function runPipeline(message: string) {
    if (pipelineRunning) return
    setPipelineRunning(true)
    setPipelineComplete(false)
    setMessages([])
    setStreamingAgents({})
    setTonyCycles([])
    setFinalScore(null)
    setProbabilityData(null)
    setApolloDecision(null)
    setPdfStatus('')

    let response: Response
    try {
      response = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: message, candidateProfile: DEFAULT_PROFILE }),
      })
    } catch {
      setMessages([{ id: Date.now(), agent: 'system', content: 'Network error — could not reach pipeline.', timestamp: Date.now() }])
      setPipelineRunning(false)
      return
    }

    if (!response.ok || !response.body) {
      setMessages([{ id: Date.now(), agent: 'system', content: `Pipeline error: ${response.status}`, timestamp: Date.now() }])
      setPipelineRunning(false)
      return
    }

    const reader  = response.body.getReader()
    const decoder = new TextDecoder()
    // Critical: SSE chunks do NOT align to line boundaries — buffer incomplete lines
    let lineBuffer = ''

    outer: while (true) {
      const { done, value } = await reader.read()
      if (done) break

      lineBuffer += decoder.decode(value, { stream: true })
      const lines = lineBuffer.split('\n')
      lineBuffer = lines.pop() ?? ''   // keep incomplete tail

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data: ')) continue
        const raw = trimmed.slice(6)
        if (raw === '[DONE]') { setPipelineRunning(false); break outer }

        let event: any
        try { event = JSON.parse(raw) } catch { continue }

        switch (event.type) {

          case 'phase':
            setCurrentPhase(event.label)
            break

          case 'agent_start':
            setStreamingAgents(prev => ({ ...prev, [event.agent]: '' }))
            break

          case 'agent_token':
            setStreamingAgents(prev => ({
              ...prev,
              [event.agent]: (prev[event.agent] ?? '') + event.token,
            }))
            break

          case 'agent_message':
            // Finalise streaming bubble → move to messages list
            setStreamingAgents(prev => { const n = { ...prev }; delete n[event.agent]; return n })
            setMessages(prev => [...prev, {
              id: Date.now() + Math.random(),
              agent: event.agent,
              content: event.content,
              timestamp: Date.now(),
            }])
            scrollToBottom()
            break

          case 'pdf_ready':
            // NEVER render in chat — trigger silent iframe download
            setPdfStatus('Rendering PDF at print quality...')
            renderPdf(event.html, event.filename || `Resume_${Date.now()}.pdf`)
              .then(() => setPdfStatus(`Downloaded: ${event.filename || 'resume.pdf'}`))
              .catch(() => setPdfStatus('PDF rendering failed.'))
            break

          case 'tony_cycle_start':
            setTonyCycles(prev => [...prev, { cycle: event.cycle, max: event.max, status: 'running' }])
            break

          case 'tony_cycle_complete':
            setTonyCycles(prev => prev.map(c =>
              c.cycle === event.cycle ? { ...c, status: 'complete', ...event } : c
            ))
            if (event.resumeData) setResumeData(event.resumeData)
            break

          case 'tony_done':
            setFinalScore(event.finalAtsScore)
            if (event.approvedResume) setResumeData(event.approvedResume)
            break

          case 'probability':
            setProbabilityData(event)
            break

          case 'apollo_decision':
            setApolloDecision(event)
            break

          case 'pipeline_complete':
            setPipelineComplete(true)
            setPipelineRunning(false)
            break

          case 'error':
            setMessages(prev => [...prev, {
              id: Date.now(),
              agent: 'system',
              content: `Error: ${event.message}`,
              timestamp: Date.now(),
            }])
            setPipelineRunning(false)
            break

          case 'status':
            setCurrentPhase(event.message)
            break
        }
      }
    }

    setPipelineRunning(false)
  }

  function handleSend() {
    if (!userInput.trim() || pipelineRunning) return
    const msg = userInput.trim()
    setUserInput('')
    runPipeline(msg)
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col min-w-0">

        {/* Phase indicator */}
        {currentPhase && (
          <div className="px-4 py-2 border-b border-border bg-secondary/50">
            <div className="flex items-center gap-2">
              {pipelineRunning && <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
              <span className="text-xs font-mono text-muted-foreground">{currentPhase}</span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

          {/* Empty state */}
          {messages.length === 0 && Object.keys(streamingAgents).length === 0 && !pipelineRunning && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center">
                <span className="text-lg font-mono font-bold text-foreground/40">RF</span>
              </div>
              <p className="text-sm font-mono text-muted-foreground max-w-sm leading-relaxed">
                Paste a job URL or describe the role you are targeting.<br />
                All 8 agents will collaborate to build your resume.
              </p>
            </div>
          )}

          {/* Completed agent messages */}
          {messages.map((msg) => {
            const agent = AGENT_CONFIG[msg.agent] ?? AGENT_CONFIG['system']
            return (
              <div key={msg.id} className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-mono font-bold"
                  style={{ background: `${agent.color}18`, border: `1.5px solid ${agent.color}`, color: agent.color }}
                >
                  {agent.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[11px] font-mono font-semibold" style={{ color: agent.color }}>
                      {agent.name.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">{agent.title}</span>
                  </div>
                  <div
                    className="text-sm rounded-lg px-3 py-2.5 border leading-relaxed whitespace-pre-wrap"
                    style={{ background: `${agent.color}0A`, borderColor: `${agent.color}20`, color: 'var(--foreground)' }}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Live streaming indicators — one per active agent */}
          {Object.entries(streamingAgents).map(([agentId, text]) => {
            const agent = AGENT_CONFIG[agentId]
            if (!agent) return null
            return (
              <div key={agentId} className="flex gap-3 opacity-75">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-mono font-bold animate-pulse"
                  style={{ background: `${agent.color}18`, border: `1.5px solid ${agent.color}`, color: agent.color }}
                >
                  {agent.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[11px] font-mono font-semibold" style={{ color: agent.color }}>{agent.name.toUpperCase()}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{agent.title}</span>
                    <span className="text-[10px] font-mono text-muted-foreground animate-pulse">working...</span>
                  </div>
                  <div
                    className="text-sm rounded-lg px-3 py-2.5 border leading-relaxed whitespace-pre-wrap min-h-[36px]"
                    style={{ background: `${agent.color}0A`, borderColor: `${agent.color}20`, color: 'var(--foreground)' }}
                  >
                    {text || ''}<span className="animate-pulse">|</span>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Tony enforcement cycles */}
          {tonyCycles.map((cycle) => (
            <div
              key={cycle.cycle}
              className="rounded-lg border px-4 py-3"
              style={{ borderColor: '#FF000030', background: '#FF000008' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono font-bold" style={{ color: '#FF0000' }}>
                  TONY — CYCLE {cycle.cycle}/{cycle.max}
                </span>
                {cycle.status === 'complete' && (
                  <span className="text-[11px] font-mono font-bold" style={{ color: cycle.approved ? '#22C55E' : '#EAB308' }}>
                    ATS {cycle.atsScore}% — {cycle.verdict}
                  </span>
                )}
                {cycle.status === 'running' && (
                  <span className="text-[10px] font-mono text-muted-foreground animate-pulse">enforcing...</span>
                )}
              </div>
              {cycle.critique && <p className="text-xs text-muted-foreground mt-1">{cycle.critique}</p>}
            </div>
          ))}

          {/* Prometheus score */}
          {probabilityData && (
            <div className="rounded-lg border px-4 py-3" style={{ borderColor: '#A855F730', background: '#A855F708' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono font-bold" style={{ color: '#A855F7' }}>PROMETHEUS — MATCH SCORE</span>
                <span className="text-base font-mono font-bold" style={{ color: '#A855F7' }}>{probabilityData.score}%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Estimated after Tony: {probabilityData.estimatedAfterTony}% &bull; Top fix: {probabilityData.topFix}
              </p>
            </div>
          )}

          {/* PDF status */}
          {pdfStatus && (
            <div className="rounded-lg border px-4 py-2.5 text-xs font-mono" style={{ borderColor: '#38BDF830', background: '#38BDF808', color: '#38BDF8' }}>
              Steve: {pdfStatus}
            </div>
          )}

          {/* Complete banner */}
          {pipelineComplete && finalScore !== null && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/5 px-4 py-3 text-center">
              <p className="text-sm font-mono font-bold text-green-400">Pipeline complete</p>
              <p className="text-xs font-mono text-muted-foreground mt-1">Final ATS score: {finalScore}%</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-border px-4 py-4 bg-secondary/30">
          <div className="flex gap-3">
            <input
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder={pipelineRunning ? 'Agents are working...' : 'Paste a job URL or describe the role...'}
              disabled={pipelineRunning}
              className="flex-1 bg-input border border-border rounded-lg px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={pipelineRunning || !userInput.trim()}
              className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-30 transition-opacity hover:bg-foreground/90 text-sm font-bold"
              aria-label="Send"
            >
              &#8593;
            </button>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground mt-2 text-center">
            Zeus &rarr; Athena &middot; Hermes &middot; Hephaestus &rarr; Apollo &rarr; Prometheus &rarr; Tony &rarr; Steve &rarr; PDF
          </p>
        </div>

      </div>
    </div>
  )
}

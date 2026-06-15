'use client'

import { useState, useRef, useCallback } from 'react'
import { renderPdf } from '@/lib/pipeline/pdf-renderer'

const AGENT_CONFIG = {
  zeus: { name: 'Zeus', color: '#EAB308', avatar: 'Z', title: 'Strategic Director' },
  athena: { name: 'Athena', color: '#94A3B8', avatar: 'A', title: 'Technical Analyst' },
  hermes: { name: 'Hermes', color: '#F97316', avatar: 'H', title: 'Communication Expert' },
  apollo: { name: 'Apollo', color: '#FBBF24', avatar: 'AP', title: 'Creative Director' },
  hephaestus: { name: 'Hephaestus', color: '#EF4444', avatar: 'HE', title: 'ATS Engineer' },
  prometheus: { name: 'Prometheus', color: '#A855F7', avatar: 'PR', title: 'Probability Analyst' },
  tony: { name: 'Tony', color: '#FF0000', avatar: 'T', title: 'The Enforcer' },
  steve: { name: 'Steve', color: '#38BDF8', avatar: 'S', title: 'PDF Architect' },
}

type PipelineMessage =
  | { type: 'phase'; phase: number; label: string }
  | { type: 'agent_message'; agent: string; content: string }
  | { type: 'tony_cycle_start'; cycle: number; max: number }
  | { type: 'tony_cycle_complete'; cycle: number; atsScore: number; verdict: string; critique: string; fixesApplied: string; resumeData: any; approved: boolean }
  | { type: 'tony_done'; finalAtsScore: number; approvedResume: any }
  | { type: 'probability'; score: number; breakdown: any; topFix: string; estimatedAfterTony: number }
  | { type: 'apollo_decision'; template: string; requiresPhoto: boolean; sectionOrder: string[]; reasoning: string }
  | { type: 'pdf_ready'; html: string; filename: string; template: string }
  | { type: 'pdf_fallback'; resumeData: any }
  | { type: 'pipeline_complete'; finalAtsScore: number; probabilityScore: number; template: string; resumeData: any }
  | { type: 'error'; message: string }
  | { type: 'status'; message: string }

export default function ResumeBuilder() {
  const [messages, setMessages] = useState<Array<{ agent: string; content: string; timestamp: number }>>([])
  const [currentPhase, setCurrentPhase] = useState<string>('')
  const [pipelineRunning, setPipelineRunning] = useState(false)
  const [pipelineComplete, setPipelineComplete] = useState(false)
  const [probabilityData, setProbabilityData] = useState<any>(null)
  const [apolloDecision, setApolloDecision] = useState<any>(null)
  const [tonyCycles, setTonyCycles] = useState<any[]>([])
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [resumeData, setResumeData] = useState<any>(null)
  const [pdfStatus, setPdfStatus] = useState<string>('')
  const [userInput, setUserInput] = useState('')
  const [activeAgents, setActiveAgents] = useState<Set<string>>(new Set())

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const candidateProfile = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    linkedIn: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    experience: [
      { role: 'Senior Developer', company: 'Tech Corp', years: '3' },
      { role: 'Full Stack Developer', company: 'StartUp Inc', years: '2' }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS'],
    certifications: ['AWS Solutions Architect'],
    education: [
      { degree: 'BS Computer Science', school: 'State University', year: '2019' }
    ]
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  async function runPipeline(message: string) {
    if (pipelineRunning) return
    setPipelineRunning(true)
    setPipelineComplete(false)
    setMessages([])
    setTonyCycles([])
    setFinalScore(null)
    setProbabilityData(null)
    setApolloDecision(null)
    setPdfStatus('')

    const response = await fetch('/api/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: message,
        candidateProfile,
        connectedPlatforms: {},
      }),
    })

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value)
      const lines = text.split('\n').filter(l => l.startsWith('data: '))

      for (const line of lines) {
        const raw = line.replace('data: ', '').trim()
        if (raw === '[DONE]') {
          setPipelineRunning(false)
          break
        }

        try {
          const event = JSON.parse(raw) as PipelineMessage

          switch (event.type) {
            case 'phase':
              setCurrentPhase(event.label)
              break

            case 'agent_message':
              setMessages(prev => [...prev, {
                agent: event.agent,
                content: event.content,
                timestamp: Date.now()
              }])
              setActiveAgents(prev => { const s = new Set(prev); s.delete(event.agent); return s })
              scrollToBottom()
              break

            case 'tony_cycle_start':
              setTonyCycles(prev => [...prev, { cycle: event.cycle, status: 'running', streamedText: '' }])
              break

            case 'tony_cycle_complete':
              setTonyCycles(prev => prev.map(c =>
                c.cycle === event.cycle
                  ? { ...c, status: 'complete', ...event }
                  : c
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

            case 'pdf_ready':
              setPdfStatus('Rendering PDF...')
              try {
                await renderPdf(event.html, event.filename)
                setPdfStatus(`✓ PDF downloaded: ${event.filename}`)
              } catch (err) {
                setPdfStatus('PDF render failed — try the Download button.')
              }
              break

            case 'pipeline_complete':
              setPipelineComplete(true)
              setPipelineRunning(false)
              break

            case 'error':
              setMessages(prev => [...prev, {
                agent: 'system',
                content: `⚠️ ${event.message}`,
                timestamp: Date.now()
              }])
              setPipelineRunning(false)
              break

            case 'status':
              setCurrentPhase(event.message)
              break
          }
        } catch { /* partial chunk */ }
      }
    }
  }

  function handleSend() {
    if (!userInput.trim() || pipelineRunning) return
    const msg = userInput.trim()
    setUserInput('')
    runPipeline(msg)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Center — debate arena */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Phase indicator */}
        {currentPhase && (
          <div className="px-4 py-2 border-b border-border bg-secondary">
            <div className="flex items-center gap-2">
              {pipelineRunning && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
              <span className="text-xs font-mono text-muted-foreground">{currentPhase}</span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => {
            const agent = AGENT_CONFIG[msg.agent as keyof typeof AGENT_CONFIG]
            if (!agent) return null
            return (
              <div key={i} className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0"
                  style={{ background: `${agent.color}20`, border: `1px solid ${agent.color}`, color: agent.color }}
                >
                  {agent.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono" style={{ color: agent.color }}>{agent.name}</span>
                    <span className="text-xs font-mono text-muted-foreground">· {agent.title}</span>
                  </div>
                  <div
                    className="rounded-lg px-3 py-2 text-sm border"
                    style={{ background: `${agent.color}08`, borderColor: `${agent.color}25` }}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Tony cycles */}
          {tonyCycles.map((cycle) => (
            <div key={cycle.cycle} className="mx-2 px-4 py-3 rounded-lg border border-[#FF000030] bg-[#FF000008]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold" style={{ color: '#FF0000' }}>
                  TONY CYCLE {cycle.cycle}/{cycle.max}
                </span>
                <span className="text-xs font-mono" style={{ color: cycle.approved ? '#22C55E' : '#EAB308' }}>
                  ATS: {cycle.atsScore}% {cycle.verdict === 'APPROVED' ? '✓' : '↻'}
                </span>
              </div>
              {cycle.critique && <p className="text-xs text-muted-foreground mb-2">{cycle.critique}</p>}
            </div>
          ))}

          {/* Probability */}
          {probabilityData && (
            <div className="mx-2 px-4 py-3 rounded-lg border border-[#A855F730] bg-[#A855F708]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold" style={{ color: '#A855F7' }}>PROMETHEUS SCORE</span>
                <span className="text-sm font-bold" style={{ color: '#A855F7' }}>{probabilityData.score}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Est. after Tony: {probabilityData.estimatedAfterTony}%</p>
            </div>
          )}

          {/* PDF status */}
          {pdfStatus && (
            <div className="mx-2 px-3 py-2 rounded-lg border border-[#38BDF830] bg-[#38BDF808]">
              <span className="text-xs font-mono" style={{ color: '#38BDF8' }}>📄 Steve: {pdfStatus}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-border p-4 bg-secondary">
          <div className="flex gap-3">
            <input
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={pipelineRunning
                ? 'Agents are working...'
                : 'Paste a job URL or describe the role...'
              }
              disabled={pipelineRunning}
              className="flex-1 bg-input border border-border rounded-lg px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={pipelineRunning || !userInput.trim()}
              className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-30 transition-opacity hover:bg-foreground/90"
            >
              ↑
            </button>
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-2 text-center">
            Zeus → Athena + Hermes + Hephaestus → Apollo → Prometheus → Tony → Steve → PDF
          </p>
        </div>
      </div>
    </div>
  )
}

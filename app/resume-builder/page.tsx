'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AGENTS, getAllAgents, type AgentId } from '@/lib/agents/agent-config'
import { AgentMessage, ProbabilityCard } from '@/components/agents/debate-components'
import { Zap, Send } from 'lucide-react'

interface DebateMessage {
  agentId: AgentId
  content: string
  timestamp: number
  round: 1 | 2 | 3
}

type DebateState = 'idle' | 'round1' | 'round2' | 'round3' | 'assembling' | 'complete'

export default function ResumeBuilderPage() {
  const [debateState, setDebateState] = useState<DebateState>('idle')
  const [messages, setMessages] = useState<DebateMessage[]>([])
  const [currentRound, setCurrentRound] = useState<1 | 2 | 3>(1)
  const [targetRole, setTargetRole] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [userInput, setUserInput] = useState('')
  const [probability, setProbability] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sample candidate profile - in real app this would come from user's connected platforms
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
    certifications: ['AWS Solutions Architect', 'Google Cloud Associate'],
    education: [
      { degree: 'BS Computer Science', school: 'State University', year: '2019' }
    ]
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const launchDebate = async () => {
    if (!targetRole.trim() || !jobDescription.trim()) {
      alert('Please fill in target role and job description')
      return
    }

    setDebateState('round1')
    setMessages([])
    setProbability(null)
    setCurrentRound(1)

    // Run 3 rounds of debate
    for (let round = 1; round <= 3; round++) {
      setCurrentRound(round as 1 | 2 | 3)

      try {
        const response = await fetch('/api/agents/debate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            round,
            candidateProfile,
            targetRole,
            jobDescription,
            previousMessages: messages.map(m => ({
              agent: m.agentId,
              content: m.content
            }))
          })
        })

        const data = await response.json()

        if (data.responses) {
          const newMessages: DebateMessage[] = data.responses.map((resp: any) => ({
            agentId: resp.agentId as AgentId,
            content: resp.content,
            timestamp: resp.timestamp,
            round: round as 1 | 2 | 3
          }))

          setMessages(prev => [...prev, ...newMessages])

          // Check for probability score in Prometheus response
          const prometheusMsg = newMessages.find(m => m.agentId === 'prometheus')
          if (prometheusMsg?.content.includes('<probability>')) {
            const probabilityMatch = prometheusMsg.content.match(/<probability>(.*?)<\/probability>/)
            if (probabilityMatch) {
              try {
                const prob = JSON.parse(probabilityMatch[1])
                setProbability(prob)
              } catch (e) {
                console.error('Failed to parse probability:', e)
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error in round ${round}:`, error)
        alert(`Error in round ${round}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      // Add a small delay between rounds
      if (round < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    setDebateState('complete')
  }

  const handleSendMessage = async () => {
    if (!userInput.trim()) return

    const userMessage = {
      agentId: 'zeus' as AgentId,
      content: userMessage,
      timestamp: Date.now(),
      round: currentRound
    }

    setUserInput('')

    // All 6 agents respond to user message
    try {
      const response = await fetch('/api/agents/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          round: 4, // User interaction round
          candidateProfile,
          targetRole,
          jobDescription,
          previousMessages: [
            ...messages.map(m => ({
              agent: m.agentId,
              content: m.content
            })),
            {
              agent: 'USER',
              content: userInput
            }
          ]
        })
      })

      const data = await response.json()

      if (data.responses) {
        const newMessages: DebateMessage[] = data.responses.map((resp: any) => ({
          agentId: resp.agentId as AgentId,
          content: resp.content,
          timestamp: resp.timestamp,
          round: 4 as any
        }))

        setMessages(prev => [...prev, ...newMessages])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="h-14 border-b bg-card/50 backdrop-blur-sm flex items-center px-6 gap-4">
        <h1 className="text-lg font-semibold">ResumeForge AI — 6 Agent Debate</h1>
        <div className="ml-auto flex items-center gap-2 text-xs font-mono text-muted-foreground">
          {debateState !== 'idle' && (
            <>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {debateState === 'round1' && 'ROUND 1: PROFILE ASSESSMENT'}
              {debateState === 'round2' && 'ROUND 2: STRATEGY DEBATE'}
              {debateState === 'round3' && 'ROUND 3: CONSENSUS & GENERATION'}
              {debateState === 'complete' && 'DEBATE COMPLETE'}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden gap-6 p-6">
        {/* Left Panel - Controls */}
        <div className="w-80 space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Target Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer at Stripe"
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
              disabled={debateState !== 'idle'}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the job description or URL..."
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm h-40 resize-none"
              disabled={debateState !== 'idle'}
            />
          </div>

          <Button
            onClick={launchDebate}
            disabled={debateState !== 'idle'}
            className="w-full gap-2"
          >
            <Zap size={16} />
            Launch Agent Debate
          </Button>

          {/* Agent indicators */}
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Agents</p>
            <div className="grid grid-cols-3 gap-2">
              {getAllAgents().map(agent => (
                <div
                  key={agent.id}
                  className="rounded-lg px-2 py-2 text-center border text-xs font-mono"
                  style={{
                    background: agent.glowColor,
                    borderColor: `${agent.color}60`,
                    color: agent.color
                  }}
                >
                  {agent.avatar}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel - Debate Arena */}
        <div className="flex-1 flex flex-col border rounded-lg overflow-hidden bg-card/50 backdrop-blur-sm">
          {/* Debate header */}
          {debateState !== 'idle' && (
            <div className="border-b h-12 flex items-center px-6 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono">DEBATE IN PROGRESS</span>
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                Round {currentRound} of 3
              </div>
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && debateState === 'idle' ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="flex gap-2 mb-4 justify-center">
                  {getAllAgents().map(agent => (
                    <div
                      key={agent.id}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono border"
                      style={{
                        background: agent.glowColor,
                        borderColor: `${agent.color}60`,
                        color: agent.color
                      }}
                    >
                      {agent.avatar}
                    </div>
                  ))}
                </div>
                <h2 className="text-xl font-serif mb-2">6 agents. One perfect resume.</h2>
                <p className="text-sm text-muted-foreground">Set your target role and job description, then launch the debate.</p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx}>
                    {/* Round divider */}
                    {idx > 0 && messages[idx - 1].round !== msg.round && (
                      <div className="flex items-center gap-4 my-4 text-xs font-mono text-muted-foreground">
                        <div className="flex-1 h-px bg-border" />
                        <span>
                          ROUND {msg.round}
                          {msg.round === 1 && ': PROFILE ASSESSMENT'}
                          {msg.round === 2 && ': STRATEGY DEBATE'}
                          {msg.round === 3 && ': CONSENSUS & GENERATION'}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                    )}
                    <AgentMessage
                      agentId={msg.agentId}
                      content={msg.content}
                    />

                    {/* Probability card after Prometheus message */}
                    {msg.agentId === 'prometheus' && probability && msg.content.includes('<probability>') && (
                      <ProbabilityCard
                        score={probability.score}
                        breakdown={probability.breakdown}
                        topFix={probability.topFix}
                      />
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* User input */}
          {debateState !== 'idle' && (
            <div className="border-t p-4 bg-card">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask the agents anything..."
                  className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  variant="outline"
                >
                  <Send size={16} />
                </Button>
              </div>
              <p className="text-xs font-mono text-muted-foreground mt-2">All 6 agents will respond to your question</p>
            </div>
          )}
        </div>

        {/* Right Panel - Resume Preview */}
        <div className="w-96 border rounded-lg overflow-hidden bg-card/50 backdrop-blur-sm flex flex-col">
          <div className="h-12 border-b px-6 flex items-center">
            <h3 className="text-sm font-mono">RESUME PREVIEW</h3>
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            {debateState === 'idle' ? (
              <div className="h-full flex items-center justify-center text-center text-sm text-muted-foreground">
                Launch the debate to see the resume preview update in real-time
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-12 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="mt-6 space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-3 bg-muted rounded animate-pulse" style={{ width: `${80 - i * 10}%` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { AGENTS, type AgentId } from '@/lib/agents/agent-config'

interface AgentMessageProps {
  agentId: AgentId
  content: string
  isStreaming?: boolean
}

export function AgentMessage({ agentId, content, isStreaming }: AgentMessageProps) {
  const agent = AGENTS[agentId]

  return (
    <div className="flex gap-3 mb-4 animate-fade-in">
      {/* Agent avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0 border"
        style={{
          background: agent.glowColor,
          borderColor: `${agent.color}60`,
          color: agent.color
        }}
      >
        {agent.avatar}
      </div>

      {/* Message content */}
      <div className="flex-1">
        {/* Agent name and title */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-semibold" style={{ color: agent.color }}>
            {agent.name}
          </span>
          <span className="text-xs font-mono text-muted-foreground">·</span>
          <span className="text-xs font-mono text-muted-foreground">{agent.title}</span>
        </div>

        {/* Message bubble */}
        <div
          className="rounded-lg px-4 py-3 text-sm border backdrop-blur-sm"
          style={{
            background: agent.glowColor,
            borderColor: `${agent.color}30`
          }}
        >
          <div className="text-foreground leading-relaxed whitespace-pre-wrap">{content}</div>
          {isStreaming && (
            <div className="mt-2 flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface ProbabilityCardProps {
  score: number
  breakdown: {
    skills: number
    experience: number
    ats: number
    culture: number
  }
  topFix: string
}

export function ProbabilityCard({ score, breakdown, topFix }: ProbabilityCardProps) {
  const agent = AGENTS.prometheus

  return (
    <div
      className="mx-4 my-4 border rounded-lg p-4 backdrop-blur-sm"
      style={{
        borderColor: `${agent.color}30`,
        background: agent.glowColor
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono font-semibold" style={{ color: agent.color }}>
          🔥 PROMETHEUS — JOB PROBABILITY
        </span>
      </div>

      {/* Big probability number */}
      <div className="text-center mb-6">
        <div className="text-6xl font-serif font-bold" style={{ color: agent.color }}>
          {score}%
        </div>
        <div className="text-xs font-mono text-muted-foreground mt-1">chance of getting this job</div>
      </div>

      {/* 4-axis breakdown */}
      <div className="space-y-3">
        {[
          { label: 'Skills match', value: breakdown.skills },
          { label: 'Experience', value: breakdown.experience },
          { label: 'ATS score', value: breakdown.ats },
          { label: 'Culture fit', value: breakdown.culture }
        ].map((axis) => (
          <div key={axis.label} className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground w-20">{axis.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${axis.value}%`,
                  background: agent.color
                }}
              />
            </div>
            <span className="text-xs font-mono font-semibold w-8 text-right" style={{ color: agent.color }}>
              {axis.value}%
            </span>
          </div>
        ))}
      </div>

      {/* Top fix suggestion */}
      <div className="mt-4 pt-4 border-t border-muted">
        <div className="text-xs font-mono text-muted-foreground">
          Top improvement:{' '}
          <span className="font-semibold" style={{ color: agent.color }}>
            {topFix}
          </span>
        </div>
      </div>
    </div>
  )
}

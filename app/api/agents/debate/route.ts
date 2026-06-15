import { AGENTS, type AgentId } from '@/lib/agents/agent-config'
import Groq from 'groq-sdk'

// Create Groq client lazily only when needed
function createGroqClient(apiKey: string | undefined): Groq {
  if (!apiKey) {
    throw new Error('Groq API key not provided')
  }
  return new Groq({ apiKey })
}

export interface DebateRequest {
  round: 1 | 2 | 3
  candidateProfile: Record<string, any>
  targetRole: string
  jobDescription: string
  previousMessages: Array<{ agent: string; content: string }>
}

export interface AgentResponse {
  agentId: AgentId
  content: string
  timestamp: number
}

export async function POST(req: Request) {
  try {
    const { round, candidateProfile, targetRole, jobDescription, previousMessages }: DebateRequest = await req.json()

    // Validate environment variables
    const agentIds: AgentId[] = ['zeus', 'athena', 'hermes', 'apollo', 'hephaestus', 'prometheus']
    const apiKeyMap: Record<AgentId, string | undefined> = {
      zeus: process.env.agent1,
      athena: process.env.agent2,
      hermes: process.env.agent3,
      apollo: process.env.agent4,
      hephaestus: process.env.agent5,
      prometheus: process.env.agent6,
    }

    const missingKeys = agentIds.filter(id => !apiKeyMap[id])
    
    if (missingKeys.length > 0) {
      return Response.json(
        { error: `Missing API keys for agents: ${missingKeys.join(', ')}. Please set environment variables: ${missingKeys.map(id => `agent${agentIds.indexOf(id) + 1}`).join(', ')}` },
        { status: 500 }
      )
    }

    // Build the context message for the debate
    const debateContextPrompt = `
CANDIDATE PROFILE:
${JSON.stringify(candidateProfile, null, 2)}

TARGET ROLE: ${targetRole}

JOB DESCRIPTION:
${jobDescription}

${previousMessages.length > 0 ? `PREVIOUS DEBATE:\n${previousMessages.map((m) => `${m.agent}: ${m.content}`).join('\n\n')}` : ''}

Round ${round} of 3 — respond as your character. Be specific to this candidate's actual data.
In Round 2+, reference and respond to what other agents said in previous rounds.
Build on their arguments or push back with your own analysis.`

    // Fire all 6 agents in parallel
    const responses = await Promise.all(
      agentIds.map(async (agentId): Promise<AgentResponse> => {
        const agent = AGENTS[agentId]
        const apiKey = apiKeyMap[agentId]

        if (!apiKey) {
          return {
            agentId,
            content: `Error: Missing API key for ${agent.name}`,
            timestamp: Date.now()
          }
        }

        try {
          const client = createGroqClient(apiKey)
          
          // Adjust token limits based on agent and round
          let maxTokens = 400
          if (agentId === 'prometheus' && round === 3) {
            maxTokens = 800  // Prometheus needs space for full probability JSON output in Round 3
          }
          
          const completion = await client.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: agent.systemPrompt },
              { role: 'user', content: debateContextPrompt }
            ],
            max_tokens: maxTokens,
            temperature: 0.8,
          })

          const content = completion.choices[0]?.message?.content || ''

          return {
            agentId,
            content,
            timestamp: Date.now()
          }
        } catch (error) {
          console.error(`[Debate] Error calling ${agentId}:`, error)
          return {
            agentId,
            content: `Error generating response: ${error instanceof Error ? error.message : 'Unknown error'}`,
            timestamp: Date.now()
          }
        }
      })
    )

    return Response.json({ 
      responses, 
      round,
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('[Debate API] Error:', error)
    return Response.json(
      { error: 'Failed to process debate request' },
      { status: 500 }
    )
  }
}

import Groq from 'groq-sdk'
import { AGENTS } from '@/lib/agents/agent-config'

const tonyClient = process.env.tony ? new Groq({ apiKey: process.env.tony }) : null

const MAX_CYCLES = 3
const ATS_TARGET = 75

export async function POST(req: Request) {
  if (!tonyClient) {
    return Response.json(
      { error: 'Tony API key not configured' },
      { status: 500 }
    )
  }

  const { resumeData, candidateProfile, jobDescription, targetRole, allDebateMessages } = await req.json()

  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  // Run Tony's enforcement loop — stream each cycle as it completes
  ;(async () => {
    let currentResume = resumeData
    let atsScore = 0
    let cycleNum = 0
    let approved = false

    while (cycleNum < MAX_CYCLES && !approved) {
      cycleNum++

      // Send cycle-start event to client
      await writer.write(encoder.encode(`data: ${JSON.stringify({
        type: 'tony_cycle_start',
        cycle: cycleNum,
        max: MAX_CYCLES
      })}\n\n`))

      const prompt = `
CYCLE: ${cycleNum} of ${MAX_CYCLES}
ATS TARGET: ${ATS_TARGET}%
CURRENT ATS SCORE: ${atsScore > 0 ? atsScore + '%' : 'Not yet calculated'}

JOB DESCRIPTION:
${jobDescription}

TARGET ROLE: ${targetRole}

CANDIDATE PROFILE:
${JSON.stringify(candidateProfile, null, 2)}

WHAT THE 6 AGENTS PRODUCED (debate output):
${allDebateMessages.map((m: any) => `${m.agentId.toUpperCase()}: ${m.content}`).join('\n')}

CURRENT RESUME DATA TO CRITIQUE AND IMPROVE:
${JSON.stringify(currentResume, null, 2)}

${cycleNum > 1 ? `THIS IS CYCLE ${cycleNum}. The previous version scored ${atsScore}% — NOT GOOD ENOUGH. Be MORE aggressive. Find what you missed last time.` : ''}
${cycleNum === MAX_CYCLES ? `THIS IS YOUR FINAL CYCLE (${MAX_CYCLES}). ATS target may not be met — give the absolute best version possible and APPROVE regardless.` : ''}

Run all 6 passes. Output the <tony_cycle> block.
`

      // Stream Tony's response
      const streamResponse = await tonyClient.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: AGENTS.tony.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000,
        temperature: 0.2,    // Low temp — Tony is precise, not creative
        stream: true,
      })

      let fullResponse = ''

      for await (const chunk of streamResponse) {
        const delta = chunk.choices[0]?.delta?.content || ''
        fullResponse += delta

        // Stream each token to client
        await writer.write(encoder.encode(`data: ${JSON.stringify({
          type: 'tony_token',
          cycle: cycleNum,
          token: delta
        })}\n\n`))
      }

      // Parse Tony's structured output
      const atsMatch = fullResponse.match(/<ats_score>(\d+)<\/ats_score>/)
      const verdictMatch = fullResponse.match(/<verdict>(APPROVED|FORCE_REWRITE)<\/verdict>/)
      const resumeMatch = fullResponse.match(/<resume_data>([\s\S]*?)<\/resume_data>/)
      const critiqueMatch = fullResponse.match(/<critique>([\s\S]*?)<\/critique>/)
      const fixesMatch = fullResponse.match(/<fixes_applied>([\s\S]*?)<\/fixes_applied>/)

      atsScore = atsMatch ? parseInt(atsMatch[1]) : atsScore
      const verdict = verdictMatch?.[1] || 'FORCE_REWRITE'

      // Try to parse the updated resume
      if (resumeMatch) {
        try {
          const cleaned = resumeMatch[1].trim().replace(/^```json|```$/g, '').trim()
          currentResume = JSON.parse(cleaned)
        } catch {
          // Tony gave malformed JSON — keep previous resume, keep cycling
        }
      }

      // Send cycle-complete event
      await writer.write(encoder.encode(`data: ${JSON.stringify({
        type: 'tony_cycle_complete',
        cycle: cycleNum,
        atsScore,
        verdict,
        critique: critiqueMatch?.[1]?.trim() || '',
        fixesApplied: fixesMatch?.[1]?.trim() || '',
        resumeData: currentResume,
        approved: verdict === 'APPROVED'
      })}\n\n`))

      if (verdict === 'APPROVED') {
        approved = true
      }
    }

    // Tony is done — send final approved resume
    await writer.write(encoder.encode(`data: ${JSON.stringify({
      type: 'tony_done',
      finalAtsScore: atsScore,
      totalCycles: cycleNum,
      targetMet: atsScore >= ATS_TARGET,
      approvedResume: currentResume
    })}\n\n`))

    await writer.write(encoder.encode('data: [DONE]\n\n'))
    await writer.close()
  })()

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}

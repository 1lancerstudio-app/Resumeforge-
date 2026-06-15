import Groq from 'groq-sdk'
import { AGENTS } from '@/lib/agents/agent-config'

const steveClient = process.env.steve ? new Groq({ apiKey: process.env.steve }) : null

export async function POST(req: Request) {
  if (!steveClient) {
    return Response.json(
      { error: 'Steve API key not configured' },
      { status: 500 }
    )
  }

  const { approvedResume, chosenTemplate, photoBase64 } = await req.json()

  // Steve uses streaming for token-by-token HTML generation
  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  ;(async () => {
    try {
      const completion = await steveClient.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: AGENTS.steve.systemPrompt },
          {
            role: 'user',
            content: `
CHOSEN TEMPLATE: ${chosenTemplate}

APPROVED RESUME DATA:
${JSON.stringify(approvedResume, null, 2)}

${photoBase64 ? `PHOTO PROVIDED: [base64 image data - ${photoBase64.length} bytes]` : 'NO PHOTO PROVIDED'}

Generate the complete print-ready HTML now. Output only the <pdf_html> block.
`
          }
        ],
        max_tokens: 6000,
        temperature: 0.1,
        stream: true,
      })

      let fullResponse = ''

      for await (const chunk of completion) {
        const delta = chunk.choices[0]?.delta?.content || ''
        fullResponse += delta

        await writer.write(encoder.encode(`data: ${JSON.stringify({
          type: 'steve_token',
          token: delta
        })}\n\n`))
      }

      // Extract HTML from <pdf_html> tags
      const htmlMatch = fullResponse.match(/<pdf_html>([\s\S]*?)<\/pdf_html>/)
      const htmlContent = htmlMatch ? htmlMatch[1].trim() : fullResponse

      // Send completion event
      await writer.write(encoder.encode(`data: ${JSON.stringify({
        type: 'steve_done',
        htmlContent
      })}\n\n`))

      await writer.write(encoder.encode('data: [DONE]\n\n'))
      await writer.close()
    } catch (error) {
      console.error('[v0] Steve error:', error)
      await writer.write(encoder.encode(`data: ${JSON.stringify({
        type: 'steve_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })}\n\n`))
      await writer.close()
    }
  })()

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}

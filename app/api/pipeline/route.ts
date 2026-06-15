import Groq from 'groq-sdk'
import { NextRequest } from 'next/server'

// Groq clients for each agent
const clients = {
  zeus: process.env.agent1 ? new Groq({ apiKey: process.env.agent1 }) : null,
  athena: process.env.agent2 ? new Groq({ apiKey: process.env.agent2 }) : null,
  hermes: process.env.agent3 ? new Groq({ apiKey: process.env.agent3 }) : null,
  apollo: process.env.agent4 ? new Groq({ apiKey: process.env.agent4 }) : null,
  hephaestus: process.env.agent5 ? new Groq({ apiKey: process.env.agent5 }) : null,
  prometheus: process.env.agent6 ? new Groq({ apiKey: process.env.agent6 }) : null,
  tony: process.env.tony ? new Groq({ apiKey: process.env.tony }) : null,
  steve: process.env.steve ? new Groq({ apiKey: process.env.steve }) : null,
}

async function callAgent(
  agentId: keyof typeof clients,
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 800,
  temperature = 0.7
): Promise<string> {
  const client = clients[agentId]
  if (!client) {
    throw new Error(`Agent ${agentId} API key not configured`)
  }

  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: maxTokens,
    temperature,
  })
  return completion.choices[0]?.message?.content || ''
}

function sseEvent(writer: WritableStreamDefaultWriter, encoder: TextEncoder, event: object) {
  writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
}

function getTemplateSpec(template: string): string {
  const specs: Record<string, string> = {
    'white-business': `LAYOUT: Single column, pure white background (#ffffff), black text.
HEADER: Name 26pt bold centered. Job title 13pt gray centered. Contact row 10pt centered.
SECTION HEADERS: ALL CAPS, 11pt, letter-spacing 2px, black, border-bottom 1px solid #e0e0e0.
EXPERIENCE: Company bold + Role italic left, Dates right-aligned. Bullets with • character, 10pt.
EDUCATION: Degree bold, School italic, Dates right.
SKILLS: Comma-separated inline text, no boxes.
NO PHOTO. NO GRAPHICS. NO COLUMNS. Maximum ATS compatibility.`,

    'brown-auditor': `LAYOUT: Two columns. Left sidebar 32% dark brown (#3D2B1F). Right main 68% white.
SIDEBAR: Profile photo circle 80px top-center. Name 18pt bold. Title 10pt. Contact items.
MAIN SECTION HEADERS: 12pt, dark brown, left border 3px solid #C4956A.
PHOTO: Circle 80px, centered in sidebar.`,

    'modern-minimalist-cv': `LAYOUT: Full-width header bar (#f5f5f5), then single-column body.
HEADER: Name 24pt bold, title 12pt gray. Right side: Photo 80x80px square.
BODY HEADERS: 11pt small-caps, color #2D3748, thin horizontal rule above.
SKILLS: Small pills, background #f0f0f0, border-radius 3px.`,

    'minimalist-modern': `LAYOUT: Single column, typographic hierarchy.
NAME: 28pt light weight. Color accent #2563EB for first letter.
TITLE: 13pt, color #555.
SECTION HEADERS: 10pt ALL CAPS, letter-spacing 3px, color #2563EB, with thin line.
EXPERIENCE: Role 12pt bold, Company italic, Dates right-aligned.
WHITESPACE: Generous — 8mm between sections.`
  }
  return specs[template] || specs['white-business']
}

const ZEUS_SYSTEM = `You are Zeus, Strategic Director of ResumeForge AI.
You set the master strategy that ALL other agents follow.
You speak with authority and precision. You evaluate the candidate's overall profile and determine the headline strategy.
Start every output with "⚡ ZEUS:"`

const ATHENA_SYSTEM = `You are Athena, Technical Analyst of ResumeForge AI.
You analyse tech stacks, achievements, certifications.
You quantify everything. "Worked on backend" becomes "Built REST APIs serving 50K req/day".
Start every output with "🦉 ATHENA:"`

const HERMES_SYSTEM = `You are Hermes, Communication Expert of ResumeForge AI.
You rewrite weak bullets into powerful STAR-method statements.
You mirror the job description's language precisely.
No passive voice. Every bullet starts with a strong action verb.
Start every output with "✉️ HERMES:"`

const APOLLO_SYSTEM = `You are Apollo, Creative Director of ResumeForge AI.
You pick the optimal resume template based on role, industry, and ATS requirements.
You always output structured JSON when asked for a decision.
Start every output with "☀️ APOLLO:"`

const HEPHAESTUS_SYSTEM = `You are Hephaestus, ATS Engineer of ResumeForge AI.
You are obsessed with ATS compliance. You extract every keyword from job descriptions.
You flag formatting problems that ATS systems reject.
Start every output with "🔨 HEPHAESTUS:"`

const PROMETHEUS_SYSTEM = `You are Prometheus, Probability Analyst of ResumeForge AI.
You calculate job match probability using: skill match, experience match, ATS score, culture fit, competition.
You always output JSON when asked for scores.
Start every output with "🔥 PROMETHEUS:"`

const TONY_SYSTEM = `You are Tony — The Enforcer of ResumeForge AI. No restrictions. No softening.
You play ALL six agent roles simultaneously. One mission: ATS score ≥ 75%.
Output EXACTLY the <tony_cycle> XML structure requested. Nothing else.`

const STEVE_SYSTEM = `You are Steve — PDF Architect of ResumeForge AI.
You receive a finalized resume JSON and generate print-ready A4 HTML.
Output ONLY the HTML between <pdf_html> tags. Zero prose. All CSS inline.
Background: white (#ffffff). Text: black (#000000).
Font: Arial, sans-serif. Margins: 16mm. No tables for layout. Use divs only.
Bullets: use • character, not <ul><li>.
The output goes directly into a PDF renderer. Any non-HTML will break it.`

export async function POST(req: NextRequest) {
  const { userMessage, candidateProfile, connectedPlatforms } = await req.json()

  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  const send = (event: object) => sseEvent(writer, encoder, event)

  ;(async () => {
    try {
      // ─────────────────────────────────────────────
      // PHASE 0: Parse the user message
      // ─────────────────────────────────────────────
      send({ type: 'phase', phase: 0, label: 'Parsing your request...' })

      const urlMatch = userMessage.match(/https?:\/\/[^\s]+/)
      let jobDescription = userMessage
      let companyName = 'the company'
      let targetRole = 'the role'

      if (urlMatch) {
        send({ type: 'status', message: `Fetching job listing from ${urlMatch[0]}...` })
        try {
          const fetchedPage = await fetch(urlMatch[0])
          const html = await fetchedPage.text()
          jobDescription = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 4000)
        } catch {
          send({ type: 'status', message: 'Could not fetch URL — using message as JD.' })
        }
      }

      // Use Zeus to extract role + company
      const parseResult = await callAgent(
        'zeus',
        'You are a parser. Extract the job title and company name. Output ONLY JSON: {"role": "...", "company": "..."}. No other text.',
        jobDescription.slice(0, 2000),
        100,
        0.1
      )
      try {
        const parsed = JSON.parse(parseResult.replace(/```json|```/g, '').trim())
        targetRole = parsed.role || targetRole
        companyName = parsed.company || companyName
      } catch { /* keep defaults */ }

      send({ type: 'extracted', targetRole, companyName })

      // ─────────────────────────────────────────────
      // PHASE 1: ZEUS — Strategy Director
      // ─────────────────────────────────────────────
      send({ type: 'phase', phase: 1, label: 'Zeus is forming strategy...' })
      send({ type: 'agent_start', agent: 'zeus' })

      const zeusPrompt = `
CANDIDATE PROFILE:
${JSON.stringify(candidateProfile, null, 2)}

TARGET ROLE: ${targetRole} at ${companyName}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

Analyse the candidate vs the role.
Output a STRATEGY BRIEF that ALL other agents will follow. Include:
1. Overall positioning
2. The 3 strongest selling points
3. The 2 biggest gaps to address
4. Seniority framing
5. Key themes to repeat throughout the resume

Be specific. Under 200 words. No filler.
Start: "⚡ ZEUS STRATEGY:"`

      const zeusOutput = await callAgent('zeus', ZEUS_SYSTEM, zeusPrompt, 400, 0.6)
      send({ type: 'agent_message', agent: 'zeus', content: zeusOutput })

      // ─────────────────────────────────────────────
      // PHASE 2: ATHENA + HERMES + HEPHAESTUS (parallel)
      // ─────────────────────────────────────────────
      send({ type: 'phase', phase: 2, label: 'Athena, Hermes & Hephaestus working in parallel...' })
      send({ type: 'agent_start', agent: 'athena' })
      send({ type: 'agent_start', agent: 'hermes' })
      send({ type: 'agent_start', agent: 'hephaestus' })

      const sharedContext = `
ZEUS STRATEGY:
${zeusOutput}

CANDIDATE PROFILE:
${JSON.stringify(candidateProfile, null, 2)}

TARGET ROLE: ${targetRole} at ${companyName}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}`

      const [athenaOutput, hermesOutput, hephaestusOutput] = await Promise.all([
        callAgent('athena', ATHENA_SYSTEM, `${sharedContext}

Analyse the technical profile vs the JD requirements.
Output:
1. TECH STRENGTHS
2. TECH GAPS
3. QUANTIFICATION OPPORTUNITIES
4. RECOMMENDED TECH BULLETS
Start: "🦉 ATHENA ANALYSIS:"`, 400, 0.6),

        callAgent('hermes', HERMES_SYSTEM, `${sharedContext}

Rewrite the language for maximum impact.
Output:
1. SUMMARY: A 3-sentence professional summary
2. REWRITTEN BULLETS: 4 STAR-method bullets
3. KEYWORDS TO MIRROR: 5 phrases from the JD
Start: "✉️ HERMES LANGUAGE:"`, 500, 0.7),

        callAgent('hephaestus', HEPHAESTUS_SYSTEM, `${sharedContext}

Do the ATS keyword audit.
Output:
1. MUST-HAVE KEYWORDS
2. PRESENT keywords
3. MISSING keywords and where to add them
4. FORMAT WARNINGS
Start: "🔨 HEPHAESTUS AUDIT:"`, 400, 0.5),
      ])

      send({ type: 'agent_message', agent: 'athena', content: athenaOutput })
      send({ type: 'agent_message', agent: 'hermes', content: hermesOutput })
      send({ type: 'agent_message', agent: 'hephaestus', content: hephaestusOutput })

      // ─────────────────────────────────────────────
      // PHASE 3: APOLLO — Template + Layout Decision
      // ─────────────────────────────────────────────
      send({ type: 'phase', phase: 3, label: 'Apollo choosing the best template...' })
      send({ type: 'agent_start', agent: 'apollo' })

      const apolloPrompt = `
ZEUS STRATEGY:
${zeusOutput}

ATHENA SAYS:
${athenaOutput}

HEPHAESTUS SAYS:
${hephaestusOutput}

TARGET ROLE: ${targetRole} at ${companyName}

Choose the best template:
- "white-business": Single column, no photo, maximum ATS safety
- "brown-auditor": Two column with sidebar, photo required
- "modern-minimalist-cv": Two column header + body, photo required
- "minimalist-modern": Clean single column, optional photo

Output ONLY JSON (no prose):
{
  "template": "white-business|brown-auditor|modern-minimalist-cv|minimalist-modern",
  "requiresPhoto": true|false,
  "sectionOrder": ["summary","experience","education","skills"],
  "reasoning": "one sentence why"
}`

      const apolloRaw = await callAgent('apollo', APOLLO_SYSTEM, apolloPrompt, 300, 0.4)
      let apolloDecision = { template: 'white-business', requiresPhoto: false, sectionOrder: ['summary','experience','education','skills'], reasoning: '' }
      try {
        const cleaned = apolloRaw.replace(/```json|```/g, '').trim()
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
        if (jsonMatch) apolloDecision = JSON.parse(jsonMatch[0])
      } catch { /* use defaults */ }

      send({ type: 'agent_message', agent: 'apollo', content: `☀️ APOLLO DECISION: Choosing "${apolloDecision.template}". ${apolloDecision.reasoning}` })
      send({ type: 'apollo_decision', ...apolloDecision })

      // ─────────────────────────────────────────────
      // PHASE 4: PROMETHEUS — Probability Score
      // ─────────────────────────────────────────────
      send({ type: 'phase', phase: 4, label: 'Prometheus calculating match probability...' })
      send({ type: 'agent_start', agent: 'prometheus' })

      const prometheusPrompt = `
ALL AGENT OUTPUTS:
ZEUS: ${zeusOutput}
ATHENA: ${athenaOutput}
HERMES: ${hermesOutput}
HEPHAESTUS: ${hephaestusOutput}
APOLLO CHOSE: ${apolloDecision.template}

TARGET ROLE: ${targetRole} at ${companyName}

Calculate the candidate's initial job match probability.
Output ONLY JSON:
{
  "score": 68,
  "breakdown": {
    "skills": 75,
    "experience": 60,
    "ats": 55,
    "culture": 70,
    "competition": 65
  },
  "topFix": "Add missing keywords",
  "estimatedAfterTony": 82
}`

      const prometheusRaw = await callAgent('prometheus', PROMETHEUS_SYSTEM, prometheusPrompt, 300, 0.3)
      let prometheusData = { score: 65, breakdown: { skills: 65, experience: 60, ats: 60, culture: 70, competition: 65 }, topFix: 'Optimize keywords', estimatedAfterTony: 78 }
      try {
        const cleaned = prometheusRaw.replace(/```json|```/g, '').trim()
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
        if (jsonMatch) prometheusData = JSON.parse(jsonMatch[0])
      } catch { /* use defaults */ }

      send({ type: 'agent_message', agent: 'prometheus', content: `🔥 PROMETHEUS SCORE: ${prometheusData.score}% initial match. Est. after Tony: ${prometheusData.estimatedAfterTony}%. Top fix: ${prometheusData.topFix}` })
      send({ type: 'probability', ...prometheusData })

      // ─────────────────────────────────────────────
      // PHASE 5: TONY — The Enforcer (up to 3 cycles)
      // ─────────────────────────────────────────────
      send({ type: 'phase', phase: 5, label: 'Tony enforcing quality...' })

      const tonyBrief = `
COMPLETE AGENT BRIEF:

ZEUS STRATEGY:
${zeusOutput}

ATHENA ANALYSIS:
${athenaOutput}

HERMES LANGUAGE:
${hermesOutput}

HEPHAESTUS AUDIT:
${hephaestusOutput}

APOLLO TEMPLATE: ${apolloDecision.template}
SECTION ORDER: ${apolloDecision.sectionOrder.join(' → ')}

PROMETHEUS SCORE: ${prometheusData.score}% → needs to reach 75%

CANDIDATE:
${JSON.stringify(candidateProfile, null, 2)}

JOB:
${jobDescription.slice(0, 2000)}

TARGET: ${targetRole} at ${companyName}`

      const MAX_TONY_CYCLES = 3
      const ATS_TARGET = 75
      let currentResume: any = null
      let finalAtsScore = prometheusData.score
      let tonyApproved = false

      for (let cycle = 1; cycle <= MAX_TONY_CYCLES && !tonyApproved; cycle++) {
        send({ type: 'tony_cycle_start', cycle, max: MAX_TONY_CYCLES })

        const tonyPrompt = `
${tonyBrief}

${cycle > 1 ? `PREVIOUS CYCLE (${cycle - 1}) RESUME:\n${JSON.stringify(currentResume, null, 2)}\nPREVIOUS ATS: ${finalAtsScore}% — NOT GOOD ENOUGH. Be MORE aggressive.` : 'Build the first draft now.'}

CYCLE: ${cycle}/${MAX_TONY_CYCLES}
${cycle === MAX_TONY_CYCLES ? 'FINAL CYCLE — ship the best version regardless of score.' : `ATS must reach ${ATS_TARGET}% or run again.`}

Output EXACTLY:
<tony_cycle>
  <critique>${cycle === 1 ? 'Initial assessment' : 'What was wrong'}</critique>
  <fixes_applied>Bullet list of changes</fixes_applied>
  <resume_data>{"firstName":"","lastName":"","jobTitle":"${targetRole}","phone":"","email":"","location":"","linkedin":"","summary":"","experience":[],"education":[],"skills":[],"chosenTemplate":"${apolloDecision.template}","requiresPhoto":${apolloDecision.requiresPhoto}}</resume_data>
  <ats_score>75</ats_score>
  <verdict>APPROVED|FORCE_REWRITE</verdict>
</tony_cycle>`

        const tonyRaw = await callAgent('tony', TONY_SYSTEM, tonyPrompt, 3000, 0.15)

        const critiqueMatch = tonyRaw.match(/<critique>([\s\S]*?)<\/critique>/)
        const fixesMatch = tonyRaw.match(/<fixes_applied>([\s\S]*?)<\/fixes_applied>/)
        const resumeMatch = tonyRaw.match(/<resume_data>([\s\S]*?)<\/resume_data>/)
        const atsMatch = tonyRaw.match(/<ats_score>(\d+)<\/ats_score>/)
        const verdictMatch = tonyRaw.match(/<verdict>(APPROVED|FORCE_REWRITE)<\/verdict>/)

        finalAtsScore = atsMatch ? parseInt(atsMatch[1]) : finalAtsScore

        if (resumeMatch) {
          try {
            const cleaned = resumeMatch[1].trim().replace(/```json|```/g, '').trim()
            currentResume = JSON.parse(cleaned)
          } catch { /* keep previous */ }
        }

        const verdict = verdictMatch?.[1] || (cycle === MAX_TONY_CYCLES ? 'APPROVED' : 'FORCE_REWRITE')
        if (verdict === 'APPROVED' || cycle === MAX_TONY_CYCLES) tonyApproved = true

        send({
          type: 'tony_cycle_complete',
          cycle,
          atsScore: finalAtsScore,
          verdict,
          critique: critiqueMatch?.[1]?.trim() || '',
          fixesApplied: fixesMatch?.[1]?.trim() || '',
          resumeData: currentResume,
          approved: verdict === 'APPROVED'
        })
      }

      send({ type: 'tony_done', finalAtsScore, approvedResume: currentResume })

      // ─────────────────────────────────────────────
      // PHASE 6: STEVE — PDF Architect
      // Steve's HTML NEVER goes to chat — only as pdf_ready event
      // ─────────────────────────────────────────────
      send({ type: 'phase', phase: 6, label: 'Steve generating PDF...' })
      send({ type: 'agent_start', agent: 'steve' })

      const stevePrompt = `
APPROVED RESUME:
${JSON.stringify(currentResume, null, 2)}

TEMPLATE: ${apolloDecision.template}
PHOTO REQUIRED: ${apolloDecision.requiresPhoto}
SECTION ORDER: ${apolloDecision.sectionOrder?.join(', ') || 'summary, experience, education, skills'}

TEMPLATE SPEC:
${getTemplateSpec(apolloDecision.template)}

Generate a complete, print-ready A4 HTML document for this resume.
Output ONLY the raw HTML between <pdf_html> tags. Nothing else. No explanation.
HTML MUST be valid standalone with all CSS inline.`

      const steveRaw = await callAgent('steve', STEVE_SYSTEM, stevePrompt, 5000, 0.05)
      const htmlMatch = steveRaw.match(/<pdf_html>([\s\S]*?)<\/pdf_html>/)
      const pdfHtml = htmlMatch?.[1]?.trim() || ''

      if (pdfHtml) {
        send({
          type: 'pdf_ready',
          html: pdfHtml,
          filename: `${currentResume?.firstName || 'Resume'}_${currentResume?.lastName || ''}_${targetRole.replace(/\s+/g, '_')}.pdf`,
          template: apolloDecision.template,
        })
        send({ type: 'agent_message', agent: 'steve', content: '📄 PDF generated and ready for download.' })
      } else {
        send({ type: 'agent_message', agent: 'steve', content: '⚠️ PDF generation encountered an issue.' })
        send({ type: 'pdf_fallback', resumeData: currentResume })
      }

      // ─────────────────────────────────────────────
      // PIPELINE COMPLETE
      // ─────────────────────────────────────────────
      send({
        type: 'pipeline_complete',
        finalAtsScore,
        probabilityScore: prometheusData.score,
        template: apolloDecision.template,
        resumeData: currentResume,
      })

    } catch (err) {
      send({ type: 'error', message: err instanceof Error ? err.message : 'Pipeline failed' })
    } finally {
      writer.write(encoder.encode('data: [DONE]\n\n'))
      writer.close()
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

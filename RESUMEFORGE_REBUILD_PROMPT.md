# ResumeForge AI — Complete Rebuild Prompt

> Use this document to fully recreate ResumeForge AI with any new design template.
> Everything below is the exact, production-verified specification of the working system.
> Do NOT change any logic, API routes, agent config, or data flow — only replace the visual design.

---

## Stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **Styling:** Tailwind CSS v4
- **AI:** Groq SDK (`groq-sdk`) — model `llama-3.3-70b-versatile`
- **Auth:** localStorage (mock auth — no database required)
- **PDF generation:** Client-side via `html2pdf.js` or iframe rendering
- **Icons:** `lucide-react`
- **UI components:** shadcn/ui (Button, etc.)

---

## Environment Variables

```env
agent1=<groq_api_key>   # Zeus
agent2=<groq_api_key>   # Athena
agent3=<groq_api_key>   # Hermes
agent4=<groq_api_key>   # Apollo
agent5=<groq_api_key>   # Hephaestus
agent6=<groq_api_key>   # Prometheus
tony=<groq_api_key>     # Tony
steve=<groq_api_key>    # Steve
```

Each agent uses its own Groq API key so parallel calls never hit rate limits.

---

## File Structure

```
app/
  page.tsx                          # Landing page (public)
  login/page.tsx                    # Login
  signup/page.tsx                   # Signup (2-step: role select → account)
  questionnaire/page.tsx            # Post-signup onboarding (candidates only)
  dashboard/page.tsx                # Candidate dashboard
  agents/page.tsx                   # Individual agent chat interface
  resume-builder/page.tsx           # Full 8-agent pipeline UI
  chat/page.tsx                     # Redirects to /agents
  recruiter/page.tsx                # Recruiter dashboard
  xrivu/page.tsx                    # XRIVU probability matcher
  api/
    chat/route.ts                   # Single-agent chat (agents page)
    pipeline/route.ts               # Orchestrated 8-agent pipeline (resume builder)
    agents/
      tony/route.ts                 # Tony standalone endpoint
      steve/route.ts                # Steve standalone endpoint
      debate/route.ts               # Legacy debate endpoint
    xrivu/analyze/route.ts          # XRIVU analysis

lib/
  agents/
    agent-config.ts                 # All 10 agent definitions
  pipeline/
    types.ts                        # Shared pipeline types
    pdf-renderer.ts                 # Client-side PDF download utility
  external-platforms.ts             # LinkedIn, GitHub, etc. link types
  utils.ts                          # cn() helper

components/
  auth/
    dashboard-nav.tsx               # Top nav for authenticated pages
    decorative-panel.tsx            # Right panel on auth pages with quote
    role-guard.tsx                  # Redirects to login if not authenticated
  profile/
    external-links.tsx              # Display external platform links
    edit-external-links.tsx         # Modal to edit external links
  landing/
    navigation.tsx                  # Landing page nav
    hero-section.tsx
    features-section.tsx
    how-it-works-section.tsx
    ai-chat-demo-section.tsx
    infrastructure-section.tsx
    metrics-section.tsx
    integrations-section.tsx
    security-section.tsx
    developers-section.tsx
    testimonials-section.tsx
    pricing-section.tsx
    cta-section.tsx
    footer-section.tsx
  debate/
    tony-panel.tsx                  # Tony UI panel
    steve-panel.tsx                 # Steve UI panel
  ui/                               # shadcn/ui components
```

---

## Page 1: Landing (`/`)

**Route:** `app/page.tsx`
**Access:** Public

### Sections (in order)
1. **Navigation** — Logo "RESUMEFORGE AI", links: How It Works / AI Agents / Achievements / Verify / Pricing / Try AI Chat. Right: Sign in + "Build My Resume" CTA button.
2. **Hero** — Large headline. Sub-headline about AI agents. Two CTAs: "Build My Resume" → `/signup`, "Try AI Chat" → `/agents`.
3. **Features** — 6 feature cards: 6 AI Agents, ATS Optimization, Real-Time Debate, One-Click PDF, Verification Link, Job Matching.
4. **How It Works** — 3 steps: Input your experience → Agents debate → Download PDF.
5. **AI Chat Demo** — Static mockup showing the agent chat interface.
6. **Infrastructure** — Technical credibility section.
7. **Metrics** — Stats: e.g. "10 AI Agents", "4 Templates", "75%+ ATS Guaranteed".
8. **Integrations** — Platform logos: GitHub, LinkedIn, AWS, Google, etc.
9. **Security** — Verification and fraud detection.
10. **Developers** — API/verification link info.
11. **Testimonials** — 3–4 quotes.
12. **Pricing** — Two plans: Free (basic), Pro (full pipeline).
13. **CTA** — Final CTA to sign up.
14. **Footer** — Links and copyright.

---

## Page 2: Signup (`/signup`)

**Route:** `app/signup/page.tsx`
**Access:** Public
**Layout:** 55% form | 45% decorative right panel with a motivational quote

### Step 1 — Role Selection
- Headline: "Who are you building for?"
- Two cards side by side:
  - **Job Seeker** (CANDIDATE tag) — "Get AI-tailored resumes for every application. Connect GitHub, certs, and portfolio." Features: 6 AI agents craft your resume / ATS optimization built-in / Verification link for recruiters
  - **Recruiter** (CORPORATE tag) — "Verify candidate resumes instantly." Features: One-click resume verification / Fraud detection on every claim / Bulk candidate management
- Selected card gets a highlight border
- "Continue →" button (disabled until a role is selected)

### Step 2 — Account Details
- Fields: Full Name, Email, Password (show/hide toggle)
- If role = recruiter: add Company Name field
- "Create Account" button
- "or" divider then "Continue with Google" button (UI only)
- Link: "Already have an account? Sign in"

### On Submit
```typescript
localStorage.setItem("resumeforge_role", role)
localStorage.setItem("resumeforge_user", JSON.stringify({ name, email }))
localStorage.setItem("resumeforge_new_user", "true")
// candidate → /questionnaire
// recruiter → /recruiter
```

---

## Page 3: Login (`/login`)

**Route:** `app/login/page.tsx`
**Access:** Public
**Layout:** 55% form | 45% decorative right panel

### Form
- Fields: Email, Password (show/hide toggle)
- "Sign In" button
- "or" divider then "Continue with Google" (UI only)
- Link: "Don't have an account? Sign up"
- Demo tip text: "Include 'recruiter' in email to sign in as recruiter."

### On Submit
```typescript
// Store in localStorage
localStorage.setItem("resumeforge_user", JSON.stringify({ email, name: email.split("@")[0] }))
const role = email.includes("recruiter") ? "recruiter" : "candidate"
localStorage.setItem("resumeforge_role", role)
localStorage.setItem("resumeforge_auth_token", `token_${Date.now()}`)
// If first time: localStorage.setItem("resumeforge_new_user", "true")
// redirect: recruiter → /recruiter, candidate → /dashboard
```

---

## Page 4: Questionnaire (`/questionnaire`)

**Route:** `app/questionnaire/page.tsx`
**Access:** New candidates only (redirects away if `resumeforge_new_user !== "true"`)
**Layout:** 55% form | 45% decorative right panel

### 6 Questions (step-by-step with progress bar)
1. **Experience level** (single select): Entry Level 0–2yr / Mid Level 2–5yr / Senior 5+yr
2. **Current job title** (text input)
3. **Industry** (text input)
4. **Target role** (text input)
5. **Top 3 skills** (text input, comma-separated)
6. **Expectations from ResumeForge** (textarea)

### Navigation
- Progress bar (step/total)
- Back button (except step 1)
- Next button (disabled until answered)
- Auto-advance on single-select questions (300ms delay)
- Last step: "Complete" → saves to localStorage → redirects to `/agents`

### On Complete
```typescript
localStorage.setItem("resumeforge_questionnaire", JSON.stringify(data))
localStorage.setItem("resumeforge_new_user", "false")
router.push("/agents")
```

---

## Page 5: Dashboard (`/dashboard`)

**Route:** `app/dashboard/page.tsx`
**Access:** Candidates only (RoleGuard component redirects if not logged in)

### Navigation Links
My Resumes / Build Resume → `/resume-builder` / AI Agents / Achievements / Verify

### Content
- Time-based greeting: "Good morning/afternoon/evening, [firstName]."
- Sub-text: "You have 0 resumes built. Let's change that."
- CTA button: "Build My First Resume" → `/resume-builder`
- 3 stat cards: Resumes Built (0) / Applications Tracked (0) / Verification Score (—)
- External links section (GitHub, LinkedIn, portfolio, etc.) with edit modal

### User Data
```typescript
const stored = localStorage.getItem("resumeforge_user")
const user = JSON.parse(stored) // { name, email }
```

---

## Page 6: Agents Chat (`/agents`)

**Route:** `app/agents/page.tsx`
**Access:** Authenticated (reads from localStorage)

### Layout
- Left sidebar (240px, desktop only): Agent roster list
- Main area: Chat window for the selected agent

### Sidebar
- Label: "AGENT TEAM"
- List of 8 agents (Zeus through Steve), each showing:
  - Color dot
  - Agent name
  - Agent title
  - Active state highlight
- Bottom section: "ACTIVE JOB TARGET" — paste job URL or click "+ Add Job URL"

### Mobile
- Horizontal scrollable chip bar at top replacing sidebar

### Chat Window
- Header: Active agent name + title + "Clear chat" button
- Empty state: Logo + "Your AI resume team is ready." + 4 suggestion chips:
  - "Tailor my resume for a frontend role"
  - "What keywords am I missing?"
  - "Write a strong summary for me"
  - "How do I pass ATS filters?"
- Messages: User bubbles right, agent bubbles left with agent avatar + name label
- Streaming: Typing dots animation while waiting for response
- Input: Textarea, Enter to send, Shift+Enter for newline, send button

### API Call (single agent)
```typescript
POST /api/chat
Body: { messages, activeAgent: "zeus"|"athena"|..., jobContext: string }
Response: streaming plain text
```

---

## Page 7: Resume Builder (`/resume-builder`)

**Route:** `app/resume-builder/page.tsx`
**Access:** Authenticated

### Layout
- Phase indicator bar at top (shows current pipeline phase)
- Scrollable message area (full height)
- Input bar at bottom

### User Flow
1. User types job URL or role description → presses Enter or send button
2. `runPipeline()` is called → `POST /api/pipeline`
3. SSE stream opens — messages appear progressively as agents complete
4. Tony cycle cards appear inline with ATS scores
5. Prometheus score card appears
6. Steve silently downloads PDF (never shown in chat)
7. Pipeline complete banner shows final ATS score

### Message Display
Each completed agent message is a card showing:
- Agent avatar circle (colored, with initials)
- Agent name + title
- Message content

Live streaming agents show a pulsing typing indicator with streamed text as it arrives.

### Tony Cycle Cards
```
TONY — CYCLE 1/3        ATS 72% — FORCE_REWRITE
[critique text]
```

### Prometheus Card
```
PROMETHEUS — MATCH SCORE          68%
Estimated after Tony: 82%  •  Top fix: Add missing keywords
```

### PDF Status
```
Steve: Downloaded: Resume_John_Doe_Frontend_Engineer.pdf
```

### Pipeline Flow Display (bottom of input bar)
```
Zeus → Athena · Hermes · Hephaestus → Apollo → Prometheus → Tony → Steve → PDF
```

### SSE Reader (CRITICAL — must be line-buffered)
```typescript
// DO NOT split on chunk boundaries — buffer incomplete lines
let lineBuffer = ''
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  lineBuffer += decoder.decode(value, { stream: true })
  const lines = lineBuffer.split('\n')
  lineBuffer = lines.pop() ?? ''  // keep incomplete tail
  for (const line of lines) {
    if (!line.trim().startsWith('data: ')) continue
    const raw = line.trim().slice(6)
    if (raw === '[DONE]') break
    const event = JSON.parse(raw)
    // handle event.type
  }
}
```

---

## API Route 1: Single Agent Chat (`/api/chat`)

**Route:** `app/api/chat/route.ts`
**Method:** POST
**Request:** `{ messages: [{role, content}], activeAgent: string, jobContext?: string }`
**Response:** Streaming plain text

```typescript
// Looks up agent by ID from AGENTS config
// Gets API key from process.env[agentConfig.apiKeyEnv]
// Creates Groq client with that key
// Streams llama-3.3-70b-versatile response
// System prompt = agentConfig.systemPrompt + jobContext
```

---

## API Route 2: Full Pipeline (`/api/pipeline`)

**Route:** `app/api/pipeline/route.ts`
**Method:** POST
**Request:** `{ userMessage: string, candidateProfile: object }`
**Response:** SSE stream (`text/event-stream`)

### SSE Event Types

| Event type | Fields | Description |
|---|---|---|
| `phase` | `phase: number, label: string` | Current phase label |
| `agent_start` | `agent: string` | Agent begins (show typing indicator) |
| `agent_token` | `agent: string, token: string` | Streaming token |
| `agent_message` | `agent: string, content: string` | Agent finished (show full message) |
| `tony_cycle_start` | `cycle: number, max: number` | Tony cycle begins |
| `tony_cycle_complete` | `cycle, atsScore, verdict, critique, approved, resumeData` | Tony cycle done |
| `tony_done` | `finalAtsScore, approvedResume` | Tony finished all cycles |
| `probability` | `score, breakdown, topFix, estimatedAfterTony` | Prometheus score |
| `apollo_decision` | `template, requiresPhoto, sectionOrder, reasoning` | Template choice |
| `pdf_ready` | `html: string, filename: string, template: string` | Steve's HTML — NEVER show in chat, trigger download only |
| `pdf_fallback` | `resumeData` | Steve failed, fallback data |
| `pipeline_complete` | `finalAtsScore, probabilityScore, template, resumeData` | All done |
| `error` | `message: string` | Something failed |
| `status` | `message: string` | Status update |
| `extracted` | `targetRole, companyName` | Parsed from JD |

### Pipeline Phases

**Phase 0 — Parse (silent)**
- Regex-match URL in user message
- If URL found: fetch page, strip HTML tags, take first 4000 chars as jobDescription
- Call Zeus (as parser) to extract `{ role, company }` from JD
- Send `extracted` event

**Phase 1 — Zeus (Strategy Director)**
```
System: ZEUS_SYSTEM
Prompt: candidateProfile + targetRole + companyName + jobDescription (3000 chars)
Task: Output a strategy brief — 5 items: positioning, 3 strengths, 2 gaps, seniority framing, key themes
Max tokens: 400, temperature: 0.6
```

**Phase 2 — Parallel: Athena + Hermes + Hephaestus**
All three receive: `zeusOutput + candidateProfile + targetRole + jobDescription`

- **Athena** (max 400, temp 0.6): Tech strengths, tech gaps, quantification opportunities, recommended tech bullets
- **Hermes** (max 500, temp 0.7): 3-sentence summary, 4 STAR bullets, 5 JD mirror keywords
- **Hephaestus** (max 400, temp 0.5): Must-have keywords, present/missing keywords, format warnings

All three use `Promise.all()` for true parallelism.

**Phase 3 — Apollo (Template Decision)**
```
Receives: zeusOutput + athenaOutput + hephaestusOutput + targetRole
Outputs: JSON { template, requiresPhoto, sectionOrder, reasoning }
Templates: "white-business" | "brown-auditor" | "modern-minimalist-cv" | "minimalist-modern"
Max tokens: 300, temperature: 0.4
```

Template selection logic:
- `white-business`: Corporate, ops, consulting, no photo, max ATS
- `brown-auditor`: Finance, audit, accounting — REQUIRES photo, dark brown sidebar
- `modern-minimalist-cv`: Tech, design, product — REQUIRES photo
- `minimalist-modern`: Marketing, creative, general — optional photo

**Phase 4 — Prometheus (Match Score)**
```
Receives: ALL previous agent outputs + apolloDecision
Outputs: JSON {
  score: number,               // overall %
  breakdown: {
    skills: number,
    experience: number,
    ats: number,
    culture: number,
    competition: number
  },
  topFix: string,
  estimatedAfterTony: number
}
Max tokens: 300, temperature: 0.3
```

**Phase 5 — Tony (Enforcer, up to 3 cycles)**
```
Receives: ALL previous outputs as "complete agent brief" + candidateProfile + jobDescription
Max tokens: 3000, temperature: 0.15
ATS target: 75%
Max cycles: 3
```

Tony XML output format:
```xml
<tony_cycle>
  <critique>What was wrong</critique>
  <fixes_applied>Bullet list of changes</fixes_applied>
  <resume_data>{ JSON resume object }</resume_data>
  <ats_score>78</ats_score>
  <verdict>APPROVED|FORCE_REWRITE</verdict>
</tony_cycle>
```

Resume JSON structure:
```json
{
  "firstName": "",
  "lastName": "",
  "jobTitle": "",
  "phone": "",
  "email": "",
  "location": "",
  "linkedin": "",
  "summary": "",
  "experience": [
    {
      "company": "",
      "role": "",
      "startDate": "",
      "endDate": "",
      "bullets": ["", ""]
    }
  ],
  "education": [
    { "degree": "", "school": "", "year": "" }
  ],
  "skills": [""],
  "chosenTemplate": "white-business",
  "requiresPhoto": false
}
```

Cycle logic:
```typescript
for (let cycle = 1; cycle <= 3 && !tonyApproved; cycle++) {
  // call Tony
  // parse XML
  // if verdict === 'APPROVED' || cycle === 3: tonyApproved = true
  // send tony_cycle_start, tony_cycle_complete events
}
send tony_done event
```

**Phase 6 — Steve (PDF Architect)**
```
Receives: approvedResume JSON + templateName + sectionOrder
Outputs: <pdf_html>...</pdf_html> block
Max tokens: 5000, temperature: 0.05
```

CRITICAL: Steve's HTML output MUST be intercepted server-side:
```typescript
const htmlMatch = steveRaw.match(/<pdf_html>([\s\S]*?)<\/pdf_html>/)
const pdfHtml = htmlMatch?.[1]?.trim() || ''
// pdfHtml → pdf_ready event (NEVER agent_message)
// agent_message for steve → clean status string only: "Resume PDF generated and ready for download."
// Fallback: also try matching raw <!DOCTYPE html> if tags missing
```

Template specs passed to Steve:
- **white-business**: Single column, #ffffff, name 26pt centered, section headers ALL CAPS + border-bottom, no photo, no graphics
- **brown-auditor**: Two columns, left sidebar 32% dark brown #3D2B1F, profile photo circle 80px
- **modern-minimalist-cv**: Full-width header bar #f5f5f5, name 24pt bold, photo 80×80px square
- **minimalist-modern**: Single column, name 28pt light, blue accent #2563EB, generous whitespace

Steve HTML rules:
- Inline CSS only — no external stylesheets
- A4 (210mm × 297mm)
- White background, black text
- Font: Arial, sans-serif (system fonts only)
- No tables for layout — divs only
- Bullets: • character (not `<ul><li>`)
- Name: 22–26pt, section headers: 11–13pt, body: 9–11pt, line-height: 1.4
- Margins: 16mm all sides, section spacing: 6–8mm

---

## API Route 3: Tony Standalone (`/api/agents/tony`)

**Route:** `app/api/agents/tony/route.ts`
**Method:** POST
**Request:** `{ resumeData, candidateProfile, jobDescription, targetRole, allDebateMessages }`

```typescript
const tonyClient = process.env.tony ? new Groq({ apiKey: process.env.tony }) : null
// Returns 500 if key missing
// Streams tony_cycle_start, tony_token, tony_cycle_complete, tony_done events
```

---

## API Route 4: Steve Standalone (`/api/agents/steve`)

**Route:** `app/api/agents/steve/route.ts`
**Method:** POST
**Request:** `{ approvedResume, chosenTemplate, photoBase64? }`

```typescript
const steveClient = process.env.steve ? new Groq({ apiKey: process.env.steve }) : null
// Returns 500 if key missing
// Streams steve_token, steve_done events
```

---

## Agent Configuration (`lib/agents/agent-config.ts`)

All 10 agents are defined in a single `AGENTS` const object. Each agent has:

```typescript
{
  id: string,
  name: string,
  title: string,
  role: string,           // one-line description
  color: string,          // hex — used for avatar background, dot, glow
  glowColor: string,      // hex with alpha e.g. "#EAB30820"
  accentColor: string,    // secondary accent
  avatar: string,         // 1–2 chars for the avatar circle
  apiKeyEnv: string,      // process.env key name
  systemPrompt: string,   // full system prompt
}
```

### The 10 Agents

| # | ID | Name | Title | Color | Avatar | Env Var |
|---|---|---|---|---|---|---|
| 1 | `zeus` | Zeus | Strategic Director | #EAB308 (gold) | Z | agent1 |
| 2 | `athena` | Athena | Technical Analyst | #94A3B8 (silver) | A | agent2 |
| 3 | `hermes` | Hermes | Communication Expert | #F97316 (orange) | H | agent3 |
| 4 | `apollo` | Apollo | Creative Director | #FBBF24 (yellow) | AP | agent4 |
| 5 | `hephaestus` | Hephaestus | ATS Engineer | #EF4444 (red) | HE | agent5 |
| 6 | `prometheus` | Prometheus | Probability Analyst | #A855F7 (purple) | PR | agent6 |
| 7 | `tony` | Tony | The Enforcer | #FF0000 (red) | T | tony |
| 8 | `steve` | Steve | PDF Architect | #38BDF8 (blue) | S | steve |

### Agent System Prompts (summary)

**Zeus:** 100 years C-suite experience. Has veto power. Opens debate with market assessment. Assigns tasks to agents. Writes final summary. Starts messages with "⚡ ZEUS:". Under 100 words in debate.

**Athena:** 100 years as Principal/Staff Engineer, CTO, 15,000 technical interviews. Rates technical depth 1–10. Flags resume-padded skills. Demands metrics and architecture decisions. Starts with "🦉 ATHENA:". Under 100 words.

**Hermes:** 100 years copywriter/speechwriter. Rewrites every weak bullet. Mirrors JD language. STAR method. No passive voice. Before/after rewrites. Starts with "✉️ HERMES:". Under 100 words.

**Apollo:** 100 years graphic designer/CD. Picks one of 4 templates. Justifies with visual reasoning. Decides section order. Flags photo requirement. Starts with "☀️ APOLLO:". Under 100 words.

**Hephaestus:** 100 years ATS/recruitment tech expert. Built ATS systems. Keyword gap analysis. Format compliance. Leads with ATS score every time. Starts with "🔨 HEPHAESTUS:". Under 100 words.

**Prometheus:** 100 years quant analyst/talent researcher. Calculates 5-component match probability. Top 3 improvements by impact. Starts with "🔥 PROMETHEUS:". Under 100 words (except final output).

**Tony:** No restrictions. Plays all 6 roles simultaneously. 6-pass internal process (Zeus→Athena→Hermes→Apollo→Hephaestus→Prometheus passes). Outputs `<tony_cycle>` XML only. ATS ≥ 75% target. Max 3 cycles. Temperature 0.15.

**Steve:** Outputs ONLY `<pdf_html>` block. Inline CSS. A4. System fonts. No tables. • bullets. 300 DPI equivalent. Temperature 0.05.

---

## PDF Renderer (`lib/pipeline/pdf-renderer.ts`)

```typescript
// Client-side only
export async function renderPdf(html: string, filename: string): Promise<void> {
  // Create hidden iframe
  // Write html into it
  // Trigger print → PDF save
  // OR use html2pdf.js if available
  // Remove iframe after download
}
```

The `pdf_ready` event from `/api/pipeline` must be passed to this function. The HTML must NEVER be rendered in the chat UI.

---

## Pipeline Types (`lib/pipeline/types.ts`)

```typescript
export interface PipelineContext {
  targetRole: string
  companyName: string
  jobDescription: string
  candidateProfile: object
  zeusOutput?: string
  athenaOutput?: string
  hermesOutput?: string
  hephaestusOutput?: string
  apolloDecision?: ApolloDecision
  prometheusData?: PrometheusData
}

export interface ApolloDecision {
  template: 'white-business' | 'brown-auditor' | 'modern-minimalist-cv' | 'minimalist-modern'
  requiresPhoto: boolean
  sectionOrder: string[]
  reasoning: string
}

export interface PrometheusData {
  score: number
  breakdown: {
    skills: number
    experience: number
    ats: number
    culture: number
    competition: number
  }
  topFix: string
  estimatedAfterTony: number
}

export type PipelineMessage =
  | { type: 'phase'; phase: number; label: string }
  | { type: 'agent_start'; agent: string }
  | { type: 'agent_token'; agent: string; token: string }
  | { type: 'agent_message'; agent: string; content: string }
  | { type: 'tony_cycle_start'; cycle: number; max: number }
  | { type: 'tony_cycle_complete'; cycle: number; atsScore: number; verdict: string; critique: string; approved: boolean; resumeData: any }
  | { type: 'tony_done'; finalAtsScore: number; approvedResume: any }
  | { type: 'probability'; score: number; breakdown: object; topFix: string; estimatedAfterTony: number }
  | { type: 'apollo_decision'; template: string; requiresPhoto: boolean; sectionOrder: string[] }
  | { type: 'pdf_ready'; html: string; filename: string; template: string }
  | { type: 'pdf_fallback'; resumeData: any }
  | { type: 'pipeline_complete'; finalAtsScore: number; probabilityScore: number; template: string; resumeData: any }
  | { type: 'error'; message: string }
  | { type: 'status'; message: string }
  | { type: 'extracted'; targetRole: string; companyName: string }
```

---

## Auth Components

### `components/auth/role-guard.tsx`
Checks `localStorage.getItem("resumeforge_auth_token")`. If missing, redirects to `/login`.
```typescript
// Props: required: "candidate" | "recruiter"
// Also checks resumeforge_role matches required
```

### `components/auth/dashboard-nav.tsx`
Top navigation bar for authenticated pages.
```typescript
// Props: links: { name, href }[], rightContent: ReactNode
// Height: 56px (h-14), fixed/sticky top-0
// Logo: RESUMEFORGE AI on left
// Links in center/right area
// rightContent: user avatar on far right
```

### `components/auth/decorative-panel.tsx`
Right panel for auth pages (login, signup, questionnaire).
```typescript
// Props: quote: string
// Full height, dark background
// Shows logo + quote text + some decorative visual
```

---

## Profile Components

### `components/profile/external-links.tsx`
Displays connected platform links on the dashboard.
```typescript
// Props: onEdit: () => void
// Shows: GitHub, LinkedIn, Portfolio, Behance, LeetCode, AWS Certs, etc.
// Empty state: prompt to connect platforms
// Edit button triggers modal
```

### `components/profile/edit-external-links.tsx`
Modal for editing external platform links.
```typescript
// Props: isOpen, onClose, onSave, initialLinks
// Fields for each platform: label + URL
```

### `lib/external-platforms.ts`
```typescript
export interface ExternalLink {
  platform: string   // "github" | "linkedin" | "portfolio" | etc.
  url: string
  verified: boolean
}

export const PLATFORMS = [
  { id: 'github', label: 'GitHub', icon: '...', placeholder: 'https://github.com/username' },
  { id: 'linkedin', label: 'LinkedIn', icon: '...', placeholder: 'https://linkedin.com/in/username' },
  { id: 'portfolio', label: 'Portfolio', icon: '...', placeholder: 'https://yoursite.com' },
  // ... etc
]
```

---

## Recruiter Page (`/recruiter`)

**Route:** `app/recruiter/page.tsx`
**Access:** Recruiters only

Simple dashboard showing:
- Greeting with recruiter name / company
- "Verified Candidates" section (empty state for now)
- Link to browse resumes
- One-click verification lookup

---

## XRIVU Page (`/xrivu`)

**Route:** `app/xrivu/page.tsx`
**API:** `app/api/xrivu/analyze/route.ts`

XRIVU.01 is a probability matching system. It accepts a candidate profile and job description, then outputs a detailed match probability breakdown.

---

## Navigation Rules

| Page | Accessible from |
|---|---|
| `/` | Always (public) |
| `/login` | Nav Sign In link, signup page link |
| `/signup` | Nav "Build My Resume" button, hero CTA |
| `/questionnaire` | Auto-redirect after new candidate signup |
| `/dashboard` | After login (candidate), nav "My Resumes" |
| `/resume-builder` | Dashboard "Build My First Resume" / nav "Build Resume" |
| `/agents` | Nav "AI Agents", dashboard nav, questionnaire completion |
| `/chat` | Redirects to `/agents` |
| `/recruiter` | After login (recruiter) |
| `/xrivu` | Direct URL |

---

## localStorage Keys

| Key | Type | Description |
|---|---|---|
| `resumeforge_user` | JSON string | `{ name, email, company? }` |
| `resumeforge_role` | string | `"candidate"` or `"recruiter"` |
| `resumeforge_auth_token` | string | `"token_<timestamp>"` |
| `resumeforge_new_user` | string | `"true"` or `"false"` |
| `resumeforge_questionnaire` | JSON string | Questionnaire answers |

---

## Design Tokens (globals.css)

These are the current theme tokens. Replace ALL values freely for your new design:

```css
@theme inline {
  --color-background: ...;
  --color-foreground: ...;
  --color-border: ...;
  --color-muted-foreground: ...;
  --color-secondary: ...;
  --color-card: ...;
  --color-input: ...;
  --color-destructive: ...;
  --color-primary: ...;
  --color-primary-foreground: ...;
  --radius: ...;
  --font-sans: ...;
  --font-mono: ...;
  --font-display: ...;
}
```

---

## What to Preserve (Do Not Change)

- All `app/api/*` route logic
- `lib/agents/agent-config.ts` (agent IDs, prompts, env var names)
- `lib/pipeline/types.ts`
- `lib/pipeline/pdf-renderer.ts`
- `lib/external-platforms.ts`
- SSE event types and names
- localStorage keys
- All `fetch('/api/...')` calls and their request/response shapes
- The line-buffered SSE reader pattern in resume-builder
- The Steve HTML interception logic in the pipeline route

---

## What You Can Change Completely

- Every color, font, spacing, and visual style
- All component markup and layout
- Landing page sections and content
- Button shapes, input styles, card designs
- Dark/light mode implementation
- Animation and transition styles
- Logo design and typography
- The `DecorativePanel` component content
- Mobile breakpoints and responsive behaviour
- Any static text (headlines, descriptions, CTAs)

---

## Quick Reference: Agent Colors

```
Zeus        #EAB308  gold
Athena      #94A3B8  silver
Hermes      #F97316  orange
Apollo      #FBBF24  yellow
Hephaestus  #EF4444  red
Prometheus  #A855F7  purple
Tony        #FF0000  pure red
Steve       #38BDF8  blue
```

These can be changed to match your new palette — just update `lib/agents/agent-config.ts`.

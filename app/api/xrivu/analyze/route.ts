import { Anthropic } from '@anthropic-ai/sdk'
import { CompanyProfile, JobSeekerProfile, XRIVUAnalysis } from '@/lib/xrivu/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(req: Request) {
  try {
    const { companyProfile, jobSeekerProfile } = await req.json()

    if (!companyProfile || !jobSeekerProfile) {
      return Response.json(
        { error: 'Missing company or job seeker profile' },
        { status: 400 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      )
    }

    // Build the analysis prompt for Claude
    const analysisPrompt = `Analyze the compatibility between this company's job requirements and this candidate's profile using the XRIVU.01 Probability System.

COMPANY REQUIREMENTS:
- Position: ${companyProfile.jobTitle} at ${companyProfile.companyName}
- Industry: ${companyProfile.industry}
- Required Skills (importance weights in parentheses):
  - Technical Depth: ${companyProfile.radarScores.technicalDepth}/100 (weight: ${companyProfile.importanceWeights.technicalDepth}%)
  - Communication Skills: ${companyProfile.radarScores.communicationSkills}/100 (weight: ${companyProfile.importanceWeights.communicationSkills}%)
  - Leadership Ability: ${companyProfile.radarScores.leadershipAbility}/100 (weight: ${companyProfile.importanceWeights.leadershipAbility}%)
  - Innovation Mindset: ${companyProfile.radarScores.innovationMindset}/100 (weight: ${companyProfile.importanceWeights.innovationMindset}%)
  - Team Collaboration: ${companyProfile.radarScores.teamCollaboration}/100 (weight: ${companyProfile.importanceWeights.teamCollaboration}%)
  - Industry Experience: ${companyProfile.radarScores.industryExperience}/100 (weight: ${companyProfile.importanceWeights.industryExperience}%)

CANDIDATE PROFILE:
- Name: ${jobSeekerProfile.name}
- Current Role: ${jobSeekerProfile.currentRole}
- Years of Experience: ${jobSeekerProfile.yearsExperience}
- Skills (self-assessed):
  - Technical Depth: ${jobSeekerProfile.radarScores.technicalDepth}/100
  - Communication Skills: ${jobSeekerProfile.radarScores.communicationSkills}/100
  - Leadership Ability: ${jobSeekerProfile.radarScores.leadershipAbility}/100
  - Innovation Mindset: ${jobSeekerProfile.radarScores.innovationMindset}/100
  - Team Collaboration: ${jobSeekerProfile.radarScores.teamCollaboration}/100
  - Industry Experience: ${jobSeekerProfile.radarScores.industryExperience}/100
- Certifications: ${jobSeekerProfile.certifications.join(', ') || 'None listed'}
- Key Achievements: ${jobSeekerProfile.achievements.join(', ') || 'None listed'}

Perform a weighted probability analysis:
1. Calculate gap for each dimension: (company requirement - candidate capability) × importance weight
2. Calculate overall probability: 100 - (total weighted gap × factor)
3. Identify top 3 strength areas where candidate exceeds requirements
4. Identify top 3 improvement areas by impact
5. Estimate timeline to full readiness

Respond in JSON format only:
{
  "overallProbability": <number 0-100>,
  "skillGaps": [
    {
      "dimension": "<name>",
      "companyRequirement": <number>,
      "seekerCapability": <number>,
      "gap": <number>,
      "importance": <number>
    }
  ],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"],
  "strengthAreas": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvementAreas": ["<area 1>", "<area 2>", "<area 3>"],
  "timelineToReady": "<timeline>"
}`

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ]
    })

    // Extract JSON from response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    
    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from Claude response')
    }

    const analysis: XRIVUAnalysis = JSON.parse(jsonMatch[0])

    return Response.json(analysis)
  } catch (error) {
    console.error('[XRIVU] Analysis error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}

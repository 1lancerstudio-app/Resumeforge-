export type SharedContext = {
  // User inputs
  userRequest: string
  jobUrl?: string
  jobDescription: string
  targetRole: string
  companyName: string
  candidateProfile: any

  // Agent outputs (populated as pipeline runs)
  zeusStrategy?: string
  athenaAnalysis?: string
  hermesLanguage?: string
  hephaestusKeywords?: string
  apolloTemplate?: string
  prometheusScore?: number
  prometheusBreakdown?: any

  // Tony enforcement
  tonyCycles?: TonyCycle[]
  tonyApprovedResume?: ResumeData
  finalAtsScore?: number

  // Steve output
  stevePdfHtml?: string
}

export type TonyCycle = {
  cycle: number
  atsScore: number
  critique: string
  fixesApplied: string
  resumeData: ResumeData
  verdict: 'APPROVED' | 'FORCE_REWRITE'
}

export type ResumeData = {
  firstName: string
  lastName: string
  jobTitle: string
  phone: string
  email: string
  location: string
  linkedin: string
  summary: string
  experience: Array<{ role: string; company: string; dates: string; bullets: string[] }>
  education: Array<{ degree: string; school: string; dates: string }>
  skills: string[]
  achievements?: string[]
  certifications?: string[]
  chosenTemplate: string
  requiresPhoto: boolean
  sectionOrder?: string[]
}

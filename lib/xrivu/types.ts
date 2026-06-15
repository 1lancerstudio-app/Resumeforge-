export interface RadarDimension {
  name: string
  label: string
  description: string
  icon: string
}

export interface CompanyProfile {
  id: string
  companyName: string
  jobTitle: string
  industry: string
  radarScores: {
    technicalDepth: number       // 0-100
    communicationSkills: number  // 0-100
    leadershipAbility: number    // 0-100
    innovationMindset: number    // 0-100
    teamCollaboration: number    // 0-100
    industryExperience: number   // 0-100
  }
  importanceWeights: {
    technicalDepth: number       // 0-100 importance weight
    communicationSkills: number
    leadershipAbility: number
    innovationMindset: number
    teamCollaboration: number
    industryExperience: number
  }
  priorityRanking: string[]      // ["skill1", "skill2", ...] ordered by importance
  createdAt: Date
}

export interface JobSeekerProfile {
  id: string
  name: string
  currentRole: string
  yearsExperience: number
  radarScores: {
    technicalDepth: number
    communicationSkills: number
    leadershipAbility: number
    innovationMindset: number
    teamCollaboration: number
    industryExperience: number
  }
  certifications: string[]
  achievements: string[]
  createdAt: Date
}

export interface XRIVUAnalysis {
  overallProbability: number     // 0-100
  skillGaps: {
    dimension: string
    companyRequirement: number
    seekerCapability: number
    gap: number
    importance: number
  }[]
  recommendations: string[]
  strengthAreas: string[]
  improvementAreas: string[]
  timelineToReady: string
}

export interface RadarChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    borderWidth: number
    pointBackgroundColor: string
  }[]
}

export const RADAR_DIMENSIONS: RadarDimension[] = [
  {
    name: 'technicalDepth',
    label: 'Technical Depth',
    description: 'Code quality, architecture knowledge, system design expertise',
    icon: '⚙️'
  },
  {
    name: 'communicationSkills',
    label: 'Communication Skills',
    description: 'Ability to articulate ideas, document, present, negotiate',
    icon: '💬'
  },
  {
    name: 'leadershipAbility',
    label: 'Leadership Ability',
    description: 'Mentoring, delegation, vision setting, team influence',
    icon: '👥'
  },
  {
    name: 'innovationMindset',
    label: 'Innovation Mindset',
    description: 'Creativity, problem-solving, experimentation, risk-taking',
    icon: '💡'
  },
  {
    name: 'teamCollaboration',
    label: 'Team Collaboration',
    description: 'Cross-functional work, stakeholder management, adaptability',
    icon: '🤝'
  },
  {
    name: 'industryExperience',
    label: 'Industry Experience',
    description: 'Domain knowledge, market understanding, best practices',
    icon: '📈'
  }
]

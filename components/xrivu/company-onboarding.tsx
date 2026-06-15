'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RADAR_DIMENSIONS, CompanyProfile } from '@/lib/xrivu/types'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface CompanyFormProps {
  onComplete: (profile: CompanyProfile) => void
}

export function CompanyOnboardingForm({ onComplete }: CompanyFormProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    companyName: '',
    jobTitle: '',
    industry: '',
    radarScores: {
      technicalDepth: 50,
      communicationSkills: 50,
      leadershipAbility: 50,
      innovationMindset: 50,
      teamCollaboration: 50,
      industryExperience: 50
    },
    importanceWeights: {
      technicalDepth: 30,
      communicationSkills: 20,
      leadershipAbility: 15,
      innovationMindset: 20,
      teamCollaboration: 10,
      industryExperience: 5
    },
    priorityRanking: ['technicalDepth', 'innovationMindset', 'communicationSkills', 'leadershipAbility', 'teamCollaboration', 'industryExperience']
  })

  const handleBasicInfoChange = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleRadarScoreChange = (skill: string, value: number) => {
    setForm(prev => ({
      ...prev,
      radarScores: {
        ...prev.radarScores,
        [skill]: value
      }
    }))
  }

  const handleImportanceWeightChange = (skill: string, value: number) => {
    setForm(prev => ({
      ...prev,
      importanceWeights: {
        ...prev.importanceWeights,
        [skill]: value
      }
    }))
  }

  const handleDragRanking = (fromIndex: number, toIndex: number) => {
    const newRanking = [...form.priorityRanking]
    const [removed] = newRanking.splice(fromIndex, 1)
    newRanking.splice(toIndex, 0, removed)
    setForm(prev => ({
      ...prev,
      priorityRanking: newRanking
    }))
  }

  const handleComplete = () => {
    onComplete({
      id: crypto.randomUUID(),
      companyName: form.companyName,
      jobTitle: form.jobTitle,
      industry: form.industry,
      radarScores: form.radarScores,
      importanceWeights: form.importanceWeights,
      priorityRanking: form.priorityRanking,
      createdAt: new Date()
    })
  }

  const canProceed = () => {
    if (step === 1) return form.companyName && form.jobTitle && form.industry
    if (step === 2 || step === 3) return true
    if (step === 4) return true
    return false
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-colors ${
                s === step
                  ? 'bg-blue-600 text-white'
                  : s < step
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {s}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600">
          {step === 1 && 'Basic Information'}
          {step === 2 && 'Required Skills Level'}
          {step === 3 && 'Importance Weights'}
          {step === 4 && 'Priority Ranking'}
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <Input
              placeholder="e.g., Google, Stripe, Figma"
              value={form.companyName}
              onChange={(e) => handleBasicInfoChange('companyName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Job Title</label>
            <Input
              placeholder="e.g., Senior Full-Stack Engineer"
              value={form.jobTitle}
              onChange={(e) => handleBasicInfoChange('jobTitle', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Industry</label>
            <Input
              placeholder="e.g., SaaS, FinTech, AI"
              value={form.industry}
              onChange={(e) => handleBasicInfoChange('industry', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Step 2: Radar Scores */}
      {step === 2 && (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 mb-4">Set the required skill level (0-100) for this position</p>
          {RADAR_DIMENSIONS.map(dim => (
            <div key={dim.name}>
              <div className="flex justify-between mb-2">
                <label className="font-medium text-sm">{dim.label}</label>
                <span className="text-sm text-blue-600 font-semibold">{form.radarScores[dim.name as keyof typeof form.radarScores]}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.radarScores[dim.name as keyof typeof form.radarScores]}
                onChange={(e) => handleRadarScoreChange(dim.name, parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">{dim.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Step 3: Importance Weights */}
      {step === 3 && (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 mb-4">Set importance weights for each skill (total should equal 100%)</p>
          {RADAR_DIMENSIONS.map(dim => (
            <div key={dim.name}>
              <div className="flex justify-between mb-2">
                <label className="font-medium text-sm">{dim.label}</label>
                <span className="text-sm text-blue-600 font-semibold">{form.importanceWeights[dim.name as keyof typeof form.importanceWeights]}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={form.importanceWeights[dim.name as keyof typeof form.importanceWeights]}
                onChange={(e) => handleImportanceWeightChange(dim.name, parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
            Total Weight: {Object.values(form.importanceWeights).reduce((a, b) => a + b, 0)}%
          </div>
        </div>
      )}

      {/* Step 4: Priority Ranking */}
      {step === 4 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">Drag to rank skills by importance</p>
          <div className="space-y-2">
            {form.priorityRanking.map((skillName, index) => {
              const skill = RADAR_DIMENSIONS.find(d => d.name === skillName)
              return (
                <div
                  key={skillName}
                  draggable
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDragRanking(form.priorityRanking.indexOf(skillName), index)}
                  className="bg-white border-2 border-gray-200 rounded p-3 cursor-move hover:border-blue-400 transition-colors flex items-center gap-3"
                >
                  <span className="font-bold text-blue-600 w-6">{index + 1}</span>
                  <span>{skill?.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={18} />
          Previous
        </Button>
        <div className="flex-1" />
        {step === 4 ? (
          <Button
            onClick={handleComplete}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Complete Setup
          </Button>
        ) : (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight size={18} />
          </Button>
        )}
      </div>
    </div>
  )
}

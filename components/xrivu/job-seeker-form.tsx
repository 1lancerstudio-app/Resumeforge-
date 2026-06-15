'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RADAR_DIMENSIONS, JobSeekerProfile } from '@/lib/xrivu/types'
import { X } from 'lucide-react'

interface JobSeekerFormProps {
  onComplete: (profile: JobSeekerProfile) => void
}

export function JobSeekerProfileForm({ onComplete }: JobSeekerFormProps) {
  const [form, setForm] = useState({
    name: '',
    currentRole: '',
    yearsExperience: 5,
    radarScores: {
      technicalDepth: 60,
      communicationSkills: 65,
      leadershipAbility: 50,
      innovationMindset: 55,
      teamCollaboration: 70,
      industryExperience: 50
    },
    certifications: [] as string[],
    achievements: [] as string[]
  })
  const [newCert, setNewCert] = useState('')
  const [newAchievement, setNewAchievement] = useState('')

  const handleBasicChange = (field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleRadarChange = (skill: string, value: number) => {
    setForm(prev => ({
      ...prev,
      radarScores: {
        ...prev.radarScores,
        [skill]: value
      }
    }))
  }

  const addCertification = () => {
    if (newCert.trim()) {
      setForm(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCert.trim()]
      }))
      setNewCert('')
    }
  }

  const removeCertification = (index: number) => {
    setForm(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setForm(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }))
      setNewAchievement('')
    }
  }

  const removeAchievement = (index: number) => {
    setForm(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = () => {
    onComplete({
      id: crypto.randomUUID(),
      name: form.name,
      currentRole: form.currentRole,
      yearsExperience: form.yearsExperience,
      radarScores: form.radarScores,
      certifications: form.certifications,
      achievements: form.achievements,
      createdAt: new Date()
    })
  }

  const canSubmit = form.name && form.currentRole

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <Input
              placeholder="Your name"
              value={form.name}
              onChange={(e) => handleBasicChange('name', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Current Role</label>
            <Input
              placeholder="e.g., Senior Software Engineer"
              value={form.currentRole}
              onChange={(e) => handleBasicChange('currentRole', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Years of Experience</label>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={form.yearsExperience}
            onChange={(e) => handleBasicChange('yearsExperience', parseInt(e.target.value))}
            className="w-full"
          />
          <span className="text-sm text-gray-600">{form.yearsExperience} years</span>
        </div>
      </div>

      {/* Skills Assessment */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Self-Assessed Skills (0-100)</h3>
        <div className="space-y-4">
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
                onChange={(e) => handleRadarChange(dim.name, parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">{dim.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Certifications</h3>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., AWS Certified Solutions Architect"
            value={newCert}
            onChange={(e) => setNewCert(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCertification()}
          />
          <Button
            onClick={addCertification}
            variant="outline"
          >
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {form.certifications.map((cert, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-100 rounded p-2"
            >
              <span className="text-sm">{cert}</span>
              <button
                onClick={() => removeCertification(index)}
                className="text-gray-500 hover:text-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Key Achievements</h3>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Led team of 10 engineers, scaled system to 1M users"
            value={newAchievement}
            onChange={(e) => setNewAchievement(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
          />
          <Button
            onClick={addAchievement}
            variant="outline"
          >
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {form.achievements.map((achievement, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-100 rounded p-2"
            >
              <span className="text-sm">{achievement}</span>
              <button
                onClick={() => removeAchievement(index)}
                className="text-gray-500 hover:text-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full bg-blue-600 text-white hover:bg-blue-700"
      >
        Create Profile & Analyze
      </Button>
    </div>
  )
}

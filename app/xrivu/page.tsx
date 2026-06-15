'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CompanyOnboardingForm } from '@/components/xrivu/company-onboarding'
import { JobSeekerProfileForm } from '@/components/xrivu/job-seeker-form'
import { RadarChart } from '@/components/xrivu/radar-chart'
import { CompanyProfile, JobSeekerProfile, XRIVUAnalysis, RADAR_DIMENSIONS } from '@/lib/xrivu/types'
import { ArrowRight } from 'lucide-react'

export default function XRIVUPage() {
  const [step, setStep] = useState<'company' | 'seeker' | 'analysis'>('company')
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null)
  const [seekerProfile, setSeekerProfile] = useState<JobSeekerProfile | null>(null)
  const [analysis, setAnalysis] = useState<XRIVUAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCompanyComplete = (profile: CompanyProfile) => {
    setCompanyProfile(profile)
    setStep('seeker')
  }

  const handleSeekerComplete = async (profile: JobSeekerProfile) => {
    setSeekerProfile(profile)
    setLoading(true)

    try {
      const response = await fetch('/api/xrivu/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyProfile,
          jobSeekerProfile: profile
        })
      })

      if (!response.ok) throw new Error('Analysis failed')
      const result = await response.json()
      setAnalysis(result)
      setStep('analysis')
    } catch (error) {
      console.error('[XRIVU] Error:', error)
      alert('Analysis failed. Please check your API configuration.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'company' && !companyProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2">XRIVU.01 Probability System</h1>
            <p className="text-gray-600">Find your perfect role match with AI-powered compatibility analysis</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-2">Step 1: Company Profile</h2>
            <p className="text-gray-600 mb-6">Tell us about the position you're hiring for</p>
            <CompanyOnboardingForm onComplete={handleCompanyComplete} />
          </div>
        </div>
      </div>
    )
  }

  if (step === 'seeker' && companyProfile && !seekerProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2">XRIVU.01 Probability System</h1>
            <p className="text-gray-600">Step 2: Job Seeker Profile</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-2">Step 2: Candidate Profile</h2>
            <p className="text-gray-600 mb-6">Tell us about yourself</p>
            <JobSeekerProfileForm onComplete={handleSeekerComplete} />
          </div>

          {loading && (
            <div className="mt-8 text-center">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-4">Analyzing compatibility...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (step === 'analysis' && analysis && companyProfile && seekerProfile) {
    const companyRadarData = Object.values(companyProfile.radarScores)
    const seekerRadarData = Object.values(seekerProfile.radarScores)

    const skillGapsByImportance = [...analysis.skillGaps].sort((a, b) => b.importance - a.importance)

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2">XRIVU.01 Analysis Results</h1>
            <p className="text-gray-600">{seekerProfile.name} → {companyProfile.companyName}</p>
          </div>

          {/* Overall Probability Score */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-12 text-white mb-8">
            <div className="text-center">
              <p className="text-lg font-medium mb-4 opacity-90">Overall Job Match Probability</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-7xl font-bold">{Math.round(analysis.overallProbability)}</span>
                <span className="text-4xl font-semibold">%</span>
              </div>
              <p className="mt-4 text-blue-100">
                {analysis.overallProbability >= 80 ? 'Excellent match' : analysis.overallProbability >= 60 ? 'Good potential' : 'Needs development'}
              </p>
            </div>
          </div>

          {/* Three Radar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Company Requirements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-4">Required Skills</h3>
              <RadarChart
                title={companyProfile.jobTitle}
                data={companyRadarData}
                borderColor="#7C3AED"
                backgroundColor="rgba(124, 58, 237, 0.2)"
              />
            </div>

            {/* Seeker Skills */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-4">Your Skills</h3>
              <RadarChart
                title={seekerProfile.name}
                data={seekerRadarData}
                borderColor="#06B6D4"
                backgroundColor="rgba(6, 182, 212, 0.2)"
              />
            </div>

            {/* Overlay Comparison */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-4">Comparison</h3>
              <RadarChart
                title="Overlay"
                data={companyRadarData}
                borderColor="#7C3AED"
                backgroundColor="rgba(124, 58, 237, 0.1)"
                secondaryData={seekerRadarData}
                secondaryBorderColor="#06B6D4"
                secondaryBackgroundColor="rgba(6, 182, 212, 0.1)"
              />
            </div>
          </div>

          {/* Skill Gaps Table */}
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <h3 className="font-semibold text-lg mb-6">Skill Gap Analysis (by Importance)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Skill</th>
                    <th className="text-center py-3 px-4 font-semibold">Required</th>
                    <th className="text-center py-3 px-4 font-semibold">Your Level</th>
                    <th className="text-center py-3 px-4 font-semibold">Gap</th>
                    <th className="text-center py-3 px-4 font-semibold">Importance</th>
                  </tr>
                </thead>
                <tbody>
                  {skillGapsByImportance.map((gap, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{gap.dimension}</td>
                      <td className="text-center py-3 px-4">
                        <span className="bg-purple-100 text-purple-900 px-2 py-1 rounded">{gap.companyRequirement}</span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="bg-teal-100 text-teal-900 px-2 py-1 rounded">{gap.seekerCapability}</span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded ${gap.gap > 15 ? 'bg-red-100 text-red-900' : gap.gap > 0 ? 'bg-yellow-100 text-yellow-900' : 'bg-green-100 text-green-900'}`}>
                          {gap.gap > 0 ? `+${gap.gap}` : gap.gap}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4 font-semibold">{gap.importance}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations and Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Strengths */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-4 text-green-700">Your Strengths</h3>
              <ul className="space-y-3">
                {analysis.strengthAreas.map((strength, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas to Improve */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-4 text-amber-700">Areas to Improve</h3>
              <ul className="space-y-3">
                {analysis.improvementAreas.map((area, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-amber-600 font-bold">!</span>
                    <span className="text-gray-700">{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8">
            <h3 className="font-semibold text-lg mb-4">AI Recommendations</h3>
            <ul className="space-y-3">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3 text-gray-700">
                  <span className="text-blue-600 font-bold">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-gray-600">
              <strong>Timeline to Full Readiness:</strong> {analysis.timelineToReady}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setStep('company')
                setCompanyProfile(null)
                setSeekerProfile(null)
                setAnalysis(null)
              }}
              variant="outline"
            >
              Start Over
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Save Analysis
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

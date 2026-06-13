'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkillRadarChart } from '@/components/job-match/radar-chart';
import { AIAnalysisPanel } from '@/components/job-match/ai-analysis-panel';
import { SkillMetricsGrid } from '@/components/job-match/skill-metrics';

// Sample candidate data
const candidateDetails = {
  name: 'Alex Johnson',
  title: 'Full Stack Engineer',
  location: 'San Francisco, CA',
  experience: '7 years',
  matchScore: 82,
  status: 'Excellent Match',
};

const jobSkills = [
  { name: 'React', value: 95, fullMark: 100 },
  { name: 'Node.js', value: 90, fullMark: 100 },
  { name: 'TypeScript', value: 85, fullMark: 100 },
  { name: 'AWS', value: 80, fullMark: 100 },
  { name: 'Leadership', value: 75, fullMark: 100 },
  { name: 'Communication', value: 80, fullMark: 100 },
];

const candidateSkills = [
  { name: 'React', value: 90, fullMark: 100 },
  { name: 'Node.js', value: 85, fullMark: 100 },
  { name: 'TypeScript', value: 88, fullMark: 100 },
  { name: 'AWS', value: 72, fullMark: 100 },
  { name: 'Leadership', value: 78, fullMark: 100 },
  { name: 'Communication', value: 82, fullMark: 100 },
];

const strengths = [
  'Exceptional React expertise with proven track record at scale',
  'Solid Node.js backend development skills',
  'Strong TypeScript proficiency with modern practices',
  'Leadership experience managing developer teams',
  'Excellent communication skills from performance reviews',
];

const gaps = [
  'AWS experience needs development (72% vs 80% required)',
  'Limited serverless architecture mentions in background',
];

const recommendations = [
  'Consider pairing with AWS-focused mentor on team',
  'Candidate shows strong potential with quick learning trajectory',
  'Recommend interview to assess leadership capability fit',
];

export default function RecruiterCandidateMatchPage() {
  const params = useParams();
  const candidateId = params.candidateId as string;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border sticky top-0 z-40 bg-background/80 backdrop-blur-sm">
        <div className="px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link href="/recruiter#pool" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Candidates</span>
          </Link>
          <h1 className="text-xl font-semibold text-foreground">Candidate Match Analysis</h1>
          <div className="w-20" />
        </div>
      </div>

      <main className="px-6 lg:px-10 py-8 space-y-10 max-w-7xl mx-auto">
        {/* Candidate Overview */}
        <div className="space-y-4">
          <div>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
              Candidate ID: {candidateId}
            </p>
            <h2 className="text-3xl font-bold text-foreground">{candidateDetails.name}</h2>
            <p className="text-lg text-muted-foreground mt-2">
              {candidateDetails.title} • {candidateDetails.location}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground font-mono mb-2">EXPERIENCE</p>
              <p className="text-lg font-semibold text-foreground">{candidateDetails.experience}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground font-mono mb-2">LOCATION</p>
              <p className="text-lg font-semibold text-foreground">{candidateDetails.location}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground font-mono mb-2">MATCH SCORE</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
                {candidateDetails.matchScore}%
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground font-mono mb-2">RECOMMENDATION</p>
              <p className="text-lg font-semibold text-green-400">Strong Match</p>
            </div>
          </div>
        </div>

        {/* Radar Charts Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="mb-4">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">CANDIDATE PROFILE</p>
              <h3 className="text-lg font-semibold text-yellow-400">Actual Skills</h3>
            </div>
            <SkillRadarChart data={candidateSkills} color="#E8FF00" />
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="mb-4">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">ROLE REQUIREMENTS</p>
              <h3 className="text-lg font-semibold text-green-400">Required Skills</h3>
            </div>
            <SkillRadarChart data={jobSkills} color="#00FF94" />
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AIAnalysisPanel
              matchPercentage={82}
              strengths={strengths}
              gaps={gaps}
              recommendations={recommendations}
            />
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div>
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Skills Match</p>
                <p className="text-3xl font-bold text-green-400">5/6</p>
                <p className="text-sm text-muted-foreground mt-1">Above requirements</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Interview Status</p>
                <p className="text-lg font-semibold text-foreground">Not Scheduled</p>
                <p className="text-sm text-muted-foreground mt-1">Ready to move forward</p>
              </div>
            </div>

            <Button className="w-full gap-2 h-11">
              <MessageSquare className="w-4 h-4" />
              Schedule Interview
            </Button>
            <Button variant="outline" className="w-full gap-2 h-11">
              <Download className="w-4 h-4" />
              Download Resume
            </Button>
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">Skills Assessment</p>
          <SkillMetricsGrid
            skills={[
              { name: 'React', percentage: 90, color: '#E8FF00' },
              { name: 'Node.js', percentage: 85, color: '#E8FF00' },
              { name: 'TypeScript', percentage: 88, color: '#E8FF00' },
              { name: 'AWS', percentage: 72, color: '#FFB800' },
              { name: 'Leadership', percentage: 78, color: '#00FF94' },
              { name: 'Communication', percentage: 82, color: '#00FF94' },
            ]}
          />
        </div>

        {/* Interview Notes */}
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">Hiring Notes</p>
          <textarea
            placeholder="Add interview notes, feedback, or concerns here..."
            className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[120px] resize-none"
          />
          <Button className="mt-4" size="sm">
            Save Notes
          </Button>
        </div>
      </main>
    </div>
  );
}

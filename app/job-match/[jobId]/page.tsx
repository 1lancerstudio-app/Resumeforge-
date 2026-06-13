'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkillRadarChart } from '@/components/job-match/radar-chart';
import { AIAnalysisPanel } from '@/components/job-match/ai-analysis-panel';
import { SkillMetricsGrid } from '@/components/job-match/skill-metrics';

// Sample data for job seeker
const jobDetails = {
  title: 'Senior Full Stack Engineer',
  company: 'TechCorp',
  location: 'San Francisco, CA',
  salary: '$150k - $200k',
  description: 'Looking for a senior engineer with 5+ years of experience in React, Node.js, and cloud infrastructure.',
};

const candidateSkills = [
  { name: 'React', value: 90, fullMark: 100 },
  { name: 'Node.js', value: 85, fullMark: 100 },
  { name: 'TypeScript', value: 88, fullMark: 100 },
  { name: 'AWS', value: 72, fullMark: 100 },
  { name: 'Leadership', value: 78, fullMark: 100 },
  { name: 'Communication', value: 82, fullMark: 100 },
];

const jobRequirements = [
  { name: 'React', value: 95, fullMark: 100 },
  { name: 'Node.js', value: 90, fullMark: 100 },
  { name: 'TypeScript', value: 85, fullMark: 100 },
  { name: 'AWS', value: 80, fullMark: 100 },
  { name: 'Leadership', value: 75, fullMark: 100 },
  { name: 'Communication', value: 80, fullMark: 100 },
];

const strengths = [
  'Excellent React expertise with 7 years of hands-on experience',
  'Strong Node.js backend development skills exceeding job requirements',
  'Proven leadership experience managing teams of 5+',
  'Excellent communication skills demonstrated in previous roles',
];

const gaps = [
  'AWS experience slightly below required (72% vs 80%)',
  'Limited serverless architecture experience mentioned',
];

const recommendations = [
  'Brush up on AWS Lambdas and serverless patterns before interview',
  'Prepare to discuss scale handling and infrastructure decisions',
  'Highlight leadership achievements in team growth and mentoring',
];

export default function JobMatchPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border sticky top-0 z-40 bg-background/80 backdrop-blur-sm">
        <div className="px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link href="/jobs" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Jobs</span>
          </Link>
          <h1 className="text-xl font-semibold text-foreground">AI Job Match Analysis</h1>
          <div className="w-20" />
        </div>
      </div>

      <main className="px-6 lg:px-10 py-8 space-y-10 max-w-7xl mx-auto">
        {/* Job Overview */}
        <div className="space-y-4">
          <div>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
              Job Match ID: {jobId}
            </p>
            <h2 className="text-3xl font-bold text-foreground">{jobDetails.title}</h2>
            <p className="text-lg text-muted-foreground mt-2">
              {jobDetails.company} • {jobDetails.location}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground font-mono mb-2">SALARY RANGE</p>
              <p className="text-lg font-semibold text-foreground">{jobDetails.salary}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground font-mono mb-2">EXPERIENCE REQUIRED</p>
              <p className="text-lg font-semibold text-foreground">5+ Years</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground font-mono mb-2">MATCH SCORE</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
                82%
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground font-mono mb-2">STATUS</p>
              <p className="text-lg font-semibold text-green-400">Excellent Match</p>
            </div>
          </div>
        </div>

        {/* Radar Charts Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="mb-4">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">YOUR PROFILE</p>
              <h3 className="text-lg font-semibold text-yellow-400">Candidate Skills</h3>
            </div>
            <SkillRadarChart data={candidateSkills} color="#E8FF00" />
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="mb-4">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">JOB REQUIREMENTS</p>
              <h3 className="text-lg font-semibold text-green-400">Required Skills</h3>
            </div>
            <SkillRadarChart data={jobRequirements} color="#00FF94" />
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

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div>
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Skills Match</p>
                <p className="text-3xl font-bold text-green-400">5/6</p>
                <p className="text-sm text-muted-foreground mt-1">Above job requirements</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Experience</p>
                <p className="text-lg font-semibold text-foreground">7 Years</p>
                <p className="text-sm text-muted-foreground mt-1">+2 years above required</p>
              </div>
            </div>

            <Button className="w-full gap-2 h-11">
              <ExternalLink className="w-4 h-4" />
              Apply Now
            </Button>
            <Button variant="outline" className="w-full gap-2 h-11">
              Save Job
            </Button>
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">Detailed Skills</p>
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
      </main>
    </div>
  );
}

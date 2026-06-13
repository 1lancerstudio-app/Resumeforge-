'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface AnalysisItem {
  label: string;
  text: string;
  type: 'strength' | 'gap' | 'recommendation';
}

interface AIAnalysisPanelProps {
  matchPercentage: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

const TypeIndicator = ({ type }: { type: string }) => {
  switch (type) {
    case 'strength':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'gap':
      return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    default:
      return <div className="w-5 h-5 rounded-full bg-blue-400" />;
  }
};

export function AIAnalysisPanel({
  matchPercentage,
  strengths,
  gaps,
  recommendations,
}: AIAnalysisPanelProps) {
  const [displayedPercentage, setDisplayedPercentage] = useState(0);

  useEffect(() => {
    let current = 0;
    const increment = matchPercentage / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= matchPercentage) {
        setDisplayedPercentage(matchPercentage);
        clearInterval(timer);
      } else {
        setDisplayedPercentage(Math.floor(current));
      }
    }, 10);
    return () => clearInterval(timer);
  }, [matchPercentage]);

  return (
    <div className="bg-gradient-to-br from-background via-background to-primary/5 border border-border rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">XRIVU.01 AI Analysis</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">Match Analysis</h3>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-muted-foreground mb-1">MATCH SCORE</p>
            <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text text-transparent">
              {displayedPercentage}%
            </div>
          </div>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-green-400 rounded-full transition-all duration-300"
            style={{ width: `${displayedPercentage}%` }}
          />
        </div>
      </div>

      {/* Strengths */}
      <div className="space-y-3">
        <h4 className="font-mono text-xs text-green-400 uppercase tracking-widest">✓ Strengths</h4>
        <div className="space-y-2">
          {strengths.map((strength, i) => (
            <div key={i} className="flex gap-3 items-start p-3 bg-secondary/50 rounded-lg border border-green-400/20">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{strength}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Gaps */}
      {gaps.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-mono text-xs text-yellow-400 uppercase tracking-widest">⚠ Gaps to Address</h4>
          <div className="space-y-2">
            {gaps.map((gap, i) => (
              <div key={i} className="flex gap-3 items-start p-3 bg-secondary/50 rounded-lg border border-yellow-400/20">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{gap}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="space-y-3">
        <h4 className="font-mono text-xs text-blue-400 uppercase tracking-widest">→ Recommendations</h4>
        <div className="space-y-2">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex gap-3 items-start p-3 bg-secondary/50 rounded-lg border border-blue-400/20">
              <div className="w-5 h-5 rounded-full bg-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <p className="text-xs text-muted-foreground">Live Analysis</p>
        </div>
        <p className="text-xs text-muted-foreground">Updated just now</p>
      </div>
    </div>
  );
}

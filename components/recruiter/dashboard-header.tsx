"use client";

import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  companyName: string;
}

export function DashboardHeader({ companyName }: DashboardHeaderProps) {
  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 border-b border-border bg-gradient-to-br from-card to-background">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">
            Recruiter Dashboard
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[0.95] mb-3">
            Welcome, {companyName}.
          </h1>
          <p className="font-mono text-sm text-muted-foreground max-w-xl">
            Verify candidate resumes instantly with AI-powered fraud detection. Make confident hiring decisions backed by comprehensive data verification.
          </p>
        </div>
        <Badge className="shrink-0">Premium Plan</Badge>
      </div>

      {/* Quick Stats Pills */}
      <div className="flex gap-3 flex-wrap">
        <div className="px-4 py-2 bg-secondary border border-border rounded-full text-sm font-mono">
          <span className="text-muted-foreground">Active: </span>
          <span className="font-semibold">12</span>
        </div>
        <div className="px-4 py-2 bg-secondary border border-border rounded-full text-sm font-mono">
          <span className="text-muted-foreground">Success Rate: </span>
          <span className="font-semibold text-green-400">87%</span>
        </div>
        <div className="px-4 py-2 bg-secondary border border-border rounded-full text-sm font-mono">
          <span className="text-muted-foreground">Flagged: </span>
          <span className="font-semibold text-red-400">3</span>
        </div>
      </div>
    </div>
  );
}

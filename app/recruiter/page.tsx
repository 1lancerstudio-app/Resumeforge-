"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/auth/dashboard-nav";
import { RoleGuard } from "@/components/auth/role-guard";

const navLinks = [
  { name: "Verify Resume", href: "/recruiter" },
  { name: "Candidate Pool", href: "/recruiter#pool" },
  { name: "Analytics", href: "/recruiter#analytics" },
];

const statCards = [
  { label: "Resumes Verified", value: "0", icon: CheckCircle2, trend: "+0" },
  { label: "Fraud Flags", value: "0", icon: AlertCircle, trend: "0" },
  { label: "Trust Score Avg", value: "—", icon: TrendingUp, trend: "—" },
];

const recentVerifications = [
  {
    id: "RF-2026-A1",
    candidate: "Sarah Chen",
    position: "Senior Software Engineer",
    score: 94,
    status: "verified",
  },
  {
    id: "RF-2026-B2",
    candidate: "Marcus Webb",
    position: "Product Manager",
    score: 87,
    status: "verified",
  },
  {
    id: "RF-2026-C3",
    candidate: "Elena Rodriguez",
    position: "UX Designer",
    score: 78,
    status: "pending",
  },
];

export default function RecruiterPage() {
  const [companyName, setCompanyName] = useState("Team");
  const [companyInitials, setCompanyInitials] = useState("T");
  const [verifyId, setVerifyId] = useState("");
  const [verifyResult, setVerifyResult] = useState<null | string>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("resumeforge_user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user.company) {
          setCompanyName(user.company);
          setCompanyInitials(
            user.company
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          );
        } else if (user.name) {
          setCompanyName(user.name);
          setCompanyInitials(
            user.name
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          );
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!verifyId.trim()) return;
    setIsVerifying(true);
    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setVerifyResult(
      `Verification ID "${verifyId}" not found. This may be a demo environment — no resumes have been generated yet.`
    );
    setIsVerifying(false);
    setVerifyId("");
  }

  return (
    <>
      <RoleGuard required="recruiter" />
      <div className="min-h-screen bg-background">
        <DashboardNav
          links={navLinks}
          rightContent={
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold text-background shrink-0"
              style={{
                background: "linear-gradient(135deg, #eca8d6, #fbbf24)",
              }}
            >
              {companyInitials}
            </div>
          }
        />

        {/* Hero */}
        <main className="pt-14">
          <div className="px-6 lg:px-10 py-16 lg:py-24 border-b border-border">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
              Recruiter Dashboard
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[0.95] mb-6">
              Verify every
              <br />
              <span className="text-foreground/40">candidate, instantly.</span>
            </h1>
            <p className="font-mono text-sm text-muted-foreground mb-10 max-w-2xl">
              Scan a verification QR code or paste the verification ID to instantly check all claims with cryptographic proof. Zero false positives.
            </p>
            <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 h-12 text-sm gap-2">
              <Search className="w-4 h-4" />
              Start Verifying
            </Button>
          </div>

          {/* Stat cards with icons */}
          <div className="px-6 lg:px-10 py-12 border-b border-border">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="border border-border bg-card p-6 flex flex-col gap-4 hover:border-foreground/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                        {card.label}
                      </span>
                      <Icon className="w-4 h-4 text-muted-foreground/60" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-4xl text-foreground">
                        {card.value}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground/60">
                        {card.trend}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification panel */}
          <div className="px-6 lg:px-10 py-12 max-w-2xl">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-6">
              Quick Verification
            </p>

            <form onSubmit={handleVerify} className="flex flex-col gap-4 mb-12">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={verifyId}
                  onChange={(e) => setVerifyId(e.target.value)}
                  placeholder="Paste verification ID (e.g., RF-2026-XXXX)"
                  className="flex-1 bg-input border border-border rounded-sm px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 transition-all"
                />
                <Button
                  type="submit"
                  disabled={isVerifying}
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-sm px-8 h-auto text-sm shrink-0 disabled:opacity-60"
                >
                  {isVerifying ? "Verifying..." : "Verify Now"}
                </Button>
              </div>
            </form>

            {/* Verification result */}
            {verifyResult && (
              <div className="mb-12 border border-yellow-500/30 bg-yellow-500/5 p-6 rounded-sm">
                <p className="font-mono text-sm text-yellow-600/80">{verifyResult}</p>
              </div>
            )}

            {/* Recent verifications */}
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-6">
                Recent Verifications
              </p>
              <div className="space-y-3">
                {recentVerifications.map((verification) => (
                  <div
                    key={verification.id}
                    className="border border-border bg-card p-5 flex items-center justify-between hover:border-foreground/20 transition-colors cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-sans text-sm text-foreground font-medium group-hover:text-foreground transition-colors">
                          {verification.candidate}
                        </h3>
                        <span
                          className={`font-mono text-xs px-2 py-0.5 rounded ${
                            verification.status === "verified"
                              ? "bg-green-500/10 text-green-600"
                              : "bg-blue-500/10 text-blue-600"
                          }`}
                        >
                          {verification.status}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {verification.position}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <span className="font-display text-lg text-foreground">
                          {verification.score}
                        </span>
                        <p className="font-mono text-xs text-muted-foreground">
                          Trust Score
                        </p>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground/50">
                        {verification.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

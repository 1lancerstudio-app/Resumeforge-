"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/auth/dashboard-nav";
import { RoleGuard } from "@/components/auth/role-guard";
import { DashboardHeader } from "@/components/recruiter/dashboard-header";
import { AnalyticsSection } from "@/components/recruiter/analytics-section";
import { BatchUpload } from "@/components/recruiter/batch-upload";
import { CandidatePool } from "@/components/recruiter/candidate-pool";
import { VerificationHistory } from "@/components/recruiter/verification-history";
import { FraudDetails } from "@/components/recruiter/fraud-details";

const navLinks = [
  { name: "Dashboard", href: "/recruiter" },
  { name: "Batch Verify", href: "/recruiter#batch" },
  { name: "Candidates", href: "/recruiter#pool" },
  { name: "Analytics", href: "/recruiter#analytics" },
];

export default function RecruiterPage() {
  const [companyName, setCompanyName] = useState("your team");
  const [verifyId, setVerifyId] = useState("");
  const [verifyResult, setVerifyResult] = useState<null | string>(null);
  const [activeTab, setActiveTab] = useState("verify");

  useEffect(() => {
    const stored = localStorage.getItem("resumeforge_user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user.company) setCompanyName(user.company);
        else if (user.name) setCompanyName(user.name);
      } catch {
        /* ignore */
      }
    }
  }, []);

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!verifyId.trim()) return;
    setVerifyResult(
      `Verification ID "${verifyId}" not found. This may be a demo environment — no resumes have been generated yet.`
    );
  }

  return (
    <>
      <RoleGuard required="recruiter" />
      <div className="min-h-screen bg-background">
        <DashboardNav
          links={navLinks}
          rightContent={
            <span className="font-mono text-xs text-muted-foreground border border-border px-2 py-1 hidden sm:block">
              {companyName}
            </span>
          }
        />

        <main className="pt-14">
          {/* Header */}
          <DashboardHeader companyName={companyName} />

          {/* Tabs Navigation */}
          <div className="sticky top-14 bg-background border-b border-border z-40">
            <div className="px-6 lg:px-10 flex gap-1">
              {[
                { id: "verify", label: "Verify Resume" },
                { id: "batch", label: "Batch Upload" },
                { id: "pool", label: "Candidate Pool" },
                { id: "history", label: "History" },
                { id: "analytics", label: "Analytics" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 lg:px-10 py-10 space-y-10">
            {/* Verify Resume Tab */}
            {activeTab === "verify" && (
              <div className="max-w-2xl space-y-6">
                <div>
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
                    Single Verification
                  </p>
                  <h2 className="text-2xl font-semibold mb-3">Enter Verification ID</h2>
                  <p className="text-muted-foreground mb-6">
                    Paste a candidate&apos;s verification ID to instantly check resume authenticity and get AI-powered fraud detection insights.
                  </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={verifyId}
                      onChange={(e) => setVerifyId(e.target.value)}
                      placeholder="RF-2026-XXXX"
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2 h-11"
                  >
                    <Search className="w-4 h-4" />
                    Verify Resume
                  </Button>
                </form>

                {verifyResult && (
                  <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <p className="font-mono text-sm text-muted-foreground">{verifyResult}</p>
                    
                    {/* Show sample fraud details if result exists */}
                    <div className="border-t border-border pt-6">
                      <FraudDetails />
                    </div>
                  </div>
                )}

                {!verifyResult && (
                  <div className="bg-card border border-dashed border-border rounded-lg p-8 text-center">
                    <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      No verification yet. Enter a resume verification ID above to get started.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Batch Upload Tab */}
            {activeTab === "batch" && (
              <div id="batch" className="max-w-2xl">
                <BatchUpload />
              </div>
            )}

            {/* Candidate Pool Tab */}
            {activeTab === "pool" && (
              <div id="pool">
                <CandidatePool />
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div id="history">
                <VerificationHistory />
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div id="analytics">
                <div className="mb-6">
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    Analytics & Insights
                  </p>
                  <h2 className="text-2xl font-semibold">Verification Metrics</h2>
                  <p className="text-muted-foreground mt-2">
                    Track verification trends, fraud detection rates, and candidate quality metrics.
                  </p>
                </div>
                <AnalyticsSection />
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

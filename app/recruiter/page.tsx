"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/auth/dashboard-nav";
import { RoleGuard } from "@/components/auth/role-guard";

const navLinks = [
  { name: "Verify Resume", href: "/recruiter" },
  { name: "Candidate Pool", href: "/recruiter#pool" },
  { name: "Analytics", href: "/recruiter#analytics" },
];

const statCards = [
  { label: "Resumes Verified", value: "0" },
  { label: "Fraud Flags", value: "0" },
  { label: "Trust Score Avg", value: "—" },
];

export default function RecruiterPage() {
  const [companyName, setCompanyName] = useState("your team");
  const [verifyId, setVerifyId] = useState("");
  const [verifyResult, setVerifyResult] = useState<null | string>(null);

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
    // Placeholder — would call the verification API
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

        {/* Hero */}
        <main className="pt-14">
          <div className="px-6 lg:px-10 py-16 lg:py-24 border-b border-border">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
              Recruiter Dashboard
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[0.95] mb-6">
              Welcome, {companyName}.
            </h1>
            <p className="font-mono text-sm text-muted-foreground mb-10">
              Verify candidate resumes instantly. Zero false claims.
            </p>
            <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 h-12 text-sm gap-2">
              <Search className="w-4 h-4" />
              Verify a Resume
            </Button>
          </div>

          {/* Stat cards */}
          <div className="px-6 lg:px-10 py-10 border-b border-border">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="border border-border bg-card p-6 flex flex-col gap-2"
                >
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                    {card.label}
                  </span>
                  <span className="font-display text-4xl text-foreground">
                    {card.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification input */}
          <div className="px-6 lg:px-10 py-12 max-w-xl">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
              Paste Verification ID
            </p>
            <form onSubmit={handleVerify} className="flex gap-3">
              <input
                type="text"
                value={verifyId}
                onChange={(e) => setVerifyId(e.target.value)}
                placeholder="RF-2026-XXXX"
                className="flex-1 bg-input border border-border rounded-sm px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30"
              />
              <Button
                type="submit"
                className="bg-foreground text-background hover:bg-foreground/90 rounded-sm px-6 h-auto text-sm shrink-0"
              >
                Verify Now &rarr;
              </Button>
            </form>

            <div className="mt-8 border border-border bg-card p-6">
              {verifyResult ? (
                <p className="font-mono text-sm text-muted-foreground">
                  {verifyResult}
                </p>
              ) : (
                <p className="font-mono text-sm text-muted-foreground">
                  No verifications yet. Paste a candidate&apos;s verification ID above.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DecorativePanel } from "@/components/auth/decorative-panel";

type Role = "candidate" | "recruiter" | null;

function RoleCard({
  role,
  selected,
  onSelect,
}: {
  role: "candidate" | "recruiter";
  selected: boolean;
  onSelect: () => void;
}) {
  const isCandidate = role === "candidate";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col gap-5 p-7 border text-left transition-all duration-300 hover-lift focus:outline-none ${
        selected
          ? "border-transparent shadow-[0_0_0_1.5px_#eca8d6,0_0_0_3px_#a78bfa20] shadow-[0_0_24px_#eca8d630]"
          : "border-border hover:border-foreground/20"
      }`}
      style={
        selected
          ? {
              boxShadow:
                "0 0 0 1.5px #eca8d6, 0 0 32px #eca8d620, inset 0 0 60px #a78bfa08",
            }
          : {}
      }
    >
      {/* Tag */}
      <span className="absolute top-4 right-4 font-mono text-[9px] uppercase tracking-widest text-muted-foreground border border-border px-2 py-0.5">
        {isCandidate ? "CANDIDATE" : "CORPORATE"}
      </span>

      {/* Checkmark */}
      {selected && (
        <span className="absolute top-4 left-4 w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
          <Check className="w-3 h-3 text-background" strokeWidth={3} />
        </span>
      )}

      {/* Icon */}
      <div className="mt-4">
        {isCandidate ? (
          <svg
            viewBox="0 0 40 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-10 h-10 text-foreground"
          >
            <rect x="8" y="4" width="24" height="32" rx="1" />
            <line x1="13" y1="13" x2="27" y2="13" />
            <line x1="13" y1="18" x2="27" y2="18" />
            <line x1="13" y1="23" x2="21" y2="23" />
            <circle cx="26" cy="28" r="4" />
            <line x1="29" y1="31" x2="32" y2="34" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 40 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-10 h-10 text-foreground"
          >
            <rect x="4" y="16" width="32" height="22" rx="1" />
            <path d="M12 16V10a8 8 0 0 1 16 0v6" />
            <rect x="16" y="22" width="8" height="6" rx="0.5" />
          </svg>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display text-[28px] leading-none text-foreground">
        {isCandidate ? "Job Seeker" : "Recruiter"}
      </h3>

      {/* Description */}
      <p className="font-sans text-sm text-muted-foreground leading-relaxed">
        {isCandidate
          ? "Get AI-tailored resumes for every application. Connect GitHub, certs, and portfolio."
          : "Verify candidate resumes instantly. Access a pool of pre-verified talent profiles."}
      </p>

      {/* Bullets */}
      <ul className="flex flex-col gap-1.5 mt-1">
        {(isCandidate
          ? [
              "6 AI agents craft your resume",
              "ATS optimization built-in",
              "Verification link for recruiters",
            ]
          : [
              "One-click resume verification",
              "Fraud detection on every claim",
              "Bulk candidate management",
            ]
        ).map((item) => (
          <li key={item} className="font-mono text-[11px] text-muted-foreground flex items-start gap-2">
            <span className="text-foreground/40 mt-0.5">✦</span>
            {item}
          </li>
        ))}
      </ul>
    </button>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");

  // Pre-select recruiter if ?role=recruiter
  useEffect(() => {
    const param = searchParams.get("role");
    if (param === "recruiter") setRole("recruiter");
  }, [searchParams]);

  function handleContinue() {
    if (role) setStep(2);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    // Persist role + user to localStorage
    localStorage.setItem("resumeforge_role", role as string);
    localStorage.setItem(
      "resumeforge_user",
      JSON.stringify({ name, email, company: role === "recruiter" ? company : undefined })
    );
    if (role === "recruiter") {
      router.push("/recruiter");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Form side */}
      <div className="flex-1 flex flex-col py-12 px-8 sm:px-16 lg:px-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display text-xl text-foreground">RESUMEFORGE</span>
              <span className="font-mono text-[9px] text-muted-foreground mt-0.5">AI</span>
            </Link>
          )}

          {step === 2 && role && (
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground border border-border px-2 py-1">
              {role === "candidate" ? "CANDIDATE" : "CORPORATE"}
            </span>
          )}
        </div>

        {/* Step 1 — Role selection */}
        {step === 1 && (
          <div className="flex flex-col flex-1 justify-center max-w-2xl">
            <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-4">
              Step 1 of 2
            </p>
            <h1 className="font-display text-[52px] leading-[0.95] tracking-tight text-foreground mb-3">
              Who are you building for?
            </h1>
            <p className="font-mono text-sm text-muted-foreground mb-10">
              Your experience is tailored to your role.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <RoleCard
                role="candidate"
                selected={role === "candidate"}
                onSelect={() => setRole("candidate")}
              />
              <RoleCard
                role="recruiter"
                selected={role === "recruiter"}
                onSelect={() => setRole("recruiter")}
              />
            </div>

            <Button
              onClick={handleContinue}
              disabled={!role}
              className="w-fit bg-foreground text-background hover:bg-foreground/90 rounded-full px-10 h-12 text-sm font-sans disabled:opacity-30"
            >
              Continue &rarr;
            </Button>
          </div>
        )}

        {/* Step 2 — Account details */}
        {step === 2 && (
          <div className="flex flex-col flex-1 justify-center max-w-sm">
            <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-4">
              Step 2 of 2
            </p>
            <h1 className="font-display text-[48px] leading-[0.95] tracking-tight text-foreground mb-10">
              Create your account.
            </h1>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="bg-input border border-border rounded-sm px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30"
                />
              </div>

              {role === "recruiter" && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp"
                    className="bg-input border border-border rounded-sm px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-input border border-border rounded-sm px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-input border border-border rounded-sm px-4 py-3 pr-12 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full h-12 text-sm font-sans mt-2"
              >
                Create Account
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="font-mono text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Google */}
            <Button
              variant="outline"
              className="w-full rounded-full h-12 text-sm border-border hover:bg-secondary gap-3"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <p className="font-mono text-xs text-muted-foreground text-center mt-8">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-foreground underline underline-offset-4 hover:text-foreground/80"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* Decorative right panel */}
      <div className="hidden lg:flex lg:w-[45%]">
        <DecorativePanel quote="Your next opportunity starts with the right first impression." />
      </div>
    </div>
  );
}

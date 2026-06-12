"use client";

import { useEffect, useState, useRef } from "react";
import { ShieldCheck, Clock, FileCheck, QrCode } from "lucide-react";

const verificationFeatures = [
  {
    icon: ShieldCheck,
    title: "Source-backed claims",
    description: "Every bullet point on your resume is tied to a primary source — GitHub commit, certificate issuer, or employer record.",
  },
  {
    icon: QrCode,
    title: "Instant QR verification",
    description: "Recruiters scan once. All 12 claims resolve in under 3 seconds, no account needed.",
  },
  {
    icon: Clock,
    title: "Always up to date",
    description: "Verification links stay live. As you earn new credentials, the score updates automatically.",
  },
  {
    icon: FileCheck,
    title: "Zero false claims",
    description: "Cryptographic signing means claims cannot be forged or modified after issuance.",
  },
];

export function SecuritySection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % verificationFeatures.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="verify" ref={sectionRef} className="relative py-32 lg:py-40 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-20">
          <span className={`inline-flex items-center gap-4 text-sm font-mono text-muted-foreground mb-8 transition-all duration-700 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}>
            <span className="w-12 h-px bg-foreground/20" />
            Verification
          </span>

          <h2 className={`text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            Recruiters trust
            <br />
            <span className="text-muted-foreground">what they verify.</span>
          </h2>

          <p className={`text-xl text-muted-foreground leading-relaxed max-w-2xl transition-all duration-1000 delay-100 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}>
            Every ResumeForge resume ships with a live verification link and QR code. No more &quot;we&apos;ll check your references later&quot; — recruiters see proof instantly.
          </p>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* QR card mockup — left */}
          <div className={`lg:col-span-7 relative p-8 lg:p-12 border min-h-[400px] overflow-hidden transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
            style={{
              borderColor: "rgba(74,222,128,0.25)",
              boxShadow: "0 0 40px rgba(74,222,128,0.06)",
            }}
          >
            {/* QR card UI */}
            <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start">
              {/* Left: card details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
                  <span className="text-xs font-mono text-[#4ade80] uppercase tracking-widest">Resume Verified</span>
                </div>
                <div className="space-y-3 mb-8">
                  {[
                    { label: "Name", value: "Alex Rivera" },
                    { label: "Role Applied", value: "Senior Engineer" },
                    { label: "Verified Claims", value: "12 / 12" },
                    { label: "Generated", value: "June 2026" },
                  ].map((field) => (
                    <div key={field.label} className="flex items-baseline justify-between gap-4 border-b border-foreground/10 pb-3">
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{field.label}</span>
                      <span className={`text-sm font-medium ${field.label === "Verified Claims" ? "text-[#4ade80]" : "text-foreground"}`}>
                        {field.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-2 px-3 py-1.5 border border-[#4ade80]/30 bg-[#4ade80]/5 text-xs font-mono text-[#4ade80]">
                    <ShieldCheck className="w-3 h-3" />
                    Cryptographically signed
                  </span>
                </div>
              </div>

              {/* Right: QR code SVG pattern */}
              <div className="shrink-0">
                <div className="w-32 h-32 border border-foreground/20 p-2 bg-background">
                  <svg viewBox="0 0 21 21" className="w-full h-full" aria-label="QR code pattern">
                    {/* QR-style pixel grid */}
                    {[
                      [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],
                      [0,1],[6,1],
                      [0,2],[2,2],[3,2],[4,2],[6,2],
                      [0,3],[2,3],[3,3],[4,3],[6,3],
                      [0,4],[2,4],[3,4],[4,4],[6,4],
                      [0,5],[6,5],
                      [0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],
                      [8,0],[10,0],[12,0],
                      [9,1],[11,1],[13,1],
                      [8,2],[10,2],[12,2],
                      [14,0],[15,0],[16,0],[17,0],[18,0],[19,0],[20,0],
                      [14,1],[20,1],
                      [14,2],[16,2],[17,2],[18,2],[20,2],
                      [14,3],[16,3],[17,3],[18,3],[20,3],
                      [14,4],[16,4],[17,4],[18,4],[20,4],
                      [14,5],[20,5],
                      [14,6],[15,6],[16,6],[17,6],[18,6],[19,6],[20,6],
                      [0,14],[1,14],[2,14],[3,14],[4,14],[5,14],[6,14],
                      [0,15],[6,15],
                      [0,16],[2,16],[3,16],[4,16],[6,16],
                      [0,17],[2,17],[3,17],[4,17],[6,17],
                      [0,18],[2,18],[3,18],[4,18],[6,18],
                      [0,19],[6,19],
                      [0,20],[1,20],[2,20],[3,20],[4,20],[5,20],[6,20],
                      [8,8],[9,8],[11,8],[13,8],
                      [8,9],[10,9],[12,9],[14,9],
                      [9,10],[11,10],[13,10],
                      [8,11],[10,11],[12,11],[14,11],
                      [9,12],[11,12],[13,12],
                    ].map(([x, y], i) => (
                      <rect key={i} x={x} y={y} width="1" height="1" fill="currentColor" className="text-foreground" />
                    ))}
                  </svg>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground mt-2 text-center">resumeforge.ai/v/RF-2026-A7X9</p>
              </div>
            </div>

            {/* Stat row */}
            <div className="relative z-10 mt-8 grid grid-cols-3 gap-4 pt-8 border-t border-foreground/10">
              {[
                { value: "12", label: "verifiable claims" },
                { value: "< 3sec", label: "verify time" },
                { value: "100%", label: "source-backed" },
              ].map((stat) => (
                <div key={stat.label}>
                  <span className="block text-3xl font-display">{stat.value}</span>
                  <span className="block text-xs font-mono text-muted-foreground mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature cards stack — right */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {verificationFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`p-6 border transition-all duration-500 cursor-default ${
                  activeFeature === index
                    ? "border-foreground/30 bg-foreground/[0.04]"
                    : "border-foreground/10"
                } ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
                style={{ transitionDelay: `${index * 80}ms` }}
                onClick={() => setActiveFeature(index)}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-10 h-10 flex items-center justify-center border transition-colors ${
                    activeFeature === index
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground/20"
                  }`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { GitBranch, BadgeCheck, Link2 } from "lucide-react";

const achievements = [
  {
    icon: GitBranch,
    title: "GitHub Projects",
    description: "Every open-source contribution, repo, and commit automatically surfaced and formatted as a verifiable achievement on your resume.",
    stat: "100+",
    statLabel: "repos scanned",
  },
  {
    icon: BadgeCheck,
    title: "Certificates",
    description: "AWS, Google Cloud, Coursera, Credly — your certifications are pulled, verified against issuer APIs, and attached as cryptographic proofs.",
    stat: "40+",
    statLabel: "cert sources",
  },
  {
    icon: Link2,
    title: "Work Samples",
    description: "Notion docs, Figma files, published articles, Devpost hackathon entries. If you built it, we find it and make it count.",
    stat: "12",
    statLabel: "verified per resume",
  },
];

export function InfrastructureSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);
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

  return (
    <section id="achievements" ref={sectionRef} className="relative py-32 lg:py-40 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-20">
          <span className={`inline-flex items-center gap-4 text-sm font-mono text-muted-foreground mb-8 transition-all duration-700 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}>
            <span className="w-12 h-px bg-foreground/20" />
            YOUR EDGE
          </span>

          <h2 className={`text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            Everything
            <br />
            <span className="text-muted-foreground">you&apos;ve built.</span>
          </h2>

          <p className={`mt-8 text-xl text-muted-foreground leading-relaxed max-w-2xl transition-all duration-1000 delay-100 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}>
            Finally working for you. ResumeForge AI aggregates every achievement across platforms you already use and makes them verifiable.
          </p>
        </div>

        {/* Achievement cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {achievements.map((item, index) => (
            <div
              key={item.title}
              className={`relative p-8 lg:p-12 border transition-all duration-500 cursor-default overflow-hidden ${
                activeCard === index
                  ? "border-[#eca8d6]/40 bg-foreground/[0.03]"
                  : "border-foreground/10 bg-foreground/[0.02] hover:border-foreground/20"
              } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onMouseEnter={() => setActiveCard(index)}
              onMouseLeave={() => setActiveCard(null)}
            >
              {/* Hover gradient border glow */}
              {activeCard === index && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(236,168,214,0.06) 0%, rgba(167,139,250,0.06) 100%)",
                  }}
                />
              )}

              <div className="relative z-10">
                <div className={`w-12 h-12 flex items-center justify-center border mb-8 transition-colors ${
                  activeCard === index
                    ? "border-[#eca8d6]/40 text-[#eca8d6]"
                    : "border-foreground/20 text-muted-foreground"
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>

                <h3 className="text-2xl lg:text-3xl font-display mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-8">{item.description}</p>

                <div>
                  <span className="text-4xl font-display">{item.stat}</span>
                  <span className="block text-sm text-muted-foreground font-mono mt-2">{item.statLabel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

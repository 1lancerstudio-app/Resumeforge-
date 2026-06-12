"use client";

import { useState, useEffect, useRef } from "react";

const features = [
  {
    title: "Bulk verification",
    description: "Check hundreds of resumes through the API in a single batch request."
  },
  {
    title: "Webhook callbacks",
    description: "Get notified the moment a candidate&apos;s claims are verified."
  },
  {
    title: "Custom branding",
    description: "Embed verified badges on your ATS with your own brand identity."
  },
  {
    title: "Audit trail export",
    description: "Full CSV / JSON export of all verification events for compliance."
  },
];

export function DevelopersSection() {
  const [isVisible, setIsVisible] = useState(false);
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
    <section id="developers" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      {/* Image — absolute, bottom-right, behind all content */}
      <div
        className={`absolute bottom-0 right-0 w-[55%] h-[85%] pointer-events-none transition-all duration-1000 delay-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Upscaled%20Image%20%2813%29-OQ2DiR3ElVsUg8kTvTL1kC5A3Q6maM.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-left-top"
        />
        {/* Fade left edge */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        {/* Fade top edge */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent" />
      </div>

      {/* All text content sits on top */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div
          className={`mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            For Recruiters / Verification API
          </span>
          <h2 className="text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9]">
            Verify at scale.
            <br />
            <span className="text-muted-foreground">Trust by default.</span>
          </h2>
        </div>

        {/* Description + code + features — left half */}
        <div
          className={`max-w-[50%] transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-md">
            Bulk-verify candidate resumes via API. Each claim is source-backed and cryptographically signed — results in under 3 seconds.
          </p>

          {/* Code sample */}
          <div className="border border-foreground/10 bg-foreground/[0.02] mb-10 overflow-x-auto">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-foreground/10">
              <span className="w-2 h-2 rounded-full bg-foreground/20" />
              <span className="w-2 h-2 rounded-full bg-foreground/20" />
              <span className="w-2 h-2 rounded-full bg-foreground/20" />
              <span className="ml-2 text-xs font-mono text-muted-foreground">verification-api.ts</span>
            </div>
            <pre className="p-5 text-[12px] font-mono text-white/70 leading-relaxed overflow-x-auto">
              <code>{`const result = await verify.check({
  id: "RF-2026-A7X9",
  claims: "all",
})

// result.verified  → true
// result.score     → 12/12
// result.sources   → ["github", "credly", "aws"]
// result.signed_at → "2026-06-12T10:34:00Z"`}</code>
            </pre>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${index * 50 + 200}ms` }}
              >
                <h3 className="font-medium mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

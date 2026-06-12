"use client";

import { useEffect, useRef, useState } from "react";

const features = [
  {
    number: "01",
    title: "HR Agent",
    description: "Scans job descriptions for ATS keywords and requirement signals. Ensures your resume passes automated screening before a human ever sees it.",
    stats: { value: "97%", label: "ATS pass rate" },
  },
  {
    number: "02",
    title: "Tailoring Agent",
    description: "Rewrites your bullet points to mirror the language and priorities of each specific role. No generic templates — every word earns its place.",
    stats: { value: "3x", label: "relevance boost" },
  },
  {
    number: "03",
    title: "Achievement Agent",
    description: "Pulls from your GitHub, certificates, side projects, and course completions to surface accomplishments you might have forgotten to include.",
    stats: { value: "40+", label: "data sources" },
  },
  {
    number: "04",
    title: "Verification Agent",
    description: "Generates a cryptographic proof for each claim on your resume, backed by primary sources. Produces a scannable QR code recruiters can check in seconds.",
    stats: { value: "0", label: "false claims" },
  },
];

const agentRoster = [
  { name: "HR Agent",           desc: "ATS keyword extraction" },
  { name: "Tailoring Agent",    desc: "Bullet rewriter" },
  { name: "Achievement Agent",  desc: "Data aggregator" },
  { name: "Tone Agent",         desc: "Voice consistency" },
  { name: "Verification Agent", desc: "Cryptographic proof" },
  { name: "ATS Optimizer",      desc: "Score maximiser" },
];

// Floating dot particles visualization
function ParticleVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    const COUNT = 70;
    const particles = Array.from({ length: COUNT }, (_, i) => {
      const seed = i * 1.618;
      return {
        bx: ((seed * 127.1) % 1),
        by: ((seed * 311.7) % 1),
        phase: seed * Math.PI * 2,
        speed: 0.4 + (seed % 0.4),
        radius: 1.2 + (seed % 2.2),
      };
    });

    let time = 0;
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach((p) => {
        const flowX = Math.sin(time * p.speed * 0.4 + p.phase) * 38;
        const flowY = Math.cos(time * p.speed * 0.3 + p.phase * 0.7) * 24;

        const bx = p.bx * w;
        const by = p.by * h;
        const dx = p.bx - mx;
        const dy = p.by - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist * 2.8);

        const x = bx + flowX + influence * Math.cos(time + p.phase) * 36;
        const y = by + flowY + influence * Math.sin(time + p.phase) * 36;

        const pulse = Math.sin(time * p.speed + p.phase) * 0.5 + 0.5;
        const alpha = 0.08 + pulse * 0.18 + influence * 0.3;

        ctx.beginPath();
        ctx.arc(x, y, p.radius + pulse * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      });

      time += 0.016;
      frameRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

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
    <section
      id="agents"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="relative mb-24 lg:mb-32">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
                <span className="w-12 h-px bg-foreground/30" />
                HOW THE AGENTS WORK
              </span>
              <h2
                className={`text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                Six agents.
                <br />
                <span className="text-muted-foreground">One resume.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pb-4">
              <p className={`text-xl text-muted-foreground leading-relaxed transition-all duration-1000 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
                Each agent handles a distinct layer of your resume — from ATS parsing to cryptographic verification. They run in parallel so you get the final result in under two minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Agent cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
          {features.map((feature, index) => (
            <div
              key={feature.number}
              className={`relative bg-black border border-foreground/10 overflow-hidden group transition-all duration-700 flex flex-col p-8 lg:p-12 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
              onMouseEnter={() => setActiveFeature(index)}
            >
              {index === 0 && (
                <div className="absolute inset-0">
                  <ParticleVisualization />
                </div>
              )}
              <div className="relative z-10">
                <span className="font-mono text-sm text-muted-foreground">{feature.number}</span>
                <h3 className="text-2xl lg:text-3xl font-display mt-4 mb-4 group-hover:translate-x-2 transition-transform duration-500">
                  {feature.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed mb-8">
                  {feature.description}
                </p>
                <div>
                  <span className="text-4xl lg:text-5xl font-display">{feature.stats.value}</span>
                  <span className="block text-sm text-muted-foreground font-mono mt-2">{feature.stats.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Agent Roster strip */}
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px border border-foreground/10 transition-all duration-700 delay-300 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          {agentRoster.map((agent) => (
            <div
              key={agent.name}
              className="p-4 lg:p-6 border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.05] transition-colors"
            >
              <span className="block font-mono text-xs text-[#eca8d6] mb-1 truncate">{agent.name}</span>
              <span className="block text-xs text-muted-foreground leading-tight">{agent.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

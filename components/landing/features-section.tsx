"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Send, Sparkles } from "lucide-react";

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

// ─── Inline Chat Demo ────────────────────────────────────────────────────────

type DemoMsg = { role: "user" | "agent"; agent?: string; text: string };

const DEMO_SEQUENCE: DemoMsg[] = [
  {
    role: "user",
    text: "I'm applying to a senior front-end role at a Series B startup. Can you help?",
  },
  {
    role: "agent",
    agent: "HR Agent",
    text: "Scanning the job description now… Found 14 ATS keywords. I'll make sure your resume hits all of them before it reaches any human.",
  },
  {
    role: "agent",
    agent: "Tailoring Agent",
    text: "Rewriting your bullet points to mirror their language. I've replaced 8 generic phrases with role-specific impact statements.",
  },
  {
    role: "agent",
    agent: "Achievement Agent",
    text: "I found 3 GitHub projects you hadn't listed — including that open-source component library with 240 stars. Adding them now.",
  },
  {
    role: "agent",
    agent: "Verification Agent",
    text: "All 12 claims are cryptographically verified and linked to primary sources. Your QR code is ready — recruiters can check everything in under 3 seconds.",
  },
];

const AGENT_COLOR: Record<string, string> = {
  "HR Agent":           "#eca8d6",
  "Tailoring Agent":    "#a5f3fc",
  "Achievement Agent":  "#fbbf24",
  "Verification Agent": "#86efac",
  "ResumeForge AI":     "#c4b5fd",
};

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full bg-white/40 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "900ms" }}
        />
      ))}
    </span>
  );
}

function InlineChatDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typing, setTyping]             = useState(false);
  const [inputVal, setInputVal]         = useState("");
  const [started, setStarted]           = useState(false);
  const [userMessages, setUserMessages] = useState<DemoMsg[]>([]);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleCount, typing, userMessages]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  const runDemoStep = useCallback((idx: number) => {
    if (idx >= DEMO_SEQUENCE.length) return;
    setTyping(true);
    const delay = DEMO_SEQUENCE[idx].role === "agent" ? 950 : 420;
    setTimeout(() => {
      setTyping(false);
      setVisibleCount(idx + 1);
      if (idx + 1 < DEMO_SEQUENCE.length) {
        setTimeout(() => runDemoStep(idx + 1), 650);
      }
    }, delay);
  }, []);

  useEffect(() => {
    if (started && visibleCount === 0) {
      setTimeout(() => runDemoStep(0), 500);
    }
  }, [started, visibleCount, runDemoStep]);

  const allMessages: DemoMsg[] = [
    ...DEMO_SEQUENCE.slice(0, visibleCount),
    ...userMessages,
  ];

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const text = inputVal.trim();
    setUserMessages((prev) => [...prev, { role: "user", text }]);
    setInputVal("");
    setTimeout(() => {
      setUserMessages((prev) => [
        ...prev,
        {
          role: "agent",
          agent: "ResumeForge AI",
          text: "Sign up to unlock the full 6-agent workspace. Your first 3 tailored resumes are free.",
        },
      ]);
    }, 950);
  }

  return (
    <div
      ref={sectionRef}
      className="relative border border-foreground/10 bg-black/60 backdrop-blur-sm overflow-hidden"
      style={{ height: 420 }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-foreground/10 bg-black/40 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#eca8d6]" />
          <span className="font-mono text-xs text-white/50 uppercase tracking-widest">
            Live Agent Demo
          </span>
        </div>
        <Link
          href="/agents"
          className="font-mono text-xs text-white/35 hover:text-white/70 transition-colors underline underline-offset-2"
        >
          Open full workspace &rarr;
        </Link>
      </div>

      {/* Message list */}
      <div
        className="flex flex-col gap-4 overflow-y-auto px-5 py-4"
        style={{ height: 324 }}
      >
        {allMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "agent" && (
              <div
                className="w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center font-mono text-[9px] font-bold text-black"
                style={{ background: AGENT_COLOR[msg.agent ?? ""] ?? "#eca8d6" }}
              >
                {(msg.agent ?? "A")[0]}
              </div>
            )}
            <div
              className={`max-w-[82%] flex flex-col gap-1 ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              {msg.role === "agent" && msg.agent && (
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: AGENT_COLOR[msg.agent] ?? "#eca8d6" }}
                >
                  {msg.agent}
                </span>
              )}
              <div
                className={`px-4 py-2.5 text-sm leading-relaxed font-sans ${
                  msg.role === "user"
                    ? "bg-white/10 text-white/90 rounded-tl-xl rounded-bl-xl rounded-tr-sm rounded-br-xl"
                    : "bg-foreground/5 text-white/80 border border-foreground/10 rounded-tl-sm rounded-tr-xl rounded-bl-xl rounded-br-xl"
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex gap-3 justify-start">
            <div className="w-6 h-6 rounded-full shrink-0 bg-white/10 flex items-center justify-center">
              <span className="font-mono text-[9px] text-white/40">…</span>
            </div>
            <div className="px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-tl-sm rounded-tr-xl rounded-bl-xl rounded-br-xl">
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="absolute bottom-0 inset-x-0 flex items-center gap-3 px-4 py-3 border-t border-foreground/10 bg-black/70 backdrop-blur-sm"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask the agents anything…"
          className="flex-1 bg-transparent font-sans text-sm text-white/80 placeholder:text-white/25 focus:outline-none"
        />
        <button
          type="submit"
          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors shrink-0"
        >
          <Send className="w-3.5 h-3.5 text-white/55" />
        </button>
      </form>
    </div>
  );
}

// ─── Floating dot particles visualization ────────────────────────────────────

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
        bx:     ((seed * 127.1) % 1),
        by:     ((seed * 311.7) % 1),
        phase:  seed * Math.PI * 2,
        speed:  0.4 + (seed % 0.4),
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

// ─── Main Section ─────────────────────────────────────────────────────────────

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
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
        <div className="relative mb-12 lg:mb-16">
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
              <p
                className={`text-xl text-muted-foreground leading-relaxed transition-all duration-1000 delay-200 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                Each agent handles a distinct layer of your resume — from ATS parsing to cryptographic verification. They run in parallel so you get the final result in under two minutes.
              </p>
            </div>
          </div>
        </div>

        {/* ── Inline chat demo ── */}
        <div
          className={`mb-12 lg:mb-16 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <InlineChatDemo />
        </div>

        {/* Agent cards grid */}
        <div className="grid md:grid-cols-2 gap-4 lg:gap-6 mb-8">
          {features.map((feature, index) => (
            <div
              key={feature.number}
              className={`relative bg-black border border-foreground/10 overflow-hidden group transition-all duration-700 flex flex-col p-8 lg:p-12 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${index * 80 + 400}ms` }}
              onMouseEnter={() => setActiveFeature(index)}
            >
              {index === 0 && (
                <div className="absolute inset-0">
                  <ParticleVisualization />
                </div>
              )}
              <div className="relative z-10">
                <span className="font-mono text-sm text-muted-foreground">
                  {feature.number}
                </span>
                <h3 className="text-2xl lg:text-3xl font-display mt-4 mb-4 group-hover:translate-x-2 transition-transform duration-500">
                  {feature.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed mb-8">
                  {feature.description}
                </p>
                <div>
                  <span className="text-4xl lg:text-5xl font-display">
                    {feature.stats.value}
                  </span>
                  <span className="block text-sm text-muted-foreground font-mono mt-2">
                    {feature.stats.label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Agent Roster strip */}
        <div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px border border-foreground/10 transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {agentRoster.map((agent) => (
            <div
              key={agent.name}
              className="p-4 lg:p-6 border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.05] transition-colors"
            >
              <span className="block font-mono text-xs text-[#eca8d6] mb-1 truncate">
                {agent.name}
              </span>
              <span className="block text-xs text-muted-foreground leading-tight">
                {agent.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

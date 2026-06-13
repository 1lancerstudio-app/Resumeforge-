"use client";

import { useEffect, useRef, useState, useCallback, Suspense, lazy } from "react";
import Link from "next/link";
import { Send, Sparkles, Mic, X, Check, ChevronDown } from "lucide-react";

// Lazy-load the 3-D orb so Three.js doesn't block the initial paint
const ParticleOrbChat = lazy(() =>
  import("@/components/chat/particle-orb-chat").then((m) => ({ default: m.ParticleOrbChat }))
);

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

const AGENTS = ["HR Agent", "Tailoring Agent", "Achievement Agent", "Verification Agent"];

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-[3px] h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[5px] h-[5px] rounded-full bg-white/50 animate-bounce"
          style={{ animationDelay: `${i * 140}ms`, animationDuration: "850ms" }}
        />
      ))}
    </span>
  );
}

function AgentPill({ name }: { name: string }) {
  const color = AGENT_COLOR[name] ?? "#eca8d6";
  return (
    <span
      className="agent-tag-pill"
      style={{ color, borderColor: `${color}40`, background: `${color}12` }}
    >
      <span
        className="w-[6px] h-[6px] rounded-full shrink-0"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      {name}
    </span>
  );
}

function InlineChatDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typing, setTyping]             = useState(false);
  const [inputVal, setInputVal]         = useState("");
  const [started, setStarted]           = useState(false);
  const [userMessages, setUserMessages] = useState<DemoMsg[]>([]);
  const [isRecording, setIsRecording]   = useState(false);
  const [agentOpen, setAgentOpen]       = useState(false);
  const [activeAgent, setActiveAgent]   = useState("HR Agent");
  const bottomRef  = useRef<HTMLDivElement>(null);
  const listRef    = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll ONLY the inner message list, never the page/window.
    // Using scrollIntoView here would scroll every scrollable ancestor
    // (including the document), causing the landing page to lurch while
    // the user scrolls past the section.
    const list = listRef.current;
    if (list) {
      list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
    }
  }, [visibleCount, typing, userMessages]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
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
    if (started && visibleCount === 0) setTimeout(() => runDemoStep(0), 500);
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
        { role: "agent", agent: "ResumeForge AI", text: "Sign up to unlock the full 6-agent workspace. Your first 3 tailored resumes are free." },
      ]);
    }, 950);
  }

  return (
    <div
      ref={sectionRef}
      className="relative overflow-hidden border border-foreground/10"
      style={{ background: "linear-gradient(135deg, #050508 0%, #08080e 60%, #050508 100%)", minHeight: 520 }}
    >
      {/* Shader gradient orbs */}
      <div className="chat-shader-orb chat-shader-orb-1" />
      <div className="chat-shader-orb chat-shader-orb-2" />
      <div className="chat-shader-orb chat-shader-orb-3" />

      {/* Animated grid */}
      <div className="absolute inset-0 chat-grid-bg opacity-100 pointer-events-none" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 py-3 border-b border-white/[0.06] backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.35)" }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#eca8d6] shadow-[0_0_8px_#eca8d6]" />
            <Sparkles className="w-3 h-3 text-white/40" />
            <span className="font-mono text-[11px] text-white/45 uppercase tracking-[0.15em]">Live Agent Demo</span>
          </div>

          {/* Agent selector */}
          <div className="relative">
            <button
              onClick={() => setAgentOpen(!agentOpen)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition-colors"
            >
              <span
                className="w-[6px] h-[6px] rounded-full"
                style={{ background: AGENT_COLOR[activeAgent], boxShadow: `0 0 5px ${AGENT_COLOR[activeAgent]}` }}
              />
              <span className="font-mono text-[10px] text-white/60 uppercase tracking-wider">{activeAgent}</span>
              <ChevronDown className={`w-3 h-3 text-white/40 transition-transform duration-200 ${agentOpen ? "rotate-180" : ""}`} />
            </button>
            {agentOpen && (
              <div
                className="absolute top-[calc(100%+6px)] left-0 z-50 min-w-[180px] rounded-xl border border-white/10 overflow-hidden"
                style={{ background: "linear-gradient(to bottom, rgba(18,18,24,0.97), rgba(10,10,16,0.97))", backdropFilter: "blur(16px)", boxShadow: "0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), 0 0 20px rgba(236,168,214,0.06)" }}
              >
                {AGENTS.map((a) => (
                  <button
                    key={a}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-2.5 hover:bg-white/[0.06] transition-colors"
                    onClick={() => { setActiveAgent(a); setAgentOpen(false); }}
                  >
                    <span
                      className="w-[6px] h-[6px] rounded-full shrink-0"
                      style={{ background: AGENT_COLOR[a], boxShadow: `0 0 5px ${AGENT_COLOR[a]}` }}
                    />
                    <span className="font-mono text-[11px] text-white/70 uppercase tracking-wider">{a}</span>
                    {activeAgent === a && <Check className="w-3 h-3 text-white/40 ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <Link
          href="/agents"
          className="font-mono text-[11px] text-white/30 hover:text-white/65 transition-colors underline underline-offset-2"
        >
          Open full workspace &rarr;
        </Link>
      </div>

      {/* Main content: orb + messages side by side on wider screens */}
      <div className="relative z-10 flex flex-col lg:flex-row" style={{ minHeight: 400 }}>

        {/* Left: 3-D Particle Orb */}
        <div className="flex items-center justify-center lg:w-64 shrink-0 py-6 lg:py-0 border-b lg:border-b-0 lg:border-r border-white/[0.05]">
          <div className="flex flex-col items-center gap-3">
            <Suspense
              fallback={
                <div className="w-40 h-40 rounded-full border border-white/10 animate-pulse bg-white/[0.03]" />
              }
            >
              <ParticleOrbChat />
            </Suspense>
            <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Agent Network</span>
          </div>
        </div>

        {/* Right: message list */}
        <div className="flex-1 flex flex-col">
          <div
            ref={listRef}
            className="flex-1 flex flex-col gap-3.5 overflow-y-auto px-5 py-4"
            style={{ maxHeight: 320 }}
          >
            {allMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "agent" && (
                  <div
                    className="w-7 h-7 rounded-full shrink-0 mt-0.5 flex items-center justify-center font-mono text-[10px] font-bold text-black"
                    style={{
                      background: AGENT_COLOR[msg.agent ?? ""] ?? "#eca8d6",
                      boxShadow: `0 0 10px ${AGENT_COLOR[msg.agent ?? ""] ?? "#eca8d6"}55`,
                    }}
                  >
                    {(msg.agent ?? "A")[0]}
                  </div>
                )}
                <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  {msg.role === "agent" && msg.agent && <AgentPill name={msg.agent} />}
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed font-sans ${
                      msg.role === "user"
                        ? "text-white/85 rounded-tl-2xl rounded-bl-2xl rounded-tr-sm rounded-br-2xl"
                        : "text-white/75 rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl"
                    }`}
                    style={
                      msg.role === "user"
                        ? { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }
                        : {
                            background: "rgba(255,255,255,0.04)",
                            border: `1px solid ${AGENT_COLOR[msg.agent ?? ""] ?? "#eca8d6"}28`,
                            boxShadow: `0 0 20px ${AGENT_COLOR[msg.agent ?? ""] ?? "#eca8d6"}08`,
                          }
                    }
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full shrink-0 bg-white/[0.06] border border-white/10 flex items-center justify-center">
                  <span className="font-mono text-[9px] text-white/30">…</span>
                </div>
                <div
                  className="px-4 py-3 rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Voice recording bar */}
          {isRecording && (
            <div
              className="mx-4 mb-2 flex items-center justify-between gap-4 px-5 py-2.5 rounded-full border border-white/10"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}
            >
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono text-[11px] text-white/60">Recording…</span>
              </div>
              <div className="flex-1 flex items-center justify-center gap-[2px] h-8 overflow-hidden">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="voice-wave-bar-h bg-white/60"
                    style={{ animationDelay: `${-i * 0.025}s` }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsRecording(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-red-500/20 border border-white/10 transition-colors"
                >
                  <X className="w-3 h-3 text-white/60" />
                </button>
                <button
                  onClick={() => setIsRecording(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 transition-colors"
                >
                  <Check className="w-3 h-3 text-white/80" />
                </button>
              </div>
            </div>
          )}

          {/* Input bar */}
          <form
            onSubmit={handleSend}
            className="mx-4 mb-4 chat-input-3d rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(255,255,255,0.09)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="flex items-start gap-3 px-4 pt-3 pb-2">
              <textarea
                rows={1}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e as unknown as React.FormEvent); } }}
                placeholder="Ask the agents anything…"
                className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/25 focus:outline-none resize-none font-sans leading-relaxed"
                style={{ minHeight: 24, maxHeight: 80 }}
              />
            </div>
            <div className="flex items-center justify-between px-3 pb-2.5 border-t border-white/[0.05] pt-2">
              <span className="font-mono text-[10px] text-white/25 uppercase tracking-widest hidden sm:block">
                Powered by 6 AI agents
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsRecording(true)}
                  className="w-7 h-7 rounded-full flex items-center justify-center border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                >
                  <Mic className="w-3.5 h-3.5 text-white/50" />
                </button>
                <button
                  type="submit"
                  className="chat-send-btn w-7 h-7 rounded-full flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5 text-white/70" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
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

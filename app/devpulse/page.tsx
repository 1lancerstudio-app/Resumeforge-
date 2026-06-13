"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView, animate } from "framer-motion";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { ArrowRight, CheckCircle2, AlertTriangle, Zap, BookOpen, MessageSquare } from "lucide-react";
import Link from "next/link";
import {
  AXES,
  COMPANY_SCORES,
  loadAnswers,
  computeCandidateScores,
  computeMatchPct,
  computeStrengths,
  computeGaps,
  type Insight,
} from "@/lib/devpulse-data";

// ─── Data ─────────────────────────────────────────────────────────────────────

// Recommended next steps mapped from the user's top gaps.
const ACTION_ICONS = [Zap, BookOpen, MessageSquare];

function buildActions(gaps: Insight[]) {
  const base = gaps.length
    ? gaps.map((g) => `Improve ${g.axis}: ${g.detail}`)
    : [
        "Complete 2 open-source contributions tagged #system-design",
        "Add a technical blog post to your DevPulse profile this week",
        "Engage in 5+ architecture-related discussions this week",
      ];
  return base.slice(0, 3).map((text, i) => ({
    num: String(i + 1).padStart(2, "0"),
    icon: ACTION_ICONS[i % ACTION_ICONS.length],
    text,
  }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const YELLOW = "#E8FF00";
const GREEN  = "#00FF94";
const BG     = "#0A0A0F";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

function glassStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: "rgba(255,255,255,0.03)",
    border: `1px solid ${GLASS_BORDER}`,
    boxShadow: "inset 0 0 40px rgba(255,255,255,0.02)",
    ...extra,
  };
}

// ─── Animated counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ to, duration = 1.4 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return controls.stop;
  }, [inView, to, duration]);

  return <span ref={ref}>{val}</span>;
}

// ─── Circular Match Gauge ─────────────────────────────────────────────────────

function MatchGauge({ pct }: { pct: number }) {
  const ref  = useRef<SVGCircleElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });
  const R = 56, CIRC = 2 * Math.PI * R;
  const dash = (pct / 100) * CIRC;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
      <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        {/* Arc */}
        <motion.circle
          ref={ref}
          cx="80" cy="80" r={R}
          fill="none"
          stroke={YELLOW}
          strokeWidth="6"
          strokeLinecap="butt"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={inView ? { strokeDashoffset: CIRC - dash } : {}}
          transition={{ duration: 1.6, ease: "easeOut", delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${YELLOW})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold leading-none"
          style={{ fontFamily: "var(--font-sans)", color: YELLOW, textShadow: `0 0 20px ${YELLOW}66` }}
        >
          <AnimatedNumber to={pct} />%
        </span>
        <span
          className="text-xs mt-1"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}
        >
          MATCH
        </span>
      </div>
    </div>
  );
}

// ─── Typewriter ───────────────────────────────────────────────────────────────

function Typewriter({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const ref     = useRef<HTMLSpanElement>(null);
  const inView  = useInView(ref as React.RefObject<Element>, { once: true });

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const id = setTimeout(() => {
      const t = setInterval(() => {
        setDisplayed(text.slice(0, ++i));
        if (i >= text.length) clearInterval(t);
      }, 28);
    }, delay);
    return () => clearTimeout(id);
  }, [inView, text, delay]);

  return (
    <span ref={ref}>
      {displayed}
      {displayed.length < text.length && (
        <span className="animate-pulse" style={{ color: YELLOW }}>|</span>
      )}
    </span>
  );
}

// ─── Radar Panel ─────────────────────────────────────────────────────────────

type RadarMode = "company" | "candidate" | "compare";

function RadarPanel({
  mode,
  title,
  subtext,
  scores,
  candidateScores,
  color,
}: {
  mode: RadarMode;
  title: string;
  subtext: string;
  scores: number[];
  candidateScores?: number[];
  color: string;
}) {
  const data =
    mode === "compare"
      ? AXES.map((axis, i) => ({
          axis,
          company: COMPANY_SCORES[i],
          candidate: (candidateScores ?? scores)[i],
          fullMark: 5,
        }))
      : AXES.map((axis, i) => ({ axis, value: scores[i], fullMark: 5 }));

  return (
    <div className="flex flex-col gap-6 h-full" style={glassStyle({ borderRadius: 12, padding: "28px 24px" })}>
      <div>
        <p
          className="text-xs uppercase tracking-widest mb-1"
          style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.35)" }}
        >
          {subtext}
        </p>
        <h2
          className="text-lg font-semibold"
          style={{ fontFamily: "var(--font-sans)", color: "#fff" }}
        >
          {title}
        </h2>
      </div>

      <div className="flex-1" style={{ minHeight: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid
              gridType="polygon"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth={1}
            />
            <PolarAngleAxis
              dataKey="axis"
              tick={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fill: "rgba(255,255,255,0.55)",
              }}
            />
            <PolarRadiusAxis
              domain={[0, 5]}
              tick={false}
              axisLine={false}
              tickCount={6}
            />
            {mode === "compare" ? (
              <>
                <Radar
                  name="Company"
                  dataKey="company"
                  stroke={GREEN}
                  fill={GREEN}
                  fillOpacity={0.18}
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: GREEN, filter: `drop-shadow(0 0 4px ${GREEN})` }}
                />
                <Radar
                  name="You"
                  dataKey="candidate"
                  stroke={YELLOW}
                  fill={YELLOW}
                  fillOpacity={0.18}
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: YELLOW, filter: `drop-shadow(0 0 4px ${YELLOW})` }}
                />
              </>
            ) : (
              <Radar
                name={mode === "company" ? "Company" : "You"}
                dataKey="value"
                stroke={color}
                fill={color}
                fillOpacity={mode === "company" ? 0.30 : 0.25}
                strokeWidth={2}
                dot={{ r: 4, fill: color, filter: `drop-shadow(0 0 6px ${color})` }}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score pills */}
      <div className="flex flex-col gap-2">
        {AXES.map((axis, i) => (
          <div key={axis} className="flex items-center justify-between">
            <span
              className="text-xs truncate pr-2"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.45)" }}
            >
              {axis}
            </span>
            <span
              className="text-xs px-2 py-0.5 shrink-0"
              style={{
                fontFamily: "var(--font-mono)",
                color,
                border: `1px solid ${color}44`,
                borderRadius: 4,
                background: `${color}0D`,
                textShadow: `0 0 8px ${color}66`,
              }}
            >
              {scores[i]}/5
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state (no onboarding data) ───────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: BG, fontFamily: "var(--font-sans)", color: "#fff" }}
    >
      <div
        className="flex flex-col items-center gap-6 text-center max-w-md"
        style={glassStyle({ borderRadius: 12, padding: "48px 36px" })}
      >
        <span
          className="text-xs uppercase tracking-widest"
          style={{ fontFamily: "var(--font-mono)", color: GREEN, letterSpacing: "0.14em" }}
        >
          Xrivu.01 · No Profile Found
        </span>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-sans)" }}>
          Complete onboarding to build your skill radar
        </h1>
        <p className="text-sm" style={{ fontFamily: "var(--font-sans)", color: "rgba(255,255,255,0.45)" }}>
          We need a few answers about your experience before we can generate your DevPulse match analysis.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold transition-all duration-300 ease-in-out hover:brightness-110"
          style={{ fontFamily: "var(--font-sans)", background: YELLOW, color: BG, borderRadius: 12, boxShadow: `0 0 20px ${YELLOW}40` }}
        >
          Start Onboarding
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobMatchPage() {
  const [compareMode, setCompareMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [candidateScores, setCandidateScores] = useState<number[] | null>(null);
  const analysisRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCandidateScores(computeCandidateScores(loadAnswers()));
    setHydrated(true);
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const } }),
  };

  // Wait for client hydration before deciding what to render (avoids 0% flash)
  if (!hydrated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: BG, fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.4)" }}
      >
        <span className="text-xs uppercase tracking-widest">Loading skill radar…</span>
      </div>
    );
  }

  // No onboarding answers → guide the user back to onboarding
  if (!candidateScores) {
    return <EmptyState />;
  }

  const matchPct = computeMatchPct(candidateScores);
  const strengths = computeStrengths(candidateScores);
  const gaps = computeGaps(candidateScores);
  const actions = buildActions(gaps);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: BG, fontFamily: "var(--font-sans)", color: "#fff" }}
    >
      {/* ── Top bar ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
        style={{ background: `${BG}E0`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${GLASS_BORDER}` }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-mono)", color: "#fff" }}
          >
            DevPulse
          </span>
          <span style={{ color: GLASS_BORDER }}>·</span>
          <span
            className="text-xs"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.35)" }}
          >
            Job Match Analysis
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Compare toggle */}
          <button
            onClick={() => setCompareMode((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs transition-all duration-300"
            style={{
              fontFamily: "var(--font-mono)",
              border: `1px solid ${compareMode ? GREEN : GLASS_BORDER}`,
              borderRadius: 8,
              color: compareMode ? GREEN : "rgba(255,255,255,0.4)",
              background: compareMode ? `${GREEN}10` : "transparent",
              textShadow: compareMode ? `0 0 8px ${GREEN}` : "none",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: compareMode ? GREEN : "rgba(255,255,255,0.2)" }}
            />
            Compare Radars
          </button>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: GREEN,
                boxShadow: `0 0 8px ${GREEN}`,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <span
              className="text-xs"
              style={{ fontFamily: "var(--font-mono)", color: GREEN, letterSpacing: "0.1em" }}
            >
              XRIVU.01 ACTIVE
            </span>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 lg:px-12 py-10 max-w-[1440px] mx-auto">

        {/* ── Page title ── */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.3)" }}
          >
            Powered by Xrivu.01
          </p>
          <h1
            className="text-3xl md:text-4xl font-bold leading-tight"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Job Match Analysis
          </h1>
        </motion.div>

        {/* ── Radar row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial="hidden" animate="visible" custom={0} variants={fadeUp}
          >
            {compareMode ? (
              <RadarPanel
                mode="compare"
                title="Radar Comparison"
                subtext="Company vs. Candidate overlay"
                scores={candidateScores}
                candidateScores={candidateScores}
                color={GREEN}
              />
            ) : (
              <RadarPanel
                mode="company"
                title="What Acme Corp is Looking For"
                subtext="Requirement profile set during company onboarding"
                scores={COMPANY_SCORES}
                color={GREEN}
              />
            )}
          </motion.div>

          {!compareMode && (
            <motion.div
              initial="hidden" animate="visible" custom={1} variants={fadeUp}
            >
              <RadarPanel
                mode="candidate"
                title="Your Skill Radar"
                subtext="Built from your onboarding answers and activity on DevPulse"
                scores={candidateScores}
                color={YELLOW}
              />
            </motion.div>
          )}

          {compareMode && (
            <motion.div
              initial="hidden" animate="visible" custom={1} variants={fadeUp}
              className="flex flex-col gap-3 justify-center"
              style={glassStyle({ borderRadius: 12, padding: "28px 24px" })}
            >
              <p
                className="text-xs uppercase tracking-widest mb-4"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.35)" }}
              >
                Legend
              </p>
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-3 h-3 rounded-full" style={{ background: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: GREEN }}>Company Requirements</span>
                  </div>
                  {AXES.map((a, i) => (
                    <div key={a} className="flex justify-between items-center py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{a}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: GREEN }}>{COMPANY_SCORES[i]}/5</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-3 h-3 rounded-full" style={{ background: YELLOW, boxShadow: `0 0 8px ${YELLOW}` }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: YELLOW }}>Your Scores</span>
                  </div>
                  {AXES.map((a, i) => (
                    <div key={a} className="flex justify-between items-center py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{a}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: YELLOW }}>{candidateScores[i]}/5</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Xrivu.01 Analysis Panel ── */}
        <motion.div
          ref={analysisRef}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={glassStyle({ borderRadius: 12, padding: "40px 36px" })}
        >
          {/* Panel header */}
          <div className="flex flex-col md:flex-row md:items-center gap-8 mb-10 pb-8" style={{ borderBottom: `1px solid ${GLASS_BORDER}` }}>
            <div className="flex-1">
              <p
                className="text-xs uppercase tracking-widest mb-3"
                style={{ fontFamily: "var(--font-mono)", color: GREEN, letterSpacing: "0.14em" }}
              >
                AI AGENT · XRIVU.01
              </p>
              <h2
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <Typewriter text="Match Probability Report" delay={200} />
              </h2>
              <p
                className="text-sm"
                style={{ fontFamily: "var(--font-sans)", color: "rgba(255,255,255,0.45)", maxWidth: 480 }}
              >
                Based on cross-analysis of company requirements vs. your current skill radar
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MatchGauge pct={matchPct} />
              <p
                className="text-xs text-center"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.3)", maxWidth: 140 }}
              >
                Cross-analysis complete
              </p>
            </div>
          </div>

          {/* Strengths + Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Strengths */}
            <div>
              <p
                className="text-xs uppercase tracking-widest mb-5"
                style={{ fontFamily: "var(--font-mono)", color: GREEN }}
              >
                Strengths Detected
              </p>
              <div className="flex flex-col gap-4">
                {strengths.length === 0 && (
                  <p className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.35)" }}>
                    No axes above requirement yet — focus on the gaps below.
                  </p>
                )}
                {strengths.map(({ axis, detail }, i) => (
                  <motion.div
                    key={axis}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.4 }}
                    className="flex gap-3"
                    style={{ padding: "14px 16px", borderRadius: 8, background: `${GREEN}0A`, border: `1px solid ${GREEN}22` }}
                  >
                    <CheckCircle2
                      className="shrink-0 mt-0.5"
                      size={16}
                      style={{ color: GREEN, filter: `drop-shadow(0 0 4px ${GREEN})` }}
                    />
                    <div>
                      <p
                        className="text-sm font-medium mb-0.5"
                        style={{ fontFamily: "var(--font-sans)", color: "#fff" }}
                      >
                        {axis}
                      </p>
                      <p
                        className="text-xs"
                        style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.45)" }}
                      >
                        {detail}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Gaps */}
            <div>
              <p
                className="text-xs uppercase tracking-widest mb-5"
                style={{ fontFamily: "var(--font-mono)", color: YELLOW }}
              >
                Gaps to Close
              </p>
              <div className="flex flex-col gap-4">
                {gaps.length === 0 && (
                  <p className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.35)" }}>
                    No gaps detected — you meet or exceed every requirement.
                  </p>
                )}
                {gaps.map(({ axis, detail }, i) => (
                  <motion.div
                    key={axis}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.4 }}
                    className="flex gap-3"
                    style={{ padding: "14px 16px", borderRadius: 8, background: `${YELLOW}08`, border: `1px solid ${YELLOW}22` }}
                  >
                    <AlertTriangle
                      className="shrink-0 mt-0.5"
                      size={16}
                      style={{ color: YELLOW, filter: `drop-shadow(0 0 4px ${YELLOW})` }}
                    />
                    <div>
                      <p
                        className="text-sm font-medium mb-0.5"
                        style={{ fontFamily: "var(--font-sans)", color: "#fff" }}
                      >
                        {axis}
                      </p>
                      <p
                        className="text-xs"
                        style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.45)" }}
                      >
                        {detail}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Xrivu.01 Recommends */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              borderRadius: 12,
              padding: "28px 28px",
              background: "rgba(255,255,255,0.02)",
              border: `1px solid rgba(255,255,255,0.07)`,
              marginBottom: 32,
            }}
          >
            <p
              className="text-xs uppercase tracking-widest mb-6"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em" }}
            >
              Xrivu.01 Recommends
            </p>
            <div className="flex flex-col gap-4">
              {actions.map(({ num, icon: Icon, text }, i) => (
                <motion.div
                  key={num}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                  className="flex items-start gap-4"
                >
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: `${YELLOW}10`,
                      border: `1px solid ${YELLOW}30`,
                    }}
                  >
                    <Icon size={15} style={{ color: YELLOW }} />
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <span
                      className="text-xs shrink-0"
                      style={{ fontFamily: "var(--font-mono)", color: YELLOW, opacity: 0.7 }}
                    >
                      {num}
                    </span>
                    <p
                      className="text-sm"
                      style={{ fontFamily: "var(--font-sans)", color: "rgba(255,255,255,0.75)" }}
                    >
                      {text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-7 py-3 text-sm font-semibold transition-all duration-300"
              style={{
                fontFamily: "var(--font-sans)",
                background: YELLOW,
                color: BG,
                borderRadius: 8,
                boxShadow: `0 0 0 0 ${YELLOW}`,
                transition: "box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 28px ${YELLOW}55, 0 0 60px ${YELLOW}20`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 0 transparent";
              }}
            >
              Generate Full Career Roadmap
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </motion.div>

      </main>

      {/* pulse keyframe */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}

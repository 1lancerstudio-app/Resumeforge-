"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { saveAnswers } from "@/lib/devpulse-data";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step =
  | { type: "single" | "multi"; question: string; options: string[] }
  | { type: "text"; question: string; placeholder: string };

type Answers = Record<number, string | string[]>;

// ─── Steps data ───────────────────────────────────────────────────────────────

const STEPS: Step[] = [
  {
    type: "single",
    question: "What best describes you right now?",
    options: [
      "Full-Stack Developer",
      "Frontend Developer",
      "Backend Developer",
      "AI / ML Engineer",
      "Mobile Developer",
      "DevOps / Security",
      "Open Source Contributor",
      "Student / Learning",
    ],
  },
  {
    type: "single",
    question: "How many years have you been coding?",
    options: [
      "Less than 1 year",
      "1 – 2 years",
      "3 – 5 years",
      "6 – 9 years",
      "10+ years",
      "Self-taught, no fixed timeline",
    ],
  },
  {
    type: "multi",
    question: "Which languages do you work with?",
    options: [
      "JavaScript",
      "TypeScript",
      "Python",
      "Rust",
      "Go",
      "Java",
      "C++",
      "Swift",
      "Kotlin",
      "PHP",
      "Ruby",
      "Dart",
      "Solidity",
      "SQL",
      "Bash",
      "R",
    ],
  },
  {
    type: "multi",
    question: "What kind of work excites you most?",
    options: [
      "Building Products",
      "Open Source",
      "Freelance / Contract",
      "Research & Papers",
      "Teaching & Mentoring",
      "Hackathons",
      "Startup Life",
      "Enterprise Work",
      "Side Projects",
      "Web3 / Crypto",
    ],
  },
  {
    type: "single",
    question: "What's your current situation?",
    options: [
      "Open to full-time roles",
      "Freelancing actively",
      "Employed, not looking",
      "Employed, open to offers",
      "Student, exploring",
      "Taking a break",
    ],
  },
  {
    type: "single",
    question: "How do you prefer to work?",
    options: [
      "Remote only",
      "Hybrid (flexible)",
      "On-site preferred",
      "Doesn't matter to me",
      "Contract / Project basis",
      "Async-first teams",
    ],
  },
  {
    type: "text",
    question: "In one line — what's your dev superpower?",
    placeholder: "e.g. I turn messy APIs into clean systems in hours",
  },
];

const TOTAL = STEPS.length;

// ─── Chip component ───────────────────────────────────────────────────────────

function Chip({
  label,
  selected,
  isMulti,
  onClick,
}: {
  label: string;
  selected: boolean;
  isMulti: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      animate={
        selected
          ? { scale: 1.04 }
          : { scale: 1 }
      }
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="relative px-5 py-3 rounded-[14px] text-sm font-sans font-medium transition-colors duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      style={
        selected
          ? {
              background: isMulti ? "#00FF94" : "#E8FF00",
              color: "#000",
              border: "1px solid transparent",
              boxShadow: isMulti
                ? "0 0 16px rgba(0,255,148,0.35), 0 0 4px rgba(0,255,148,0.2)"
                : "0 0 16px rgba(232,255,0,0.35), 0 0 4px rgba(232,255,0,0.2)",
            }
          : {
              background: "#1A1A24",
              color: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "none",
            }
      }
    >
      {selected && (
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: isMulti ? "#00FF94" : "#E8FF00" }}
        >
          <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />
        </motion.span>
      )}
      {label}
    </motion.button>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const pct = ((step + 1) / TOTAL) * 100;
  return (
    <div className="w-full h-[2px] rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: "#E8FF00" }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />
    </div>
  );
}

// ─── Completion screen ────────────────────────────────────────────────────────

function CompletionScreen() {
  const [loadingDone, setLoadingDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoadingDone(true), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-8 text-center"
    >
      {/* Animated checkmark */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: "2px solid #E8FF00" }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "backOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "rgba(232,255,0,0.08)" }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4, ease: "backOut" }}
        >
          <Check
            className="w-10 h-10"
            style={{ color: "#E8FF00" }}
            strokeWidth={2.5}
          />
        </motion.div>
      </div>

      <div className="flex flex-col gap-3">
        <h2
          className="text-3xl sm:text-4xl font-sans font-semibold tracking-tight"
          style={{ color: "#fff" }}
        >
          Your Dev Profile is Live
        </h2>
        <p className="font-mono text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          Xrivu.01 is building your skill radar now...
        </p>
      </div>

      {/* Loading bar */}
      <div
        className="w-64 h-[2px] rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "#E8FF00" }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </div>

      <AnimatePresence>
        {loadingDone && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/devpulse"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[14px] font-sans font-semibold text-sm text-black transition-all duration-200 hover:brightness-110 active:scale-95"
              style={{
                background: "#E8FF00",
                boxShadow: "0 0 24px rgba(232,255,0,0.3)",
              }}
            >
              Enter DevPulse
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = STEPS[step];

  // Derive current answer
  const currentAnswer = answers[step];
  const hasAnswer =
    current.type === "text"
      ? typeof currentAnswer === "string" && currentAnswer.trim().length > 0
      : current.type === "single"
      ? typeof currentAnswer === "string"
      : Array.isArray(currentAnswer) && currentAnswer.length > 0;

  function selectSingle(option: string) {
    setAnswers((prev) => ({ ...prev, [step]: option }));
  }

  function toggleMulti(option: string) {
    setAnswers((prev) => {
      const curr = (prev[step] as string[]) ?? [];
      const next = curr.includes(option)
        ? curr.filter((x) => x !== option)
        : [...curr, option];
      return { ...prev, [step]: next };
    });
  }

  function handleText(val: string) {
    setAnswers((prev) => ({ ...prev, [step]: val }));
  }

  function goNext() {
    if (!hasAnswer) return;
    if (step === TOTAL - 1) {
      // Persist the full answer object so DevPulse can build the skill radar
      const finalAnswers = { ...answers, [step]: currentAnswer };
      saveAnswers(finalAnswers);
      if (typeof window !== "undefined") {
        console.log("[v0] onboarding answers collected:", finalAnswers);
      }
      setDone(true);
      return;
    }
    setDir(1);
    setStep((s) => s + 1);
  }

  function goBack() {
    if (step === 0) return;
    setDir(-1);
    setStep((s) => s - 1);
  }

  // Auto-focus text input
  useEffect(() => {
    if (current.type === "text" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step, current.type]);

  const slideVariants = {
    enter: (d: number) => ({ x: d * 48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d * -48, opacity: 0 }),
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0A0A0F" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 sm:px-10 pt-8">
        <span className="font-sans text-sm font-semibold tracking-tight" style={{ color: "rgba(255,255,255,0.5)" }}>
          RESUMEFORGE <span style={{ color: "#E8FF00" }}>AI</span>
        </span>
        {!done && (
          <span
            className="font-mono text-sm tabular-nums"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {String(step + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
          </span>
        )}
      </header>

      {/* Progress */}
      {!done && (
        <div className="px-6 sm:px-10 mt-5">
          <ProgressBar step={step} />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 sm:px-10 py-12">
        <div className="w-full max-w-2xl">
          {done ? (
            <CompletionScreen />
          ) : (
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={step}
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                  className="flex flex-col gap-10"
                >
                  {/* Question */}
                  <h1
                    className="text-3xl sm:text-4xl font-sans font-semibold tracking-tight leading-tight text-balance"
                    style={{ color: "#fff" }}
                  >
                    {current.question}
                    {current.type === "multi" && (
                      <span
                        className="ml-3 font-mono text-sm align-middle"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      >
                        pick many
                      </span>
                    )}
                  </h1>

                  {/* Options */}
                  {current.type !== "text" ? (
                    <div className="flex flex-wrap gap-3">
                      {current.options.map((opt) => {
                        const isSel =
                          current.type === "single"
                            ? currentAnswer === opt
                            : Array.isArray(currentAnswer) &&
                              currentAnswer.includes(opt);
                        return (
                          <Chip
                            key={opt}
                            label={opt}
                            selected={isSel}
                            isMulti={current.type === "multi"}
                            onClick={() =>
                              current.type === "single"
                                ? selectSingle(opt)
                                : toggleMulti(opt)
                            }
                          />
                        );
                      })}
                    </div>
                  ) : (
                    /* Text input */
                    <div className="flex flex-col gap-2">
                      <div
                        className="relative"
                        style={{
                          borderBottom: `2px solid ${
                            typeof currentAnswer === "string" && currentAnswer.length > 0
                              ? "#E8FF00"
                              : "rgba(255,255,255,0.15)"
                          }`,
                          transition: "border-color 0.2s",
                        }}
                      >
                        <input
                          ref={inputRef}
                          type="text"
                          maxLength={80}
                          value={(currentAnswer as string) ?? ""}
                          onChange={(e) => handleText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && goNext()}
                          placeholder={current.placeholder}
                          className="w-full bg-transparent pb-3 text-lg font-sans outline-none placeholder:opacity-30"
                          style={{ color: "#fff", caretColor: "#E8FF00" }}
                        />
                      </div>
                      <div className="flex justify-end">
                        <span
                          className="font-mono text-xs tabular-nums"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                          {((currentAnswer as string) ?? "").length} / 80
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Footer nav */}
      {!done && (
        <footer className="flex items-center justify-between px-6 sm:px-10 pb-10">
          {step === 0 ? (
            <Link
              href="/"
              className="flex items-center gap-2 font-mono text-sm transition-opacity duration-300 ease-in-out hover:opacity-70"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Exit
            </Link>
          ) : (
            <button
              onClick={goBack}
              className="flex items-center gap-2 font-mono text-sm transition-opacity duration-300 ease-in-out hover:opacity-70"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}

          <AnimatePresence>
            {hasAnswer && (
              <motion.button
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.22 }}
                onClick={goNext}
                className="flex items-center gap-2 px-7 py-3 rounded-[14px] font-sans font-semibold text-sm text-black transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
                style={{
                  background: "#E8FF00",
                  boxShadow: "0 0 20px rgba(232,255,0,0.28)",
                }}
              >
                {step === TOTAL - 1 ? "Finish" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </footer>
      )}
    </div>
  );
}

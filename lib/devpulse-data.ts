// ─────────────────────────────────────────────────────────────────────────────
// DevPulse shared data layer
// Persists onboarding answers and maps them to the 6 radar axes,
// computes match %, and derives strengths / gaps dynamically.
// ─────────────────────────────────────────────────────────────────────────────

export const AXES = [
  "Technical Skill Depth",
  "System Design Thinking",
  "Communication & Docs",
  "Collaboration & Team Fit",
  "Problem-Solving Speed",
  "Domain Knowledge",
] as const;

// Company requirement profile (set during company onboarding — defaults for now).
export const COMPANY_SCORES = [4, 3, 4, 3, 5, 4];

export type OnboardingAnswers = Record<number, string | string[]>;

const STORAGE_KEY = "resumeforge_onboarding_v1";

// ─── Persistence ──────────────────────────────────────────────────────────────

export function saveAnswers(answers: OnboardingAnswers) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  } catch {
    /* storage may be unavailable (private mode) — fail silently */
  }
}

export function loadAnswers(): OnboardingAnswers | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as OnboardingAnswers;
    return null;
  } catch {
    return null;
  }
}

export function clearAnswers() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

// ─── Scoring lookup tables ──────────────────────────────────────────────────────

const clamp = (n: number, min = 1, max = 5) => Math.min(max, Math.max(min, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

// Q1 — role identity → System Design Thinking baseline
const ROLE_DESIGN: Record<string, number> = {
  "Full-Stack Developer": 3.6,
  "Frontend Developer": 2.8,
  "Backend Developer": 3.9,
  "AI / ML Engineer": 4.1,
  "Mobile Developer": 3.1,
  "DevOps / Security": 4.3,
  "Open Source Contributor": 3.7,
  "Student / Learning": 1.9,
};

// Q2 — years of experience → Technical Skill Depth base
const YEARS_DEPTH: Record<string, number> = {
  "Less than 1 year": 1.5,
  "1 – 2 years": 2.5,
  "3 – 5 years": 3.5,
  "6 – 9 years": 4.3,
  "10+ years": 4.8,
  "Self-taught, no fixed timeline": 3.0,
};

// Q5 — current situation → Collaboration component
const STATUS_COLLAB: Record<string, number> = {
  "Open to full-time roles": 3.6,
  "Freelancing actively": 3.0,
  "Employed, not looking": 4.0,
  "Employed, open to offers": 3.9,
  "Student, exploring": 2.6,
  "Taking a break": 2.8,
};

// Q6 — work preference → Collaboration component
const WORKPREF_COLLAB: Record<string, number> = {
  "Remote only": 3.0,
  "Hybrid (flexible)": 4.1,
  "On-site preferred": 4.3,
  "Doesn't matter to me": 3.8,
  "Contract / Project basis": 3.2,
  "Async-first teams": 3.6,
};

// ─── Candidate radar computation ─────────────────────────────────────────────────

function asString(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}
function asArray(v: string | string[] | undefined): string[] {
  return Array.isArray(v) ? v : [];
}

/**
 * Maps onboarding answers (keyed by step index 0-6) to 6 radar scores (1-5).
 * Returns null when there are no usable answers (so callers can show an empty state).
 */
export function computeCandidateScores(answers: OnboardingAnswers | null): number[] | null {
  if (!answers || Object.keys(answers).length === 0) return null;

  const role = asString(answers[0]);
  const years = asString(answers[1]);
  const languages = asArray(answers[2]);
  const interests = asArray(answers[3]);
  const status = asString(answers[4]);
  const workPref = asString(answers[5]);
  const superpower = asString(answers[6]);

  // 1 — Technical Skill Depth = years base + language breadth modifier
  const yearsBase = YEARS_DEPTH[years] ?? 2.5;
  const langModifier = Math.min(languages.length * 0.18, 1.2);
  const technicalSkillDepth = clamp(yearsBase + langModifier);

  // 2 — System Design Thinking = role baseline + small experience lift
  const roleBase = ROLE_DESIGN[role] ?? 2.8;
  const systemDesign = clamp(roleBase + (yearsBase >= 4 ? 0.4 : 0));

  // 3 — Communication & Docs = base + superpower text signal
  const txt = superpower.toLowerCase();
  const docKeyword = /(doc|write|writ|clean|explain|mentor|teach|communicat)/.test(txt) ? 0.8 : 0;
  const lengthSignal = Math.min(superpower.trim().length / 80, 1) * 1.2;
  const communication = clamp(2.6 + docKeyword + lengthSignal);

  // 4 — Collaboration & Team Fit = avg(status, work preference)
  const statusScore = STATUS_COLLAB[status] ?? 3.0;
  const workScore = WORKPREF_COLLAB[workPref] ?? 3.0;
  const collaboration = clamp((statusScore + workScore) / 2);

  // 5 — Problem-Solving Speed = derived from depth + hands-on interests
  const handsOn =
    (interests.includes("Hackathons") ? 0.6 : 0) +
    (interests.includes("Side Projects") ? 0.3 : 0) +
    (interests.includes("Building Products") ? 0.3 : 0);
  const problemSolving = clamp(technicalSkillDepth * 0.6 + 1.6 + handsOn);

  // 6 — Domain Knowledge = interest breadth
  const domainKnowledge = clamp(2.0 + interests.length * 0.45);

  return [
    round1(technicalSkillDepth),
    round1(systemDesign),
    round1(communication),
    round1(collaboration),
    round1(problemSolving),
    round1(domainKnowledge),
  ];
}

// ─── Match % ────────────────────────────────────────────────────────────────────

/**
 * Match % = mean across axes of min(candidate / company, 1), as a percentage.
 * Meeting or exceeding a requirement gives full credit on that axis.
 */
export function computeMatchPct(candidate: number[], company: number[] = COMPANY_SCORES): number {
  if (!candidate.length) return 0;
  const ratios = company.map((req, i) => {
    if (req <= 0) return 1;
    return Math.min(candidate[i] / req, 1);
  });
  const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  return Math.round(mean * 100);
}

// ─── Strengths & gaps ─────────────────────────────────────────────────────────────

export type Insight = { axis: string; detail: string; delta: number };

export function computeStrengths(candidate: number[], company: number[] = COMPANY_SCORES): Insight[] {
  return AXES.map((axis, i) => ({
    axis,
    delta: round1(candidate[i] - company[i]),
    detail:
      candidate[i] >= company[i]
        ? `Above required threshold by ${round1(candidate[i] - company[i])} points`
        : `Approaching requirement (${candidate[i]}/${company[i]})`,
  }))
    .filter((x) => x.delta >= 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 3);
}

export function computeGaps(candidate: number[], company: number[] = COMPANY_SCORES): Insight[] {
  const FIXES: Record<string, string> = {
    "Technical Skill Depth": "Add 1–2 advanced projects demonstrating depth in your primary stack",
    "System Design Thinking": "Contribute to architecture discussions or publish system-design posts",
    "Communication & Docs": "Document a project end-to-end and publish a technical write-up",
    "Collaboration & Team Fit": "Join a team project or pair-program to build collaboration signal",
    "Problem-Solving Speed": "Practice timed challenges and ship more side projects",
    "Domain Knowledge": "Complete 2 domain-specific courses and link credentials to your profile",
  };
  return AXES.map((axis, i) => ({
    axis,
    delta: round1(company[i] - candidate[i]),
    detail: FIXES[axis] ?? "Strengthen this area with focused practice",
  }))
    .filter((x) => x.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 3);
}

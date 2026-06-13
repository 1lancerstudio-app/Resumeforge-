"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DecorativePanel } from "@/components/auth/decorative-panel";

interface QuestionnaireData {
  experience?: "entry" | "mid" | "senior";
  industry?: string;
  skills?: string[];
  jobTitle?: string;
  targetRole?: string;
  expectations?: string;
}

const QUESTIONS = [
  {
    id: "experience",
    title: "What's your experience level?",
    type: "single",
    options: [
      { value: "entry", label: "Entry Level (0-2 years)" },
      { value: "mid", label: "Mid Level (2-5 years)" },
      { value: "senior", label: "Senior (5+ years)" },
    ],
  },
  {
    id: "jobTitle",
    title: "What's your current/most recent job title?",
    type: "text",
    placeholder: "e.g., Frontend Developer, Product Manager",
  },
  {
    id: "industry",
    title: "What industry are you in?",
    type: "text",
    placeholder: "e.g., Tech, Finance, Healthcare",
  },
  {
    id: "targetRole",
    title: "What's your target role?",
    type: "text",
    placeholder: "e.g., Senior Product Designer, Tech Lead",
  },
  {
    id: "skills",
    title: "What are your top 3 skills?",
    type: "text",
    placeholder: "e.g., React, Node.js, AWS (comma-separated)",
  },
  {
    id: "expectations",
    title: "What do you expect from ResumeForge?",
    type: "textarea",
    placeholder: "e.g., Help me land a role at a top tech company, Get more interviews, etc.",
  },
];

export default function QuestionnairePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<QuestionnaireData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<"candidate" | "recruiter" | null>(null);

  useEffect(() => {
    // Check if user came from signup
    const storedRole = localStorage.getItem("resumeforge_role");
    const isNewUser = localStorage.getItem("resumeforge_new_user");

    if (!storedRole || isNewUser !== "true") {
      router.replace("/chat");
      return;
    }

    setRole(storedRole as "candidate" | "recruiter");
    setIsLoading(false);
  }, [router]);

  if (isLoading) return null;

  if (role === "recruiter") {
    router.push("/recruiter");
    return null;
  }

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save questionnaire data
      localStorage.setItem(
        "resumeforge_questionnaire",
        JSON.stringify(data)
      );
      localStorage.setItem("resumeforge_new_user", "false");
      router.push("/chat");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTextChange = (value: string) => {
    setData((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleSkillsChange = (value: string) => {
    const skillsArray = value.split(",").map((s) => s.trim());
    setData((prev) => ({
      ...prev,
      skills: skillsArray,
    }));
  };

  const handleSingleSelect = (value: string) => {
    setData((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
    // Auto-advance for single-select questions
    setTimeout(() => handleNext(), 300);
  };

  const getInputValue = () => {
    if (currentQuestion.id === "skills") {
      return (data.skills || []).join(", ");
    }
    return (data[currentQuestion.id as keyof QuestionnaireData] as string) || "";
  };

  const isAnswered = () => {
    const value = data[currentQuestion.id as keyof QuestionnaireData];
    if (currentQuestion.type === "single") return !!value;
    if (currentQuestion.id === "skills") {
      return Array.isArray(value) && value.length > 0 && value.some((s) => s.trim().length > 0);
    }
    if (typeof value === "string") return value.trim().length > 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Form side */}
      <div className="flex-1 flex flex-col py-12 px-8 sm:px-16 lg:px-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handleBack}
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
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground border border-border px-2 py-1">
            ONBOARDING
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-12">
          <div className="h-1 w-full bg-border rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-foreground transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            Question {currentStep + 1} of {QUESTIONS.length}
          </p>
        </div>

        {/* Question */}
        <div className="flex flex-col flex-1 justify-center max-w-lg">
          <h1 className="font-display text-[48px] leading-[0.95] tracking-tight text-foreground mb-10">
            {currentQuestion.title}
          </h1>

          {/* Single Select Options */}
          {currentQuestion.type === "single" && (
            <div className="flex flex-col gap-3">
              {currentQuestion.options?.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSingleSelect(option.value)}
                  className={`relative flex items-center gap-4 p-4 border text-left transition-all duration-200 ${
                    data[currentQuestion.id as keyof QuestionnaireData] === option.value
                      ? "border-foreground/50 bg-secondary"
                      : "border-border hover:border-foreground/20"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 transition-all ${
                      data[currentQuestion.id as keyof QuestionnaireData] === option.value
                        ? "border-foreground bg-foreground"
                        : "border-border"
                    }`}
                  >
                    {data[currentQuestion.id as keyof QuestionnaireData] === option.value && (
                      <Check className="w-3 h-3 text-background" strokeWidth={3} />
                    )}
                  </div>
                  <span className="font-sans text-sm text-foreground">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Text Input */}
          {currentQuestion.type === "text" && (
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={getInputValue()}
                onChange={(e) => {
                  if (currentQuestion.id === "skills") {
                    handleSkillsChange(e.target.value);
                  } else {
                    handleTextChange(e.target.value);
                  }
                }}
                placeholder={currentQuestion.placeholder}
                autoFocus
                className="bg-input border border-border rounded-sm px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30"
              />
            </div>
          )}

          {/* Textarea */}
          {currentQuestion.type === "textarea" && (
            <div className="flex flex-col gap-4">
              <textarea
                value={getInputValue()}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={currentQuestion.placeholder}
                autoFocus
                rows={4}
                className="bg-input border border-border rounded-sm px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 resize-none"
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-12">
            {currentStep > 0 && (
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                className="border-border hover:bg-secondary rounded-full px-8 h-12 text-sm font-sans"
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              onClick={handleNext}
              disabled={!isAnswered()}
              className="flex-1 bg-foreground text-background hover:bg-foreground/90 rounded-full h-12 text-sm font-sans disabled:opacity-30"
            >
              {currentStep === QUESTIONS.length - 1 ? "Complete" : "Next"} →
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative right panel */}
      <div className="hidden lg:flex lg:w-[45%]">
        <DecorativePanel quote="Your answers help us tailor your resume experience perfectly." />
      </div>
    </div>
  );
}

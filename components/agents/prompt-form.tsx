"use client";

import { useState } from "react";
import { Sparkles, Loader2, Link as LinkIcon, X, CheckCircle, AlertCircle } from "lucide-react";

const CATEGORIES = [
  "Resume Bullet",
  "Cover Letter",
  "Summary",
  "LinkedIn Bio",
  "Cold Email",
  "Interview Prep",
  "Job Description",
  "Reference Request",
];

const TONES = [
  "Professional",
  "Technical",
  "Executive",
  "Casual",
  "Confident",
  "Concise",
];

export interface GenerateParams {
  topic: string;
  tone: string;
  category: string;
  context: string;
}

interface PromptFormProps {
  onGenerate: (params: GenerateParams) => void;
  isLoading: boolean;
}

type ScrapeStatus = "idle" | "loading" | "success" | "error";

export function PromptForm({ onGenerate, isLoading }: PromptFormProps) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [category, setCategory] = useState("Resume Bullet");
  const [context, setContext] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [scrapeStatus, setScrapeStatus] = useState<ScrapeStatus>("idle");
  const [scrapeError, setScrapeError] = useState("");
  const [scrapedSource, setScrapedSource] = useState("");

  const handleScrape = async () => {
    if (!urlInput.trim()) return;
    setScrapeStatus("loading");
    setScrapeError("");
    setScrapedSource("");

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setScrapeStatus("error");
        setScrapeError(data.error ?? "Failed to scrape URL");
        return;
      }
      const scraped = `[Scraped from ${data.title}]:\n${data.content}`;
      setContext((prev) => (prev ? `${prev}\n\n${scraped}` : scraped));
      setScrapedSource(data.title);
      setScrapeStatus("success");
    } catch {
      setScrapeStatus("error");
      setScrapeError("Network error — could not reach the URL");
    }
  };

  const clearScrape = () => {
    setUrlInput("");
    setScrapeStatus("idle");
    setScrapeError("");
    setScrapedSource("");
    setContext("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({ topic, tone, category, context });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
      {/* URL Scraper */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          <LinkIcon className="w-3 h-3" />
          Scrape Job URL
          <span className="normal-case tracking-normal font-normal text-muted-foreground/40">optional</span>
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              if (scrapeStatus !== "idle") { setScrapeStatus("idle"); setScrapeError(""); }
            }}
            placeholder="https://jobs.ashby.io/..."
            className="flex-1 min-w-0 bg-input border border-border rounded-sm px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-foreground/30 transition-colors"
          />
          <button
            type="button"
            onClick={handleScrape}
            disabled={scrapeStatus === "loading" || !urlInput.trim()}
            className="shrink-0 flex items-center gap-1.5 border border-border bg-secondary px-3 py-2 font-mono text-xs text-foreground hover:border-foreground/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {scrapeStatus === "loading" ? <Loader2 className="w-3 h-3 animate-spin" /> : <LinkIcon className="w-3 h-3" />}
            {scrapeStatus === "loading" ? "Scraping…" : "Scrape"}
          </button>
        </div>
        {scrapeStatus === "success" && (
          <div className="flex items-center justify-between border border-border bg-secondary px-3 py-2">
            <div className="flex items-center gap-2 font-mono text-xs text-foreground">
              <CheckCircle className="w-3 h-3 shrink-0 text-green-500" />
              Scraped: <span className="font-medium">{scrapedSource}</span>
            </div>
            <button type="button" onClick={clearScrape} className="text-muted-foreground hover:text-foreground ml-2">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        {scrapeStatus === "error" && (
          <div className="flex items-center gap-2 border border-red-500/30 bg-red-500/5 px-3 py-2 font-mono text-xs text-red-400">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {scrapeError}
          </div>
        )}
      </div>

      {/* Topic */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          Topic / Goal <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Rewrite my software engineer bullets for a startup role"
          required
          className="bg-input border border-border rounded-sm px-3 py-2 font-sans text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-foreground/30 transition-colors"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Category</span>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-2.5 py-1 border font-mono text-[11px] transition-all ${
                category === cat
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-secondary text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tone chips */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Tone</span>
        <div className="flex flex-wrap gap-1.5">
          {TONES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className={`px-2.5 py-1 border font-mono text-[11px] transition-all ${
                tone === t
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-secondary text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Context textarea */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          Additional Context
          <span className="normal-case tracking-normal font-normal text-muted-foreground/40">optional</span>
        </label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Paste your current bullet, the job description, or any extra context…"
          rows={4}
          className="resize-none bg-input border border-border rounded-sm px-3 py-2 font-sans text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-foreground/30 transition-colors leading-relaxed"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !topic.trim()}
        className="flex items-center justify-center gap-2 bg-foreground text-background px-5 py-2.5 font-sans text-sm hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity mt-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Prompt
          </>
        )}
      </button>
    </form>
  );
}

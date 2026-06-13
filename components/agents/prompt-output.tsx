"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, Loader2, RefreshCw } from "lucide-react";

interface PromptOutputProps {
  output: string;
  isLoading: boolean;
  isEnhancing: boolean;
  onEnhance: () => void;
  onRegenerate: () => void;
}

export function PromptOutput({
  output,
  isLoading,
  isEnhancing,
  onEnhance,
  onRegenerate,
}: PromptOutputProps) {
  const [copied, setCopied] = useState(false);

  const isActive = isLoading || isEnhancing;
  const isEmpty = !output && !isActive;
  const isStreaming = isActive && !!output;
  const isPending = isActive && !output;

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = output ? output.split(/\s+/).filter(Boolean).length : 0;
  const charCount = output.length;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h3 className="font-mono text-xs text-foreground font-medium uppercase tracking-widest">Output</h3>
          <p className="font-mono text-[10px] text-muted-foreground mt-0.5">Your generated prompt</p>
        </div>
        {output && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRegenerate}
              disabled={isActive}
              className="flex items-center gap-1.5 border border-border px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground hover:border-foreground/30 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Redo
            </button>
            <button
              onClick={onEnhance}
              disabled={isActive}
              className="flex items-center gap-1.5 border border-border px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground hover:border-foreground/30 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Enhance
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 border border-border px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
            >
              {copied ? <><Check className="w-3 h-3 text-green-500" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
            </button>
          </div>
        )}
      </div>

      {/* Output box */}
      <div className="relative flex-1 min-h-[280px] border border-border bg-background overflow-hidden">
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="border border-border p-3.5">
              <WandIcon />
            </div>
            <div>
              <p className="font-sans text-sm font-medium text-foreground">Ready to generate</p>
              <p className="font-mono text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                Fill in the form and click <span className="text-foreground">Generate Prompt</span> to craft your perfect AI prompt.
              </p>
            </div>
          </div>
        )}

        {isPending && <GeneratingAnimation label={isEnhancing ? "Enhancing…" : "Generating…"} />}

        {output && (
          <div className="relative p-5 h-full overflow-y-auto">
            {isStreaming && (
              <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-background/60 to-transparent z-10" />
            )}
            <p className="font-mono text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {output}
              {isStreaming && (
                <span className="ml-0.5 inline-block h-[1em] w-[2px] animate-pulse bg-foreground align-text-bottom" />
              )}
            </p>
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground shrink-0">
        {output ? (
          <span>{wordCount} words &middot; {charCount} chars</span>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              isActive ? "animate-pulse bg-sky-400" : "bg-green-500"
            }`}
          />
          {isActive ? "Thinking…" : "Gemini Flash"}
        </span>
      </div>
    </div>
  );
}

function GeneratingAnimation({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
      <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
        <div className="absolute rounded-full border border-white/5" style={{ width: 100, height: 100 }} />
        <div
          className="absolute rounded-full border border-white/10"
          style={{ width: 84, height: 84, animation: "spin 3s linear infinite" }}
        >
          <span
            className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-white/70"
            style={{ boxShadow: "0 0 6px 2px rgba(255,255,255,0.4)" }}
          />
        </div>
        <div
          className="absolute rounded-full border border-white/10"
          style={{ width: 58, height: 58, animation: "spin 2s linear infinite reverse" }}
        >
          <span
            className="absolute -top-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-sky-400/80"
            style={{ boxShadow: "0 0 6px 2px rgba(56,189,248,0.5)" }}
          />
        </div>
        <div
          className="absolute rounded-full border border-white/[0.06]"
          style={{ width: 36, height: 36, animation: "spin 1.2s linear infinite" }}
        >
          <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-white/50" />
        </div>
        <div className="relative z-10 flex items-center justify-center">
          <div className="absolute h-4 w-4 rounded-full bg-white/5" style={{ animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite" }} />
          <div className="h-2.5 w-2.5 rounded-full bg-white/80" style={{ boxShadow: "0 0 8px 3px rgba(255,255,255,0.25)" }} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-xs text-muted-foreground">{label}</p>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1 w-1 rounded-full bg-muted-foreground/60" style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function WandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
      <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
      <path d="m14 7 3 3" />
      <path d="M5 6v4" />
      <path d="M19 14v4" />
      <path d="M10 2v2" />
      <path d="M7 8H3" />
      <path d="M21 16h-4" />
      <path d="M11 3H9" />
    </svg>
  );
}

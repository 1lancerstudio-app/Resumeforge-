"use client";

import { useState } from "react";
import { Clock, Copy, Check, ChevronRight } from "lucide-react";

export interface HistoryItem {
  id: string;
  topic: string;
  category: string;
  output: string;
  timestamp: Date;
}

interface PromptHistoryProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

function HistoryCard({ item, onSelect }: { item: HistoryItem; onSelect: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(item.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeLabel = item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className="group flex w-full cursor-pointer items-start gap-3 border border-border bg-card p-4 text-left transition-colors hover:border-foreground/20 hover:bg-secondary focus:outline-none"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="font-sans text-xs font-medium text-foreground truncate">{item.topic}</span>
          <span className="shrink-0 border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{item.category}</span>
        </div>
        <p className="line-clamp-2 font-mono text-[11px] leading-relaxed text-muted-foreground">{item.output}</p>
        <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground/50">
          <Clock className="w-2.5 h-2.5" />
          {timeLabel}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={handleCopy}
          className="p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-background hover:text-foreground transition-opacity"
        >
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

export function PromptHistory({ items, onSelect }: PromptHistoryProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <Clock className="w-5 h-5 text-muted-foreground/30" />
        <p className="font-mono text-xs text-muted-foreground/50">
          No prompts generated yet.<br />Your history will appear here.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <HistoryCard key={item.id} item={item} onSelect={() => onSelect(item)} />
      ))}
    </div>
  );
}

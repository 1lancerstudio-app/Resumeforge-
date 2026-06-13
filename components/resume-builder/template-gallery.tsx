"use client";

import Image from "next/image";
import { TEMPLATES, type TemplateId } from "@/lib/resume-types";
import { Check } from "lucide-react";

interface TemplateGalleryProps {
  selectedTemplate: TemplateId;
  aiSelected: TemplateId;
  onSelect: (id: TemplateId) => void;
}

export function TemplateGallery({
  selectedTemplate,
  aiSelected,
  onSelect,
}: TemplateGalleryProps) {
  const templateIds: TemplateId[] = [
    "white-business",
    "brown-auditor",
    "modern-minimalist-cv",
    "minimalist-modern",
  ];

  return (
    <div className="h-full flex flex-col border-r border-border bg-card/50 overflow-y-auto">
      {/* Header */}
      <div className="shrink-0 px-4 py-4 border-b border-border">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Template Gallery
        </p>
        <p className="font-mono text-[10px] text-muted-foreground/60 italic">
          Agent picks best match
        </p>
      </div>

      {/* Template cards */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {templateIds.map((id) => {
          const template = TEMPLATES[id];
          const isAiSelected = id === aiSelected;
          const isUserSelected = id === selectedTemplate;

          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`relative w-full text-left overflow-hidden transition-all duration-300 group cursor-pointer`}
              style={
                isAiSelected
                  ? {
                      border: "1px solid transparent",
                      background:
                        "linear-gradient(oklch(0.06 0.008 260), oklch(0.06 0.008 260)) padding-box, linear-gradient(135deg, #eca8d6, #a78bfa) border-box",
                      boxShadow: "0 0 24px rgba(236, 168, 214, 0.3)",
                    }
                  : {
                      border: `1px solid var(--color-border-tertiary)`,
                    }
              }
            >
              {/* Card inner */}
              <div className="p-3">
                {/* AI Pick badge */}
                {isAiSelected && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="font-mono text-[9px] text-green-600">
                      AI PICK
                    </span>
                  </div>
                )}

                {/* Checkmark for user selected */}
                {isUserSelected && !isAiSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/10 border border-white/30 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}

                {/* Thumbnail */}
                <div className="relative w-full aspect-[8.5/11] mb-3 rounded bg-white/5 overflow-hidden border border-white/10 group-hover:border-white/20 transition-colors">
                  <Image
                    src={`/templates/${id}.png`}
                    alt={template.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Template name */}
                <h3 className="font-display text-sm text-foreground mb-1">
                  {template.name}
                </h3>

                {/* Style badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[9px] border border-border px-2 py-0.5 rounded-full text-muted-foreground">
                    {template.style}
                  </span>
                  {template.requiresPhoto && (
                    <span className="font-mono text-[9px] text-muted-foreground/60">
                      📷 Photo
                    </span>
                  )}
                </div>

                {/* Best for */}
                <p className="font-mono text-[9px] text-muted-foreground/60">
                  {template.bestFor}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="shrink-0 px-4 py-3 border-t border-border bg-black/40">
        <p className="font-mono text-[9px] text-muted-foreground/50 italic">
          AI selects automatically. Click to override.
        </p>
      </div>
    </div>
  );
}

"use client";

import { ResumeData, TemplateId, TEMPLATES } from "@/lib/resume-types";
import { WhiteBusinessTemplate } from "./templates/white-business";
import { BrownAuditorTemplate } from "./templates/brown-auditor";
import { ModernMinimalistCVTemplate } from "./templates/modern-minimalist-cv";
import { MinimalistModernTemplate } from "./templates/minimalist-modern";
import { Download } from "lucide-react";

interface ResumePreviewProps {
  data: ResumeData;
  templateId: TemplateId;
  isComplete: boolean;
}

export function ResumePreview({
  data,
  templateId,
  isComplete,
}: ResumePreviewProps) {
  function handlePrint() {
    window.print();
  }

  const templateComponent = {
    "white-business": <WhiteBusinessTemplate data={data} />,
    "brown-auditor": <BrownAuditorTemplate data={data} />,
    "modern-minimalist-cv": <ModernMinimalistCVTemplate data={data} />,
    "minimalist-modern": <MinimalistModernTemplate data={data} />,
  }[templateId];

  return (
    <div className="h-full flex flex-col border-l border-border bg-black/40">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-border flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Preview
        </span>
        <button
          onClick={handlePrint}
          disabled={!isComplete}
          className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40 transition-colors disabled:cursor-not-allowed"
        >
          <Download className="w-3 h-3" />
          Download PDF
        </button>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-y-auto bg-background flex items-start justify-center p-4">
        <div
          id="resume-preview"
          style={{
            transform: "scale(0.65)",
            transformOrigin: "top center",
          }}
          className="bg-white shadow-lg"
        >
          {templateComponent}
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #resume-preview, #resume-preview * { visibility: visible; }
          #resume-preview {
            position: fixed;
            top: 0;
            left: 0;
            width: 595px;
            height: 842px;
            transform: scale(1);
            transform-origin: top left;
            margin: 0;
            padding: 0;
            box-shadow: none;
          }
          @page { margin: 0; }
        }
      `}</style>
    </div>
  );
}

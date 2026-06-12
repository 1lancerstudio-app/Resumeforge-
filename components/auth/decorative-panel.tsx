"use client";

interface DecorativePanelProps {
  quote: string;
}

export function DecorativePanel({ quote }: DecorativePanelProps) {
  return (
    <div className="hidden lg:flex relative flex-col justify-end p-12 overflow-hidden bg-background border-l border-border">
      {/* Gradient blobs */}
      <div
        className="blob-1 absolute top-[15%] left-[20%] w-[380px] h-[380px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #eca8d6 0%, transparent 70%)",
          opacity: 0.14,
        }}
      />
      <div
        className="blob-2 absolute top-[40%] right-[10%] w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)",
          opacity: 0.13,
        }}
      />
      <div
        className="blob-3 absolute bottom-[20%] left-[30%] w-[260px] h-[260px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #67e8f9 0%, transparent 70%)",
          opacity: 0.12,
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.94 0.005 90 / 0.03) 1px, transparent 1px), linear-gradient(90deg, oklch(0.94 0.005 90 / 0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Brand top-left */}
      <div className="absolute top-10 left-12 flex items-center gap-2">
        <span className="font-display text-lg text-foreground/60">RESUMEFORGE</span>
        <span className="font-mono text-[9px] text-foreground/30 mt-0.5">AI</span>
      </div>

      {/* Quote */}
      <div className="relative z-10 max-w-sm">
        <p className="font-display italic text-3xl leading-[1.25] text-foreground/90">
          &ldquo;{quote}&rdquo;
        </p>
        <div className="mt-6 w-12 h-px bg-foreground/20" />
      </div>
    </div>
  );
}

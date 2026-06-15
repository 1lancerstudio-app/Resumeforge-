"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, X, Plus, ArrowUp } from "lucide-react";
import { DashboardNav } from "@/components/auth/dashboard-nav";

import { AGENTS } from "@/lib/agents/agent-config"

// ─── Types ──────────────────────────────────────────────────────────────────

type AgentId = "zeus" | "athena" | "hermes" | "apollo" | "hephaestus" | "prometheus"

interface Message {
  role: "user" | "assistant"
  content: string
  agentId?: AgentId
  streaming?: boolean
}

const SUGGESTIONS = [
  "Tailor my resume for a frontend role",
  "What keywords am I missing?",
  "Write a strong summary for me",
  "How do I pass ATS filters?",
]

const NAV_LINKS = [
  { name: "My Resumes", href: "/dashboard" },
  { name: "AI Agents",  href: "/agents"    },
  { name: "Achievements", href: "/dashboard#achievements" },
  { name: "Verify",     href: "/dashboard#verify"       },
];

// ─── Typing indicator ────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60"
          style={{
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

// ─── Message bubble ──────────────────────────────────────────────────────────

function MessageBubble({ message, agentId }: { message: Message; agentId: AgentId }) {
  const isUser = message.role === "user"
  const agent = AGENTS[agentId]

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} gap-3`}>
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold text-background shrink-0 mt-1"
          style={{ background: agent.color }}
        >
          {agent.avatar}
        </div>
      )}
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[75%]`}>
        {!isUser && (
          <span className="font-mono text-[10px] text-muted-foreground mb-1 uppercase tracking-widest">
            {agent.name}
          </span>
        )}
        <div
          className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-foreground text-background rounded-lg"
              : "bg-secondary border border-border rounded-lg"
          }`}
        >
          {message.streaming ? <TypingDots /> : message.content}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const [activeAgentId, setActiveAgentId] = useState<AgentId>("zeus");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [jobUrl, setJobUrl] = useState("");
  const [showJobInput, setShowJobInput] = useState(false);
  const [userName, setUserName] = useState("there");
  const [userInitials, setUserInitials] = useState("U");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeAgent = AGENTS[activeAgentId];

  // Load user
  useEffect(() => {
    const stored = localStorage.getItem("resumeforge_user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user.name) {
          setUserName(user.name.split(" ")[0]);
          setUserInitials(
            user.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          );
        }
      } catch { /* ignore */ }
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userMsg: Message = { role: "user", content: trimmed };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput("");
      setIsStreaming(true);

      // Placeholder streaming bubble
      const streamingMsg: Message = {
        role: "assistant",
        content: "",
        agent: activeAgentId,
        streaming: true,
      };
      setMessages((prev) => [...prev, streamingMsg]);

      try {
        const apiMessages = updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            activeAgent: activeAgentId,
            jobContext: jobUrl,
          }),
        });

        if (!res.ok || !res.body) throw new Error("Failed to fetch");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m, i) =>
              i === prev.length - 1
                ? { ...m, content: accumulated, streaming: false }
                : m
            )
          );
        }
      } catch {
        setMessages((prev) =>
          prev.map((m, i) =>
            i === prev.length - 1
              ? {
                  ...m,
                  content:
                    "Sorry, something went wrong. Please check your ANTHROPIC_API_KEY and try again.",
                  streaming: false,
                }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming, activeAgentId, jobUrl]
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top nav */}
      <DashboardNav
        links={NAV_LINKS}
        rightContent={
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold text-background shrink-0"
            style={{ background: "linear-gradient(135deg, #eca8d6, #a78bfa)" }}
          >
            {userInitials}
          </div>
        }
      />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden pt-14">

        {/* ── Left agent roster (desktop) ── */}
        <aside className="hidden md:flex flex-col w-[240px] shrink-0 border-r border-border bg-background overflow-y-auto">
          <div className="px-5 pt-5 pb-3">
            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
              Agent Team
            </p>
          </div>

          <div className="flex flex-col px-3 gap-1">
            {(Object.entries(AGENTS) as [AgentId, typeof AGENTS[AgentId]][]).map(([id, agent]) => {
              const isActive = id === activeAgentId;
              return (
                <button
                  key={id}
                  onClick={() => setActiveAgentId(id)}
                  className={`flex items-center gap-3 px-3 py-3 text-left transition-all duration-200 rounded-sm ${
                    isActive
                      ? "bg-secondary"
                      : "hover:bg-secondary/50"
                  }`}
                  style={
                    isActive
                      ? {
                          boxShadow: `inset 0 0 0 1px ${agent.color}40`,
                        }
                      : {}
                  }
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: agent.color }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-sans text-sm text-foreground truncate">
                      {agent.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground truncate">
                      {agent.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Job target */}
          <div className="mt-auto px-5 pb-5 pt-6 border-t border-border">
            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-3">
              Active Job Target
            </p>
            {jobUrl ? (
              <div className="flex items-start gap-2">
                <span className="font-mono text-[10px] text-foreground/70 break-all leading-relaxed flex-1">
                  {jobUrl}
                </span>
                <button
                  onClick={() => setJobUrl("")}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : showJobInput ? (
              <div className="flex flex-col gap-2">
                <input
                  autoFocus
                  type="url"
                  placeholder="https://jobs.ashby.io/..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setShowJobInput(false);
                    if (e.key === "Escape") setShowJobInput(false);
                  }}
                  className="bg-input border border-border rounded-sm px-3 py-2 font-mono text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 w-full"
                />
              </div>
            ) : (
              <button
                onClick={() => setShowJobInput(true)}
                className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Job URL
              </button>
            )}
          </div>
        </aside>

        {/* ── Mobile agent chips ── */}
        <div className="md:hidden absolute top-14 left-0 right-0 z-10 flex gap-2 overflow-x-auto px-4 py-2 bg-background border-b border-border scrollbar-hide">
          {(Object.entries(AGENTS) as [AgentId, typeof AGENTS[AgentId]][]).map(([id, agent]) => {
            const isActive = id === activeAgentId;
            return (
              <button
                key={agent.id}
                onClick={() => setActiveAgentId(agent.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                  isActive
                    ? "border-foreground/30 bg-secondary text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/20"
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: agent.color }}
                />
                {agent.name}
              </button>
            );
          })}
        </div>

        {/* ── Chat window ── */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center justify-between px-6 h-14 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: activeAgent.accent }}
              />
              <span className="font-display text-lg text-foreground">
                {activeAgent.name}
              </span>
              <span className="font-mono text-xs text-muted-foreground hidden sm:block">
                {activeAgent.title}
              </span>
            </div>
            <button
              onClick={() => setMessages([])}
              className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear chat
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
            {messages.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center flex-1 text-center gap-6 py-16">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-mono font-bold text-background"
                  style={{
                    background: "linear-gradient(135deg, #eca8d6, #a78bfa)",
                  }}
                >
                  RF
                </div>
                <div>
                  <h2 className="font-display text-3xl text-foreground mb-3">
                    Your AI resume team is ready.
                  </h2>
                  <p className="font-mono text-sm text-muted-foreground">
                    Ask anything about your resume, a job you&apos;re targeting,
                    or your career.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="font-mono text-xs border border-border rounded-full px-4 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} agentId={msg.agentId || activeAgentId} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="border-t border-border px-4 py-3 shrink-0">
            <div className="flex items-end gap-3 bg-secondary border border-border rounded-sm px-4 py-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your agents anything..."
                rows={1}
                className="flex-1 bg-transparent font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none leading-relaxed min-h-[24px] max-h-[120px]"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center shrink-0 hover:bg-foreground/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowUp className="w-4 h-4 text-background" />
              </button>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground mt-2 text-center">
              Enter to send &middot; Shift+Enter for newline
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

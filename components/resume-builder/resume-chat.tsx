"use client";

import { useState, useRef, useEffect } from "react";
import { ResumeData, TemplateId, selectTemplate, TEMPLATES } from "@/lib/resume-types";
import { Send, Sparkles } from "lucide-react";

interface ResumeChathProps {
  onDataUpdate: (data: ResumeData) => void;
  onTemplateSelect: (id: TemplateId) => void;
  onPhotoModalOpen: () => void;
  resumeData: ResumeData;
  isComplete: boolean;
}

interface Message {
  role: "user" | "agent";
  content: string;
}

export function ResumeChat({
  onDataUpdate,
  onTemplateSelect,
  onPhotoModalOpen,
  resumeData,
  isComplete,
}: ResumeChathProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [templateSelected, setTemplateSelected] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/resume-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          fullText += chunk;

          // Parse resume fields in real time
          const fieldRegex = /<resume_field>(.*?)<\/resume_field>/gs;
          const matches = [...fullText.matchAll(fieldRegex)];
          matches.forEach((match) => {
            try {
              const { field, value } = JSON.parse(match[1]);
              onDataUpdate({
                ...resumeData,
                [field]: value,
              });
            } catch (e) {
              /* ignore parse errors */
            }
          });

          // Check if template should be selected
          if (
            !templateSelected &&
            fullText.includes("selected") &&
            resumeData.jobTitle
          ) {
            const selectedTemplate = selectTemplate(resumeData.jobTitle);
            onTemplateSelect(selectedTemplate);
            setTemplateSelected(true);

            // Check if photo is needed
            if (TEMPLATES[selectedTemplate].requiresPhoto) {
              setTimeout(() => onPhotoModalOpen(), 1000);
            }
          }

          // Check for completion
          if (fullText.includes("<resume_complete/>")) {
            setMessages((prev) => [
              ...prev,
              {
                role: "agent",
                content: fullText.replace(/<resume_complete\/>/, ""),
              },
            ]);
            setIsLoading(false);
            return;
          }
        }
      }

      setMessages((prev) => [...prev, { role: "agent", content: fullText }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content:
            "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleStart(prompt: string) {
    setHasStarted(true);
    sendMessage(prompt);
  }

  if (!hasStarted) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Sparkles className="w-10 h-10 text-[#eca8d6] mb-4" />
        <h2 className="font-display text-2xl mb-2">
          Tell me about the role.
        </h2>
        <p className="font-mono text-sm text-muted-foreground text-center mb-8">
          Paste the job URL, describe the role, or upload your old resume.
        </p>

        <div className="flex flex-col gap-2 w-full max-w-xs">
          <button
            onClick={() =>
              handleStart(
                "I want to paste a job description"
              )
            }
            className="px-4 py-2 rounded-full border border-border hover:border-foreground/50 font-mono text-xs transition-colors"
          >
            Paste a job description
          </button>
          <button
            onClick={() =>
              handleStart("I'll describe the role")
            }
            className="px-4 py-2 rounded-full border border-border hover:border-foreground/50 font-mono text-xs transition-colors"
          >
            I&apos;ll describe the role
          </button>
          <button
            onClick={() =>
              handleStart("I have an old resume to upload")
            }
            className="px-4 py-2 rounded-full border border-border hover:border-foreground/50 font-mono text-xs transition-colors"
          >
            Upload my old resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "agent" && (
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#eca8d6]" />
              </div>
            )}
            <div
              className={`max-w-xs px-4 py-2.5 rounded-lg font-sans text-sm ${
                msg.role === "user"
                  ? "bg-white/10 text-white/90"
                  : "bg-white/5 border border-white/10 text-white/80"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <span className="flex gap-1">
                <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce" />
                <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce animation-delay-100" />
                <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce animation-delay-200" />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 p-4 border-t border-border/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me more..."
            disabled={isLoading || isComplete}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 font-sans text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-white/30 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isComplete}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4 text-white/60" />
          </button>
        </form>
      </div>
    </div>
  );
}

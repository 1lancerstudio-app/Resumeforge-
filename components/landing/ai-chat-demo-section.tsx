"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, MessageSquare, Lightbulb } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export function AiChatDemoSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: MessageSquare,
      title: "Smart Conversations",
      description: "Chat with AI agents that understand resume optimization and career growth",
    },
    {
      icon: Zap,
      title: "Instant Insights",
      description: "Get real-time suggestions for improving your professional profile",
    },
    {
      icon: Lightbulb,
      title: "Career Guidance",
      description: "Receive personalized advice on skills, positioning, and interview prep",
    },
  ];

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-b from-background via-background/50 to-background">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            <span className="text-sm font-mono text-foreground/60 uppercase tracking-wider">AI-Powered Features</span>
            <span className="w-8 h-px bg-foreground/30" />
          </div>

          <h2 className="text-5xl md:text-6xl font-display tracking-tight mb-6">
            Meet Your AI Career Coach
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience an intelligent chat interface that guides you through your career journey. Ask questions, get insights, and refine your professional narrative.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`relative transition-all duration-1000 delay-${index * 100} ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <div className="p-8 rounded-2xl border border-foreground/10 hover:border-foreground/30 transition-all duration-300 hover:bg-foreground/5">
                  <Icon className="w-12 h-12 text-foreground mb-6" />
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Preview Section */}
        <div
          className={`relative rounded-3xl border border-foreground/20 overflow-hidden transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 via-background to-background" />

          <div className="relative z-10 p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Features */}
              <div>
                <h3 className="text-3xl font-display tracking-tight mb-8">
                  Advanced AI Chat Interface
                </h3>

                <ul className="space-y-4 mb-8">
                  {[
                    "Real-time voice input with visual feedback",
                    "Multiple AI model options (ChatGPT, GPT-4, etc.)",
                    "Professional workspace management",
                    "Instant action buttons for common tasks",
                    "Export and configuration options",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-foreground/80">
                      <span className="w-5 h-5 rounded-full bg-foreground/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-foreground" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className="bg-foreground hover:bg-foreground/90 text-background px-8 h-14 text-base rounded-full group"
                  asChild
                >
                  <Link href="/chat">
                    Try AI Chat Now
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>

              {/* Right: Visual Preview */}
              <div className="hidden lg:block">
                <div className="rounded-2xl bg-gradient-to-br from-background to-foreground/5 border border-foreground/10 p-8 min-h-[400px] flex flex-col items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center mx-auto">
                      <MessageSquare className="w-8 h-8 text-foreground/60" />
                    </div>
                    <h4 className="text-lg font-semibold text-foreground/80">Your AI Coach is Ready</h4>
                    <p className="text-sm text-foreground/60">
                      Sign in to access the intelligent chat interface and start your career transformation
                    </p>
                    <div className="pt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-foreground/20 rounded-full"
                        asChild
                      >
                        <Link href="/chat">Explore Chat</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          className={`mt-16 text-center transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-foreground/60 mb-6">
            Ready to revolutionize your career journey?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-foreground hover:bg-foreground/90 text-background px-8 h-14 text-base rounded-full"
              asChild
            >
              <Link href="/chat">Start Chatting</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base rounded-full border-foreground/20 hover:bg-foreground/5"
              asChild
            >
              <Link href="/signup">Build Resume First</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

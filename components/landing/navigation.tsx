"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "How It Works",  href: "#how-it-works"  },
  { name: "AI Agents",     href: "#agents"        },
  { name: "Achievements",  href: "#achievements"  },
  { name: "Verify",        href: "#verify"        },
  { name: "Pricing",       href: "#pricing"       },
  { name: "Try AI Chat",   href: "/chat",         isExternal: true },
];

export function Navigation({ isChat = false }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!isChat) {
        setIsScrolled(window.scrollY > 20);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isChat]);

  return (
    <header
      className={`${isChat ? "relative z-40" : "fixed z-50"} transition-all duration-500 ${
        !isChat && (isScrolled ? "top-4 left-4 right-4" : "top-0 left-0 right-0")
      }`}
    >
      <nav 
        className={`mx-auto transition-all duration-500 ${
          isChat
            ? "w-full bg-background/0 backdrop-blur-0 border-b border-border/10 rounded-none shadow-none max-w-full"
            : isScrolled || isMobileMenuOpen
            ? "bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-lg max-w-[1200px]"
            : "bg-transparent max-w-[1400px]"
        }`}
      >
        <div 
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isChat ? "h-16" : isScrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className={`font-display tracking-tight transition-all duration-500 ${isScrolled ? "text-xl text-foreground" : "text-2xl text-white"}`}>RESUMEFORGE</span>
            <span className={`font-mono transition-all duration-500 ${isScrolled ? "text-[9px] mt-0.5 text-muted-foreground" : "text-[10px] mt-1 text-white/60"}`}>AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm transition-colors duration-300 relative group ${link.name === "Try AI Chat" ? (isScrolled ? "text-foreground font-semibold" : "text-white font-semibold") : (isScrolled ? "text-foreground/70 hover:text-foreground" : "text-white/70 hover:text-white")}`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full ${isScrolled ? "bg-foreground" : "bg-white"}`} />
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className={`transition-all duration-500 ${isScrolled ? "text-xs text-foreground/70 hover:text-foreground" : "text-sm text-white/70 hover:text-white"}`}>
              Sign in
            </Link>
            <Button
              size="sm"
              className={`rounded-full transition-all duration-500 ${isScrolled ? "bg-foreground hover:bg-foreground/90 text-background px-4 h-8 text-xs" : "bg-white hover:bg-white/90 text-black px-6"}`}
              asChild
            >
              <Link href="/signup">Build My Resume</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 transition-colors duration-500 ${isScrolled || isMobileMenuOpen ? "text-foreground" : "text-white"}`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

      </nav>
      
      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-background z-40 transition-all duration-500 ${
          isMobileMenuOpen 
            ? "opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none"
        }`}
        style={{ top: 0 }}
      >
        <div className="flex flex-col h-full px-8 pt-28 pb-8">
          {/* Navigation Links */}
          <div className="flex-1 flex flex-col justify-center gap-8">
            {navLinks.map((link, i) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-5xl font-display transition-all duration-500 ${link.name === "Try AI Chat" ? "text-foreground font-display" : "text-foreground hover:text-muted-foreground"} ${
                  isMobileMenuOpen 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? `${i * 75}ms` : "0ms" }}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          {/* Bottom CTAs */}
          <div className={`flex gap-4 pt-8 border-t border-foreground/10 transition-all duration-500 ${
            isMobileMenuOpen 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}
          >
            <Button 
              variant="outline" 
              className="flex-1 rounded-full h-14 text-base"
              onClick={() => setIsMobileMenuOpen(false)}
              asChild
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button 
              className="flex-1 bg-foreground text-background rounded-full h-14 text-base"
              onClick={() => setIsMobileMenuOpen(false)}
              asChild
            >
              <Link href="/signup">Build My Resume</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/auth/dashboard-nav";
import { RoleGuard } from "@/components/auth/role-guard";
import { ExternalLinks } from "@/components/profile/external-links";
import { EditExternalLinks } from "@/components/profile/edit-external-links";
import type { ExternalLink } from "@/lib/external-platforms";

const navLinks = [
  { name: "My Resumes", href: "/dashboard" },
  { name: "Build Resume", href: "/resume-builder" },
  { name: "AI Agents", href: "/agents" },
  { name: "Achievements", href: "/dashboard#achievements" },
  { name: "Verify", href: "/dashboard#verify" },
];

const statCards = [
  { label: "Resumes Built", value: "0" },
  { label: "Applications Tracked", value: "0" },
  { label: "Verification Score", value: "—" },
];

export default function DashboardPage() {
  const [userName, setUserName] = useState("there");
  const [initials, setInitials] = useState("U");
  const [isEditLinksOpen, setIsEditLinksOpen] = useState(false);
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Check if user needs to complete questionnaire
    const isNewUser = localStorage.getItem("resumeforge_new_user");
    if (isNewUser === "true") {
      router.replace("/questionnaire");
      return;
    }

    const stored = localStorage.getItem("resumeforge_user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user.name) {
          const firstName = user.name.split(" ")[0];
          setUserName(firstName);
          setInitials(
            user.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          );
        }
      } catch {
        /* ignore */
      }
    }
  }, [router]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const handleSaveExternalLinks = (links: ExternalLink[]) => {
    setExternalLinks(links);
  };

  return (
    <>
      <RoleGuard required="candidate" />
      <div className="min-h-screen bg-background">
        <DashboardNav
          links={navLinks}
          rightContent={
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold text-background shrink-0"
              style={{
                background: "linear-gradient(135deg, #eca8d6, #a78bfa)",
              }}
            >
              {initials}
            </div>
          }
        />

        {/* Hero */}
        <main className="pt-14">
          <div className="px-6 lg:px-10 py-16 lg:py-24 border-b border-border">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
              Dashboard
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[0.95] mb-6">
              {greeting}, {userName}.
            </h1>
            <p className="font-mono text-sm text-muted-foreground mb-10">
              You have 0 resumes built. Let&apos;s change that.
            </p>
            <Link href="/resume-builder">
              <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 h-12 text-sm gap-2">
                <Plus className="w-4 h-4" />
                Build My First Resume
              </Button>
            </Link>
          </div>

          {/* Stat cards */}
          <div className="px-6 lg:px-10 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="border border-border bg-card p-6 flex flex-col gap-2"
                >
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                    {card.label}
                  </span>
                  <span className="font-display text-4xl text-foreground">
                    {card.value}
                  </span>
                </div>
              ))}
            </div>

            <p className="font-mono text-xs text-muted-foreground mt-12">
              Your AI agents are standing by.
            </p>
          </div>

          {/* External Links Section */}
          <div className="px-6 lg:px-10 py-16 border-t border-border">
            <ExternalLinks onEdit={() => setIsEditLinksOpen(true)} />
          </div>
        </main>

        {/* Edit External Links Modal */}
        <EditExternalLinks
          isOpen={isEditLinksOpen}
          onClose={() => setIsEditLinksOpen(false)}
          onSave={handleSaveExternalLinks}
          initialLinks={externalLinks}
        />
      </div>
    </>
  );
}

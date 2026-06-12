"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface DashboardNavProps {
  links: { name: string; href: string }[];
  rightContent?: React.ReactNode;
}

export function DashboardNav({ links, rightContent }: DashboardNavProps) {
  const router = useRouter();

  function handleSignOut() {
    localStorage.removeItem("resumeforge_role");
    localStorage.removeItem("resumeforge_user");
    router.push("/");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-xl border-b border-border flex items-center px-6 lg:px-10 gap-8">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <span className="font-display text-lg text-foreground">RESUMEFORGE</span>
        <span className="font-mono text-[9px] text-muted-foreground mt-0.5">AI</span>
      </Link>

      <nav className="hidden md:flex items-center gap-8 flex-1">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-4">
        {rightContent}
        <button
          onClick={handleSignOut}
          className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}

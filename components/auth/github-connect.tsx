"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, GitFork, ExternalLink, Unlink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const GITHUB_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

type Repo = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  topics: string[];
  pushed_at: string;
};

type GitHubProfile = {
  connected: boolean;
  login?: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
  public_repos?: number;
  followers?: number;
  html_url?: string;
  repos?: Repo[];
};

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572a5",
  Rust: "#dea584",
  Go: "#00add8",
  Java: "#b07219",
  "C++": "#f34b7d",
  Ruby: "#701516",
  Swift: "#f05138",
  Kotlin: "#a97bff",
};

export function GitHubConnect({ compact = false }: { compact?: boolean }) {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/github/repos");
      const data = await res.json();
      setProfile(data);
    } catch {
      setProfile({ connected: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    // Check for ?github=connected in URL after OAuth redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get("github")) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [fetchProfile]);

  async function handleDisconnect() {
    setDisconnecting(true);
    await fetch("/api/github/repos", { method: "DELETE" });
    setProfile({ connected: false });
    setDisconnecting(false);
  }

  function handleConnect() {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/github/callback`;
    const scope = "read:user,public_repo";
    if (clientId) {
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    } else {
      alert("GitHub OAuth is not configured yet. Add NEXT_PUBLIC_GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to your environment variables.");
    }
  }

  if (loading) {
    return (
      <div className="border border-border bg-card p-6 animate-pulse">
        <div className="h-4 w-32 bg-foreground/10 rounded mb-3" />
        <div className="h-8 w-48 bg-foreground/10 rounded" />
      </div>
    );
  }

  // ── Not connected ─────────────────────────────────────────────────────────
  if (!profile?.connected) {
    return (
      <div className="border border-border bg-card p-6 flex flex-col gap-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-1">
            GitHub Integration
          </p>
          <p className="font-sans text-sm text-muted-foreground leading-relaxed">
            Connect your GitHub profile so the Achievement Agent can discover your projects, repos, and contributions automatically.
          </p>
        </div>
        <Button
          onClick={handleConnect}
          variant="outline"
          className="w-fit border-border hover:bg-foreground hover:text-background transition-colors gap-2 rounded-full px-5 h-10 text-sm"
        >
          {GITHUB_ICON}
          Connect GitHub
        </Button>
      </div>
    );
  }

  // ── Connected ─────────────────────────────────────────────────────────────
  const repos = profile.repos ?? [];
  const topRepos = showAll ? repos : repos.slice(0, 4);
  const topLangs = [...new Set(repos.map((r) => r.language).filter(Boolean))] as string[];

  if (compact) {
    return (
      <div className="flex items-center gap-3 border border-border bg-card px-4 py-3">
        <img src={profile.avatar_url} alt={profile.login} className="w-7 h-7 rounded-full" />
        <div className="flex-1 min-w-0">
          <span className="font-mono text-xs text-foreground">{profile.login}</span>
          <span className="font-mono text-xs text-muted-foreground ml-2">{profile.public_repos} repos</span>
        </div>
        <a href={profile.html_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-border">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar_url}
            alt={profile.login}
            className="w-12 h-12 rounded-full border border-border"
          />
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-sans text-sm font-medium text-foreground">{profile.name || profile.login}</span>
              <span className="font-mono text-[10px] text-green-500 border border-green-500/30 px-1.5 py-0.5 bg-green-500/10">
                CONNECTED
              </span>
            </div>
            <a
              href={profile.html_url}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              @{profile.login}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProfile}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50"
          >
            <Unlink className="w-3 h-3" />
            Disconnect
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        {[
          { label: "Repos", value: profile.public_repos },
          { label: "Followers", value: profile.followers },
          { label: "Languages", value: topLangs.length },
        ].map(({ label, value }) => (
          <div key={label} className="px-5 py-4 text-center">
            <span className="block font-display text-2xl text-foreground">{value}</span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{label}</span>
          </div>
        ))}
      </div>

      {/* Language chips */}
      {topLangs.length > 0 && (
        <div className="flex flex-wrap gap-2 px-5 py-4 border-b border-border">
          {topLangs.slice(0, 8).map((lang) => (
            <span
              key={lang}
              className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground border border-border px-2 py-1"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: LANG_COLORS[lang] ?? "#888" }}
              />
              {lang}
            </span>
          ))}
        </div>
      )}

      {/* Repo list */}
      <div className="divide-y divide-border">
        {topRepos.map((repo) => (
          <a
            key={repo.name}
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-start justify-between px-5 py-4 hover:bg-foreground/[0.02] transition-colors group"
          >
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-foreground group-hover:underline underline-offset-2 truncate">
                  {repo.name}
                </span>
                {repo.language && (
                  <span
                    className="shrink-0 font-mono text-[9px] px-1.5 py-0.5 border border-border"
                    style={{ color: LANG_COLORS[repo.language] ?? "inherit" }}
                  >
                    {repo.language}
                  </span>
                )}
              </div>
              {repo.description && (
                <p className="font-sans text-xs text-muted-foreground line-clamp-1">
                  {repo.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0 font-mono text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {repo.stargazers_count}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="w-3 h-3" />
                {repo.forks_count}
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Show more */}
      {repos.length > 4 && (
        <div className="px-5 py-3 border-t border-border">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAll ? "Show less" : `Show all ${repos.length} repos`}
          </button>
        </div>
      )}
    </div>
  );
}

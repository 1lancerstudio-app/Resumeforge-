import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const appBase =
    process.env.NEXT_PUBLIC_APP_URL ||
    (req.headers.get("x-forwarded-proto") ?? "https") +
      "://" +
      req.headers.get("host");

  if (error || !code) {
    return NextResponse.redirect(`${appBase}/dashboard?github=error`);
  }

  // Exchange code for access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenRes.json();
  const accessToken: string = tokenData.access_token;

  if (!accessToken) {
    return NextResponse.redirect(`${appBase}/dashboard?github=error`);
  }

  // Fetch GitHub profile
  const profileRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const profile = await profileRes.json();

  // Fetch public repos (top 30 by pushed_at)
  const reposRes = await fetch(
    "https://api.github.com/user/repos?sort=pushed&per_page=30&type=owner",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const repos = await reposRes.json();

  // Summarise what we need for resume generation
  const githubData = {
    login: profile.login,
    name: profile.name,
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    public_repos: profile.public_repos,
    followers: profile.followers,
    html_url: profile.html_url,
    repos: (Array.isArray(repos) ? repos : []).map((r: Record<string, unknown>) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      html_url: r.html_url,
      topics: r.topics,
      pushed_at: r.pushed_at,
    })),
  };

  // Store in a short-lived cookie (httpOnly, 1 hour)
  const response = NextResponse.redirect(`${appBase}/dashboard?github=connected`);
  response.cookies.set("github_data", JSON.stringify(githubData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60,
    path: "/",
    sameSite: "lax",
  });

  return response;
}

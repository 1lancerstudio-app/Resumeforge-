import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const raw = req.cookies.get("github_data")?.value;
  if (!raw) {
    return NextResponse.json({ connected: false }, { status: 200 });
  }
  try {
    const data = JSON.parse(raw);
    return NextResponse.json({ connected: true, ...data });
  } catch {
    return NextResponse.json({ connected: false }, { status: 200 });
  }
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ disconnected: true });
  response.cookies.set("github_data", "", { maxAge: 0, path: "/" });
  return response;
}

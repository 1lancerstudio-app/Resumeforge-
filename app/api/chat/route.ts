import Groq from "groq-sdk";
import { AGENTS } from "@/lib/agents/agent-config";

export async function POST(req: Request) {
  const { messages, activeAgent, jobContext } = await req.json();

  // Look up agent config by id (e.g. "zeus", "athena", ...)
  const agentConfig = AGENTS[activeAgent as keyof typeof AGENTS] ?? AGENTS.zeus;

  // Each agent stores its Groq API key env var name in `apiKeyEnv`
  const apiKey = process.env[agentConfig.apiKeyEnv];
  if (!apiKey) {
    return Response.json(
      {
        error: `API key not configured for agent "${agentConfig.name}". Please set the ${agentConfig.apiKeyEnv} environment variable.`,
      },
      { status: 500 }
    );
  }

  const client = new Groq({ apiKey });

  const contextAddition = jobContext
    ? `\n\nJob context the user is targeting: ${jobContext}`
    : "";

  const stream = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    stream: true,
    messages: [
      { role: "system", content: agentConfig.systemPrompt + contextAddition },
      ...messages,
    ],
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (text) {
          controller.enqueue(new TextEncoder().encode(text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

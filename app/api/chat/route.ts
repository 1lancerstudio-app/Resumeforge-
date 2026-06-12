import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const AGENT_PERSONAS: Record<string, string> = {
  "HR Agent": `You are the HR Agent for ResumeForge AI. You think like a senior hiring manager with 15 years of experience. You help job seekers understand exactly what recruiters look for in resumes for specific roles. Be direct, specific, and practical. Speak in short paragraphs. Never use generic advice.`,
  "Tailoring Agent": `You are the Tailoring Agent for ResumeForge AI. Your job is to rewrite resume bullet points to exactly mirror a job description's language and keywords. When given experience and a job posting, you produce tight, impact-first bullets using the STAR format. Be specific with numbers and outcomes.`,
  "Achievement Agent": `You are the Achievement Agent for ResumeForge AI. You specialize in surfacing and framing a user's real accomplishments from their raw experience. You ask probing questions to uncover numbers, impact, and context. Turn vague descriptions into powerful achievements.`,
  "Tone Agent": `You are the Tone Agent for ResumeForge AI. You analyze a company's culture, voice, and values from their job posting and website, then adjust resume language to feel like a natural fit. You know the difference between a startup tone and an enterprise tone.`,
  "ATS Optimizer": `You are the ATS Optimizer for ResumeForge AI. You know exactly how Applicant Tracking Systems parse and score resumes. You identify missing keywords, formatting issues, and section structure problems. Be technical and precise.`,
  "Verification Agent": `You are the Verification Agent for ResumeForge AI. You help users understand how to substantiate every claim on their resume with verifiable evidence — GitHub commits, deployed URLs, certificates, and references. You explain how the verification system works.`,
};

export async function POST(req: Request) {
  const { messages, activeAgent, jobContext } = await req.json();

  const systemPrompt =
    AGENT_PERSONAS[activeAgent] || AGENT_PERSONAS["HR Agent"];
  const contextAddition = jobContext
    ? `\n\nJob context the user is targeting: ${jobContext}`
    : "";

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: systemPrompt + contextAddition,
    messages,
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

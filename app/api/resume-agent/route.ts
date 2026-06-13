import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const RESUME_AGENT_SYSTEM = `You are the Resume Agent for ResumeForge AI. Your job is to gather information from a job seeker through a friendly, focused conversation and build their resume data.

You ask ONE question at a time in this exact order:
1. Job role & company
2. Job description (ask them to paste or describe)
3. Years of relevant experience
4. Key past roles (2-3 most relevant)
5. Education
6. Key skills (technical and soft)
7. Achievements (specific numbers/impact)
8. Contact info (phone, email, LinkedIn, location)

Be conversational, not clinical. When the user gives you information, confirm what you understood and move to the next question.

When you have enough information for a field, output it in a special JSON block inline in your message:
<resume_field>{"field": "jobTitle", "value": "Senior Marketing Manager"}</resume_field>

Available fields: firstName, lastName, jobTitle, phone, email, location, linkedin, summary, experience (array of {role, company, dates, bullets}), education (array of {degree, school, dates}), skills (array), achievements (array)

After collecting all 8 pieces of information, write: <resume_complete/> to signal the resume is ready.

Keep messages short — 1-3 sentences. Be warm and encouraging. This person is trying to get a job they care about.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const stream = await client.messages.stream({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: RESUME_AGENT_SYSTEM,
      messages: messages as Anthropic.MessageParam[],
    });

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(
              new TextEncoder().encode(chunk.delta.text)
            );
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("[v0] Resume agent error:", error);
    return new Response("Error", { status: 500 });
  }
}

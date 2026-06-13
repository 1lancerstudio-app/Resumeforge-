export const maxDuration = 30;

const MODEL = "gemini-2.0-flash";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return new Response("GOOGLE_GENERATIVE_AI_API_KEY is not set", { status: 500 });
  }

  const systemInstruction = `You are an expert AI prompt engineer specializing in resume and career writing. Improve and enhance the given prompt to make it more effective, specific, and likely to produce better outputs. Output ONLY the enhanced prompt — no explanations, no preamble, just the improved prompt text.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const geminiRes = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: `Enhance this prompt:\n\n${prompt}\n\nOutput only the enhanced prompt.` }] }],
      generationConfig: { maxOutputTokens: 1000 },
    }),
  });

  if (!geminiRes.ok || !geminiRes.body) {
    const err = await geminiRes.text();
    return new Response(err, { status: geminiRes.status });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = geminiRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
          } catch { /* skip */ }
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  });
}

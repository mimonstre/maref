import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 503 });
  }

  try {
    const { message, context, history } = await req.json() as {
      message: string;
      context: Record<string, unknown>;
      history: { from: string; text: string }[];
    };

    const systemPrompt =
      "Tu es Mimo, l assistant decisionnel de MAREF - une plateforme d intelligence d achat. " +
      "MAREF utilise le framework PEFAS (Pertinence, Economie, Fluidite, Assurance, Stabilite) pour scorer les offres sur 100. " +
      "Tu es neutre, analytique, bienveillant. Tu proteges le pouvoir d achat. Tu ne vends rien. " +
      "Tu reponds en francais, de facon concise (2-4 phrases max), directe et utile. " +
      "Contexte utilisateur: " + JSON.stringify(context);

    const messages = history
      .filter((m) => m.from === "user" || m.from === "mimo")
      .map((m) => ({
        role: m.from === "user" ? "user" : "assistant",
        content: m.text,
      }));

    messages.push({ role: "user", content: message });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 256,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      return NextResponse.json({ error: details || "Anthropic request failed" }, { status: 502 });
    }

    const data = await response.json() as {
      content?: Array<{ type: string; text?: string }>;
    };

    const text =
      data.content?.[0]?.type === "text" && data.content[0].text
        ? data.content[0].text
        : "Je ne peux pas repondre pour le moment.";

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Mimo API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

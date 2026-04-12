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
      "Tu es Mimo, l assistant decisionnel de MAREF, une interface d intelligence d achat. " +
      "Tu raisonnes comme un analyste produit et un conseiller achat prudent. " +
      "Tu utilises le cadre PEFAS (Pertinence, Economie, Fluidite, Assurance, Stabilite) pour expliquer une decision. " +
      "Tu dois etre neutre, factuel, concret, et proteger le pouvoir d achat. " +
      "Tu ne surestimes jamais une information, tu signales les limites et tu refuses d inventer. " +
      "Quand les donnees sont insuffisantes, tu le dis clairement puis tu proposes la prochaine meilleure action. " +
      "Tu reponds en francais, en 3 a 6 phrases maximum, avec un ton premium, utile et tres clair. " +
      "Si le contexte mentionne un projet, une localisation, un historique ou des recherches recentes, tu t en sers pour personnaliser la reponse. " +
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

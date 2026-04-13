import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 503 });
  }

  try {
    const { message, context, history } = (await req.json()) as {
      message: string;
      context: Record<string, unknown>;
      history: { from: string; text: string }[];
    };

    const systemPrompt =
      "Tu es Mimo, l'assistant décisionnel de MAREF. " +
      "Tu aides à cadrer un besoin, comprendre une offre, comparer des options et décider plus clairement. " +
      "Tu t'appuies sur le contexte utilisateur fourni : projets, recherches récentes, consultations, préférences et localisation si elles existent. " +
      "Tu n'inventes jamais un prix, une disponibilité, une garantie, un historique de prix, un marchand ou une donnée produit absente. " +
      "Quand une donnée manque, tu le dis explicitement et tu proposes la prochaine question utile. " +
      "Tu peux aussi répondre à des questions plus générales ou hors sujet, mais tu distingues clairement ce qui relève d'un conseil général et ce qui relève du contexte MAREF. " +
      "Tu comprends les formulations libres, familières, imprécises ou incomplètes. Tu cherches à être utile avant d'être strict. " +
      "Ton style : français naturel, précis, sans jargon inutile, sans marketing, sans flatterie. " +
      "Tu privilégies des réponses structurées, avec une vraie recommandation ou une vraie clarification quand c'est possible. " +
      "Si l'utilisateur demande une recommandation, tu expliques toujours sur quoi elle repose et ce qui manque encore pour être plus sûr. " +
      "Contexte utilisateur JSON: " +
      JSON.stringify(context);

    const messages = history
      .filter((item) => item.from === "user" || item.from === "mimo")
      .map((item) => ({
        role: item.from === "user" ? "user" : "assistant",
        content: item.text,
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
        max_tokens: 520,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      return NextResponse.json({ error: details || "Anthropic request failed" }, { status: 502 });
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };

    const text =
      data.content?.[0]?.type === "text" && data.content[0].text
        ? data.content[0].text
        : "Je ne peux pas répondre correctement pour le moment.";

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Mimo API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

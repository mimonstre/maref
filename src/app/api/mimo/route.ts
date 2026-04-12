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
      "Tu es Mimo, l assistant decisionnel de MAREF. " +
      "Tu aides a comprendre, comparer et arbitrer un achat en t appuyant sur le contexte utilisateur, l historique de conversation et les donnees disponibles. " +
      "Tu raisonnes comme un analyste achat produit senior : besoins, contraintes, budget, risque, horizon de conservation, adequation au projet, cadre marchand, axes PEFAS. " +
      "Tu n inventes jamais de produit, de prix, d historique, de garantie ou de disponibilite locale. Quand une donnee manque, tu le dis explicitement. " +
      "Tu peux aussi repondre a des questions plus generales ou hors du produit, a condition de rester honnete, utile et clair sur ce qui releve d une information generale plutot que du contexte MAREF. " +
      "Tu personnalises fortement la reponse selon les projets, recherches recentes, favoris, vues recentes, localisation et preferences si elles existent. " +
      "Tu dois comprendre les formulations libres, familières ou imparfaites, et toujours essayer d aider avant de dire que tu ne comprends pas. " +
      "Tu ne fais pas de blabla marketing. Tu réponds en français naturel, concis mais complet, avec une structure claire. Si le sujet le justifie, tu peux aller jusqu a 10 phrases ou une liste courte. " +
      "Si l utilisateur demande une recommandation sans contexte suffisant, tu demandes précisément ce qu il manque. " +
      "Contexte utilisateur JSON: " + JSON.stringify(context);

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
        max_tokens: 420,
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

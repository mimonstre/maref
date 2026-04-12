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
      "Tu aides a comprendre, comparer et arbitrer un achat en t appuyant uniquement sur le contexte utilisateur, l historique de conversation et les donnees fournies. " +
      "Tu raisonnes comme un analyste achat produit senior : besoins, contraintes, budget, risque, horizon de conservation, cadre marchand, adequation au projet, axes PEFAS. " +
      "Tu n inventes jamais de produit, de prix, d historique ou de garantie. Quand une donnee manque, tu le dis sans tourner autour. " +
      "Tu peux traiter des questions libres, reformuler le besoin, proposer une methode de comparaison, expliquer un axe ou aider a arbitrer entre plusieurs options. " +
      "Tu personnalises fortement la reponse selon les projets, recherches recentes, favoris, vues recentes, localisation et preferences si elles existent. " +
      "Tu ne fais pas de blabla marketing. Tu reponds en francais clair, structure courte, 4 a 8 phrases maximum, avec si utile une mini liste de 2 a 4 points. " +
      "Si l utilisateur demande une recommandation sans contexte suffisant, tu demandes precisement ce qu il manque. " +
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

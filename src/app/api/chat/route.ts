import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatSchema, sanitizeString } from "@/lib/validations";

export async function POST(request: Request) {
  const aiEnabled = await prisma.setting.findUnique({ where: { key: "ai_enabled" } });
  if (aiEnabled?.value !== "true") {
    return NextResponse.json({ error: "L'assistant IA est désactivé" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { message, lang } = chatSchema.parse({
      ...body,
      message: sanitizeString(body.message || ""),
    });

    const settings = await prisma.setting.findMany({
      where: { key: { in: ["ai_api_key", "ai_instructions", "ai_model"] } },
    });

    const config: Record<string, string> = {};
    for (const s of settings) config[s.key] = s.value;

    const apiKey = config.ai_api_key || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Clé API non configurée" }, { status: 500 });
    }

    const products = await prisma.product.findMany({
      where: { isAvailable: true },
      include: { category: { select: { nameFr: true, nameAr: true } } },
      orderBy: { sortOrder: "asc" },
    });

    const menuContext = products.map((p: typeof products[0]) =>
      `- ${p.nameFr} (${p.nameAr}): ${p.price} DH [${p.category.nameFr}]`
    ).join("\n");

    const settingsData = await prisma.setting.findMany({
      where: { key: { in: ["phone", "email", "address_fr", "address_ar", "site_name_fr"] } },
    });
    const info: Record<string, string> = {};
    for (const s of settingsData) info[s.key] = s.value;

    const systemPrompt = `${config.ai_instructions || "Tu es l'assistant du restaurant M9ila."}

Informations du restaurant:
- Nom: ${info.site_name_fr || "M9ila"}
- Téléphone: ${info.phone || "0520333555"}
- Email: ${info.email || "contact@m9ila.com"}
- Adresse: ${info.address_fr || "95 Bd Bir Anzarane, Maarif, Casablanca"}

Menu complet:
${menuContext}

Réponds en ${lang === "ar" ? "arabe" : "français"}. Sois concis et utile.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
      },
      body: JSON.stringify({
        model: config.ai_model || "openrouter/auto",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Erreur IA" }, { status: 502 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu traiter votre demande.";

    return NextResponse.json({ reply });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

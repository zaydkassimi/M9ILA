import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SENSITIVE_KEYS = new Set(["smtp_pass", "ai_api_key"]);

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      if (SENSITIVE_KEYS.has(s.key)) {
        map[s.key] = s.value ? "********" : "";
      } else {
        map[s.key] = s.value;
      }
    }
    return NextResponse.json(map);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Format invalide" }, { status: 400 });
    }

    const ALLOWED_KEYS = new Set([
      "site_name_fr", "site_name_ar", "site_tagline_fr", "site_tagline_ar",
      "phone", "email", "address_fr", "address_ar", "instagram_url", "language_mode",
      "primary_color", "flame_orange", "flame_yellow", "brand_bg", "dark_color",
      "cod_enabled", "online_ordering_enabled", "contact_form_enabled", "ai_enabled", "glovo_enabled", "glovo_url",
      "smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from",
      "ai_api_key", "ai_model", "ai_instructions", "ai_welcome_fr", "ai_welcome_ar",
      "logo_url", "logo_light_url",
      "hero_badge_fr", "hero_badge_ar", "hero_tagline_fr", "hero_tagline_ar",
      "hero_subtitle_fr", "hero_subtitle_ar",
      "gallery_images",
    ]);

    for (const item of body) {
      if (!item.key || typeof item.value !== "string") continue;
      if (!/^[a-z_]+$/.test(item.key)) continue;
      if (!ALLOWED_KEYS.has(item.key)) continue;
      if (item.value.length > 5000) continue;

      await prisma.setting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

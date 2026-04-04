import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const rl = await rateLimit("categories_get", 120, 60 * 1000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Trop de requêtes" },
      { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(rl.reset)) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "true";

  const categories = await prisma.category.findMany({
    where: all ? {} : { isActive: true },
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const rl = await rateLimit("categories_post", 20, 60 * 1000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Trop de requêtes" },
      { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(rl.reset)) } }
    );
  }

  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { categorySchema, sanitizeString } = await import("@/lib/validations");
    const body = await request.json();
    const data = categorySchema.parse({
      ...body,
      nameFr: sanitizeString(body.nameFr || ""),
      nameAr: sanitizeString(body.nameAr || ""),
    });

    const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
    if (existing) return NextResponse.json({ error: "Slug déjà utilisé" }, { status: 400 });

    const category = await prisma.category.create({ data });
    return NextResponse.json(category, { status: 201 });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

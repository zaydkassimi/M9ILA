import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeString } from "@/lib/validations";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const rl = await rateLimit("categories_put", 20, 60 * 1000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Trop de requêtes" },
      { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(rl.reset)) } }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const updateData: Record<string, unknown> = {};
    if (body.nameFr) updateData.nameFr = sanitizeString(body.nameFr);
    if (body.nameAr) updateData.nameAr = sanitizeString(body.nameAr);
    if (body.slug && /^[a-z0-9-]+$/.test(body.slug)) updateData.slug = body.slug;
    if (typeof body.sortOrder === "number") updateData.sortOrder = body.sortOrder;
    if (typeof body.isActive === "boolean") updateData.isActive = body.isActive;

    const category = await prisma.category.update({
      where: { id: params.id },
      data: updateData,
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const rl = await rateLimit("categories_delete", 10, 60 * 1000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Trop de requêtes" },
      { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(rl.reset)) } }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });
  }
}

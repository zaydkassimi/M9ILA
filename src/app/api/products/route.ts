import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const all = searchParams.get("all") === "true";

  const products = await prisma.product.findMany({
    where: {
      ...(all ? {} : { isAvailable: true }),
      ...(categoryId ? { categoryId } : {}),
    },
    include: { category: { select: { nameFr: true, nameAr: true, slug: true } } },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { productSchema, sanitizeString } = await import("@/lib/validations");
    const body = await request.json();
    const data = productSchema.parse({
      ...body,
      nameFr: sanitizeString(body.nameFr || ""),
      nameAr: sanitizeString(body.nameAr || ""),
      descriptionFr: sanitizeString(body.descriptionFr || ""),
      descriptionAr: sanitizeString(body.descriptionAr || ""),
      price: Number(body.price),
    });

    const product = await prisma.product.create({ data });
    return NextResponse.json(product, { status: 201 });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

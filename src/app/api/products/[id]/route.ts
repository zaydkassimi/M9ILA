import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeString } from "@/lib/validations";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const updateData: any = {};
    if (body.nameFr) updateData.nameFr = sanitizeString(body.nameFr);
    if (body.nameAr) updateData.nameAr = sanitizeString(body.nameAr);
    if (body.descriptionFr !== undefined) updateData.descriptionFr = sanitizeString(body.descriptionFr);
    if (body.descriptionAr !== undefined) updateData.descriptionAr = sanitizeString(body.descriptionAr);
    if (typeof body.price === "number") updateData.price = body.price;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.emoji !== undefined) updateData.emoji = body.emoji;
    if (body.categoryId) updateData.categoryId = body.categoryId;
    if (typeof body.isAvailable === "boolean") updateData.isAvailable = body.isAvailable;
    if (typeof body.sortOrder === "number") updateData.sortOrder = body.sortOrder;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: { category: { select: { nameFr: true, slug: true } } },
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
  }
}

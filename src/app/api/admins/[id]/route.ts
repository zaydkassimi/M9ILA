import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeString } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "superadmin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updateData: any = {};
    if (body.email) updateData.email = body.email.toLowerCase().trim();
    if (body.name) updateData.name = sanitizeString(body.name);
    if (body.role && ["admin", "superadmin"].includes(body.role)) updateData.role = body.role;
    if (body.password && body.password.length >= 8) {
      updateData.passwordHash = await bcrypt.hash(body.password, 12);
    }

    const admin = await prisma.admin.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, updatedAt: true },
    });

    return NextResponse.json(admin);
  } catch {
    return NextResponse.json({ error: "Administrateur non trouvé" }, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "superadmin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  if ((session.user as any).id === params.id) {
    return NextResponse.json({ error: "Impossible de supprimer votre propre compte" }, { status: 400 });
  }

  try {
    await prisma.admin.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Administrateur non trouvé" }, { status: 404 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeString } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const rl = await rateLimit("admins_put", 10, 60 * 1000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Trop de requêtes" },
      { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(rl.reset)) } }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const currentUserId = (session.user as any).id;
  const currentUserRole = (session.user as any).role;
  const targetId = params.id;

  const isOwnProfile = currentUserId === targetId;
  const isSuperadmin = currentUserRole === "superadmin";

  if (!isOwnProfile && !isSuperadmin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name) updateData.name = sanitizeString(body.name);
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;

    if (isSuperadmin && !isOwnProfile) {
      if (body.email) updateData.email = body.email.toLowerCase().trim();
      if (body.role && ["admin", "superadmin"].includes(body.role)) updateData.role = body.role;
      if (body.canAccessSettings !== undefined) updateData.canAccessSettings = body.canAccessSettings;
    }

    if (body.currentPassword && body.newPassword) {
      const admin = await prisma.admin.findUnique({ where: { id: targetId } });
      if (!admin) return NextResponse.json({ error: "Administrateur non trouvé" }, { status: 404 });
      const isValid = await bcrypt.compare(body.currentPassword, admin.passwordHash);
      if (!isValid) return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
      if (body.newPassword.length < 8) return NextResponse.json({ error: "Minimum 8 caractères" }, { status: 400 });
      updateData.passwordHash = await bcrypt.hash(body.newPassword, 12);
    } else if (body.password && body.password.length >= 8 && isSuperadmin) {
      updateData.passwordHash = await bcrypt.hash(body.password, 12);
    }

    const admin = await prisma.admin.update({
      where: { id: targetId },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, updatedAt: true, avatarUrl: true, canAccessSettings: true },
    });

    return NextResponse.json(admin);
  } catch {
    return NextResponse.json({ error: "Administrateur non trouvé" }, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const rl = await rateLimit("admins_delete", 5, 60 * 1000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Trop de requêtes" },
      { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(rl.reset)) } }
    );
  }

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

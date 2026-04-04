import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminSchema, sanitizeString } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "superadmin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const admins = await prisma.admin.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true, avatarUrl: true, canAccessSettings: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(admins);
}

export async function POST(request: Request) {
  const rl = await rateLimit("admins_post", 5, 60 * 1000);
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

  try {
    const body = await request.json();
    const data = adminSchema.parse({
      ...body,
      email: body.email?.toLowerCase().trim(),
      name: sanitizeString(body.name || ""),
    });

    const existing = await prisma.admin.findUnique({ where: { email: data.email } });
    if (existing) return NextResponse.json({ error: "Email déjà utilisé" }, { status: 400 });

    const passwordHash = await bcrypt.hash(data.password, 12);
    const admin = await prisma.admin.create({
      data: { email: data.email, passwordHash, name: data.name, role: data.role, canAccessSettings: body.canAccessSettings || false },
      select: { id: true, email: true, name: true, role: true, createdAt: true, avatarUrl: true, canAccessSettings: true },
    });

    return NextResponse.json(admin, { status: 201 });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

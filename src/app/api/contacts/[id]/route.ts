import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const rl = await rateLimit("contacts_patch", 20, 60 * 1000);
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
    const isRead = typeof body.isRead === "boolean" ? body.isRead : true;

    const contact = await prisma.contactSubmission.update({
      where: { id: params.id },
      data: { isRead },
    });
    return NextResponse.json(contact);
  } catch {
    return NextResponse.json({ error: "Message non trouvé" }, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const rl = await rateLimit("contacts_delete", 10, 60 * 1000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Trop de requêtes" },
      { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(rl.reset)) } }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    await prisma.contactSubmission.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Message non trouvé" }, { status: 404 });
  }
}

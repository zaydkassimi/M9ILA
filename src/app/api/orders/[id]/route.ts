import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const rl = await rateLimit("orders_patch", 20, 60 * 1000);
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
    const validStatuses = ["pending", "confirmed", "preparing", "delivering", "delivered", "cancelled"];

    if (!body.status || typeof body.status !== "string" || !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: body.status },
    });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
  }
}

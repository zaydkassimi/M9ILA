import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const validStatuses = ["pending", "confirmed", "preparing", "delivering", "delivered", "cancelled"];

    if (!validStatuses.includes(body.status)) {
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

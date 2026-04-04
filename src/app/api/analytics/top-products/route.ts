import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const orders = await prisma.order.findMany({
    select: { items: true },
  });

  const productCounts: Record<string, { name: string; count: number; revenue: number }> = {};

  for (const order of orders) {
    try {
      const items = JSON.parse(order.items) as Array<{ name: string; quantity: number; price: number }>;
      for (const item of items) {
        if (!productCounts[item.name]) {
          productCounts[item.name] = { name: item.name, count: 0, revenue: 0 };
        }
        productCounts[item.name].count += item.quantity;
        productCounts[item.name].revenue += item.quantity * item.price;
      }
    } catch {
      // skip invalid JSON
    }
  }

  const topProducts = Object.values(productCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return NextResponse.json(topProducts);
}

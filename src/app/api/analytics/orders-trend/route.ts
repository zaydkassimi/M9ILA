import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const now = new Date();
  const days = 30;
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + 1);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true, totalAmount: true },
    orderBy: { createdAt: "asc" },
  });

  const dailyData: Record<string, { date: string; orders: number; revenue: number }> = {};

  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    dailyData[key] = { date: key, orders: 0, revenue: 0 };
  }

  for (const order of orders) {
    const key = order.createdAt.toISOString().split("T")[0];
    if (dailyData[key]) {
      dailyData[key].orders += 1;
      dailyData[key].revenue += order.totalAmount;
    }
  }

  return NextResponse.json(Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date)));
}

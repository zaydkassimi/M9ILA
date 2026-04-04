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

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, nameFr: true },
  });

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    categoryMap[cat.id] = cat.nameFr;
  }

  const categoryRevenue: Record<string, { name: string; revenue: number; count: number }> = {};

  for (const cat of categories) {
    categoryRevenue[cat.nameFr] = { name: cat.nameFr, revenue: 0, count: 0 };
  }

  const products = await prisma.product.findMany({
    select: { id: true, categoryId: true, nameFr: true },
  });

  const productCategoryMap: Record<string, string> = {};
  for (const p of products) {
    const catName = categoryMap[p.categoryId];
    if (catName) {
      productCategoryMap[p.nameFr] = catName;
    }
  }

  for (const order of orders) {
    try {
      const items = JSON.parse(order.items) as Array<{ name: string; quantity: number; price: number }>;
      for (const item of items) {
        const catName = productCategoryMap[item.name];
        if (catName && categoryRevenue[catName]) {
          categoryRevenue[catName].revenue += item.quantity * item.price;
          categoryRevenue[catName].count += item.quantity;
        }
      }
    } catch {
      // skip invalid JSON
    }
  }

  return NextResponse.json(Object.values(categoryRevenue).sort((a, b) => b.revenue - a.revenue));
}

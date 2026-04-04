import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - 7 * 86400000);
  const monthStart = new Date(todayStart.getTime() - 30 * 86400000);

  const [
    todayOrders,
    yesterdayOrders,
    weekOrders,
    monthOrders,
    todayRevenue,
    yesterdayRevenue,
    totalProducts,
    totalCategories,
    totalContacts,
    unreadContacts,
    pendingOrders,
    confirmedOrders,
    preparingOrders,
    deliveredOrders,
    cancelledOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } } }),
    prisma.order.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.order.aggregate({ where: { createdAt: { gte: todayStart } }, _sum: { totalAmount: true } }),
    prisma.order.aggregate({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } }, _sum: { totalAmount: true } }),
    prisma.product.count(),
    prisma.category.count({ where: { isActive: true } }),
    prisma.contactSubmission.count(),
    prisma.contactSubmission.count({ where: { isRead: false } }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.count({ where: { status: "confirmed" } }),
    prisma.order.count({ where: { status: "preparing" } }),
    prisma.order.count({ where: { status: "delivered" } }),
    prisma.order.count({ where: { status: "cancelled" } }),
  ]);

  const todayRevenueVal = todayRevenue._sum.totalAmount || 0;
  const yesterdayRevenueVal = yesterdayRevenue._sum.totalAmount || 0;
  const revenueChange = yesterdayRevenueVal > 0
    ? ((todayRevenueVal - yesterdayRevenueVal) / yesterdayRevenueVal) * 100
    : 0;
  const orderChange = yesterdayOrders > 0
    ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100
    : 0;
  const avgOrderValue = todayOrders > 0 ? todayRevenueVal / todayOrders : 0;

  return NextResponse.json({
    today: {
      orders: todayOrders,
      revenue: todayRevenueVal,
      avgOrderValue: Math.round(avgOrderValue),
    },
    yesterday: {
      orders: yesterdayOrders,
      revenue: yesterdayRevenueVal,
    },
    week: { orders: weekOrders },
    month: { orders: monthOrders },
    change: {
      revenue: Math.round(revenueChange * 10) / 10,
      orders: Math.round(orderChange * 10) / 10,
    },
    totals: {
      products: totalProducts,
      categories: totalCategories,
      contacts: totalContacts,
      unreadContacts,
    },
    statusBreakdown: {
      pending: pendingOrders,
      confirmed: confirmedOrders,
      preparing: preparingOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
    },
  });
}

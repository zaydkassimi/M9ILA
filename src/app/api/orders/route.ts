import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { orderSchema, sanitizeString } from "@/lib/validations";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

  const where: any = status ? { status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: Request) {
  const codSetting = await prisma.setting.findUnique({ where: { key: "cod_enabled" } });
  const orderSetting = await prisma.setting.findUnique({ where: { key: "online_ordering_enabled" } });

  if (codSetting?.value !== "true" && orderSetting?.value !== "true") {
    return NextResponse.json({ error: "Les commandes en ligne sont désactivées" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = orderSchema.parse({
      ...body,
      customerName: sanitizeString(body.customerName || ""),
      customerPhone: sanitizeString(body.customerPhone || ""),
      customerAddress: sanitizeString(body.customerAddress || ""),
      totalAmount: Number(body.totalAmount),
    });

    const order = await prisma.order.create({ data });
    return NextResponse.json(order, { status: 201 });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

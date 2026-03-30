import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { contactSchema, sanitizeString } from "@/lib/validations";
import nodemailer from "nodemailer";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const unreadOnly = searchParams.get("unread") === "true";

  const where: any = unreadOnly ? { isRead: false } : {};

  const [contacts, total] = await Promise.all([
    prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contactSubmission.count({ where }),
  ]);

  return NextResponse.json({ contacts, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: Request) {
  const enabledSetting = await prisma.setting.findUnique({ where: { key: "contact_form_enabled" } });
  if (enabledSetting?.value !== "true") {
    return NextResponse.json({ error: "Le formulaire de contact est désactivé" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = contactSchema.parse({
      ...body,
      name: sanitizeString(body.name || ""),
      phone: sanitizeString(body.phone || ""),
      subject: sanitizeString(body.subject || ""),
      message: sanitizeString(body.message || ""),
    });

    const submission = await prisma.contactSubmission.create({ data });
    sendContactEmail(submission).catch(console.error);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

async function sendContactEmail(submission: { name: string; email: string; phone: string; subject: string; message: string }) {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from", "email"] } },
  });

  const config: Record<string, string> = {};
  for (const s of settings) config[s.key] = s.value;

  if (!config.smtp_host || !config.smtp_user || !config.smtp_pass) return;

  const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: parseInt(config.smtp_port || "587"),
    secure: parseInt(config.smtp_port || "587") === 465,
    auth: { user: config.smtp_user, pass: config.smtp_pass },
  });

  await transporter.sendMail({
    from: config.smtp_from || config.smtp_user,
    to: config.email || config.smtp_user,
    subject: `[M9ila Contact] ${submission.subject || "Nouveau message"}`,
    html: `
      <h2>Nouveau message de contact</h2>
      <p><strong>Nom:</strong> ${submission.name}</p>
      <p><strong>Email:</strong> ${submission.email}</p>
      <p><strong>Téléphone:</strong> ${submission.phone || "N/A"}</p>
      <p><strong>Sujet:</strong> ${submission.subject || "N/A"}</p>
      <p><strong>Message:</strong></p>
      <p>${submission.message.replace(/\n/g, "<br>")}</p>
    `,
  });
}

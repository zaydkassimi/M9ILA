import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { createHash } from "crypto";
import path from "path";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 5MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a hash-based filename for easy DB storage and uniqueness
    const timestamp = Date.now().toString(36);
    const hash = createHash("md5").update(buffer).digest("hex").substring(0, 12);
    const ext = path.extname(file.name).toLowerCase() || ".webp";
    const filename = `m9ila_${timestamp}_${hash}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}

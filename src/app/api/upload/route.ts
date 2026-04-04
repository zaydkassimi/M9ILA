import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { createHash } from "crypto";
import path from "path";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);
const MAX_SIZE = 5 * 1024 * 1024;

const MAGIC_BYTES: Record<string, [number[], number][]> = {
  "image/jpeg": [[ [0xFF, 0xD8, 0xFF], 0 ]],
  "image/png": [[ [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], 0 ]],
  "image/webp": [[ [0x52, 0x49, 0x46, 0x46], 0 ]],
};

function validateMagicNumber(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === "image/svg+xml") {
    const header = buffer.subarray(0, 500).toString("utf8");
    return header.includes("<svg") || header.includes("<?xml");
  }

  const rules = MAGIC_BYTES[mimeType];
  if (!rules) return false;

  for (const [bytes, offset] of rules) {
    let match = true;
    for (let i = 0; i < bytes.length; i++) {
      if (buffer[offset + i] !== bytes[i]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

function getSafeExtension(mimeType: string): string {
  const extMap: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
  };
  return extMap[mimeType] || ".bin";
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 5MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!validateMagicNumber(buffer, file.type)) {
      return NextResponse.json({ error: "Contenu du fichier invalide" }, { status: 400 });
    }

    const timestamp = Date.now().toString(36);
    const hash = createHash("sha256").update(buffer).digest("hex").substring(0, 16);
    const ext = getSafeExtension(file.type);
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

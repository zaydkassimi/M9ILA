import { z } from "zod";

export const categorySchema = z.object({
  nameFr: z.string().min(1, "Nom FR requis").max(100),
  nameAr: z.string().min(1, "Nom AR requis").max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug invalide"),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
});

export const productSchema = z.object({
  nameFr: z.string().min(1, "Nom FR requis").max(200),
  nameAr: z.string().min(1, "Nom AR requis").max(200),
  descriptionFr: z.string().max(1000).optional().default(""),
  descriptionAr: z.string().max(1000).optional().default(""),
  price: z.number().min(0).max(99999),
  image: z.string().max(500).optional().default(""),
  emoji: z.string().max(10).optional().default(""),
  categoryId: z.string().cuid("Catégorie invalide"),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

export const orderSchema = z.object({
  customerName: z.string().min(1).max(100),
  customerPhone: z.string().min(5).max(20).regex(/^[0-9+\s-]+$/, "Téléphone invalide"),
  customerAddress: z.string().min(1).max(300),
  items: z.string().min(1),
  totalAmount: z.number().min(0),
  paymentMethod: z.enum(["cod"]).optional().default("cod"),
  notes: z.string().max(500).optional().default(""),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Nom requis").max(100),
  email: z.string().email("Email invalide").max(200),
  phone: z.string().max(20).regex(/^[0-9+\s-]*$/, "Téléphone invalide").optional().default(""),
  subject: z.string().max(200).optional().default(""),
  message: z.string().min(1, "Message requis").max(5000),
});

export const adminSchema = z.object({
  email: z.string().email("Email invalide").max(200),
  password: z.string().min(8, "Minimum 8 caractères").max(100),
  name: z.string().min(1, "Nom requis").max(100),
  role: z.enum(["admin", "superadmin"]).optional().default("admin"),
});

export const chatSchema = z.object({
  message: z.string().min(1, "Message requis").max(2000),
  lang: z.enum(["fr", "ar"]).optional().default("fr"),
});

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

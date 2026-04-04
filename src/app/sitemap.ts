import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/order`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  let categoryRoutes: MetadataRoute.Sitemap = [];
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    categoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/#menu`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const products = await prisma.product.findMany({
      where: { isAvailable: true },
      orderBy: { sortOrder: "asc" },
    });

    productRoutes = products.map((product) => ({
      url: `${baseUrl}/#menu`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    // Database unavailable during build — return static routes only
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = process.env.SEED_ADMIN_PASSWORD || randomBytes(16).toString("hex");
  const hash = await bcrypt.hash(defaultPassword, 12);
  await prisma.admin.upsert({
    where: { email: "admin@m9ila.com" },
    update: { passwordHash: hash },
    create: { email: "admin@m9ila.com", passwordHash: hash, name: "Admin M9ila", role: "superadmin" },
  });

  console.log("\n========================================");
  console.log(`DEFAULT ADMIN PASSWORD: ${defaultPassword}`);
  console.log(`CHANGE THIS PASSWORD IMMEDIATELY after first login!`);
  console.log("========================================\n");

  // Default settings
  const defaults: Record<string, string> = {
    site_name_fr: "M9ila",
    site_name_ar: "مقيلة",
    site_tagline_fr: "Le Fast Food Incontournable de Casa",
    site_tagline_ar: "أفضل فاست فود في كازا",
    primary_color: "#CC0000",
    flame_orange: "#FF6600",
    flame_yellow: "#FFD700",
    brand_bg: "#FFCC00",
    dark_color: "#1A1A1A",
    logo_url: "/images/navbar%20-%20dark%20(transparent)@4x.png",
    logo_light_url: "/images/navbar%20-%20dark%20(transparent)@4x.png",
    phone: "0520333555",
    email: "contact@m9ila.com",
    address_fr: "95 Boulevard Bir Anzarane, Maarif, Casablanca",
    address_ar: "95 شارع بئرانزران، المعاريف، الدار البيضاء",
    instagram_url: "https://instagram.com/m9ila_com",
    glovo_url: "https://glovoapp.com",
    glovo_enabled: "true",
    cod_enabled: "true",
    online_ordering_enabled: "false",
    contact_form_enabled: "true",
    ai_enabled: "false",
    ai_welcome_fr: "Bonjour ! Je suis l'assistant M9ila. Comment puis-je vous aider ?",
    ai_welcome_ar: "مرحبا! أنا مساعد مقيلة. كيف يمكنني مساعدتك؟",
    ai_instructions: "Tu es l'assistant du restaurant M9ila, un fast food à Casablanca spécialisé dans les fruits de mer, sandwichs, tajines et salades. Tu parles français et arabe. Sois aimable et aide les clients avec le menu, les prix, la localisation et les horaires.",
    ai_model: "openrouter/auto",
    ai_api_key: "",
    smtp_host: "",
    smtp_port: "587",
    smtp_user: "",
    smtp_pass: "",
    smtp_from: "",
    language_mode: "both",
    hero_badge_fr: "#1 Fast Food à Casablanca",
    hero_badge_ar: "أفضل فاست فود في الدار البيضاء",
    hero_tagline_fr: "La Vraie Saveur de Casa",
    hero_tagline_ar: "الطعم الحقيقي من قلب كازا",
    hero_subtitle_fr: "Sandwichs • Fruits de mer • Tajines • Salades — Livraison rapide à Casablanca",
    hero_subtitle_ar: "ساندويتش • فواكه البحر • طاجين • سلطة — توصيل سريع في الدار البيضاء",
  };

  for (const [key, value] of Object.entries(defaults)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  // Categories
  const cats = [
    { slug: "seafood", nameFr: "Fruits de Mer", nameAr: "فواكه البحر", sortOrder: 1 },
    { slug: "sandwiches", nameFr: "Sandwichs", nameAr: "سندويشات", sortOrder: 2 },
    { slug: "tagines", nameFr: "Tajines", nameAr: "طواجن", sortOrder: 3 },
    { slug: "salads", nameFr: "Salades", nameAr: "سلطات", sortOrder: 4 },
    { slug: "drinks", nameFr: "Boissons / Smoothies", nameAr: "مشروبات / عصائر", sortOrder: 5 },
    { slug: "desserts", nameFr: "Desserts", nameAr: "تحليات", sortOrder: 6 },
  ];

  for (const cat of cats) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Products
  const products = [
    { nameFr: "Plateau fruits de mer", nameAr: "طبق فواكه البحر", price: 150, emoji: "🦞", categorySlug: "seafood" },
    { nameFr: "Moules marinires", nameAr: "بلح البحر مارينيير", price: 80, emoji: "🦪", categorySlug: "seafood" },
    { nameFr: "Crevettes grillees", nameAr: "قمرون مشوي", price: 90, emoji: "🍤", categorySlug: "seafood" },
    { nameFr: "Calmar frit", nameAr: "كلمار مقلي", price: 75, emoji: "🦑", categorySlug: "seafood" },
    { nameFr: "Homard grille", nameAr: "جراد البحر مشوي", price: 250, emoji: "🦞", categorySlug: "seafood" },
    { nameFr: "Sandwich thon", nameAr: "سندويش طون", price: 35, emoji: "🥪", categorySlug: "sandwiches" },
    { nameFr: "Sandwich crevettes", nameAr: "سندويش قمرون", price: 45, emoji: "🍤", categorySlug: "sandwiches" },
    { nameFr: "Sandwich mixte", nameAr: "سندويش ميكست", price: 40, emoji: "🥙", categorySlug: "sandwiches" },
    { nameFr: "Sandwich poulet", nameAr: "سندويش دجاج", price: 35, emoji: "🍗", categorySlug: "sandwiches" },
    { nameFr: "Tajine de poisson", nameAr: "طاجين حوت", price: 85, emoji: "🥘", categorySlug: "tagines" },
    { nameFr: "Tajine de crevettes", nameAr: "طاجين قمرون", price: 95, emoji: "🥘", categorySlug: "tagines" },
    { nameFr: "Tajine de calmar", nameAr: "طاجين كلمار", price: 90, emoji: "🥘", categorySlug: "tagines" },
    { nameFr: "Salade marocaine", nameAr: "شلاضة مغربية", price: 25, emoji: "🥗", categorySlug: "salads" },
    { nameFr: "Salade de la mer", nameAr: "سلطة البحر", price: 55, emoji: "🥗", categorySlug: "salads" },
    { nameFr: "Salade verte", nameAr: "سلطة خضراء", price: 20, emoji: "🥬", categorySlug: "salads" },
    { nameFr: "Jus d'orange", nameAr: "عصير ليمون", price: 20, emoji: "🍊", categorySlug: "drinks" },
    { nameFr: "Smoothie tropical", nameAr: "عصير استوائي", price: 30, emoji: "🍹", categorySlug: "drinks" },
    { nameFr: "Citronnade", nameAr: "سيتروناد", price: 25, emoji: "🍋", categorySlug: "drinks" },
    { nameFr: "Avocado shake", nameAr: "عصير أفوكادو", price: 35, emoji: "🥑", categorySlug: "drinks" },
    { nameFr: "Crepe", nameAr: "كريب", price: 25, emoji: "🥞", categorySlug: "desserts" },
    { nameFr: "Tiramisu", nameAr: "تيراميسو", price: 30, emoji: "🍰", categorySlug: "desserts" },
    { nameFr: "Coupe glacee", nameAr: "كوب آيس كريم", price: 25, emoji: "🍨", categorySlug: "desserts" },
  ];

  let sortOrder = 1;
  for (const p of products) {
    const cat = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
    if (cat) {
      const existing = await prisma.product.findFirst({
        where: { nameFr: p.nameFr, categoryId: cat.id },
      });
      if (!existing) {
        await prisma.product.create({
          data: {
            nameFr: p.nameFr,
            nameAr: p.nameAr,
            price: p.price,
            emoji: p.emoji,
            categoryId: cat.id,
            sortOrder: sortOrder++,
          },
        });
      }
    }
  }

  console.log("Seed completed successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

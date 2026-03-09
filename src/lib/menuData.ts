export type MenuItem = {
  id: string;
  nameFr: string;
  nameAr: string;
  price: number;
  emoji: string;
  category: string;
  imagePlaceholderId?: number; // purely for placeholder images like picsum
};

export type MenuCategory = {
  id: string;
  titleFr: string;
  titleAr: string;
  items: MenuItem[];
};

export const menuData: MenuCategory[] = [
  {
    id: "seafood",
    titleFr: "Fruits de Mer",
    titleAr: "فواكه البحر",
    items: [
      { id: "sf1", nameFr: "Plateau fruits de mer", nameAr: "طبق فواكه البحر", price: 150, emoji: "🦞", category: "seafood", imagePlaceholderId: 102 },
      { id: "sf2", nameFr: "Moules marinières", nameAr: "بلح البحر مارينيير", price: 80, emoji: "🦪", category: "seafood", imagePlaceholderId: 292 },
      { id: "sf3", nameFr: "Crevettes grillées", nameAr: "قمرون مشوي", price: 90, emoji: "🍤", category: "seafood", imagePlaceholderId: 431 },
      { id: "sf4", nameFr: "Calmar frit", nameAr: "كلمار مقلي", price: 75, emoji: "🦑", category: "seafood", imagePlaceholderId: 493 },
      { id: "sf5", nameFr: "Homard grillé", nameAr: "جراد البحر مشوي", price: 250, emoji: "🦞", category: "seafood", imagePlaceholderId: 824 },
    ],
  },
  {
    id: "sandwiches",
    titleFr: "Sandwichs",
    titleAr: "سندويشات",
    items: [
      { id: "sw1", nameFr: "Sandwich thon", nameAr: "سندويش طون", price: 35, emoji: "🥪", category: "sandwiches", imagePlaceholderId: 1080 },
      { id: "sw2", nameFr: "Sandwich crevettes", nameAr: "سندويش قمرون", price: 45, emoji: "🍤", category: "sandwiches", imagePlaceholderId: 835 },
      { id: "sw3", nameFr: "Sandwich mixte", nameAr: "سندويش ميكست", price: 40, emoji: "🥙", category: "sandwiches", imagePlaceholderId: 225 },
      { id: "sw4", nameFr: "Sandwich poulet", nameAr: "سندويش دجاج", price: 35, emoji: "🍗", category: "sandwiches", imagePlaceholderId: 443 },
    ],
  },
  {
    id: "tagines",
    titleFr: "Tajines",
    titleAr: "طواجن",
    items: [
      { id: "tg1", nameFr: "Tajine de poisson", nameAr: "طاجين حوت", price: 85, emoji: "🥘", category: "tagines", imagePlaceholderId: 42 },
      { id: "tg2", nameFr: "Tajine de crevettes", nameAr: "طاجين قمرون", price: 95, emoji: "🥘", category: "tagines", imagePlaceholderId: 43 },
      { id: "tg3", nameFr: "Tajine de calmar", nameAr: "طاجين كلمار", price: 90, emoji: "🥘", category: "tagines", imagePlaceholderId: 44 },
    ],
  },
  {
    id: "salads",
    titleFr: "Salades",
    titleAr: "سلطات",
    items: [
      { id: "sd1", nameFr: "Salade marocaine", nameAr: "شلاضة مغربية", price: 25, emoji: "🥗", category: "salads", imagePlaceholderId: 75 },
      { id: "sd2", nameFr: "Salade de la mer", nameAr: "سلطة البحر", price: 55, emoji: "🥗", category: "salads", imagePlaceholderId: 76 },
      { id: "sd3", nameFr: "Salade verte", nameAr: "سلطة خضراء", price: 20, emoji: "🥬", category: "salads", imagePlaceholderId: 77 },
    ],
  },
  {
    id: "drinks",
    titleFr: "Boissons / Smoothies",
    titleAr: "مشروبات / عصائر",
    items: [
      { id: "dr1", nameFr: "Jus d'orange", nameAr: "عصير ليمون", price: 20, emoji: "🍊", category: "drinks", imagePlaceholderId: 429 },
      { id: "dr2", nameFr: "Smoothie tropical", nameAr: "عصير استوائي", price: 30, emoji: "🍹", category: "drinks", imagePlaceholderId: 430 },
      { id: "dr3", nameFr: "Citronnade", nameAr: "سيتروناد", price: 25, emoji: "🍋", category: "drinks", imagePlaceholderId: 1058 },
      { id: "dr4", nameFr: "Avocado shake", nameAr: "عصير أفوكادو", price: 35, emoji: "🥑", category: "drinks", imagePlaceholderId: 674 },
    ],
  },
  {
    id: "desserts",
    titleFr: "Desserts",
    titleAr: "تحليات",
    items: [
      { id: "ds1", nameFr: "Crêpes", nameAr: "كريب", price: 25, emoji: "🥞", category: "desserts", imagePlaceholderId: 326 },
      { id: "ds2", nameFr: "Tiramisu", nameAr: "تيراميسو", price: 30, emoji: "🍰", category: "desserts", imagePlaceholderId: 110 },
      { id: "ds3", nameFr: "Coupe glacée", nameAr: "كوب آيس كريم", price: 25, emoji: "🍨", category: "desserts", imagePlaceholderId: 379 },
    ],
  },
];

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FolderOpen, Mail, ShoppingCart } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, contacts: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [products, categories, ordersData, contactsData] = await Promise.all([
          fetch("/api/products?all=true").then(r => r.json()),
          fetch("/api/categories?all=true").then(r => r.json()),
          fetch("/api/orders?limit=1").then(r => r.json()),
          fetch("/api/contacts?limit=1").then(r => r.json()),
        ]);
        setStats({
          products: Array.isArray(products) ? products.length : 0,
          categories: Array.isArray(categories) ? categories.length : 0,
          orders: ordersData.total || 0,
          contacts: contactsData.total || 0,
        });
      } catch { /* empty */ }
    }
    fetchStats();
  }, []);

  const cards = [
    { title: "Produits", value: stats.products, icon: Package, color: "text-[#CC0000]" },
    { title: "Catégories", value: stats.categories, icon: FolderOpen, color: "text-[#FF6600]" },
    { title: "Commandes", value: stats.orders, icon: ShoppingCart, color: "text-blue-600" },
    { title: "Messages", value: stats.contacts, icon: Mail, color: "text-green-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble de votre restaurant</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`size-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

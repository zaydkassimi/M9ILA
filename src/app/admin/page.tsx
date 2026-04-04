"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, FolderOpen,
  Mail, Clock, BarChart3, Award, ArrowRight, MessageSquare
} from "lucide-react";
import Link from "next/link";

type OverviewData = {
  today: { orders: number; revenue: number; avgOrderValue: number };
  yesterday: { orders: number; revenue: number };
  week: { orders: number };
  month: { orders: number };
  change: { revenue: number; orders: number };
  totals: { products: number; categories: number; contacts: number; unreadContacts: number };
  statusBreakdown: { pending: number; confirmed: number; preparing: number; delivered: number; cancelled: number };
};

type TrendData = { date: string; orders: number; revenue: number }[];
type TopProduct = { name: string; count: number; revenue: number };
type CategoryRev = { name: string; revenue: number; count: number };
type RecentOrder = {
  id: string; customerName: string; customerPhone: string;
  totalAmount: number; status: string; createdAt: string;
};
type RecentContact = {
  id: string; name: string; email: string; subject: string;
  message: string; isRead: boolean; createdAt: string;
};

export default function AdminDashboard() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [trend, setTrend] = useState<TrendData>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categoryRevenue, setCategoryRevenue] = useState<CategoryRev[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, trendRes, topRes, catRes, ordersRes, contactsRes] = await Promise.all([
          fetch("/api/analytics/overview"),
          fetch("/api/analytics/orders-trend"),
          fetch("/api/analytics/top-products"),
          fetch("/api/analytics/category-revenue"),
          fetch("/api/orders?limit=5"),
          fetch("/api/contacts?limit=5&unread=true"),
        ]);

        if (overviewRes.ok) setOverview(await overviewRes.json());
        if (trendRes.ok) setTrend(await trendRes.json());
        if (topRes.ok) setTopProducts(await topRes.json());
        if (catRes.ok) setCategoryRevenue(await catRes.json());
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setRecentOrders(data.orders || []);
        }
        if (contactsRes.ok) {
          const data = await contactsRes.json();
          setRecentContacts(data.contacts || []);
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#CC0000] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  const totalOrders = overview?.statusBreakdown;
  const totalStatusOrders = totalOrders
    ? totalOrders.pending + totalOrders.confirmed + totalOrders.preparing + totalOrders.delivered + totalOrders.cancelled
    : 0;

  const statusColors: Record<string, string> = {
    pending: "#F59E0B",
    confirmed: "#3B82F6",
    preparing: "#8B5CF6",
    delivered: "#10B981",
    cancelled: "#EF4444",
  };

  const statusLabels: Record<string, string> = {
    pending: "En attente",
    confirmed: "Confirmée",
    preparing: "En préparation",
    delivered: "Livrée",
    cancelled: "Annulée",
  };

  const maxCategoryRevenue = Math.max(...categoryRevenue.map((c) => c.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d&apos;ensemble de votre restaurant</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">
              <ShoppingCart className="mr-2 size-4" /> Commandes
            </Button>
          </Link>
          <Link href="/admin/products">
            <Button size="sm" className="bg-[#CC0000] hover:bg-[#AA0000]">
              <Package className="mr-2 size-4" /> Produits
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Today */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus aujourd&apos;hui</CardTitle>
            <DollarSign className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.today.revenue || 0} DH</div>
            <div className="flex items-center gap-1 mt-1">
              {overview && overview.change.revenue >= 0 ? (
                <TrendingUp className="size-3 text-green-500" />
              ) : (
                <TrendingDown className="size-3 text-red-500" />
              )}
              <p className={`text-xs ${overview && overview.change.revenue >= 0 ? "text-green-500" : "text-red-500"}`}>
                {overview?.change.revenue || 0}% vs hier
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Orders Today */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes aujourd&apos;hui</CardTitle>
            <ShoppingCart className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.today.orders || 0}</div>
            <div className="flex items-center gap-1 mt-1">
              {overview && overview.change.orders >= 0 ? (
                <TrendingUp className="size-3 text-green-500" />
              ) : (
                <TrendingDown className="size-3 text-red-500" />
              )}
              <p className={`text-xs ${overview && overview.change.orders >= 0 ? "text-green-500" : "text-red-500"}`}>
                {overview?.change.orders || 0}% vs hier
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Avg Order Value */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panier moyen</CardTitle>
            <BarChart3 className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.today.avgOrderValue || 0} DH</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview?.week.orders || 0} commandes cette semaine
            </p>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.statusBreakdown.pending || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview?.totals.unreadContacts || 0} messages non lus
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Orders Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Tendance des commandes (30 jours)</CardTitle>
          </CardHeader>
          <CardContent>
            {trend.length > 0 ? (
              <div className="flex items-end gap-1 h-40">
                {trend.map((day) => {
                  const maxOrders = Math.max(...trend.map((t) => t.orders), 1);
                  const height = day.orders > 0 ? Math.max((day.orders / maxOrders) * 100, 8) : 0;
                  return (
                    <div
                      key={day.date}
                      className="flex-1 group relative"
                      title={`${day.date}: ${day.orders} commandes, ${day.revenue} DH`}
                    >
                      <div
                        className="w-full rounded-t-sm bg-gradient-to-t from-[#CC0000] to-[#FF6600] opacity-80 group-hover:opacity-100 transition-all cursor-pointer"
                        style={{ height: `${height}%`, minHeight: day.orders > 0 ? "4px" : "2px" }}
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {day.orders} cmd · {day.revenue} DH
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                Aucune donnée pour le moment
              </div>
            )}
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>Il y a 30j</span>
              <span>Aujourd&apos;hui</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statut des commandes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {totalStatusOrders > 0 ? (
              Object.entries(statusColors).map(([status, color]) => {
                const count = totalOrders?.[status as keyof typeof totalOrders] || 0;
                const pct = totalStatusOrders > 0 ? Math.round((count / totalStatusOrders) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        {statusLabels[status]}
                      </span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                Aucune commande
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="size-5 text-amber-500" />
              Top 5 Produits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#CC0000]/10 text-[#CC0000] text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.count} vendus</p>
                  </div>
                  <span className="text-sm font-bold text-[#CC0000]">{product.revenue} DH</span>
                </div>
              ))
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                Aucune donnée pour le moment
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenus par catégorie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryRevenue.length > 0 && categoryRevenue.some((c) => c.revenue > 0) ? (
              categoryRevenue.filter((c) => c.revenue > 0).map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-muted-foreground">{cat.count} vendus · {cat.revenue} DH</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#CC0000] to-[#FF6600] transition-all"
                      style={{ width: `${(cat.revenue / maxCategoryRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                Aucune donnée pour le moment
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Commandes récentes</CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="text-xs">
                Voir tout <ArrowRight className="ml-1 size-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#CC0000]/10 flex items-center justify-center">
                        <ShoppingCart className="size-4 text-[#CC0000]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{order.totalAmount} DH</p>
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        style={{
                          borderColor: statusColors[order.status] || "#94A3B8",
                          color: statusColors[order.status] || "#94A3B8",
                        }}
                      >
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                Aucune commande récente
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unread Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="size-5 text-blue-500" />
              Messages non lus
            </CardTitle>
            <Link href="/admin/contacts">
              <Button variant="ghost" size="sm" className="text-xs">
                Voir tout <ArrowRight className="ml-1 size-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentContacts.length > 0 ? (
              <div className="space-y-3">
                {recentContacts.map((contact) => (
                  <div key={contact.id} className="py-2 border-b last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(contact.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{contact.subject}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{contact.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                Aucun message non lu
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/products" className="cursor-pointer">
          <Card className="hover:shadow-lg transition-all hover:border-[#CC0000]/30 cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#CC0000]/10 flex items-center justify-center">
                  <Package className="size-6 text-[#CC0000]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overview?.totals.products || 0}</p>
                  <p className="text-sm text-muted-foreground">Produits</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/categories" className="cursor-pointer">
          <Card className="hover:shadow-lg transition-all hover:border-[#FF6600]/30 cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF6600]/10 flex items-center justify-center">
                  <FolderOpen className="size-6 text-[#FF6600]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overview?.totals.categories || 0}</p>
                  <p className="text-sm text-muted-foreground">Catégories</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/contacts" className="cursor-pointer">
          <Card className="hover:shadow-lg transition-all hover:border-green-500/30 cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Mail className="size-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overview?.totals.contacts || 0}</p>
                  <p className="text-sm text-muted-foreground">
                    Messages ({overview?.totals.unreadContacts || 0} non lus)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

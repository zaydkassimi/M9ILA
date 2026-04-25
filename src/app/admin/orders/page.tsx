"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, ChevronDown, ChevronUp, Loader2, Check, X } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string; customerName: string; customerPhone: string; customerAddress: string;
  items: string; totalAmount: number; status: string; paymentMethod: string;
  notes: string; createdAt: string;
}

const statusLabels: Record<string, string> = {
  pending: "En attente", confirmed: "Confirmée", preparing: "En préparation",
  delivering: "En livraison", delivered: "Livrée", cancelled: "Annulée",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  confirmed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  preparing: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  delivering: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  delivered: "bg-green-100 text-green-800 hover:bg-green-100",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchOrders = useCallback(async (reset = false) => {
    const pageNum = reset ? 1 : page;
    const url = new URL("/api/orders", window.location.href);
    if (statusFilter !== "all") url.searchParams.set("status", statusFilter);
    url.searchParams.set("page", String(pageNum));
    url.searchParams.set("limit", "20");

    setLoading(true);
    const res = await fetch(url.toString());
    const data = await res.json();
    setLoading(false);

    if (reset) {
      setOrders(data.orders || []);
      setPage(2);
      setHasMore((data.orders?.length || 0) >= 20);
    } else {
      setOrders(prev => [...prev, ...(data.orders || [])]);
      setPage(p => p + 1);
      setHasMore((data.orders?.length || 0) >= 20);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    setPage(1);
    fetchOrders(true);
  }, [statusFilter]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchOrders(false);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchOrders]);

  const filteredOrders = orders.filter(o => {
    const searchMatch = search === "" ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search);
    let dateMatch = true;
    if (dateFilter !== "all") {
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      if (dateFilter === "today") {
        dateMatch = orderDate.toDateString() === now.toDateString();
      } else if (dateFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateMatch = orderDate >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateMatch = orderDate >= monthAgo;
      }
    }
    return searchMatch && dateMatch;
  });

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Statut mis à jour");
      fetchOrders(true);
      if (selected?.id === id) setSelected({ ...selected, status });
    }
  };

  const parseItems = (s: string): OrderItem[] => { try { return JSON.parse(s); } catch { return []; } };

  const getNextStatus = (current: string): string | null => {
    const flow: Record<string, string> = {
      pending: "confirmed", confirmed: "preparing", preparing: "delivering", delivering: "delivered"
    };
    return flow[current] || null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
          <p className="text-muted-foreground">Gérez les commandes</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-48"
            />
          </div>
          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v || "all")}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes dates</SelectItem>
              <SelectItem value="today">Aujourd&apos;hui</SelectItem>
              <SelectItem value="week">7 derniers jours</SelectItem>
              <SelectItem value="month">30 derniers jours</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((o) => (
              <>
                <TableRow key={o.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}>
                  <TableCell className="p-2">
                    {expandedId === o.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </TableCell>
                  <TableCell className="text-sm">{new Date(o.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell className="font-medium">{o.customerName}</TableCell>
                  <TableCell>{o.customerPhone}</TableCell>
                  <TableCell className="font-bold">{o.totalAmount} DH</TableCell>
                  <TableCell>
                    <Badge className={statusColors[o.status] || ""}>{statusLabels[o.status] || o.status}</Badge>
                  </TableCell>
                  <TableCell className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    {getNextStatus(o.status) && (
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => updateStatus(o.id, getNextStatus(o.status)!)}>
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {o.status !== "cancelled" && o.status !== "delivered" && (
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => updateStatus(o.id, "cancelled")}>
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-8" onClick={(e) => { e.stopPropagation(); setSelected(o); }}>Détails</Button>
                  </TableCell>
                </TableRow>
                {expandedId === o.id && (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-muted/30 p-4">
                      <div className="space-y-3">
                        <div className="text-sm font-medium">Articles commandés:</div>
                        <div className="bg-background rounded-lg p-3 space-y-1">
                          {parseItems(o.items).map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span className="font-medium">{item.price * item.quantity} DH</span>
                            </div>
                          ))}
                        </div>
                        {o.customerAddress && (
                          <div className="text-sm"><span className="text-muted-foreground">Adresse:</span> {o.customerAddress}</div>
                        )}
                        {o.notes && (
                          <div className="text-sm"><span className="text-muted-foreground">Notes:</span> {o.notes}</div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
            {filteredOrders.length === 0 && !loading && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Aucune commande</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <div ref={loadMoreRef} className="h-1" />

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Détail commande</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Client:</span> {selected.customerName}</div>
                <div><span className="text-muted-foreground">Tél:</span> {selected.customerPhone}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Adresse:</span> {selected.customerAddress}</div>
              </div>
              <div className="bg-muted rounded-lg p-3 space-y-1 text-sm">
                {parseItems(selected.items).map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-medium">{item.price * item.quantity} DH</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span><span>{selected.totalAmount} DH</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Statut:</p>
                <Select value={selected.status} onValueChange={(v: string | null) => { if (v) updateStatus(selected.id, v); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {selected.notes && <div className="text-sm"><span className="text-muted-foreground">Notes:</span> {selected.notes}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

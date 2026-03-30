"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Order {
  id: string; customerName: string; customerPhone: string; customerAddress: string;
  items: string; totalAmount: number; status: string; paymentMethod: string;
  notes: string; createdAt: string;
}

const statusLabels: Record<string, string> = {
  pending: "En attente", confirmed: "Confirmée", preparing: "En préparation",
  delivering: "En livraison", delivered: "Livrée", cancelled: "Annulée",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    const url = statusFilter === "all" ? "/api/orders" : `/api/orders?status=${statusFilter}`;
    const res = await fetch(url);
    const data = await res.json();
    setOrders(data.orders || []);
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Statut mis à jour");
      fetchOrders();
      if (selected?.id === id) setSelected({ ...selected, status });
    }
  };

  const parseItems = (s: string) => { try { return JSON.parse(s); } catch { return []; } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
          <p className="text-muted-foreground">Gérez les commandes</p>
        </div>
        <Select value={statusFilter} onValueChange={(v: string | null) => setStatusFilter(v || "all")}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="text-sm">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell className="font-medium">{o.customerName}</TableCell>
                <TableCell>{o.customerPhone}</TableCell>
                <TableCell className="font-bold">{o.totalAmount} DH</TableCell>
                <TableCell><Badge>{statusLabels[o.status] || o.status}</Badge></TableCell>
                <TableCell><Button variant="ghost" size="sm" onClick={() => setSelected(o)}>Détails</Button></TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Aucune commande</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

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
                {parseItems(selected.items).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.qty}x {item.nameFr}</span>
                    <span className="font-medium">{item.price * item.qty} DH</span>
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

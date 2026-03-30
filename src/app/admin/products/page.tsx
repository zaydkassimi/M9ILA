"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string; nameFr: string; nameAr: string; price: number;
  emoji: string; categoryId: string; isAvailable: boolean; sortOrder: number;
  category?: { nameFr: string; slug: string };
}

interface Category { id: string; nameFr: string; slug: string; isActive: boolean; }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ nameFr: "", nameAr: "", price: 0, emoji: "\uD83C\uDF55", categoryId: "", isAvailable: true, sortOrder: 0 });

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/products?all=true");
    setProducts(await res.json());
  }, []);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories?all=true");
    setCategories(await res.json());
  }, []);

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nameFr: "", nameAr: "", price: 0, emoji: "\uD83C\uDF55", categoryId: categories[0]?.id || "", isAvailable: true, sortOrder: 0 });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ nameFr: p.nameFr, nameAr: p.nameAr, price: p.price, emoji: p.emoji, categoryId: p.categoryId, isAvailable: p.isAvailable, sortOrder: p.sortOrder });
    setDialogOpen(true);
  };

  const save = async () => {
    const url = editing ? `/api/products/${editing.id}` : "/api/products";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) {
      toast.success(editing ? "Produit modifié" : "Produit créé");
      setDialogOpen(false);
      fetchProducts();
    } else {
      const data = await res.json();
      toast.error(data.error || "Erreur");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Produit supprimé"); fetchProducts(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
          <p className="text-muted-foreground">Gérez les produits de votre menu</p>
        </div>
        <Button onClick={openCreate} className="bg-[#CC0000] hover:bg-[#AA0000]">
          <Plus className="mr-2 size-4" /> Nouveau produit
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nom (FR)</Label><Input value={form.nameFr} onChange={e => setForm({ ...form, nameFr: e.target.value })} /></div>
              <div className="space-y-2"><Label>Nom (AR)</Label><Input value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} dir="rtl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Prix (DH)</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Emoji</Label><Input value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={form.categoryId ?? ""} onValueChange={(v: string | null) => setForm({ ...form, categoryId: v || "" })}>
                <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.nameFr}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><Switch checked={form.isAvailable} onCheckedChange={v => setForm({ ...form, isAvailable: v })} /><Label>Disponible</Label></div>
              <div className="space-y-2"><Label>Ordre</Label><Input type="number" className="w-20" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <Button onClick={save} className="w-full bg-[#CC0000] hover:bg-[#AA0000]">{editing ? "Enregistrer" : "Créer"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Nom (FR)</TableHead>
              <TableHead>Nom (AR)</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="text-xl">{p.emoji}</TableCell>
                <TableCell className="font-medium">{p.nameFr}</TableCell>
                <TableCell dir="rtl">{p.nameAr}</TableCell>
                <TableCell><Badge variant="outline">{p.category?.nameFr}</Badge></TableCell>
                <TableCell>{p.price} DH</TableCell>
                <TableCell><Badge variant={p.isAvailable ? "default" : "secondary"}>{p.isAvailable ? "Disponible" : "Indisponible"}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="size-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="size-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Aucun produit</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

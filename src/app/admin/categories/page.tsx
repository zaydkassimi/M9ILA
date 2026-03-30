"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string; slug: string; nameFr: string; nameAr: string;
  sortOrder: number; isActive: boolean; _count?: { products: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ nameFr: "", nameAr: "", slug: "", sortOrder: 0, isActive: true });

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories?all=true");
    setCategories(await res.json());
  }, []);

  useEffect(() => { fetchCategories(); }, []);

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const openCreate = () => {
    setEditing(null);
    setForm({ nameFr: "", nameAr: "", slug: "", sortOrder: 0, isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ nameFr: c.nameFr, nameAr: c.nameAr, slug: c.slug, sortOrder: c.sortOrder, isActive: c.isActive });
    setDialogOpen(true);
  };

  const save = async () => {
    const payload = { ...form, slug: form.slug || generateSlug(form.nameFr) };
    const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) {
      toast.success(editing ? "Catégorie modifiée" : "Catégorie créée");
      setDialogOpen(false);
      fetchCategories();
    } else {
      const data = await res.json();
      toast.error(data.error || "Erreur");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette catégorie et tous ses produits ?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Catégorie supprimée"); fetchCategories(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catégories</h1>
          <p className="text-muted-foreground">Gérez les catégories de votre menu</p>
        </div>
        <Button onClick={openCreate} className="bg-[#CC0000] hover:bg-[#AA0000]">
          <Plus className="mr-2 size-4" /> Nouvelle catégorie
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nom (FR)</Label><Input value={form.nameFr} onChange={e => { setForm({ ...form, nameFr: e.target.value, slug: editing ? form.slug : generateSlug(e.target.value) }); }} /></div>
              <div className="space-y-2"><Label>Nom (AR)</Label><Input value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} dir="rtl" /></div>
            </div>
            <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} /><Label>Active</Label></div>
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
              <TableHead>Ordre</TableHead>
              <TableHead>Nom (FR)</TableHead>
              <TableHead>Nom (AR)</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Produits</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.sortOrder}</TableCell>
                <TableCell className="font-medium">{c.nameFr}</TableCell>
                <TableCell dir="rtl">{c.nameAr}</TableCell>
                <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{c.slug}</code></TableCell>
                <TableCell>{c._count?.products || 0}</TableCell>
                <TableCell><Badge variant={c.isActive ? "default" : "secondary"}>{c.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="size-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="size-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Upload, X, ImageIcon, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string; nameFr: string; nameAr: string; price: number;
  emoji: string; image: string; categoryId: string; isAvailable: boolean; sortOrder: number;
  category?: { nameFr: string; slug: string };
}

interface Category { id: string; nameFr: string; slug: string; isActive: boolean; }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nameFr: "", nameAr: "", price: 0, emoji: "\uD83C\uDF55",
    image: "", categoryId: "", isAvailable: true, sortOrder: 0,
    descriptionFr: "", descriptionAr: "",
  });

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
    setPreviewUrl(null);
    setForm({
      nameFr: "", nameAr: "", price: 0, emoji: "\uD83C\uDF55",
      image: "", categoryId: categories[0]?.id || "",
      isAvailable: true, sortOrder: products.length,
      descriptionFr: "", descriptionAr: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setPreviewUrl(p.image || null);
    setForm({
      nameFr: p.nameFr, nameAr: p.nameAr, price: p.price,
      emoji: p.emoji, image: p.image || "",
      categoryId: p.categoryId, isAvailable: p.isAvailable,
      sortOrder: p.sortOrder, descriptionFr: "", descriptionAr: "",
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.type)) {
      toast.error("Format non supporté (JPEG, PNG, WebP, SVG)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 5MB)");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, image: data.url }));
        toast.success("Image uploadée");
      } else {
        const data = await res.json();
        toast.error(data.error || "Erreur upload");
        setPreviewUrl(null);
      }
    } catch {
      toast.error("Erreur lors de l'upload");
      setPreviewUrl(null);
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const removeImage = () => {
    setPreviewUrl(null);
    setForm(prev => ({ ...prev, image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const save = async () => {
    if (!form.nameFr || !form.nameAr || !form.categoryId) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setSaving(true);
    const url = editing ? `/api/products/${editing.id}` : "/api/products";
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const savedProduct = await res.json();
        toast.success(editing ? "Produit modifié" : "Produit créé");

        // Optimistic update
        if (editing) {
          setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, ...savedProduct } : p));
        } else {
          setProducts(prev => [...prev, savedProduct]);
        }
        setDialogOpen(false);
        fetchProducts();
      } else {
        const data = await res.json();
        toast.error(data.error || "Erreur");
      }
    } catch {
      toast.error("Erreur de connexion");
    }
    setSaving(false);
  };

  const toggleAvailability = async (product: Product) => {
    const newStatus = !product.isAvailable;

    // Optimistic update
    setProducts(prev => prev.map(p =>
      p.id === product.id ? { ...p, isAvailable: newStatus } : p
    ));

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: newStatus }),
      });

      if (res.ok) {
        toast.success(newStatus ? "Produit activé" : "Produit désactivé");
      } else {
        // Revert on failure
        setProducts(prev => prev.map(p =>
          p.id === product.id ? { ...p, isAvailable: !newStatus } : p
        ));
        toast.error("Erreur");
      }
    } catch {
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, isAvailable: !newStatus } : p
      ));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;

    // Optimistic remove
    const removed = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Produit supprimé");
      } else {
        // Revert
        if (removed) setProducts(prev => [...prev, removed].sort((a, b) => a.sortOrder - b.sortOrder));
        toast.error("Erreur");
      }
    } catch {
      if (removed) setProducts(prev => [...prev, removed].sort((a, b) => a.sortOrder - b.sortOrder));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Produits</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {products.length} produit{products.length !== 1 ? "s" : ""} dans votre menu
          </p>
        </div>
        <Button onClick={openCreate} className="bg-[#CC0000] hover:bg-[#AA0000] shadow-lg shadow-[#CC0000]/20">
          <Plus className="mr-2 size-4" /> Nouveau produit
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-200 border-transparent hover:border-[#CC0000]/20">
            {/* Image */}
            <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.nameFr}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-[#FFCC00]/20 to-[#FF6600]/10">
                  {product.emoji}
                </div>
              )}

              {/* Status badge */}
              <div className="absolute top-2 right-2">
                <Badge
                  variant={product.isAvailable ? "default" : "secondary"}
                  className={product.isAvailable
                    ? "bg-green-500 hover:bg-green-600 text-white text-[10px] px-2 py-0.5"
                    : "bg-gray-400 text-white text-[10px] px-2 py-0.5"
                  }
                >
                  {product.isAvailable ? "Disponible" : "Indisponible"}
                </Badge>
              </div>

              {/* Quick actions overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white"
                  onClick={() => openEdit(product)}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white"
                  onClick={() => toggleAvailability(product)}
                >
                  {product.isAvailable ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white text-red-500 hover:text-red-600"
                  onClick={() => remove(product.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>

            <CardContent className="p-3 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{product.nameFr}</h3>
                  <p className="text-xs text-muted-foreground truncate" dir="rtl">{product.nameAr}</p>
                </div>
                <span className="text-lg shrink-0">{product.emoji}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {product.category?.nameFr}
                </Badge>
                <span className="font-bold text-[#CC0000] text-sm">{product.price} DH</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add new card */}
        <button
          onClick={openCreate}
          className="h-[280px] rounded-xl border-2 border-dashed border-gray-200 hover:border-[#CC0000]/40 hover:bg-[#CC0000]/5 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-[#CC0000] group"
        >
          <div className="size-12 rounded-full bg-gray-100 group-hover:bg-[#CC0000]/10 flex items-center justify-center transition-colors">
            <Plus className="size-6" />
          </div>
          <span className="text-sm font-medium">Ajouter un produit</span>
        </button>
      </div>

      {products.length === 0 && (
        <div className="text-center py-16">
          <ImageIcon className="size-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">Aucun produit</h3>
          <p className="text-sm text-muted-foreground mb-4">Commencez par ajouter votre premier produit</p>
          <Button onClick={openCreate} className="bg-[#CC0000] hover:bg-[#AA0000]">
            <Plus className="mr-2 size-4" /> Nouveau produit
          </Button>
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editing ? "Modifier le produit" : "Nouveau produit"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Left: Image */}
            <div className="space-y-4">
              <Label>Image du produit</Label>
              <div
                className={`relative aspect-square rounded-xl border-2 border-dashed overflow-hidden transition-colors ${
                  dragOver
                    ? "border-[#CC0000] bg-[#CC0000]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <>
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeImage(); }}
                      className="absolute top-2 right-2 size-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="size-10 rounded-full border-2 border-[#CC0000] border-t-transparent animate-spin" />
                        <span className="text-sm">Upload en cours...</span>
                      </div>
                    ) : (
                      <>
                        <div className="size-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                          <Upload className="size-6" />
                        </div>
                        <p className="text-sm font-medium">Glissez une image ici</p>
                        <p className="text-xs text-muted-foreground mt-1">ou cliquez pour parcourir</p>
                        <p className="text-[10px] text-muted-foreground mt-2">JPEG, PNG, WebP — max 5MB</p>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </div>

              {/* Emoji alternative */}
              <div className="space-y-2">
                <Label>Ou emoji (si pas d&apos;image)</Label>
                <div className="flex gap-2">
                  {["\uD83C\uDF55", "\uD83C\uDF54", "\uD83E\uDD6A", "\uD83C\uDF5F", "\uD83C\uDF63", "\uD83C\uDF69", "\uD83E\uDD69", "\uD83C\uDF7D\uFE0F", "\uD83E\uDD57", "\uD83E\uDDC1", "\uD83C\uDF79", "\uD83C\uDF78"].map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setForm({ ...form, emoji: e })}
                      className={`size-10 rounded-lg border-2 flex items-center justify-center text-xl transition-all ${
                        form.emoji === e
                          ? "border-[#CC0000] bg-[#CC0000]/10 scale-110"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Form fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nom (FR) *</Label>
                  <Input
                    value={form.nameFr}
                    onChange={e => setForm({ ...form, nameFr: e.target.value })}
                    placeholder="Ex: Plateau fruits de mer"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nom (AR) *</Label>
                  <Input
                    value={form.nameAr}
                    onChange={e => setForm({ ...form, nameAr: e.target.value })}
                    placeholder="طبق فواكه البحر"
                    dir="rtl"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Prix (DH) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Catégorie *</Label>
                  <Select
                    value={form.categoryId || undefined}
                    onValueChange={(v: string | null) => setForm({ ...form, categoryId: v || "" })}
                  >
                    <SelectTrigger className="h-9"><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.nameFr}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Description (FR)</Label>
                  <Input
                    value={form.descriptionFr}
                    onChange={e => setForm({ ...form, descriptionFr: e.target.value })}
                    placeholder="Description courte..."
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Ordre</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.sortOrder}
                    onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="text-sm font-medium">Disponible</Label>
                  <p className="text-xs text-muted-foreground">Visible sur le site</p>
                </div>
                <Switch
                  checked={form.isAvailable}
                  onCheckedChange={(v: boolean) => setForm({ ...form, isAvailable: v })}
                />
              </div>

              {/* Preview card */}
              <div className="rounded-xl border bg-gray-50 p-3">
                <p className="text-xs text-muted-foreground mb-2">Aperçu</p>
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-lg bg-white border flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <Image src={previewUrl} alt="" width={48} height={48} className="object-cover size-12" />
                    ) : (
                      <span className="text-2xl">{form.emoji}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{form.nameFr || "Nom du produit"}</p>
                    <p className="text-xs text-muted-foreground" dir="rtl">{form.nameAr || "—"}</p>
                  </div>
                  <span className="font-bold text-[#CC0000] text-sm">{form.price} DH</span>
                </div>
              </div>

              <Button
                onClick={save}
                disabled={saving || uploading || !form.nameFr || !form.nameAr || !form.categoryId}
                className="w-full bg-[#CC0000] hover:bg-[#AA0000] h-10"
              >
                {saving ? (
                  <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />
                ) : null}
                {editing ? "Enregistrer les modifications" : "Créer le produit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

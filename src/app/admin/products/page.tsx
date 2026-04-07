"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Pencil, Trash2, Upload, X, ImageIcon, Eye, EyeOff, Search, Star, Flame,
  Clock, AlertTriangle, Tag, DollarSign, Copy, Sparkles, Loader2
} from "lucide-react";

function Pepper({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center ${className || ""}`} style={{ fontSize: "1.2em", lineHeight: 1 }}>
      🌶️
    </span>
  );
}
import { toast } from "sonner";

interface Product {
  id: string; nameFr: string; nameAr: string; price: number;
  emoji: string; image: string; categoryId: string; isAvailable: boolean;
  isFeatured: boolean; isPopular: boolean; prepTimeMinutes: number;
  spicinessLevel: number; allergens: string; dietaryTags: string;
  costPrice: number | null; sortOrder: number;
  descriptionFr: string; descriptionAr: string;
  category?: { nameFr: string; slug: string };
}

interface Category { id: string; nameFr: string; slug: string; isActive: boolean; }

const ALLERGEN_OPTIONS = [
  { key: "gluten", label: "Gluten" },
  { key: "dairy", label: "Produits laitiers" },
  { key: "shellfish", label: "Crustacés" },
  { key: "nuts", label: "Fruits à coque" },
  { key: "eggs", label: "Œufs" },
  { key: "soy", label: "Soja" },
  { key: "fish", label: "Poisson" },
];

const DIETARY_OPTIONS = [
  { key: "halal", label: "Halal" },
  { key: "gf", label: "Sans gluten" },
  { key: "vegan", label: "Végan" },
  { key: "vegetarian", label: "Végétarien" },
];

const SEAFOOD_EMOJIS = ["🦞", "🦐", "🦑", "🦪", "🐟", "🦀", "🐙"];
const SANDWICH_EMOJIS = ["🥪", "🌯", "🥙", "🌮", "🍔"];
const GENERAL_EMOJIS = ["🍕", "🍟", "🥗", "🥘", "🍹", "🍰", "🍋", "🥑"];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("basic");

  const [form, setForm] = useState({
    nameFr: "", nameAr: "", price: 0, emoji: "🍕",
    image: "", categoryId: "", isAvailable: true, isFeatured: false,
    isPopular: false, prepTimeMinutes: 15, spicinessLevel: 0,
    allergens: "", dietaryTags: "", costPrice: null as number | null,
    sortOrder: 0, descriptionFr: "", descriptionAr: "",
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

  const resetForm = () => {
    setForm({
      nameFr: "", nameAr: "", price: 0, emoji: "🍕",
      image: "", categoryId: categories[0]?.id || "",
      isAvailable: true, isFeatured: false, isPopular: false,
      prepTimeMinutes: 15, spicinessLevel: 0,
      allergens: "", dietaryTags: "", costPrice: null,
      sortOrder: products.length, descriptionFr: "", descriptionAr: "",
    });
    setPreviewUrl(null);
    setActiveTab("basic");
  };

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setPreviewUrl(p.image || null);
    setForm({
      nameFr: p.nameFr, nameAr: p.nameAr, price: p.price,
      emoji: p.emoji, image: p.image || "",
      categoryId: p.categoryId, isAvailable: p.isAvailable,
      isFeatured: p.isFeatured || false, isPopular: p.isPopular || false,
      prepTimeMinutes: p.prepTimeMinutes || 15,
      spicinessLevel: p.spicinessLevel || 0,
      allergens: p.allergens || "",
      dietaryTags: p.dietaryTags || "",
      costPrice: p.costPrice || null,
      sortOrder: p.sortOrder, descriptionFr: p.descriptionFr || "",
      descriptionAr: p.descriptionAr || "",
    });
    setActiveTab("basic");
    setDialogOpen(true);
  };

  const duplicateProduct = (p: Product) => {
    setEditing(null);
    setPreviewUrl(p.image || null);
    setForm({
      nameFr: `${p.nameFr} (copie)`, nameAr: `${p.nameAr} (نسخة)`,
      price: p.price, emoji: p.emoji, image: p.image || "",
      categoryId: p.categoryId, isAvailable: false,
      isFeatured: false, isPopular: false,
      prepTimeMinutes: p.prepTimeMinutes || 15,
      spicinessLevel: p.spicinessLevel || 0,
      allergens: p.allergens || "", dietaryTags: p.dietaryTags || "",
      costPrice: p.costPrice || null,
      sortOrder: products.length,
      descriptionFr: p.descriptionFr || "", descriptionAr: p.descriptionAr || "",
    });
    setActiveTab("basic");
    setDialogOpen(true);
    toast.info("Produit dupliqué — modifiez les détails puis créez");
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
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
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
    setProducts(prev => prev.map(p =>
      p.id === product.id ? { ...p, isAvailable: newStatus } : p
    ));
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: newStatus }),
      });
      if (!res.ok) {
        setProducts(prev => prev.map(p =>
          p.id === product.id ? { ...p, isAvailable: !newStatus } : p
        ));
        toast.error("Erreur");
      } else {
        toast.success(newStatus ? "Produit activé" : "Produit désactivé");
      }
    } catch {
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, isAvailable: !newStatus } : p
      ));
    }
  };

  const toggleFeatured = async (product: Product) => {
    const newVal = !product.isFeatured;
    setProducts(prev => prev.map(p =>
      p.id === product.id ? { ...p, isFeatured: newVal } : p
    ));
    try {
      await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: newVal }),
      });
      toast.success(newVal ? "Mis en avant" : "Retiré des favoris");
    } catch { /* revert handled by refetch */ fetchProducts(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    const removed = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        if (removed) setProducts(prev => [...prev, removed].sort((a, b) => a.sortOrder - b.sortOrder));
        toast.error("Erreur");
      } else {
        toast.success("Produit supprimé");
      }
    } catch {
      if (removed) setProducts(prev => [...prev, removed].sort((a, b) => a.sortOrder - b.sortOrder));
    }
  };

  const toggleAllergen = (key: string) => {
    const current = form.allergens ? JSON.parse(form.allergens) as string[] : [];
    const updated = current.includes(key) ? current.filter((a: string) => a !== key) : [...current, key];
    setForm(prev => ({ ...prev, allergens: JSON.stringify(updated) }));
  };

  const toggleDietary = (key: string) => {
    const current = form.dietaryTags ? JSON.parse(form.dietaryTags) as string[] : [];
    const updated = current.includes(key) ? current.filter((a: string) => a !== key) : [...current, key];
    setForm(prev => ({ ...prev, dietaryTags: JSON.stringify(updated) }));
  };

  const aiGenerateDescription = async (lang: "fr" | "ar") => {
    if (!form.nameFr) {
      toast.error("Entrez d'abord le nom du produit");
      return;
    }
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetField: lang === "fr" ? "product_description_fr" : "product_description_ar",
          message: `Produit: "${form.nameFr}" (${form.nameAr}). Prix: ${form.price} DH. Catégorie: ${categories.find(c => c.id === form.categoryId)?.nameFr || ""}. ${lang === "ar" ? "Génère la description EN ARABE UNIQUEMENT." : "Génère la description EN FRANÇAIS UNIQUEMENT."} Ne fournis AUCUNE traduction en anglais ni d'autre langue.`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setForm(prev => ({ ...prev, [lang === "fr" ? "descriptionFr" : "descriptionAr"]: data.reply }));
        toast.success("Description générée par IA");
      } else {
        toast.error("Erreur IA");
      }
    } catch {
      toast.error("Erreur de connexion IA");
    }
    setAiGenerating(false);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = searchQuery === "" ||
      p.nameFr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameAr.includes(searchQuery);
    const matchesCategory = filterCategory === "all" || p.categoryId === filterCategory;
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "available" && p.isAvailable) ||
      (filterStatus === "unavailable" && !p.isAvailable) ||
      (filterStatus === "featured" && p.isFeatured) ||
      (filterStatus === "popular" && p.isPopular);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const allEmojis = [...SEAFOOD_EMOJIS, ...SANDWICH_EMOJIS, ...GENERAL_EMOJIS];

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

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={(v) => v && setFilterCategory(v)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Catégorie">
              {(val: string) => {
                if (val === "all") return "Toutes catégories";
                return categories.find(c => c.id === val)?.nameFr || "Catégorie";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.nameFr}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(v) => v && setFilterStatus(v)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Statut">
              {(val: string) => {
                switch (val) {
                  case "available": return "Disponibles";
                  case "unavailable": return "Indisponibles";
                  case "featured": return "⭐ En avant";
                  case "popular": return "🔥 Populaires";
                  default: return "Tous";
                }
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="available">Disponibles</SelectItem>
            <SelectItem value="unavailable">Indisponibles</SelectItem>
            <SelectItem value="featured">⭐ En avant</SelectItem>
            <SelectItem value="popular">🔥 Populaires</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-200 border-transparent hover:border-[#CC0000]/20">
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

              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                {product.isFeatured && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] px-1.5 py-0">
                    <Star className="size-2.5 mr-0.5 inline" /> Spécial
                  </Badge>
                )}
                {product.isPopular && (
                  <Badge className="bg-red-500 hover:bg-red-600 text-white text-[10px] px-1.5 py-0">
                    <Flame className="size-2.5 mr-0.5 inline" /> Populaire
                  </Badge>
                )}
              </div>

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
                  className={`h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white ${product.isFeatured ? "text-amber-500" : "text-gray-400"}`}
                  onClick={() => toggleFeatured(product)}
                  title={product.isFeatured ? "Retirer des favoris" : "Mettre en avant"}
                >
                  <Star className="size-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white"
                  onClick={() => duplicateProduct(product)}
                  title="Dupliquer"
                >
                  <Copy className="size-3.5" />
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
              {product.prepTimeMinutes > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="size-3" />
                  {product.prepTimeMinutes} min
                </div>
              )}
              {product.spicinessLevel > 0 && (
                <div className="flex gap-0.5">
                  {Array.from({ length: product.spicinessLevel }).map((_, i) => (
                    <Pepper key={i} className="size-3 text-red-500" />
                  ))}
                </div>
              )}
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

      {filteredProducts.length === 0 && products.length > 0 && (
        <div className="text-center py-12">
          <Search className="size-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">Aucun résultat</h3>
          <p className="text-sm text-muted-foreground">Essayez de modifier vos filtres</p>
        </div>
      )}

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
        <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editing ? "Modifier le produit" : "Nouveau produit"}
            </DialogTitle>
            <DialogDescription>
              {editing ? "Modifiez les détails du produit" : "Ajoutez un nouveau produit au menu"}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => v && setActiveTab(v)} className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Infos</TabsTrigger>
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="preview">Aperçu</TabsTrigger>
            </TabsList>

            {/* Basic Tab */}
            <TabsContent value="basic" className="space-y-4 py-4">
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
                    onValueChange={(v) => setForm({ ...form, categoryId: v || "" })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Choisir">
                        {(val: string) => val ? categories.find(c => c.id === val)?.nameFr || val : "Choisir"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.nameFr}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Prix coûtant (DH)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={form.costPrice || ""}
                      onChange={e => setForm({ ...form, costPrice: e.target.value ? parseFloat(e.target.value) : null })}
                      className="h-9 pl-9"
                      placeholder="Optionnel"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Temps prép. (min)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      type="number"
                      min="0"
                      max="120"
                      value={form.prepTimeMinutes}
                      onChange={e => setForm({ ...form, prepTimeMinutes: parseInt(e.target.value) || 0 })}
                      className="h-9 pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Description (FR)</Label>
                  <div className="relative">
                    <Textarea
                      value={form.descriptionFr}
                      onChange={e => setForm({ ...form, descriptionFr: e.target.value })}
                      placeholder="Description du plat..."
                      rows={2}
                      className={`text-sm pr-12 transition-all ${
                        aiGenerating ? 'animate-gemini-shimmer' : ''
                      }`}
                    />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className={`absolute bottom-2 right-2 h-8 w-8 text-muted-foreground hover:text-primary transition-all ${
                        aiGenerating ? 'animate-pulse' : ''
                      }`}
                      onClick={() => aiGenerateDescription("fr")} 
                      disabled={aiGenerating} 
                      title="Générer avec IA"
                    >
                      {aiGenerating ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Description (AR)</Label>
                  <div className="relative">
                    <Textarea
                      value={form.descriptionAr}
                      onChange={e => setForm({ ...form, descriptionAr: e.target.value })}
                      placeholder="وصف الطبق..."
                      dir="rtl"
                      rows={2}
                      className={`text-sm pl-12 transition-all ${
                        aiGenerating ? 'animate-gemini-shimmer' : ''
                      }`}
                    />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className={`absolute bottom-2 left-2 h-8 w-8 text-muted-foreground hover:text-primary transition-all ${
                        aiGenerating ? 'animate-pulse' : ''
                      }`}
                      onClick={() => aiGenerateDescription("ar")} 
                      disabled={aiGenerating} 
                      title="Générer avec IA"
                    >
                      {aiGenerating ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Niveau de piment</Label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { level: 0, label: "Doux", activeColor: "border-gray-800 bg-gray-50 text-gray-900" },
                    { level: 1, label: "Léger", activeColor: "border-yellow-500 bg-yellow-50 text-yellow-700" },
                    { level: 2, label: "Moyen", activeColor: "border-orange-500 bg-orange-50 text-orange-700" },
                    { level: 3, label: "Fort", activeColor: "border-red-600 bg-red-50 text-red-700 font-bold" },
                  ].map(({ level, label, activeColor }) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setForm({ ...form, spicinessLevel: level })}
                      className={`flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg border-2 transition-all duration-200 ${
                        form.spicinessLevel === level
                          ? `shadow-sm scale-[1.02] ${activeColor}`
                          : "border-border bg-transparent text-muted-foreground hover:bg-secondary/50 hover:border-border/80"
                      }`}
                    >
                      <div className="flex h-5 items-center justify-center gap-0.5">
                        {level === 0 ? (
                          <div className="size-4 rounded-full border-2 border-current opacity-30" />
                        ) : (
                          Array.from({ length: level }).map((_, i) => (
                            <Pepper key={i} className={form.spicinessLevel === level ? "opacity-100" : "opacity-40 grayscale"} />
                          ))
                        )}
                      </div>
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
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
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4 py-4">
              {/* Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Star className="size-5 text-amber-500" />
                    <div>
                      <Label className="text-sm font-medium">Produit en avant</Label>
                      <p className="text-xs text-muted-foreground">Affiché comme &quot;Spécial du chef&quot;</p>
                    </div>
                  </div>
                  <Switch
                    checked={form.isFeatured}
                    onCheckedChange={(v: boolean) => setForm({ ...form, isFeatured: v })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Flame className="size-5 text-red-500" />
                    <div>
                      <Label className="text-sm font-medium">Produit populaire</Label>
                      <p className="text-xs text-muted-foreground">Affiché comme &quot;Best-seller&quot;</p>
                    </div>
                  </div>
                  <Switch
                    checked={form.isPopular}
                    onCheckedChange={(v: boolean) => setForm({ ...form, isPopular: v })}
                  />
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
              </div>

              {/* Allergens */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-500" />
                  Allergènes
                </Label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGEN_OPTIONS.map(a => {
                    const current = form.allergens ? JSON.parse(form.allergens) as string[] : [];
                    const isActive = current.includes(a.key);
                    return (
                      <button
                        key={a.key}
                        type="button"
                        onClick={() => toggleAllergen(a.key)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                          isActive
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-gray-200 text-muted-foreground hover:border-gray-300"
                        }`}
                      >
                        {a.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dietary Tags */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-2">
                  <Tag className="size-4 text-green-500" />
                  Régimes alimentaires
                </Label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map(d => {
                    const current = form.dietaryTags ? JSON.parse(form.dietaryTags) as string[] : [];
                    const isActive = current.includes(d.key);
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => toggleDietary(d.key)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                          isActive
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-200 text-muted-foreground hover:border-gray-300"
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Ordre d&apos;affichage</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                  className="h-9"
                />
              </div>

              <Button
                onClick={save}
                disabled={saving || !form.nameFr || !form.nameAr || !form.categoryId}
                className="w-full bg-[#CC0000] hover:bg-[#AA0000] h-10"
              >
                {editing ? "Enregistrer les modifications" : "Créer le produit"}
              </Button>
            </TabsContent>

            {/* Image Tab */}
            <TabsContent value="image" className="space-y-4 py-4">
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
                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
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

              {/* Emoji picker */}
              <div className="space-y-2">
                <Label>Ou choisissez un emoji</Label>
                <div className="flex flex-wrap gap-2">
                  {allEmojis.map((e) => (
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
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="py-4">
              <div className="rounded-xl border bg-gray-50 p-4 space-y-3">
                <p className="text-xs text-muted-foreground font-medium">Aperçu sur le site</p>
                <div className="bg-white rounded-xl shadow-sm border p-4">
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                      {previewUrl ? (
                        <Image src={previewUrl} alt="" width={64} height={64} className="object-cover size-16" />
                      ) : (
                        <span className="text-3xl">{form.emoji}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-dark">{form.nameFr || "Nom du produit"}</p>
                        {form.isFeatured && <Star className="size-4 text-amber-500" />}
                        {form.isPopular && <Flame className="size-4 text-red-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground" dir="rtl">{form.nameAr || "—"}</p>
                      {form.descriptionFr && <p className="text-xs text-gray-500 mt-1">{form.descriptionFr}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-[#CC0000]">{form.price} DH</span>
                        {form.prepTimeMinutes > 0 && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="size-3" /> {form.prepTimeMinutes} min
                          </span>
                        )}
                        {form.spicinessLevel > 0 && (
                          <div className="flex gap-0.5">
                            {Array.from({ length: form.spicinessLevel }).map((_, i) => (
                              <Pepper key={i} className="size-3 text-red-500" />
                            ))}
                          </div>
                        )}
                      </div>
                      {form.allergens && JSON.parse(form.allergens).length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {JSON.parse(form.allergens).map((a: string) => (
                            <Badge key={a} variant="outline" className="text-[9px] text-amber-600 border-amber-200">
                              {ALLERGEN_OPTIONS.find(o => o.key === a)?.label || a}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {form.dietaryTags && JSON.parse(form.dietaryTags).length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {JSON.parse(form.dietaryTags).map((d: string) => (
                            <Badge key={d} variant="outline" className="text-[9px] text-green-600 border-green-200">
                              {DIETARY_OPTIONS.find(o => o.key === d)?.label || d}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={save}
                disabled={saving || uploading || !form.nameFr || !form.nameAr || !form.categoryId}
                className="w-full mt-4 bg-[#CC0000] hover:bg-[#AA0000] h-10"
              >
                {saving ? (
                  <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />
                ) : null}
                {editing ? "Enregistrer les modifications" : "Créer le produit"}
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

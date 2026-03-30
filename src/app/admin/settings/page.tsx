"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Palette, Globe, Mail, Bot, ToggleLeft } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    setSettings(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, []);

  const update = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveAll = async (keys: string[]) => {
    setSaving(true);
    const updates = keys.map(k => ({ key: k, value: settings[k] || "" }));
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) toast.success("Paramètres enregistrés");
    else toast.error("Erreur lors de la sauvegarde");
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-12 text-muted-foreground">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Configurez votre site et application</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2"><Globe className="size-4" /> Général</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2"><Palette className="size-4" /> Apparence</TabsTrigger>
          <TabsTrigger value="features" className="gap-2"><ToggleLeft className="size-4" /> Fonctionnalités</TabsTrigger>
          <TabsTrigger value="smtp" className="gap-2"><Mail className="size-4" /> SMTP</TabsTrigger>
          <TabsTrigger value="ai" className="gap-2"><Bot className="size-4" /> IA</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle>Informations générales</CardTitle><CardDescription>Nom du restaurant, contact, adresse</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nom (FR)</Label><Input value={settings.site_name_fr || ""} onChange={e => update("site_name_fr", e.target.value)} /></div>
                <div className="space-y-2"><Label>Nom (AR)</Label><Input value={settings.site_name_ar || ""} onChange={e => update("site_name_ar", e.target.value)} dir="rtl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Tagline (FR)</Label><Input value={settings.site_tagline_fr || ""} onChange={e => update("site_tagline_fr", e.target.value)} /></div>
                <div className="space-y-2"><Label>Tagline (AR)</Label><Input value={settings.site_tagline_ar || ""} onChange={e => update("site_tagline_ar", e.target.value)} dir="rtl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Téléphone</Label><Input value={settings.phone || ""} onChange={e => update("phone", e.target.value)} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={settings.email || ""} onChange={e => update("email", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Adresse (FR)</Label><Input value={settings.address_fr || ""} onChange={e => update("address_fr", e.target.value)} /></div>
                <div className="space-y-2"><Label>Adresse (AR)</Label><Input value={settings.address_ar || ""} onChange={e => update("address_ar", e.target.value)} dir="rtl" /></div>
              </div>
              <div className="space-y-2"><Label>Instagram</Label><Input value={settings.instagram_url || ""} onChange={e => update("instagram_url", e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Mode de langue</Label>
                <Select value={settings.language_mode || "both"} onValueChange={(v: string | null) => update("language_mode", v || "both")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Bilingue (FR/AR)</SelectItem>
                    <SelectItem value="fr">Français uniquement</SelectItem>
                    <SelectItem value="ar">Arabe uniquement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => saveAll(["site_name_fr","site_name_ar","site_tagline_fr","site_tagline_ar","phone","email","address_fr","address_ar","instagram_url","language_mode"])} disabled={saving} className="bg-[#CC0000] hover:bg-[#AA0000]">
                <Save className="mr-2 size-4" /> Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader><CardTitle>Apparence</CardTitle><CardDescription>Couleurs et logo du site</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: "primary_color", label: "Primaire" },
                  { key: "flame_orange", label: "Flamme orange" },
                  { key: "flame_yellow", label: "Flamme jaune" },
                  { key: "brand_bg", label: "Fond marque" },
                  { key: "dark_color", label: "Sombre" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={settings[key] || "#000000"} onChange={e => update(key, e.target.value)} className="w-12 h-10 p-1 cursor-pointer" />
                      <Input value={settings[key] || ""} onChange={e => update(key, e.target.value)} className="flex-1" />
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={() => saveAll(["primary_color","flame_orange","flame_yellow","brand_bg","dark_color"])} disabled={saving} className="bg-[#CC0000] hover:bg-[#AA0000]">
                <Save className="mr-2 size-4" /> Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader><CardTitle>Fonctionnalités</CardTitle><CardDescription>Activez ou désactivez les fonctionnalités</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: "cod_enabled", label: "Paiement à la livraison (COD)", desc: "Permettre les commandes avec paiement à la livraison" },
                { key: "online_ordering_enabled", label: "Commandes en ligne", desc: "Permettre aux clients de commander en ligne" },
                { key: "contact_form_enabled", label: "Formulaire de contact", desc: "Afficher le formulaire de contact" },
                { key: "ai_enabled", label: "Assistant IA", desc: "Afficher le chatbot IA" },
                { key: "glovo_enabled", label: "Lien Glovo", desc: "Afficher le bouton Glovo" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">{label}</Label>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <Switch checked={settings[key] === "true"} onCheckedChange={(v: boolean) => update(key, v ? "true" : "false")} />
                </div>
              ))}
              <Button onClick={() => saveAll(["cod_enabled","online_ordering_enabled","contact_form_enabled","ai_enabled","glovo_enabled"])} disabled={saving} className="bg-[#CC0000] hover:bg-[#AA0000]">
                <Save className="mr-2 size-4" /> Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smtp">
          <Card>
            <CardHeader><CardTitle>Configuration SMTP</CardTitle><CardDescription>Paramètres d&apos;envoi d&apos;emails</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Serveur SMTP</Label><Input value={settings.smtp_host || ""} onChange={e => update("smtp_host", e.target.value)} placeholder="smtp.gmail.com" /></div>
                <div className="space-y-2"><Label>Port</Label><Input value={settings.smtp_port || ""} onChange={e => update("smtp_port", e.target.value)} placeholder="587" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Utilisateur</Label><Input value={settings.smtp_user || ""} onChange={e => update("smtp_user", e.target.value)} /></div>
                <div className="space-y-2"><Label>Mot de passe</Label><Input type="password" value={settings.smtp_pass || ""} onChange={e => update("smtp_pass", e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Expéditeur (From)</Label><Input value={settings.smtp_from || ""} onChange={e => update("smtp_from", e.target.value)} /></div>
              <Button onClick={() => saveAll(["smtp_host","smtp_port","smtp_user","smtp_pass","smtp_from"])} disabled={saving} className="bg-[#CC0000] hover:bg-[#AA0000]">
                <Save className="mr-2 size-4" /> Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader><CardTitle>Assistant IA</CardTitle><CardDescription>Configuration du chatbot avec OpenRouter</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Clé API OpenRouter</Label>
                <Input type="password" value={settings.ai_api_key || ""} onChange={e => update("ai_api_key", e.target.value)} placeholder="sk-or-..." />
              </div>
              <div className="space-y-2">
                <Label>Modèle</Label>
                <Input value={settings.ai_model || "openrouter/auto"} onChange={e => update("ai_model", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Instructions (prompt système)</Label>
                <Textarea value={settings.ai_instructions || ""} onChange={e => update("ai_instructions", e.target.value)} rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Message accueil (FR)</Label><Textarea value={settings.ai_welcome_fr || ""} onChange={e => update("ai_welcome_fr", e.target.value)} rows={2} /></div>
                <div className="space-y-2"><Label>Message accueil (AR)</Label><Textarea value={settings.ai_welcome_ar || ""} onChange={e => update("ai_welcome_ar", e.target.value)} rows={2} dir="rtl" /></div>
              </div>
              <Button onClick={() => saveAll(["ai_api_key","ai_model","ai_instructions","ai_welcome_fr","ai_welcome_ar"])} disabled={saving} className="bg-[#CC0000] hover:bg-[#AA0000]">
                <Save className="mr-2 size-4" /> Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

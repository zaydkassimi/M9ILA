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
import { Save, Palette, Globe, Mail, Bot, ToggleLeft, Image as ImageIcon, Plus, Trash2, Sparkles, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AI_MODELS = [
  { value: "openai/gpt-4o", label: "GPT-4o (Premium)" },
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet (Premium)" },
  { value: "google/gemini-2.0-pro-exp-02-05:free", label: "Gemini 2.0 Pro (Gratuit)" },
  { value: "google/gemini-2.0-flash-exp:free", label: "Gemini 2.0 Flash (Gratuit)" },
  { value: "deepseek/deepseek-r1", label: "DeepSeek R1" },
  { value: "deepseek/deepseek-r1:free", label: "DeepSeek R1 (Gratuit)" },
  { value: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
  { value: "mistralai/mistral-large", label: "Mistral Large" },
  { value: "mistralai/mistral-7b-instruct:free", label: "Mistral 7B (Gratuit)" },
  { value: "openrouter/auto", label: "Auto (Meilleur modèle)" }
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingField, setGeneratingField] = useState<string | null>(null);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [validatingKey, setValidatingKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [aiModels, setAiModels] = useState<{ value: string, label: string }[]>(AI_MODELS);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setSettings(data);
    if (!data.ai_api_key) setIsEditingKey(true);
    setLoading(false);
  }, []);

  const fetchModels = useCallback(async () => {
    if (!settings.ai_api_key || isEditingKey) return;
    try {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { "Authorization": `Bearer ${settings.ai_api_key}` }
      });
      const data = await res.json();
      if (data && data.data) {
        const fetched = data.data.map((m: any) => {
          const isFree = parseFloat(m.pricing?.prompt) === 0 && parseFloat(m.pricing?.completion) === 0;
          return {
            value: m.id,
            label: `${m.name} ${isFree ? '(Gratuit)' : ''}`
          };
        });
        // Trier pour mettre les modèles gratuits en premier
        fetched.sort((a: any, b: any) => {
          if (a.label.includes('(Gratuit)') && !b.label.includes('(Gratuit)')) return -1;
          if (!a.label.includes('(Gratuit)') && b.label.includes('(Gratuit)')) return 1;
          return a.label.localeCompare(b.label);
        });
        setAiModels([
          { value: "openrouter/auto", label: "Auto (Meilleur modèle)" },
          ...fetched
        ]);
      }
    } catch {
      console.error("Impossible de charger les modèles OpenRouter");
    }
  }, []);

  useEffect(() => { 
    fetchSettings(); 
  }, [fetchSettings]);

  useEffect(() => {
    if (settings.ai_api_key && !isEditingKey) {
      fetchModels();
    } else {
      setAiModels([{ value: "openrouter/auto", label: "Auto (Meilleur modèle)" }]);
    }
  }, [settings.ai_api_key, isEditingKey, fetchModels]);

  useEffect(() => {
    if (!isEditingKey || !settings.ai_api_key) {
      setKeyError(null);
      return;
    }
    const timer = setTimeout(async () => {
      setValidatingKey(true);
      try {
        const checkRes = await fetch("https://openrouter.ai/api/v1/auth/key", {
          headers: { Authorization: `Bearer ${settings.ai_api_key}` }
        });
        if (checkRes.ok) {
          setKeyError(null);
          toast.success("Clé API valide ! Chargement des modèles...");
          setIsEditingKey(false);
        } else {
          setKeyError("Clé API invalide. Vérifiez votre saisie.");
        }
      } catch {
        setKeyError("Erreur de validation de la clé.");
      }
      setValidatingKey(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [settings.ai_api_key, isEditingKey]);

  const update = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveAIConfig = async () => {
    if (keyError) {
      toast.error("Veuillez corriger la clé API avant d'enregistrer.");
      return;
    }
    if (isEditingKey && !settings.ai_api_key) {
      setIsEditingKey(true);
    }
    await saveAll(["ai_api_key","ai_model","ai_instructions","ai_welcome_fr","ai_welcome_ar"]);
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

  const aiGenerate = async (field: string) => {
    if (!settings.ai_api_key && !process.env.OPENROUTER_API_KEY) {
      toast.error("Configurez d'abord la clé API dans l'onglet IA");
      return;
    }

    const fieldPrompts: Record<string, { label: string; language: "fr" | "ar"; kind: "name" | "tagline" }> = {
      site_name_fr: { label: "nom du restaurant", language: "fr", kind: "name" },
      site_name_ar: { label: "اسم المطعم", language: "ar", kind: "name" },
      site_tagline_fr: { label: "tagline du site", language: "fr", kind: "tagline" },
      site_tagline_ar: { label: "شعار الموقع", language: "ar", kind: "tagline" },
    };

    const config = fieldPrompts[field] || { label: field, language: "fr" as const, kind: "tagline" as const };
    const instruction = config.kind === "name"
      ? (config.language === "fr"
        ? `Propose un nom court et naturel pour un restaurant à Casablanca. Réponds uniquement avec le nom, sans guillemets, sans préambule, sans ponctuation finale inutile.`
        : `اقترح اسمًا قصيرًا وطبيعيًا لمطعم في الدار البيضاء. أجب بالاسم فقط، بدون أي مقدمة أو علامات اقتباس أو شرح.`)
      : (config.language === "fr"
        ? `Rédige une tagline marketing courte pour un restaurant à Casablanca. Réponds uniquement avec la tagline, en une seule phrase, sans guillemets, sans introduction, sans texte avant ou après.`
        : `اكتب شعارًا تسويقيًا قصيرًا لمطعم في الدار البيضاء. أجب بالشعار فقط، في جملة واحدة، بدون أي مقدمة أو علامات اقتباس أو شرح.`);

    setGeneratingField(field);
    try {
      const res = await fetch("/api/ai-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetField: field,
          message: instruction,
          context: `Restaurant: ${settings.site_name_fr || "M9ila"}. Adresse: ${settings.address_fr || ""}. Spécialité: fruits de mer, sandwichs, tajines à Casablanca.`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        update(field, data.reply);
        toast.success("Contenu généré par IA");
      } else {
        toast.error("Erreur IA");
      }
    } catch {
      toast.error("Erreur de connexion IA");
    }
    setGeneratingField(null);
  };

  if (loading) return <div className="flex items-center justify-center py-12 text-muted-foreground">Chargement...</div>;

  const aiConfigured = settings.ai_api_key || settings.ai_enabled === "true";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Configurez votre site et application</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="general" className="gap-1.5"><Globe className="size-3.5" /> Général</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5"><Palette className="size-3.5" /> Apparence</TabsTrigger>
          <TabsTrigger value="features" className="gap-1.5"><ToggleLeft className="size-3.5" /> Fonctionnalités</TabsTrigger>
          <TabsTrigger value="smtp" className="gap-1.5"><Mail className="size-3.5" /> SMTP</TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5"><Bot className="size-3.5" /> IA</TabsTrigger>
          <TabsTrigger value="gallery" className="gap-1.5"><ImageIcon className="size-3.5" /> Galerie</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle>Informations générales</CardTitle><CardDescription>Nom du restaurant, contact, adresse</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom (FR)</Label>
                  <div className="relative group">
                    <Input 
                      value={settings.site_name_fr || ""} 
                      onChange={e => update("site_name_fr", e.target.value)} 
                      className={`pr-10 ${generatingField === "site_name_fr" ? "border-blue-400 ring-2 ring-blue-400/20" : ""}`} 
                    />
                    {aiConfigured && (
                      <Button size="icon" variant="ghost" onClick={() => aiGenerate("site_name_fr")} disabled={generatingField !== null} title="Générer avec IA" className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-black hover:bg-transparent ${generatingField === "site_name_fr" ? "animate-pulse text-blue-600" : ""}`}>
                        <Sparkles className="size-4" />
                      </Button>
                    )}
                    {generatingField === "site_name_fr" && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-md">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent -translate-x-[150%] animate-[gemini-shimmer_1.5s_infinite]" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nom (AR)</Label>
                  <div className="relative group">
                    <Input 
                      value={settings.site_name_ar || ""} 
                      onChange={e => update("site_name_ar", e.target.value)} 
                      dir="rtl" 
                      className={`pl-10 pr-3 ${generatingField === "site_name_ar" ? "border-blue-400 ring-2 ring-blue-400/20" : ""}`} 
                    />
                    {aiConfigured && (
                      <Button size="icon" variant="ghost" onClick={() => aiGenerate("site_name_ar")} disabled={generatingField !== null} title="Générer avec IA" className={`absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-black hover:bg-transparent ${generatingField === "site_name_ar" ? "animate-pulse text-blue-600" : ""}`}>
                        <Sparkles className="size-4" />
                      </Button>
                    )}
                    {generatingField === "site_name_ar" && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-md">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent translate-x-[150%] animate-[gemini-shimmer_1.5s_infinite_reverse]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tagline (FR)</Label>
                  <div className="relative group">
                    <Input 
                      value={settings.site_tagline_fr || ""} 
                      onChange={e => update("site_tagline_fr", e.target.value)} 
                      className={`pr-10 ${generatingField === "site_tagline_fr" ? "border-blue-400 ring-2 ring-blue-400/20" : ""}`} 
                    />
                    {aiConfigured && (
                      <Button size="icon" variant="ghost" onClick={() => aiGenerate("site_tagline_fr")} disabled={generatingField !== null} className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-black hover:bg-transparent ${generatingField === "site_tagline_fr" ? "animate-pulse text-blue-600" : ""}`}>
                        <Sparkles className="size-4" />
                      </Button>
                    )}
                    {generatingField === "site_tagline_fr" && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-md">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent -translate-x-[150%] animate-[gemini-shimmer_1.5s_infinite]" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tagline (AR)</Label>
                  <div className="relative group">
                    <Input 
                      value={settings.site_tagline_ar || ""} 
                      onChange={e => update("site_tagline_ar", e.target.value)} 
                      dir="rtl" 
                      className={`pl-10 pr-3 ${generatingField === "site_tagline_ar" ? "border-blue-400 ring-2 ring-blue-400/20" : ""}`} 
                    />
                    {aiConfigured && (
                      <Button size="icon" variant="ghost" onClick={() => aiGenerate("site_tagline_ar")} disabled={generatingField !== null} className={`absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-black hover:bg-transparent ${generatingField === "site_tagline_ar" ? "animate-pulse text-blue-600" : ""}`}>
                        <Sparkles className="size-4" />
                      </Button>
                    )}
                    {generatingField === "site_tagline_ar" && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-md">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent translate-x-[150%] animate-[gemini-shimmer_1.5s_infinite_reverse]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Téléphone</Label><Input value={settings.phone || ""} onChange={e => update("phone", e.target.value)} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={settings.email || ""} onChange={e => update("email", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Adresse (FR)</Label><Input value={settings.address_fr || ""} onChange={e => update("address_fr", e.target.value)} /></div>
                <div className="space-y-2"><Label>Adresse (AR)</Label><Input value={settings.address_ar || ""} onChange={e => update("address_ar", e.target.value)} dir="rtl" /></div>
              </div>
              <div className="space-y-2"><Label>Instagram URL</Label><Input value={settings.instagram_url || ""} onChange={e => update("instagram_url", e.target.value)} /></div>
              <div className="space-y-2"><Label>URL Glovo</Label><Input value={settings.glovo_url || ""} onChange={e => update("glovo_url", e.target.value)} placeholder="https://glovoapp.com" /></div>
              <div className="space-y-2">
                <Label>Mode de langue</Label>
                <Select value={settings.language_mode || "both"} onValueChange={(v) => v && update("language_mode", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Bilingue (FR/AR)</SelectItem>
                    <SelectItem value="fr">Français uniquement</SelectItem>
                    <SelectItem value="ar">Arabe uniquement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => saveAll(["site_name_fr","site_name_ar","site_tagline_fr","site_tagline_ar","phone","email","address_fr","address_ar","instagram_url","glovo_url","language_mode"])} disabled={saving} className="bg-[#CC0000] hover:bg-[#AA0000] rounded-lg">
                <Save className="mr-2 size-4" /> Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader><CardTitle>Apparence</CardTitle><CardDescription>Couleurs et logo du site</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                      <Input type="color" value={settings[key] || "#000000"} onChange={e => update(key, e.target.value)} className="w-12 h-9 p-1 cursor-pointer rounded-lg" />
                      <Input value={settings[key] || ""} onChange={e => update(key, e.target.value)} className="flex-1 h-9" />
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={() => saveAll(["primary_color","flame_orange","flame_yellow","brand_bg","dark_color"])} disabled={saving} className="bg-[#CC0000] hover:bg-[#AA0000] rounded-lg">
                <Save className="mr-2 size-4" /> Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features">
          <Card>
            <CardHeader><CardTitle>Fonctionnalités</CardTitle><CardDescription>Activez ou désactivez les fonctionnalités</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "cod_enabled", label: "Paiement à la livraison (COD)", desc: "Permettre les commandes avec paiement à la livraison" },
                { key: "online_ordering_enabled", label: "Commandes en ligne", desc: "Permettre aux clients de commander en ligne" },
                { key: "contact_form_enabled", label: "Formulaire de contact", desc: "Afficher le formulaire de contact" },
                { key: "ai_enabled", label: "Assistant IA", desc: "Afficher le chatbot IA sur le site" },
                { key: "chatbot_allow_orders", label: "Commander via le chatbot", desc: "Permettre aux clients de commander depuis le chat" },
                { key: "chatbot_allow_contact", label: "Contact via le chatbot", desc: "Permettre aux clients d'envoyer un message depuis le chat" },
                { key: "glovo_enabled", label: "Lien Glovo", desc: "Afficher le bouton Glovo" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="space-y-0.5">
                    <Label className="text-base">{label}</Label>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <Switch checked={settings[key] === "true"} onCheckedChange={(v: boolean) => update(key, v ? "true" : "false")} />
                </div>
              ))}
              <Button onClick={() => saveAll(["cod_enabled","online_ordering_enabled","contact_form_enabled","ai_enabled","chatbot_allow_orders","chatbot_allow_contact","glovo_enabled"])} disabled={saving} className="bg-[#CC0000] hover:bg-[#AA0000] rounded-lg">
                <Save className="mr-2 size-4" /> Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMTP Tab */}
        <TabsContent value="smtp">
          <Card>
            <CardHeader><CardTitle>Configuration SMTP</CardTitle><CardDescription>Paramètres d&apos;envoi d&apos;emails</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Serveur SMTP</Label><Input value={settings.smtp_host || ""} onChange={e => update("smtp_host", e.target.value)} placeholder="smtp.gmail.com" /></div>
                <div className="space-y-2"><Label>Port</Label><Input value={settings.smtp_port || ""} onChange={e => update("smtp_port", e.target.value)} placeholder="587" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Utilisateur</Label><Input value={settings.smtp_user || ""} onChange={e => update("smtp_user", e.target.value)} /></div>
                <div className="space-y-2"><Label>Mot de passe</Label><Input type="password" value={settings.smtp_pass || ""} onChange={e => update("smtp_pass", e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Expéditeur (From)</Label><Input value={settings.smtp_from || ""} onChange={e => update("smtp_from", e.target.value)} /></div>
              <Button onClick={() => saveAll(["smtp_host","smtp_port","smtp_user","smtp_pass","smtp_from"])} disabled={saving} className="bg-[#CC0000] hover:bg-[#AA0000] rounded-lg">
                <Save className="mr-2 size-4" /> Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai">
          <Card>
            <CardHeader><CardTitle>Assistant IA</CardTitle><CardDescription>Configuration du chatbot avec OpenRouter</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Clé API OpenRouter</Label>
                <div className="flex gap-2">
                  <Input 
                    type="password" 
                    value={settings.ai_api_key && !isEditingKey ? "••••••••••••••••••••••••••••••••••••••••••••••••" : (settings.ai_api_key || "")} 
                    disabled={!!settings.ai_api_key && !isEditingKey}
                    onChange={e => update("ai_api_key", e.target.value)} 
                    placeholder="sk-or-..." 
                    className={`flex-1 transition-all ${keyError ? 'border-red-500 ring-2 ring-red-500/20' : ''} ${validatingKey ? 'opacity-70' : ''}`}
                  />
                  {settings.ai_api_key && !isEditingKey ? (
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="shrink-0 h-9 w-9"
                      onClick={() => {
                        setIsEditingKey(true);
                        update("ai_api_key", "");
                        setKeyError(null);
                      }}
                      title="Supprimer et remplacer la clé"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
                {validatingKey && (
                  <p className="text-sm text-blue-600 animate-pulse font-medium"><Loader2 className="size-4 mr-1 text-blue-600 animate-spin inline" />Vérification de la clé en cours...</p>
                )}
                {keyError && !validatingKey && (
                  <p className="text-sm text-red-500 font-medium"><XCircle className="size-4 mr-1 inline" />{keyError}</p>
                )}
                {settings.ai_api_key && !isEditingKey && !validatingKey && !keyError && (
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium"><CheckCircle2 className="size-4 mr-1 inline" />Clé API configurée (Active)</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Modèle IA</Label>
                <Select disabled={!settings.ai_api_key || isEditingKey || aiModels.length === 0} value={settings.ai_model || "openrouter/auto"} onValueChange={(v) => v && update("ai_model", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={!settings.ai_api_key || isEditingKey ? "Configurez une clé API valide..." : "Sélectionner un modèle"}>
                      {!settings.ai_api_key || isEditingKey ? "Configurez une clé API valide..." : ((val: string) => aiModels.find(m => m.value === val)?.label || val)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {aiModels.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Instructions (prompt système)</Label>
                <Textarea value={settings.ai_instructions || ""} onChange={e => update("ai_instructions", e.target.value)} rows={4} disabled={!settings.ai_api_key || isEditingKey} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Message accueil (FR)</Label><Textarea value={settings.ai_welcome_fr || ""} onChange={e => update("ai_welcome_fr", e.target.value)} rows={2} disabled={!settings.ai_api_key || isEditingKey} /></div>
                <div className="space-y-2"><Label>Message accueil (AR)</Label><Textarea value={settings.ai_welcome_ar || ""} onChange={e => update("ai_welcome_ar", e.target.value)} rows={2} dir="rtl" disabled={!settings.ai_api_key || isEditingKey} /></div>
              </div>
              <Button onClick={saveAIConfig} disabled={saving} className="bg-[#CC0000] hover:bg-[#AA0000] rounded-lg">
                <Save className="mr-2 size-4" /> Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery">
          <GalleryTab settings={settings} saving={saving} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type GalleryImage = { url: string; alt: string };

function GalleryTab({ settings, saving }: { settings: Record<string, string>; saving: boolean }) {
  const [images, setImages] = useState<GalleryImage[]>(() => {
    try {
      return settings.gallery_images ? JSON.parse(settings.gallery_images) : [];
    } catch {
      return [];
    }
  });
  const [uploading, setUploading] = useState(false);

  const addImage = () => setImages(prev => [...prev, { url: "", alt: "" }]);

  const updateImage = (index: number, field: keyof GalleryImage, value: string) => {
    setImages(prev => prev.map((img, i) => i === index ? { ...img, [field]: value } : img));
  };

  const removeImage = (index: number) => setImages(prev => prev.filter((_, i) => i !== index));

  const handleUpload = async (index: number, file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      updateImage(index, "url", data.url);
      toast.success("Image téléchargée");
    } else {
      toast.error("Erreur lors du téléchargement");
    }
    setUploading(false);
  };

  const saveGallery = async () => {
    const value = JSON.stringify(images.filter(img => img.url));
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ key: "gallery_images", value }]),
    });
    toast.success("Galerie enregistrée");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Galerie d&apos;images</CardTitle>
        <CardDescription>Gérez les images de la galerie du site</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {images.map((img, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Input placeholder="URL de l'image" value={img.url} onChange={e => updateImage(idx, "url", e.target.value)} className="flex-1" />
                <Input placeholder="Description" value={img.alt} onChange={e => updateImage(idx, "alt", e.target.value)} className="flex-1" />
              </div>
              <div className="flex gap-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  <ImageIcon className="size-4" />
                  Télécharger
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) handleUpload(idx, file); }} disabled={uploading} />
                </label>
                <button onClick={() => removeImage(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" aria-label="Supprimer">
                  <Trash2 size={16} />
                </button>
              </div>
              {img.url && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                  <img src={img.url} alt={img.alt || ""} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        ))}
        <button onClick={addImage} className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary hover:text-primary transition-colors">
          <Plus size={18} /> Ajouter une image
        </button>
        <Button onClick={saveGallery} disabled={saving} className="bg-[#CC0000] hover:bg-[#AA0000] rounded-lg">
          <Save className="mr-2 size-4" /> Enregistrer
        </Button>
      </CardContent>
    </Card>
  );
}

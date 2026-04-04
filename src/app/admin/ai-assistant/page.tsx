"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Send, Loader2, Sparkles, Lightbulb, Wand2, Globe, DollarSign, FileText } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_ACTIONS = [
  { icon: Sparkles, label: "Idée de produit", prompt: "Suggère-moi 3 nouveaux produits pour le menu" },
  { icon: Wand2, label: "Générer description", prompt: "Génère une description appétissante pour le Plateau fruits de mer" },
  { icon: Globe, label: "Traduire", prompt: "Traduis 'Sandwich crevettes grillées avec sauce maison' en arabe" },
  { icon: DollarSign, label: "Conseil prix", prompt: "Quel prix suggères-tu pour un plat de homard à Casablanca ?" },
  { icon: FileText, label: "Créer produit", prompt: "Crée un produit: Salade César au poulet grillé, 55 DH" },
  { icon: Lightbulb, label: "Astuce menu", prompt: "Donne-moi une idée pour améliorer le menu d'été" },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (message?: string) => {
    const msg = message || input.trim();
    if (!msg || loading) return;

    setInput("");
    setError("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setError(data.error || "Erreur");
        setMessages(prev => [...prev, { role: "assistant", content: "Désolé, une erreur est survenue." }]);
      }
    } catch {
      setError("Erreur de connexion");
      setMessages(prev => [...prev, { role: "assistant", content: "Erreur de connexion." }]);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assistant IA</h1>
        <p className="text-muted-foreground">Votre copilote pour gérer le restaurant</p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Actions rapides</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => send(action.prompt)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 hover:border-[#CC0000]/30 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <action.icon className="size-4 text-[#CC0000]" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <Card className="min-h-[500px] flex flex-col">
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#CC0000] to-[#FF6600] flex items-center justify-center mx-auto mb-4">
                    <Bot className="size-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Bonjour ! Je suis votre assistant M9ila</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Je peux vous aider à créer des produits, générer des descriptions, traduire, suggérer des prix et bien plus.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {QUICK_ACTIONS.slice(0, 3).map((action) => (
                      <Badge
                        key={action.label}
                        variant="outline"
                        className="cursor-pointer hover:bg-[#CC0000]/5 hover:border-[#CC0000]/30 transition-colors"
                        onClick={() => send(action.prompt)}
                      >
                        <action.icon className="size-3 mr-1" />
                        {action.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CC0000] to-[#FF6600] flex items-center justify-center shrink-0 mt-1">
                    <Bot className="size-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-[#CC0000] text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-xs font-bold text-gray-600">
                      {m.content.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CC0000] to-[#FF6600] flex items-center justify-center shrink-0">
                  <Bot className="size-4 text-white" />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin text-gray-400" />
                  <span className="text-sm text-muted-foreground">Réflexion en cours...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div ref={messagesEnd} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="p-4 border-t flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Demandez-moi quelque chose..."
              maxLength={2000}
              className="flex-1"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#CC0000] hover:bg-[#AA0000] shrink-0"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

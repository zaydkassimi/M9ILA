"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";

type ChatBotProps = {
  lang: "fr" | "ar";
  welcomeMessage?: string;
};

export default function AIChatBot({ lang, welcomeMessage }: ChatBotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0 && welcomeMessage) {
      setMessages([{ role: "assistant", content: welcomeMessage }]);
    }
  }, [open, welcomeMessage, messages.length]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, lang }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || (lang === "ar" ? "عذراً، حدث خطأ" : "Désolé, une erreur.") }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: lang === "ar" ? "خطأ في الاتصال" : "Erreur de connexion." }]);
    }
    setLoading(false);
  };

  return (
    <>
      <motion.button onClick={() => setOpen(!open)} className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center hover:bg-red-700 transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="fixed bottom-20 sm:bottom-24 right-0 sm:right-6 z-50 w-full sm:w-[380px] h-[70vh] sm:h-[500px] max-h-[600px] sm:max-h-none sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden border bg-white" dir={lang === "ar" ? "rtl" : "ltr"}>
            <div className="bg-gradient-to-r from-primary to-flame-orange p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Bot className="w-5 h-5" /></div>
                <div>
                  <p className="font-bold">M9ila AI</p>
                  <p className="text-xs opacity-80">{lang === "ar" ? "مساعد ذكي" : "Assistant intelligent"}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1"><Bot className="w-4 h-4 text-primary" /></div>}
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.role === "user" ? "bg-primary text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"}`}>{m.content}</div>
                  {m.role === "user" && <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1"><User className="w-4 h-4 text-gray-600" /></div>}
                </div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-primary" /></div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-none"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>

            <form onSubmit={e => { e.preventDefault(); send(); }} className="p-3 border-t bg-white flex gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={lang === "ar" ? "اكتب رسالتك..." : "Tapez votre message..."} maxLength={2000} className="flex-1 px-3 py-2 rounded-xl border bg-gray-50 text-sm outline-none focus:border-primary" />
              <button type="submit" disabled={loading || !input.trim()} className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-50"><Send className="w-4 h-4" /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

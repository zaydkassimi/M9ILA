"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot, User, Trash2 } from "lucide-react";

type ChatBotProps = {
  lang: "fr" | "ar";
  welcomeMessage?: string;
  settings?: Record<string, string>;
};

type Message = { role: "user" | "assistant"; content: string; timestamp: string };

const STORAGE_KEY = "m9ila_chat_history";

export default function AIChatBot({ lang, welcomeMessage, settings }: ChatBotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [contactMode, setContactMode] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", phone: "", message: "" });
  const messagesEnd = useRef<HTMLDivElement>(null);

  const t = {
    fr: {
      quickReplies: [
        { label: "📋 Voir le menu", action: "menu" },
        { label: "🛒 Commander", action: "order" },
        { label: "✉️ Nous contacter", action: "contact" },
        { label: "📍 Adresse & Horaires", action: "info" },
      ],
      menuReply: "Voici notre menu ! Consultez notre carte complète ou commandez directement.",
      orderReply: "Pour passer commande, rendez-vous sur notre page de commande en ligne.",
      contactReply: "Quel est votre message ? Nous vous répondrons rapidement.",
      infoReply: "Nous sommes au 95 Bd Bir Anzarane, Maarif, Casablanca. Appelez-nous au 0520333555.",
      contactSuccess: "Message envoyé avec succès ! Nous vous contacterons bientôt.",
      contactNameLabel: "Votre nom",
      contactPhoneLabel: "Votre téléphone",
      submitContact: "Envoyer",
      orderBtn: "Commander maintenant",
      clearChat: "Effacer l'historique",
    },
    ar: {
      quickReplies: [
        { label: "📋 القائمة", action: "menu" },
        { label: "🛒 اطلب الآن", action: "order" },
        { label: "✉️ اتصل بنا", action: "contact" },
        { label: "📍 العنوان", action: "info" },
      ],
      menuReply: "إليكم قائمتنا! تصفحوا أطباقنا أو اطلبوا مباشرة.",
      orderReply: "لطلب الطعام، زوروا صفحة الطلبات.",
      contactReply: "ما هي رسالتك؟ سنرد عليكم قريباً.",
      infoReply: "نحن في 95 شارع بئرانزران، المعاريف، الدار البيضاء. اتصلوا بنا على 0520333555.",
      contactSuccess: "تم إرسال الرسالة بنجاح! سنتصل بكم قريباً.",
      contactNameLabel: "اسمك",
      contactPhoneLabel: "هاتفك",
      submitContact: "إرسال",
      orderBtn: "اطلب الآن",
      clearChat: "مسح المحادثة",
    },
  };

  const currentT = t[lang];

  const loadHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Message[];
        if (parsed.length > 0) {
          setMessages(parsed);
          setShowQuickReplies(false);
          return;
        }
      }
    } catch { /* ignore */ }
    if (welcomeMessage) {
      setMessages([{ role: "assistant", content: welcomeMessage, timestamp: new Date().toISOString() }]);
    }
  }, [welcomeMessage]);

  const saveHistory = useCallback((msgs: Message[]) => {
    try {
      const last50 = msgs.slice(-50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(last50));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      loadHistory();
    }
  }, [open, messages.length, loadHistory]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendToAI = useCallback(async (msg: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, lang }),
      });
      const data = await res.json();
      const reply = data.reply || (lang === "ar" ? "عذراً، حدث خطأ" : "Désolé, une erreur.");
      const assistantMsg: Message = { role: "assistant", content: reply, timestamp: new Date().toISOString() };
      setMessages(prev => {
        const updated = [...prev, assistantMsg];
        saveHistory(updated);
        return updated;
      });
    } catch {
      const errMsg: Message = { role: "assistant", content: lang === "ar" ? "خطأ في الاتصال" : "Erreur de connexion.", timestamp: new Date().toISOString() };
      setMessages(prev => {
        const updated = [...prev, errMsg];
        saveHistory(updated);
        return updated;
      });
    }
    setLoading(false);
  }, [lang, saveHistory]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setShowQuickReplies(false);
    const userMsg: Message = { role: "user", content: msg, timestamp: new Date().toISOString() };
    setMessages(prev => {
      const updated = [...prev, userMsg];
      saveHistory(updated);
      return updated;
    });
    await sendToAI(msg);
  };

  const handleQuickReply = async (action: string) => {
    setShowQuickReplies(false);

    if (action === "menu") {
      const userMsg: Message = { role: "user", content: lang === "ar" ? "أريد رؤية القائمة" : "Voir le menu", timestamp: new Date().toISOString() };
      const botMsg: Message = { role: "assistant", content: currentT.menuReply, timestamp: new Date().toISOString() };
      setMessages(prev => {
        const updated = [...prev, userMsg, botMsg];
        saveHistory(updated);
        return updated;
      });
    } else if (action === "order") {
      const userMsg: Message = { role: "user", content: lang === "ar" ? "أريد الطلب" : "Passer une commande", timestamp: new Date().toISOString() };
      const botMsg: Message = { role: "assistant", content: currentT.orderReply, timestamp: new Date().toISOString() };
      setMessages(prev => {
        const updated = [...prev, userMsg, botMsg];
        saveHistory(updated);
        return updated;
      });
    } else if (action === "contact") {
      if (settings?.chatbot_allow_contact === "true") {
        setContactMode(true);
        const userMsg: Message = { role: "user", content: lang === "ar" ? "أريد التواصل" : "Nous contacter", timestamp: new Date().toISOString() };
        const botMsg: Message = { role: "assistant", content: currentT.contactReply, timestamp: new Date().toISOString() };
        setMessages(prev => {
          const updated = [...prev, userMsg, botMsg];
          saveHistory(updated);
          return updated;
        });
      } else {
        const userMsg: Message = { role: "user", content: lang === "ar" ? "أريد التواصل" : "Nous contacter", timestamp: new Date().toISOString() };
        const botMsg: Message = { role: "assistant", content: lang === "ar" ? "عذراً، خدمة التواصل غير متاحة حالياً" : "Désolé, le service de contact n'est pas disponible actuellement.", timestamp: new Date().toISOString() };
        setMessages(prev => {
          const updated = [...prev, userMsg, botMsg];
          saveHistory(updated);
          return updated;
        });
      }
    } else if (action === "info") {
      const phone = settings?.phone || "0520333555";
      const address = lang === "ar"
        ? (settings?.address_ar || "95 شارع بئرانزران، المعاريف، الدار البيضاء")
        : (settings?.address_fr || "95 Bd Bir Anzarane, Maarif, Casablanca");
      const userMsg: Message = { role: "user", content: lang === "ar" ? "أين أنتم؟" : "Où êtes-vous ?", timestamp: new Date().toISOString() };
      const botMsg: Message = { role: "assistant", content: `📍 ${address}\n📞 ${phone}\n🕐 ${lang === "ar" ? "متاح يومياً" : "Disponible tous les jours"}`, timestamp: new Date().toISOString() };
      setMessages(prev => {
        const updated = [...prev, userMsg, botMsg];
        saveHistory(updated);
        return updated;
      });
    }
  };

  const submitContact = async () => {
    if (!contactForm.name || !contactForm.phone || !contactForm.message) return;
    setLoading(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactForm.name,
          email: "chatbot@m9ila.com",
          phone: contactForm.phone,
          subject: lang === "ar" ? "رسالة من الشات بوت" : "Message via Chatbot",
          message: contactForm.message,
        }),
      });
      if (res.ok) {
        const successMsg: Message = { role: "assistant", content: currentT.contactSuccess, timestamp: new Date().toISOString() };
        setMessages(prev => {
          const updated = [...prev, successMsg];
          saveHistory(updated);
          return updated;
        });
        setContactMode(false);
        setContactForm({ name: "", phone: "", message: "" });
      } else {
        const errMsg: Message = { role: "assistant", content: lang === "ar" ? "خطأ في الإرسال" : "Erreur lors de l'envoi.", timestamp: new Date().toISOString() };
        setMessages(prev => {
          const updated = [...prev, errMsg];
          saveHistory(updated);
          return updated;
        });
      }
    } catch {
      const errMsg: Message = { role: "assistant", content: lang === "ar" ? "خطأ في الاتصال" : "Erreur de connexion.", timestamp: new Date().toISOString() };
      setMessages(prev => {
        const updated = [...prev, errMsg];
        saveHistory(updated);
        return updated;
      });
    }
    setLoading(false);
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages(welcomeMessage ? [{ role: "assistant", content: welcomeMessage, timestamp: new Date().toISOString() }] : []);
    setShowQuickReplies(true);
    setContactMode(false);
  };

  const handleOpen = () => {
    setOpen(true);
    if (messages.length === 0) {
      loadHistory();
    }
  };

  return (
    <>
      <motion.button
        onClick={() => open ? setOpen(false) : handleOpen()}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center hover:bg-red-700 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 sm:bottom-24 right-0 sm:right-6 z-50 w-full sm:w-[380px] h-[70vh] sm:h-[500px] max-h-[600px] sm:max-h-none sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden border bg-white"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-flame-orange p-4 text-white shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Bot className="w-5 h-5" /></div>
                  <div>
                    <p className="font-bold">M9ila AI</p>
                    <p className="text-xs opacity-80">{lang === "ar" ? "مساعد ذكي" : "Assistant intelligent"}</p>
                  </div>
                </div>
                {messages.length > 1 && (
                  <button
                    onClick={clearHistory}
                    className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                    title={currentT.clearChat}
                    aria-label={currentT.clearChat}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Messages — scrollable area only inside this div */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}>
                    {m.content}
                  </div>
                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}

              {/* Quick Replies */}
              {showQuickReplies && messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentT.quickReplies.map((qr) => (
                    <button
                      key={qr.action}
                      onClick={() => handleQuickReply(qr.action)}
                      className="px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium hover:bg-primary/10 transition-colors"
                    >
                      {qr.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Contact Form */}
              {contactMode && (
                <div className="bg-gray-50 rounded-xl p-3 space-y-2 mt-2">
                  <input
                    type="text"
                    placeholder={currentT.contactNameLabel}
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-white text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="tel"
                    placeholder={currentT.contactPhoneLabel}
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-white text-sm outline-none focus:border-primary"
                  />
                  <textarea
                    placeholder={lang === "ar" ? "رسالتك..." : "Votre message..."}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border bg-white text-sm outline-none focus:border-primary resize-none"
                  />
                  <button
                    onClick={submitContact}
                    disabled={loading || !contactForm.name || !contactForm.phone || !contactForm.message}
                    className="w-full py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : currentT.submitContact}
                  </button>
                </div>
              )}

              {/* Order CTA */}
              {messages.some((m) => m.content === currentT.orderReply) && (
                <a
                  href="/order"
                  className="block w-full py-3 bg-gradient-to-r from-primary to-flame-orange text-white text-center text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  {currentT.orderBtn}
                </a>
              )}

              {loading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-none">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>

            {/* Input */}
            {!contactMode && (
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-3 border-t bg-white flex gap-2 shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={lang === "ar" ? "اكتب رسالتك..." : "Tapez votre message..."}
                  maxLength={2000}
                  className="flex-1 px-3 py-2 rounded-xl border bg-gray-50 text-sm outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

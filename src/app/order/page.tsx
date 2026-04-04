"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ShoppingCart, Plus, Minus, Trash2, Loader2, CheckCircle, ArrowLeft, Phone } from "lucide-react";

type Product = {
  id: string;
  nameFr: string;
  nameAr: string;
  descriptionFr: string;
  descriptionAr: string;
  price: number;
  image: string;
  emoji: string;
  categoryId: string;
  isAvailable: boolean;
  category: { nameFr: string; nameAr: string; slug: string };
};

type Category = {
  id: string;
  slug: string;
  nameFr: string;
  nameAr: string;
  isActive: boolean;
};

type CartItem = Product & { quantity: number };

export default function OrderPage() {
  const [lang, setLang] = useState<"fr" | "ar">("fr");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [form, setForm] = useState({ customerName: "", customerPhone: "", customerAddress: "", notes: "" });
  const [error, setError] = useState("");

  const t = {
    fr: {
      title: "Commander en ligne",
      subtitle: "Choisissez vos plats et passez votre commande",
      addToCart: "Ajouter",
      cart: "Panier",
      emptyCart: "Votre panier est vide",
      total: "Total",
      checkout: "Passer la commande",
      name: "Nom complet",
      phone: "Téléphone",
      address: "Adresse de livraison",
      notes: "Notes (optionnel)",
      submit: "Confirmer la commande",
      success: "Commande envoyée avec succès ! Nous vous contacterons bientôt.",
      backToMenu: "Retour au menu",
      orderingDisabled: "Les commandes en ligne ne sont pas disponibles actuellement.",
      callUs: "Appelez-nous pour commander",
      categories: "Catégories",
      loading: "Chargement du menu...",
      remove: "Supprimer",
      qty: "Qté",
    },
    ar: {
      title: "اطلب عبر الإنترنت",
      subtitle: "اختر أطباقك وقدم طلبك",
      addToCart: "أضف",
      cart: "السلة",
      emptyCart: "سلتك فارغة",
      total: "المجموع",
      checkout: "تقديم الطلب",
      name: "الاسم الكامل",
      phone: "الهاتف",
      address: "عنوان التوصيل",
      notes: "ملاحظات (اختياري)",
      submit: "تأكيد الطلب",
      success: "تم إرسال الطلب بنجاح! سنتصل بك قريباً.",
      backToMenu: "العودة للقائمة",
      orderingDisabled: "الطلبات عبر الإنترنت غير متاحة حالياً.",
      callUs: "اتصل بنا للطلب",
      categories: "الفئات",
      loading: "جاري تحميل القائمة...",
      remove: "حذف",
      qty: "الكمية",
    },
  };

  const currentT = t[lang];

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        if (data.language_mode === "ar") setLang("ar");
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ])
      .then(([cats, prods]) => {
        const activeCats = cats.filter((c: Category) => c.isActive);
        setCategories(activeCats);
        setProducts(prods.filter((p: Product) => p.isAvailable));
        if (activeCats.length > 0) setActiveCategory(activeCats[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const items = JSON.stringify(
      cart.map((item) => ({
        id: item.id,
        name: lang === "ar" ? item.nameAr : item.nameFr,
        quantity: item.quantity,
        price: item.price,
      }))
    );

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerAddress: form.customerAddress,
        items,
        totalAmount: cartTotal,
        notes: form.notes,
      }),
    });

    if (res.ok) {
      setOrderSuccess(true);
      setCart([]);
      setCheckoutOpen(false);
      setForm({ customerName: "", customerPhone: "", customerAddress: "", notes: "" });
    } else {
      const data = await res.json();
      setError(data.error || "Erreur");
    }
    setSubmitting(false);
  };

  const currentProducts = products.filter((p) => p.categoryId === activeCategory);
  const phone = settings.phone || "0520333555";
  const orderingEnabled =
    settings.online_ordering_enabled === "true" || settings.cod_enabled === "true";

  if (!orderingEnabled) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-3xl font-bold text-dark mb-4">{currentT.orderingDisabled}</h1>
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-full shadow-xl hover:bg-primary/90 transition-colors"
          >
            <Phone size={20} />
            {currentT.callUs}: {phone}
          </a>
        </div>
      </main>
    );
  }

  if (orderSuccess) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-4"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-dark mb-4">{currentT.success}</h1>
          <button
            onClick={() => setOrderSuccess(false)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-full shadow-xl hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft size={20} />
            {currentT.backToMenu}
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-dark hover:text-primary transition-colors">
              <ArrowLeft size={24} />
            </a>
            <div>
              <h1 className={`text-xl font-bold text-dark ${lang === "ar" ? "font-tajawal" : "font-montserrat"}`}>
                {currentT.title}
              </h1>
              <p className="text-sm text-gray-500">{currentT.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
              className="px-3 py-1 rounded-full border-2 border-primary text-primary font-bold text-sm hover:bg-primary hover:text-white transition-colors"
            >
              {lang === "fr" ? "AR" : "FR"}
            </button>
            <button
              onClick={() => setCartOpen(!cartOpen)}
              className="relative p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
              aria-label={currentT.cart}
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-flame-yellow text-dark text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <p className="text-center text-xl text-gray-500 py-12">{currentT.loading}</p>
        ) : (
          <>
            {/* Category Tabs */}
            <div className="flex overflow-x-auto gap-3 mb-8 pb-4 px-1 snap-x snap-mandatory md:justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`snap-start whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm sm:text-base transition-all duration-300 ${
                    activeCategory === category.id
                      ? "bg-primary text-white shadow-xl shadow-primary/30"
                      : "bg-white text-dark hover:bg-flame-yellow/20 hover:text-primary shadow-sm"
                  } ${lang === "ar" ? "font-tajawal" : "font-montserrat"}`}
                >
                  {lang === "ar" ? category.nameAr : category.nameFr}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {currentProducts.map((product) => {
                  const inCart = cart.find((item) => item.id === product.id);
                  return (
                    <motion.div
                      key={product.id}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden group"
                    >
                      <div className="relative h-36 w-full bg-gray-100 overflow-hidden">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={lang === "ar" ? product.nameAr : product.nameFr}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : product.emoji ? (
                          <div className="w-full h-full bg-gradient-to-br from-brand-bg to-flame-orange flex items-center justify-center text-5xl">
                            {product.emoji}
                          </div>
                        ) : null}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full font-bold text-primary text-sm shadow-sm">
                          {product.price} DH
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className={`font-bold text-dark text-lg ${lang === "ar" ? "font-tajawal" : "font-montserrat"}`}>
                          {lang === "ar" ? product.nameAr : product.nameFr}
                        </h3>
                        {(lang === "ar" ? product.descriptionAr : product.descriptionFr) && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {lang === "ar" ? product.descriptionAr : product.descriptionFr}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-2">
                          {inCart ? (
                            <div className="flex items-center gap-2 w-full">
                              <button
                                onClick={() => updateQuantity(product.id, -1)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="font-bold text-dark flex-1 text-center">
                                {inCart.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(product.id, 1)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(product)}
                              className="w-full py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors text-sm"
                            >
                              {currentT.addToCart}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ x: lang === "ar" ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: lang === "ar" ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className={`fixed top-0 ${lang === "ar" ? "left-0" : "right-0"} h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col`}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-dark flex items-center gap-2">
                  <ShoppingCart size={20} />
                  {currentT.cart} ({cartCount})
                </h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close cart"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">{currentT.emptyCart}</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                        <div className="flex-1">
                          <p className="font-bold text-dark text-sm">
                            {lang === "ar" ? item.nameAr : item.nameFr}
                          </p>
                          <p className="text-primary font-bold text-sm">{item.price} DH</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-full bg-white border flex items-center justify-center hover:bg-gray-100"
                            aria-label="Decrease"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-full bg-white border flex items-center justify-center hover:bg-gray-100"
                            aria-label="Increase"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          aria-label={currentT.remove}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 border-t bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-dark">{currentT.total}</span>
                    <span className="text-2xl font-black text-primary">{cartTotal} DH</span>
                  </div>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      setCheckoutOpen(true);
                    }}
                    className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    {currentT.checkout}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckoutOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg bg-white rounded-2xl shadow-2xl z-50 flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-dark">{currentT.checkout}</h2>
                <button
                  onClick={() => setCheckoutOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentT.name} *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentT.phone} *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={20}
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentT.address} *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={300}
                    value={form.customerAddress}
                    onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentT.notes}
                  </label>
                  <textarea
                    maxLength={500}
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-dark mb-2">{currentT.total}: {cartTotal} DH</h3>
                  <div className="space-y-1">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-gray-600">
                        <span>
                          {lang === "ar" ? item.nameAr : item.nameFr} × {item.quantity}
                        </span>
                        <span>{item.price * item.quantity} DH</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle size={20} />
                  )}
                  {currentT.submit}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

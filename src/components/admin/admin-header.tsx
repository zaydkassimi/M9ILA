"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";

const routeLabels: Record<string, string> = {
  admin: "Tableau de bord",
  products: "Produits",
  categories: "Catégories",
  orders: "Commandes",
  contacts: "Contacts",
  settings: "Paramètres",
  admins: "Administrateurs",
};

export function AdminHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <nav className="flex items-center gap-1 text-sm">
        {segments.map((seg, i) => (
          <span key={seg} className="flex items-center gap-1">
            {i > 0 && <span className="text-muted-foreground">/</span>}
            <span className={i === segments.length - 1 ? "font-medium" : "text-muted-foreground"}>
              {routeLabels[seg] || seg}
            </span>
          </span>
        ))}
      </nav>
    </header>
  );
}

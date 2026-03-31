"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

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
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-sm px-4 sticky top-0 z-10">
      <SidebarTrigger className="-ml-1 size-8" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <nav className="flex items-center gap-1 text-sm">
        {segments.map((seg, i) => (
          <span key={seg} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground" />}
            <span className={cn(
              "transition-colors",
              i === segments.length - 1
                ? "font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}>
              {routeLabels[seg] || seg}
            </span>
          </span>
        ))}
      </nav>
    </header>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderOpen,
  Package,
  Mail,
  Settings,
  Users,
  Flame,
  ChevronsUpDown,
  LogOut,
} from "lucide-react";

const navItems = [
  { title: "Tableau de bord", url: "/admin", icon: LayoutDashboard },
  { title: "Produits", url: "/admin/products", icon: UtensilsCrossed },
  { title: "Catégories", url: "/admin/categories", icon: FolderOpen },
  { title: "Commandes", url: "/admin/orders", icon: Package },
  { title: "Contacts", url: "/admin/contacts", icon: Mail },
  { title: "Paramètres", url: "/admin/settings", icon: Settings },
  { title: "Administrateurs", url: "/admin/admins", icon: Users },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isMobile, state } = useSidebar();
  const user = session?.user as any;
  const collapsed = state === "collapsed";

  const initials = user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "A";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b px-2 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/admin">
              <SidebarMenuButton size="lg" tooltip="M9ila Admin">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#CC0000] to-[#FF6600] text-white shadow-sm">
                  <Flame className="size-4" />
                </div>
                {!collapsed && (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold">M9ila</span>
                    <span className="truncate text-xs text-muted-foreground">Administration</span>
                  </div>
                )}
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = pathname === item.url || (item.url !== "/admin" && pathname.startsWith(item.url));
            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url}>
                  <SidebarMenuButton isActive={isActive} tooltip={item.title}>
                    <item.icon className="size-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.title}</span>}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t px-2 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="flex w-full items-center gap-2.5 rounded-md p-2 text-left text-sm transition-colors hover:bg-sidebar-accent">
                    <Avatar className="size-7 shrink-0 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-[#CC0000] to-[#FF6600] text-white text-[10px] font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {!collapsed && (
                      <>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-medium">{user?.name || "Admin"}</span>
                          <span className="truncate text-xs text-muted-foreground">{user?.email || ""}</span>
                        </div>
                        <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                      </>
                    )}
                  </button>
                }
              />
              <DropdownMenuContent
                className="min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-[#CC0000] to-[#FF6600] text-white text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user?.name || "Admin"}</span>
                      <span className="truncate text-xs">{user?.email || ""}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                  <LogOut className="mr-2 size-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

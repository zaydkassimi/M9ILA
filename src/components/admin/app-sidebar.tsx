"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
  Bot,
  User,
  UserCog,
} from "lucide-react";

const navItems = [
  { title: "Tableau de bord", url: "/admin", icon: LayoutDashboard },
  { title: "Produits", url: "/admin/products", icon: UtensilsCrossed },
  { title: "Catégories", url: "/admin/categories", icon: FolderOpen },
  { title: "Commandes", url: "/admin/orders", icon: Package },
  { title: "Contacts", url: "/admin/contacts", icon: Mail },
  { title: "Assistant IA", url: "/admin/ai-assistant", icon: Bot },
  { title: "Paramètres", url: "/admin/settings", icon: Settings },
  { title: "Administrateurs", url: "/admin/admins", icon: Users },
  { title: "Mon profil", url: "/admin/profile", icon: UserCog },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isMobile, state } = useSidebar();
  const user = session?.user as any;
  const collapsed = state === "collapsed";
  const isSuperadmin = user?.role === "superadmin";

  const initials = user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "A";

  const visibleNavItems = navItems.filter((item) => {
    if (item.url === "/admin/settings" && !isSuperadmin && user?.canAccessSettings !== true) return false;
    if (item.url === "/admin/admins" && !isSuperadmin) return false;
    return true;
  });

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
          {visibleNavItems.map((item) => {
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
                  <button className="flex w-full items-center gap-2.5 rounded-md p-2 text-left text-sm transition-colors hover:bg-sidebar-accent cursor-pointer">
                    <Avatar className="size-7 shrink-0 rounded-lg">
                      <AvatarImage src={user?.avatarUrl || ""} alt={user?.name || "Admin"} />
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
                className="w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="flex items-center gap-2 p-3">
                  <Avatar className="size-9 rounded-lg">
                    <AvatarImage src={user?.avatarUrl || ""} alt={user?.name || "Admin"} />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-[#CC0000] to-[#FF6600] text-white text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.name || "Admin"}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email || ""}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => window.location.href = "/admin/profile"} className="cursor-pointer">
                    <User className="mr-2 size-4" />
                    Mon profil
                  </DropdownMenuItem>
                  {isSuperadmin && (
                    <DropdownMenuItem onClick={() => window.location.href = "/admin/settings"} className="cursor-pointer">
                      <Settings className="mr-2 size-4" />
                      Paramètres
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="text-destructive focus:text-destructive cursor-pointer">
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

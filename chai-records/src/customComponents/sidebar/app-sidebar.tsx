"use client";

import Link from "next/link";
import { useSession } from "@/providers/sessionProvider";
import { useThemeUtils } from "@/utils/theme/useThemeUtils";
import { Home, User, Users, LogOut, Moon, Sun, LucideIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type LinkItem = { title: string; href: string; icon: LucideIcon };
type ActionItem = {
  title: string;
  onClick: () => void;
  icon: LucideIcon ;
};
type Item = LinkItem | ActionItem;

export function AppSidebar({
  requireProfile = true,
}: {
  requireProfile?: boolean;
}) {
  const { user, profile, sessionReady, signOut } = useSession();
  const { isDark, toggleTheme, mounted } = useThemeUtils();
  const { isMobile, setOpenMobile } = useSidebar();

  if (!sessionReady || !user) return null;
  if (requireProfile && (profile === null)) return null;

  const items: Item[] = [
    { title: "Home", href: "/home", icon: Home },
    { title: "Profile", href: "/profile", icon: User },
    { title: 'Find Friends', href: '/users', icon: Users }, 
    {
      title: isDark ? "Light mode" : "Dark mode",
      onClick: toggleTheme,
      icon: isDark ? Sun : Moon,
    },
    { title: "Sign out", onClick: () => void signOut(), icon: LogOut },
  ];

  const closeIfMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {"href" in item ? (
                    <SidebarMenuButton asChild>
                       <Link
                        href={item.href}
                        onClick={closeIfMobile}
                      >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton asChild>
                      <button
                        type="button"
                        onClick={item.onClick}
                        className="w-full text-left"
                        disabled={!mounted}
                      >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

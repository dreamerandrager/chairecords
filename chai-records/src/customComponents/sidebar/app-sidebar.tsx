"use client";

import Link from "next/link";
import { useSession } from "@/providers/sessionProvider";
import { useThemeUtils } from "@/utils/theme/useThemeUtils";
import { Home, User, LogOut, Moon, Sun } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type LinkItem = { title: string; href: string; icon: React.ComponentType<any> };
type ActionItem = {
  title: string;
  onClick: () => void;
  icon: React.ComponentType<any>;
};
type Item = LinkItem | ActionItem;

export function AppSidebar({
  requireProfile = true,
}: {
  requireProfile?: boolean;
}) {
  const { user, profile, sessionReady, profileReady, signOut } = useSession();
  const { isDark, toggleTheme, mounted } = useThemeUtils();

  // Hide until authed (and profile if required)
  if (!sessionReady || !user) return null;
  if (requireProfile && (profile === null)) return null;

  const items: Item[] = [
    { title: "Home", href: "/home", icon: Home },
    { title: "Profile", href: "/profile", icon: User },
    {
      title: isDark ? "Light mode" : "Dark mode",
      onClick: toggleTheme,
      icon: isDark ? Sun : Moon,
    },
    { title: "Sign out", onClick: () => void signOut(), icon: LogOut },
  ];

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
                      <Link href={item.href}>
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

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Gamepad2, LayoutDashboard, List, LogIn, Trophy, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";

import { ThemeToggleButton } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/animate-ui/components/radix/sidebar";

const primaryNavigation = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Tournaments", href: "/tournaments", icon: Trophy },
  { label: "Games", href: "/games", icon: Gamepad2 },
  { label: "Rankings", href: "/rankings", icon: List },
];

const accountNavigation = [
  { label: "Profile", href: "/profile", icon: UserRound },
  { label: "Join Arena", href: "/join", icon: LogIn },
];

const adminNavigation = [
  { label: "Tournaments", href: "/console/tournaments", icon: Trophy },
  { label: "Games", href: "/console/games", icon: Gamepad2 },
];

type NavigationItem = (typeof primaryNavigation)[number];

function NavigationGroup({ items, pathname }: { items: NavigationItem[]; pathname: string }) {
  return (
    <SidebarMenu className="gap-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.label}
              className={cn(
                "h-9 px-2.5 text-sm font-medium transition-colors group-data-[collapsible=icon]:justify-center",
                isActive
                  ? "bg-sidebar-accent font-semibold text-sidebar-foreground"
                  : "text-sidebar-foreground/75 hover:text-sidebar-foreground"
              )}
            >
              <Link href={item.href} aria-current={isActive ? "page" : undefined}>
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-sidebar-foreground/60"
                  )}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto size-1.5 rounded-full bg-primary group-data-[collapsible=icon]:hidden" />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function ArenaSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const trpc = useTRPC();
  const {
    data: profile,
    isFetching: isProfileFetching,
    isSuccess: hasProfile,
  } = useQuery(
    trpc.profile.me.queryOptions(undefined, { refetchOnMount: "always" })
  );

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="flex h-14 flex-row items-center border-b border-sidebar-border px-4 py-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:justify-center"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary font-display text-sm font-black text-sidebar-primary-foreground shadow-xs">
            A
          </span>

          <span className="font-display text-lg font-black tracking-[-0.04em] text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            ARENA<span className="text-sidebar-primary">.</span>
          </span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/50">
            Compete
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationGroup items={primaryNavigation} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/50">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationGroup items={accountNavigation} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>
        {hasProfile && !isProfileFetching && profile?.role === "admin" && (
          <SidebarGroup className="mt-2">
            <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/50">
              Admin Panel
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavigationGroup items={adminNavigation} pathname={pathname} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between rounded-md border border-sidebar-border bg-sidebar-accent/40 p-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-sidebar-foreground/50">
              Arena MVP
            </p>
            <p className="mt-0.5 truncate font-body text-xs text-sidebar-foreground/80">
              Free entry, always.
            </p>
          </div>
          <ThemeToggleButton
            variant="circle"
            start="top-right"
            className="!size-8 !shrink-0 !rounded-md !border-sidebar-border !bg-transparent !p-1 !shadow-none hover:!bg-sidebar-accent"
          />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

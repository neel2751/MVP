"use client";

import * as React from "react";
import {
  Bell,
  BookOpen,
  Bot,
  Command,
  Home,
  LifeBuoy,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { useSession } from "next-auth/react";
import { useFetchQuery } from "@/hooks/use-query";
import { getPermissions } from "@/lib/permissions";

const sidebarItems = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
    permission: "view_dashboard",
    isActive: true,
  },
  {
    label: "Plan & Billing",
    icon: BookOpen,
    href: "/superadmin/plan",
    permission: "view_billing",
    // items: [
    //   { label: "Plan", href: "/plan-billing#plan", permission: "view_billing" },
    //   {
    //     label: "Billing",
    //     href: "/plan-billing#billing",
    //     permission: "view_billing",
    //   },
    //   {
    //     label: "Usage",
    //     href: "/plan-billing#usage",
    //     permission: "view_billing",
    //   },
    // ],
  },
  {
    label: "Notifications",
    icon: Bell,
    href: "/notifications",
    permission: "view_notifications",
  },
  {
    label: "Companies",
    icon: Bot,
    href: "/companies",
    permission: "view_companies",
  },
  { label: "Users", icon: LifeBuoy, href: "/users", permission: "view_users" },
  {
    label: "Roles",
    icon: SquareTerminal,
    href: "/roles",
    permission: "view_roles",
  },
  {
    label: "Permissions",
    icon: Settings2,
    href: "/permissions",
    permission: "view_permissions",
  },
  {
    label: "Invoices",
    icon: Send,
    href: "/invoices",
    permission: "view_invoice",
  },
  {
    label: "Settings",
    icon: Settings2,
    href: "/settings",
    permission: "manage_settings",
  },
];

export function AppSidebar({ ...props }) {
  const { data: session } = useSession();
  const { data } = useFetchQuery({
    fetchFn: getPermissions,
    params: {
      userId: session?.user?.id,
      companyId: null,
    },
    queryKey: ["permissions", session?.user?.id, null],
    enabled: !!session,
  });
  const permissions = data || [];
  const filteredSidebarItems = sidebarItems.filter(
    (item) => permissions.includes(item.permission) || permissions.includes("*")
  );

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredSidebarItems} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session?.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

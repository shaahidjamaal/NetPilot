"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  LogOut,
  Network,
  Settings,
  Wifi,
  FileClock,
  BarChart2,
  FileCode,
  Ticket,
  UserPlus,
  ShoppingCart,
  Boxes,
  MapPin,
  Package,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/customers", icon: Users, label: "Customers" },
    { href: "/online-subscribers", icon: Wifi, label: "Online Subscribers" },
    { href: "/access-request-log", icon: FileClock, label: "Access Request Log" },
    { href: "/reports", icon: BarChart2, label: "Reports" },
    { href: "/nat-logs", icon: FileCode, label: "NAT Logs" },
    { href: "/tickets", icon: Ticket, label: "Tickets" },
    { href: "/leads", icon: UserPlus, label: "Leads" },
    { href: "/package-sales", icon: ShoppingCart, label: "Package Sales" },
    { href: "/billing", icon: FileText, label: "Invoices" },
    { href: "/payments", icon: CreditCard, label: "Payments" },
    { href: "/inventory", icon: Boxes, label: "Inventory" },
    { href: "/zones", icon: MapPin, label: "Zones" },
    { href: "/plans", icon: Package, label: "Packages" },
];

const bottomNavItems = [
    { href: "/admin", icon: Shield, label: "Admin" },
    { href: "/settings", icon: Settings, label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <SidebarProvider>
      <Sidebar
        collapsible="icon"
        className="border-sidebar-border"
        variant="sidebar"
      >
        <SidebarHeader className="p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
          >
            <Network className="size-7 text-primary" />
            <span className="font-bold text-lg text-primary-foreground group-data-[collapsible=icon]:hidden">
              NetPilot
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{
                    children: item.label,
                  }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            {bottomNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{
                    children: item.label,
                  }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{ children: "Log Out" }} onClick={logout}>
                <LogOut />
                <span>Log Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-card px-4 lg:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <ThemeToggle />
            </div>
          <Avatar>
            <AvatarImage src="https://placehold.co/40x40" alt="@user" data-ai-hint="avatar" />
            <AvatarFallback>{user?.email.substring(0, 2).toUpperCase() || 'NP'}</AvatarFallback>
          </Avatar>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

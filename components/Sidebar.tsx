"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Building2,
  Users,
  Wallet,
  FileText,
  MapPin,
  Bell,
  Folder,
  UserCog,
  UserCircle2,
  ShieldQuestion,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type MenuItem = {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
};

type SessionUser = {
  empID: string;
  username: string;
  name: string;
  email: string;
  role: string;
  role_id: string | number;
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Property Registry", path: "/property", icon: Building2, },
  { name: "Taxpayer Records", path: "/taxpayers", icon: Users },
  { name: "Assessment & Billing", path: "/assessment", icon: Wallet, },
  { name: "Payments & OR Monitoring", path: "/payments", icon: FileText },
  { name: "Barangay Performance", path: "/barangay", icon: MapPin },
  { name: "Delinquencies & Notices", path: "/delinquencies", icon: Bell },
  { name: "Document Tracking", path: "/document", icon: Folder },
  { name: "User & Role Management", path: "/user", icon: UserCog },
];

export default function AppSidebar({
  sessionUser,
  permissions = {},
}: {
  sessionUser: SessionUser | null;
  permissions?: Record<string, any>;
}) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const routeToModule: Record<string, { id: string; label: string }> = {
    "/property": { id: "property", label: "Property Registry" },
    "/taxpayers": { id: "taxpayers", label: "Taxpayer Records" },
    "/assessment": { id: "assessment", label: "Assessment & Billing" },
    "/payments": { id: "payments", label: "Payments & OR Monitoring" },
    "/barangay": { id: "barangay", label: "Barangay Performance" },
    "/delinquencies": { id: "delinquencies", label: "Delinquencies & Notices" },
    "/document": { id: "document", label: "Document Tracking" },
    "/user": { id: "user", label: "User & Role Management" },
  };

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.path === "/dashboard") return true;
    if (Number(sessionUser?.role_id) === 1) return true;
    const mod = routeToModule[item.path];
    if (!mod) return false;
    return permissions[mod.id]?.can_view || permissions[mod.label]?.can_view;
  });

  return (
    <Sidebar collapsible="icon" className="font-inter border-r border-gray-200 bg-white">
      {/* Logo header */}
      <SidebarHeader className="border-b border-gray-200 px-2 py-3">
        <div className="flex w-full items-center overflow-hidden">
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src="/img/sta.rita_logo.png"
              alt="Sta. Rita Logo"
              fill
              className="object-contain"
            />
          </div>
          <div
            className={cn(
              "overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-300 ease-in-out",
              isCollapsed ? "ml-0 max-w-0 opacity-0" : "ml-3 max-w-56 opacity-100"
            )}
          >
            <h1 className="font-lexend text-lg font-bold text-[#666D7D]">
              Sta. Rita, Samar
            </h1>
            <p className="font-lexend text-xs text-gray-600">
              Real Property Tax Monitoring
            </p>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-3 py-2">
        <SidebarMenu>
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.path || pathname.startsWith(`${item.path}/`)}
                  tooltip={item.name}
                  className="h-auto px-3 text-[#A0A5B2] hover:font-semibold data-[active=true]:bg-blue-50! data-[active=true]:text-blue-600!"
                >
                  <Link href={item.path}>
                    <Icon className="shrink-0 text-[#00154A]" />
                    <div
                      className={cn(
                        "overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-300 ease-in-out",
                        isCollapsed ? "ml-0 max-w-0 opacity-0" : "ml-1 max-w-56 opacity-100"
                      )}
                    >
                      <span className="text-sm font-medium">{item.name}</span>
                      {item.subtitle && (
                        <span className="text-xs text-gray-500">{item.subtitle}</span>
                      )}
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          {/* Request Permissions — non-Super Admin only */}
          {sessionUser && Number(sessionUser.role_id) !== 1 && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/request_permission" || pathname.startsWith("/request_permission/")}
                tooltip="Request Permissions"
                className="h-auto px-3 text-[#A0A5B2] hover:font-semibold data-[active=true]:bg-blue-50! data-[active=true]:text-blue-600!"
              >
                <Link href="/request_permission">
                  <ShieldQuestion className="shrink-0 text-blue-500" />
                  <div
                    className={cn(
                      "overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-300 ease-in-out",
                      isCollapsed ? "ml-0 max-w-0 opacity-0" : "ml-1 max-w-56 opacity-100"
                    )}
                  >
                    <span className="text-sm font-medium">Request Permissions</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="My Profile"
              className="h-auto text-[#A0A5B2] hover:font-semibold"
            >
              <Link href="/user/profile" className="flex w-full items-center overflow-hidden">
                <UserCircle2 className="size-8 shrink-0 text-[#00154A]" />
                <div
                  className={cn(
                    "overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-300 ease-in-out",
                    isCollapsed ? "ml-0 max-w-0 opacity-0" : "ml-3 max-w-56 opacity-100"
                  )}
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium text-slate-700">
                      {sessionUser?.name || sessionUser?.username || "Guest User"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {sessionUser?.email || sessionUser?.role || "No active session"}
                    </span>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

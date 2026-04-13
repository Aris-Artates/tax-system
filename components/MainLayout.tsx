// components/MainLayout.tsx
"use client";

import { useSidebar, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/Sidebar";
import HeaderComponent from "@/components/HeaderComponent";
import TopLoader from "@/components/TopLoader";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user: sessionUser, permissions } = useAuth();

  return (
    <SidebarProvider className="h-screen overflow-hidden print:h-auto print:overflow-visible">
      <TopLoader />
      <div className="print:hidden">
        <AppSidebar sessionUser={sessionUser} permissions={permissions} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden print:h-auto print:overflow-visible relative">
        <div className="print:hidden">
          <HeaderComponent sessionUser={sessionUser} />
        </div>
        {/* Main content scrolls */}
        <main className="flex-1 overflow-y-auto p-4.5 bg-[#f0f4f7] print:bg-white print:p-0 print:overflow-visible relative">
          <div 
            className="h-full w-full animate-in fade-in slide-in-from-bottom-1 duration-300 will-change-transform will-change-opacity"
          >
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

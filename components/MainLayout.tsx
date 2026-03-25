// components/MainLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/Sidebar";
import HeaderComponent from "@/components/HeaderComponent";

type SessionUser = {
  empID: string;
  username: string;
  name: string;
  email: string;
  role: string;
  role_id: string | number;
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSessionUser = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (isMounted) {
          setSessionUser(data.user ?? null);
        }
      } catch {
        if (isMounted) {
          setSessionUser(null);
        }
      }
    };

    loadSessionUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <AppSidebar sessionUser={sessionUser} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <HeaderComponent sessionUser={sessionUser} />
        {/* Main content scrolls */}
        <main className="flex-1 overflow-y-auto p-4.5 bg-[#f0f4f7]">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

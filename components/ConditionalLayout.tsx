"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, permissions, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // 1. Session check
    if (!user && pathname !== "/") {
      router.push("/");
      return;
    }

    if (user && pathname === "/") {
      router.push("/dashboard");
      return;
    }

    // 2. Permission check
    if (
      user &&
      pathname !== "/" &&
      pathname !== "/dashboard" &&
      !pathname.startsWith("/user/profile")
    ) {
      const roleId = Number(user.role_id);
      if (roleId !== 1) {
        // Super Admin bypass
        const routeToModule: Record<string, string> = {
          "/property": "Property Registry",
          "/taxpayers": "Taxpayer Records",
          "/assessment": "Assessment & Billing",
          "/payments": "Payments & OR Monitoring",
          "/barangay": "Barangay Performance",
          "/delinquencies": "Delinquencies & Notices",
          "/document": "Document Tracking",
          "/user": "User & Role Management",
        };

        const moduleKey = Object.keys(routeToModule).find((route) =>
          pathname.startsWith(route),
        );
        if (moduleKey) {
          const moduleName = routeToModule[moduleKey];
          const hasView = permissions[moduleName]?.can_view;
          if (!hasView) {
            toast.error(
              `Access Denied: You don't have permission for ${moduleName}`,
            );
            router.push("/dashboard");
            return;
          }
        }
      }
    }

  }, [pathname, router, user, permissions, isLoading]);

  if (isLoading) {
    return null; // Initial load only
  }

  if (pathname === "/") {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}

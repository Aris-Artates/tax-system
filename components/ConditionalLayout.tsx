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
        // Maps route paths to the underlying access_module ID stored in the database
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

        const moduleKey = Object.keys(routeToModule).find((route) =>
          pathname.startsWith(route),
        );
        if (moduleKey) {
          const mod = routeToModule[moduleKey];
          const hasView = permissions[mod.id]?.can_view || permissions[mod.label]?.can_view;
          if (!hasView) {
            toast.error(
              `Access Denied: You don't have permission for ${mod.label}`,
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

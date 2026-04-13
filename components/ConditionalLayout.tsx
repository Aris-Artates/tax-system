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
          const permData = permissions[mod.id] || permissions[mod.label];
          
          if (!permData) {
            toast.error(
              `Access Denied: You don't have permission for ${mod.label}`,
            );
            router.push("/dashboard");
            return;
          }

          // Parent module check
          if (!permData.can_view) {
            toast.error(
              `Access Denied: You don't have permission for ${mod.label}`,
            );
            router.push("/dashboard");
            return;
          }

          // Deep link / Sub-module check
          // We find the sub-segment immediately after the module root.
          // e.g. /user/settings/permission → subTab = "settings"
          // e.g. /property/new-td → subTab = "new-td"
          const modSegments = mod.id.split('/').filter(Boolean);
          const pathSegments = pathname.split('/').filter(Boolean);
          const subTab = pathSegments[modSegments.length]; // first segment after the module root
          if (subTab && permData.tabs && Object.keys(permData.tabs).length > 0) {
            const tabPerm = permData.tabs[subTab];
            if (!tabPerm || !tabPerm.can_view) {
              toast.error(`Access Denied: You don't have permission for this sub-module.`);
              router.push(`/${mod.id}`);
              return;
            }
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

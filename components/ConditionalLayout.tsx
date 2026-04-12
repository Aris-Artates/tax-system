"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import { toast } from "sonner";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setSessionChecked(false);

    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        const data = await response.json();
        const user = data.user;
        const permissions = data.permissions || {};

        if (isMounted) {
          if (!user && pathname !== "/") {
            toast.error("No session found. Please login.");
            router.push("/");
            setSessionChecked(true);
            return;
          }

          if (user && pathname === "/") {
            router.push("/dashboard");
            setSessionChecked(true);
            return;
          }

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
                  setSessionChecked(true);
                  return;
                }
              }
            }
          }

          setSessionChecked(true);
        }
      } catch (err) {
        if (isMounted) {
          if (pathname !== "/") {
            router.push("/");
          }
          setSessionChecked(true);
        }
      }
    };

    checkSession();

    const channel = new BroadcastChannel("auth_channel");
    channel.onmessage = (event) => {
      if (event.data === "login") {
        if (pathname === "/") {
          router.push("/dashboard");
        } else {
          window.location.reload();
        }
      } else if (event.data === "logout") {
        if (pathname !== "/") {
          toast.error("Session expired or logged out from another tab.");
          router.push("/");
        }
      }
    };

    return () => {
      isMounted = false;
      channel.close();
    };
  }, [pathname, router]);

  if (!sessionChecked) {
    return null;
  }

  if (pathname === "/") {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}

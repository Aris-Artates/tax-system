"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type SessionUser = {
  empID: string;
  username: string;
  firstname: string;
  lastname: string;
  name: string;
  email: string;
  role: string;
  role_id: string | number;
};

type AuthContextType = {
  user: SessionUser | null;
  permissions: Record<string, any>;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [permissions, setPermissions] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        setUser(null);
        setPermissions({});
        return;
      }

      const data = await response.json();
      setUser(data.user ?? null);
      setPermissions(data.permissions ?? {});
    } catch (error) {
      console.error("Failed to fetch session:", error);
      setUser(null);
      setPermissions({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();

    const channel = new BroadcastChannel("auth_channel");
    channel.onmessage = (event) => {
      if (event.data === "login" || event.data === "logout") {
        fetchSession();
        // For logout, we might want to redirect if not on public page
        if (event.data === "logout" && window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }
    };

    return () => {
      channel.close();
    };
  }, [fetchSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        isLoading,
        refreshSession: fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

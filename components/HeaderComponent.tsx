"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  PanelRightClose,
  PanelRightOpen,
  Search,
  Settings,
  Bell,
  ChevronDown,
  UserCircle2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";

// We'll get a router instance inside the component using the hook and
// forward a callback down to the user menu. The previous approach
// imported `next/router` which is meant for the legacy pages router,
// and the `roleName` argument was never used.

// (Sign out implementation lives in the HeaderComponent body now.)

// Types
interface SearchBarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

interface UserMenuProps {
  userName?: string;
  userRole?: string;
  avatar?: string;
  onProfile?: () => void;
  onSettings?: () => void;
  onSignOut?: () => void;
}

interface HeaderComponentProps {
  sessionUser: {
    empID: string;
    username: string;
    name: string;
    email: string;
    role: string;
    role_id: string | number;
  } | null;
}

// Constants
// const SYNC_INTERVAL = 30000; // 30 seconds - COMMENTED OUT
// const TICK_INTERVAL = 1000; // 1 second - COMMENTED OUT
const SEARCH_SHORTCUT = "Ctrl /";

// Custom hook for date/time management - COMMENTED OUT
// const useServerTime = () => {
//   const [currentMs, setCurrentMs] = useState<number | null>(null);
//   const [isSyncing, setIsSyncing] = useState(false);
//   const [error, setError] = useState<Error | null>(null);
//
//   const syncWithServer = useCallback(async () => {
//     if (isSyncing) return;
//
//     setIsSyncing(true);
//     setError(null);
//
//     try {
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 5000);
//
//       const res = await fetch("/api/datetime", {
//         cache: "no-store",
//         signal: controller.signal,
//         headers: { "Content-Type": "application/json" },
//       });
//
//       clearTimeout(timeoutId);
//
//       if (!res.ok) {
//         throw new Error(`HTTP error! status: ${res.status}`);
//       }
//
//       const data: { serverTimeMs: number } = await res.json();
//       setCurrentMs(data.serverTimeMs);
//     } catch (err) {
//       setError(err instanceof Error ? err : new Error("Failed to sync time"));
//       console.error("Time sync failed:", err);
//     } finally {
//       setIsSyncing(false);
//     }
//   }, [isSyncing]);
//
//   useEffect(() => {
//     let tickInterval: NodeJS.Timeout;
//     let syncInterval: NodeJS.Timeout;
//     let isMounted = true;
//
//     const initializeTime = async () => {
//       await syncWithServer();
//
//       if (!isMounted) return;
//
//       // Local tick every second
//       tickInterval = setInterval(() => {
//         setCurrentMs((prev) => (prev === null ? prev : prev + TICK_INTERVAL));
//       }, TICK_INTERVAL);
//
//       // Periodic resync to prevent drift
//       syncInterval = setInterval(() => {
//         syncWithServer();
//       }, SYNC_INTERVAL);
//     };
//
//     initializeTime();
//
//     return () => {
//       isMounted = false;
//       clearInterval(tickInterval);
//       clearInterval(syncInterval);
//     };
//   }, [syncWithServer]);
//
//   return { currentMs, isSyncing, error, retry: syncWithServer };
// };

// Memoized DateTime display component - COMMENTED OUT
// const DateTimeDisplay = memo(({ currentMs }: DateTimeDisplayProps) => {
//   const dateTime = useMemo(() => {
//     if (currentMs === null) {
//       return {
//         date: "—",
//         time: "—",
//         isoString: null,
//       };
//     }
//
//     const date = new Date(currentMs);
//     return {
//       date: date.toLocaleDateString(undefined, {
//         weekday: "short",
//         year: "numeric",
//         month: "short",
//         day: "2-digit",
//       }),
//       time: date.toLocaleTimeString(undefined, {
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//         hour12: false,
//       }),
//       isoString: date.toISOString(),
//     };
//   }, [currentMs]);
//
//   return (
//     <div className="flex items-center gap-4 rounded-xl border px-3 py-2 text-sm text-gray-600">
//       <div className="flex items-center gap-2" title={dateTime.isoString || undefined}>
//         <CalendarDays className="h-4 w-4" aria-hidden="true" />
//         <span aria-label="Current date">{dateTime.date}</span>
//       </div>
//       <div className="h-5 w-px bg-gray-200" aria-hidden="true" />
//       <div className="flex items-center gap-2">
//         <Clock3 className="h-4 w-4" aria-hidden="true" />
//         <span aria-label="Current time">{dateTime.time}</span>
//       </div>
//     </div>
//   );
// });
//
// DateTimeDisplay.displayName = "DateTimeDisplay";

// Responsive search bar with mobile support
const SearchBar = memo(({ isOpen, onToggle }: SearchBarProps) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchValue("");
        if (onToggle && window.innerWidth < 768) {
          onToggle();
        }
      }
    },
    [onToggle],
  );

  // Desktop search bar
  return (
    <>
      <div className="relative hidden w-70 md:block lg:w-90">
        <label htmlFor="search-input" className="sr-only">
          Search menu
        </label>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          id="search-input"
          type="text"
          placeholder="Search menu..."
          value={searchValue}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          className="h-11 w-full rounded-xl border bg-gray-50 pl-10 pr-24 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
        />
        <kbd
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border bg-white px-2 py-0.5 text-xs text-gray-500"
          aria-label={`Shortcut: ${SEARCH_SHORTCUT}`}
        >
          {SEARCH_SHORTCUT}
        </kbd>
      </div>

      {/* Mobile search overlay */}
      {isOpen && (
        <div className="absolute inset-x-0 top-0 z-50 bg-white p-4 shadow-lg md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchValue}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              className="h-11 w-full rounded-xl border bg-gray-50 pl-10 pr-12 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white"
              autoFocus
            />
            <button
              onClick={onToggle}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 hover:bg-gray-100"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
});

SearchBar.displayName = "SearchBar";

// User menu component
const UserMenu = memo(
  ({
    userName = "Admin",
    userRole = "Administrator",
    avatar,
    onProfile,
    onSettings,
    onSignOut,
  }: UserMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="cursor-pointer flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="User menu"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {avatar ? (
            <img
              src={avatar}
              alt={userName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <UserCircle2 className="h-8 w-8 text-blue-500" aria-hidden="true" />
          )}

          <div className="hidden text-left leading-tight sm:block">
            <p className="text-sm font-semibold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>

          <ChevronDown
            className={`hidden h-4 w-4 text-gray-500 transition-transform sm:block ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                onProfile && onProfile();
                setIsOpen(false);
              }}
              className="cursor-pointer w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => {
                onSettings && onSettings();
                setIsOpen(false);
              }}
              className="cursor-pointer w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
            >
              Settings
            </button>
            <hr className="my-1" />
            <button
              type="button"
              onClick={() => {
                onSignOut && onSignOut();
                setIsOpen(false);
              }}
              className="cursor-pointer w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  },
);

UserMenu.displayName = "UserMenu";

export default function HeaderComponent({ sessionUser }: HeaderComponentProps) {
  const router = useRouter();
  const { toggleSidebar, open } = useSidebar();

  const handleSignOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      const channel = new BroadcastChannel("auth_channel");
      channel.postMessage("logout");
      channel.close();
    } finally {
      router.push("/");
      router.refresh();
    }
  }, [router]);

  const handleOpenProfile = useCallback(() => {
    router.push("/user/profile");
  }, [router]);

  const handleOpenSettings = useCallback(() => {
    router.push("/user/settings/security");
  }, [router]);

  // const { currentMs, error, retry } = useServerTime(); - COMMENTED OUT
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Close mobile search on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileSearchOpen) {
        setIsMobileSearchOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileSearchOpen]);

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleSearchShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setIsMobileSearchOpen(true);
        } else {
          document.getElementById("search-input")?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleSearchShortcut);
    return () => document.removeEventListener("keydown", handleSearchShortcut);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/95 font-(--font-lexend) backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Left section */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="cursor-pointer inline-flex h-11 w-11 items-center justify-center rounded-xl border text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            {open ? (
              <PanelRightClose className="h-5 w-5" />
            ) : (
              <PanelRightOpen className="h-5 w-5" />
            )}
          </button>

          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border text-gray-600 transition hover:bg-gray-50 md:hidden"
            aria-label="Open search"
          >
            <Search className="h-5 w-5" />
          </button>

          <SearchBar
            isOpen={isMobileSearchOpen}
            onToggle={() => setIsMobileSearchOpen(false)}
          />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Error indicator - COMMENTED OUT */}
          {/* {error && (
            <button
              onClick={retry}
              className="hidden items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 lg:flex"
              aria-label="Retry time sync"
            >
              <span>Sync error</span>
            </button>
          )} */}

          {/* Desktop date/time - COMMENTED OUT */}
          {/* <div className="hidden lg:block">
            <DateTimeDisplay currentMs={currentMs} />
          </div> */}

          {/* Settings button */}
          <button
            type="button"
            className="cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Notifications button */}
          <button
            type="button"
            className="cursor-pointer relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span
              className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
              aria-label="Unread notifications"
            />
          </button>

          {/* User menu */}
          <UserMenu
            userName={sessionUser?.name || sessionUser?.username || "Guest User"}
            userRole={sessionUser?.role || "No active session"}
            onProfile={handleOpenProfile}
            onSettings={handleOpenSettings}
            onSignOut={handleSignOut}
          />
        </div>
      </div>

      {/* Mobile date/time bar - COMMENTED OUT */}
      {/* <div className="border-t bg-gray-50 px-4 py-2 lg:hidden">
        <DateTimeDisplay currentMs={currentMs} />
      </div> */}
    </header>
  );
}

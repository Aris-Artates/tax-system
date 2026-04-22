"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { usePermission } from "@/hooks/usePermission";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Undo2,
  KeyRound,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings2,
  ArrowUpDown,
  Check,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { PermissionDialog } from "@/components/PermissionDialog";
import { PermissionSettingsModal } from "@/components/PermissionSettingsModal";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/table";

type Permission = {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  roles?: { id: number; name: string }[];
  access_module?: string;
  tab?: string;
};

const MODULE_LABELS: Record<string, string> = {
  property: "Property Registry",
  taxpayers: "Taxpayer Records",
  assessment: "Assessment & Billing",
  payments: "Payments & OR Monitoring",
  barangay: "Barangay Performance",
  delinquencies: "Delinquencies & Notices",
  document: "Document Tracking",
  user: "User & Role Management",
};

const getModuleLabel = (slug: string) => {
  if (!slug) return "";
  const s = slug.toLowerCase().trim();
  return MODULE_LABELS[s] || slug;
};

export default function PermissionSettingsPage() {
  const router = useRouter();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const { canEdit, isSuperAdmin } = usePermission("user");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sortBy, setSortBy] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("perm_sort") || "date_desc";
    }
    return "date_desc";
  });
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("perm_sort", sortBy);
  }, [sortBy]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);

  // Automation Fulfillment States
  const [reviewRequest, setReviewRequest] = useState<any>(null);
  const [prefillModules, setPrefillModules] = useState<string[]>([]);
  const [prefillTabs, setPrefillTabs] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchPermissions = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      // Simulated dataset load
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const response = await fetch("/api/permissions/list", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        setLoadError(data.error ?? "Failed to load permissions.");
        setPermissions([]);
        return;
      }

      // Intercept and decode obscured payload
      try {
        if (data._data) {
          const decoded = JSON.parse(atob(atob(atob(data._data))));
          
          setPermissions(decoded);
        } else {
          setPermissions([]);
        }
      } catch (decodeError) {
        setPermissions([]);
        setLoadError("Received malformed or corrupted data.");
      }
    } catch {
      setLoadError("Unable to connect to server.");
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      } catch {}
    };
    fetchSession();
    fetchPermissions();

    // Check for incoming fulfillment workflow from URL without forcing Suspense boundaries
    const urlParams = new URLSearchParams(window.location.search);
    const rid = urlParams.get("review_request");
    if (rid) {
      fetch(`/api/requests/detail?id=${rid}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.request) {
            setReviewRequest(data.request);
            const pMods = data.request.modules.map((m: any) => m.module);
            const pTabs = data.request.modules.flatMap((m: any) => m.tabs);
            setPrefillModules(pMods);
            setPrefillTabs(pTabs);
          }
        });
    }
  }, []);

  const handleAddPermission = () => {
    setIsDialogOpen(true);
  };

  const handleOpenSettings = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsSettingsOpen(true);
  };

  // Table hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Clear search on Esc
      if (e.key === "Escape" && globalFilter) {
        setGlobalFilter("");
      }
      // Alt + N to add new permission
      if (
        e.altKey &&
        e.key.toLowerCase() === "n" &&
        Number(currentUser?.role_id) === 1
      ) {
        e.preventDefault();
        handleAddPermission();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [globalFilter, handleAddPermission, currentUser]);

  const handleDialogSuccess = useCallback(async () => {
    await fetchPermissions();
    setIsDialogOpen(false);
  }, []);

  const [isRecommendedModalOpen, setIsRecommendedModalOpen] = useState(false);
  const [currentRecIndex, setCurrentRecIndex] = useState(0);

  const currentUserPermissions = useMemo(() => {
    if (!reviewRequest) return [];
    const requesterRoleId = Number(reviewRequest.users.role_id);
    return permissions.filter(p => p.roles?.some((r: any) => Number(r.id) === requesterRoleId));
  }, [permissions, reviewRequest]);

  const remainingRequestModules = useMemo(() => {
    if (!reviewRequest) return [];

    const coveredMods = new Map<string, Set<string>>();
    const fullyCoveredMods = new Set<string>();

    currentUserPermissions.forEach((p: any) => {
      const pMods = (p.access_module || p.name).split(",").map((s: string) => s.trim());
      const pTabs = (p.tab || "").split(",").map((s: string) => s.trim()).filter(Boolean) as string[];

      pMods.forEach((m: string) => {
        if (pTabs.length === 0) {
          fullyCoveredMods.add(m);
        } else {
          if (!coveredMods.has(m)) coveredMods.set(m, new Set<string>());
          pTabs.forEach((t: string) => coveredMods.get(m)!.add(t));
        }
      });
    });

    const remaining: { module: string; tabs: string[] }[] = [];

    reviewRequest.modules.forEach((reqMod: any) => {
      if (fullyCoveredMods.has(reqMod.module)) return;

      const coveredTabsForMod = coveredMods.get(reqMod.module) || new Set();

      if (reqMod.tabs.length === 0) {
        remaining.push(reqMod);
      } else {
        const missingTabs = reqMod.tabs.filter((t: string) => !coveredTabsForMod.has(t));
        if (missingTabs.length > 0) {
          remaining.push({ module: reqMod.module, tabs: missingTabs });
        }
      }
    });

    return remaining;
  }, [reviewRequest, currentUserPermissions]);

  const recommendedPerms = useMemo(() => {
    if (!reviewRequest || remainingRequestModules.length === 0) return [];
    const requesterRoleId = Number(reviewRequest.users.role_id);

    return permissions.filter((p: any) => {
      // Must not already be assigned to the user
      const isAssigned = p.roles?.some((r: any) => Number(r.id) === requesterRoleId);
      if (isAssigned) return false;

      const pMods = (p.access_module || p.name).split(",").map((s: string) => s.trim());
      const pTabs = (p.tab || "").split(",").map((s: string) => s.trim()).filter(Boolean) as string[];

      // Must overlap with remaining missing modules
      return remainingRequestModules.some((reqMod: any) => {
        if (!pMods.includes(reqMod.module)) return false;
        if (pTabs.length === 0) return true;
        if (reqMod.tabs.length === 0) return true;
        return reqMod.tabs.some((t: string) => pTabs.includes(t));
      });
    });
  }, [permissions, reviewRequest, remainingRequestModules]);

  // Sync prefill modules to exactly what is remaining
  useEffect(() => {
    if (reviewRequest && remainingRequestModules.length > 0) {
      const newMods = remainingRequestModules.map((m: any) => m.module);
      const newTabs = remainingRequestModules.flatMap((m: any) => m.tabs);
      setPrefillModules(newMods);
      setPrefillTabs(newTabs);
    }
  }, [remainingRequestModules, reviewRequest]);

  // Auto-approve if fully fulfilled
  useEffect(() => {
    let mounted = true;
    if (reviewRequest && permissions.length > 0 && remainingRequestModules.length === 0) {
      const approve = async () => {
        await fetch("/api/requests/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            request_id: reviewRequest.id,
            action: "approved",
            review_note: "Automatically approved via permission mapping.",
          }),
        });
        if (mounted) {
          toast.success("Request fully fulfilled and approved!");
          setReviewRequest(null);
          setIsRecommendedModalOpen(false);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
      approve();
    }
    return () => { mounted = false; };
  }, [reviewRequest, remainingRequestModules, permissions]);

  const handleAssignPermissions = async (permissionIds: number[]) => {
    if (!reviewRequest?.users?.role_id)
      return toast.error("Could not determine requester role.");
    setIsAssigning(true);
    try {
      const res = await fetch("/api/permissions/assign-multiple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId: reviewRequest.users.role_id,
          permissionIds,
        }),
      });
      if (res.ok) {
        toast.success(`Assigned ${permissionIds.length} permission(s).`);
        await fetchPermissions();
        
        // Reset carousel index if assigning single
        if (permissionIds.length === 1 && currentRecIndex > 0) {
           setCurrentRecIndex(prev => prev - 1);
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to assign.");
      }
    } finally {
      setIsAssigning(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }: any) => ` #${row.original.id}`,
      },
      {
        accessorKey: "name",
        header: "Permission",
        cell: ({ row }: any) => (
          <div className="inline-flex min-w-max items-center gap-2 whitespace-nowrap font-medium text-slate-700">
            <KeyRound className="h-4 w-4 shrink-0 text-slate-400" />
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }: any) => {
          const description = row.original.description;

          if (!description) {
            return (
              <div className="max-w-[200px] text-xs text-slate-400 font-inter italic">
                -
              </div>
            );
          }

          return (
            <TooltipProvider>
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                  <div className="max-w-[200px] truncate text-xs text-slate-500 font-inter cursor-default">
                    {description}
                  </div>
                </TooltipTrigger>

                <TooltipContent
                  side="top"
                  className="bg-white text-xs border border-slate-200 shadow-xl px-4 py-3 rounded-lg max-w-[320px] whitespace-normal wrap-break-words"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900 border-b border-slate-100 pb-1 mb-2">
                      Description
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      },
      {
        id: "roles",
        header: "Assigned to",
        cell: ({ row }: any) => {
          const roles = row.original.roles || [];
          if (roles.length === 0)
            return (
              <span className="text-slate-400 text-xs italic">Unassigned</span>
            );

          const displayRoles = roles.slice(0, 3);
          const hasMore = roles.length > 3;

          return (
            <div className="flex items-center gap-1.5">
              {displayRoles.map((r: any) => (
                <span
                  key={r.id}
                  className="whitespace-nowrap inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                >
                  {r.name}
                </span>
              ))}

              {hasMore && (
                <TooltipProvider>
                  <Tooltip delayDuration={500}>
                    <TooltipTrigger asChild>
                      <div className="whitespace-nowrap shrink-0 inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-300 transition-all cursor-default">
                        +{roles.length - 3} more
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="bg-white border border-slate-200 shadow-xl p-3 rounded-lg max-w-[250px]"
                    >
                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold text-slate-900 border-b border-slate-100 pb-1.5">
                          Additional Roles
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {roles.slice(3).map((role: any) => (
                            <span
                              key={role.id}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 text-[10px] font-medium border border-slate-100 shadow-sm"
                            >
                              {role.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }: any) => {
          const date = row.original.created_at;
          return (
            <span className="text-slate-500 font-inter">
              {date ? new Date(date).toLocaleDateString() : "-"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }: any) => {
          const p = row.original;
          return (
            <div className="flex justify-end">
              {canEdit && (
                <button
                  onClick={() => handleOpenSettings(p)}
                  className="font-inter inline-flex min-w-max items-center gap-2 whitespace-nowrap rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 cursor-pointer active:scale-95"
                >
                  <Settings2 className="h-3.5 w-3.5 shrink-0 text-slate-500" />{" "}
                  Configure
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );

  const SORT_OPTIONS = [
    { value: "date_desc", label: "Date Created (Newest)" },
    { value: "date_asc", label: "Date Created (Oldest)" },
    { value: "alpha_asc", label: "Alphabetical (A–Z)" },
    { value: "alpha_desc", label: "Alphabetical (Z–A)" },
    { value: "id_asc", label: "ID (Ascending)" },
    { value: "id_desc", label: "ID (Descending)" },
  ];

  const sortedPermissions = useMemo(() => {
    const sorted = [...permissions];
    switch (sortBy) {
      case "date_desc":
        return sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      case "date_asc":
        return sorted.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
      case "alpha_asc":
        return sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      case "alpha_desc":
        return sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
      case "id_asc":
        return sorted.sort((a, b) => a.id - b.id);
      case "id_desc":
        return sorted.sort((a, b) => b.id - a.id);
      default:
        return sorted;
    }
  }, [permissions, sortBy]);

  const table = useReactTable({
    data: sortedPermissions,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="flex w-full overflow-x-hidden">
      <main className="flex-1 w-full max-w-7xl mx-auto h-auto">
        <header className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {isLoading ? (
              <div className="space-y-2 mb-1">
                <div className="h-8 w-64 animate-pulse rounded bg-slate-300/80" />
                <div className="h-4 w-96 animate-pulse rounded bg-slate-200" />
              </div>
            ) : (
              <>
                <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
                  Permission Settings
                </h1>
                <p className="font-inter mt-1 text-xs text-slate-400">
                  Configure feature-level access across system modules.
                </p>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => router.push("/user")}
              disabled={isLoading}
              className={cn(
                "h-9 rounded-md border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-white hover:text-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
                isLoading && "animate-pulse bg-slate-100 border-slate-200 text-transparent shadow-none"
              )}
            >
              <Undo2 className={cn("h-4 w-4", isLoading && "opacity-0")} />
              <span className={cn(isLoading && "opacity-0")}>Back to User Management</span>
            </Button>
            {canEdit && (
              <Button
                onClick={handleAddPermission}
                disabled={isLoading}
                className={cn(
                  "h-9 rounded-md bg-[#0F172A] px-5 text-xs font-semibold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer",
                  isLoading && "animate-pulse bg-slate-200 text-transparent border-none shadow-none"
                )}
              >
                <Plus className={cn("mr-2 h-4 w-4", isLoading && "opacity-0")} />
                <span className={cn(isLoading && "opacity-0")}>Add Permission</span>
              </Button>
            )}
          </div>
        </header>

        {reviewRequest && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h3 className="text-blue-900 font-lexend font-bold text-sm mb-1">
                  Automated Assignment for {reviewRequest.requester_name}
                </h3>
                <p className="text-blue-700 font-inter text-xs max-w-xl">
                  Currently on Stage mode on behalf of{" "}
                  {reviewRequest.requester_name}({reviewRequest.requester_role})
                  request involving {prefillModules.length} module(s). Choose
                  how you want to fulfill this request:
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {prefillModules.map((m) => (
                    <span
                      key={m}
                      className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-md border border-blue-200"
                    >
                      {getModuleLabel(m)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                {canEdit && (
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-white text-blue-700 border border-blue-200 hover:bg-blue-100 h-8 text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Auto-Create Custom Permission
                  </Button>
                )}
                {recommendedPerms.length > 0 && (
                  <Button
                    onClick={() => setIsRecommendedModalOpen(true)}
                    disabled={isAssigning}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow shadow-blue-200 h-8 text-xs font-bold"
                  >
                    Assign {recommendedPerms.length} Matching Permission(s)
                  </Button>
                )}
                {recommendedPerms.length === 0 && (
                  <p className="text-[10px] font-inter text-blue-500 italic mt-1">
                    No exact matches found. Please create one.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-3 rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "rounded-md bg-slate-100 p-2",
                isLoading && "animate-pulse bg-slate-100"
              )}>
                <KeyRound className={cn("h-4 w-4 text-[#00154A]", isLoading && "opacity-0")} />
              </div>
              {isLoading ? (
                <div className="h-4 w-40 animate-pulse rounded bg-slate-200/50" />
              ) : (
                <h2 className="font-lexend text-sm font-semibold text-[#848794]">
                  Role Permission Matrix
                </h2>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  disabled={isLoading}
                  placeholder={isLoading ? "" : "Search permissions..."}
                  className={cn(
                    "font-inter w-full rounded-md border border-gray-200 py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-slate-100 outline-none",
                    isLoading && "animate-pulse bg-slate-50 border-slate-100"
                  )}
                />
              </div>
              <div className="relative">
                <button
                  disabled={isLoading}
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 cursor-pointer whitespace-nowrap",
                    isLoading && "animate-pulse bg-slate-50 border-slate-100 text-transparent"
                  )}
                >
                  <ArrowUpDown className={cn("h-3.5 w-3.5 text-slate-400", isLoading && "opacity-0")} />
                  {isLoading ? "Loading..." : (SORT_OPTIONS.find(o => o.value === sortBy)?.label || "Sort")}
                </button>
                {isSortOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-xl border border-slate-200 bg-white shadow-xl py-1.5 animate-in fade-in slide-in-from-top-2">
                      <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort by</p>
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(opt.value); setIsSortOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center justify-between gap-2 ${
                            sortBy === opt.value
                              ? "text-blue-600 bg-blue-50/50"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {opt.label}
                          {sortBy === opt.value && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {loadError && (
          <div className="mb-4 rounded-sm border border-rose-200 bg-rose-50 px-4 py-2 font-inter text-xs text-rose-700">
            {loadError}
          </div>
        )}

        <TableContainer>
          <Table zebra>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-gray-50/50">
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {isLoading ? (
                        <div className={cn(
                          "h-4 animate-pulse rounded bg-slate-200",
                          header.id === "id" ? "w-8" :
                          header.id === "name" ? "w-24" :
                          header.id === "description" ? "w-40" :
                          header.id === "roles" ? "w-32" :
                          header.id === "created_at" ? "w-20" :
                          "w-16 ml-auto"
                        )} />
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell>
                        <div className="h-4 w-10 animate-pulse rounded bg-slate-200/60" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-pulse rounded-sm bg-slate-200/60" />
                          <div className="h-4 w-32 animate-pulse rounded bg-slate-200/60" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-48 animate-pulse rounded bg-slate-200/60" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200/60" />
                          <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200/60" />
                          <div className="h-5 w-12 animate-pulse rounded-full bg-slate-200/60" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-200/60" />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <div className="h-[30px] w-[95px] animate-pulse rounded-md bg-slate-200/60" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                : table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
            </TableBody>
          </Table>

          {!isLoading && permissions.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <p className="font-inter text-xs text-slate-400">
                Showing{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
                -
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length,
                )}{" "}
                of {table.getFilteredRowModel().rows.length} permissions
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="font-inter px-2 text-xs text-slate-500">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </span>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </TableContainer>
      </main>

      <PermissionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleDialogSuccess}
        initialModules={prefillModules}
        initialTabs={prefillTabs}
      />

      {selectedPermission && (
        <PermissionSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => {
            setIsSettingsOpen(false);
            setSelectedPermission(null);
          }}
          onSuccess={fetchPermissions}
          permission={selectedPermission}
        />
      )}

      <Dialog 
        open={isRecommendedModalOpen && recommendedPerms.length > 0} 
        onOpenChange={(open) => {
          if (!open) {
            setIsRecommendedModalOpen(false);
            setCurrentRecIndex(0);
          }
        }}
      >
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="bg-white flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <DialogTitle className="font-lexend text-xl font-bold text-slate-800">Matching Permissions</DialogTitle>
                <DialogDescription className="text-xs text-slate-500 font-inter mt-1">Review and assign pre-configured access levels that match the user request.</DialogDescription>
              </div>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                {currentRecIndex + 1} of {recommendedPerms.length}
              </span>
            </div>

            <div className="flex-1 p-10 relative flex items-center justify-center overflow-y-auto">
              {recommendedPerms.length > 1 && (
                <button 
                  onClick={() => setCurrentRecIndex(prev => prev === 0 ? recommendedPerms.length - 1 : prev - 1)}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300 border border-transparent hover:border-blue-100 group shadow-sm hover:shadow-md z-10"
                >
                  <ChevronLeft size={28} className="group-active:scale-90 transition-transform" />
                </button>
              )}

              {recommendedPerms[currentRecIndex] ? (
                <div className="flex-1 px-12 text-center max-w-2xl">
                   <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 mb-6 shadow-sm border border-blue-200 rotate-3 hover:rotate-0 transition-transform duration-300">
                     <KeyRound size={32} />
                   </div>
                   <h3 className="font-lexend font-extrabold text-slate-900 text-3xl mb-3 tracking-tight">
                     {recommendedPerms[currentRecIndex].name}
                   </h3>
                   <p className="text-sm text-slate-500 font-inter mb-8 leading-relaxed">
                     {recommendedPerms[currentRecIndex].description || "This permission provides access to specific system modules as defined below."}
                   </p>
                   
                   <div className="space-y-4">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Included Access Modules</p>
                     <div className="flex flex-wrap justify-center gap-2">
                        {(() => {
                           const p = recommendedPerms[currentRecIndex];
                           const mods = (p.access_module || p.name || "").split(',').map((s:string)=>s.trim()).filter(Boolean);
                           return mods.map((m: string) => (
                             <span key={m} className="px-4 py-1.5 text-xs font-bold bg-white text-slate-700 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:text-blue-700 transition-colors">
                               {getModuleLabel(m)}
                             </span>
                           ));
                        })()}
                     </div>
                   </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-sm font-medium">Processing...</p>
                </div>
              )}

              {recommendedPerms.length > 1 && (
                <button 
                  onClick={() => setCurrentRecIndex(prev => prev === recommendedPerms.length - 1 ? 0 : prev + 1)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300 border border-transparent hover:border-blue-100 group shadow-sm hover:shadow-md z-10"
                >
                  <ChevronRight size={28} className="group-active:scale-90 transition-transform" />
                </button>
              )}
            </div>

            <div className="flex justify-center gap-2 pb-8">
               {recommendedPerms.map((_, idx) => (
                 <button 
                   key={idx}
                   onClick={() => setCurrentRecIndex(idx)}
                   className={`h-2 rounded-full transition-all duration-300 ${idx === currentRecIndex ? 'w-8 bg-blue-600 shadow-sm shadow-blue-200' : 'w-2 bg-slate-200 hover:bg-slate-300'}`} 
                 />
               ))}
            </div>

            <div className="flex items-center gap-4 px-8 py-6 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => {
                   setIsRecommendedModalOpen(false);
                   setCurrentRecIndex(0);
                }}
                className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-200 bg-slate-100 rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                Cancel
              </button>
              <div className="flex-1" />
              <button 
                onClick={() => handleAssignPermissions([recommendedPerms[currentRecIndex]?.id].filter(Boolean) as number[])}
                disabled={isAssigning || !recommendedPerms[currentRecIndex]}
                className="px-8 py-3 text-sm font-bold text-blue-600 bg-white border-2 border-blue-100 hover:border-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign This Permission
              </button>
              {recommendedPerms.length > 1 && (
                <button 
                  onClick={() => handleAssignPermissions(recommendedPerms.map((p: any) => p.id))}
                  disabled={isAssigning}
                  className="px-10 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xl shadow-blue-200/50 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                >
                  Assign All Matches
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

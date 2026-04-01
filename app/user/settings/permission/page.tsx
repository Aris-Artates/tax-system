"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Undo2,
  KeyRound,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings2,
} from "lucide-react";

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
} from "@/components/Table";

type Permission = {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  roles?: { id: number; name: string }[];
};

export default function PermissionSettingsPage() {
  const router = useRouter();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);

  const fetchPermissions = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/permissions/list", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        setLoadError(data.error ?? "Failed to load permissions.");
        setPermissions([]);
        return;
      }

      setPermissions(data.permissions ?? []);
    } catch {
      setLoadError("Unable to connect to server.");
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
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
      if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleAddPermission();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [globalFilter, handleAddPermission]);

  const handleDialogSuccess = useCallback(async () => {
    await fetchPermissions();
    setIsDialogOpen(false);
  }, []);

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
          <div className="inline-flex items-center gap-2 font-medium text-slate-700">
            <KeyRound className="h-4 w-4 text-slate-400" />
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
              <button
                onClick={() => handleOpenSettings(p)}
                className="font-inter inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 cursor-pointer active:scale-95"
              >
                <Settings2 className="h-3.5 w-3.5 text-slate-500" /> Configure
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: permissions,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 5 } },
  });

  return (
    <div className="flex w-full overflow-x-hidden">
      <main className="flex-1 w-full max-w-7xl mx-auto h-auto">
        <header className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
              Permission Settings
            </h1>
            <p className="font-inter mt-1 text-xs text-slate-400">
              Configure feature-level access across system modules.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => router.push("/user")}
              className="h-9 rounded-md border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-white hover:text-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <Undo2 className="h-4 w-4" />
              Back to User Management
            </Button>
            <Button
              onClick={handleAddPermission}
              className="h-9 rounded-md bg-[#0F172A] px-5 text-xs font-semibold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Permission
            </Button>
          </div>
        </header>

        <div className="mb-3 rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-slate-100 p-2">
                <KeyRound className="h-4 w-4 text-[#00154A]" />
              </div>
              <h2 className="font-lexend text-sm font-semibold text-[#848794]">
                Role Permission Matrix
              </h2>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search permissions..."
                className="font-inter w-full rounded-md border border-gray-200 py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-slate-100 outline-none"
              />
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
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-slate-400"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
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
                ))
              )}
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
    </div>
  );
}

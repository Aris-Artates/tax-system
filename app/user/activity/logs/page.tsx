"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Undo2,
  Activity,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/table";

type SystemLog = {
  user: string;
  action: string;
  module: string;
  status: "Success" | "Failed";
  time: string;
};

const ACTIONS = [
  { action: "Created New Assessment", module: "Assessment" },
  { action: "Approved Payment", module: "Collections" },
  { action: "Updated Role Permissions", module: "User Management" },
  { action: "Failed Login Attempt", module: "Authentication" },
  { action: "Deleted Property Profile", module: "Property" },
  { action: "Modified Tax Declaration", module: "Taxation" },
  { action: "Generated Revenue Report", module: "Reports" },
];

const STATUSES: ("Success" | "Failed")[] = [
  "Success",
  "Success",
  "Success",
  "Failed",
];

function UserLogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState(initialSearch);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        // Simulated dataset load
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const response = await fetch("/api/user/list", { cache: "no-store" });
        const data = await response.json();

        const decodedUsers = data._data ? JSON.parse(atob(atob(atob(data._data)))) : (data.users ?? []);

        if (response.ok && decodedUsers) {
          const fetchedUsers = decodedUsers.map((u: any) => {
            return (
              [
                u.firstname?.trim() || "",
                u.middlename?.trim() || "",
                u.lastname?.trim() || "",
                u.suffix?.trim() || "",
              ]
                .filter(Boolean)
                .join(" ") || "System Admin"
            );
          });

          // Generate random logs for current users
          const generatedLogs: SystemLog[] = [];

          // If no users, fallback to some mock names
          const userList =
            fetchedUsers.length > 0 ? fetchedUsers : ["Admin", "System"];

          for (let i = 0; i < 15; i++) {
            const randomUser =
              userList[Math.floor(Math.random() * userList.length)];
            const randomEntry =
              ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
            const randomStatus =
              STATUSES[Math.floor(Math.random() * STATUSES.length)];

            // Generate a random time in the last 3 days
            const date = new Date();
            date.setMinutes(
              date.getMinutes() - Math.floor(Math.random() * 4320),
            );
            const timeStr = date
              .toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
              .replace(",", " -");

            generatedLogs.push({
              user: randomUser,
              action: randomEntry.action,
              module: randomEntry.module,
              status: randomStatus,
              time: timeStr,
            });
          }

          setLogs(
            generatedLogs.sort(
              (a, b) =>
                new Date(b.time.replace(" -", ",")).getTime() -
                new Date(a.time.replace(" -", ",")).getTime(),
            ),
          );
        }
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "user",
        header: "User",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <span className="text-slate-700 font-medium">
              {row.original.user}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }: any) => (
          <span className="text-sm text-slate-600">{row.original.action}</span>
        ),
      },
      {
        accessorKey: "module",
        header: "Module",
        cell: ({ row }: any) => (
          <span className="text-xs text-slate-500">{row.original.module}</span>
        ),
      },
      {
        accessorKey: "time",
        header: "Date / Time",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-4 w-4 text-slate-400" />
            {row.original.time}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: any) => {
          const status = row.original.status;
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset",
                status === "Success"
                  ? "bg-emerald-50 text-emerald-600 ring-emerald-600/10"
                  : "bg-rose-50 text-rose-600 ring-rose-600/10"
              )}
            >
              {status === "Success" ? (
                <CheckCircle2 className="h-2.5 w-2.5" />
              ) : (
                <XCircle className="h-2.5 w-2.5" />
              )}
              {status}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="flex w-full overflow-x-hidden">
      <main className="flex-1 w-full">
        {/* Header */}
        <header className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {isLoading ? (
              <div className="space-y-2 mb-1">
                <div className="h-8 w-44 animate-pulse rounded bg-slate-300/80" />
                <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
              </div>
            ) : (
              <>
                <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
                  User Activity Logs
                </h1>
                <p className="font-inter mt-1 text-xs text-slate-400">
                  Monitor system activity, login attempts, and user actions.
                </p>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              disabled={isLoading}
              onClick={() => router.push("/user")}
              className={cn(
                "h-9 rounded-md border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-white hover:text-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
                isLoading && "animate-pulse bg-slate-100 border-slate-200 text-transparent shadow-none"
              )}
            >
              <Undo2 className={cn("h-4 w-4", isLoading && "opacity-0")} />
              <span className={cn(isLoading && "opacity-0")}>Back to User Management</span>
            </Button>
          </div>
        </header>

        <div className="mb-3 rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "rounded-md bg-slate-100 p-2",
                isLoading && "animate-pulse bg-slate-100"
              )}>
                <Activity className={cn("h-4 w-4 text-[#00154A]", isLoading && "opacity-0")} />
              </div>
              {isLoading ? (
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200/50" />
              ) : (
                <h2 className="font-lexend text-sm font-semibold text-[#848794]">
                  Activity Log Directory
                </h2>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className={cn("absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400", isLoading && "opacity-0")} />
              <input
                disabled={isLoading}
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder={isLoading ? "" : "Search logs..."}
                className={cn(
                  "font-inter w-full rounded-md border border-gray-200 py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-slate-100 outline-none",
                  isLoading && "animate-pulse bg-slate-50 border-slate-100 cursor-not-allowed"
                )}
              />
            </div>
          </div>
        </div>

        <TableContainer>
          <Table zebra className="min-w-175">
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  {["User", "Action", "Module", "Date / Time", "Status"].map((header) => (
                    <TableHead key={header}>
                      {isLoading ? (
                        <div className={cn(
                          "h-4 animate-pulse rounded bg-slate-200",
                          header === "User" ? "w-20" : header === "Action" ? "w-32" : header === "Module" ? "w-16" : header === "Date / Time" ? "w-24" : "w-12"
                        )} />
                      ) : (
                        header
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-pulse rounded-sm bg-slate-100" />
                          <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-pulse rounded-sm bg-slate-100" />
                          <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-20 animate-pulse rounded-md bg-slate-100" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center font-inter italic text-slate-400"
                    >
                      {globalFilter
                        ? "No activity logs match your search."
                        : "No system activity recorded."}
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

          {/* Pagination Controls */}
          {!isLoading && logs.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 bg-gray-50/30 font-inter">
              <p className="text-[11px] text-slate-400">
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
                of {table.getFilteredRowModel().rows.length} logs
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-2 text-xs text-slate-500 whitespace-nowrap">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount() || 1}
                </span>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </TableContainer>
      </main>
    </div>
  );
}

import { Suspense } from "react";

export default function UserLogsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading search...</div>}>
      <UserLogsPage />
    </Suspense>
  );
}

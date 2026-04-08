"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Activity,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

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

        const decodedUsers = data._data ? JSON.parse(atob(data._data)) : (data.users ?? []);

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
              className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium ${
                status === "Success"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {status === "Success" ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
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
        <header className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/user")}
            className="font-lexend mb-5 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to User Management
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
                User Activity Logs
              </h1>
              <p className="font-inter mt-1 text-xs text-slate-400">
                Monitor system activity, login attempts, and user actions.
              </p>
            </div>
          </div>
        </header>

        {/* Logs Table */}
        <section className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-slate-100 p-2">
                <Activity className="h-5 w-5 text-[#00154A]" />
              </div>
              <h2 className="font-lexend text-sm font-semibold text-[#848794]">
                Activity Log Directory
              </h2>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search logs..."
                className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-4 text-sm font-inter outline-none focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          <TableContainer>
            <Table className="min-w-175">
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Date / Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-pulse rounded-sm bg-slate-200" />
                          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-pulse rounded-sm bg-slate-200" />
                          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-20 animate-pulse rounded-md bg-slate-200" />
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
          </TableContainer>

          {/* Pagination Controls */}
          {!isLoading && logs.length > 0 && (
            <div className="mt-4 flex items-center justify-between px-2">
              <div className="font-inter text-xs text-slate-500">
                Page{" "}
                <span className="font-medium text-slate-900">
                  {table.getState().pagination.pageIndex + 1}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-900">
                  {table.getPageCount()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="rounded border border-gray-200 p-1 text-slate-400 transition-colors hover:bg-gray-50 hover:text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="rounded border border-gray-200 p-1 text-slate-400 transition-colors hover:bg-gray-50 hover:text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>
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

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  isWithinInterval,
  startOfDay,
  endOfDay,
  parse,
} from "date-fns";
import {
  ArrowLeft,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RotateCcw,
} from "lucide-react";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = ["Posted", "Voided"] as const;
type Status = (typeof STATUS_OPTIONS)[number];

type LogEntry = {
  id: number;
  orNumber: string;
  payer: string;
  description: string;
  channel: string;
  status: "Posted" | "Voided" | "Pending";
  time: string;
};

export default function PaymentsLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/payments");
        const data = await res.json();

        if (Array.isArray(data)) {
          const mappedLogs: LogEntry[] = data.map(
            (item: any, index: number) => ({
              id: index + 1,
              orNumber: item.or_number,
              payer: item.taxpayer_name,
              description: `Payment for ${item.tdn}`,
              channel: item.payment_method,
              status: item.status as "Posted" | "Voided",
              time: format(
                new Date(item.payment_date),
                "MMM dd, yyyy - hh:mm a",
              ),
            }),
          );
          setLogs(mappedLogs);
        }
      } catch (err) {
        console.error("Failed to fetch payment logs:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesStatus =
        statusFilter === "All" || log.status === statusFilter;
      let matchesDate = true;
      if (dateRange?.from) {
        const logDate = parse(
          log.time.split(" - ")[0],
          "MMM dd, yyyy",
          new Date(),
        );
        const start = startOfDay(dateRange.from);
        const end = dateRange.to
          ? endOfDay(dateRange.to)
          : endOfDay(dateRange.from);
        matchesDate = isWithinInterval(logDate, { start, end });
      }
      return matchesStatus && matchesDate;
    });
  }, [logs, statusFilter, dateRange]);

  const columns = useMemo<ColumnDef<LogEntry>[]>(
    () => [
      { accessorKey: "id", header: "#" },
      {
        accessorKey: "payer",
        header: "Payer / Account",
        // Custom ID to target for sticky logic
        id: "sticky-payer",
      },
      { accessorKey: "orNumber", header: "OR No." },
      { accessorKey: "description", header: "Description" },
      { accessorKey: "channel", header: "Channel" },
      {
        accessorKey: "time",
        header: "Date / Time",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-xs min-w-150px">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as string;
          const color =
            status === "Posted"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700";
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                color,
              )}
            >
              {status === "Posted" ? (
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
    [],
  );

  const table = useReactTable({
    data: filteredLogs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    state: { globalFilter, pagination: { pageIndex, pageSize } },
  });

  const resetFilters = () => {
    setStatusFilter("All");
    setDateRange(undefined);
    setGlobalFilter("");
  };

  const filteredRowCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="w-full">
      <button
        onClick={() => router.push("/payments")}
        className="mb-5 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Payments Monitoring
      </button>

      <header className="mb-6">
        <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
          OR & Payment Logs
        </h1>
        <p className="text-xs text-slate-400">
          Monitor chronological OR issuance and payment activity.
        </p>
      </header>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">Total Logs</p>
          <p className="font-lexend mt-1 text-xl font-bold text-[#595a5d]">
            {isLoading ? "—" : logs.length}
          </p>
        </div>
        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">Posted</p>
          <p className="font-lexend mt-1 text-xl font-bold text-emerald-600">
            {isLoading ? "—" : logs.filter((l) => l.status === "Posted").length}
          </p>
        </div>
        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">Voided</p>
          <p className="font-lexend mt-1 text-xl font-bold text-red-600">
            {isLoading ? "—" : logs.filter((l) => l.status === "Voided").length}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-4 rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search OR, payer..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-3 text-sm focus:ring-1 focus:ring-slate-300 outline-none"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-240px justify-start text-xs border-gray-200 text-slate-400 cursor-pointer"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from
                  ? dateRange.to
                    ? `${format(dateRange.from, "PP")} - ${format(dateRange.to, "PP")}`
                    : format(dateRange.from, "PP")
                  : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <div className="flex gap-2">
            {STATUS_OPTIONS.map((type) => (
              <button
                key={type}
                onClick={() =>
                  setStatusFilter(statusFilter === type ? "All" : type)
                }
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium transition cursor-pointer",
                  statusFilter === type
                    ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                    : "bg-white text-slate-600 border-gray-200 hover:bg-gray-50",
                )}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Reset Filter Button */}
          {(statusFilter !== "All" || dateRange || globalFilter) && (
            <button
              onClick={resetFilters}
              className="cursor-pointer flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium ml-2 transition-colors"
            >
              <RotateCcw size={14} />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto relative">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-gray-50">
                  {hg.headers.map((h) => (
                    <TableHead
                      key={h.id}
                      className={cn(
                        "px-4 py-3 text-[11px] font-bold uppercase text-slate-500",
                        h.column.id === "sticky-payer" &&
                          "sticky left-0 bg-gray-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-gray-200",
                      )}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-slate-50/50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "px-4 py-3 text-sm text-slate-600",
                          cell.column.id === "sticky-payer" &&
                            "sticky left-0 bg-white z-10 font-bold text-[#595a5d] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-gray-100",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-slate-400"
                  >
                    No records found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-4 py-3">
          <div className="text-xs text-slate-400 font-medium">
            Showing {filteredRowCount === 0 ? 0 : pageIndex * pageSize + 1} to{" "}
            {Math.min((pageIndex + 1) * pageSize, filteredRowCount)} of{" "}
            {filteredRowCount}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-slate-600 font-medium px-2">
              Page {pageIndex + 1} of {table.getPageCount() || 1}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

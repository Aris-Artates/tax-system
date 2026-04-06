"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Receipt,
  TrendingUp,
  AlertCircle,
  CalendarDays,
  CreditCard,
  Banknote,
} from "lucide-react";

import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/table";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

import { Combobox, type ComboboxOption } from "@/components/ui/combobox";

type PaymentStatus = "paid" | "pending" | "overdue" | "voided";

type Payment = {
  id: number;
  date: string;
  taxpayer_name: string;
  or_number: string;
  amount: number;
  method: "cash" | "check" | "online" | "gcash";
  status: PaymentStatus;
  taxpayer_id: number;
};

const PAGE_SIZE = 20;

const mockPayments: Payment[] = [
  {
    id: 1,
    date: "2024-10-15",
    taxpayer_name: "Juan Dela Cruz",
    or_number: "OR-2024-0001",
    amount: 25000,
    method: "cash",
    status: "paid",
    taxpayer_id: 1,
  },
  {
    id: 2,
    date: "2024-10-14",
    taxpayer_name: "Maria Santos",
    or_number: "OR-2024-0002",
    amount: 15000,
    method: "gcash",
    status: "pending",
    taxpayer_id: 2,
  },
  {
    id: 3,
    date: "2024-10-13",
    taxpayer_name: "Pedro Reyes",
    or_number: "OR-2024-0003",
    amount: 35000,
    method: "check",
    status: "paid",
    taxpayer_id: 3,
  },
  {
    id: 4,
    date: "2024-10-12",
    taxpayer_name: "Ana Lopez",
    or_number: "OR-2024-0004",
    amount: 28000,
    method: "online",
    status: "overdue",
    taxpayer_id: 4,
  },
  {
    id: 5,
    date: "2024-10-11",
    taxpayer_name: "Jose Garcia",
    or_number: "OR-2024-0005",
    amount: 42000,
    method: "cash",
    status: "paid",
    taxpayer_id: 5,
  },
];

const STATUS_OPTIONS: ComboboxOption[] = [
  { value: "", label: "All Statuses" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
  { value: "voided", label: "Voided" },
];

const METHOD_OPTIONS: ComboboxOption[] = [
  { value: "", label: "All Methods" },
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "online", label: "Online" },
  { value: "gcash", label: "GCash" },
];

export default function PaymentsListPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      setIsLoading(true);
      // Simulated API call delay for visible skeleton evaluation
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setPayments(mockPayments);
      setIsLoading(false);
    };

    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        !search ||
        p.taxpayer_name.toLowerCase().includes(search.toLowerCase()) ||
        p.or_number.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || p.status === statusFilter;
      const matchesMethod = !methodFilter || p.method === methodFilter;
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, search, statusFilter, methodFilter]);

  const columnHelper = createColumnHelper<Payment>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("date", {
        header: "Date",
        cell: (info) => (
          <span className="text-slate-600">
            {new Date(info.getValue()).toLocaleDateString()}
          </span>
        ),
      }),
      columnHelper.accessor("taxpayer_name", {
        header: "Taxpayer",
        cell: (info) => (
          <span className="font-medium text-slate-700">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("or_number", {
        header: "OR #",
        cell: (info) => (
          <code className="text-xs bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 text-slate-600">
            {info.getValue()}
          </code>
        ),
      }),
      columnHelper.accessor("amount", {
        header: "Amount",
        cell: (info) => (
          <span className="font-semibold text-slate-700">
            ₱{info.getValue().toLocaleString()}
          </span>
        ),
      }),
      columnHelper.accessor("method", {
        header: "Method",
        cell: (info) => (
          <span className="capitalize text-slate-600">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const colors: Record<PaymentStatus, string> = {
            paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
            pending: "bg-amber-50 text-amber-700 border-amber-100",
            overdue: "bg-rose-50 text-rose-700 border-rose-100",
            voided: "bg-slate-50 text-slate-600 border-slate-200",
          };
          return (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[status]}`}
            >
              {status}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: () => (
          <div className="flex justify-end gap-2">
            <button
              className="text-slate-400 hover:text-blue-600 transition-colors p-1"
              title="View Receipt"
            >
              <Receipt size={16} />
            </button>
            <button
              className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
              title="Download Report"
            >
              <FileText size={16} />
            </button>
          </div>
        ),
      }),
    ],
    [columnHelper],
  );

  const table = useReactTable({
    data: filteredPayments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: PAGE_SIZE,
      },
    },
  });

  const totalCollections = filteredPayments.reduce(
    (sum, p) => sum + p.amount,
    0,
  );
  const overdueCount = filteredPayments.filter(
    (p) => p.status === "overdue",
  ).length;

  return (
    <div className="w-full">
      <button
        onClick={() => router.push("/taxpayers")}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Taxpayers
      </button>

      <header className="mb-8">
        <h1 className="text-2xl font-bold font-lexend text-[#595a5d]">
          Payments History
        </h1>
        <p className="mt-1 text-xs text-slate-400 font-inter">
          Monitor collections, official receipts, and transaction status
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3 print:hidden">
        <div className="rounded-xl border border-gray-100 p-5 bg-white shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50">
              <TrendingUp className="h-5 w-5 text-emerald-500" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-inter text-xs font-medium text-slate-500">Total Collections</p>
              <div className="flex flex-col">
                {isLoading ? (
                  <div className="mt-1 h-6 w-24 animate-pulse rounded bg-slate-200" />
                ) : (
                  <p className="font-lexend mt-0.5 text-xl font-bold text-slate-900 truncate">
                    ₱{totalCollections.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 p-5 bg-white shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50">
              <AlertCircle className="h-5 w-5 text-rose-500" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-inter text-xs font-medium text-slate-500">Overdue Accounts</p>
              <div className="flex flex-col">
                {isLoading ? (
                  <div className="mt-1 h-6 w-16 animate-pulse rounded bg-slate-200" />
                ) : (
                  <p className="font-lexend mt-0.5 text-xl font-bold text-rose-700 truncate">
                    {overdueCount}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block rounded-xl border border-gray-100 p-5 bg-white shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50">
              <FileText className="h-5 w-5 text-blue-500" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-inter text-xs font-medium text-slate-500">Total Transactions</p>
              <div className="flex flex-col">
                {isLoading ? (
                  <div className="mt-1 h-6 w-16 animate-pulse rounded bg-slate-200" />
                ) : (
                  <p className="font-lexend mt-0.5 text-xl font-bold text-slate-900 truncate">
                    {filteredPayments.length}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-4 rounded-sm border border-gray-200 bg-white p-4 shadow-sm print:hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative flex-1 min-w-45 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Search taxpayer name or OR #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="font-inter w-full rounded-sm border border-gray-200 py-2 pl-8 pr-3 text-xs text-[#595a5d] focus:outline-none focus:border-slate-400"
            />
          </div>
          <div className="min-w-40">
            <Combobox
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Status"
              searchPlaceholder="Search status..."
              triggerClassName="rounded-sm text-xs py-1.5 text-slate-500"
            />
          </div>
          <div className="min-w-40">
            <Combobox
              options={METHOD_OPTIONS}
              value={methodFilter}
              onChange={setMethodFilter}
              placeholder="Method"
              searchPlaceholder="Search method..."
              triggerClassName="rounded-sm text-xs py-1.5 text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-sm border border-gray-200 bg-white shadow-sm flex flex-col overflow-hidden print:hidden">
        <TableContainer className="border-none shadow-none rounded-none w-full">
          <Table zebra className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] min-w-[150px] bg-gray-50">Date</TableHead>
                <TableHead className="w-[250px] min-w-[250px] bg-gray-50">Taxpayer</TableHead>
                <TableHead className="w-[150px] min-w-[150px] bg-gray-50">OR #</TableHead>
                <TableHead className="w-[150px] min-w-[150px] bg-gray-50" align="right">Amount</TableHead>
                <TableHead className="w-[120px] min-w-[120px] bg-gray-50" align="center">Method</TableHead>
                <TableHead className="w-[120px] min-w-[120px] bg-gray-50" align="center">Status</TableHead>
                <TableHead className="w-[80px] min-w-[80px] bg-gray-50" align="center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell className="w-[150px] min-w-[150px] bg-white [tr:nth-child(even)_&]:bg-slate-50">
                      <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="w-[250px] min-w-[250px] max-w-[250px] bg-white [tr:nth-child(even)_&]:bg-slate-50">
                      <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="w-[150px] min-w-[150px] bg-white [tr:nth-child(even)_&]:bg-slate-50">
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="w-[150px] min-w-[150px] bg-white [tr:nth-child(even)_&]:bg-slate-50" align="right">
                      <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="w-[120px] min-w-[120px] bg-white [tr:nth-child(even)_&]:bg-slate-50" align="center">
                      <div className="mx-auto h-4 w-16 animate-pulse rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="w-[120px] min-w-[120px] bg-white [tr:nth-child(even)_&]:bg-slate-50" align="center">
                      <div className="mx-auto h-5 w-16 animate-pulse rounded-full bg-slate-200" />
                    </TableCell>
                    <TableCell className="w-[80px] min-w-[80px] bg-white [tr:nth-child(even)_&]:bg-slate-50" align="center">
                      <div className="mx-auto h-6 w-12 animate-pulse rounded bg-slate-200" />
                    </TableCell>
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const p = row.original;
                  const statusColors: Record<PaymentStatus, string> = {
                    paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
                    pending: "bg-amber-50 text-amber-700 border-amber-100",
                    overdue: "bg-rose-50 text-rose-700 border-rose-100",
                    voided: "bg-slate-50 text-slate-600 border-slate-200",
                  };
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="w-[150px] min-w-[150px] bg-white [tr:nth-child(even)_&]:bg-slate-50 text-xs font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{new Date(p.date).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="w-[250px] min-w-[250px] max-w-[250px] bg-white [tr:nth-child(even)_&]:bg-slate-50 font-medium text-slate-700 truncate">
                        {p.taxpayer_name}
                      </TableCell>
                      <TableCell className="w-[150px] min-w-[150px] bg-white [tr:nth-child(even)_&]:bg-slate-50">
                        <div className="flex items-center gap-1.5">
                          <Receipt className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <code className="text-xs font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 text-slate-600">
                            {p.or_number}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell className="w-[150px] min-w-[150px] bg-white [tr:nth-child(even)_&]:bg-slate-50 font-semibold text-slate-900" align="right">
                        ₱{p.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="w-[120px] min-w-[120px] bg-white [tr:nth-child(even)_&]:bg-slate-50" align="center">
                        <div className="flex items-center justify-center gap-1.5">
                          {p.method === "cash" || p.method === "check" ? (
                            <Banknote className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          ) : (
                            <CreditCard className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="capitalize text-slate-600 text-xs font-medium">{p.method}</span>
                        </div>
                      </TableCell>
                      <TableCell className="w-[120px] min-w-[120px] bg-white [tr:nth-child(even)_&]:bg-slate-50" align="center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[p.status]}`}>
                          {p.status}
                        </span>
                      </TableCell>
                      <TableCell className="w-[80px] min-w-[80px] bg-white [tr:nth-child(even)_&]:bg-slate-50" align="center">
                        <div className="flex justify-center gap-2">
                          <button className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="View Receipt">
                            <Receipt size={14} />
                          </button>
                          <button className="text-slate-400 hover:text-indigo-600 transition-colors p-1" title="Download Report">
                            <FileText size={14} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-slate-400 font-inter text-sm">
                    No matching payment records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 bg-white w-full shrink-0">
          <p className="font-inter text-xs text-slate-400">
            Showing Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1} ({filteredPayments.length} total)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-inter px-2 text-xs text-slate-500">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

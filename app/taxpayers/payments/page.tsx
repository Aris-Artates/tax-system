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
} from "lucide-react";

import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/Table";

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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
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
      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Filtered Collections
              </p>
              <p className="text-xl font-bold text-slate-800">
                ₱{totalCollections.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 rounded-xl">
              <AlertCircle className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Overdue Accounts
              </p>
              <p className="text-xl font-bold text-slate-800">{overdueCount}</p>
            </div>
          </div>
        </div>

        <div className="hidden lg:block rounded-xl border border-gray-200 p-5 bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Transactions
              </p>
              <p className="text-xl font-bold text-slate-800">
                {filteredPayments.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 text-slate-400 -translate-y-1/2" />
            <input
              placeholder="Search taxpayer name or OR #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Combobox
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Status"
              className="w-40"
            />
            <Combobox
              options={METHOD_OPTIONS}
              value={methodFilter}
              onChange={setMethodFilter}
              placeholder="Method"
              className="w-40"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <TableContainer>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-slate-50/50">
                  {headerGroup.headers.map((header) => (
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
                    colSpan={7}
                    className="h-32 text-center text-slate-400 font-inter text-sm"
                  >
                    Loading payment records...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
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
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-slate-400 font-inter text-sm"
                  >
                    No matching payment records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Footer */}
        {!isLoading && table.getPageCount() > 1 && (
          <div className="border-t border-gray-100 px-6 py-4 bg-white">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 font-inter">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {table.getState().pagination.pageIndex * PAGE_SIZE + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * PAGE_SIZE,
                    filteredPayments.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filteredPayments.length}
                </span>{" "}
                entries
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-1.5 rounded-lg border border-gray-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-medium text-slate-600">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </span>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-1.5 rounded-lg border border-gray-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

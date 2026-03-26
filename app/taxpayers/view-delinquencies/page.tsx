"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Download, Search } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/tanstack-table";

type DelinquentTaxpayer = {
  id: number;
  full_name: string;
  tin: string;
  barangay_name: string;
  property_count: number;
  bucket: "Current" | "1 Year" | "2 Years" | "3 Years" | "5+ Years";
  total_due: string;
  years_due: string;
};

type DelinquentsResponse = {
  data: DelinquentTaxpayer[];
  meta: {
    totalItems: number;
    totalPages: number;
  };
} | null;

const bucketColors: Record<DelinquentTaxpayer["bucket"], string> = {
  Current: "bg-emerald-50 text-emerald-700 border-emerald-100",
  "1 Year": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "2 Years": "bg-blue-50 text-blue-700 border-blue-100",
  "3 Years": "bg-amber-50 text-amber-700 border-amber-100",
  "5+ Years": "bg-rose-50 text-rose-600 border-rose-100",
};

const bucketPanels = [
  {
    bucket: "Current",
    total: "128",
    balance: "PHP 2.1M",
    accent: "border-emerald-200 bg-emerald-50/40",
  },
  {
    bucket: "1 Year",
    total: "388",
    balance: "PHP 6.1M",
    accent: "border-emerald-200 bg-emerald-50/40",
  },
  {
    bucket: "2 Years",
    total: "274",
    balance: "PHP 8.8M",
    accent: "border-blue-200 bg-blue-50/40",
  },
  {
    bucket: "3 Years",
    total: "238",
    balance: "PHP 10.2M",
    accent: "border-amber-200 bg-amber-50/40",
  },
  {
    bucket: "5+ Years",
    total: "348",
    balance: "PHP 13.5M",
    accent: "border-rose-200 bg-rose-50/40",
  },
];

function fetchDelinquents(
  search: string,
  pageIndex: number,
  pageSize: number,
): Promise<DelinquentsResponse> {
  const params = new URLSearchParams({
    search,
    page: (pageIndex + 1).toString(),
    limit: pageSize.toString(),
  });

  return fetch(`/api/taxpayers/delinquents?${params}`).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch");
    }
    return res.json();
  });
}

export default function ViewDelinquenciesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: delinquentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["delinquents", { search, pagination: pagination.pageIndex }],
    queryFn: () =>
      fetchDelinquents(search, pagination.pageIndex, pagination.pageSize),
    staleTime: 5 * 60 * 1000,
  });

  const totalCount = delinquentsData?.meta?.totalItems ?? 0;
  const totalPages = delinquentsData?.meta?.totalPages ?? 1;
  const delinquents = delinquentsData?.data ?? [];

  const columns = useMemo<ColumnDef<DelinquentTaxpayer>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "Taxpayer Name",
      },
      {
        accessorKey: "tin",
        header: "TIN",
        cell: ({ row }) => (
          <span className="text-xs font-mono">{row.original.tin}</span>
        ),
      },
      {
        accessorKey: "barangay_name",
        header: "Barangay",
      },
      {
        accessorKey: "property_count",
        header: () => <span className="text-center">Prop.</span>,
        cell: ({ row }) => (
          <div className="text-center font-medium">
            {row.original.property_count}
          </div>
        ),
      },
      {
        accessorKey: "bucket",
        header: "Aging Bucket",
        cell: ({ row }) => {
          const bucket = row.original.bucket as DelinquentTaxpayer["bucket"];
          return (
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${bucketColors[bucket]}`}
            >
              {bucket}
            </span>
          );
        },
      },
      {
        accessorKey: "total_due",
        header: () => <span className="text-right">Total Due</span>,
        cell: ({ row }) => (
          <div className="text-right font-bold text-slate-900">
            {row.original.total_due}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <span className="text-center">Actions</span>,
        cell: () => (
          <div className="text-center">
            <button className="rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
              View Details
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Error loading delinquents. Please try again.
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => router.push("/taxpayers")}
        className="font-lexend mb-5 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Taxpayer Records
      </button>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
            Delinquent Accounts
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            Monitor overdue Real Property Tax obligations
          </p>
        </div>
        <button className="font-inter inline-flex items-center gap-2 rounded-lg bg-[#0f172a] px-5 py-2.5 text-xs font-medium text-white hover:bg-slate-800 cursor-pointer">
          <Download className="h-4 w-4" />
          Export Delinquency List
        </button>
      </header>

      {/* Aging Buckets */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-5 text-center">
        {bucketPanels.map((panel) => (
          <div
            key={panel.bucket}
            className={`rounded-xl border p-5 shadow-sm transition-transform hover:scale-[1.02] ${panel.accent}`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${bucketColors[panel.bucket as DelinquentTaxpayer["bucket"]]}`}
              >
                {panel.bucket}
              </span>
              <div className="font-lexend text-xl font-bold text-slate-700">
                {panel.total}
              </div>
            </div>
            <p className="mt-4 font-inter text-lg font-bold text-slate-800">
              {panel.balance}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">
              Outstanding Balance
            </p>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, TIN, or barangay..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="w-full rounded-lg border border-gray-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-gray-100">
            <Clock className="h-4 w-4 text-slate-400" />
            {totalCount} Delinquent Accounts Found
          </div>
        </div>
      </div>

      {/* TanStack DataTable - Fully replaces old manual implementation */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={delinquents}
          pageCount={totalPages}
          loading={isLoading}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </div>
    </div>
  );
}

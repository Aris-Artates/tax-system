"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  FileWarning,
  Search,
  Loader2,
  RefreshCw,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { DelinquentAccountsPrint } from "@/components/print/DelinquentAccountsPrint";

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

const delinquentAccounts = [
  {
    tdNumber: "TD-2026-00142",
    taxpayer: "Ramon C. Dela Cruz",
    barangay: "San Isidro",
    yearsDue: "2022-2025",
    balance: "PHP 684,320",
    status: "Final Demand",
  },
  {
    tdNumber: "TD-2025-00817",
    taxpayer: "Lourdes M. Angeles",
    barangay: "Mabini",
    yearsDue: "2021-2025",
    balance: "PHP 512,880",
    status: "For Visit",
  },
  {
    tdNumber: "TD-2024-01988",
    taxpayer: "Golden Fields Realty",
    barangay: "Poblacion East",
    yearsDue: "2023-2025",
    balance: "PHP 1,240,000",
    status: "Legal Review",
  },
  {
    tdNumber: "TD-2026-00310",
    taxpayer: "Teresita P. Navarro",
    barangay: "Sta. Elena",
    yearsDue: "2020-2025",
    balance: "PHP 402,150",
    status: "Partial Payment",
  },
  {
    tdNumber: "TD-2023-01426",
    taxpayer: "Northpoint Agri Ventures",
    barangay: "Bagong Silang",
    yearsDue: "2019-2025",
    balance: "PHP 918,540",
    status: "Warrant Prep",
  },
] as const;

const statusClasses: Record<string, string> = {
  "5+ Years": "bg-red-50 text-red-600",
  "3 Years": "bg-amber-50 text-amber-700",
  "2 Years": "bg-blue-50 text-blue-700",
  "1 Year": "bg-slate-100 text-slate-600",
  Current: "bg-emerald-50 text-emerald-700",
};

export default function DeliquentAccountsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState<DelinquentTaxpayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1 });

  const handlePrint = () => window.print();

  const fetchDelinquents = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/taxpayers/delinquents?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`,
      );
      const res = await response.json();

      if (response.ok) {
        setAccounts(res.data || []);
        setMeta(res.meta || { totalItems: 0, totalPages: 1 });
      } else {
        toast.error(res.error || "Failed to fetch delinquent accounts.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("A network error occurred while fetching delinquents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDelinquents();
    }, 300); // Simple debounce

    return () => clearTimeout(timer);
  }, [search, page]);

  const stats = [
    {
      label: "Total Delinquent Accounts",
      value: meta.totalItems.toLocaleString(),
      color: "text-[#595a5d]",
    },
    { label: "For Final Demand", value: "426", color: "text-red-600" },
    { label: "For Field Visit", value: "219", color: "text-amber-600" },
    {
      label: "Collectible Balance",
      value: "PHP 38.6M",
      color: "text-blue-600",
    },
  ];

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => router.push("/delinquencies")}
        className="font-lexend mb-5 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Delinquencies & Notices
      </button>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
            Delinquent Accounts
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            List of taxpayers with unpaid real property tax obligations
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="font-inter inline-flex cursor-pointer items-center gap-2 rounded bg-[#0f1729] px-4 py-2 text-xs font-medium text-[#8A9098] transition-colors hover:bg-slate-800"
        >
          <Printer className="h-4 w-4" />
          Export List (Print)
        </button>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="font-inter text-xs text-slate-400">{stat.label}</p>
            <p className={`font-lexend mt-1 text-xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-4 rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="relative flex-1 min-w-45 max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={13}
            />
            <input
              type="text"
              placeholder="Search TD#, taxpayer, barangay, or status..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="font-inter w-full rounded-sm border border-gray-200 py-2 pl-8 pr-3 text-xs text-[#595a5d] focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <FileWarning className="h-4 w-4" />
              Potential delinquents requiring action
            </div>
            <button
              onClick={fetchDelinquents}
              disabled={loading}
              className="p-1.5 rounded-md hover:bg-slate-50 text-slate-400 transition-colors disabled:opacity-50"
              title="Refresh List"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full font-inter text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {[
                  "TD Number",
                  "Taxpayer",
                  "Barangay",
                  "Years Due",
                  "Balance",
                  "Status",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`px-4 py-3 text-left font-semibold uppercase tracking-wide text-[#595a5d] ${heading === "Balance" ? "text-right" : "whitespace-nowrap"}`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <p>Loading delinquent accounts...</p>
                    </div>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No delinquent accounts found matching your search.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-[#595a5d]">
                      TD-{account.id.toString().padStart(5, "0")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700 font-medium">
                      {account.full_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {account.barangay_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {account.years_due}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-lexend font-bold text-[#595a5d]">
                      {account.total_due}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${statusClasses[account.bucket] || "bg-slate-50 text-slate-400 border-slate-100"} ${account.bucket === "5+ Years" ? "border-red-100" : account.bucket === "3 Years" ? "border-amber-100" : ""}`}
                      >
                        {account.bucket}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <p className="font-inter text-xs text-slate-400">
            Showing {accounts.length} of {meta.totalItems} delinquent accounts
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-inter px-2 text-xs text-slate-500">
              Page {page} of {meta.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="sr-only print:not-sr-only">
        <DelinquentAccountsPrint data={accounts} />
      </div>
    </div>
  );
}

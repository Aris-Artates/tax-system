"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  FileWarning,
  Search,
} from "lucide-react";

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

const statusClasses: Record<
  (typeof delinquentAccounts)[number]["status"],
  string
> = {
  "Final Demand": "bg-red-50 text-red-600",
  "For Visit": "bg-amber-50 text-amber-700",
  "Legal Review": "bg-slate-100 text-slate-600",
  "Partial Payment": "bg-emerald-50 text-emerald-700",
  "Warrant Prep": "bg-blue-50 text-blue-700",
};

export default function DeliquentAccountsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredAccounts = useMemo(() => {
    const query = search.toLowerCase();

    return delinquentAccounts.filter((account) => {
      if (!query) {
        return true;
      }

      return (
        account.tdNumber.toLowerCase().includes(query) ||
        account.taxpayer.toLowerCase().includes(query) ||
        account.barangay.toLowerCase().includes(query) ||
        account.status.toLowerCase().includes(query)
      );
    });
  }, [search]);

  const stats = [
    {
      label: "Total Delinquent Accounts",
      value: "1,248",
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
          className="font-inter inline-flex cursor-pointer items-center gap-2 rounded bg-[#0f1729] px-4 py-2 text-xs font-medium text-[#8A9098] transition-colors hover:bg-slate-800"
        >
          <Download className="h-4 w-4" />
          Export List
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

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FileWarning className="h-4 w-4" />
            154 accounts tagged for immediate action
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
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No delinquent accounts found matching your search.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr
                    key={account.tdNumber}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-[#595a5d]">
                      {account.tdNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      {account.taxpayer}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {account.barangay}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {account.yearsDue}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-[#595a5d]">
                      {account.balance}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses[account.status]}`}
                      >
                        {account.status}
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
            Showing {filteredAccounts.length} of {delinquentAccounts.length}{" "}
            delinquent accounts
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="cursor-pointer p-1 text-slate-400 hover:text-slate-600"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-inter px-2 text-xs text-slate-500">
              Page 1 of 1
            </span>
            <button
              type="button"
              className="cursor-pointer p-1 text-slate-400 hover:text-slate-600"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

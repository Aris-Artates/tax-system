"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileBarChart,
  ShieldAlert,
  Search,
} from "lucide-react";

const agingRecords = [
  {
    tdNumber: "TD-2026-00142",
    taxpayer: "Ramon C. Dela Cruz",
    barangay: "San Isidro",
    bucket: "1 Year",
    yearsDue: "2025",
    balance: "PHP 184,320",
  },
  {
    tdNumber: "TD-2025-00817",
    taxpayer: "Lourdes M. Angeles",
    barangay: "Mabini",
    bucket: "2 Years",
    yearsDue: "2024-2025",
    balance: "PHP 312,880",
  },
  {
    tdNumber: "TD-2024-01988",
    taxpayer: "Golden Fields Realty",
    barangay: "Poblacion East",
    bucket: "3 Years",
    yearsDue: "2023-2025",
    balance: "PHP 1,240,000",
  },
  {
    tdNumber: "TD-2026-00310",
    taxpayer: "Teresita P. Navarro",
    barangay: "Sta. Elena",
    bucket: "5+ Years",
    yearsDue: "2020-2025",
    balance: "PHP 402,150",
  },
  {
    tdNumber: "TD-2023-01426",
    taxpayer: "Northpoint Agri Ventures",
    barangay: "Bagong Silang",
    bucket: "5+ Years",
    yearsDue: "2019-2025",
    balance: "PHP 918,540",
  },
] as const;

const bucketColors: Record<(typeof agingRecords)[number]["bucket"], string> = {
  "1 Year": "bg-emerald-50 text-emerald-700",
  "2 Years": "bg-blue-50 text-blue-700",
  "3 Years": "bg-amber-50 text-amber-700",
  "5+ Years": "bg-red-50 text-red-600",
};

const bucketPanels = [
  {
    bucket: "1 Year",
    total: "388",
    balance: "PHP 6.1M",
    description:
      "Fresh delinquencies that can still be recovered through reminder and early collection activity.",
    accent: "border-emerald-200 bg-emerald-50/60",
  },
  {
    bucket: "2 Years",
    total: "274",
    balance: "PHP 8.8M",
    description:
      "Accounts that should already be under repeated follow-up and field validation.",
    accent: "border-blue-200 bg-blue-50/60",
  },
  {
    bucket: "3 Years",
    total: "238",
    balance: "PHP 10.2M",
    description:
      "Mid-stage delinquencies with higher risk of non-collection if left unaddressed.",
    accent: "border-amber-200 bg-amber-50/60",
  },
  {
    bucket: "5+ Years",
    total: "348",
    balance: "PHP 13.5M",
    description:
      "Long-outstanding cases needing escalation, legal review, or warrant preparation.",
    accent: "border-red-200 bg-red-50/60",
  },
] as const;

const escalationQueue = [
  {
    label: "Accounts ready for legal endorsement",
    value: "94 records",
  },
  {
    label: "Barangays with 5+ year concentration",
    value: "6 areas",
  },
  {
    label: "High-balance accounts for final review",
    value: "27 taxpayers",
  },
] as const;

export default function AgingOfDeliquenciesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredRecords = useMemo(() => {
    const query = search.toLowerCase();

    return agingRecords.filter((record) => {
      if (!query) {
        return true;
      }

      return (
        record.tdNumber.toLowerCase().includes(query) ||
        record.taxpayer.toLowerCase().includes(query) ||
        record.barangay.toLowerCase().includes(query) ||
        record.bucket.toLowerCase().includes(query)
      );
    });
  }, [search]);

  const stats = [
    {
      label: "Total Delinquent Records",
      value: "1,248",
      color: "text-[#595a5d]",
    },
    { label: "1 Year", value: "388", color: "text-emerald-600" },
    { label: "2-3 Years", value: "512", color: "text-amber-600" },
    { label: "5+ Years", value: "348", color: "text-red-600" },
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
            Aging of Delinquencies
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            Classification of delinquent real property taxes by overdue period
          </p>
        </div>

        <button
          type="button"
          className="font-inter inline-flex cursor-pointer items-center gap-2 rounded bg-[#0f1729] px-4 py-2 text-xs font-medium text-[#8A9098] transition-colors hover:bg-slate-800"
        >
          <Download className="h-4 w-4" />
          Export Aging List
        </button>
      </header>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.35fr_0.8fr]">
        <div className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-inter text-xs uppercase tracking-wide text-slate-400">
                Aging Overview
              </p>
              <h2 className="font-lexend mt-2 text-xl font-bold text-[#595a5d]">
                Monitor how long unpaid balances have remained collectible
              </h2>
              <p className="font-inter mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                This view groups delinquent real property taxes by age so
                collection teams can prioritize reminder notices, field visits,
                and legal escalation.
              </p>
            </div>
            <div className="rounded-sm bg-slate-50 p-3 text-slate-500">
              <FileBarChart className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {bucketPanels.map((panel) => (
              <div
                key={panel.bucket}
                className={`rounded-sm border p-4 ${panel.accent}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${bucketColors[panel.bucket]}`}
                  >
                    {panel.bucket}
                  </span>
                  <span className="font-lexend text-lg font-bold text-[#595a5d]">
                    {panel.total}
                  </span>
                </div>
                <p className="font-inter mt-3 text-xs text-slate-500">
                  {panel.description}
                </p>
                <p className="font-inter mt-3 text-xs font-medium text-slate-600">
                  {panel.balance}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-sm bg-red-50 p-2 text-red-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-lexend text-base font-bold text-[#595a5d]">
                Escalation Watch
              </h2>
              <p className="font-inter text-xs text-slate-400">
                Aging signals that need closer enforcement action
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {escalationQueue.map((item) => (
              <div
                key={item.label}
                className="rounded-sm border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <p className="font-inter text-xs text-slate-500">
                  {item.label}
                </p>
                <p className="font-lexend mt-1 text-base font-bold text-[#595a5d]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-sm border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="font-inter text-xs text-amber-700">
              5+ year delinquencies now represent the highest concentration of
              collectible risk in the current dataset.
            </p>
          </div>
        </div>
      </div>

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
              placeholder="Search TD#, taxpayer, barangay, or aging bucket..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="font-inter w-full rounded-sm border border-gray-200 py-2 pl-8 pr-3 text-xs text-[#595a5d] focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock3 className="h-4 w-4" />
            348 records are already in the 5+ year bucket
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
                  "Aging Bucket",
                  "Years Due",
                  "Balance",
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
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No aging records found matching your search.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr
                    key={record.tdNumber}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-[#595a5d]">
                      {record.tdNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      {record.taxpayer}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {record.barangay}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${bucketColors[record.bucket]}`}
                      >
                        {record.bucket}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {record.yearsDue}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-[#595a5d]">
                      {record.balance}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <p className="font-inter text-xs text-slate-400">
            Showing {filteredRecords.length} of {agingRecords.length} aging
            records
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
